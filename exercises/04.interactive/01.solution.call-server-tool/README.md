# ✅ 4.1 Call server tools from the view

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Write `getSummary` and `listExpenses` with `app.callServerTool`.

**Where:** `ui/data.ts`: two 4.1 changes.

**📡 In the protocol log:** Change the date range in the view: `tools/call` view → host, then `tools/call` host → server, then both results. The ids differ on the two legs: they are two separate requests.

## Explain it back

1. Trace one click through the log. How many messages, and which ids?
2. Why are the ids different on the view side and the server side?
3. Does the model learn about these calls? Should it?

**Next:** `npm run go 4.2`
