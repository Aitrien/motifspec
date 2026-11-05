// npm run docs — build motifspec.com from site/ into site/public, then index it for search.
//   1. Write site/data/generated/lastmod.json: the date each source file last changed in Git, for "Last updated".
//      (Pages are made from files outside site/, so Hugo's own Git info can't see them.)
//   2. Write the generated reference pages (scripts/docs-reference.mjs) to site/assets/generated/.
//   3. Build with Hugo, with the version from package.json (params.motifspec.version).
//   4. Index the built pages with Pagefind (search.md), into site/public/pagefind.
// Needs Hugo extended (0.146 or later) on the PATH. Extra arguments go to Hugo, such as --baseURL for a preview.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { referencePages } from './docs-reference.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

// One git call: walk the history newest first and keep the first date seen for each file.
const lastmod = {};
try {
  const log = execFileSync('git', ['log', '--format=@%cs', '--name-only', '--', 'README.md', 'CONVENTIONS.md', 'CHANGELOG.md', 'docs', 'tokens', 'icons/manifest.json', 'scripts/check.mjs'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let date = '';
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) date = line.slice(1);
    else if (line && !(line in lastmod)) lastmod[line] = date;
  }
} catch {
  console.warn('No Git history, so pages show no "Last updated".');
}
mkdirSync(join(SITE, 'data', 'generated'), { recursive: true });
writeFileSync(join(SITE, 'data', 'generated', 'lastmod.json'), JSON.stringify(lastmod, null, 2) + '\n');

const GEN = join(SITE, 'assets', 'generated');
rmSync(GEN, { recursive: true, force: true });
for (const [path, md] of Object.entries(referencePages())) {
  mkdirSync(dirname(join(GEN, path)), { recursive: true });
  writeFileSync(join(GEN, `${path}.md`), md);
}

const run = (cmd, args) => execFileSync(cmd, args, { cwd: SITE, stdio: 'inherit', env: { ...process.env, HUGO_PARAMS_MOTIFSPEC_VERSION: pkg.version } });
run('hugo', ['--gc', '--minify', '--panicOnWarning', ...process.argv.slice(2)]);
run(join(ROOT, 'node_modules', '.bin', 'pagefind'), ['--site', 'public', '--silent']);
console.log(`Built motifspec.com for MotifSpec ${pkg.version} in site/public.`);
