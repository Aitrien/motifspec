// The MotifSpec MCP server: the design system's rules, tokens, component docs and checker, as tools for AI assistants.
// Read-only. Every answer comes from this release's own files, so the server always matches the version it ships in.
// mcp/lambda.mjs serves it over HTTP at https://mcp.motifspec.com/mcp; createServer() is transport-agnostic.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ROOT } from '../scripts/lib.mjs';
import { checkText, format } from '../scripts/check.mjs';

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
        return [name, { name, title, summary, md }];
      }),
  );
  const hugo = read('docs', 'hugo.md');
  data = {
    version: pkg.version,
    rules: section(readme, 'Rules for AI assistants'),
    checks: section(readme, 'Commands').split('\n').filter((l) => l.startsWith('- ')).join('\n'),
    tokens: JSON.parse(read('dist', 'tokens.json')).tokens.filter((t) => t.tier !== 'primitive'),
    components,
    docs: { hugo, templates: read('docs', 'templates.md') },
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
        `MotifSpec ${d.version}: Liam Marshall's design system (CSS, tokens, components, Hugo templates).`,
        'Before writing markup or CSS for a MotifSpec project, call get_rules. Build UI from get_component, choose tokens with find_tokens, and use the Hugo partials get_component names when the project is a Hugo site.',
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
      description: 'Semantic tokens whose name or usage rule matches every word of the query (e.g. "muted text", "surface", "motion duration"). Each result has its CSS custom property, usage rule, light and dark values, the surfaces a foreground colour may sit on, and whether it is deprecated. An empty query lists every token name.',
      inputSchema: { query: z.string().describe('Words to match against token names and usage rules. Empty lists every token name.') },
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
      description: 'A component\'s rules: when to use it, the markup to copy, do and don\'t, accessibility, and the tokens it uses, plus its Hugo partial and Markdown form where it has them. Without a name, lists every component.',
      inputSchema: { name: z.string().optional().describe('Component name from the list, e.g. "project-card" or "figure".') },
      annotations: readOnly,
    },
    async ({ name }) => {
      if (!name) return text(Object.values(d.components).map((c) => `${c.name}: ${c.title}. ${c.summary}`).join('\n'));
      const c = d.components[name];
      if (!c) return text(`No component "${name}". Call get_component without a name for the list.`);
      const rows = d.hugoRows.filter((r) => r.includes(`\`${name}.md\``) || r.includes(`\`${name}.html\``));
      const hugo = rows.length
        ? `\n\n## In a Hugo site (docs/hugo.md)\n\n${rows.join('\n')}\n\nCall partials as partial "motifspec/<name>.html" <context>. get_doc("hugo") has the full guide.`
        : '';
      return text(`${c.md.trim()}${hugo}`);
    },
  );

  server.registerTool(
    'get_doc',
    {
      title: 'Get a guide',
      description: '"hugo": using MotifSpec in a Hugo site (setup, page shell, every partial and its context, front matter, Markdown render hooks). "templates": the content hierarchy of each page type and catalogue numbers.',
      inputSchema: { name: z.enum(['hugo', 'templates']) },
      annotations: readOnly,
    },
    async ({ name }) => text(d.docs[name]),
  );

  server.registerTool(
    'check',
    {
      title: 'Check markup or CSS',
      description: 'Runs MotifSpec\'s rule checker (the same one projects run in CI) on text you wrote: raw colours and sizes, style attributes, primitive, unknown or deprecated tokens, undefined cx- classes and icons, and "·" separators. Returns each problem with its line, rule and fix, or confirms there are none.',
      inputSchema: {
        text: z.string().describe('The file content to check.'),
        kind: z.enum(['html', 'md', 'css']).default('html').describe('html for templates and components (also JSX, Vue, Svelte, Astro), md for Markdown content, css for stylesheets.'),
        file: z.string().optional().describe('A file name to show in the results.'),
      },
      annotations: readOnly,
    },
    async ({ text: input, kind, file }) => {
      const problems = checkText(input, { kind, file: file ?? `<${kind}>` });
      return text(problems.length
        ? `${problems.length} problem(s), checked against MotifSpec ${d.version}:\n${problems.map(format).join('\n')}`
        : `No problems: checked against MotifSpec ${d.version}.`);
    },
  );

  return server;
}

/** Whether a file this server reads is missing; used by tests and the bundle step. */
export const FILES = ['package.json', 'README.md', 'dist/tokens.json', 'dist/codex.css', 'dist/codex.js', 'dist/plate.js', 'tokens/size.json', 'icons/manifest.json', 'docs/hugo.md', 'docs/templates.md', 'docs/components'];
export const missingFiles = () => FILES.filter((f) => !existsSync(join(ROOT, f)));
