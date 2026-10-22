/**
 * What the view says to the conversation. Two ways, with different weight:
 *
 *   sendMessage         a visible user message. It starts a new turn, so the model answers it.
 *   updateModelContext  a quiet note. Nothing shows in the chat; the model reads it on its next turn.
 */
import type { App } from '@modelcontextprotocol/ext-apps';
import type { GroupBy, Summary } from '@workshop/shared/expenses.ts';

/** The question an "Ask" button sends, scoped to the dates on screen. */
export function question(groupBy: GroupBy, key: string, summary: Summary | null): string {
  const scope = summary?.from || summary?.to ? ` between ${summary?.from ?? 'the start'} and ${summary?.to ?? 'today'}` : '';
  return `Tell me more about my ${groupBy} "${key}" spending${scope}. Is anything unusual?`;
}

export async function askAbout(app: App, groupBy: GroupBy, key: string, summary: Summary | null): Promise<void> {
  const text = question(groupBy, key, summary);
  // ✅ 4.2 Hand the question back to the conversation. The host shows it as a user message and the model answers.
  await app.sendMessage({ role: 'user', content: [{ type: 'text', text }] });
}
