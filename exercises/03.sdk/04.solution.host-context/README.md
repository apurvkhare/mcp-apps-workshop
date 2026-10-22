# ✅ 3.4 Follow the host context

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Keep the host context in state: the first one from the handshake, then every change.

**Where:** `ui/mcp-app.tsx`: three 3.4 changes. 🔥 a fullscreen button in `Dashboard`.

**📡 In the protocol log:** Flip the host's ☀️ / 🌙 toggle: `host-context-changed` with just `{ theme }`. Switch the host theme preset: `{ styles }`. Resize the window: `{ containerDimensions }`.

## Explain it back

1. Where does the first host context come from, and where do later ones come from?
2. Why merge each change instead of replacing the context?
3. Name three host context fields and what you would do with each.

**Next:** `npm run go 4.1`
