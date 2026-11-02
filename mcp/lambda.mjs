// AWS Lambda handler for the MotifSpec MCP server, behind an API Gateway HTTP API (payload format 2.0) at
// https://mcp.motifspec.com/mcp. Stateless: every request gets a fresh server and transport, and replies with JSON,
// so nothing is kept between requests and any Lambda instance can answer any request. infra/mcp.yml defines the stack.
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer, load } from './server.mjs';

const PATH = '/mcp';
// Read-only and without sign-in, so any origin may call it: browser-based clients send a CORS preflight first.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization, mcp-protocol-version, mcp-session-id, last-event-id',
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version',
  'access-control-max-age': '86400',
};

/** The API Gateway event as a web Request. */
function toRequest(event) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(event.headers ?? {})) headers.set(k, v);
  // Every answer is JSON, so a client that accepts only JSON, anything, or says nothing is served the same way. The
  // transport otherwise answers 406 unless both JSON and an event stream are listed.
  const accept = headers.get('accept') ?? '';
  if (!(accept.includes('application/json') && accept.includes('text/event-stream'))) headers.set('accept', 'application/json, text/event-stream');
  if (event.cookies?.length) headers.set('cookie', event.cookies.join('; '));
  const host = headers.get('host') ?? 'mcp.motifspec.com';
  const query = event.rawQueryString ? `?${event.rawQueryString}` : '';
  const method = event.requestContext?.http?.method ?? 'GET';
  const body = event.body == null || method === 'GET' || method === 'HEAD'
    ? undefined
    : event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  return new Request(`https://${host}${event.rawPath ?? '/'}${query}`, { method, headers, body });
}

/** A web Response as the API Gateway result. */
async function toResult(res) {
  const headers = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  return { statusCode: res.status, headers, body: await res.text() };
}

const plain = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'text/plain; charset=utf-8' }, body });

export async function handler(event) {
  const path = event.rawPath ?? '/';
  if (path !== PATH) {
    return path === '/'
      ? plain(200, `MotifSpec ${load().version} MCP server. Connect an MCP client to https://mcp.motifspec.com${PATH}.`)
      : plain(404, 'Not found.');
  }
  // Stateless: there is no stream for server notifications and no session to end, so a GET (which opens that stream)
  // or a DELETE gets 405 at once, as the spec allows. Left to the transport, a GET waited out the Lambda timeout.
  const method = event.requestContext?.http?.method ?? 'GET';
  if (method === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (method !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...CORS, allow: 'POST, OPTIONS', 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed: this server is stateless and answers POST only.' }, id: null }),
    };
  }
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    const result = await toResult(await transport.handleRequest(toRequest(event)));
    return { ...result, headers: { ...CORS, ...result.headers } };
  } finally {
    await server.close();
  }
}
