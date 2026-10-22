# ✅ 5.2 Map the design system to the host

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Point tenet-ui's tokens at the host's variables, and keep tenet-ui's own values where the host sends nothing.

**Where:** `ui/host-bridge.ts`: two 5.2 changes.

**📡 In the protocol log:** Switch between the Claude-style and ChatGPT-style presets, and toggle light and dark. Each is one `host-context-changed`, and the dashboard follows every combination.

## Explain it back

1. Why point a token at `var(--color-text-primary)` instead of copying the value?
2. What does a token show when the host didn't send its variable?
3. Where would you change the code to support a third design system?

**Next:** `npm run go 5.3`
