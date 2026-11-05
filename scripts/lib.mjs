// Shared token tooling for MotifSpec: load, flatten, resolve, validate, contrast.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const PREFIX = 'cx';

/** Category prefix each token file may define (CONVENTIONS.md). */
export const FILE_CATEGORY = {
  'color.json': 'color',
  'typography.json': 'font',
  'space.json': 'space',
  'size.json': 'size',
  'radius.json': 'radius',
  'border.json': 'border',
  'motion.json': 'motion',
};

const SEGMENT = /^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*|[0-9]+)$/;
const MAX_DEPTH = 4;
const ALIAS = /^\{([^{}]+)\}$/;

/** Load every token file and flatten into a Map(path -> token). */
export function loadTokens(dir = join(ROOT, 'tokens')) {
  const tokens = new Map();
  const errors = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    walk(json, [], undefined, file);
  }
  function walk(node, path, inheritedType, file) {
    const type = node.$type ?? inheritedType;
    if ('$value' in node) {
      const p = path.join('.');
      if (tokens.has(p)) errors.push(`${p}: defined twice`);
      tokens.set(p, {
        path: p,
        segments: path,
        file,
        type,
        value: node.$value,
        description: node.$description,
        deprecated: node.$deprecated,
        extensions: node.$extensions ?? {},
        tier: path[0] === 'primitive' ? 'primitive' : 'semantic',
      });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, [...path, k], type, file);
      else errors.push(`${[...path, k].join('.')}: not a token or group`);
    }
  }
  return { tokens, errors };
}

export const isAlias = (v) => typeof v === 'string' && ALIAS.test(v);
export const aliasTarget = (v) => v.match(ALIAS)[1];

/** Follow aliases to a raw $value. */
export function resolve(tokens, value, seen = []) {
  if (!isAlias(value)) return value;
  const target = aliasTarget(value);
  if (seen.includes(target)) throw new Error(`alias cycle: ${[...seen, target].join(' -> ')}`);
  const t = tokens.get(target);
  if (!t) throw new Error(`unresolved alias {${target}}`);
  return resolve(tokens, t.value, [...seen, target]);
}

/** Resolved value of a token in a mode ('light' | 'dark'). */
export function resolveIn(tokens, path, mode = 'light') {
  const t = tokens.get(path);
  if (!t) throw new Error(`unknown token ${path}`);
  const dark = t.extensions['codex.modes']?.dark;
  return resolve(tokens, mode === 'dark' && dark ? dark : t.value);
}

export const cssVar = (path) => `--${PREFIX}-${path.replace(/\./g, '-')}`;

// ------------------------------------------------------------------ value shapes (DTCG 2025.10)
const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
const SHAPES = {
  color: (v) => v && v.colorSpace === 'srgb' && Array.isArray(v.components) && v.components.length === 3 &&
    v.components.every((c) => isNum(c) && c >= 0 && c <= 1) && (!v.hex || /^#[0-9a-f]{6}$/.test(v.hex)),
  dimension: (v) => v && isNum(v.value) && ['px', 'rem'].includes(v.unit),
  duration: (v) => v && isNum(v.value) && ['ms', 's'].includes(v.unit),
  cubicBezier: (v) => Array.isArray(v) && v.length === 4 && v.every(isNum) && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1,
  fontFamily: (v) => typeof v === 'string' || (Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === 'string')),
  fontWeight: (v) => isNum(v) && v >= 1 && v <= 1000,
  number: isNum,
};

