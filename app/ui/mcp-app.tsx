/**
 * The Expensify view: an MCP App. The host renders this page in a sandboxed iframe under the
 * get_summary or list_expenses call, and the two talk over postMessage (JSON-RPC).
 *
 *   in:  tool input and tool result (what the model asked, what the server answered), host context (theme, size, ...)
 *   out: tool calls (filters, drill-down, delete), a chat message, and a quiet update to the model's context
 */
import type { App, McpUiHostContext } from '@modelcontextprotocol/ext-apps';
import { useApp, useHostStyles } from '@modelcontextprotocol/ext-apps/react';
import { Breakdown, ExpenseTable, Notice, Toolbar, Totals, type DateRange } from '@workshop/shared/components.tsx';
import { GROUP_BY, formatINR, type Expense, type GroupBy, type Summary } from '@workshop/shared/expenses.ts';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { deleteExpense, getSummary, isExpenseList, isSummary, listExpenses, narrowBy, type TableFilter } from './data.ts';
import { bridgeHostTheme } from './host-bridge.ts';
import 'tenet-ui/tokens.css';
import '@workshop/shared/dashboard.css';

/** Which tool opened the view decides which half it leads with. */
type Entry = 'summary' | 'list';

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

function ExpensifyApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();
  const [entry, setEntry] = useState<Entry>('summary');
  const [range, setRange] = useState<DateRange>({});
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  /** False until the model's own tool call has landed. Until then, there is nothing to show and nothing to fetch. */
  const [ready, setReady] = useState(false);

  const { app, error } = useApp({
    appInfo: { name: 'Expensify', version: '1.0.0' },
    capabilities: {},
    // Runs before the handshake. Tool input and result arrive once, right after it, so listen first.
    onAppCreated: (created) => {
      created.addEventListener('toolinput', ({ arguments: args }) => {
        // What the model asked for. Seed the controls with it, so they match the result about to arrive.
        setRange({ from: str(args?.from), to: str(args?.to) });
        const g = GROUP_BY.find((x) => x === args?.groupBy);
        if (g) setGroupBy(g);
      });
      created.addEventListener('toolresult', (result) => {
        // What the server answered. structuredContent is typed by the tool's outputSchema.
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
      created.addEventListener('toolcancelled', () => setReady(true));
      // Theme, display mode, container size: the host sends only what changed.
      created.addEventListener('hostcontextchanged', (changed) => setHostContext((prev) => ({ ...prev, ...changed })));
    }
  });

  // The first context comes with the handshake.
  useEffect(() => {
    if (app) setHostContext(app.getHostContext());
  }, [app]);

  // Put the host's CSS variables and fonts on the document, then point tenet-ui's tokens at them.
  useHostStyles(app, hostContext);
  useEffect(() => bridgeHostTheme(hostContext), [hostContext]);

  if (error) return <Notice tone="error">Could not connect to the host: {error.message}</Notice>;
  if (!app || !ready) return <Notice>Waiting for the host…</Notice>;

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
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());
  const deleted = useRef<string[]>([]);

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

  // Hand a question back to the conversation. The host shows it as a user message and the model answers.
  const ask = (key: string) => {
    const scope = summary?.from || summary?.to ? ` between ${summary?.from ?? 'the start'} and ${summary?.to ?? 'today'}` : '';
    void app.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: `Tell me more about my ${groupBy} "${key}" spending${scope}. Is anything unusual?` }]
    });
  };

  const onDelete = async (e: Expense) => {
    setBusy((b) => new Set(b).add(e.id));
    setProblem(null);
    try {
      await deleteExpense(app, e.id);
      deleted.current.push(`${e.merchant}, ${formatINR(e.amount)} on ${e.date} (${e.id})`);
      // The model did not make this change. Tell it quietly, or it will answer from stale numbers.
      // The host keeps only the latest update, so always send the whole list.
      await app
        .updateModelContext({
          content: [
            {
              type: 'text',
              text: `The user deleted these expenses in the Expensify dashboard, so earlier totals in this conversation are out of date:\n${deleted.current.map((d) => `- ${d}`).join('\n')}`
            }
          ]
        })
        .catch(() => {
          // Not every host takes context updates. The delete itself already succeeded.
        });
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

  const canFullscreen = hostContext?.availableDisplayModes?.includes('fullscreen');
  const isFullscreen = hostContext?.displayMode === 'fullscreen';
  const insets = hostContext?.safeAreaInsets;

  return (
    <main style={{ paddingTop: insets?.top, paddingRight: insets?.right, paddingBottom: insets?.bottom, paddingLeft: insets?.left }}>
      <Toolbar range={range} onRange={onRange}>
        {canFullscreen && (
          <button type="button" className="button" onClick={() => void app.requestDisplayMode({ mode: isFullscreen ? 'inline' : 'fullscreen' })}>
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        )}
      </Toolbar>

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
            barAction={(key) => (
              <button type="button" className="link" onClick={() => ask(key)} aria-label={`Ask about ${key}`}>
                Ask
              </button>
            )}
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
          onDelete={onDelete}
          busy={busy}
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExpensifyApp />
  </StrictMode>
);
