// npm run test:mcp: calls the Lambda handler the way API Gateway does and checks every tool answers. CI runs this on
// every PR; the release workflow runs it on the bundle it deploys (MCP_HANDLER points at it).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { handler } = await import(process.env.MCP_HANDLER ? pathToFileURL(process.env.MCP_HANDLER).href : './lambda.mjs');
const { version } = (await import('../package.json', { with: { type: 'json' } })).default;

let id = 0;
async function rpc(method, params = {}) {
  const res = await handler({
    rawPath: '/mcp',
    requestContext: { http: { method: 'POST' } },
    headers: { host: 'mcp.motifspec.com', 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
    isBase64Encoded: false,
  });
  assert.equal(res.statusCode, 200, res.body);
  const msg = JSON.parse(res.body);
  assert.ok(!msg.error, JSON.stringify(msg.error));
  return msg.result;
}
const call = async (name, args = {}) => {
  const r = await rpc('tools/call', { name, arguments: args });
  assert.ok(!r.isError, r.content?.[0]?.text);
  return r.content[0].text;
};

test('initialize names the server and this version, with instructions', async () => {
  const r = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } });
  assert.equal(r.serverInfo.name, 'motifspec');
  assert.equal(r.serverInfo.version, version);
  assert.match(r.instructions, /get_rules/);
});

test('lists the five tools, all read-only', async () => {
  const { tools } = await rpc('tools/list');
  assert.deepEqual(tools.map((t) => t.name).sort(), ['check', 'find_tokens', 'get_component', 'get_doc', 'get_rules']);
  for (const t of tools) assert.equal(t.annotations?.readOnlyHint, true, t.name);
});

test('get_rules returns the README rules and what check enforces', async () => {
  const t = await call('get_rules');
  assert.match(t, /Use semantic tokens only/);
  assert.match(t, /check tool enforces/);
});

test('find_tokens matches every word, returns semantic tokens with values and surfaces', async () => {
  const hits = JSON.parse(await call('find_tokens', { query: 'text muted' }));
  const muted = hits.find((h) => h.name === 'color.text.muted');
  assert.ok(muted);
  assert.equal(muted.css, 'var(--cx-color-text-muted)');
  assert.ok(muted.valueDark && muted.sitsOn.length);
  assert.ok(hits.every((h) => !h.name.startsWith('primitive.')));
  assert.match(await call('find_tokens', { query: '' }), /^color\./m);
  assert.match(await call('find_tokens', { query: 'zzz-nothing' }), /No semantic token/);
});

test('get_component lists components, returns a doc with its Hugo partial, and handles unknown names', async () => {
  assert.match(await call('get_component'), /^project-card \[portfolio\]: /m);
  assert.match(await call('get_component'), /^callout \[shared\]: /m);
  const card = await call('get_component', { name: 'project-card' });
  assert.match(card, /cx-card/);
  assert.match(card, /motifspec\/|project-card\.html/);
  assert.match(await call('get_component', { name: 'nope' }), /No component "nope"/);
});

