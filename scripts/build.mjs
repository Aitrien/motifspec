// npm run build — tokens -> dist/*.css, dist/tokens.json, dist/tokens.js, dist/codex.js, dist/theme-init.js, dist/plate.*, dist/backdrop.html, dist/backdrop-foot.html, dist/backdrop-side.html, dist/contrast.md, the docs' token lists and syntax table
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { ROOT, loadTokens, validate, resolve, resolveIn, isAlias, aliasTarget, cssVar, contrastReport, hexOf, DOC_SELECTORS } from './lib.mjs';

const { tokens, errors } = loadTokens();
const ruleErrors = [...errors, ...validate(tokens)];
if (ruleErrors.length) { console.error(ruleErrors.join('\n')); process.exit(1); }

const DIST = join(ROOT, 'dist');
mkdirSync(DIST, { recursive: true });
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
// Every release needs a changelog entry; the docs site and the npm package link to it.
const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## [${pkg.version}]`)) { console.error(`CHANGELOG.md has no entry for ${pkg.version}. Add "## [${pkg.version}] - YYYY-MM-DD" before building.`); process.exit(1); }
if (!pkg.changelog) { console.error('package.json needs a "changelog" URL.'); process.exit(1); }
if (!pkg.showcase) { console.error('package.json needs a "showcase" URL (motifspec.com, the docs site).'); process.exit(1); }

// ------------------------------------------------------------------ value formatting
const n = (x) => String(Math.round(x * 10000) / 10000);
const unitOf = (t) => t.extensions['codex.unit'] ?? (isAlias(t.value) ? unitOf(tokens.get(aliasTarget(t.value))) : '');
const dimValue = (v) => (v.value === 0 ? '0' : `${n(v.value)}${v.unit}`);
const toRem = (v) => (v.unit === 'rem' ? v.value : v.value / 16);

function fluidCss(t) {
  const f = t.extensions['codex.fluid'];
  const min = isAlias(f.min) ? resolve(tokens, f.min) : f.min;
  const max = f.max ? f.max : resolve(tokens, t.value);
  const [a, b] = [toRem(min), toRem(max)];
  const [v0, v1] = [toRem(f.viewport.min), toRem(f.viewport.max)];
  const slope = (b - a) / (v1 - v0);
  const intercept = a - slope * v0;
  return `clamp(${n(a)}rem, ${n(intercept)}rem + ${n(slope * 100)}vw, ${n(b)}rem)`;
}

function rawCss(t, v) {
  switch (t.type) {
    case 'color': return hexOf(v);
    case 'dimension': return dimValue(v);
    case 'duration': return `${n(v.value)}${v.unit}`;
    case 'cubicBezier': return `cubic-bezier(${v.map(n).join(', ')})`;
    case 'fontFamily': return (Array.isArray(v) ? v : [v]).map((f) => (/^[a-z-]+$/.test(f) ? f : `"${f}"`)).join(', ');
    case 'fontWeight': return String(v);
    case 'number': return `${n(v)}${unitOf(t)}`;
    default: throw new Error(`no CSS formatter for ${t.type}`);
  }
}

function tokenCss(t) {
  if (t.extensions['codex.fluid']) return fluidCss(t);
  if (t.tier === 'primitive') return rawCss(t, t.value);
  const light = `var(${cssVar(aliasTarget(t.value))})`;
  const dark = t.extensions['codex.modes']?.dark;
  return dark ? `light-dark(${light}, var(${cssVar(aliasTarget(dark))}))` : light;
}

// ------------------------------------------------------------------ tokens.css: the single :root block
const groups = [];
let lastGroup = '';
for (const t of tokens.values()) {
  const g = t.segments.slice(0, t.tier === 'primitive' ? 3 : 2).join('.');
  if (g !== lastGroup) { groups.push(`\n  /* ${g} */`); lastGroup = g; }
  groups.push(`  ${cssVar(t.path)}: ${tokenCss(t)};${t.deprecated ? ` /* Deprecated: ${t.deprecated} */` : ''}`);
}
const tokensCss = `/* MotifSpec ${pkg.version} — generated from tokens/*.json. Do not edit.
   Themes: semantic colours use light-dark(); color-scheme follows the system unless
   <html data-theme="light|dark"> pins it. --cx-primitive-* are for this file only. */
:root {
  color-scheme: light dark;${groups.join('\n')}
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] { color-scheme: dark; }
`;

