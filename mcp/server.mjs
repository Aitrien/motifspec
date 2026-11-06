// The MotifSpec MCP server: the design system's rules, tokens, component docs and checker, as tools for AI assistants.
// Read-only. Every answer comes from this release's own files, so the server always matches the version it ships in.
// mcp/lambda.mjs serves it over HTTP at https://mcp.motifspec.com/mcp; createServer() is transport-agnostic.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ROOT, docAsJsx } from '../scripts/lib.mjs';
import { checkText, format, LAYOUTS } from '../scripts/check.mjs';

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

let data;
/** Everything the tools serve, read once per process. */
export function load() {
  if (data) return data;
  const pkg = JSON.parse(read('package.json'));
  const readme = read('README.md');
  const section = (md, heading) => {
    const start = md.indexOf(`## ${heading}\n`);
    if (start < 0) throw new Error(`README.md has no "## ${heading}" section`);
    const end = md.indexOf('\n## ', start + 1);
    return md.slice(start, end < 0 ? undefined : end).trim();
  };
  const components = Object.fromEntries(
    readdirSync(join(ROOT, 'docs', 'components'))
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => {
        const md = read('docs', 'components', f);
        const name = f.replace(/\.md$/, '');
        const body = md.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
        const title = body.match(/^# (.+)$/m)?.[1] ?? name;
        const summary = body.split('\n\n').find((p) => p && !p.startsWith('#'))?.trim() ?? '';
        const layouts = md.match(/^layouts: \[(.*)\]/m)?.[1] ?? 'shared';
        return [name, { name, title, summary, layouts, md }];
      }),
  );
  const hugo = read('docs', 'hugo.md');
  const layouts = Object.fromEntries(LAYOUTS.map((l) => [l, read('docs', 'layouts', `${l}.md`)]));
  data = {
    version: pkg.version,
    rules: section(readme, 'Rules for AI assistants'),
    checks: section(readme, 'Checking a project').split('\n').filter((l) => l.startsWith('- ')).join('\n'),
    tokens: JSON.parse(read('dist', 'tokens.json')).tokens.filter((t) => t.tier !== 'primitive'),
    components,
    // "templates" was docs/templates.md until 1.18.0; it is now the portfolio layout, and the old name still works.
    docs: { hugo, ...layouts, templates: layouts.portfolio },
    // The rows of docs/hugo.md's partial tables, by the component doc they name or the partial file they describe.
    hugoRows: hugo.split('\n').filter((l) => l.startsWith('| `')),
  };
  return data;
}

const text = (s) => ({ content: [{ type: 'text', text: s }] });
const json = (o) => text(JSON.stringify(o, null, 2));

