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
  // 🔨 4.2 Send `text` to the conversation as a user message, with app.sendMessage.
  // 💡 app.sendMessage({ role: 'user', content: [ ... ] }). content is a list of MCP content blocks,
  //    the same { type: 'text', text } blocks a tool result uses.
  // 🧠 The view can't talk to the model directly, and it can't speak as the assistant: role is always 'user'.
  //    A host may ask the user first, or refuse. Use it when the user asked for something the model should do.
  // 📡 Click "Ask" on a bar: ui/message from the view, and a new user turn in the conversation pane.
  // 🧪 npm test calls askAbout with a fake app and checks the message it sent.
  // 📖 https://apps.extensions.modelcontextprotocol.io/api/modules/app.html (App.sendMessage)
}