/** Validate naming rules, tiers, descriptions, aliases, modes and value shapes. */
export function validate(tokens) {
  const errors = [];
  for (const t of tokens.values()) {
    const { path, segments } = t;
    const depth = segments.length;
    // Naming: kebab-case or integers, max 4 segments counting the `primitive` group.
    segments.forEach((s) => { if (!SEGMENT.test(s)) errors.push(`${path}: segment "${s}" is not kebab-case or an integer`); });
    if (depth > MAX_DEPTH) errors.push(`${path}: ${depth} segments (max ${MAX_DEPTH})`);
    if (/[0-9a-f]{6}/i.test(path)) errors.push(`${path}: raw value in name`);
    // Category matches file.
    const category = FILE_CATEGORY[t.file];
    const cat = t.tier === 'primitive' ? segments[1] : segments[0];
    const okCat = t.file === 'size.json' && t.tier === 'primitive' ? cat === 'size' : cat === category;
    if (!okCat) errors.push(`${path}: category "${cat}" does not belong in ${t.file} (expected "${category}")`);
    // Type and shape.
    if (!t.type) { errors.push(`${path}: no $type`); continue; }
    if (!SHAPES[t.type]) errors.push(`${path}: unsupported $type ${t.type}`);
    // Tiers.
    if (t.tier === 'primitive') {
      if (t.extensions['codex.tier'] !== 'primitive') errors.push(`${path}: primitive without $extensions["codex.tier"] = "primitive"`);
      if (isAlias(t.value)) errors.push(`${path}: primitives must hold raw values, not aliases`);
    } else {
      if (!t.description || t.description.length < 12) errors.push(`${path}: semantic token needs a usage-rule $description`);
      if (!isAlias(t.value)) errors.push(`${path}: semantic tokens must reference a primitive`);
      else if (!aliasTarget(t.value).startsWith('primitive.')) errors.push(`${path}: semantic tokens must reference primitives, not {${aliasTarget(t.value)}}`);
    }
    // Resolution and shape.
    try {
      const v = resolve(tokens, t.value);
      if (SHAPES[t.type] && !SHAPES[t.type](v)) errors.push(`${path}: $value does not match DTCG ${t.type} shape`);
      const target = isAlias(t.value) ? tokens.get(aliasTarget(t.value)) : null;
      if (target && target.type !== t.type) errors.push(`${path}: type ${t.type} aliases ${target.path} of type ${target.type}`);
    } catch (e) { errors.push(`${path}: ${e.message}`); }
    // Modes.
    const dark = t.extensions['codex.modes']?.dark;
    if (dark !== undefined) {
      if (!isAlias(dark) || !tokens.has(aliasTarget(dark))) errors.push(`${path}: codex.modes.dark must alias an existing token`);
      else if (tokens.get(aliasTarget(dark)).type !== t.type) errors.push(`${path}: dark alias type mismatch`);
    }
    if (t.tier === 'semantic' && t.type === 'color' && dark === undefined) errors.push(`${path}: semantic colour has no codex.modes.dark`);
    // Deprecation (DTCG $deprecated): a semantic token kept for one more major, with a reason.
    if (t.deprecated !== undefined) {
      if (t.tier === 'primitive') errors.push(`${path}: deprecate the semantic token, not the primitive`);
      if (typeof t.deprecated !== 'string' || t.deprecated.length < 12) errors.push(`${path}: $deprecated must be a sentence saying why and when it goes`);
    }
    // Pairs.
    for (const pair of t.extensions['codex.pairsWith'] ?? []) {
      if (!tokens.has(pair.token)) errors.push(`${path}: pairsWith unknown token ${pair.token}`);
      if (!isNum(pair.min)) errors.push(`${path}: pairsWith ${pair.token} needs a numeric min`);
    }
  }
  return errors;
}

