/**
 * Every call the view makes back to the server. Each one is app.callServerTool:
 * view → host (postMessage) → server (tools/call) → host → view. The view never reaches the server directly.
 */
import type { App } from '@modelcontextprotocol/ext-apps';
import type { CallToolResult } from '@modelcontextprotocol/client';
import type { Category, Expense, GroupBy, Summary } from '@workshop/shared/expenses.ts';
import type { DateRange } from '@workshop/shared/components.tsx';

export interface TableFilter {
  category?: Category;
  merchant?: string;
}

export const isSummary = (v: unknown): v is Summary => typeof v === 'object' && v !== null && Array.isArray((v as Summary).groups);
export const isExpenseList = (v: unknown): v is { count: number; expenses: Expense[] } =>
  typeof v === 'object' && v !== null && Array.isArray((v as { expenses?: unknown }).expenses);

export const textOf = (result: CallToolResult) => result.content.flatMap((c) => (c.type === 'text' ? [c.text] : [])).join('\n');

/** Drop empty values: the tool schemas treat a missing field as "no filter", but reject "". */
const clean = (args: Record<string, unknown>) => Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined && v !== ''));

export async function getSummary(app: App, range: DateRange, groupBy: GroupBy): Promise<Summary> {
  // 🔨 4.1 Call the get_summary tool from the view, with the range and groupBy as its arguments.
  //    Throw if the result is an error or has no summary in it. Otherwise return the summary.
  // 💡 const result = await app.callServerTool({ name, arguments: clean({ ...range, groupBy }) })
  //    then check result.isError and isSummary(result.structuredContent). If either fails,
  //    throw new Error(textOf(result)): the result's text is the message.
  // 🧠 The view has no connection to the server. callServerTool asks the host, the host decides whether
  //    to allow it, then makes an ordinary tools/call. To the server, it looks like any other call.
  // 📡 Change the date range in the view: tools/call view → host, then host → server, then both results back.
  // 🧪 npm test calls getSummary and listExpenses with a fake app and checks the requests and the errors.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (App.callServerTool)
  throw new Error('getSummary is not written yet (step 4.1).');
}

export async function listExpenses(app: App, range: DateRange, filter: TableFilter): Promise<Expense[]> {
  // 🔨 4.1 (part 2) The same for list_expenses: arguments are the range, the filter and limit: 50.
  //    Return result.structuredContent.expenses. isExpenseList checks the shape.
  // 💡 Throw new Error(textOf(result)) if result.isError or isExpenseList(result.structuredContent) is false.
  //    The Toolbar, the "Show the expenses" link and a click on a bar all end up here.
  throw new Error('listExpenses is not written yet (step 4.1).');
}

/** A bar in the breakdown narrows the table: to its category, its merchant, or its month. */
export function narrowBy(groupBy: GroupBy, key: string, range: DateRange): { range: DateRange; filter: TableFilter } {
  if (groupBy === 'category') return { range, filter: { category: key as Category } };
  if (groupBy === 'merchant') return { range, filter: { merchant: key } };
  const [y, m] = key.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { range: { from: `${key}-01`, to: last }, filter: {} };
}
