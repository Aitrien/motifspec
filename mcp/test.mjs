// npm run test:mcp: calls the Lambda handler the way API Gateway does and checks every tool answers. CI runs this on
// every PR; the release workflow runs it on the bundle it deploys (MCP_HANDLER points at it).
import assert from 'node:assert/strict';
import { test } from 'node:test';
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
  assert.match(await call('get_component'), /^project-card: /m);
  const card = await call('get_component', { name: 'project-card' });
  assert.match(card, /cx-card/);
  assert.match(card, /motifspec\/|project-card\.html/);
  assert.match(await call('get_component', { name: 'nope' }), /No component "nope"/);
});

test('get_doc returns the Hugo guide and the templates', async () => {
  assert.match(await call('get_doc', { name: 'hugo' }), /# Using MotifSpec in Hugo/);
  assert.match(await call('get_doc', { name: 'templates' }), /Catalogue numbers/);
});

test('check reports problems with rule and line, and passes clean markup', async () => {
  const bad = await call('check', { text: '<p class="cx-nope" style="color:#fff">x</p>', kind: 'html', file: 'a.html' });
  assert.match(bad, /a\.html:1: \[style-attribute\]/);
  assert.match(bad, /\[unknown-class\] "cx-nope"/);
  assert.match(await call('check', { text: '<article class="cx-card"></article>' }), /No problems/);
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
