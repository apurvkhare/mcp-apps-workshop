/**
 * The Expensify view: an MCP App. The host renders this page in a sandboxed iframe under the
 * get_summary or list_expenses call, and the two talk over postMessage (JSON-RPC).
 *
 *   in:  tool input and tool result (what the model asked, what the server answered), host context (theme, size, ...)
 *   out: tool calls (filters, drill-down, delete), a chat message, and a quiet update to the model's context
 */
import type { App, McpUiHostContext } from '@modelcontextprotocol/ext-apps';
//#step 5.1
import { useApp, useHostStyles } from '@modelcontextprotocol/ext-apps/react';
//#before
import { useApp } from '@modelcontextprotocol/ext-apps/react';
//#end
import { Breakdown, ExpenseTable, Notice, Toolbar, Totals, type DateRange } from '@workshop/shared/components.tsx';
import { GROUP_BY, formatINR, type Expense, type GroupBy, type Summary } from '@workshop/shared/expenses.ts';
import { StrictMode, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
//#step 4.3 given
import { deleteExpense, getSummary, isExpenseList, isSummary, listExpenses, narrowBy, type TableFilter } from './data.ts';
//#before
import { getSummary, isExpenseList, isSummary, listExpenses, narrowBy, type TableFilter } from './data.ts';
//#end
//#step 4.4 given
import { askAbout, reportDeletions } from './chat.ts';
//#before
//#step 4.2 given
import { askAbout } from './chat.ts';
//#end
//#end
//#step 5.2 given
import { bridgeHostTheme } from './host-bridge.ts';
//#end
import 'tenet-ui/tokens.css';
import '@workshop/shared/dashboard.css';

/** Which tool opened the view decides which half it leads with. */
type Entry = 'summary' | 'list';

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

/** Shown between the handshake and the tool result: what the view is waiting for. */
const waitingFor = (range: DateRange, groupBy: GroupBy) =>
  `Connected. Waiting for the result: by ${groupBy}, ${range.from ?? 'from the start'} to ${range.to ?? 'today'}.`;

export function ExpensifyApp() {
//#step 3.4
  // #done The host context: theme, display mode, size and more. It arrives with the handshake, then as changes.
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
//#gap
  // 🔨 3.4 Keep the host context in state: replace this line with a useState<McpUiHostContext | undefined>().
  //    Then fill the two other 3.4 markers below, so it holds the first context and every change.
  // 🧠 McpUiHostContext is everything the host tells the view about where it is rendered: theme, styles,
  //    displayMode and availableDisplayModes, containerDimensions, locale, timeZone, safeAreaInsets, toolInfo.
  //    Every field is optional. Each host sends what it has.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (McpUiHostContext)
  const hostContext = undefined as McpUiHostContext | undefined;
//#before
  // Step 3.4 fills this in with what the host says about where the view is rendered.
  const hostContext = undefined as McpUiHostContext | undefined;
//#end
  const [entry, setEntry] = useState<Entry>('summary');
  const [range, setRange] = useState<DateRange>({});
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  /** False until the model's own tool call has landed. Until then, there is nothing to show and nothing to fetch. */
  const [ready, setReady] = useState(false);

//#step 3.1
  // #done Connect to the host. useApp creates an App, connects it over postMessage, and returns it after the handshake.
  const { app, error } = useApp({
    appInfo: { name: 'Expensify', version: '1.0.0' },
    capabilities: {},
    // Runs before the handshake. Tool input and result arrive once, right after it, so listen first.
    onAppCreated: (created) => {
//#step 3.2
      // #done What the model asked for. Seed the controls with it, so they match the result about to arrive.
      created.addEventListener('toolinput', ({ arguments: args }) => {
        setRange({ from: str(args?.from), to: str(args?.to) });
        const g = GROUP_BY.find((x) => x === args?.groupBy);
        if (g) setGroupBy(g);
      });
//#gap
      // 🔨 3.2 Listen for 'toolinput': the arguments the model called the tool with. Seed the view's
      //    controls with them: setRange from args.from and args.to, and setGroupBy from args.groupBy.
      //    The helper str() turns a missing or empty value into undefined. Only accept a groupBy in GROUP_BY.
      // 💡 created.addEventListener('toolinput', ({ arguments: args }) => { ... })
      // 🧠 Input arrives before the result, while the tool is still running. A slow tool can show
      //    "what you asked for" straight away. ('toolinputpartial' even streams the arguments as the model writes them.)
      // 📡 ui/notifications/tool-input, host → view, right after ui/notifications/initialized.
      // 🧪 npm test sends a tool input and checks the waiting message names the dates and the grouping.
      // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (App events)
//#end
//#step 3.3
      // #done What the server answered. structuredContent is typed by the tool's outputSchema.
      created.addEventListener('toolresult', (result) => {
        const data = result.structuredContent;
        if (isSummary(data)) {
          setSummary(data);
          setGroupBy(data.groupBy);
          setEntry('summary');
        } else if (isExpenseList(data)) {
          setExpenses(data.expenses);
          setEntry('list');
        } else {
          setEntry(created.getHostContext()?.toolInfo?.tool.name === 'list_expenses' ? 'list' : 'summary');
        }
        setReady(true);
      });
      // The user stopped the call. Show the dashboard anyway, with whatever there is.
      created.addEventListener('toolcancelled', () => setReady(true));
//#gap
      // 🔨 3.3 Listen for 'toolresult', the server's answer. Read result.structuredContent:
      //      a summary (check with isSummary)       → setSummary(it), setGroupBy(it.groupBy), setEntry('summary')
      //      an expense list (check isExpenseList)  → setExpenses(it.expenses), setEntry('list')
      //      neither (no structuredContent)          → setEntry('list') if the host's toolInfo names list_expenses,
      //                                                otherwise setEntry('summary')
      //    Either way, setReady(true) at the end: that swaps the waiting message for the dashboard.
      // 💡 created.addEventListener('toolresult', (result) => { const data = result.structuredContent; ... })
      // 💡 For the third branch: created.getHostContext()?.toolInfo?.tool.name === 'list_expenses'.
      // 🧠 A tool result has two halves. content is text for the model. structuredContent is data for code,
      //    shaped by the tool's outputSchema. The view renders from structuredContent and never parses the text.
      // 📡 ui/notifications/tool-result, host → view. Open it: it is the same result the server sent in tools/call.
      // 🧪 npm test sends a get_summary result and a list_expenses result, and checks what renders.
      // 🔥 Also listen for 'toolcancelled' (the user stopped the call) and setReady(true) there too.
//#end
//#step 3.4
      // #done Theme, display mode, container size: the host sends only what changed.
      created.addEventListener('hostcontextchanged', (changed) => setHostContext((prev) => ({ ...prev, ...changed })));
//#gap
      // 🔨 3.4 (part 3) Listen for 'hostcontextchanged' and merge it into hostContext.
      //    The host sends only the fields that changed, so spread the change over the previous value.
      // 💡 setHostContext((prev) => ({ ...prev, ...changed }))
      // 📡 Flip the host's light/dark toggle: ui/notifications/host-context-changed with just { theme }.
//#end
    }
  });
//#gap
  // 🔨 3.1 Connect to the host. Replace the two lines below with one call to useApp from
  //    '@modelcontextprotocol/ext-apps/react', which returns { app, error }. Pass it:
  //      appInfo       the view's name and version, { name: 'Expensify', version: '1.0.0' }
  //      capabilities  what the view supports beyond the basics. {} for now.
  //      onAppCreated  a function that gets the App before it connects. Steps 3.2 to 3.4 add listeners inside it.
  // 💡 const { app, error } = useApp({ appInfo: ..., capabilities: {}, onAppCreated: (created) => {} });
  // 🧠 useApp wraps the App class: new App(appInfo, capabilities), then app.connect(), which sends
  //    ui/initialize to the host and waits for its answer. app stays null until that handshake is done.
  // 📡 ui/initialize (view → host), its result, then ui/notifications/initialized.
  // 🧪 npm test renders the view with a fake host and checks it connects.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/_modelcontextprotocol_ext-apps_react.html (useApp)
  const app = null as App | null;
  const error = null as Error | null;
//#before
  // Step 3.1 connects to the host. Until then there is no app, and the view waits.
  const app = null as App | null;
  const error = null as Error | null;
//#end

//#step 3.4
  // The first context comes with the handshake.
  useEffect(() => {
    if (app) setHostContext(app.getHostContext());
  }, [app]);
//#gap
  // 🔨 3.4 (part 2) Once app is connected, put its first context into state with app.getHostContext().
  // 💡 A useEffect that runs when app changes.
  // 🧠 The first context comes in the ui/initialize result, before any change notification. Without this,
  //    the view would know nothing until the user changed something in the host.
//#end

//#step 5.1
  // #done Put the host's CSS variables, fonts and color-scheme on the document.
  useHostStyles(app, hostContext);
//#gap
  // 🔨 5.1 Apply the host's styles: call useHostStyles(app, hostContext). Import it from
  //    '@modelcontextprotocol/ext-apps/react', next to useApp.
  // 🧠 It writes hostContext.styles.variables onto :root as CSS variables (--color-text-primary, --font-sans, ...),
  //    adds the host's font CSS, and sets color-scheme. Then var(--color-text-primary) works in any CSS.
  //    Nothing changes on screen yet: our components use tenet-ui's names. Step 5.2 connects the two.
  // 📡 Switch the host theme preset: one host-context-changed carries the whole new set of variables.
  // 🧪 npm test checks useHostStyles gets the app and the context.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/_modelcontextprotocol_ext-apps_react.html (useHostStyles)

//#end
//#step 5.2 given
  // Point tenet-ui's tokens at the host's variables (host-bridge.ts), and follow light and dark.
  useEffect(() => bridgeHostTheme(hostContext), [hostContext]);
//#before
//#step 3.4 given
  // tenet-ui switches palettes with data-color-mode. The host says light or dark in hostContext.theme.
  useEffect(() => {
    document.documentElement.dataset.colorMode = hostContext?.theme ?? 'light';
  }, [hostContext]);
//#end
//#end

  if (error) return <Notice tone="error">Could not connect to the host: {error.message}</Notice>;
  if (!app) return <Notice>Waiting for the host…</Notice>;
  if (!ready) return <Notice>{waitingFor(range, groupBy)}</Notice>;

  return (
    <Dashboard
      app={app}
      hostContext={hostContext}
      entry={entry}
      initial={{ range, groupBy, summary, expenses }}
    />
  );
}

interface DashboardProps {
  app: App;
  hostContext: McpUiHostContext | undefined;
  entry: Entry;
  initial: { range: DateRange; groupBy: GroupBy; summary: Summary | null; expenses: Expense[] | null };
}

function Dashboard({ app, hostContext, entry, initial }: DashboardProps) {
  const [range, setRange] = useState(initial.range);
  const [groupBy, setGroupBy] = useState(initial.groupBy);
  const [summary, setSummary] = useState(initial.summary);
  const [expenses, setExpenses] = useState(initial.expenses);
  const [filter, setFilter] = useState<TableFilter>({});
  const [selected, setSelected] = useState<string | undefined>();
  const [showTable, setShowTable] = useState(entry === 'list');
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
//#step 4.3 given
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
//#end
//#step 4.4 given
  const deleted = useRef<string[]>([]);
//#end

  /**
   * Fetch whatever is on screen. Only user actions call this: the first data came with the
   * model's own tool call, and fetching it again would race the model for the same numbers.
   */
  async function refresh(next: { range?: DateRange; groupBy?: GroupBy; filter?: TableFilter; table?: boolean } = {}) {
    const r = next.range ?? range;
    const g = next.groupBy ?? groupBy;
    const f = next.filter ?? filter;
    const table = next.table ?? showTable;
    setLoading(true);
    setProblem(null);
    try {
      const [s, list] = await Promise.all([
        entry === 'summary' || summary ? getSummary(app, r, g) : Promise.resolve(summary),
        table ? listExpenses(app, r, f) : Promise.resolve(expenses)
      ]);
      setSummary(s);
      setExpenses(list);
    } catch (err) {
      setProblem(message(err));
    } finally {
      setLoading(false);
    }
  }

  const onRange = (r: DateRange) => {
    setRange(r);
    setSelected(undefined);
    setFilter({});
    void refresh({ range: r, filter: {} });
  };

  const onGroupBy = (g: GroupBy) => {
    setGroupBy(g);
    setSelected(undefined);
    setFilter({});
    void refresh({ groupBy: g, filter: {} });
  };

  // Click a bar: the table narrows to it. One tools/call from the view, no model round trip.
  const onSelect = (key: string | undefined) => {
    setSelected(key);
    if (!key) {
      setFilter({});
      return void refresh({ filter: {} });
    }
    const narrowed = narrowBy(groupBy, key, range);
    setFilter(narrowed.filter);
    setShowTable(true);
    setLoading(true);
    listExpenses(app, narrowed.range, narrowed.filter)
      .then(setExpenses, (err: unknown) => setProblem(message(err)))
      .finally(() => setLoading(false));
  };
//#step 4.3 given

  const onDelete = async (e: Expense) => {
    setBusy((b) => new Set(b).add(e.id));
    setProblem(null);
    try {
      await deleteExpense(app, e.id);
//#step 4.4 given
      deleted.current.push(`${e.merchant}, ${formatINR(e.amount)} on ${e.date} (${e.id})`);
      // Not every host takes context updates. The delete itself already succeeded, so ignore a refusal.
      await reportDeletions(app, deleted.current).catch(() => {});
//#end
      await refresh({ table: true });
    } catch (err) {
      setProblem(message(err));
    } finally {
      setBusy((b) => {
        const next = new Set(b);
        next.delete(e.id);
        return next;
      });
    }
  };
//#end
//#step 3.4

  const canFullscreen = hostContext?.availableDisplayModes?.includes('fullscreen');
  const isFullscreen = hostContext?.displayMode === 'fullscreen';
//#end

//#step 5.1
  // #done Keep clear of notches and the host's own overlays.
  const insets = hostContext?.safeAreaInsets;
  const padding: CSSProperties = { paddingTop: insets?.top, paddingRight: insets?.right, paddingBottom: insets?.bottom, paddingLeft: insets?.left };
//#gap
  // 🔨 5.1 (part 2) Pad the dashboard by hostContext.safeAreaInsets ({ top, right, bottom, left }, in pixels),
  //    so nothing hides under a phone's notch or the host's own controls.
  // 💡 Replace the line below: const insets = hostContext?.safeAreaInsets; then { paddingTop: insets?.top, ... } for all four sides.
  const padding: CSSProperties = {};
//#before
  const padding: CSSProperties = {};
//#end

  return (
    <main style={padding}>
//#step 3.4
      <Toolbar range={range} onRange={onRange}>
        {canFullscreen && (
          <button type="button" className="button" onClick={() => void app.requestDisplayMode({ mode: isFullscreen ? 'inline' : 'fullscreen' })}>
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        )}
      </Toolbar>
//#gap
      {/* 🔥 3.4 Bonus: when hostContext.availableDisplayModes includes 'fullscreen', put a button inside the
          Toolbar that calls app.requestDisplayMode({ mode: 'fullscreen' }), or 'inline' to go back.
          hostContext.displayMode says which one you are in now. */}
      <Toolbar range={range} onRange={onRange} />
//#before
      <Toolbar range={range} onRange={onRange} />
//#end

      {problem && <Notice tone="error">{problem}</Notice>}

      {(entry === 'summary' || summary) && (
        <>
          <Totals summary={summary} loading={loading} />
          <Breakdown
            summary={summary}
            loading={loading}
            groupBy={groupBy}
            onGroupBy={onGroupBy}
            selected={selected}
            onSelect={onSelect}
//#step 4.2 given
            barAction={(key) => (
              <button type="button" className="link" onClick={() => void askAbout(app, groupBy, key, summary)} aria-label={`Ask about ${key}`}>
                Ask
              </button>
            )}
//#end
          />
        </>
      )}

      {showTable ? (
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          caption={
            selected && (
              <>
                Showing <b>{selected}</b>
                <button type="button" className="link" onClick={() => onSelect(undefined)}>
                  Clear
                </button>
              </>
            )
          }
//#step 4.3 given
          onDelete={onDelete}
          busy={busy}
//#end
        />
      ) : (
        <button
          type="button"
          className="link"
          onClick={() => {
            setShowTable(true);
            void refresh({ table: true });
          }}
        >
          Show the expenses behind these numbers
        </button>
      )}
    </main>
  );
}

// Tests import ExpensifyApp from this file without a #root, so mount only when there is one.
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ExpensifyApp />
    </StrictMode>
  );
}
