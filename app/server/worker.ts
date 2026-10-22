/**
 * Cloudflare Workers entry: the same createServer, deployed with `npm run deploy`.
 * Workers already speaks fetch, so createMcpHandler plugs straight in.
 *
 * The store lives in memory, per Worker instance. Fine for a demo; a real app would use D1 or KV,
 * and would add OAuth in front of /mcp before holding anyone's real expenses.
 */
import { createMcpHandler } from '@modelcontextprotocol/server';
import { ExpenseStore } from '@workshop/shared/expenses.ts';
// Built by `npm run build`. Wrangler bundles .html imports as text, so the view ships inside the Worker.
import viewHtml from '../dist/mcp-app.html';
import { createServer } from './server.ts';

const store = new ExpenseStore();
const handler = createMcpHandler(() => createServer({ store, viewHtml: () => viewHtml }));

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-expose-headers': '*'
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const { pathname } = new URL(request.url);
    if (pathname !== '/mcp') return new Response('The MCP endpoint is /mcp\n', { status: 404, headers: cors });
    const response = await handler.fetch(request, {});
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  }
};
