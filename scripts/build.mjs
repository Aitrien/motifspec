// npm run build — tokens -> dist/*.css, dist/tokens.json, dist/tokens.js, dist/codex.js, dist/theme-init.js, dist/plate.*, dist/backdrop.html, dist/contrast.md, docs table, dist/showcase.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import {
  ROOT, loadTokens, validate, resolve, resolveIn, isAlias, aliasTarget, cssVar, contrastReport, hexOf,
} from './lib.mjs';

const { tokens, errors } = loadTokens();
const ruleErrors = [...errors, ...validate(tokens)];
if (ruleErrors.length) { console.error(ruleErrors.join('\n')); process.exit(1); }

const DIST = join(ROOT, 'dist');
mkdirSync(DIST, { recursive: true });
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
// Every release needs a changelog entry, and the showcase links to it.
const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## [${pkg.version}]`)) { console.error(`CHANGELOG.md has no entry for ${pkg.version}. Add "## [${pkg.version}] - YYYY-MM-DD" before building.`); process.exit(1); }
if (!pkg.changelog) { console.error('package.json needs a "changelog" URL.'); process.exit(1); }

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
  { family: 'JetBrains Mono', file: 'jetbrains-mono-latin-wght.woff2', weight: '100 800', display: 'swap' },
  { family: 'Yarndings 12', file: 'yarndings-12-latin.woff2', weight: '400', display: 'block' },
];
const fontFace = (f, src) => `@font-face { font-family: "${f.family}"; src: url(${src}) format("woff2"); font-weight: ${f.weight}; font-style: normal; font-display: ${f.display}; }`;
const fontsCss = FONTS.map((f) => fontFace(f, `"../fonts/${f.file}"`)).join('\n') + '\n';
const fontsInline = FONTS.map((f) => fontFace(f, `"data:font/woff2;base64,${readFileSync(join(ROOT, 'fonts', f.file)).toString('base64')}"`)).join('\n');
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
const spriteInline = `<div hidden><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${symbols.join('')}</svg></div>`;
writeFileSync(join(DIST, 'icons.svg'), spriteFile);
// Every icon reference in the showcase and docs must exist in the manifest.
const iconSources = [join(ROOT, 'showcase', 'index.src.html'), join(ROOT, 'js', 'codex.js'), join(ROOT, 'README.md'),
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
const DOC_SELECTORS = {
  'site-header': ['.cx-header', '.cx-wordmark', '.cx-nav', '.cx-theme-toggle', '.cx-backdrop__pause', '.cx-skip-link', '.cx-container'],
  'backdrop': ['.cx-backdrop', '.cx-backdrop-page'],
  'site-footer': ['.cx-footer', '.cx-band', '.cx-version'],
  'accession-label': ['.cx-label', '.cx-id', '.cx-status'],
  'project-card': ['.cx-cards', '.cx-card'],
  'post-list-item': ['.cx-posts', '.cx-post'],
  'icon': ['.cx-icon'],
  'heading-anchor': ['.cx-anchor'],
  'tooltip': ['.cx-tooltip'],
  'prose': ['.cx-sep', '.cx-prose', '.cx-lede', '.cx-end-mark', '.cx-code-inline', '.cx-page-head', '.cx-h1', '.cx-display', '.cx-meta', '.cx-eyebrow'],
  'code-block': ['.cx-code', '.chroma'],
  'figure': ['.cx-figure'],
  'callout': ['.cx-callout'],
  'tag': ['.cx-tags', '.cx-tag'],
  'button-and-link': ['.cx-actions', '.cx-button', '.cx-link', '.cx-back'],
  'pagination': ['.cx-pagination'],
  'table-of-contents': ['.cx-toc', '.cx-article'],
  'data-table': ['.cx-table'],
  'ornament': ['.cx-band', '.cx-divider', '.cx-end-mark', '.cx-ornament'],
  'specimen-plate': ['.cx-plate', '.cx-plate-frame', '.cx-plate__pause'],
};
const FOCUSABLE = new Set(['specimen-plate', 'heading-anchor', 'site-header', 'project-card', 'post-list-item', 'tag', 'button-and-link', 'pagination', 'table-of-contents', 'code-block', 'data-table', 'prose']);
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
writeFileSync(join(DIST, 'tokens.json'), JSON.stringify({ version: pkg.version, changelog: pkg.changelog, tokens: flat }, null, 2) + '\n');
writeFileSync(join(DIST, 'tokens.js'), `// Generated by npm run build. Do not edit.\nexport const version = ${JSON.stringify(pkg.version)};\nexport const changelog = ${JSON.stringify(pkg.changelog)};\nexport const tokens = ${JSON.stringify(flat, null, 2)};\nexport default tokens;\n`);

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
  writeFileSync(synDoc, doc.replace(/<!-- TABLE:START -->[\s\S]*<!-- TABLE:END -->/, `<!-- TABLE:START -->\n${table}\n<!-- TABLE:END -->`));
} catch (e) { if (e.code !== 'ENOENT') throw e; }

