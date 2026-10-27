#!/usr/bin/env node
// The MotifSpec rule checker: one implementation for this repo's templates (npm run audit), for sites that use
// MotifSpec (their CI runs this file from the pinned module) and for any tool that imports checkText.
//
//   node scripts/check.mjs [project-root]                 check a consuming project's layouts/ and content/
//   node scripts/check.mjs [project-root] --dirs src,app  check other folders instead (a non-Hugo project)
//   node scripts/check.mjs [project-root] --json          print the problems as JSON
//   npx motifspec-check [same options]                    the same, from the npm package
//
// Rules come from the files of this release: class names from dist/codex.css, tokens from dist/tokens.json, icons
// from icons/manifest.json. A site therefore checks against the version it has pinned, not against main.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './lib.mjs';

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
};

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
  return data;
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
 * Returns [{ file, line, rule, match, message }].
 */
export function checkText(text, { file = '<input>', kind = 'html' } = {}) {
  const { classes, icons, tokens, breakpoints } = load();
  const problems = [];
  const add = (line, rule, match) => problems.push({ file, line, rule, match, message: RULES[rule] });
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
        for (const c of m[1].split(/\s+/)) if (c.startsWith('cx-') && !c.includes('§') && !classes.has(c)) add(n, 'unknown-class', c);
      }
      for (const m of plain.matchAll(ICON_REF)) {
        if (m[1] && plain[m.index + m[0].length] !== '§' && !icons.has(m[1])) add(n, 'unknown-icon', `cx-icon-${m[1]}`);
      }
    }
  });
  return problems;
}

const KIND = {
  '.html': 'html', '.xml': 'html', '.jsx': 'html', '.tsx': 'html', '.vue': 'html', '.svelte': 'html', '.astro': 'html',
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

/** Check a project that uses MotifSpec: no stylesheets anywhere, and every file in `dirs` checked by checkText. */
export function checkProject(root, { dirs = ['layouts', 'content'] } = {}) {
  const problems = [];
  for (const file of walk(root)) {
    if (['.css', '.scss', '.sass', '.less'].includes(extname(file))) {
      problems.push({ file: relative(root, file), line: 0, rule: 'stylesheet', match: extname(file), message: RULES.stylesheet });
    }
  }
  for (const dir of dirs) {
    const abs = join(root, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const kind = KIND[extname(file)];
      if (kind && kind !== 'css') problems.push(...checkText(readFileSync(file, 'utf8'), { file: relative(root, file), kind }));
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
  const at = args.indexOf('--dirs');
  const dirs = at >= 0 ? args[at + 1]?.split(',').filter(Boolean) : undefined;
  if (at >= 0 && !dirs?.length) { console.error('--dirs needs a comma-separated list, e.g. --dirs src,app'); process.exit(2); }
  const root = resolve(args.find((a, i) => !a.startsWith('--') && (at < 0 || i !== at + 1)) ?? '.');
  if (!existsSync(root)) { console.error(`No such folder: ${root}`); process.exit(2); }
  const problems = checkProject(root, dirs ? { dirs } : undefined);
  const version = JSON.parse(read('dist', 'tokens.json')).version;
  if (args.includes('--json')) {
    console.log(JSON.stringify({ version, problems }, null, 2));
  } else if (problems.length) {
    for (const p of problems) {
      console.error(`✗ ${format(p)}`);
      if (process.env.GITHUB_ACTIONS) console.log(`::error file=${p.file},line=${p.line || 1},title=MotifSpec ${p.rule}::${p.message}`);
    }
    console.error(`${problems.length} problem(s), checked against MotifSpec ${version}.`);
  } else {
    console.log(`No problems in ${relative(process.cwd(), root) || '.'}: checked against MotifSpec ${version}.`);
  }
  process.exit(problems.length ? 1 : 0);
}
