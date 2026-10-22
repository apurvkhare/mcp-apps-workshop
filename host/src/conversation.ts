/**
 * Workshop addition: a stand-in for the chat.
 * There is no model here, so the attendee plays it: they call tools by hand. What the view says back to
 * "the model" lands here instead: ui/message as a user turn, ui/update-model-context as a pinned card.
 */
export type Turn =
  | { kind: "call"; seq: number; tool: string; input: Record<string, unknown> }
  | { kind: "message"; seq: number; from: string; text: string };

let turns: Turn[] = [];
let context: { from: string; text: string } | null = null;
let seq = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const getTurns = () => turns;
export const getModelContext = () => context;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addCall(tool: string, input: Record<string, unknown>) {
  turns = [...turns, { kind: "call", seq: seq++, tool, input }];
  notify();
}

export function addMessage(from: string, text: string) {
  turns = [...turns, { kind: "message", seq: seq++, from, text }];
  notify();
}

/** The host keeps only the latest update from a view, as the spec says; null clears it. */
export function setModelContext(from: string, text: string | null) {
  context = text ? { from, text } : null;
  notify();
}