// ------------------------------------------------------------------ showcase
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prim = [...tokens.values()].filter((t) => t.tier === 'primitive' && t.type === 'color');
const hues = [...new Set(prim.map((t) => t.segments[2]))];
const PALETTE = hues.map((h) => {
  const desc = JSON.parse(readFileSync(join(ROOT, 'tokens', 'color.json'), 'utf8')).primitive.color[h].$description.split('.')[0];
  const sw = prim.filter((t) => t.segments[2] === h).map((t) => `<li class="sc-swatch"><span class="sc-swatch__chip" style="background: var(${cssVar(t.path)})"></span><span class="sc-swatch__step">${t.segments[3]}</span><span class="sc-swatch__hex">${hexOf(t.value)}</span></li>`).join('');
  return `<div class="sc-ramp"><h4 class="sc-ramp__name"><span>${h}</span> <small>${esc(desc)}</small></h4><ol class="sc-ramp__steps">${sw}</ol></div>`;
}).join('\n');

const semColors = [...tokens.values()].filter((t) => t.tier === 'semantic' && t.type === 'color' && !t.path.startsWith('color.syntax') && !t.path.startsWith('color.data'));
const swatch = (ref) => `<span class="sc-chip" style="background: var(${cssVar(ref)})"></span><code>${ref.replace('primitive.color.', '')}</code>`;
const SEMANTIC = `<div class="cx-table" role="region" aria-label="Semantic colour roles" tabindex="0"><table><thead><tr><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th><th scope="col">Usage rule</th></tr></thead><tbody>${
  semColors.map((t) => `<tr><th scope="row"><code>${t.path}</code></th><td class="sc-nowrap">${swatch(aliasTarget(t.value))}</td><td class="sc-nowrap">${swatch(aliasTarget(t.extensions['codex.modes'].dark))}</td><td>${esc(t.description)}</td></tr>`).join('')
}</tbody></table></div>`;

const sample = (p, mode) => {
  const fg = tokens.get(p.fg); const bg = tokens.get(p.bg);
  const ref = (t) => cssVar(aliasTarget(mode === 'dark' ? t.extensions['codex.modes'].dark : t.value));
  return `<span class="sc-pair" style="color: var(${ref(fg)}); background: var(${ref(bg)})">Aa</span>`;
};
const PAIRS = `<div class="cx-table cx-table--breakout sc-pairs" role="region" aria-label="Contrast pairs" tabindex="0"><table><caption>${pairs.length} pairs <span class="cx-sep" aria-hidden="true">|</span> ${pairs.filter((p) => p.pass).length} pass in both themes</caption><thead><tr><th scope="col">Foreground</th><th scope="col">On</th><th scope="col" class="is-num">Min</th><th scope="col" class="is-num">Light</th><th scope="col" class="is-num">Dark</th><th scope="col">Result</th></tr></thead><tbody>${
  pairs.map((p) => `<tr><th scope="row"><code>${p.fg.replace('color.', '')}</code></th><td><code>${p.bg.replace('color.', '')}</code></td><td class="is-num">${p.min}</td><td class="is-num"><span class="sc-ratio">${sample(p, 'light')}${p.light.ratio.toFixed(2)}</span></td><td class="is-num"><span class="sc-ratio">${sample(p, 'dark')}${p.dark.ratio.toFixed(2)}</span></td><td><span class="cx-status ${p.pass ? 'cx-status--live' : 'cx-status--building'}">${p.pass ? 'Pass' : 'Fail'}</span></td></tr>`).join('')
}</tbody></table></div>`;

