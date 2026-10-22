# 3.3 Render the tool result

🔨 **Your task:** Listen for `'toolresult'` and put its `structuredContent` into state, so the dashboard renders.

**Where:** `ui/mcp-app.tsx`: the 🔨 3.3 marker inside `onAppCreated`.

## 🧠 How it works

**A tool result has two halves.** `content` is text for the model to read and quote. `structuredContent` is data for code, shaped by the tool's `outputSchema`. The view renders from `structuredContent` and never parses the text.

**`outputSchema`** is declared on the server, so the shape is a contract. `isSummary` and `isExpenseList` still check it at runtime, because the view can't assume which tool opened it.

**One view, two tools.** `get_summary` and `list_expenses` both point at this view. The shape of the data says which one it was. If there's no data, `hostContext.toolInfo` names the tool.

**Why not fetch on load?** The result is already here. Calling `get_summary` again from the view would double the work and race the model's own call for the same numbers.

**`'toolcancelled'`** (🔥) fires when the user stops the call. The view should stop waiting.

## 📡 In the protocol log

`ui/notifications/tool-result`, host → view. Open it next to the `tools/call` result on the server side: it's the same object.

## What breaks without it

The view connects, then waits forever.

## 🧪 Check it

`npm test`. In the host, call `get_summary` (the dashboard renders), then `list_expenses` (the table renders).

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Who reads `content`, and who reads `structuredContent`?
2. How does the view know whether `get_summary` or `list_expenses` opened it?
3. Why doesn't the view call `get_summary` itself when it loads?

## 📖 Read more

- [App events](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
