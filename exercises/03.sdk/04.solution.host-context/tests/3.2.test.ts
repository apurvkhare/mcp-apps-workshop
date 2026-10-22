// @vitest-environment jsdom
/**
 * 🧪 3.2 The view reads the tool input and shows what the model asked for.
 */
import { emit, fakeHost, render } from '@workshop/shared/test-view.tsx';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpensifyApp } from '../ui/mcp-app.tsx';

vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));

afterEach(() => {
  fakeHost.reset();
  document.body.innerHTML = '';
});

describe('3.2 tool input', () => {
  test('a toolinput listener is registered in onAppCreated', async () => {
    await render(ExpensifyApp);
    expect(fakeHost.app?.listeners.get('toolinput')?.length ?? 0, "no listener for 'toolinput'").toBeGreaterThan(0);
  });

  test('the dates and grouping from the tool input show while the result is on its way', async () => {
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolinput', { arguments: { from: '2026-10-01', to: '2026-10-15', groupBy: 'merchant' } });
    expect(view.text()).toContain('by merchant');
    expect(view.text()).toContain('2026-10-01 to 2026-10-15');
  });

  test('missing or unknown arguments fall back to the defaults', async () => {
    const view = await render(ExpensifyApp);
    await emit(fakeHost.app, 'toolinput', { arguments: { from: '', groupBy: 'colour' } });
    expect(view.text()).toContain('by category, from the start to today');
  });
});
