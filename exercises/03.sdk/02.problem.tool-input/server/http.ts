/**
 * Local entry: the server over Streamable HTTP at http://localhost:3001/mcp.
 * createMcpHandler speaks fetch (Request in, Response out), so this file only adapts
 * Node's http module to it. worker.ts does the same job on Cloudflare in fewer lines.
 */
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { ExpenseStore } from '@workshop/shared/expenses.ts';
import { createServer } from './server.ts';

const port = Number(process.env.PORT ?? 3001);

// One store for the life of the process, so a delete is still gone on the next request.
const store = new ExpenseStore();

// Read on every resources/read, so a rebuilt view shows up without restarting the server.
const viewHtml = () => readFile(new URL('../dist/mcp-app.html', import.meta.url), 'utf8');

const handler = createMcpHandler(() => createServer({ store, viewHtml }), {
  onerror: (err) => console.error('[mcp]', err.message)
});

// The workshop host runs on another port, so every response needs CORS headers.
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-expose-headers': '*'
};

http
  .createServer(async (req, res) => {
    if (req.method === 'OPTIONS') return void res.writeHead(204, cors).end();
    if (req.url !== '/mcp') return void res.writeHead(404, { ...cors, 'content-type': 'text/plain' }).end('The MCP endpoint is /mcp\n');
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const request = new Request(`http://localhost:${port}${req.url}`, {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks)
      });
      const response = await handler.fetch(request, {});
      res.writeHead(response.status, { ...Object.fromEntries(response.headers), ...cors });
      if (response.body) for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
      res.end();
    } catch (err) {
      console.error('[http]', err);
      if (!res.headersSent) res.writeHead(500, cors);
      res.end();
    }
  })
  .listen(port, () => console.log(`Expensify MCP server on http://localhost:${port}/mcp`));
