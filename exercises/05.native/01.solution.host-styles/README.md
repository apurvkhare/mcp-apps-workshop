# ✅ 5.1 Apply the host's styles

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Call `useHostStyles(app, hostContext)`, and pad the dashboard by the safe area insets.

**Where:** `ui/mcp-app.tsx`: the 5.1 change in `ExpensifyApp` and the 5.1 change in `Dashboard`.

**📡 In the protocol log:** Switch the host theme preset (SDK basic host, Claude-style, ChatGPT-style, No host styles): one `host-context-changed` carries the whole new set of variables.

## Explain it back

1. Why doesn't the dashboard change colour after this step?
2. What happens to a variable the host didn't send?
3. Where would safe area insets matter?

**Next:** `npm run go 5.2`