const sizeRoles = ['display', 'heading-1', 'heading-2', 'heading-3', 'heading-4', 'lede', 'body', 'small', 'label'];
const pxAt = (path, vw) => {
  const t = tokens.get(path); const target = tokens.get(aliasTarget(t.value));
  const f = target.extensions['codex.fluid'];
  const max = toRem(target.value);
  if (!f) return Math.round(max * 16 * 10) / 10;
  const a = toRem(f.min); const v0 = toRem(f.viewport.min) * 16; const v1 = toRem(f.viewport.max) * 16;
  const x = Math.min(1, Math.max(0, (vw - v0) / (v1 - v0)));
  return Math.round((a + (max - a) * x) * 16 * 10) / 10;
};
const SCALE = sizeRoles.map((r) => {
  const p = `font.size.${r}`; const t = tokens.get(p);
  const mono = r === 'label';
  return `<div class="sc-scale__row"><p class="sc-scale__meta"><code>${p}</code><span>${aliasTarget(t.value).replace('primitive.font.size.', 'step ')}</span><span>${pxAt(p, 360)}px @360</span><span>${pxAt(p, 1440)}px @1440</span></p><p class="sc-scale__sample${mono ? ' sc-scale__sample--mono' : ''}" style="font-size: var(${cssVar(p)})">${mono ? 'LM-W-004 | Filed 2026-03-14' : r === 'body' || r === 'small' ? 'Analytics infrastructure that tells you what happened, and why it matters.' : 'Systems for the web, measured'}</p></div>`;
}).join('\n');

const spaceTokens = [...tokens.values()].filter((t) => t.tier === 'primitive' && t.segments[1] === 'space');
const SPACE = spaceTokens.map((t) => `<li class="sc-space__row"><code>${t.segments[2]}</code><span class="sc-space__bar" style="width: var(${cssVar(t.path)})"></span><span>${toRem(t.value) * 16}px</span></li>`).join('');

// ------------------------------------------------------------------ behaviour: js/codex.js and the theme-init snippet
// One implementation, shipped as-is for sites and inlined into the showcase below.
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
const BACKDROP = plateCtx.cxPlate.backdrop();
writeFileSync(join(DIST, 'backdrop.html'), BACKDROP + '\n');
writeFileSync(join(DIST, 'plate.js'), plateJs);

const CHROMA_TABLE = `<div class="cx-table" role="region" aria-label="Chroma mapping" tabindex="0"><table><thead><tr><th scope="col">Role</th><th scope="col">Chroma classes</th><th scope="col">Token</th><th scope="col">Sample</th></tr></thead><tbody>${
  chroma.rules.map((r) => `<tr><td>${esc(r.role)}</td><td><code>${r.classes.map((c) => '.' + c).join(' ')}</code></td><td><code>${r.color ?? r.background ?? r.weight}</code></td><td><span class="sc-chroma-sample chroma"><span class="${r.classes[0]}">${r.background ? 'highlighted line' : r.classes[0] === 'ln' ? '42' : 'sample'}</span></span></td></tr>`).join('')
}</tbody></table></div>`;

const ICONS = `<div class="cx-table" role="region" aria-label="Approved icons" tabindex="0"><table><caption>${Object.keys(manifest.icons).length} icons <span class="cx-sep" aria-hidden="true">|</span> Material Symbols Sharp 300 <span class="cx-sep" aria-hidden="true">|</span> Apache-2.0</caption><thead><tr><th scope="col">Icon</th><th scope="col">Key</th><th scope="col">Symbol</th><th scope="col">Use</th></tr></thead><tbody>${
  Object.entries(manifest.icons).map(([k, v]) => `<tr><td><svg class="cx-icon cx-icon--lg" aria-hidden="true" focusable="false"><use href="#cx-icon-${k}"></use></svg></td><th scope="row"><code>${k}</code></th><td><code>${v.symbol}</code></td><td>${esc(v.use)}</td></tr>`).join('')
}</tbody></table></div>`;

