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
  // Step 3.4 fills this in with what the host says about where the view is rendered.
  const hostContext = undefined as McpUiHostContext | undefined;
  const [entry, setEntry] = useState<Entry>('summary');
  const [range, setRange] = useState<DateRange>({});
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  /** False until the model's own tool call has landed. Until then, there is nothing to show and nothing to fetch. */
  const [ready, setReady] = useState(false);

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
