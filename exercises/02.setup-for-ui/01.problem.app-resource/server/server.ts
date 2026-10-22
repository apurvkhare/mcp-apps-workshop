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

  server.registerTool(
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
      annotations: { readOnlyHint: true, idempotentHint: true }
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

  server.registerTool(
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
      annotations: { readOnlyHint: true, idempotentHint: true }
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

  server.registerTool(
    'delete_expense',
    {
      title: 'Delete expense',
      description: 'Delete one expense by id.',
      inputSchema: z.object({ id: z.string().describe('Expense id, such as e12') }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true }
    },
    async ({ id }) => {
      // Never trust the caller: the server checks everything, whoever made the call.
      const removed = store.remove(id);
      return removed ? text(`Deleted ${expenseLine(removed)}`) : fail(`No expense with id ${id}.`);
    }
  );

  // -------------------------------------------------------------- resources

  // 🔨 2.1 Serve the view. Register VIEW_URI as an app resource whose text is the built HTML from viewHtml().
  //    Use registerAppResource(server, name, uri, config, readCallback). The read callback returns
  //    { contents: [ ... ] } with one entry: the uri, the mimeType, and the HTML as text.
  // 💡 The MIME type is the RESOURCE_MIME_TYPE constant, already imported. viewHtml() may be async, so await it.
  // 🧠 The view is a resource, not part of the tool result, so a host can fetch it ahead of time, cache it,
  //    and review it before anything runs. The MIME type "text/html;profile=mcp-app" is how a host knows
  //    this HTML is an MCP App to render in a sandbox, not a page to show as text.
  // 📡 Nothing yet: no tool points at the view, so no host asks for it. Step 2.2 changes that.
  // 🧪 npm test reads ui://expensify/dashboard.html and checks its MIME type and HTML.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/server-helpers.html

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
