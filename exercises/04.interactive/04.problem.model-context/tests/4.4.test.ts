/**
 * 🧪 4.4 After a delete, the view tells the model quietly with app.updateModelContext.
 */
import { FakeApp } from '@workshop/shared/test-view.tsx';
import type { App } from '@modelcontextprotocol/ext-apps';
import { describe, expect, test } from 'vitest';
import { reportDeletions } from '../ui/chat.ts';

describe('4.4 model context', () => {
  test('reportDeletions sends every deletion in one text block', async () => {
    const fake = new FakeApp();
    await reportDeletions(fake as unknown as App, ['Swiggy, ₹486 (e1)', 'Uber, ₹312 (e3)']);
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0]?.method).toBe('ui/update-model-context');
    const params = fake.calls[0]?.params as { content?: { type: string; text: string }[] };
    expect(params.content).toHaveLength(1);
    expect(params.content?.[0]?.type).toBe('text');
    expect(params.content?.[0]?.text).toContain('- Swiggy, ₹486 (e1)');
    expect(params.content?.[0]?.text).toContain('- Uber, ₹312 (e3)');
  });

  test('sends no chat message: the context update is quiet', async () => {
    const fake = new FakeApp();
    await reportDeletions(fake as unknown as App, ['Swiggy, ₹486 (e1)']);
    expect(fake.calls.map((c) => c.method)).not.toContain('ui/message');
  });
});
