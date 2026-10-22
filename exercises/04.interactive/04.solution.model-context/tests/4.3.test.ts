/**
 * 🧪 4.3 delete_expense is app-only, and the view calls it.
 */
import { connect, toolUi } from '@workshop/shared/test-server.ts';
import { FakeApp } from '@workshop/shared/test-view.tsx';
import type { App } from '@modelcontextprotocol/ext-apps';
import { describe, expect, test } from 'vitest';
import { createServer, VIEW_URI } from '../server/server.ts';
import { deleteExpense } from '../ui/data.ts';

describe('4.3 app-only tool', () => {
  test("delete_expense has visibility ['app'] and points at the view", async () => {
    const { client } = await connect(createServer);
    const { ui } = await toolUi(client, 'delete_expense');
    expect(ui?.visibility, 'delete_expense has no _meta.ui.visibility').toEqual(['app']);
    expect(ui?.resourceUri).toBe(VIEW_URI);
  });

  test('the server still deletes, and still refuses an unknown id', async () => {
    const { client, store } = await connect(createServer);
    const id = store.list({ limit: 1 })[0]!.id;
    const ok = await client.callTool({ name: 'delete_expense', arguments: { id } });
    expect(ok.isError).toBeFalsy();
    expect(store.get(id)).toBeUndefined();
    const again = await client.callTool({ name: 'delete_expense', arguments: { id } });
    expect(again.isError).toBe(true);
  });

  test('deleteExpense calls delete_expense with the id', async () => {
    const fake = new FakeApp();
    fake.toolResults.delete_expense = { content: [{ type: 'text', text: 'Deleted e1' }] };
    await expect(deleteExpense(fake as unknown as App, 'e1')).resolves.toBe('Deleted e1');
    expect(fake.calls[0]?.params).toEqual({ name: 'delete_expense', arguments: { id: 'e1' } });
  });

  test('deleteExpense throws when the server refuses', async () => {
    const fake = new FakeApp();
    fake.toolResults.delete_expense = { content: [{ type: 'text', text: 'No expense with id e999.' }], isError: true };
    await expect(deleteExpense(fake as unknown as App, 'e999')).rejects.toThrow('No expense with id e999.');
  });
});
