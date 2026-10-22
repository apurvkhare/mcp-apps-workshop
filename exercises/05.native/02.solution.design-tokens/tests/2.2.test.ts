/**
 * 🧪 2.2 get_summary points at the view with _meta.ui.resourceUri, and still returns its data.
 */
import { connect, toolUi } from '@workshop/shared/test-server.ts';
import { describe, expect, test } from 'vitest';
import { createServer, VIEW_URI } from '../server/server.ts';

describe('2.2 app tool', () => {
  test('get_summary has _meta.ui.resourceUri set to the view', async () => {
    const { client } = await connect(createServer);
    const { tool, ui } = await toolUi(client, 'get_summary');
    expect(tool, 'get_summary is missing from tools/list').toBeDefined();
    expect(ui?.resourceUri, 'get_summary has no _meta.ui.resourceUri').toBe(VIEW_URI);
  });

  test('the resourceUri points at a resource that exists', async () => {
    const { client } = await connect(createServer);
    const { ui } = await toolUi(client, 'get_summary');
    const { contents } = await client.readResource({ uri: ui!.resourceUri! });
    expect(contents[0]?.mimeType).toBe('text/html;profile=mcp-app');
  });

  test('get_summary still returns text for the model and structuredContent for the view', async () => {
    const { client } = await connect(createServer);
    const result = await client.callTool({ name: 'get_summary', arguments: { groupBy: 'category' } });
    expect(result.isError).toBeFalsy();
    expect(JSON.stringify(result.content)).toContain('Total');
    expect(result.structuredContent).toMatchObject({ currency: 'INR', groupBy: 'category' });
  });
});
