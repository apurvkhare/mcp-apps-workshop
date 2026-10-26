# 4.3 Delete with an app-only tool

🔨 **Your task:** Make `delete_expense` app-only with `visibility: ['app']`, and call it from the view.

**Where:** `server/server.ts`: the 🔨 4.3 marker on `delete_expense`. `ui/data.ts`: the 🔨 4.3 marker in `deleteExpense`.

## 🧠 How it works

**`_meta.ui.visibility`** says who may call a tool. The default is `['model', 'app']`. `['app']` keeps it out of what the model sees, and lets this server's own view call it. `['model']` would do the opposite.

**Why app-only for a delete?** A person clicked a button on a specific row. The model can't delete on a guess, and the delete doesn't clutter the model's tool list.

**Visibility is a promise from the host, not a lock.** The server can't know who called. So the handler checks its input exactly as it would for a call from the model: an unknown id is an error.

The Delete buttons are already wired in `mcp-app.tsx`. They call `deleteExpense`, then refresh.

## 📡 In the protocol log

Reload the workshop host page (it reads `tools/list` once, when it loads), then look at the tool picker (which plays the model): it no longer offers `delete_expense`. Click Delete on a row: `tools/call` from the view, then to the server, then a `get_summary` and a `list_expenses` to refresh.

## What breaks without it

The model can delete expenses, and the Delete buttons fail.

## 🧪 Check it

`npm test`. Reload the workshop host page, then show the expenses and delete one: the totals drop.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Who enforces `visibility`? What would happen if a host ignored it?
2. Why does the handler still validate the id?
3. What would `visibility: ['model']` mean?

## 📖 Read more

- [McpUiToolMeta](https://apps.extensions.modelcontextprotocol.io/api/modules/app-bridge.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