test('get_component returns one form of the markup when asked, and every JSX form compiles', async () => {
  const { transform } = await import('esbuild');
  const { readdirSync, readFileSync } = await import('node:fs');
  const { htmlToJsx } = await import('../scripts/lib.mjs');
  const all = await call('get_component', { name: 'project-card' });
  const html = await call('get_component', { name: 'project-card', form: 'html' });
  const jsx = await call('get_component', { name: 'project-card', form: 'jsx' });
  const hugo = await call('get_component', { name: 'project-card', form: 'hugo' });
  assert.match(all, /## In a Hugo site/);
  assert.doesNotMatch(html, /## In a Hugo site/);
  assert.ok(html.length < all.length, 'form "html" is shorter than the default answer');
  assert.match(hugo, /## In a Hugo site/);
  assert.match(jsx, /```jsx\n/);
  assert.match(jsx, /className="cx-card/);
  assert.doesNotMatch(jsx, /```html \{preview=true\}|\sclass="/);
  assert.match(await call('get_component', { name: 'backdrop', form: 'jsx' }), /written for Hugo, so it has no JSX form/);
  let compiled = 0;
  for (const f of readdirSync(new URL('../docs/components/', import.meta.url)).filter((x) => x.endsWith('.md'))) {
    const md = readFileSync(new URL(`../docs/components/${f}`, import.meta.url), 'utf8');
    for (const [, block] of md.matchAll(/```html \{preview=true\}\n([\s\S]*?)```/g)) {
      const out = htmlToJsx(block);
      if (out === null) continue;
      await assert.doesNotReject(transform(`export default () => (${out});`, { loader: 'jsx' }), `${f}: JSX form doesn't compile`);
      compiled++;
    }
  }
  assert.ok(compiled > 20, `compiled ${compiled} examples`);
});

test('get_doc returns the Hugo guide and every layout, and "templates" still returns the portfolio layout', async () => {
  assert.match(await call('get_doc', { name: 'hugo' }), /# Using MotifSpec in Hugo/);
  for (const [name, title] of [['portfolio', 'Portfolio layout'], ['dashboard', 'Dashboard layout'], ['documentation', 'Documentation layout'], ['a-la-carte', 'À la carte']]) {
    const doc = await call('get_doc', { name });
    assert.match(doc, new RegExp(`^# ${title}`));
    assert.match(doc, /## Choosing a stack/);
  }
  assert.match(await call('get_doc', { name: 'templates' }), /Catalogue numbers/);
});

test('check reports problems with rule and line, and passes clean markup', async () => {
  const bad = await call('check', { text: '<p class="cx-nope" style="color:#fff">x</p>', kind: 'html', file: 'a.html' });
  assert.match(bad, /a\.html:1: \[style-attribute\]/);
  assert.match(bad, /\[unknown-class\] "cx-nope"/);
  assert.match(await call('check', { text: '<article class="cx-card"></article>' }), /No problems/);
});

test('check warns about components from another layout, and holds à la carte CSS to tokens', async () => {
  const label = '<dl class="cx-label"><div class="cx-label__id"><dt>No.</dt><dd>LM-W-001</dd></div></dl>';
  assert.match(await call('check', { text: label }), /^No problems/);
  const dash = await call('check', { text: label, layout: 'dashboard' });
  assert.match(dash, /^No problems: checked against MotifSpec [\d.]+, dashboard layout\./);
  assert.match(dash, /warning\(s\):\n.*\[wrong-layout\] "cx-label \(accession-label\.md: portfolio; this project is dashboard\)"/);
  assert.match(await call('check', { text: label, layout: 'portfolio' }), /^No problems[^\n]*\.$/);
  // A doc's example may show other components' classes; only the classes a component owns (DOC_SELECTORS) are its own.
  const page = '<div class="cx-page-head"><h1>Overview</h1><p class="cx-lede">x</p><p class="cx-meta">y</p></div>';
  assert.doesNotMatch(await call('check', { text: page, layout: 'portfolio' }), /warning/);
  assert.match(await call('check', { text: '<nav class="cx-docs-nav"></nav>', layout: 'portfolio' }), /\[wrong-layout\] "cx-docs-nav \(docs-shell\.md: documentation/);
  const toc = '<nav class="cx-toc"></nav>';
  assert.match(await call('check', { text: toc, layout: 'a-la-carte' }), /\[unlisted-component\] "cx-toc/);
  assert.doesNotMatch(await call('check', { text: toc, layout: 'a-la-carte', components: ['table-of-contents'] }), /warning/);
  const css = await call('check', { text: '.stage { inset: 0; padding: var(--cx-space-inset-md); }\n.cx-button { color: red; }', kind: 'css' });
  assert.match(css, /\[cx-override\] "\.cx-button"/);
  assert.doesNotMatch(css, /\.stage/);
});

test('a project declares its layout in its Hugo config, and the CLI exits 0 on warnings only', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { checkProject, declaredLayout } = await import('../scripts/check.mjs');
  const root = mkdtempSync(join(tmpdir(), 'motifspec-'));
  mkdirSync(join(root, 'layouts'));
  writeFileSync(join(root, 'layouts', 'a.html'), '<article class="cx-card"></article>');
  assert.deepEqual(checkProject(root), []);
  writeFileSync(join(root, 'hugo.toml'), '[params]\n  role = "x"\n[params.motifspec]\n  layout = "dashboard"\n');
  assert.equal(declaredLayout(root).layout, 'dashboard');
  const problems = checkProject(root);
  assert.deepEqual(problems.map((p) => [p.rule, p.severity]), [['wrong-layout', 'warning']]);
  writeFileSync(join(root, 'hugo.toml'), '[params.motifspec]\n  layout = "a-la-carte"\n  components = ["project-card"]\n');
  writeFileSync(join(root, 'frame.css'), '.frame { inset: 0; }\n');
  assert.deepEqual(checkProject(root), []);
  writeFileSync(join(root, 'hugo.toml'), '[params.motifspec]\n  layout = "kiosk"\n');
  assert.deepEqual(checkProject(root).map((p) => p.rule), ['unknown-layout']);
  // Every way Hugo TOML can say it: an indented table, dotted keys, an inline table, multi-line arrays with comments.
  for (const toml of [
    'title = "x"\n[params]\n  role = "x"\n  [params.motifspec]\n    layout = "dashboard"\n[module]\n  x = 1\n',
    '[params]\n  motifspec.layout = "dashboard"\n',
    'params.motifspec.layout = "dashboard"\n[module]\n',
    '[params]\n  motifspec = { layout = "dashboard" }\n',
  ]) {
    writeFileSync(join(root, 'hugo.toml'), toml);
    assert.equal(declaredLayout(root).layout, 'dashboard', toml);
  }
  writeFileSync(join(root, 'hugo.toml'), '[params]\n  [params.motifspec]\n    layout = "a-la-carte"\n    components = [\n      "project-card", # the case studies\n      "tag",\n    ]\n');
  assert.deepEqual(declaredLayout(root).components, ['project-card', 'tag']);
  writeFileSync(join(root, 'hugo.toml'), '[params]\n  motifspec = { layout = "a-la-carte", components = ["project-card"] }\n');
  assert.deepEqual(declaredLayout(root), { layout: 'a-la-carte', components: ['project-card'], from: 'hugo.toml' });
});

test('clients that are strict about the transport connect too', async () => {
  const at = (method, headers = {}, body) => handler({ rawPath: '/mcp', requestContext: { http: { method } }, headers: { host: 'mcp.motifspec.com', ...headers }, body, isBase64Encoded: false });
  const init = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } } });
  // A GET (the notification stream) and a DELETE (ending a session) answer 405 straight away; no stream is held open.
  for (const m of ['GET', 'DELETE']) {
    const r = await Promise.race([at(m, { accept: 'text/event-stream' }), new Promise((res) => setTimeout(() => res({ statusCode: 'timeout' }), 1000))]);
    assert.equal(r.statusCode, 405, m);
    assert.match(r.headers.allow, /POST/);
  }
  // Any Accept header gets the JSON answer instead of 406.
  for (const accept of ['application/json', '*/*', undefined]) {
    const r = await at('POST', { 'content-type': 'application/json', ...(accept ? { accept } : {}) }, init);
    assert.equal(r.statusCode, 200, String(accept));
    assert.equal(JSON.parse(r.body).result.serverInfo.name, 'motifspec');
  }
  // A browser's CORS preflight is allowed, and answers carry the CORS headers.
  const pre = await at('OPTIONS', { origin: 'https://example.com', 'access-control-request-method': 'POST' });
  assert.equal(pre.statusCode, 204);
  assert.equal(pre.headers['access-control-allow-origin'], '*');
  const r = await at('POST', { 'content-type': 'application/json', accept: 'application/json, text/event-stream', origin: 'https://example.com' }, init);
  assert.equal(r.headers['access-control-allow-origin'], '*');
});

test('other paths answer plainly', async () => {
  const root = await handler({ rawPath: '/', requestContext: { http: { method: 'GET' } }, headers: {} });
  assert.equal(root.statusCode, 200);
  assert.match(root.body, /MCP server/);
  assert.equal((await handler({ rawPath: '/x', requestContext: { http: { method: 'GET' } }, headers: {} })).statusCode, 404);
});
