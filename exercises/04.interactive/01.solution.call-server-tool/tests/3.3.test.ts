// @vitest-environment jsdom
/**
 * 🧪 3.3 The view renders the tool result from structuredContent.
 */
import { ExpenseStore, formatINR } from '@workshop/shared/expenses.ts';
import { emit, fakeHost, render } from '@workshop/shared/test-view.tsx';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpensifyApp } from '../ui/mcp-app.tsx';

vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));

afterEach(() => {
  fakeHost.reset();
  document.body.innerHTML = '';
});

const store = new ExpenseStore();

describe('3.3 tool result', () => {
  test('a get_summary result renders the totals and the breakdown', async () => {
    const summary = store.summary({ groupBy: 'category' });
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolresult', { content: [{ type: 'text', text: 'ignored by the view' }], structuredContent: summary });
    expect(view.text()).toContain(formatINR(summary.total));
    expect(view.text()).toContain(summary.groups[0]!.key);
  });

  test('a list_expenses result renders the table', async () => {
    const expenses = store.list({ limit: 5 });
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolresult', { content: [], structuredContent: { count: expenses.length, expenses } });
    expect(view.text()).toContain(expenses[0]!.merchant);
  });

  test('renders from structuredContent, not from the text', async () => {
    const summary = { ...store.summary({ groupBy: 'category' }), total: 12345 };
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolresult', { content: [{ type: 'text', text: 'Total ₹1' }], structuredContent: summary });
    expect(view.text()).toContain(formatINR(12345));
  });
});
