// npm run docs:quality — Lighthouse's accessibility audit on motifspec.com (R19 in the layouts plan), after npm run docs.
// Serves site/public locally and audits the landing page, an article, a component page and the tokens page, at
// Lighthouse's phone size. Every page must score 100; the failing audits are listed otherwise. Needs Chrome or Chromium (CHROME_PATH if it isn't found) and npx.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'site', 'public');
const LIGHTHOUSE = 'lighthouse@13.5.0';
const PAGES = ['/', '/guide/getting-started/', '/components/status/', '/reference/tokens/'];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.md': 'text/markdown', '.txt': 'text/plain' };

if (!existsSync(join(PUBLIC, 'index.html'))) { console.error('No site/public: run npm run docs first.'); process.exit(1); }

const server = createServer((req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(PUBLIC, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(PUBLIC) || !existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

let failed = 0;
for (const page of PAGES) {
  {
    const out = join(tmpdir(), `lh-${Date.now()}.json`);
    const flags = ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'];
    try {
      // Asynchronous, so this process keeps serving the pages while Lighthouse loads them.
      await run('npx', ['--yes', LIGHTHOUSE, `${base}${page}`, '--only-categories=accessibility', '--output=json', `--output-path=${out}`, '--quiet', `--chrome-flags=${flags.join(' ')}`], { maxBuffer: 64 * 1024 * 1024 });
    } catch { /* Lighthouse exits non-zero on some page errors; the report says what happened. */ }
    if (!existsSync(out)) { failed++; console.error(`✗ ${page}: Lighthouse wrote no report`); continue; }
    const report = JSON.parse(readFileSync(out, 'utf8'));
    const score = Math.round((report.categories.accessibility.score ?? 0) * 100);
    const label = page;
    if (score === 100) { console.log(`✓ ${label}: 100`); continue; }
    failed++;
    console.error(`✗ ${label}: ${score}`);
    for (const a of Object.values(report.audits)) {
      if (a.score === 0 && report.categories.accessibility.auditRefs.some((r) => r.id === a.id)) {
        console.error(`  ${a.id}: ${a.title}`);
        for (const item of (a.details?.items ?? []).slice(0, 5)) console.error(`    ${item.node?.snippet ?? ''}`);
      }
    }
  }
}
server.close();
if (failed) { console.error(`${failed} of ${PAGES.length} pages scored under 100 for accessibility.`); process.exit(1); }
console.log(`Accessibility 100 on all ${PAGES.length} pages.`);
