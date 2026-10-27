// npm run audit — prove dist/showcase.html, dist/codex.js and dist/theme-init.js have no raw colour, size or duration values outside the generated :root block,
// and that the Hugo templates in layouts/ have no style attributes, raw colours, sizes or durations at all.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT } from './lib.mjs';

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;
// A number with a length or time unit. Zero is allowed (0px is not a size).
const RAW_UNIT = /(?<![\w.#-])-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|dvh|lvh|cqi|cqw|pt|pc|cm|mm|in|ms|s)\b/g;
const NAMED_COLOR = /(?<![\w-])(?:white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|pink|navy|teal)(?![\w-])/g;

// Breakpoint values the build writes into @media conditions (token(size.breakpoint.*) in css/components.css).
const sizes = JSON.parse(readFileSync(join(ROOT, 'tokens', 'size.json'), 'utf8'));
const BREAKPOINTS = new Set(Object.entries(sizes.primitive.size.breakpoint).filter(([k]) => !k.startsWith('$')).map(([, t]) => `${t.$value.value}${t.$value.unit}`));
const withoutBreakpoints = (css) => css.replace(/@media[^{]*\{/g, (cond) => cond.replace(/(\d+(?:\.\d+)?)(rem|px|em)\b/g, (v) => (BREAKPOINTS.has(v) ? 'breakpoint' : v)));

export function auditHtml(html) {
  const problems = [];
  const report = (where, text, m) => problems.push(`${where}: "${m}" in …${text.slice(Math.max(0, text.indexOf(m) - 40), text.indexOf(m) + m.length + 20).replace(/\s+/g, ' ')}…`);
  const check = (where, text) => {
    for (const re of [RAW_COLOR, RAW_UNIT, NAMED_COLOR]) {
      for (const m of text.match(re) ?? []) {
        if (RAW_UNIT === re && /^-?0+(?:\.0+)?[a-z]+$/.test(m)) continue;
        report(where, text, m);
      }
    }
  };

  // 1. <style> blocks, minus @font-face rules and the single token :root block.
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  let css = styles.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@font-face\s*\{[^}]*\}/g, '');
  const rootBlocks = css.match(/(^|\n):root\s*\{[\s\S]*?\n\}/g) ?? [];
  if (rootBlocks.length !== 1) problems.push(`expected exactly one token :root block, found ${rootBlocks.length}`);
  css = withoutBreakpoints(css.replace(rootBlocks[0] ?? '', ''));
  check('css', css);

  // 2. Inline style attributes.
  for (const m of html.matchAll(/\sstyle="([^"]*)"/g)) check('style attr', m[1]);

  // 3. SVG presentation colours must come from classes.
  for (const m of html.matchAll(/\s(fill|stroke|stop-color)="([^"]*)"/g)) {
    if (!/^(none|currentColor)$/.test(m[2])) problems.push(`svg ${m[1]}="${m[2]}"`);
  }

  // 4. Scripts: timers must read durations from tokens.
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  for (const m of scripts.match(/setTimeout\([^)]*?,\s*\d+\s*\)/g) ?? []) problems.push(`script literal timer: ${m}`);
  check('script', scripts.replace(/'0px 0px -70% 0px'/, ''));

  return problems;
}

// Templates take every value from classes, so any style attribute, raw colour or unit in them is a problem. The colour
// pattern skips fragment links such as href="#cx-icon-add".
const TEMPLATE_COLOR = /(?<![\w&/."-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g;
const STYLE_ATTR = /\sstyle\s*=/g;
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p); else if (p.endsWith('.html')) yield p;
  }
}
export function auditLayouts(dir) {
  const problems = [];
  for (const file of walk(dir)) {
    const rel = relative(ROOT, file);
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      for (const [re, what] of [[STYLE_ATTR, 'style attribute'], [TEMPLATE_COLOR, 'raw colour'], [RAW_UNIT, 'raw size or duration']]) {
        for (const m of line.matchAll(re)) {
          if (re === RAW_UNIT && /^-?0+(?:\.0+)?[a-z]+$/.test(m[0])) continue;
          problems.push(`${rel}:${i + 1}: ${what} "${m[0].trim()}"`);
        }
      }
    });
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const html = readFileSync(join(ROOT, 'dist', 'showcase.html'), 'utf8');
  const problems = auditHtml(html);
  // Sites load these files directly, so check them on their own as well as inlined in the showcase.
  for (const f of ['codex.js', 'theme-init.js']) {
    const js = readFileSync(join(ROOT, 'dist', f), 'utf8');
    const own = auditHtml(`<style>\n:root {\n}\n</style><script>${js}</script>`);
    problems.push(...own.map((p) => `dist/${f}: ${p}`));
  }
  problems.push(...auditLayouts(join(ROOT, 'layouts')));
  if (problems.length) { console.error(problems.map((p) => `✗ ${p}`).join('\n')); process.exit(1); }
  console.log('No raw colour, size or duration values outside the :root block (CSS, style attributes, SVG colours, scripts, dist/codex.js, dist/theme-init.js), and none at all in layouts/.');
}
