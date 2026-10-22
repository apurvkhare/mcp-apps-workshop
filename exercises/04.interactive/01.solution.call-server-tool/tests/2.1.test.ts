/**
 * 🧪 2.1 The server serves the view as a ui:// resource with the MCP App MIME type.
 */
import { connect, VIEW_STUB } from '@workshop/shared/test-server.ts';
import { describe, expect, test } from 'vitest';
import { createServer, VIEW_URI } from '../server/server.ts';

describe('2.1 app resource', () => {
  test('resources/list has the view, with the MCP App MIME type', async () => {
    const { client } = await connect(createServer);
    const { resources } = await client.listResources();
    const view = resources.find((r) => r.uri === VIEW_URI);
    expect(view, `No resource at ${VIEW_URI}. Register it with registerAppResource.`).toBeDefined();
    expect(view?.mimeType).toBe('text/html;profile=mcp-app');
  });

  test('resources/read returns the built HTML, with the MIME type on the contents too', async () => {
    const { client } = await connect(createServer);
    const { contents } = await client.readResource({ uri: VIEW_URI });
    expect(contents).toHaveLength(1);
    expect(contents[0]).toMatchObject({ uri: VIEW_URI, mimeType: 'text/html;profile=mcp-app', text: VIEW_STUB });
  });
});
