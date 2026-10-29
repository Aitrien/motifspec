// npm run mcp:bundle: build/mcp.zip, the Lambda deployment package. The server and its dependencies become one file at
// mcp/lambda.mjs, next to copies of the files it reads, in the repo's own layout, so scripts/lib.mjs finds them from
// there as it does here. index.mjs at the root is the handler infra/mcp.yml names (index.handler).
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import { ROOT } from '../scripts/lib.mjs';
import { FILES, missingFiles } from './server.mjs';

const OUT = join(ROOT, 'build', 'mcp');
const missing = missingFiles();
if (missing.length) throw new Error(`The server reads files that don't exist: ${missing.join(', ')}. Run npm run build first.`);

rmSync(join(ROOT, 'build'), { recursive: true, force: true });
await build({
  entryPoints: [join(ROOT, 'mcp', 'lambda.mjs')],
  outfile: join(OUT, 'mcp', 'lambda.mjs'),
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  minify: true,
  legalComments: 'linked',
  // Some dependencies are CommonJS and call require() for Node's built-ins, which an ES module bundle doesn't have.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: 'warning',
});
for (const f of FILES) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
writeFileSync(join(OUT, 'index.mjs'), "export { handler } from './mcp/lambda.mjs';\n");
execFileSync('zip', ['-qr', join(ROOT, 'build', 'mcp.zip'), '.'], { cwd: OUT });
console.log(`build/mcp.zip: the server bundle and ${FILES.length} data paths, ready for Lambda.`);
