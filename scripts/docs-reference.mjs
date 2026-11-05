// The pages of motifspec.com that show MotifSpec's own data: the foundations (colour, type, space and size, motion,
// icons, ornaments) and the token, contrast-pair and checker-rule reference. Their wording is Markdown in
// docs/foundations/ and docs/reference/; each element made from the data (a palette, a table) is a marker line there,
// "*Generated from `tokens/color.json`: the palette.*", which this script replaces with the element. Called by
// scripts/docs.mjs, which writes the pages to site/assets/generated/ (not committed) for the site's content adapters.
// Tables use the data table's markup (data-table.md) with the token table's samples (token-table.md), whose values
// are set in style attributes here, the one place MotifSpec writes them (token-table.md says why).
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadTokens, isAlias, aliasTarget, resolve, resolveIn, cssVar, hexOf, ratio, contrastReport } from './lib.mjs';
import { RULES, WARNINGS } from './check.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// A token description or rule as HTML: escaped, with `code` spans kept.
const text = (s) => esc(s ?? '').replace(/`([^`]+)`/g, '<code>$1</code>');
const code = (s) => `<code>${esc(s)}</code>`;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** A data table (data-table.md) as one line of HTML, so Markdown keeps it as one block. The first cell is the row header. */
function table(caption, head, rows, { num = [], breakout = head.length > 4 } = {}) {
  const id = `tbl-${slug(caption)}`;
  const cls = `cx-table${breakout ? ' cx-table--breakout' : ''}${String(head[0]).match(/^(Token|Step|Name|Key|Rule|On|Role)$/) ? ' cx-token-table' : ''}`;
  const th = head.map((h, i) => `<th scope="col"${num.includes(i) ? ' class="is-num"' : ''}>${h}</th>`).join('');
  const tr = rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td${num.includes(i) ? ' class="is-num"' : ''}>${c}</td>`)).join('')}</tr>`).join('');
  return `<div class="${cls}" role="region" aria-labelledby="${id}" tabindex="0"><table><caption id="${id}">${caption}</caption><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

// A marker line in a page's Markdown: "*Generated from `tokens/color.json`: the palette.*". It reads as a note on
// GitHub; the site puts the element there.
const MARKER = /^\*Generated from (.+?): (.+?)\.\*$/gm;

