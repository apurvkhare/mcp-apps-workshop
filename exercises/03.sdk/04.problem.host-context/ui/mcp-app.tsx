/**
 * The Expensify view: an MCP App. The host renders this page in a sandboxed iframe under the
 * get_summary or list_expenses call, and the two talk over postMessage (JSON-RPC).
 *
 *   in:  tool input and tool result (what the model asked, what the server answered), host context (theme, size, ...)
 *   out: tool calls (filters, drill-down, delete), a chat message, and a quiet update to the model's context
 */
import type { App, McpUiHostContext } from '@modelcontextprotocol/ext-apps';
import { useApp } from '@modelcontextprotocol/ext-apps/react';
import { Breakdown, ExpenseTable, Notice, Toolbar, Totals, type DateRange } from '@workshop/shared/components.tsx';
import { GROUP_BY, formatINR, type Expense, type GroupBy, type Summary } from '@workshop/shared/expenses.ts';
import { StrictMode, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { getSummary, isExpenseList, isSummary, listExpenses, narrowBy, type TableFilter } from './data.ts';
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
  // 🔨 3.4 Keep the host context in state: replace this line with a useState<McpUiHostContext | undefined>().
  //    Then fill the two other 🔨 3.4 markers below, so it holds the first context and every change.
  // 🧠 McpUiHostContext is everything the host tells the view about where it is rendered: theme, styles,
  //    displayMode and availableDisplayModes, containerDimensions, locale, timeZone, safeAreaInsets, toolInfo.
  //    Every field is optional. Each host sends what it has.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (McpUiHostContext)
  const hostContext = undefined as McpUiHostContext | undefined;
  const [entry, setEntry] = useState<Entry>('summary');
  const [range, setRange] = useState<DateRange>({});
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  /** False until the model's own tool call has landed. Until then, there is nothing to show and nothing to fetch. */
  const [ready, setReady] = useState(false);

  // ✅ 3.1 Connect to the host. useApp creates an App, connects it over postMessage, and returns it after the handshake.
  const { app, error } = useApp({
    appInfo: { name: 'Expensify', version: '1.0.0' },
    capabilities: {},
    // Runs before the handshake. Tool input and result arrive once, right after it, so listen first.
    onAppCreated: (created) => {
      // ✅ 3.2 What the model asked for. Seed the controls with it, so they match the result about to arrive.
      created.addEventListener('toolinput', ({ arguments: args }) => {
        setRange({ from: str(args?.from), to: str(args?.to) });
        const g = GROUP_BY.find((x) => x === args?.groupBy);
        if (g) setGroupBy(g);
      });
      // ✅ 3.3 What the server answered. structuredContent is typed by the tool's outputSchema.
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
      // 🔨 3.4 (part 3) Listen for 'hostcontextchanged' and merge it into hostContext.
      //    The host sends only the fields that changed, so spread the change over the previous value.
      // 💡 setHostContext((prev) => ({ ...prev, ...changed }))
      // 📡 Flip the host's light/dark toggle: ui/notifications/host-context-changed with just { theme }.
    }
  });

  // 🔨 3.4 (part 2) Once app is connected, put its first context into state with app.getHostContext().
  // 💡 A useEffect that runs when app changes.
  // 🧠 The first context comes in the ui/initialize result, before any change notification. Without this,
  //    the view would know nothing until the user changed something in the host.

  // tenet-ui switches palettes with data-color-mode. The host says light or dark in hostContext.theme.
  useEffect(() => {
    document.documentElement.dataset.colorMode = hostContext?.theme ?? 'light';
  }, [hostContext]);

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

  const padding: CSSProperties = {};

  return (
    <main style={padding}>
      {/* 🔥 3.4 Bonus: when hostContext.availableDisplayModes includes 'fullscreen', put a button inside the
          Toolbar that calls app.requestDisplayMode({ mode: 'fullscreen' }), or 'inline' to go back.
          hostContext.displayMode says which one you are in now. */}
      <Toolbar range={range} onRange={onRange} />

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
