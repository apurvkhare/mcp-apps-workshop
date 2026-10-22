/**
 * 🧪 6.1 worker.ts serves the same MCP server through a fetch handler, the shape Cloudflare Workers runs.
 */
import { connectClient } from '@workshop/shared/test-server.ts';
import { describe, expect, test } from 'vitest';
import worker from '../server/worker.ts';
import { VIEW_URI } from '../server/server.ts';

describe('6.1 worker', () => {
  test('answers MCP on /mcp: tools/list and the view resource', async () => {
    const client = await connectClient((request) => worker.fetch(request));
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toContain('get_summary');
    const { contents } = await client.readResource({ uri: VIEW_URI });
    expect(contents[0]?.mimeType).toBe('text/html;profile=mcp-app');
  });

  test('adds CORS headers, so a host on another origin can read the response', async () => {
    const response = await worker.fetch(
      new Request('https://example.workers.dev/mcp', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} })
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('answers the CORS preflight, and 404s anything but /mcp', async () => {
    expect((await worker.fetch(new Request('https://example.workers.dev/mcp', { method: 'OPTIONS' }))).status).toBe(204);
    expect((await worker.fetch(new Request('https://example.workers.dev/'))).status).toBe(404);
  });
});