const glyphCat = tokens.get('font.family.ornament').extensions['codex.glyphs'];
const glyphItem = (key, c) => `<li><span class="cx-ornament" aria-hidden="true">${esc(c)}</span><span><b>${key}</b><small>${c.charCodeAt(0) > 126 ? 'U+' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') : `key "${esc(c)}"`}</small></span></li>`;
const GLYPHS = Object.entries(glyphCat.groups).map(([group, desc]) => {
  const items = Object.entries(glyphCat.glyphs).filter(([, v]) => v.group === group);
  return `<div class="sc-glyph-group"><h4 class="sc-ramp__name"><span>${group}</span> <small>${items.length} <span class="cx-sep" aria-hidden="true">|</span> ${esc(desc)}</small></h4><ul class="sc-glyphs" aria-label="${group} glyphs">${items.map(([k, v]) => glyphItem(k, v.char)).join('')}</ul></div>`;
}).join('\n') + `<div class="sc-glyph-group"><h4 class="sc-ramp__name"><span>forbidden</span> <small>${esc(glyphCat.forbidden.reason)}</small></h4><ul class="sc-glyphs sc-glyphs--forbidden" aria-label="Forbidden glyphs">${[...glyphCat.forbidden.chars].map((c) => `<li><span class="cx-ornament" aria-hidden="true">${esc(c)}</span><span><b>Not allowed</b><small>key "${esc(c)}"</small></span></li>`).join('')}</ul></div>`;

const semanticCount = [...tokens.values()].filter((t) => t.tier === 'semantic').length;
const stats = {
  VERSION: pkg.version,
  CHANGELOG_URL: pkg.changelog,
  TOKEN_COUNT: tokens.size,
  SEMANTIC_COUNT: semanticCount,
  PAIR_COUNT: pairs.length,
  PAIR_PASS: pairs.filter((p) => p.pass).length,
  FONT_KB: (fontBytes.reduce((a, b) => a + b, 0) / 1024).toFixed(1),
  FONT_NP_KB: (fontBytes[0] / 1024).toFixed(1),
  FONT_JB_KB: (fontBytes[1] / 1024).toFixed(1),
  FONT_YD_KB: (fontBytes[2] / 1024).toFixed(1),
  WORST_BODY: Math.min(...pairs.filter((p) => p.min === 7).flatMap((p) => [p.light.ratio, p.dark.ratio])).toFixed(2),
};

let src = readFileSync(join(ROOT, 'showcase', 'index.src.html'), 'utf8');
const showcaseCss = readFileSync(join(ROOT, 'showcase', 'showcase.css'), 'utf8');
src = src
  .replace('<!-- CX:STYLE -->', `<style>\n${fontsInline}\n${tokensCss}\n${componentsCss}\n${chromaCss}\n${showcaseCss}\n</style>`)
  .replace('<!-- CX:THEME_INIT -->', `<script>${themeInit}</script>`)
  .replace('<!-- CX:SCRIPT -->', `<script>\n${plateJs}\n${codexJs}\n</script>`)
  .replace('<!-- CX:ICONS -->', spriteInline)
  .replace('{{PALETTE}}', PALETTE).replace('{{SEMANTIC}}', SEMANTIC).replace('{{PAIRS}}', PAIRS)
  .replace('{{SCALE}}', SCALE).replace('{{SPACE}}', SPACE).replace('{{CHROMA_TABLE}}', CHROMA_TABLE).replace('{{ICONS}}', ICONS).replace('{{GLYPHS}}', GLYPHS)
  .replace('{{PLATE}}', PLATE)
  .replace('{{BACKDROP}}', BACKDROP)
  .replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in stats ? String(stats[k]) : m));
const leftover = src.match(/\{\{[A-Z_:0-9]+\}\}|<!-- CX:[A-Z_]+ -->/g);
if (leftover) throw new Error(`unfilled placeholders: ${leftover.join(', ')}`);
writeFileSync(join(DIST, 'showcase.html'), src);
// A complete document for opening locally (the publishing host supplies the doctype for showcase.html).
writeFileSync(join(DIST, 'showcase.standalone.html'), `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n</head>\n<body>\n${src}\n</body>\n</html>\n`);

console.log(`Built dist/: tokens.css, chroma.css, fonts.css, codex.css, codex.js, theme-init.js, icons.svg, tokens.json, tokens.js, plate.html, plate.js, backdrop.html, contrast.md, showcase.html (${(src.length / 1024).toFixed(0)} KB).`);
console.log(`${tokens.size} tokens, ${pairs.length} pairs, fonts ${stats.FONT_KB} KB.`);
