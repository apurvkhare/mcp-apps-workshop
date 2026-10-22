/**
 * 🧪 5.3 The view resource declares the font's origins in _meta.ui.csp.resourceDomains.
 */
import { connect } from '@workshop/shared/test-server.ts';
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { createServer, VIEW_URI } from '../server/server.ts';

describe('5.3 CSP', () => {
  test('the view loads its font from Google Fonts', async () => {
    const html = await readFile(new URL('../ui/mcp-app.html', import.meta.url), 'utf8');
    expect(html).toContain('https://fonts.googleapis.com/css2?family=Newsreader');
  });

  test('the resource allows the stylesheet origin and the font file origin', async () => {
    const { client } = await connect(createServer);
    const { contents } = await client.readResource({ uri: VIEW_URI });
    const csp = (contents[0]?._meta as { ui?: { csp?: { resourceDomains?: string[] } } } | undefined)?.ui?.csp;
    expect(csp, 'no _meta.ui.csp on the resource contents').toBeDefined();
    expect(csp?.resourceDomains).toEqual(expect.arrayContaining(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']));
  });
});
