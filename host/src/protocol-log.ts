/**
 * Workshop addition: records every JSON-RPC message on both of the host's connections,
 *   server: host ⇄ MCP server (Streamable HTTP)
 *   view:   host ⇄ MCP App view (postMessage, through the sandbox proxy)
 * so attendees can read the protocol instead of reading about it.
 *
 * It works by tapping a Transport: wrapping send() for outgoing messages and onmessage for incoming ones.
 * Nothing about the protocol changes; the log only watches.
 */
import type { Transport } from "@modelcontextprotocol/client";

export type Channel = "server" | "view";
export type Direction = "out" | "in";

export interface LogEntry {
  seq: number;
  time: number;
  channel: Channel;
  /** "out" is host → server or host → view. "in" is the reverse. */
  direction: Direction;
  /** Which view, when there are several tool calls on screen. */
  source?: string;
  kind: "request" | "response" | "error" | "notification";
  /** The method, or for a response, the method of the request it answers. */
  method: string;
  id?: string | number;
  message: unknown;
}

const MAX_ENTRIES = 1000;
let entries: LogEntry[] = [];
let seq = 0;
const listeners = new Set<() => void>();
/** Request methods by id, per channel and source, so a response can say what it answers. */
const pending = new Map<string, string>();

function notify() {
  for (const listener of listeners) listener();
}

export function getEntries(): readonly LogEntry[] {
  return entries;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function clearLog() {
  entries = [];
  notify();
}

export function record(channel: Channel, direction: Direction, message: unknown, source?: string) {
  const m = message as { id?: string | number; method?: string; error?: unknown; result?: unknown };
  const key = `${channel}:${source ?? ""}:${direction === "out" ? "out" : "in"}:${m.id}`;
  const replyKey = `${channel}:${source ?? ""}:${direction === "out" ? "in" : "out"}:${m.id}`;
  let kind: LogEntry["kind"];
  let method: string;
  if (m.method !== undefined) {
    kind = m.id !== undefined ? "request" : "notification";
    method = m.method;
    if (m.id !== undefined) pending.set(key, m.method);
  } else {
    kind = m.error !== undefined ? "error" : "response";
    method = pending.get(replyKey) ?? "(response)";
    pending.delete(replyKey);
  }
  entries = [...entries.slice(-(MAX_ENTRIES - 1)), { seq: seq++, time: Date.now(), channel, direction, source, kind, method, id: m.id, message }];
  notify();
}

/** Wrap a transport so every message through it is recorded. Returns the same transport. */
export function tapTransport<T extends Transport>(transport: T, channel: Channel, source?: string): T {
  const send = transport.send.bind(transport);
  transport.send = (message, options) => {
    record(channel, "out", message, source);
    return send(message, options);
  };
  // The protocol layer assigns onmessage during connect(), so intercept the assignment.
  let handler = transport.onmessage;
  Object.defineProperty(transport, "onmessage", {
    configurable: true,
    get: () => handler,
    set: (next: Transport["onmessage"]) => {
      handler = next
        ? (message, extra) => {
            record(channel, "in", message, source);
            next(message, extra);
          }
        : next;
    }
  });
  return transport;
}
