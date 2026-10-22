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

// ✅ 4.1 getSummary and listExpenses call the server through the host.
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

/** An app-only tool: the model never sees delete_expense, but the view can call it. */
export async function deleteExpense(app: App, id: string): Promise<string> {
  const result = await app.callServerTool({ name: 'delete_expense', arguments: { id } });
  if (result.isError) throw new Error(textOf(result) || 'delete_expense failed.');
  return textOf(result);
}

/** A bar in the breakdown narrows the table: to its category, its merchant, or its month. */
export function narrowBy(groupBy: GroupBy, key: string, range: DateRange): { range: DateRange; filter: TableFilter } {
  if (groupBy === 'category') return { range, filter: { category: key as Category } };
  if (groupBy === 'merchant') return { range, filter: { merchant: key } };
  const [y, m] = key.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { range: { from: `${key}-01`, to: last }, filter: {} };
}