// ------------------------------------------------------------------ chroma.css
const chroma = JSON.parse(readFileSync(join(ROOT, 'syntax', 'chroma.json'), 'utf8'));
const decl = (r) => [
  r.color && `color: var(${cssVar(r.color)});`,
  r.background && `background: var(${cssVar(r.background)});`,
  r.weight && `font-weight: var(${cssVar(r.weight)});`,
].filter(Boolean).join(' ');
for (const r of chroma.rules) for (const k of ['color', 'background', 'weight']) {
  if (r[k] && !tokens.has(r[k])) throw new Error(`chroma.json: unknown token ${r[k]}`);
}
const chromaCss = `/* Hugo Chroma classes -> MotifSpec tokens (generated from syntax/chroma.json). Both themes via tokens. */
${chroma.container.selector} { ${decl(chroma.container)} }
${chroma.rules.map((r) => `/* ${r.role} */\n${r.classes.map((c) => `.chroma .${c}`).join(', ')} { ${decl(r)} }`).join('\n')}
`;

// ------------------------------------------------------------------ fonts.css (for Hugo; files under /fonts/)
const FONTS = [
  { family: 'National Park', file: 'national-park-latin-wght.woff2', weight: '200 800', display: 'swap' },
  { family: 'Geist Mono', file: 'geist-mono-latin-wght.woff2', weight: '100 900', display: 'swap' },
  { family: 'Yarndings 12', file: 'yarndings-12-latin.woff2', weight: '400', display: 'block' },
];
const fontFace = (f, src) => `@font-face { font-family: "${f.family}"; src: url(${src}) format("woff2"); font-weight: ${f.weight}; font-style: normal; font-display: ${f.display}; }`;
const fontsCss = FONTS.map((f) => fontFace(f, `"../fonts/${f.file}"`)).join('\n') + '\n';
const fontBytes = FONTS.map((f) => readFileSync(join(ROOT, 'fonts', f.file)).length);

