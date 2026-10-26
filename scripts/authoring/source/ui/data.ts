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

//#step 4.1
// #done getSummary and listExpenses call the server through the host.
export async function getSummary(app: App, range: DateRange, groupBy: GroupBy): Promise<Summary> {
  const result = await app.callServerTool({ name: 'get_summary', arguments: clean({ ...range, groupBy }) });
  if (result.isError || !isSummary(result.structuredContent)) throw new Error(textOf(result) || 'get_summary returned no data.');
  return result.structuredContent;
}

export async function listExpenses(app: App, range: DateRange, filter: TableFilter): Promise<Expense[]> {
  const result = await app.callServerTool({ name: 'list_expenses', arguments: clean({ ...range, ...filter, limit: 50 }) });
  if (result.isError || !isExpenseList(result.structuredContent)) throw new Error(textOf(result) || 'list_expenses returned no data.');
  return result.structuredContent.expenses;
}
//#gap
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
//#before
export async function getSummary(app: App, range: DateRange, groupBy: GroupBy): Promise<Summary> {
  throw new Error('The view cannot fetch yet. Step 4.1 adds app.callServerTool.');
}

export async function listExpenses(app: App, range: DateRange, filter: TableFilter): Promise<Expense[]> {
  throw new Error('The view cannot fetch yet. Step 4.1 adds app.callServerTool.');
}
//#end
//#step 4.3

/** An app-only tool: the model never sees delete_expense, but the view can call it. */
export async function deleteExpense(app: App, id: string): Promise<string> {
  const result = await app.callServerTool({ name: 'delete_expense', arguments: { id } });
  if (result.isError) throw new Error(textOf(result) || 'delete_expense failed.');
  return textOf(result);
}
//#gap

/** An app-only tool: the model never sees delete_expense, but the view can call it. */
export async function deleteExpense(app: App, id: string): Promise<string> {
  // 🔨 4.3 (part 2) Call delete_expense with { id }. Throw if result.isError, with the result's text as the message.
  //    Return the text on success. The Delete buttons in the table already call this.
  throw new Error('deleteExpense is not written yet (step 4.3).');
}
//#end

/** A bar in the breakdown narrows the table: to its category, its merchant, or its month. */
export function narrowBy(groupBy: GroupBy, key: string, range: DateRange): { range: DateRange; filter: TableFilter } {
  if (groupBy === 'category') return { range, filter: { category: key as Category } };
  if (groupBy === 'merchant') return { range, filter: { merchant: key } };
  const [y, m] = key.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { range: { from: `${key}-01`, to: last }, filter: {} };
}
