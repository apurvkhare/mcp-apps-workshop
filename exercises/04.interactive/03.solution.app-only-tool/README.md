# ✅ 4.3 Delete with an app-only tool

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Make `delete_expense` app-only with `visibility: ['app']`, and call it from the view.

**Where:** `server/server.ts`: the 4.3 change on `delete_expense`. `ui/data.ts`: the 4.3 change in `deleteExpense`.

**📡 In the protocol log:** The host's tool picker (which plays the model) no longer offers `delete_expense`. Click Delete on a row: `tools/call` from the view, then to the server, then a `get_summary` and a `list_expenses` to refresh.

## Explain it back

1. Who enforces `visibility`? What would happen if a host ignored it?
2. Why does the handler still validate the id?
3. What would `visibility: ['model']` mean?

**Next:** `npm run go 4.4`
