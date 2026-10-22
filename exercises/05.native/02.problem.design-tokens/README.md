# 5.2 Map the design system to the host

🔨 **Your task:** Point tenet-ui's tokens at the host's variables, and keep tenet-ui's own values where the host sends nothing.

**Where:** `ui/host-bridge.ts`: two 🔨 5.2 markers.

## 🧠 How it works

**Two vocabularies.** The host speaks `--color-text-primary`. Our design system speaks `--fgColor-default`. `TOKEN_MAP` is the dictionary between them, and it's the only place that knows both.

**Point, don't copy.** Setting `--fgColor-default: var(--color-text-primary)` means the token follows the host's variable. When the host changes theme, nothing has to run again. Values written with `light-dark()` even switch on their own.

**Fallbacks matter.** Each host sends a different subset of variables. A token the host didn't send is removed, so tenet-ui's own value shows through, light or dark. Removing also matters when switching hosts: a token left over from the last host would stick.

**This is the whole adapter.** The components never learn which host they're in.

## 📡 In the protocol log

Switch between the Claude-style and ChatGPT-style presets, and toggle light and dark. Each is one `host-context-changed`, and the dashboard follows every combination.

## What breaks without it

The dashboard keeps tenet-ui's own colours and fonts in every host. It works, but it looks like a guest.

## 🧪 Check it

`npm test`. In the host, cycle through all four presets in light and dark.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why point a token at `var(--color-text-primary)` instead of copying the value?
2. What does a token show when the host didn't send its variable?
3. Where would you change the code to support a third design system?

## 📖 Read more

- [McpUiStyleVariableKey](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
