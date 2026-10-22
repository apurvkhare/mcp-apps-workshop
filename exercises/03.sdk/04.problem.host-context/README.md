# 3.4 Follow the host context

🔨 **Your task:** Keep the host context in state: the first one from the handshake, then every change.

**Where:** `ui/mcp-app.tsx`: three 🔨 3.4 markers. 🔥 a fullscreen button in `Dashboard`.

## 🧠 How it works

**`McpUiHostContext`** is what the host says about where the view is rendered: `theme`, `styles`, `displayMode` and `availableDisplayModes`, `containerDimensions`, `locale`, `timeZone`, `platform`, `deviceCapabilities`, `safeAreaInsets` and `toolInfo`. Every field is optional, and each host sends what it has.

**The first context comes in the `ui/initialize` result.** `app.getHostContext()` returns it once connected.

**Changes come as `ui/notifications/host-context-changed`**, with only the fields that changed. Merge each one over what you have; replacing would lose the rest.

In this step the visible effect is the theme: tenet-ui reads `data-color-mode` on `<html>`, so a dark host gets a dark dashboard. Section 5 uses `styles`. The 🔥 bonus uses `displayMode` and `app.requestDisplayMode()`.

## 📡 In the protocol log

Flip the host's ☀️ / 🌙 toggle: `host-context-changed` with just `{ theme }`. Switch the host theme preset: `{ styles }`. Resize the window: `{ containerDimensions }`.

## What breaks without it

The view stays light inside a dark host, and never reacts to anything the host changes.

## 🧪 Check it

`npm test`. In the host, toggle light and dark: the dashboard follows.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Where does the first host context come from, and where do later ones come from?
2. Why merge each change instead of replacing the context?
3. Name three host context fields and what you would do with each.

## 📖 Read more

- [McpUiHostContext](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