export function referencePages() {
  const { tokens } = loadTokens();
  const all = [...tokens.values()];
  const semantic = all.filter((t) => t.tier === 'semantic');
  const toRem = (v) => (v.unit === 'rem' ? v.value : v.value / 16);
  const px = (v) => Math.round(toRem(v) * 16 * 10) / 10;

  // A token's value as text: a colour's hex, a size in rem and px (with its fluid range), a duration, a curve.
  const valueOf = (t, mode = 'light') => {
    const raw = mode === 'dark' ? resolveIn(tokens, t.path, 'dark') : resolve(tokens, t.value);
    switch (t.type) {
      case 'color': return hexOf(raw);
      case 'dimension': {
        const target = isAlias(t.value) ? tokens.get(aliasTarget(t.value)) : t;
        const fluid = target.extensions['codex.fluid'];
        const v = `${raw.value}${raw.unit}${raw.unit === 'rem' ? ` (${px(raw)}px)` : ''}`;
        return fluid ? `${fluid.min.value}${fluid.min.unit} to ${v}, fluid` : v;
      }
      case 'duration': return `${raw.value}${raw.unit}`;
      case 'cubicBezier': return `cubic-bezier(${raw.join(', ')})`;
      case 'fontFamily': return (Array.isArray(raw) ? raw : raw.split(','))[0].trim().replace(/"/g, '');
      default: return String(raw);
    }
  };
  const ref = (v) => (isAlias(v) ? aliasTarget(v).replace(/^primitive\.[a-z]+\./, '') : '');
  // A colour tile (token-table.md): the colour as the background, with a label and its hex written on it in whichever
  // of the darkest and lightest neutral reads better on it. A primitive keeps its value in both themes, so the ink can
  // be chosen here.
  const inks = ['primitive.color.ash.1000', 'primitive.color.ash.0'].map((p) => tokens.get(p));
  const tile = (path, label) => {
    const c = resolve(tokens, tokens.get(path).value);
    const ink = inks.reduce((a, b) => (ratio(c, b.value) > ratio(c, a.value) ? b : a));
    return `<span class="cx-swatch cx-swatch--tile" style="--_swatch: var(${cssVar(path)}); --_ink: var(${cssVar(ink.path)})"><b>${esc(label)}</b><span>${hexOf(c)}</span></span>`;
  };
  // A semantic colour in one theme: its primitive's chip, the primitive's name and the hex.
  const colourCell = (t, mode) => {
    const v = mode === 'dark' ? (t.extensions['codex.modes']?.dark ?? t.value) : t.value;
    const target = isAlias(v) ? aliasTarget(v) : t.path;
    return tile(target, ref(v) || mode);
  };
  const rule = (t) => (t.deprecated ? `<strong>Deprecated.</strong> ${text(t.deprecated)} ` : '') + text(t.description);
  const BREAK = { breakout: true };
  const tokenRows = (list) => list.map((t) => [code(t.path), code(valueOf(t)), rule(t)]);
  const sep = ' <span class="cx-sep" aria-hidden="true">|</span> ';
  const byCat = (c) => semantic.filter((t) => t.segments[0] === c);

  // Colour
  const colorJson = JSON.parse(readFileSync(join(ROOT, 'tokens', 'color.json'), 'utf8'));
  const prim = all.filter((t) => t.tier === 'primitive' && t.type === 'color');
  const hues = [...new Set(prim.map((t) => t.segments[2]))];
  const palette = () => hues.map((h) => {
    const steps = prim.filter((t) => t.segments[2] === h).map((t) => `<li>${tile(t.path, t.segments[3])}</li>`).join('');
    return `### ${h}\n\n${text(colorJson.primitive.color[h].$description)}\n\n<ol class="cx-palette" aria-label="${h}">${steps}</ol>`;
  }).join('\n\n');
  const semanticColours = () => [...new Set(byCat('color').map((t) => t.segments[1]))].map((g) => {
    const rows = byCat('color').filter((t) => t.segments[1] === g).map((t) => (t.type === 'color'
      ? [code(t.path), colourCell(t, 'light'), colourCell(t, 'dark'), rule(t)]
      : [code(t.path), code(valueOf(t)), code(valueOf(t, 'dark')), rule(t)]));
    const name = g[0].toUpperCase() + g.slice(1);
    return `### ${name}\n\n${table(`${name} colours`, ['Token', 'Light', 'Dark', 'Rule'], rows, BREAK)}`;
  }).join('\n\n');

  // Type
  const pxAt = (t, vw) => {
    const target = isAlias(t.value) ? tokens.get(aliasTarget(t.value)) : t;
    const max = toRem(target.value); const f = target.extensions['codex.fluid'];
    if (!f) return Math.round(max * 16 * 10) / 10;
    const a = toRem(f.min); const v0 = toRem(f.viewport.min) * 16; const v1 = toRem(f.viewport.max) * 16;
    const x = Math.min(1, Math.max(0, (vw - v0) / (v1 - v0)));
    return Math.round((a + (max - a) * x) * 16 * 10) / 10;
  };
  const familySample = (t) => (t.path.endsWith('ornament')
    ? `<span class="cx-token-sample" style="--_family: var(${cssVar(t.path)})" aria-hidden="true">kWfgcAW</span>`
    : `<span class="cx-token-sample" style="--_family: var(${cssVar(t.path)})">${esc(valueOf(t))}</span>`);
  const sizes = semantic.filter((t) => t.path.startsWith('font.size.'));

  // Space
  const spacePrim = all.filter((t) => t.tier === 'primitive' && t.segments[1] === 'space');
  const maxSpace = Math.max(...spacePrim.map((t) => toRem(t.value)));

  // Icons and ornaments
  const manifest = JSON.parse(readFileSync(join(ROOT, 'icons', 'manifest.json'), 'utf8'));
  const icons = Object.entries(manifest.icons);
  const glyphs = tokens.get('font.family.ornament').extensions['codex.glyphs'];
  const glyph = (c) => `<span class="cx-ornament" aria-hidden="true">${esc(c)}</span>`;
  const keyOf = (c) => (c.charCodeAt(0) > 126 ? `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : c);

  // Contrast
  const pairs = contrastReport(tokens);
  const sample = (p, mode) => {
    const v = (t) => cssVar(aliasTarget(mode === 'dark' ? t.extensions['codex.modes']?.dark ?? t.value : t.value));
    return `<span class="cx-pair-sample" style="--_fg: var(${v(tokens.get(p.fg))}); --_bg: var(${v(tokens.get(p.bg))})" aria-hidden="true">Aa</span>`;
  };

  // Each element a page can ask for, by the name its marker line gives, with the files it is generated from. A
  // marker that names other files fails the build, so the line on GitHub always says where the element comes from.
  const ELEMENTS = {
    'the palette': { from: ['tokens/color.json'], render: palette },
    'semantic colours': { from: ['tokens/color.json'], render: semanticColours },
    typefaces: { from: ['tokens/typography.json'], render: () => table('Typefaces', ['Token', 'Sample', 'Rule'], semantic.filter((t) => t.path.startsWith('font.family.')).map((t) => [code(t.path), familySample(t), rule(t)])) },
    'the type scale': { from: ['tokens/typography.json'], render: () => table('Type scale', ['Token', 'At 360px', 'At 1440px', 'Sample and rule'], sizes.map((t) => [code(t.path), `${pxAt(t, 360)}px`, `${pxAt(t, 1440)}px`, `<span class="cx-token-sample" style="--_size: var(${cssVar(t.path)})">${t.segments[2]}</span>${rule(t)}`]), { num: [1, 2], breakout: true }) },
    'weight, leading and tracking': { from: ['tokens/typography.json'], render: () => table('Weight, leading and tracking', ['Token', 'Value', 'Rule'], tokenRows(byCat('font').filter((t) => !['family', 'size'].includes(t.segments[1]))), BREAK) },
    'spacing steps': { from: ['tokens/space.json'], render: () => table('Spacing steps', ['Step', 'Value', 'Length'], spacePrim.map((t) => [code(t.segments[2]), `${px(t.value)}px`, `<span class="cx-token-bar" style="--_width: ${Math.round((toRem(t.value) / maxSpace) * 1000) / 10}%"></span>`]), { num: [1] }) },
    'space tokens': { from: ['tokens/space.json'], render: () => table('Space', ['Token', 'Value', 'Rule'], tokenRows(byCat('space')), BREAK) },
    'size tokens': { from: ['tokens/size.json'], render: () => table('Size', ['Token', 'Value', 'Rule'], tokenRows(byCat('size')), BREAK) },
    'radius tokens': { from: ['tokens/radius.json'], render: () => table('Radius', ['Token', 'Value', 'Rule'], tokenRows(byCat('radius')), BREAK) },
    'border tokens': { from: ['tokens/border.json'], render: () => table('Border', ['Token', 'Value', 'Rule'], tokenRows(byCat('border')), BREAK) },
    'motion tokens': { from: ['tokens/motion.json'], render: () => table('Motion', ['Token', 'Value', 'Rule'], tokenRows(byCat('motion')), BREAK) },
    'the icons': { from: ['icons/manifest.json'], render: () => table(`${icons.length} icons${sep}Material Symbols Sharp 300${sep}Apache-2.0`, ['Key', 'Icon', 'Symbol', 'Use'], icons.map(([k, v]) => [code(k), `<svg class="cx-icon cx-icon--lg" aria-hidden="true" focusable="false"><use href="#cx-icon-${k}"></use></svg>`, code(v.symbol), text(v.use)])) },
    'ornament roles': { from: ['tokens/typography.json'], render: () => table('Ornament roles', ['Role', 'Glyphs'], Object.entries(glyphs.roles).map(([r, d]) => [code(r), text(d)])) },
    'approved glyphs': { from: ['tokens/typography.json'], render: () => Object.entries(glyphs.groups).map(([g, desc]) => {
      const items = Object.entries(glyphs.glyphs).filter(([, v]) => v.group === g);
      const name = g[0].toUpperCase() + g.slice(1);
      return `### ${name}\n\n${text(desc)}\n\n${table(`${name} glyphs${sep}${items.length}`, ['Name', 'Glyph', 'Key'], items.map(([k, v]) => [code(k), glyph(v.char), code(keyOf(v.char))]))}`;
    }).join('\n\n') },
    'forbidden glyphs': { from: ['tokens/typography.json'], render: () => `${text(glyphs.forbidden.reason)}\n\n${table('Forbidden glyphs', ['Key', 'Glyph'], [...glyphs.forbidden.chars].map((c) => [code(keyOf(c)), glyph(c)]))}` },
    'deprecated tokens': { from: ['tokens/'], render: () => {
      const list = semantic.filter((t) => t.deprecated);
      return list.length ? `> [!WARNING]\n> ${list.length} tokens are deprecated and kept until they are removed: ${list.map((t) => `\`${t.path}\``).join(', ')}. Each row says why and when. The checker fails a project that uses one.` : '';
    } },
    'every semantic token': { from: ['tokens/'], render: () => [...new Set(semantic.map((t) => t.segments[0]))].sort().map((c) => {
      const list = byCat(c);
      const name = c[0].toUpperCase() + c.slice(1);
      const rows = list.map((t) => [code(t.path), t.type === 'color' ? `${colourCell(t, 'light')} ${colourCell(t, 'dark')}` : code(valueOf(t)), rule(t)]);
      return `## ${name}\n\n${table(`${name} tokens${sep}${list.length}`, ['Token', 'Value', 'Rule'], rows, BREAK)}`;
    }).join('\n\n') },
    'the contrast summary': { from: ['tokens/color.json'], render: () => {
      const worst = Math.min(...pairs.filter((p) => p.min === 7).flatMap((p) => [p.light.ratio, p.dark.ratio])).toFixed(2);
      return `${pairs.filter((p) => p.pass).length} of ${pairs.length} pairs pass in both themes. The lowest reading-text ratio is ${worst}:1.`;
    } },
    'contrast pairs': { from: ['tokens/color.json'], render: () => [...new Set(pairs.map((p) => p.fg))].map((fg) => {
      const rows = pairs.filter((p) => p.fg === fg).map((p) => [code(p.bg), `${p.min}:1`, `${sample(p, 'light')}${p.light.ratio.toFixed(2)}`, `${sample(p, 'dark')}${p.dark.ratio.toFixed(2)}`, `<span class="cx-status cx-status--${p.pass ? 'success' : 'danger'}">${p.pass ? 'Pass' : 'Fail'}</span>`]);
      return table(code(fg), ['On', 'Target', 'Light', 'Dark', 'Result'], rows, { num: [1, 2, 3] });
    }).join('\n\n') },
    'checker rules': { from: ['scripts/check.mjs'], render: () => table(`Checker rules${sep}${Object.keys(RULES).length - WARNINGS.size} fail${sep}${WARNINGS.size} warn`, ['Rule', 'Result', 'What to do'], Object.entries(RULES).map(([k, v]) => [code(k), WARNINGS.has(k) ? '<span class="cx-status cx-status--warning">Warns</span>' : '<span class="cx-status cx-status--danger">Fails</span>', text(v)])) },
  };

  // The pages: each Markdown file in docs/foundations/ and docs/reference/, with every marker line replaced by its
  // element. The front matter gains `source` (the file, for View source) and `data` (what its elements come from).
  const pages = {};
  const used = new Set();
  for (const dir of ['foundations', 'reference']) {
    for (const f of readdirSync(join(ROOT, 'docs', dir)).filter((n) => n.endsWith('.md')).sort()) {
      const file = `docs/${dir}/${f}`;
      const data = new Set();
      const md = readFileSync(join(ROOT, file), 'utf8').replace(MARKER, (line, from, name) => {
        const el = ELEMENTS[name];
        if (!el) throw new Error(`${file}: no element called "${name}". Elements: ${Object.keys(ELEMENTS).join(', ')}.`);
        const named = [...from.matchAll(/`([^`]+)`/g)].map((m) => m[1]).sort();
        if (named.join() !== [...el.from].sort().join()) throw new Error(`${file}: "${name}" is generated from ${el.from.map((x) => `\`${x}\``).join(' and ')}; the line says ${from}.`);
        el.from.forEach((x) => data.add(x));
        used.add(name);
        return el.render();
      });
      if (!/^---\n/.test(md)) throw new Error(`${file}: needs front matter (weight, and toc: false for a page of wide tables).`);
      pages[`${dir}/${f.replace(/\.md$/, '')}`] = md.replace(/^---\n/, `---\nsource: ${file}\ndata: [${[...data].map((x) => JSON.stringify(x)).join(', ')}]\n`);
    }
  }
  const unused = Object.keys(ELEMENTS).filter((n) => !used.has(n));
  if (unused.length) throw new Error(`No page in docs/foundations/ or docs/reference/ shows: ${unused.join(', ')}.`);
  return pages;
}
