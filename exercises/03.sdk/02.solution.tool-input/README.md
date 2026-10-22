# ✅ 3.2 Read the tool input

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Listen for `'toolinput'` and seed the date range and grouping from the model's arguments.

**Where:** `ui/mcp-app.tsx`: the 3.2 change inside `onAppCreated`.

**📡 In the protocol log:** `ui/notifications/tool-input`, host → view, right after `ui/notifications/initialized`.

## Explain it back

1. Which arrives first, the tool input or the tool result? Why?
2. When would you use `toolinputpartial`, and what should you never do with it?
3. Why does the code check `groupBy` against `GROUP_BY` instead of trusting it?

**Next:** `npm run go 3.3`
