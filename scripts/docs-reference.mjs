// The reference pages of motifspec.com that are generated from MotifSpec's own data: the foundations (colour, type,
// space and size, motion, icons, ornaments) and the token, contrast-pair and checker-rule tables. Called by
// scripts/docs.mjs, which writes them to site/assets/generated/ (not committed); the site's content adapters turn each
// into a page. Each file is Markdown with a "# " title, a lede, "## " sections and the tables as raw HTML, in the
// data table's markup (data-table.md) with the token table's samples (token-table.md). The samples' values are set
// in style attributes here, the one place MotifSpec writes them (token-table.md says why).
import { readFileSync } from 'node:fs';
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

const page = ({ title, lede, source, weight, body, toc = true }) => `---\nsource: ${source}\nweight: ${weight}\ntoc: ${toc}\n---\n\n# ${title}\n\n${lede}\n\n${body.trim()}\n`;

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
  const pages = {};

  // ---------------------------------------------------------------- colour
  const colorJson = JSON.parse(readFileSync(join(ROOT, 'tokens', 'color.json'), 'utf8'));
  const prim = all.filter((t) => t.tier === 'primitive' && t.type === 'color');
  const hues = [...new Set(prim.map((t) => t.segments[2]))];
  const palette = hues.map((h) => {
    const steps = prim.filter((t) => t.segments[2] === h).map((t) => `<li>${tile(t.path, t.segments[3])}</li>`).join('');
    return `### ${h}\n\n${text(colorJson.primitive.color[h].$description)}\n\n<ol class="cx-palette" aria-label="${h}">${steps}</ol>`;
  }).join('\n\n');
  const colourGroups = [...new Set(semantic.filter((t) => t.segments[0] === 'color').map((t) => t.segments[1]))];
  const groupTables = colourGroups.map((g) => {
    const list = semantic.filter((t) => t.segments[0] === 'color' && t.segments[1] === g);
    const rows = list.map((t) => (t.type === 'color'
      ? [code(t.path), colourCell(t, 'light'), colourCell(t, 'dark'), rule(t)]
      : [code(t.path), code(valueOf(t)), code(valueOf(t, 'dark')), rule(t)]));
    const name = g[0].toUpperCase() + g.slice(1);
    return `### ${name}\n\n${table(`${name} colours`, ['Token', 'Light', 'Dark', 'Rule'], rows, { breakout: true })}`;
  }).join('\n\n');
  pages['foundations/colour'] = page({
    title: 'Colour', weight: 3, source: 'tokens/color.json',
    lede: 'The primitive palette, and the semantic colours built on it that components and pages use, each with its light and dark value and its rule.',
    body: `## Palette\n\nFive hues generated in OKLCH so the steps are perceptually even, stored as sRGB. Primitives are never used directly in components or pages: they exist so semantic colours can point at them.\n\n${palette}\n\n## Semantic colours\n\nEach semantic colour names a primitive for each theme, and the page switches with \`light-dark()\`, following the system unless the reader picks a theme. A text colour lists the surfaces it may sit on; [Contrast pairs](/reference/contrast/) measures every one.\n\n${groupTables}`,
  });

  // ---------------------------------------------------------------- type
  const fam = semantic.filter((t) => t.path.startsWith('font.family.'));
  const sizes = semantic.filter((t) => t.path.startsWith('font.size.'));
  const pxAt = (t, vw) => {
    const target = isAlias(t.value) ? tokens.get(aliasTarget(t.value)) : t;
    const max = toRem(target.value); const f = target.extensions['codex.fluid'];
    if (!f) return Math.round(max * 16 * 10) / 10;
    const a = toRem(f.min); const v0 = toRem(f.viewport.min) * 16; const v1 = toRem(f.viewport.max) * 16;
    const x = Math.min(1, Math.max(0, (vw - v0) / (v1 - v0)));
    return Math.round((a + (max - a) * x) * 16 * 10) / 10;
  };
  const otherType = semantic.filter((t) => t.segments[0] === 'font' && !['family', 'size'].includes(t.segments[1]));
  pages['foundations/type'] = page({
    title: 'Type', weight: 4, toc: false, source: 'tokens/typography.json',
    lede: 'The typefaces, the type scale and the weights, leading and tracking that set every piece of text.',
    body: `## Typefaces\n\n${table('Typefaces', ['Token', 'Sample', 'Rule'], fam.map((t) => [code(t.path), t.path.endsWith('ornament') ? `<span class="cx-token-sample" style="--_family: var(${cssVar(t.path)})" aria-hidden="true">kWfgcAW</span>` : `<span class="cx-token-sample" style="--_family: var(${cssVar(t.path)})">${esc(valueOf(t))}</span>`, rule(t)]))}\n\n## Type scale\n\nSizes are fluid between the smallest and widest screens, and the smallest stay fixed so labels never shrink. Each sample is set at its size.\n\n${table('Type scale', ['Token', 'At 360px', 'At 1440px', 'Sample and rule'], sizes.map((t) => [code(t.path), `${pxAt(t, 360)}px`, `${pxAt(t, 1440)}px`, `<span class="cx-token-sample" style="--_size: var(${cssVar(t.path)})">${t.segments[2]}</span>${rule(t)}`]), { num: [1, 2], breakout: true })}\n\n## Weight, leading and tracking\n\n${table('Weight, leading and tracking', ['Token', 'Value', 'Rule'], tokenRows(otherType)), BREAK}`,
  });

  // ---------------------------------------------------------------- space and size
  const spacePrim = all.filter((t) => t.tier === 'primitive' && t.segments[1] === 'space');
  const maxSpace = Math.max(...spacePrim.map((t) => toRem(t.value)));
  const bars = table('Spacing steps', ['Step', 'Value', 'Length'], spacePrim.map((t) => [code(t.segments[2]), `${px(t.value)}px`, `<span class="cx-token-bar" style="--_width: ${Math.round((toRem(t.value) / maxSpace) * 1000) / 10}%"></span>`]), { num: [1] });
  const byCat = (c) => semantic.filter((t) => t.segments[0] === c);
  pages['foundations/space-and-size'] = page({
    title: 'Space and size', weight: 5, toc: false, source: 'tokens/space.json',
    lede: 'A 4px spacing grid with roles for padding and gaps, and the sizes, radii and borders components are drawn with.',
    body: `## Spacing\n\nComponents use the semantic roles: inset is padding, stack is a vertical gap, inline a horizontal gap, and section and gutter space out a page. The steps they point at, to scale:\n\n${bars}\n\n${table('Space', ['Token', 'Value', 'Rule'], tokenRows(byCat('space')), BREAK)}\n\n## Size\n\n${table('Size', ['Token', 'Value', 'Rule'], tokenRows(byCat('size')), BREAK)}\n\n## Radius and border\n\n${table('Radius', ['Token', 'Value', 'Rule'], tokenRows(byCat('radius')), BREAK)}\n\n${table('Border', ['Token', 'Value', 'Rule'], tokenRows(byCat('border')), BREAK)}`,
  });

  // ---------------------------------------------------------------- motion
  pages['foundations/motion'] = page({
    title: 'Motion', weight: 6, toc: false, source: 'tokens/motion.json',
    lede: 'The durations and curves for the few things that move. Under reduced motion every duration is zero.',
    body: `## Durations and curves\n\nOnly state changes animate, and the contour survey ([Principles](/foundations/principles/)).\n\n${table('Motion', ['Token', 'Value', 'Rule'], tokenRows(byCat('motion')), BREAK)}`,
  });

  // ---------------------------------------------------------------- icons
  const manifest = JSON.parse(readFileSync(join(ROOT, 'icons', 'manifest.json'), 'utf8'));
  const icons = Object.entries(manifest.icons);
  pages['foundations/icons'] = page({
    title: 'Icons', weight: 7, source: 'icons/manifest.json',
    lede: `The ${icons.length} approved icons, each for its listed use. ${text(manifest.$description)}`,
    body: `## Approved icons\n\nUse them as \`icon.md\` says: beside text that says the same thing, from the sprite.\n\n${table(`${icons.length} icons | Material Symbols Sharp 300 | Apache-2.0`.replace(/ \| /g, ' <span class="cx-sep" aria-hidden="true">|</span> '), ['Key', 'Icon', 'Symbol', 'Use'], icons.map(([k, v]) => [code(k), `<svg class="cx-icon cx-icon--lg" aria-hidden="true" focusable="false"><use href="#cx-icon-${k}"></use></svg>`, code(v.symbol), text(v.use)]))}`,
  });

  // ---------------------------------------------------------------- ornaments
  const glyphs = tokens.get('font.family.ornament').extensions['codex.glyphs'];
  const glyph = (c) => `<span class="cx-ornament" aria-hidden="true">${esc(c)}</span>`;
  const keyOf = (c) => (c.charCodeAt(0) > 126 ? `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : c);
  const groups = Object.entries(glyphs.groups).map(([g, desc]) => {
    const items = Object.entries(glyphs.glyphs).filter(([, v]) => v.group === g);
    const name = g[0].toUpperCase() + g.slice(1);
    return `### ${name}\n\n${text(desc)}\n\n${table(`${name} glyphs`, ['Name', 'Glyph', 'Key'], items.map(([k, v]) => [code(k), glyph(v.char), code(keyOf(v.char))]))}`;
  }).join('\n\n');
  pages['foundations/ornaments'] = page({
    title: 'Ornaments', weight: 8, source: 'tokens/typography.json',
    lede: `The ${Object.keys(glyphs.glyphs).length} approved Yarndings 12 glyphs, by group, and the ones that are never used. Ornaments are decoration only, always hidden from assistive tech (\`ornament.md\`).`,
    body: `## Roles\n\nThe system's own ornaments always use these glyphs.\n\n${table('Ornament roles', ['Role', 'Glyphs'], Object.entries(glyphs.roles).map(([r, d]) => [code(r), text(d)]))}\n\n## Approved glyphs\n\n${groups}\n\n## Never used\n\n${text(glyphs.forbidden.reason)}\n\n${table('Forbidden glyphs', ['Key', 'Glyph'], [...glyphs.forbidden.chars].map((c) => [code(keyOf(c)), glyph(c)]))}`,
  });

  // ---------------------------------------------------------------- reference: every token
  const cats = [...new Set(semantic.map((t) => t.segments[0]))].sort();
  const deprecated = semantic.filter((t) => t.deprecated);
  const tokenTables = cats.map((c) => {
    const list = semantic.filter((t) => t.segments[0] === c);
    const name = c[0].toUpperCase() + c.slice(1);
    const rows = list.map((t) => [code(t.path), t.type === 'color' ? `${colourCell(t, 'light')} ${colourCell(t, 'dark')}` : code(valueOf(t)), rule(t)]);
    return `## ${name}\n\n${table(`${name} tokens | ${list.length}`.replace(' | ', ' <span class="cx-sep" aria-hidden="true">|</span> '), ['Token', 'Value', 'Rule'], rows, BREAK)}`;
  }).join('\n\n');
  const deprecatedNote = deprecated.length
    ? `> [!WARNING]\n> ${deprecated.length} tokens are deprecated and kept until they are removed: ${deprecated.map((t) => `\`${t.path}\``).join(', ')}. Each row says why and when. The checker fails a project that uses one.\n\n`
    : '';
  pages['reference/tokens'] = page({
    title: 'Tokens', weight: 1, toc: false, source: 'tokens/README.md',
    lede: `Every semantic token: ${semantic.length} in all, with its value and rule. Pages and components use these; the ${all.length - semantic.length} primitives behind them are not for use outside MotifSpec.`,
    body: `${deprecatedNote}A token's CSS name is \`--cx-\` and its name with dashes: \`color.text.primary\` is \`${cssVar('color.text.primary')}\`. A colour shows its light value, then its dark one.\n\n${tokenTables}`,
  });

  // ---------------------------------------------------------------- reference: contrast pairs
  const pairs = contrastReport(tokens);
  const sample = (p, mode) => {
    const fg = tokens.get(p.fg); const bg = tokens.get(p.bg);
    const v = (t) => cssVar(aliasTarget(mode === 'dark' ? t.extensions['codex.modes']?.dark ?? t.value : t.value));
    return `<span class="cx-pair-sample" style="--_fg: var(${v(fg)}); --_bg: var(${v(bg)})" aria-hidden="true">Aa</span>`;
  };
  const fgs = [...new Set(pairs.map((p) => p.fg))];
  const pairTables = fgs.map((fg) => {
    const rows = pairs.filter((p) => p.fg === fg).map((p) => [code(p.bg), `${p.min}:1`, `${sample(p, 'light')}${p.light.ratio.toFixed(2)}`, `${sample(p, 'dark')}${p.dark.ratio.toFixed(2)}`, `<span class="cx-status cx-status--${p.pass ? 'success' : 'danger'}">${p.pass ? 'Pass' : 'Fail'}</span>`]);
    return table(code(fg), ['On', 'Target', 'Light', 'Dark', 'Result'], rows, { num: [1, 2, 3] });
  }).join('\n\n');
  const worst = Math.min(...pairs.filter((p) => p.min === 7).flatMap((p) => [p.light.ratio, p.dark.ratio])).toFixed(2);
  pages['reference/contrast'] = page({
    title: 'Contrast pairs', weight: 2, toc: false, source: 'tokens/color.json',
    lede: `Every foreground and the surfaces it may sit on (\`codex.pairsWith\`), measured in both themes on every build: ${pairs.filter((p) => p.pass).length} of ${pairs.length} pairs pass.`,
    body: `## Targets\n\nReading text targets 7:1, metadata and status labels 4.5:1, and controls, focus and graphics 3:1. The lowest reading-text ratio is ${worst}:1. Each sample is drawn in the pair's own colours for that theme.\n\n## Pairs\n\n${pairTables}`,
  });

  // ---------------------------------------------------------------- reference: checker rules
  pages['reference/checker-rules'] = page({
    title: 'Checker rules', weight: 3, source: 'scripts/check.mjs',
    lede: `What the checker reports, and what to do instead. ${Object.keys(RULES).length - WARNINGS.size} rules fail the run; ${WARNINGS.size} warn without failing for now.`,
    body: `## Rules\n\n${table('Checker rules', ['Rule', 'Result', 'What to do'], Object.entries(RULES).map(([k, v]) => [code(k), WARNINGS.has(k) ? '<span class="cx-status cx-status--warning">Warns</span>' : '<span class="cx-status cx-status--danger">Fails</span>', text(v)]))}\n\n[Checking a project](/guide/checking/) says how to run it.`,
  });
  return pages;
}
