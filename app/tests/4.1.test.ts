/**
 * 🧪 4.1 The view calls get_summary and list_expenses through the host, with app.callServerTool.
 */
import { ExpenseStore } from '@workshop/shared/expenses.ts';
import { FakeApp } from '@workshop/shared/test-view.tsx';
import type { App } from '@modelcontextprotocol/ext-apps';
import { describe, expect, test } from 'vitest';
import { getSummary, listExpenses } from '../ui/data.ts';

const store = new ExpenseStore();
const asApp = (fake: FakeApp) => fake as unknown as App;

describe('4.1 call server tools', () => {
  test('getSummary calls get_summary with the range and groupBy, and returns structuredContent', async () => {
    const fake = new FakeApp();
    const summary = store.summary({ groupBy: 'merchant' });
    fake.toolResults.get_summary = { content: [{ type: 'text', text: 'Total' }], structuredContent: summary };
    await expect(getSummary(asApp(fake), { from: '2026-10-01' }, 'merchant')).resolves.toEqual(summary);
    expect(fake.calls).toEqual([{ method: 'tools/call', params: { name: 'get_summary', arguments: { from: '2026-10-01', groupBy: 'merchant' } } }]);
  });

  test('getSummary throws the tool error text', async () => {
    const fake = new FakeApp();
    fake.toolResults.get_summary = { content: [{ type: 'text', text: 'Bad date' }], isError: true };
    await expect(getSummary(asApp(fake), {}, 'category')).rejects.toThrow('Bad date');
  });

  test('listExpenses calls list_expenses with the range, filter and a limit of 50', async () => {
    const fake = new FakeApp();
    const expenses = store.list({ category: 'food' });
    fake.toolResults.list_expenses = { content: [], structuredContent: { count: expenses.length, expenses } };
    await expect(listExpenses(asApp(fake), { to: '2026-10-20' }, { category: 'food' })).resolves.toEqual(expenses);
    expect(fake.calls[0]?.params).toEqual({ name: 'list_expenses', arguments: { to: '2026-10-20', category: 'food', limit: 50 } });
  });

  test('listExpenses throws when the result has no expenses in it', async () => {
    const fake = new FakeApp();
    fake.toolResults.list_expenses = { content: [{ type: 'text', text: 'Something broke' }] };
    await expect(listExpenses(asApp(fake), {}, {})).rejects.toThrow('Something broke');
  });
});
