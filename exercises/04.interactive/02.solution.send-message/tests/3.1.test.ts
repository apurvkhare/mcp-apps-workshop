// @vitest-environment jsdom
/**
 * 🧪 3.1 The view connects to the host with useApp.
 * A fake host stands in for the real one: see shared/src/test-view.tsx.
 */
import { fakeHost, render } from '@workshop/shared/test-view.tsx';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpensifyApp } from '../ui/mcp-app.tsx';

vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));

afterEach(() => {
  fakeHost.reset();
  document.body.innerHTML = '';
});

describe('3.1 connect', () => {
  test('calls useApp with appInfo, capabilities and onAppCreated', async () => {
    await render(ExpensifyApp);
    expect(fakeHost.options, 'useApp was never called').toBeDefined();
    expect(fakeHost.options?.appInfo).toMatchObject({ name: 'Expensify', version: expect.any(String) });
    expect(fakeHost.options?.capabilities).toBeDefined();
    expect(typeof fakeHost.options?.onAppCreated, 'pass an onAppCreated function: the listeners go in it').toBe('function');
  });

  test('stops waiting for the host once connected', async () => {
    const view = await render(ExpensifyApp);
    expect(view.text()).not.toContain('Waiting for the host');
    expect(view.text()).toContain('Connected');
  });
});