/** A new server instance. Cheap: the data is loaded once and shared. */
export function createServer() {
  const d = load();
  const server = new McpServer(
    { name: 'motifspec', title: 'MotifSpec design system', version: d.version },
    {
      instructions: [
        `MotifSpec ${d.version}: Liam Marshall's design system (CSS, tokens, components, Hugo templates). Its rules come in layers, so fetch only the ones the task needs.`,
        'Before writing markup or CSS for a MotifSpec project, call get_rules. Build UI from get_component (form "hugo" in a Hugo site, "jsx" in React), and choose tokens with find_tokens.',
        'Choose the layout first with get_doc (portfolio, dashboard, documentation or a-la-carte). Keep the project\'s stack if it has one; otherwise follow the layout\'s stack table.',
        'Before finishing, call check on what you wrote and fix every problem it reports.',
        `This server serves the latest release. A project pins its own version (go.mod or package.json); if that is older than ${d.version}, something served here may not exist in it yet.`,
      ].join('\n'),
    },
  );
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  server.registerTool(
    'get_rules',
    {
      title: 'Rules for using MotifSpec',
      description: 'The rules every project using MotifSpec follows: tokens, contrast pairs, components, icons, ornaments, layout, scripts and content. Read these first.',
      annotations: readOnly,
    },
    async () => text(`MotifSpec ${d.version}\n\n${d.rules}\n\nThe check tool enforces:\n${d.checks}`),
  );

  server.registerTool(
    'find_tokens',
    {
      title: 'Find design tokens',
      description: 'Semantic tokens matching every word of the query (e.g. "muted text"): CSS property, usage rule, light and dark values, allowed surfaces, deprecation.',
      inputSchema: { query: z.string().describe('Words to match. Empty lists every token name.') },
      annotations: readOnly,
    },
    async ({ query }) => {
      const words = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return text(d.tokens.map((t) => `${t.name}${t.deprecated ? ' (deprecated)' : ''}`).join('\n'));
      const hits = d.tokens.filter((t) => words.every((w) => `${t.name} ${t.description ?? ''}`.toLowerCase().includes(w)));
      if (!hits.length) return text(`No semantic token matches "${query}". Try fewer or broader words, or an empty query for the full list.`);
      return json(hits.map((t) => ({
        name: t.name,
        css: `var(${t.css})`,
        rule: t.description,
        value: t.value,
        ...(t.valueDark && t.valueDark !== t.value ? { valueDark: t.valueDark } : {}),
        ...(t.pairsWith ? { sitsOn: t.pairsWith.map((p) => `${p.token} (${p.min}:1)`) } : {}),
        ...(t.deprecated ? { deprecated: t.deprecated } : {}),
      })));
    },
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get a component',
      description: 'A component\'s rules, markup, accessibility, behaviour and tokens. Without a name, lists every component with its layouts.',
      inputSchema: {
        name: z.string().optional().describe('e.g. "project-card".'),
        form: z.enum(['html', 'jsx', 'hugo']).optional().describe('The markup the project uses; hugo adds its partial. Without it: HTML and the partial.'),
      },
      annotations: readOnly,
    },
    async ({ name, form }) => {
      if (!name) return text(Object.values(d.components).map((c) => `${c.name} [${c.layouts}]: ${c.title}. ${c.summary}`).join('\n'));
      const c = d.components[name];
      if (!c) return text(`No component "${name}". Call get_component without a name for the list.`);
      if (form === 'jsx') return text(docAsJsx(c.md).trim());
      const rows = d.hugoRows.filter((r) => r.includes(`\`${name}.md\``) || r.includes(`\`${name}.html\``));
      const hugo = rows.length && form !== 'html'
        ? `\n\n## In a Hugo site (docs/hugo.md)\n\n${rows.join('\n')}\n\nCall partials as partial "motifspec/<name>.html" <context>. get_doc("hugo") has the full guide.`
        : '';
      return text(`${c.md.trim()}${hugo}`);
    },
  );

  server.registerTool(
    'get_doc',
    {
      title: 'Get a guide',
      description: '"hugo": MotifSpec in a Hugo site (setup, partials, front matter, render hooks). A layout name: its shell, page templates, components and stack. "templates" is portfolio\'s old name.',
      inputSchema: { name: z.enum(['hugo', ...LAYOUTS, 'templates']) },
      annotations: readOnly,
    },
    async ({ name }) => text(d.docs[name]),
  );

  server.registerTool(
    'check',
    {
      title: 'Check markup or CSS',
      description: 'MotifSpec\'s checker, as projects run it in CI, on what you wrote: raw values, style attributes, bad tokens, unknown classes and icons, separators, and (with layout) components from other layouts. Each problem has its line, rule and fix.',
      inputSchema: {
        text: z.string(),
        kind: z.enum(['html', 'md', 'css']).default('html').describe('html includes JSX, Vue, Svelte and Astro. css is an à la carte project\'s own stylesheet.'),
        file: z.string().optional(),
        layout: z.enum(LAYOUTS).optional(),
        components: z.array(z.string()).optional().describe('À la carte only: the component names it uses.'),
      },
      annotations: readOnly,
    },
    async ({ text: input, kind, file, layout, components }) => {
      const problems = checkText(input, { kind, file: file ?? `<${kind}>`, layout, components, projectCss: kind === 'css' });
      const errors = problems.filter((p) => p.severity === 'error');
      const warnings = problems.filter((p) => p.severity === 'warning');
      const against = `checked against MotifSpec ${d.version}${layout ? `, ${layout} layout` : ''}`;
      return text([
        errors.length ? `${errors.length} problem(s), ${against}:\n${errors.map(format).join('\n')}` : `No problems: ${against}.`,
        warnings.length ? `${warnings.length} warning(s):\n${warnings.map(format).join('\n')}` : '',
      ].filter(Boolean).join('\n\n'));
    },
  );

  return server;
}

/** Whether a file this server reads is missing; used by tests and the bundle step. */
export const FILES = ['package.json', 'README.md', 'dist/tokens.json', 'dist/codex.css', 'dist/codex.js', 'dist/plate.js', 'tokens/size.json', 'icons/manifest.json', 'docs/hugo.md', 'docs/layouts', 'docs/components'];
export const missingFiles = () => FILES.filter((f) => !existsSync(join(ROOT, f)));
