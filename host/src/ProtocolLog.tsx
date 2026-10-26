/**
 * Workshop addition: the protocol log panel. Every JSON-RPC message on both of the host's connections,
 * newest at the bottom. Click a row to see the raw message.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { clearLog, getEntries, subscribe, type Channel, type LogEntry } from "./protocol-log";
import styles from "./index.module.css";

/** Sent many times a second while a view resizes. Hidden by default so the interesting messages stand out. */
const NOISY = new Set(["ui/notifications/size-changed"]);

function arrow(e: LogEntry): string {
  const other = e.channel === "server" ? "server" : "view";
  return e.direction === "out" ? `host → ${other}` : `${other} → host`;
}

const t0 = Date.now();
const clock = (time: number) => `${((time - t0) / 1000).toFixed(1)}s`;

export function ProtocolLog() {
  const entries = useSyncExternalStore(subscribe, getEntries);
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [hideNoise, setHideNoise] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stickToBottom = useRef(true);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (channel === "all" || e.channel === channel) &&
        !(hideNoise && NOISY.has(e.method)) &&
        (!q || e.method.toLowerCase().includes(q) || JSON.stringify(e.message).toLowerCase().includes(q)),
    );
  }, [entries, channel, hideNoise, query]);

  useEffect(() => {
    const list = listRef.current;
    if (list && stickToBottom.current) list.scrollTop = list.scrollHeight;
  }, [shown.length]);

  return (
    <section className={styles.protocolLog} aria-label="Protocol log">
      <header className={styles.logHead}>
        <h2>Protocol log</h2>
        <span className={styles.logCount}>{shown.length} of {entries.length}</span>
        <button type="button" className={styles.smallButton} onClick={clearLog}>Clear</button>
      </header>
      <div className={styles.logFilters}>
        <div className={styles.segmented} role="group" aria-label="Connection">
          {(["all", "server", "view"] as const).map((c) => (
            <button key={c} type="button" aria-pressed={channel === c} onClick={() => setChannel(c)}>
              {c === "all" ? "Both" : c === "server" ? "Host ⇄ server" : "Host ⇄ view"}
            </button>
          ))}
        </div>
        <input type="search" placeholder="Filter by method or content" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className={styles.checkbox}>
          <input type="checkbox" checked={hideNoise} onChange={(e) => setHideNoise(e.target.checked)} />
          Hide size-changed
        </label>
      </div>
      <ol
        ref={listRef}
        className={styles.logList}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
      >
        {shown.map((e) => (
          <li key={e.seq} className={`${styles.logRow} ${styles[`kind_${e.kind}`] ?? ""} ${e.method.startsWith("workshop/") ? styles.kind_workshop : ""}`}>
            <button type="button" onClick={() => setOpen(open === e.seq ? null : e.seq)} aria-expanded={open === e.seq}>
              <span className={styles.logTime}>{clock(e.time)}</span>
              <span className={`${styles.logChannel} ${styles[`channel_${e.channel}`]}`}>{arrow(e)}</span>
              <span className={styles.logMethod}>
                {e.method}
                {e.kind === "response" && <em> result</em>}
                {e.kind === "error" && <em> error</em>}
              </span>
              {/* Workshop: string ids such as "server-discover-probe-1" are cut short; hover for the full id. */}
              {e.id !== undefined && <span className={styles.logId} title={`#${String(e.id)}`}>#{String(e.id)}</span>}
            </button>
            {open === e.seq && (
              <pre className={styles.logJson}>
                {e.source ? `// ${e.source}\n` : ""}
                {JSON.stringify(e.message, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
