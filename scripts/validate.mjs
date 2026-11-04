// npm run validate — naming rules, tiers, aliases, value shapes and every contrast pair in both themes.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadTokens, validate, contrastReport } from './lib.mjs';

const { tokens, errors: loadErrors } = loadTokens();
const errors = [...loadErrors, ...validate(tokens)];

// Component docs follow docs/components/_template.md and only list semantic tokens that exist.
const SECTIONS = ['## When to use', '## When not to use', '## Markup', '```html preview', '## Do', "## Don't", '## Accessibility'];
const docsDir = join(ROOT, 'docs', 'components');
// The layouts a component can belong to: one file each in docs/layouts/, except à la carte, which has no components of its own.
const LAYOUTS = readdirSync(join(ROOT, 'docs', 'layouts')).filter((f) => f.endsWith('.md') && f !== 'a-la-carte.md').map((f) => f.replace(/\.md$/, ''));
for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const doc = readFileSync(join(docsDir, file), 'utf8');
  const fm = doc.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) { errors.push(`docs/components/${file}: no front matter`); continue; }
  const name = fm[1].match(/^name: (.+)$/m)?.[1];
  if (name !== file.replace(/\.md$/, '')) errors.push(`docs/components/${file}: name "${name}" does not match file name`);
  if (!/^status: (draft|stable|deprecated)\b/m.test(fm[1])) errors.push(`docs/components/${file}: status must be draft, stable or deprecated`);
  const layouts = fm[1].match(/^layouts: \[(.*)\]\s*(?:#.*)?$/m)?.[1].split(',').map((l) => l.trim()).filter(Boolean);
  if (!layouts?.length) errors.push(`docs/components/${file}: needs "layouts: [shared]" or the layouts it belongs to (docs/layouts/)`);
  else if (layouts.includes('shared') ? layouts.length > 1 : layouts.some((l) => !LAYOUTS.includes(l))) errors.push(`docs/components/${file}: layouts must be [shared] or any of ${LAYOUTS.join(', ')}`);
  for (const t of fm[1].match(/^  - (.+)$/gm) ?? []) {
    const path = t.slice(4).trim();
    if (path !== 'AUTO' && (!tokens.has(path) || tokens.get(path).tier !== 'semantic')) errors.push(`docs/components/${file}: tokens lists unknown or non-semantic ${path}`);
  }
  let at = 0;
  for (const s of SECTIONS) {
    const i = doc.indexOf(s, at);
    if (i < 0) errors.push(`docs/components/${file}: missing or out-of-order "${s}"`); else at = i;
  }
  if (!/^# .+/m.test(doc)) errors.push(`docs/components/${file}: missing title`);
}
// Ornament glyph catalogue: unique, kebab-case keys, never a forbidden glyph.
const glyphs = tokens.get('font.family.ornament')?.extensions['codex.glyphs'];
if (glyphs) {
  const seen = new Map();
  for (const [key, g] of Object.entries(glyphs.glyphs)) {
    if (!/^[a-z]+(?:-[a-z]+)*$/.test(key)) errors.push(`codex.glyphs: key "${key}" is not kebab-case`);
    if (!glyphs.groups[g.group]) errors.push(`codex.glyphs: ${key} has unknown group "${g.group}"`);
    if (glyphs.forbidden.chars.includes(g.char)) errors.push(`codex.glyphs: ${key} uses forbidden glyph "${g.char}"`);
    if (seen.has(g.char)) errors.push(`codex.glyphs: ${key} and ${seen.get(g.char)} share "${g.char}"`);
    seen.set(g.char, key);
  }
}
// Deprecated tokens stay published but nothing in the system may use them.
const deprecated = [...tokens.values()].filter((t) => t.deprecated !== undefined);
for (const f of ['css/components.css', 'syntax/chroma.json', 'js/codex.js', 'js/plate.js', 'showcase/showcase.css', 'showcase/index.src.html']) {
  let text; try { text = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
  for (const t of deprecated) {
    const css = `--cx-${t.path.replace(/\./g, '-')}`;
    if (new RegExp(`${css}(?![\\w-])|"${t.path.replace(/\./g, '\\.')}"`).test(text)) errors.push(`${f}: uses deprecated ${t.path} (${t.deprecated})`);
  }
}
for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const fm = readFileSync(join(docsDir, file), 'utf8').match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  for (const t of deprecated) if (fm.includes(`  - ${t.path}\n`)) errors.push(`docs/components/${file}: lists deprecated ${t.path}`);
}
const pairs = contrastReport(tokens);
const failing = pairs.filter((p) => !p.pass);

for (const e of errors) console.error(`✗ ${e}`);
for (const p of failing) {
  console.error(`✗ contrast ${p.fg} on ${p.bg}: light ${p.light.ratio.toFixed(2)}, dark ${p.dark.ratio.toFixed(2)} (min ${p.min})`);
}
const semantic = [...tokens.values()].filter((t) => t.tier === 'semantic').length;
console.log(`${tokens.size} tokens (${semantic} semantic, ${deprecated.length} deprecated), ${pairs.length} contrast pairs × 2 themes.`);
if (errors.length || failing.length) {
  console.error(`${errors.length} rule errors, ${failing.length} failing pairs.`);
  process.exit(1);
}
console.log('All naming rules pass. All component docs follow the template. All contrast pairs meet their targets in light and dark.');
