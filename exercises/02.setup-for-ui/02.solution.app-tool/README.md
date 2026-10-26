# ✅ 2.2 Link get_summary to the view

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Make `get_summary` an app tool: register it with `registerAppTool` and give it `_meta.ui.resourceUri`.

**Where:** `server/server.ts`: two 2.2 changes on `get_summary`. 🔥 `list_expenses` is the bonus.

**📡 In the protocol log:** Reload the workshop host page (it reads `tools/list` once, when it loads), then call `get_summary`. On the host ⇄ server side: `tools/call`, then `resources/read` for `ui://expensify/dashboard.html`. The view renders and says "Waiting for the host…". Nothing comes from the view itself yet: it doesn't know how to talk. That's section 3.

## Explain it back

1. Where does a host learn which view belongs to a tool, and when?
2. What does a host without MCP Apps support show for `get_summary`?
3. In the log, `tools/call` comes before `resources/read`. Could a host do it the other way round? Why might it want to?

**Next:** `npm run go 3.1`
