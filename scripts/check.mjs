#!/usr/bin/env node
// The MotifSpec rule checker: one implementation for this repo's templates (npm run audit), for sites that use
// MotifSpec (their CI runs this file from the pinned module) and for any tool that imports checkText.
//
//   node scripts/check.mjs [project-root]                 check a consuming project's layouts/ and content/
//   node scripts/check.mjs [project-root] --dirs src,app  check other folders instead (a non-Hugo project)
//   node scripts/check.mjs [project-root] --json          print the problems as JSON
//   node scripts/check.mjs [project-root] --layout dashboard               check against a layout (docs/layouts/)
//   node scripts/check.mjs [project-root] --layout a-la-carte --components table-of-contents,heading-anchor
//
// Without --layout, a Hugo site's layout comes from [params.motifspec] in its config (hugo.toml, hugo.yaml,
// hugo.json, config.*, or config/_default/), and a project that declares nothing is checked as portfolio.
// A component used outside its layouts is a warning in this release, not a failure.
//   npx motifspec-check [same options]                    the same, from the npm package
//
// Rules come from the files of this release: class names from dist/codex.css, tokens from dist/tokens.json, icons
// from icons/manifest.json. A site therefore checks against the version it has pinned, not against main.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, DOC_SELECTORS } from './lib.mjs';

