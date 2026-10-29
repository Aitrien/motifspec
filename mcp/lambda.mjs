// AWS Lambda handler for the MotifSpec MCP server, behind an API Gateway HTTP API (payload format 2.0) at
// https://mcp.motifspec.com/mcp. Stateless: every request gets a fresh server and transport, and replies with JSON,
// so nothing is kept between requests and any Lambda instance can answer any request. infra/mcp.yml defines the stack.
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createServer, load } from './server.mjs';

const PATH = '/mcp';

/** The API Gateway event as a web Request. */
function toRequest(event) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(event.headers ?? {})) headers.set(k, v);
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
  const server = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    return await toResult(await transport.handleRequest(toRequest(event)));
  } finally {
    await server.close();
  }
}
