// @vitest-environment jsdom
/**
 * 🧪 3.4 The view keeps the host context: the first one from the handshake, then every change.
 * The visible effect is the theme: tenet-ui reads data-color-mode on <html>.
 */
import { emit, fakeHost, render, setInitialHostContext } from '@workshop/shared/test-view.tsx';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ExpensifyApp } from '../ui/mcp-app.tsx';

vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));

afterEach(() => {
  fakeHost.reset();
  document.body.innerHTML = '';
  delete document.documentElement.dataset.colorMode;
});

const colorMode = () => document.documentElement.dataset.colorMode;

describe('3.4 host context', () => {
  test('uses the context from the handshake (getHostContext)', async () => {
    setInitialHostContext({ theme: 'dark' });
    await render(ExpensifyApp);
    expect(colorMode()).toBe('dark');
  });

  test('follows hostcontextchanged', async () => {
    setInitialHostContext({ theme: 'dark' });
    await render(ExpensifyApp);
    await emit(fakeHost.app, 'hostcontextchanged', { theme: 'light' });
    expect(colorMode()).toBe('light');
  });

  test('merges each change into what it already knows', async () => {
    setInitialHostContext({ theme: 'dark', displayMode: 'inline' });
    await render(ExpensifyApp);
    await emit(fakeHost.app, 'hostcontextchanged', { displayMode: 'fullscreen' });
    expect(colorMode(), 'a change without a theme must not reset the theme').toBe('dark');
  });
});
