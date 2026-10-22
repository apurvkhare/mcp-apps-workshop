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
  throw new Error('The view cannot fetch yet. Step 4.1 adds app.callServerTool.');
}

export async function listExpenses(app: App, range: DateRange, filter: TableFilter): Promise<Expense[]> {
  throw new Error('The view cannot fetch yet. Step 4.1 adds app.callServerTool.');
}

/** A bar in the breakdown narrows the table: to its category, its merchant, or its month. */
export function narrowBy(groupBy: GroupBy, key: string, range: DateRange): { range: DateRange; filter: TableFilter } {
  if (groupBy === 'category') return { range, filter: { category: key as Category } };
  if (groupBy === 'merchant') return { range, filter: { merchant: key } };
  const [y, m] = key.split('-').map(Number) as [number, number];
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return { range: { from: `${key}-01`, to: last }, filter: {} };
}
