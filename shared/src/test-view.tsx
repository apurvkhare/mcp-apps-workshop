/**
 * Test helper: a fake host for the view. Use it in a test file like this:
 *
 *   vi.mock('@modelcontextprotocol/ext-apps/react', () => import('@workshop/shared/test-view.tsx').then((m) => m.fakeReactModule()));
 *
 * The fake useApp hands the view a FakeApp, already "connected". The test then plays the host:
 * app.emit('toolresult', ...) delivers a notification, and app.calls records everything the view sent.
 */
import { act, createElement, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Listener = (params: never) => void;

export class FakeApp {
  listeners = new Map<string, Listener[]>();
  calls: { method: string; params: unknown }[] = [];
  hostContext: Record<string, unknown> = {};
  /** What callServerTool answers, by tool name. */
  toolResults: Record<string, unknown> = {};

  addEventListener(event: string, listener: Listener) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener]);
  }
  removeEventListener(event: string, listener: Listener) {
    this.listeners.set(event, (this.listeners.get(event) ?? []).filter((l) => l !== listener));
  }
  emit(event: string, params: unknown) {
    for (const listener of this.listeners.get(event) ?? []) (listener as (p: unknown) => void)(params);
  }
  getHostContext() {
    return this.hostContext;
  }
  private record(method: string, params: unknown) {
    this.calls.push({ method, params });
  }
  async callServerTool(params: { name: string; arguments?: unknown }) {
    this.record('tools/call', params);
    return this.toolResults[params.name] ?? { content: [{ type: 'text', text: `No fake result for ${params.name}` }], isError: true };
  }
  async sendMessage(params: unknown) {
    this.record('ui/message', params);
    return {};
  }
  async updateModelContext(params: unknown) {
    this.record('ui/update-model-context', params);
    return {};
  }
  async requestDisplayMode(params: { mode: string }) {
    this.record('ui/request-display-mode', params);
    return { mode: params.mode };
  }
  async openLink(params: unknown) {
    this.record('ui/open-link', params);
    return {};
  }
}

let lastApp: FakeApp | undefined;
let lastOptions: { appInfo?: { name?: string }; capabilities?: unknown; onAppCreated?: (app: unknown) => void } | undefined;
let initialContext: Record<string, unknown> = {};

/** Set the context the next fake app starts with, as if it came in the ui/initialize result. */
export function setInitialHostContext(context: Record<string, unknown>) {
  initialContext = context;
}

export const fakeHost = {
  get app() {
    return lastApp;
  },
  get options() {
    return lastOptions;
  },
  reset() {
    lastApp = undefined;
    lastOptions = undefined;
    initialContext = {};
  }
};

/** Stand-in for @modelcontextprotocol/ext-apps/react. */
export function fakeReactModule() {
  return {
    useApp(options: NonNullable<typeof lastOptions>) {
      const [app] = useState(() => {
        const created = new FakeApp();
        created.hostContext = initialContext;
        lastApp = created;
        lastOptions = options;
        options.onAppCreated?.(created);
        return created;
      });
      return { app, isConnected: true, error: null };
    },
    useHostStyles: vi.fn(),
    useHostStyleVariables: vi.fn(),
    useHostFonts: vi.fn(),
    useDocumentTheme: vi.fn(() => 'light'),
    useAutoResize: vi.fn()
  };
}

export async function render(element: ReactElement | (() => ReactElement)) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(typeof element === 'function' ? createElement(element) : element));
  return {
    container,
    text: () => container.textContent ?? '',
    unmount: () => act(() => root.unmount())
  };
}

/** Deliver a notification to the view, as the host would, and let React re-render. */
export async function emit(app: FakeApp | undefined, event: string, params: unknown) {
  if (!app) throw new Error('The view never called useApp, so there is no app to send events to (step 3.1).');
  await act(async () => app.emit(event, params));
}

/** Click a button by its text or aria-label, then let React and any promises settle. */
export async function click(container: HTMLElement, label: string) {
  const button = [...container.querySelectorAll('button')].find((b) => b.textContent?.trim() === label || b.getAttribute('aria-label') === label);
  if (!button) throw new Error(`No button "${label}" on screen.`);
  await act(async () => {
    button.click();
    await new Promise((r) => setTimeout(r, 0));
  });
}
