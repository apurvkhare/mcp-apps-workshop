# ✅ 3.3 Render the tool result

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Listen for `'toolresult'` and put its `structuredContent` into state, so the dashboard renders.

**Where:** `ui/mcp-app.tsx`: the 3.3 change inside `onAppCreated`.

**📡 In the protocol log:** `ui/notifications/tool-result`, host → view. Open it next to the `tools/call` result on the server side: it's the same object.

## Explain it back

1. Who reads `content`, and who reads `structuredContent`?
2. How does the view know whether `get_summary` or `list_expenses` opened it?
3. Why doesn't the view call `get_summary` itself when it loads?

**Next:** `npm run go 3.4`
