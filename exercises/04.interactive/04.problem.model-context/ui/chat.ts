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

/**
 * The model did not make these changes. Tell it quietly, or it will answer from stale numbers.
 * The host keeps only the latest update, so the caller always passes the whole list.
 */
export async function reportDeletions(app: App, deleted: readonly string[]): Promise<void> {
  const text = `The user deleted these expenses in the Expensify dashboard, so earlier totals in this conversation are out of date:\n${deleted.map((d) => `- ${d}`).join('\n')}`;
  // 🔨 4.4 Put `text` in the model's context with app.updateModelContext, as one text content block.
  // 💡 app.updateModelContext({ content: [ ... ] })
  // 🧠 Unlike sendMessage, this starts no turn and shows nothing in the chat. The host keeps the latest
  //    update from this view and hands it to the model with the next user message. Each update replaces
  //    the one before, which is why Dashboard sends every deletion so far, not just the newest.
  // 📡 Delete a row: ui/update-model-context from the view, and the model-context card in the conversation pane.
  // 🧪 npm test calls reportDeletions with a fake app and checks what it sent.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (App.updateModelContext)
}