export const RULES = {
  stylesheet: 'Styles come only from MotifSpec. Remove the stylesheet; use components and tokens, or propose an addition to MotifSpec.',
  'style-attribute': 'No style attributes. Use a component class from docs/components/*.md.',
  'raw-colour': 'No raw colours. Use a semantic colour token through a component class, or var(--cx-color-…) in CSS.',
  'raw-unit': 'No raw sizes or durations. Use a semantic space, size, radius, border or motion token.',
  'primitive-token': 'Primitive tokens are not for use outside MotifSpec. Use the semantic token that aliases it.',
  'unknown-token': 'Not a MotifSpec token. Check the name in dist/tokens.json.',
  'deprecated-token': 'This token is deprecated (see CHANGELOG.md). Use its replacement.',
  'unknown-class': 'Not a MotifSpec class. Copy the markup from docs/components/*.md; don\'t invent cx- classes.',
  'unknown-icon': 'Not an approved icon. Use a key from icons/manifest.json, for its listed role.',
  separator: 'Separate inline metadata with <span class="cx-sep" aria-hidden="true">|</span>, never "·".',
  'wrong-layout': 'This component belongs to another layout. Use a component of this layout, or declare à la carte and list it (docs/layouts/a-la-carte.md).',
  'unlisted-component': 'An à la carte project uses only shared components and the ones it lists. Add this one to the list if you mean to use it.',
  'cx-override': 'Project CSS can\'t target or define cx- classes: MotifSpec\'s components aren\'t restyled, and the project\'s own classes don\'t start with cx-.',
  'unknown-layout': 'Not a MotifSpec layout. Use portfolio, dashboard, documentation or a-la-carte (docs/layouts/).',
  'unknown-component': 'Not a MotifSpec component. Use a doc name from docs/components/, without .md.',
};
// Problems that warn rather than fail. Using a component outside its layouts fails from a later release.
export const WARNINGS = new Set(['wrong-layout', 'unlisted-component']);
// One file each in docs/layouts/. Fixed here rather than read from the folder, because the MCP tools' schemas list them.
export const LAYOUTS = ['portfolio', 'dashboard', 'documentation', 'a-la-carte'];

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
let data;
function load() {
  if (data) return data;
  const tokens = JSON.parse(read('dist', 'tokens.json')).tokens;
  const sizes = JSON.parse(read('tokens', 'size.json'));
  data = {
    // Classes the stylesheet styles, plus hooks the shipped scripts look for (such as cx-code__copy-label).
    classes: new Set([
      ...read('dist', 'codex.css').match(/\.cx-[a-z0-9_-]+/g).map((c) => c.slice(1)),
      ...['codex.js', 'plate.js'].flatMap((f) => read('dist', f).match(/(?<=[.'"\s])cx-[a-z0-9_-]+/g) ?? []),
    ]),
    icons: new Set(Object.keys(JSON.parse(read('icons', 'manifest.json')).icons)),
    tokens: new Map(tokens.map((t) => [t.css, t])),
    breakpoints: new Set(Object.entries(sizes.primitive.size.breakpoint).filter(([k]) => !k.startsWith('$')).map(([, t]) => `${t.$value.value}${t.$value.unit}`)),
  };
  Object.assign(data, componentLayouts(data.classes));
  return data;
}

/**
 * Which layouts each class and Hugo partial belongs to. A class belongs to the docs that own it (DOC_SELECTORS in
 * lib.mjs: a root class and its __elements and --modifiers), so a doc that only shows another component's classes in
 * its example doesn't claim them. A class owned by any shared doc, or by no doc, is shared. A partial is restricted by
 * every doc its row in docs/hugo.md names.
 */
function componentLayouts(classes) {
  const dir = join(ROOT, 'docs', 'components');
  const docs = new Map(); // doc name -> layouts, or null when shared
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md') && !x.startsWith('_'))) {
    const layouts = readFileSync(join(dir, f), 'utf8').match(/^layouts: \[(.*)\]/m)?.[1].split(',').map((l) => l.trim()) ?? ['shared'];
    docs.set(f.replace(/\.md$/, ''), layouts.includes('shared') ? null : layouts);
  }
  const roots = Object.entries(DOC_SELECTORS).flatMap(([name, sels]) => sels.filter((s) => s.startsWith('.cx-')).map((s) => [s.slice(1), name]));
  const restrictedClasses = new Map(); // class -> restricted doc names that own it (only classes no shared doc owns)
  for (const c of classes) {
    const owners = roots.filter(([r]) => c === r || c.startsWith(`${r}__`) || c.startsWith(`${r}--`)).map(([, n]) => n);
    if (owners.length && owners.every((n) => docs.get(n))) restrictedClasses.set(c, [...new Set(owners)]);
  }
  const partials = new Map(); // partial file -> restricted doc names it renders
  for (const row of read('docs', 'hugo.md').split('\n').filter((l) => /^\| `[a-z0-9/_-]+\.html` \|/.test(l))) {
    const [file, related] = row.split('|').slice(1, 3).map((col) => col.trim());
    const names = [...related.matchAll(/`([a-z0-9-]+)\.md`/g)].map((m) => m[1]).filter((n) => docs.get(n));
    if (names.length) partials.set(file.replace(/`/g, ''), names);
  }
  return { docs, restrictedClasses, partials };
}

/** A problem for using restricted docs `names` (all of which `thing` needs) under a layout, or null if allowed. */
function layoutProblem(thing, names, { layout, components }) {
  const { docs } = load();
  if (layout === 'a-la-carte') {
    const missing = names.filter((n) => !components?.includes(n));
    // A class from several docs is fine if any of them is listed; a partial needs every doc it renders.
    if (thing.startsWith('cx-') ? missing.length < names.length : !missing.length) return null;
    return ['unlisted-component', `${thing} (${missing.map((n) => `${n}.md`).join(', ')})`];
  }
  const allowed = thing.startsWith('cx-') ? names.some((n) => docs.get(n).includes(layout)) : names.every((n) => docs.get(n).includes(layout));
  if (allowed) return null;
  const from = names.map((n) => `${n}.md: ${docs.get(n).join(', ')}`).join('; ');
  return ['wrong-layout', `${thing} (${from}; this project is ${layout})`];
}

// Selectors in CSS (the text before each "{" that opens a rule), with the line each starts on.
function* selectors(css) {
  let start = 0;
  const text = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') { yield [text.slice(start, i), text.slice(0, start).split('\n').length]; start = i + 1; }
    else if (ch === '}' || ch === ';') start = i + 1;
  }
}

// A hex colour that isn't part of a fragment link such as href="#cx-icon-add" or an HTML entity.
const RAW_COLOR = /(?<![\w&/."-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;
// A number with a length or time unit. Zero is allowed (0px is not a size).
const RAW_UNIT = /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|dvh|lvh|cqi|cqw|pt|pc|cm|mm|in|ms|s)\b/g;
const STYLE_ATTR = /\sstyle\s*=/g;
const TOKEN_REF = /--cx-[a-z0-9-]+/g;
const CLASS_ATTR = /\s(?:class|className)\s*=\s*["']([^"']*)["']/g;
const ICON_REF = /#cx-icon-([a-z0-9-]*)/g;
const TEMPLATE = /\{\{.*?\}\}/g; // Hugo actions; replaced by a placeholder so a class or icon built from them is skipped

/**
 * Check one file's text. kind: "html" (templates and markup), "md" (content) or "css".
 * layout (optional): check that components belong to it; components: the doc names an à la carte project lists.
 * projectCss: the text is a project's own stylesheet (à la carte), so it may not target or define cx- classes.
 * Returns [{ file, line, rule, match, message, severity }], severity "error" or "warning".
 */
export function checkText(text, { file = '<input>', kind = 'html', layout, components, projectCss = false } = {}) {
  const { classes, icons, tokens, breakpoints, restrictedClasses, partials } = load();
  const problems = [];
  const add = (line, rule, match) => problems.push({ file, line, rule, match, message: RULES[rule], severity: WARNINGS.has(rule) ? 'warning' : 'error' });
  const declared = { layout, components };
  if (kind === 'css' && projectCss) {
    for (const [sel, n] of selectors(text)) for (const m of sel.matchAll(/\.cx-[a-z0-9_-]+/g)) add(n + sel.slice(0, m.index).split('\n').length - 1, 'cx-override', m[0]);
  }
  text.split('\n').forEach((raw, i) => {
    const n = i + 1;
    // In CSS, a breakpoint value in an @media condition is the build's own output and allowed.
    const line = kind === 'css' && /@media/.test(raw) ? raw.replace(/(\d+(?:\.\d+)?)(rem|px|em)\b/g, (v) => (breakpoints.has(v) ? 'breakpoint' : v)) : raw;
    if (kind !== 'css') for (const m of line.matchAll(STYLE_ATTR)) add(n, 'style-attribute', m[0].trim());
    for (const m of line.matchAll(RAW_COLOR)) add(n, 'raw-colour', m[0]);
    for (const m of line.matchAll(RAW_UNIT)) if (!/^-?0+(?:\.0+)?[a-z]+$/.test(m[0])) add(n, 'raw-unit', m[0]);
    for (const [name] of line.matchAll(TOKEN_REF)) {
      if (name.startsWith('--cx-primitive-')) add(n, 'primitive-token', name);
      else if (!tokens.has(name)) add(n, 'unknown-token', name);
      else if (tokens.get(name).deprecated) add(n, 'deprecated-token', name);
    }
    if (kind !== 'css') {
      if (line.includes('·')) add(n, 'separator', '·');
      const plain = line.replace(TEMPLATE, '§');
      for (const m of plain.matchAll(CLASS_ATTR)) {
        for (const c of m[1].split(/\s+/)) {
          if (!c.startsWith('cx-') || c.includes('§')) continue;
          if (!classes.has(c)) add(n, 'unknown-class', c);
          else if (layout && restrictedClasses.has(c)) {
            const p = layoutProblem(c, restrictedClasses.get(c), declared);
            if (p) add(n, ...p);
          }
        }
      }
      if (layout) {
        for (const m of line.matchAll(/partial(?:Cached)?\s+"motifspec\/([a-z0-9/_-]+\.html)"/g)) {
          if (!partials.has(m[1])) continue;
          const p = layoutProblem(`motifspec/${m[1]}`, partials.get(m[1]), declared);
          if (p) add(n, ...p);
        }
      }
      for (const m of plain.matchAll(ICON_REF)) {
        if (m[1] && plain[m.index + m[0].length] !== '§' && !icons.has(m[1])) add(n, 'unknown-icon', `cx-icon-${m[1]}`);
      }
    }
  });
  return problems;
}

const KIND = {
  '.html': 'html', '.xml': 'html', '.svg': 'html', '.jsx': 'html', '.tsx': 'html', '.vue': 'html', '.svelte': 'html', '.astro': 'html',
  '.txt': 'md', '.md': 'md', '.mdx': 'md', '.json': 'md', '.css': 'css',
};
// Build output and dependencies, which contain MotifSpec's own CSS.
const SKIP = new Set(['.git', 'public', 'resources', 'node_modules', 'dist', 'build', '.next', '.astro', '.svelte-kit']);
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p); else yield p;
  }
}

/**
 * A Hugo site's [params.motifspec] (layout, components) from its config, or {} when it declares nothing.
 * Reads hugo/config .toml, .yaml, .yml or .json at the root, and config/_default/ (hugo, config or params files).
 */
export function declaredLayout(root) {
  const files = ['hugo', 'config'].flatMap((n) => ['toml', 'yaml', 'yml', 'json'].map((e) => [`${n}.${e}`, false]))
    .concat(['hugo', 'config', 'params'].flatMap((n) => ['toml', 'yaml', 'yml', 'json'].map((e) => [join('config', '_default', `${n}.${e}`), n === 'params'])));
  const list = (v) => v?.split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  for (const [f, isParams] of files) {
    const path = join(root, f);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, 'utf8');
    let found;
    if (f.endsWith('.json')) {
      const json = JSON.parse(text);
      found = (isParams ? json : json.params)?.motifspec;
    } else if (f.endsWith('.toml')) {
      found = tomlMotifspec(text, isParams ? '' : 'params');
    } else {
      const block = text.match(isParams ? /^motifspec:\s*\n((?:[ \t]+.*\n?)*)/m : /^[ \t]+motifspec:\s*\n((?:[ \t]+.*\n?)*)/m)?.[1];
      if (block) {
        const inline = block.match(/^\s*components:\s*\[(.*)\]/m)?.[1];
        const dashed = block.match(/^\s*components:\s*\n((?:\s*-\s*.+\n?)*)/m)?.[1]?.match(/-\s*(.+)/g)?.map((x) => x.replace(/^-\s*/, ''));
        found = { layout: block.match(/^\s*layout:\s*["']?([a-z-]+)/m)?.[1], components: inline ? list(inline) : list(dashed?.join(',')) };
      }
    }
    if (found?.layout || found?.components) return { layout: found.layout, components: found.components, from: f };
  }
  return {};
}

/**
 * [params.motifspec] from Hugo TOML, however it's written: as its own table (indented or not), as dotted keys
 * (motifspec.layout = "…" under [params], or params.motifspec.layout at the top), or as an inline table
 * (motifspec = { layout = "…" }). `parent` is "params" for a site config, "" for a params file.
 */
function tomlMotifspec(text, parent) {
  const sections = new Map([['', '']]);
  let current = '';
  for (const line of text.split('\n')) {
    const header = line.match(/^\s*\[\s*([^\[\]]+?)\s*\]\s*(?:#.*)?$/);
    if (header) { current = header[1]; sections.set(current, sections.get(current) ?? ''); continue; }
    sections.set(current, sections.get(current) + line + '\n');
  }
  const own = parent ? `${parent}.motifspec` : 'motifspec';
  const value = (body, key) => body.match(new RegExp(`^\\s*${key.replace(/\./g, '\\.')}\\s*=\\s*["']([^"']+)["']`, 'm'))?.[1];
  const array = (body, key) => body.match(new RegExp(`^\\s*${key.replace(/\./g, '\\.')}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm'))?.[1];
  const list = (v) => v?.split(',').map((x) => x.replace(/#.*$/gm, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  // Its own table.
  if (sections.has(own)) {
    const body = sections.get(own);
    return { layout: value(body, 'layout'), components: list(array(body, 'components')) };
  }
  // Dotted keys or an inline table, in the parent table or (for a site config) at the top level.
  for (const [section, prefix] of [[parent, 'motifspec.'], ...(parent ? [['', `${parent}.motifspec.`]] : [])]) {
    const body = sections.get(section);
    if (!body) continue;
    const inline = body.match(new RegExp(`^\\s*${prefix.replace(/\./g, '\\.').replace(/\\\.$/, '')}\\s*=\\s*\\{([\\s\\S]*?)\\}`, 'm'))?.[1];
    if (inline) {
      const lines = inline.replace(/,\s*(?=[a-z]+\s*=)/g, '\n');
      return { layout: value(lines, 'layout'), components: list(array(lines, 'components')) };
    }
    const layout = value(body, `${prefix}layout`);
    const components = list(array(body, `${prefix}components`));
    if (layout || components) return { layout, components };
  }
  return undefined;
}

/**
 * Check a project that uses MotifSpec: no stylesheets anywhere (except an à la carte project's own, held to tokens),
 * and every file in `dirs` checked by checkText against the project's layout.
 */
export function checkProject(root, { dirs = ['layouts', 'content'], layout, components } = {}) {
  const problems = [];
  const declared = declaredLayout(root);
  const fromConfig = (v) => (v === undefined ? declared.from : undefined);
  const layoutFrom = fromConfig(layout) ?? '<options>';
  const componentsFrom = fromConfig(components) ?? '<options>';
  layout ??= declared.layout ?? 'portfolio';
  components ??= declared.components;
  const add = (file, rule, match) => problems.push({ file, line: 0, rule, match, message: RULES[rule], severity: WARNINGS.has(rule) ? 'warning' : 'error' });
  if (!LAYOUTS.includes(layout)) { add(layoutFrom, 'unknown-layout', layout); return problems; }
  const { docs } = load();
  for (const c of components ?? []) if (!docs.has(c)) add(componentsFrom, 'unknown-component', c);
  for (const file of walk(root)) {
    if (!['.css', '.scss', '.sass', '.less'].includes(extname(file))) continue;
    if (layout === 'a-la-carte') problems.push(...checkText(readFileSync(file, 'utf8'), { file: relative(root, file), kind: 'css', projectCss: true }));
    else add(relative(root, file), 'stylesheet', extname(file));
  }
  for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const kind = KIND[extname(file)];
      if (kind && kind !== 'css') problems.push(...checkText(readFileSync(file, 'utf8'), { file: relative(root, file), kind, layout, components }));
    }
  }
  return problems;
}

export function format(p) {
  return `${p.file}${p.line ? `:${p.line}` : ''}: [${p.rule}] "${p.match}". ${p.message}`;
}

// Run as a command: directly, or through npm's bin symlink (node_modules/.bin/motifspec-check).
const isMain = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const VALUED = ['--dirs', '--layout', '--components'];
  const opt = (flag) => {
    const at = args.indexOf(flag);
    if (at < 0) return undefined;
    const v = args[at + 1];
    if (!v || v.startsWith('--')) { console.error(`${flag} needs a value, e.g. ${flag === '--layout' ? '--layout dashboard' : `${flag} a,b`}`); process.exit(2); }
    return v;
  };
  const dirs = opt('--dirs')?.split(',').filter(Boolean);
  const layout = opt('--layout');
  const components = opt('--components')?.split(',').filter(Boolean);
  const root = resolve(args.find((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1])) ?? '.');
  if (!existsSync(root)) { console.error(`No such folder: ${root}`); process.exit(2); }
  const problems = checkProject(root, { ...(dirs && { dirs }), layout, components });
  const errors = problems.filter((p) => p.severity === 'error');
  const version = JSON.parse(read('dist', 'tokens.json')).version;
  if (args.includes('--json')) {
    console.log(JSON.stringify({ version, problems }, null, 2));
  } else {
    for (const p of problems) {
      console.error(`${p.severity === 'error' ? '✗' : '⚠'} ${format(p)}`);
      if (process.env.GITHUB_ACTIONS) console.log(`::${p.severity} file=${p.file},line=${p.line || 1},title=MotifSpec ${p.rule}::${p.message}`);
    }
    const where = relative(process.cwd(), root) || '.';
    const warnings = problems.length - errors.length;
    if (errors.length) console.error(`${errors.length} problem(s)${warnings ? ` and ${warnings} warning(s)` : ''}, checked against MotifSpec ${version}.`);
    else console.log(`No problems in ${where}${warnings ? `, ${warnings} warning(s)` : ''}: checked against MotifSpec ${version}.`);
  }
  process.exit(errors.length ? 1 : 0);
}
