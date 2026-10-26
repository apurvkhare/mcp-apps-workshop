# 2 Setting up for UI

MCP Apps adds exactly two things to an MCP server: **a resource holding the view's HTML**, and **a tool that points at it**. You add both.

| Step | You write | Where |
|---|---|---|
| 2.1 | `registerAppResource` for `ui://expensify/dashboard.html` | `server/server.ts` |
| 2.2 | `registerAppTool` with `_meta.ui.resourceUri` | `server/server.ts` |

By the end, calling `get_summary` in the workshop host renders the view. It only says "Waiting for the host…" for now: it doesn't know how to talk yet.

```
 host ──── tools/call, resources/read ────▶ server
 host ──── renders ────▶ view (sandboxed iframe)
```

Start with `npm run go 2.1`.
