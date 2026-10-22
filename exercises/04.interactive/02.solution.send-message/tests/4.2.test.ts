/**
 * 🧪 4.2 "Ask" sends a user message to the conversation with app.sendMessage.
 */
import { FakeApp } from '@workshop/shared/test-view.tsx';
import type { App } from '@modelcontextprotocol/ext-apps';
import { describe, expect, test } from 'vitest';
import { askAbout, question } from '../ui/chat.ts';

describe('4.2 send message', () => {
  test('askAbout sends the question as one user message', async () => {
    const fake = new FakeApp();
    await askAbout(fake as unknown as App, 'category', 'food', null);
    expect(fake.calls).toEqual([
      { method: 'ui/message', params: { role: 'user', content: [{ type: 'text', text: question('category', 'food', null) }] } }
    ]);
  });
});