// ------------------------------------------------------------------ icons: Material Symbols sprite from icons/manifest.json
const manifest = JSON.parse(readFileSync(join(ROOT, 'icons', 'manifest.json'), 'utf8'));
const symbols = Object.entries(manifest.icons).map(([key, { symbol }]) => {
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(key)) throw new Error(`icons/manifest.json: key "${key}" is not kebab-case`);
  const svg = readFileSync(join(ROOT, 'icons', 'svg', `${symbol}.svg`), 'utf8');
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<symbol id="cx-icon-${key}" viewBox="${viewBox}">${inner}</symbol>`;
});
const spriteFile = `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`;
writeFileSync(join(DIST, 'icons.svg'), spriteFile);
// Every icon reference in the script, the README and the component docs must exist in the manifest.
const iconSources = [join(ROOT, 'js', 'codex.js'), join(ROOT, 'README.md'),
  ...readdirSync(join(ROOT, 'docs', 'components')).map((f) => join(ROOT, 'docs', 'components', f))];
for (const f of iconSources) {
  for (const m of readFileSync(f, 'utf8').matchAll(/cx-icon-([a-z]+(?:-[a-z]+)*)/g)) {
    if (!manifest.icons[m[1]]) throw new Error(`${f.replace(ROOT + '/', '')}: icon "${m[1]}" is not in icons/manifest.json`);
  }
}

// Width media queries can't read custom properties, so css/components.css writes token(size.breakpoint.*) in the
// condition and the build puts the resolved value there. Only breakpoint tokens, and only in @media.
const componentsCss = readFileSync(join(ROOT, 'css', 'components.css'), 'utf8').replace(/token\(([a-z0-9.-]+)\)/g, (m, path, at, src) => {
  if (!/^size\.breakpoint\.[a-z]+$/.test(path) || !tokens.get(path)) throw new Error(`css/components.css: ${m} — only size.breakpoint.* tokens can be written as token(...)`);
  if (!/@media[^{;]*$/.test(src.slice(0, at))) throw new Error(`css/components.css: ${m} is only allowed in an @media condition`);
  return dimValue(resolve(tokens, tokens.get(path).value));
});
writeFileSync(join(DIST, 'tokens.css'), tokensCss);
writeFileSync(join(DIST, 'chroma.css'), chromaCss);
writeFileSync(join(DIST, 'fonts.css'), fontsCss);
writeFileSync(join(DIST, 'codex.css'), [fontsCss, tokensCss, componentsCss, chromaCss].join('\n'));

// ------------------------------------------------------------------ docs/components/*.md: tokens front matter from the CSS
const FOCUSABLE = new Set(['disclosure', 'docs-shell', 'search', 'tabs', 'specimen-plate', 'heading-anchor', 'site-header', 'project-card', 'post-list-item', 'tag', 'button-and-link', 'pagination', 'table-of-contents', 'code-block', 'data-table', 'prose']);
const byVar = new Map([...tokens.values()].map((t) => [cssVar(t.path), t.path]));
const rules = [...(componentsCss + '\n' + chromaCss).replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }));
const usesOf = (prefixes) => {
  const re = new RegExp(prefixes.map((p) => p.replace('.', '\\.') + '(?![\\w-])|' + p.replace('.', '\\.') + '(?:__|--)').join('|'));
  const used = new Set();
  for (const r of rules) if (re.test(r.sel)) for (const v of r.body.match(/--cx-[a-z0-9-]+/g) ?? []) if (byVar.has(v)) used.add(byVar.get(v));
  return used;
};
const docsDir = join(ROOT, 'docs', 'components');
for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const name = file.replace(/\.md$/, '');
  if (!DOC_SELECTORS[name]) throw new Error(`docs/components/${file}: no selector mapping in build.mjs`);
  const used = usesOf(DOC_SELECTORS[name]);
  if (FOCUSABLE.has(name)) ['color.focus.ring', 'border.focus.width', 'border.focus.offset'].forEach((t) => used.add(t));
  const list = [...used].filter((p) => !p.startsWith('primitive.')).sort();
  for (const p of list) if (tokens.get(p)?.tier !== 'semantic') throw new Error(`${file}: ${p} is not a semantic token`);
  const doc = readFileSync(join(docsDir, file), 'utf8');
  const next = doc.replace(/^tokens:\n(?:  - .*\n)+/m, `tokens:\n${list.map((p) => `  - ${p}`).join('\n')}\n`);
  if (!/^name: /m.test(next) || next === doc && !doc.includes(list[0])) throw new Error(`${file}: front matter not updated`);
  writeFileSync(join(docsDir, file), next);
}

// ------------------------------------------------------------------ tokens.json for build tools and the checker
const flat = [...tokens.values()].map((t) => {
  const o = { name: t.path, css: cssVar(t.path), tier: t.tier, type: t.type };
  if (t.tier === 'semantic') {
    o.references = aliasTarget(t.value);
    if (t.extensions['codex.modes']?.dark) o.referencesDark = aliasTarget(t.extensions['codex.modes'].dark);
  }
  o.value = t.type === 'color' ? hexOf(resolveIn(tokens, t.path, 'light')) : tokenCss(t).startsWith('var(') || tokenCss(t).startsWith('light-dark(') ? rawCss(t, resolve(tokens, t.value)) : tokenCss(t);
  if (t.type === 'color' && t.tier === 'semantic') o.valueDark = hexOf(resolveIn(tokens, t.path, 'dark'));
  if (t.description) o.description = t.description;
  if (t.deprecated) o.deprecated = t.deprecated;
  if (t.extensions['codex.pairsWith']) o.pairsWith = t.extensions['codex.pairsWith'];
  if (t.extensions['codex.glyphs']) o.glyphs = t.extensions['codex.glyphs'];
  return o;
});
writeFileSync(join(DIST, 'tokens.json'), JSON.stringify({ version: pkg.version, changelog: pkg.changelog, showcase: pkg.showcase, tokens: flat }, null, 2) + '\n');
writeFileSync(join(DIST, 'tokens.js'), `// Generated by npm run build. Do not edit.\nexport const version = ${JSON.stringify(pkg.version)};\nexport const changelog = ${JSON.stringify(pkg.changelog)};\nexport const showcase = ${JSON.stringify(pkg.showcase)};\nexport const tokens = ${JSON.stringify(flat, null, 2)};\nexport default tokens;\n`);

// ------------------------------------------------------------------ contrast report
const pairs = contrastReport(tokens);
const md = [`# Contrast report (generated)\n`, `${pairs.length} declared pairs, each measured in both themes. Target is the pair's \`min\`.\n`,
  '| Foreground | Background | Min | Light | Dark | Result |', '|---|---|---|---|---|---|',
  ...pairs.map((p) => `| \`${p.fg}\` | \`${p.bg}\` | ${p.min} | ${p.light.ratio.toFixed(2)} | ${p.dark.ratio.toFixed(2)} | ${p.pass ? 'pass' : '**FAIL**'} |`)].join('\n');
writeFileSync(join(DIST, 'contrast.md'), md + '\n');

// ------------------------------------------------------------------ docs/syntax-highlighting.md table
const synDoc = join(ROOT, 'docs', 'syntax-highlighting.md');
try {
  const doc = readFileSync(synDoc, 'utf8');
  const lightDark = (p) => `${hexOf(resolveIn(tokens, p, 'light'))} / ${hexOf(resolveIn(tokens, p, 'dark'))}`;
  const ratioOn = (p, mode) => {
    const r = pairs.find((x) => x.fg === p && x.bg === 'color.surface.sunken');
    return r ? r[mode].ratio.toFixed(2) : '—';
  };
  const rows = chroma.rules.map((r) => `| ${r.role} | ${r.classes.map((c) => `\`.${c}\``).join(' ')} | ${[r.color && `\`${r.color}\``, r.background && `background \`${r.background}\``, r.weight && `weight \`${r.weight}\``].filter(Boolean).join(' + ')} | ${r.color ? lightDark(r.color) : r.background ? lightDark(r.background) : '—'} | ${r.color ? `${ratioOn(r.color, 'light')} / ${ratioOn(r.color, 'dark')}` : '—'} |`);
  const table = ['| Role | Chroma classes | Token | Light / dark | Contrast on code surface (light / dark) |', '|---|---|---|---|---|', ...rows].join('\n');
  writeFileSync(synDoc, doc.replace(/<!-- TABLE:START -->[\s\S]*<!-- TABLE:END -->/, `<!-- TABLE:START -->\n<!-- caption: Chroma mapping -->\n${table}\n<!-- TABLE:END -->`));
} catch (e) { if (e.code !== 'ENOENT') throw e; }

// ------------------------------------------------------------------ behaviour: js/codex.js and the theme-init snippet
// One implementation, shipped as-is for sites.
const codexJs = readFileSync(join(ROOT, 'js', 'codex.js'), 'utf8');
const themeInit = readFileSync(join(ROOT, 'js', 'theme-init.js'), 'utf8').trim();
// site-header.md documents the snippet sites inline in <head>; it must match the shipped file exactly.
if (!readFileSync(join(ROOT, 'docs', 'components', 'site-header.md'), 'utf8').includes(`<script>${themeInit}</script>`)) {
  throw new Error('docs/components/site-header.md: the theme-init snippet differs from js/theme-init.js. Copy the file into the doc.');
}
writeFileSync(join(DIST, 'codex.js'), codexJs);
writeFileSync(join(DIST, 'theme-init.js'), themeInit + '\n');

// ------------------------------------------------------------------ specimen plate
// js/plate.js is a plain browser script. Run it in a sandbox to draw the static contours (t = 0), then ship it as-is.
const plateJs = readFileSync(join(ROOT, 'js', 'plate.js'), 'utf8');
const plateCtx = {}; plateCtx.globalThis = plateCtx;
vm.runInNewContext(plateJs, plateCtx, { filename: 'js/plate.js' });
const PLATE = plateCtx.cxPlate.markup();
writeFileSync(join(DIST, 'plate.html'), PLATE + '\n');
const BACKDROP = plateCtx.cxPlate.backdrop('head');
writeFileSync(join(DIST, 'backdrop.html'), BACKDROP + '\n');
const BACKDROP_FOOT = plateCtx.cxPlate.backdrop('foot');
writeFileSync(join(DIST, 'backdrop-foot.html'), BACKDROP_FOOT + '\n');
writeFileSync(join(DIST, 'backdrop-side.html'), plateCtx.cxPlate.backdrop('side') + '\n');
writeFileSync(join(DIST, 'plate.js'), plateJs);

console.log('Built dist/: tokens.css, chroma.css, fonts.css, codex.css, codex.js, theme-init.js, icons.svg, tokens.json, tokens.js, plate.html, plate.js, backdrop.html, backdrop-foot.html, backdrop-side.html, contrast.md.');
console.log(`${tokens.size} tokens, ${pairs.length} pairs, fonts ${(fontBytes.reduce((a, b) => a + b, 0) / 1024).toFixed(1)} KB.`);
