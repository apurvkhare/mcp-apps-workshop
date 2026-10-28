# 1 MCP in practice

No code in this section. You'll walk through the finished Expensify server with MCP Inspector and read the protocol as it goes by.

## Run it

```bash
npm start -- --app app
```

Then, in a second terminal:

```bash
npm run inspect
```

Inspector starts on `http://127.0.0.1:6274`, already pointed at `http://localhost:3001/mcp`. If your browser doesn't open by itself, open the full URL it prints (it includes a token). Turn on the switch next to `localhost:3001`: it says **Connected** and `MCP 2026-07-28`.

## Follow along

1. **Tools.** List them, then call `get_summary` with `{ "groupBy": "category" }`. Look at the result: `content` (text) and `structuredContent` (data).
2. **Resources.** Read `expenses://categories`.
3. **Prompts.** Get `monthly_review`, with and without a `month`.
4. **Protocol.** In the **Protocol** pane on the right, the **Messages** list has every message. Find `server/discover` first, then open each request and its response, and find the `id` that pairs them.

📡 You should see `server/discover`, then `tools/list`, `tools/call`, `resources/read` and `prompts/get`, each with a request and a response.

## 🧠 What to take from it

- **Why MCP exists:** every AI app used to need its own integration with every tool. MCP is one protocol between any host and any server.
- **Host, client, server:** the host is the AI app (Claude, ChatGPT, VS Code). It runs one client per server it connects to.
- **Who controls what:** the model calls **tools**, the app attaches **resources**, the user picks **prompts**.
- **JSON-RPC:** a request has an `id`, a `method` and `params`. Its response has the same `id` and a `result` or an `error`. A notification has no `id` and gets no response.
- **A tool result has two halves:** `content` for the model, `structuredContent` (typed by `outputSchema`) for code. The rest of the workshop builds on that second half.
- **Transports:** stdio for local processes, Streamable HTTP for everything else. This server uses HTTP, so the same code runs on your laptop and on Cloudflare.

## Explain it back

1. Who decides when a tool is called, when a resource is read, and when a prompt is used?
2. What pairs a response with its request?
3. What's the difference between `content` and `structuredContent`, and who is each one for?

**Next:** `npm run go 2.1`
