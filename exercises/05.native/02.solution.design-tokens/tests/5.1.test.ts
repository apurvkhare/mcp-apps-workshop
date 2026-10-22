// @vitest-environment jsdom
/**
 * 🧪 5.1 The view applies the host's styles with useHostStyles, and pads by the safe area insets.
 */
import { ExpenseStore } from '@workshop/shared/expenses.ts';
import { emit, fakeHost, render, setInitialHostContext } from '@workshop/shared/test-view.tsx';
import * as react from '@modelcontextprotocol/ext-apps/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpensifyApp } from '../ui/mcp-app.tsx';

vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));

afterEach(() => {
  fakeHost.reset();
  vi.mocked(react.useHostStyles).mockClear();
  document.body.innerHTML = '';
});

describe('5.1 host styles', () => {
  test('calls useHostStyles with the app and the host context', async () => {
    const context = { theme: 'dark', styles: { variables: { '--color-text-primary': '#fff' } } };
    setInitialHostContext(context);
    await render(ExpensifyApp);
    const calls = vi.mocked(react.useHostStyles).mock.calls;
    expect(calls.length, 'useHostStyles was never called').toBeGreaterThan(0);
    expect(calls.at(-1)?.[0]).toBe(fakeHost.app);
    expect(calls.at(-1)?.[1]).toMatchObject(context);
  });

  test('pads the dashboard by safeAreaInsets', async () => {
    setInitialHostContext({ safeAreaInsets: { top: 12, right: 4, bottom: 8, left: 4 } });
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolresult', { content: [], structuredContent: new ExpenseStore().summary({ groupBy: 'category' }) });
    const main = view.container.querySelector('main');
    expect(main?.style.paddingTop).toBe('12px');
    expect(main?.style.paddingBottom).toBe('8px');
  });
});
