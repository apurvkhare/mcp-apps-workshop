//#file 6.1
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
//#step 6.1
const handler = createMcpHandler(() => createServer({ store, viewHtml: () => viewHtml }));
//#gap
// 🔨 6.1 Create the MCP handler, the same way http.ts does: createMcpHandler with a factory that calls createServer.
//    Here the view is not on disk. It is the viewHtml string imported above.
// 💡 createMcpHandler(() => createServer({ store, viewHtml: ... }))
// 🧠 createMcpHandler returns { fetch(request, ctx) }: a Request in, a Response out. That is already the shape
//    of a Worker, so this file has none of the Node plumbing in http.ts.
// 📖 https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/
//#end

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
//#step 6.1
    const response = await handler.fetch(request, {});
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(cors)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
//#gap
    // 🔨 6.1 (part 2) Hand the request to handler.fetch(request, {}), then return its response with the
    //    cors headers added, so the workshop host on another origin can read it.
    // 💡 new Headers(response.headers), set each cors header on it, then new Response(response.body, { status, headers })
    // 🧠 The server is stateless: every POST carries everything it needs, so any Worker instance, anywhere,
    //    can answer it. That is why the same code runs on localhost and at the edge without changes.
    // 📡 Point the workshop host at your workers.dev URL (or wrangler dev's localhost:8787) and call get_summary.
    // 🧪 npm test sends tools/list and resources/read through this fetch handler.
    return new Response('worker.ts is not finished yet (step 6.1).\n', { status: 501, headers: cors });
//#end
  }
};
