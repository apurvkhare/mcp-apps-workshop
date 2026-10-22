/**
 * Presentational components for the Expensify view. Props in, callbacks out, no MCP.
 * They come ready-made so the workshop time goes to the MCP code that feeds them.
 * Styles: dashboard.css, written only against tenet-ui token names (--fgColor-default, ...).
 */
import { type ReactNode } from 'react';
import { GROUP_BY, formatINR, monthRange, type Expense, type GroupBy, type Summary } from './expenses.ts';

export interface DateRange {
  from?: string;
  to?: string;
}

const PRESETS: { label: string; range: () => DateRange }[] = [
  { label: 'This month', range: () => monthRange(0) },
  { label: 'Last month', range: () => monthRange(-1) },
  { label: 'All time', range: () => ({}) }
];

const sameRange = (a: DateRange, b: DateRange) => (a.from ?? '') === (b.from ?? '') && (a.to ?? '') === (b.to ?? '');

export function Toolbar({ range, onRange, children }: { range: DateRange; onRange(range: DateRange): void; children?: ReactNode }) {
  return (
    <div className="toolbar">
      <div className="segmented" role="group" aria-label="Date range">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" aria-pressed={sameRange(p.range(), range)} onClick={() => onRange(p.range())}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="dates">
        <label>
          <span>From</span>
          <input type="date" value={range.from ?? ''} max={range.to} onChange={(e) => onRange({ ...range, from: e.target.value || undefined })} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={range.to ?? ''} min={range.from} onChange={(e) => onRange({ ...range, to: e.target.value || undefined })} />
        </label>
      </div>
      {children && <div className="toolbar-end">{children}</div>}
    </div>
  );
}

function describeRange({ from, to }: DateRange): string {
  if (!from && !to) return 'all time';
  const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  if (from && to) return `${fmt(from)} to ${fmt(to)}`;
  return from ? `since ${fmt(from)}` : `until ${fmt(to!)}`;
}

export function Totals({ summary, loading }: { summary: Summary | null; loading?: boolean }) {
  const avg = summary && summary.count > 0 ? summary.total / summary.count : undefined;
  return (
    <section className={`totals${loading ? ' is-stale' : ''}`} aria-label="Totals">
      <div className="total-hero">
        <span className="label">Total spend · {summary ? describeRange(summary) : '…'}</span>
        <span className="value">{summary ? formatINR(summary.total) : '–'}</span>
      </div>
      <div className="total-tile">
        <span className="label">Expenses</span>
        <span className="value">{summary ? summary.count : '–'}</span>
      </div>
      <div className="total-tile">
        <span className="label">Average</span>
        <span className="value">{avg !== undefined ? formatINR(avg) : '–'}</span>
      </div>
    </section>
  );
}

interface BreakdownProps {
  summary: Summary | null;
  loading?: boolean;
  groupBy: GroupBy;
  onGroupBy(groupBy: GroupBy): void;
  /** The bar that is currently filtering the table, if any. */
  selected?: string;
  /** Click a bar. Leave it out and the bars are not clickable. */
  onSelect?(key: string | undefined): void;
  /** Extra controls per bar, such as an "Ask" button. */
  barAction?(key: string): ReactNode;
}

export function Breakdown({ summary, loading, groupBy, onGroupBy, selected, onSelect, barAction }: BreakdownProps) {
  const max = Math.max(1, ...(summary?.groups.map((g) => g.total) ?? []));
  return (
    <section className={`panel${loading ? ' is-stale' : ''}`} aria-label="Breakdown">
      <header className="panel-head">
        <h2>Where it went</h2>
        <div className="segmented small" role="group" aria-label="Group by">
          {GROUP_BY.map((g) => (
            <button key={g} type="button" aria-pressed={g === groupBy} onClick={() => onGroupBy(g)}>
              {g}
            </button>
          ))}
        </div>
      </header>
      {!summary || summary.groups.length === 0 ? (
        <p className="empty">{summary ? 'No expenses in this range.' : 'Loading…'}</p>
      ) : (
        <ul className="bars">
          {summary.groups.map((g) => {
            const isSelected = g.key === selected;
            const bar = (
              <>
                <span className="bar-key">{g.key}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(g.total / max) * 100}%` }} />
                </span>
                <span className="bar-value">{formatINR(g.total)}</span>
              </>
            );
            return (
              <li key={g.key} className={isSelected ? 'is-selected' : undefined}>
                {onSelect ? (
                  <button type="button" className="bar" aria-pressed={isSelected} onClick={() => onSelect(isSelected ? undefined : g.key)}>
                    {bar}
                  </button>
                ) : (
                  <div className="bar">{bar}</div>
                )}
                {barAction?.(g.key)}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

interface ExpenseTableProps {
  expenses: Expense[] | null;
  loading?: boolean;
  /** Shown above the table, such as "Filtered by food". */
  caption?: ReactNode;
  /** Leave it out and there is no delete button. */
  onDelete?(expense: Expense): void;
  /** Row ids with a delete in flight. */
  busy?: ReadonlySet<string>;
}

export function ExpenseTable({ expenses, loading, caption, onDelete, busy }: ExpenseTableProps) {
  return (
    <section className={`panel${loading ? ' is-stale' : ''}`} aria-label="Expenses">
      <header className="panel-head">
        <h2>Expenses</h2>
        {caption && <div className="caption">{caption}</div>}
      </header>
      {!expenses || expenses.length === 0 ? (
        <p className="empty">{expenses ? 'No expenses match.' : 'Loading…'}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th className="num">Amount</th>
                {onDelete && <th aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="date">{e.date}</td>
                  <td>
                    {e.merchant}
                    {e.note && <span className="note">{e.note}</span>}
                  </td>
                  <td>
                    <span className="chip">{e.category}</span>
                  </td>
                  <td className="num">{formatINR(e.amount)}</td>
                  {onDelete && (
                    <td className="actions">
                      <button type="button" className="link danger" disabled={busy?.has(e.id)} onClick={() => onDelete(e)}>
                        {busy?.has(e.id) ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'error'; children: ReactNode }) {
  return (
    <p className={`notice notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