// ------------------------------------------------------------------ contrast (WCAG 2.x)
export const hexOf = (c) => c.hex ?? '#' + c.components.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
function luminance(c) {
  const [r, g, b] = c.components.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Every declared pair, measured in both modes. */
export function contrastReport(tokens) {
  const rows = [];
  for (const t of tokens.values()) {
    for (const pair of t.extensions['codex.pairsWith'] ?? []) {
      const r = {};
      for (const mode of ['light', 'dark']) {
        const fg = resolveIn(tokens, t.path, mode);
        const bg = resolveIn(tokens, pair.token, mode);
        r[mode] = { ratio: ratio(fg, bg), fg: hexOf(fg), bg: hexOf(bg) };
      }
      rows.push({ fg: t.path, bg: pair.token, min: pair.min, ...r, pass: r.light.ratio >= pair.min && r.dark.ratio >= pair.min });
    }
  }
  return rows;
}

// ------------------------------------------------------------------ JSX: the components' markup for React and similar
// HTML attribute names that differ in JSX. Anything else (aria-*, data-*, viewBox, href) keeps its name.
const JSX_NAMES = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', datetime: 'dateTime', readonly: 'readOnly', maxlength: 'maxLength',
  minlength: 'minLength', colspan: 'colSpan', rowspan: 'rowSpan', autocomplete: 'autoComplete', autofocus: 'autoFocus',
  inputmode: 'inputMode', enterkeyhint: 'enterKeyHint', spellcheck: 'spellCheck', srcset: 'srcSet', crossorigin: 'crossOrigin',
  novalidate: 'noValidate', accesskey: 'accessKey', contenteditable: 'contentEditable', fetchpriority: 'fetchPriority',
  'text-anchor': 'textAnchor', 'marker-end': 'markerEnd', 'marker-start': 'markerStart', 'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', 'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule', 'clip-rule': 'clipRule', 'vector-effect': 'vectorEffect', 'xlink:href': 'href',
};
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const FORM_FIELDS = new Set(['input', 'textarea', 'select']);
const ATTR = /\s*([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;

/**
 * A component's HTML example as JSX, converted mechanically: renamed attributes, void elements closed, comments as
 * {/* *\/}, braces in text escaped, uncontrolled form values as defaultValue and defaultChecked, and more than one root
 * wrapped in a fragment. Returns null for an example written in Hugo template syntax ({{ }}), which has no JSX form.
 */
export function htmlToJsx(html) {
  if (html.includes('{{')) return null;
  let roots = 0;
  let depth = 0;
  const out = [];
  let last = 0;
  const text = (t) => {
    if (depth === 0 && t.trim()) roots++;
    return t.replace(/[{}]/g, (b) => `{'${b}'}`);
  };
  for (const m of html.matchAll(/<!--([\s\S]*?)-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)\s*(\/?)>/g)) {
    out.push(text(html.slice(last, m.index)));
    last = m.index + m[0].length;
    if (m[1] !== undefined) { if (depth === 0) roots++; out.push(`{/*${m[1].replace(/\*\//g, '* /')}*/}`); continue; }
    const [, , closing, tag, attrs = '', selfClosed] = m;
    if (closing) { depth--; out.push(`</${tag}>`); continue; }
    if (depth === 0) roots++;
    const parts = [...attrs.matchAll(ATTR)].filter((a) => a[1]).map(([, name, value]) => {
      let n = JSX_NAMES[name.toLowerCase()] ?? name;
      if (FORM_FIELDS.has(tag) && n === 'value') n = 'defaultValue';
      if (FORM_FIELDS.has(tag) && n === 'checked') n = 'defaultChecked';
      if (FORM_FIELDS.has(tag) && n === 'selected') n = 'defaultValue';
      if (value === undefined) return n;
      return `${n}=${/^["']/.test(value) ? value : `"${value}"`}`;
    });
    const isVoid = VOID.has(tag.toLowerCase()) || selfClosed;
    if (!isVoid) depth++;
    out.push(`<${tag}${parts.length ? ' ' + parts.join(' ') : ''}${isVoid ? ' />' : '>'}`);
  }
  out.push(text(html.slice(last)));
  const jsx = out.join('').trim();
  return roots > 1 ? `<>\n${jsx}\n</>` : jsx;
}

/** A component doc with each ```html {preview=true} example replaced by its JSX form (see htmlToJsx). */
export function docAsJsx(md) {
  return md.replace(/```html \{preview=true\}\n([\s\S]*?)```/g, (block, html) => {
    const jsx = htmlToJsx(html);
    return jsx === null
      ? `This example is written for Hugo, so it has no JSX form. Outside Hugo, use the files the README's npm table lists.\n\n${block}`
      : `\`\`\`jsx\n${jsx}\n\`\`\``;
  });
}
