/**
 * Test helper: a real MCP client talking to a server in the same process, with no port and no network.
 * The client declares the MCP Apps extension, the way a host that renders views does.
 */
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHandler, type McpServer } from '@modelcontextprotocol/server';
import { ExpenseStore } from './expenses.ts';

export const VIEW_STUB = '<!doctype html><html><head></head><body><div id="root"></div></body></html>';

type CreateServer = (deps: { store: ExpenseStore; viewHtml: () => string | Promise<string> }) => McpServer;
type FetchHandler = (request: Request) => Response | Promise<Response>;

export async function connectClient(fetchHandler: FetchHandler): Promise<Client> {
  const client = new Client(
    { name: 'workshop-test', version: '1.0.0' },
    { capabilities: { extensions: { 'io.modelcontextprotocol/ui': { mimeTypes: ['text/html;profile=mcp-app'] } } } }
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL('http://test.local/mcp'), {
      fetch: async (url, init) => fetchHandler(new Request(url, init))
    })
  );
  return client;
}

/** createServer from a step's server.ts, wrapped the way http.ts wraps it. */
export async function connect(createServer: CreateServer, viewHtml = VIEW_STUB) {
  const store = new ExpenseStore();
  const handler = createMcpHandler(() => createServer({ store, viewHtml: () => viewHtml }));
  const client = await connectClient((request) => handler.fetch(request, {}));
  return { client, store };
}

/** The _meta.ui of a tool, as a host sees it in tools/list. */
export async function toolUi(client: Client, name: string) {
  const { tools } = await client.listTools();
  const tool = tools.find((t) => t.name === name);
  return { tool, ui: (tool?._meta as { ui?: { resourceUri?: string; visibility?: string[] } } | undefined)?.ui };
}
