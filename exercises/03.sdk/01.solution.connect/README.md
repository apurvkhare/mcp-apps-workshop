# ✅ 3.1 Connect to the host with useApp

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Replace the two stub lines with one call to `useApp`, so the view connects to the host.

**Where:** `ui/mcp-app.tsx`: the 3.1 change in `ExpensifyApp`.

**📡 In the protocol log:** `ui/initialize` (view → host) and its result: open it and look at `hostContext`. Then `ui/notifications/initialized`, then `tool-input` and `tool-result` from the host. Nothing handles those yet.

## Explain it back

1. Why do listeners go in `onAppCreated`, and not after `useApp` returns?
2. What does the host send back in the `ui/initialize` result?
3. The view and the server both speak JSON-RPC. Which one does the view actually talk to?

**Next:** `npm run go 3.2`
