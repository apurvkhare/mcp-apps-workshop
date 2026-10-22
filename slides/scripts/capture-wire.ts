/**
 * Captures the real JSON-RPC traffic between an MCP client (SDK 2.3.1, declaring the MCP Apps
 * extension like a host does) and the finished Expensify server, in process, with no network.
 * The client comes from shared/src/test-server.ts, which pins protocol 2026-07-28: the capture
 * starts with server/discover, and every request carries the _meta envelope and mcp-* headers.
 * The section 1 slides quote this output, trimmed.
 *
 *   cd slides && npm run wire          (or: npx tsx slides/scripts/capture-wire.ts from the repo root)
 */
import { createMcpHandler } from '@modelcontextprotocol/server';
import { ExpenseStore } from '@workshop/shared/expenses.ts';
import { connectClient } from '@workshop/shared/test-server.ts';
import { createServer } from '../../app/server/server.ts';

const store = new ExpenseStore();
const handler = createMcpHandler(() => createServer({ store, viewHtml: () => '<!doctype html><html>…the built view…</html>' }));

const log = (dir: string, label: string, body: string) => {
  if (!body) return;
  console.log(`\n${dir} ${label}`);
  // Streamable HTTP may answer with SSE: print only the data lines.
  const json = body.startsWith('event:') || body.startsWith('data:') ? body.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n') : body;
  try {
    console.log(JSON.stringify(JSON.parse(json), null, 2));
  } catch {
    console.log(json);
  }
};

const client = await connectClient(async (request) => {
  const reqBody = request.method === 'POST' ? await request.clone().text() : '';
  log('>>>', `${request.method} /mcp  ${[...request.headers].filter(([k]) => k.startsWith('mcp-') || k === 'accept' || k === 'content-type').map(([k, v]) => `${k}: ${v}`).join('  ')}`, reqBody || '(no body)');
  const response = await handler.fetch(request, {});
  const resBody = await response.clone().text();
  log('<<<', `${response.status} ${response.headers.get('content-type') ?? ''}`, resBody || '(no body)');
  return response;
});

await client.listTools();
await client.callTool({ name: 'get_summary', arguments: { from: '2026-10-01', to: '2026-10-31', groupBy: 'category' } });
await client.readResource({ uri: 'expenses://categories' });
await client.readResource({ uri: 'ui://expensify/dashboard.html' });
await client.getPrompt({ name: 'monthly_review', arguments: { month: '2026-10' } });
await client.listResources();
await client.close();
