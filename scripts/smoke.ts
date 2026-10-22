/**
 * Talks to a running server the way a host does, and fails loudly if anything is off.
 *   npx tsx scripts/smoke.ts [http://localhost:3001/mcp]
 * Exits 0 when every check passes, 1 otherwise. Prints one line per check.
 */
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const url = new URL(process.argv[2] ?? 'http://localhost:3001/mcp');
const client = new Client(
  { name: 'workshop-smoke', version: '1.0.0' },
  // Say we render MCP Apps, as a real host would.
  { capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } } } }
);

let failed = 0;
function check(name: string, ok: boolean, detail = '') {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `  ${detail}` : ''}`);
}

await client.connect(new StreamableHTTPClientTransport(url));

const { tools } = await client.listTools();
const byName = Object.fromEntries(tools.map((t) => [t.name, t]));
check('tools/list has get_summary, list_expenses, add_expense, delete_expense', ['get_summary', 'list_expenses', 'add_expense', 'delete_expense'].every((n) => n in byName), tools.map((t) => t.name).join(', '));
const ui = (name: string) => (byName[name]?._meta as { ui?: { resourceUri?: string; visibility?: string[] } } | undefined)?.ui;
check('get_summary links the view', ui('get_summary')?.resourceUri === 'ui://expensify/dashboard.html');
check('delete_expense is app-only', JSON.stringify(ui('delete_expense')?.visibility) === '["app"]');

const summary = await client.callTool({ name: 'get_summary', arguments: { groupBy: 'category' } });
const sc = summary.structuredContent as { total?: number; groups?: unknown[] } | undefined;
check('get_summary returns structuredContent', typeof sc?.total === 'number' && Array.isArray(sc.groups), `total ${sc?.total}`);

const list = await client.callTool({ name: 'list_expenses', arguments: { category: 'food', limit: 5 } });
const lc = list.structuredContent as { expenses?: { id: string }[] } | undefined;
check('list_expenses filters by category', (lc?.expenses?.length ?? 0) > 0, `${lc?.expenses?.length} rows`);

const view = await client.readResource({ uri: 'ui://expensify/dashboard.html' });
const content = view.contents[0] as { mimeType?: string; text?: string; _meta?: { ui?: { csp?: unknown } } } | undefined;
check('view resource has the MCP App MIME type', content?.mimeType === 'text/html;profile=mcp-app', content?.mimeType);
check('view resource is a built HTML file', (content?.text?.length ?? 0) > 1000 && !!content?.text?.includes('<div id="root">'), `${content?.text?.length} chars`);
check('view resource declares its CSP', !!content?._meta?.ui?.csp);

const cats = await client.readResource({ uri: 'expenses://categories' });
check('expenses://categories reads', (cats.contents[0] as { text?: string }).text?.includes('food') ?? false);

const prompt = await client.getPrompt({ name: 'monthly_review', arguments: {} });
check('monthly_review prompt renders', prompt.messages.length === 1);

const added = await client.callTool({ name: 'add_expense', arguments: { category: 'food', merchant: 'Smoke Test Cafe', amount: 1 } });
const id = /\b(e\d+)\b/.exec(JSON.stringify(added.content))?.[1];
check('add_expense adds', !!id && !added.isError, id);
const removed = await client.callTool({ name: 'delete_expense', arguments: { id } });
check('delete_expense removes it again', !removed.isError);

await client.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
