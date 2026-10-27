// npm run pack:check: prove the npm package contains what the README and package.json promise, and not the showcase.
// Runs `npm pack --dry-run`, so nothing is written or published.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib.mjs';

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const [report] = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: ROOT, encoding: 'utf8' }));
const files = new Set(report.files.map((f) => f.path));
const problems = [];

const want = [
  'package.json', 'README.md', 'LICENSE', 'CHANGELOG.md',
  ...Object.values(pkg.exports).filter((t) => !t.includes('*')).map((t) => t.replace(/^\.\//, '')),
  ...Object.values(pkg.bin),
  'icons/manifest.json', 'icons/LICENSE', 'tokens/size.json', 'docs/hugo.md', 'docs/components/_template.md',
  'layouts/_partials/motifspec/head.html', 'layouts/_markup/render-image.html',
];
for (const f of want) if (!files.has(f)) problems.push(`missing ${f}`);
// Every font the stylesheets point at, and each font's licence.
const css = ['codex.css', 'fonts.css'].map((f) => readFileSync(join(ROOT, 'dist', f), 'utf8')).join('\n');
for (const [, font] of css.matchAll(/url\("\.\.\/fonts\/([^"]+)"\)/g)) if (!files.has(`fonts/${font}`)) problems.push(`missing fonts/${font}, which the CSS loads`);
for (const f of files) if (f.startsWith('fonts/') && f.endsWith('.woff2') && ![...files].some((g) => g.startsWith('fonts/OFL-'))) problems.push(`${f} has no licence file`);
// What the checker imports must ship with it.
for (const [, dep] of readFileSync(join(ROOT, 'scripts', 'check.mjs'), 'utf8').matchAll(/from '\.\/([^']+)'/g)) if (!files.has(`scripts/${dep}`)) problems.push(`missing scripts/${dep}, which check.mjs imports`);
for (const f of ['dist/showcase.html', 'dist/showcase.standalone.html']) if (files.has(f)) problems.push(`${f} should not ship`);
if (!readFileSync(join(ROOT, 'scripts', 'check.mjs'), 'utf8').startsWith('#!/usr/bin/env node')) problems.push('scripts/check.mjs needs a #!/usr/bin/env node line to run as motifspec-check');

if (problems.length) {
  console.error(problems.map((p) => `::error::npm package: ${p}`).join('\n'));
  process.exit(1);
}
console.log(`${pkg.name}@${pkg.version}: ${files.size} files, ${(report.size / 1024).toFixed(1)} KB packed. Everything promised is in it.`);
