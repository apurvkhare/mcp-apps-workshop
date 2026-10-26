/**
 * The Expensify MCP server, as one factory: createServer() builds a fresh McpServer for each request.
 * It knows nothing about transports. http.ts serves it on localhost, worker.ts on Cloudflare.
 *
 * All three MCP primitives are here: tools (the model calls them), a resource (the app reads it),
 * and a prompt (the user picks it). MCP Apps adds exactly two things on top:
 * a ui:// resource holding the view's HTML, and tools that point at it with _meta.ui.resourceUri.
 */
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server';
import { McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import * as z from 'zod';
import { CATEGORIES, ExpenseInput, GROUP_BY, expenseLine, formatINR, todayIST, type ExpenseStore } from '@workshop/shared/expenses.ts';

/** The view. One HTML file that get_summary and list_expenses both render into. */
export const VIEW_URI = 'ui://expensify/dashboard.html';

export interface ServerDeps {
  store: ExpenseStore;
  /** The built view (dist/mcp-app.html). Node reads it from disk, Workers bundles it as text. */
  viewHtml: () => string | Promise<string>;
}

const text = (t: string): CallToolResult => ({ content: [{ type: 'text', text: t }] });
const fail = (t: string): CallToolResult => ({ content: [{ type: 'text', text: t }], isError: true });

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const range = {
  from: isoDate.optional().describe('Start date YYYY-MM-DD, inclusive'),
  to: isoDate.optional().describe('End date YYYY-MM-DD, inclusive')
};

const ExpenseRow = z.object({
  id: z.string(),
  date: z.string(),
  category: z.string(),
  merchant: z.string(),
  amount: z.number(),
  // Optional, not nullable: nullable becomes type: ["string", "null"], which some hosts reject.
  note: z.string().optional()
});

export function createServer({ store, viewHtml }: ServerDeps): McpServer {
  const server = new McpServer(
    { name: 'expensify', version: '1.0.0', title: 'Expensify' },
    {
      instructions:
        'Personal expense tracker in INR. Use get_summary for totals instead of adding up list_expenses yourself. ' +
        'Dates are YYYY-MM-DD. Valid categories are in the expenses://categories resource.'
    }
  );

  // ------------------------------------------------------------------ tools

  // ✅ 2.2 get_summary is an app tool: hosts render the view under its result.
  registerAppTool(
    server,
    'get_summary',
    {
      title: 'Spending summary',
      description:
        'Total spend and a breakdown for a date range, grouped by category, merchant or month. ' +
        'Hosts that render MCP Apps show this as an interactive dashboard the user can filter and drill into, ' +
        'so do not repeat every number in your reply, and do not also call list_expenses to show the same data.',
      inputSchema: z.object({ ...range, groupBy: z.enum(GROUP_BY).default('category') }),
      outputSchema: z.object({
        currency: z.literal('INR'),
        from: z.string().optional(),
        to: z.string().optional(),
        total: z.number(),
        count: z.number().int(),
        groupBy: z.enum(GROUP_BY),
        groups: z.array(z.object({ key: z.string(), total: z.number(), count: z.number().int() }))
      }),
      annotations: { readOnlyHint: true, idempotentHint: true },
      _meta: { ui: { resourceUri: VIEW_URI } }
    },
    async (args) => {
      const summary = store.summary(args);
      const lines = summary.groups.map((g) => `${g.key.padEnd(14)} ${formatINR(g.total).padStart(10)}  (${g.count})`);
      return {
        // content is for the model: plain text it can reason about and quote.
        content: [{ type: 'text', text: [`Total ${formatINR(summary.total)} across ${summary.count} expenses`, ...lines].join('\n') }],
        // structuredContent is for code: typed by outputSchema. The view renders from this.
        structuredContent: { ...summary }
      };
    }
  );

  registerAppTool(
    server,
    'list_expenses',
    {
      title: 'List expenses',
      description:
        'List expenses, newest first, with optional filters. Returns at most `limit` rows. For totals use get_summary. ' +
        'Hosts that render MCP Apps show this in the same dashboard as get_summary.',
      inputSchema: z.object({
        ...range,
        category: z.enum(CATEGORIES).optional(),
        merchant: z.string().min(1).optional().describe('Case-insensitive substring match'),
        limit: z.number().int().min(1).max(50).default(20)
      }),
      outputSchema: z.object({ count: z.number().int(), expenses: z.array(ExpenseRow) }),
      annotations: { readOnlyHint: true, idempotentHint: true },
      _meta: { ui: { resourceUri: VIEW_URI } }
    },
    async (args) => {
      const expenses = store.list(args);
      return {
        content: [{ type: 'text', text: expenses.length ? expenses.map(expenseLine).join('\n') : 'No expenses match.' }],
        structuredContent: { count: expenses.length, expenses }
      };
    }
  );

  server.registerTool(
    'add_expense',
    {
      title: 'Add expense',
      description: 'Record one expense. Date defaults to today (IST).',
      inputSchema: ExpenseInput.extend({ date: isoDate.optional().describe('YYYY-MM-DD, defaults to today') }),
      annotations: { readOnlyHint: false, destructiveHint: false }
    },
    async (args) => {
      const added = store.add({ ...args, date: args.date ?? todayIST() });
      return text(`Added ${expenseLine(added)}`);
    }
  );

  // ✅ 4.3 delete_expense is app-only: the view's Delete button calls it, the model never sees it.
  registerAppTool(
    server,
    'delete_expense',
    {
      title: 'Delete expense',
      description: 'Delete one expense by id. Called from the dashboard when the user clicks Delete.',
      inputSchema: z.object({ id: z.string().describe('Expense id, such as e12') }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
      _meta: { ui: { resourceUri: VIEW_URI, visibility: ['app'] } }
    },
    async ({ id }) => {
      // Never trust the caller: the server checks everything, whoever made the call.
      const removed = store.remove(id);
      return removed ? text(`Deleted ${expenseLine(removed)}`) : fail(`No expense with id ${id}.`);
    }
  );

  // -------------------------------------------------------------- resources

  // ✅ 2.1 The view, served as a ui:// resource with the MCP App MIME type.
  // registerAppResource defaults the MIME type to text/html;profile=mcp-app in resources/list.
  registerAppResource(
    server,
    'Expenses dashboard',
    VIEW_URI,
    { description: 'Interactive dashboard for get_summary and list_expenses.' },
    async () => ({
      contents: [
        {
          uri: VIEW_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: await viewHtml()
          // 🔨 5.3 The view now asks for a font from Google Fonts, and the host's sandbox blocks it.
          //    Find the workshop/csp-violation in the protocol log, then allow the font here:
          //    add _meta.ui.csp.resourceDomains with the two origins the font needs.
          //    (Add a comma after the text line above.)
          // 💡 The stylesheet comes from https://fonts.googleapis.com and the font files from https://fonts.gstatic.com.
          // 🧠 A host builds the view's Content-Security-Policy from this list and nothing else. Leave it out
          //    and the view can load nothing from any other origin: no fonts, no images, no fetch().
          //    resourceDomains covers scripts, styles, images and fonts. connectDomains covers fetch and WebSocket.
          // 📡 Before: a workshop/csp-violation from the view, naming the blocked URL. After: none.
          // 🧪 npm test reads the resource and checks the CSP lists both origins.
          // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app-bridge.html (McpUiResourceCsp)
          // 🔥 Also set prefersBorder: false in the same ui object. The dashboard draws its own cards,
          //    so it asks the host not to add a border around the frame.
        }
      ]
    })
  );

  server.registerResource(
    'categories',
    'expenses://categories',
    { title: 'Expense categories', description: 'The fixed list of valid categories.', mimeType: 'application/json' },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(CATEGORIES) }] })
  );

  // ---------------------------------------------------------------- prompts

  server.registerPrompt(
    'monthly_review',
    {
      title: 'Monthly review',
      description: 'Review one month of spending and suggest where to cut back.',
      argsSchema: z.object({ month: z.string().regex(/^\d{4}-\d{2}$/).optional().describe('YYYY-MM, defaults to this month') })
    },
    ({ month }) => {
      const m = month ?? todayIST().slice(0, 7);
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Review my spending for ${m}. Call get_summary for ${m}-01 to the end of that month, grouped by category, then point out the two categories I could cut back on most, with numbers.`
            }
          }
        ]
      };
    }
  );

  return server;
}
