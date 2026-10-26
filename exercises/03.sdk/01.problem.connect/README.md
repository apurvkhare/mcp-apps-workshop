# 3.1 Connect to the host with useApp

🔨 **Your task:** Replace the two stub lines with one call to `useApp`, so the view connects to the host.

**Where:** `ui/mcp-app.tsx`: the 🔨 3.1 marker in `ExpensifyApp`.

## 🧠 How it works

**The view only ever talks to the host**, over `postMessage`, in JSON-RPC: the same message shapes as MCP, on a different transport. It never reaches the server directly.

**`App`** is the SDK's class for the view's side: `new App(appInfo, capabilities)`, then `app.connect()` over a `PostMessageTransport` to `window.parent`. **`useApp`** does both inside React and returns `{ app, isConnected, error }`. `app` stays `null` until the handshake is done.

**The handshake:** the view sends `ui/initialize` with its `appInfo` and `capabilities`. The host answers with its own info, its capabilities, and the first **host context** (theme, styles, size, and more). The view confirms with `ui/notifications/initialized`.

**`onAppCreated`** runs after `new App()` and before `connect()`. It's where listeners go, because the host sends the tool input and result **once**, right after the handshake. A listener added later would miss them. Steps 3.2 to 3.4 fill it in.

**`capabilities`** says what the view supports beyond the basics, such as the display modes it can handle. `{}` is fine here.

## 📡 In the protocol log

`ui/initialize` (view → host) and its result: open it and look at `hostContext`. Then `ui/notifications/initialized`, then `tool-input` and `tool-result` from the host. Nothing handles those yet.

## What breaks without it

No handshake, so the host never sends the input or the result. The view says "Waiting for the host…" forever.

## 🧪 Check it

`npm test`. In the host, call `get_summary`: the view now shows a message starting "Connected. Waiting for the result".

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why do listeners go in `onAppCreated`, and not after `useApp` returns?
2. What does the host send back in the `ui/initialize` result?
3. The view and the server both speak JSON-RPC. Which one does the view actually talk to?

## 📖 Read more

- [React: useApp](https://apps.extensions.modelcontextprotocol.io/api/modules/_modelcontextprotocol_ext-apps_react.html)
- [App](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
