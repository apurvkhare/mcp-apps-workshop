# 6.1 Run the same server on Cloudflare Workers

🔨 **Your task:** Finish `server/worker.ts`: the same `createServer` behind a fetch handler. Then deploy it, if you have a Cloudflare account.

**Where:** `server/worker.ts`: two 🔨 6.1 markers.

## 🧠 How it works

**One server, two entries.** `createServer` knows nothing about transports. `createMcpHandler` turns it into `{ fetch(request) }`: a Request in, a Response out. Node needs `http.ts` to adapt to that. Workers already speaks it.

**Stateless Streamable HTTP.** Every request carries everything the server needs, so any Worker instance, anywhere, can answer it. Nothing ties a client to one process.

**The view ships inside the Worker.** `import viewHtml from '../dist/mcp-app.html'`: Wrangler bundles the built file as a string.

**What changes for production:**
- auth (OAuth 2.1) in front of `/mcp`
- a real database (D1 or KV) instead of the in-memory store, which each Worker instance keeps separately
- `_meta.ui.domain` for a stable origin

This deploy has no login and only demo data, so it's fine to share for the workshop.

## 📡 In the protocol log

Point the workshop host at your Worker (see "Deploy" below) and call `get_summary`: the same messages as on localhost.

## What breaks without it

Nothing changes locally. There's just no way to reach the server from a real host.

## 🧪 Check it

`npm test` sends real MCP requests through the fetch handler.

**Deploy** (needs a free Cloudflare account):

```bash
npx wrangler login
npm run deploy
```

It prints a `https://expensify-mcp-app.<you>.workers.dev` URL. Your server is at that URL plus `/mcp`. Point the workshop host at it:

```bash
npm start -- --server https://expensify-mcp-app.<you>.workers.dev/mcp
```

To try it locally first, build the view with `npm run build` (or keep `npm start` running), then run `npx wrangler dev` and use `http://localhost:8787/mcp`. `worker.ts` imports `../dist/mcp-app.html`, and `npm run go` clears `dist`, so the build has to come first.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. What does `createMcpHandler` return, and why does that make Workers easy?
2. Why does a stateless server suit serverless platforms?
3. Name two things you would change before real people put real expenses in this.

## 📖 Read more

- [Cloudflare Workers: fetch handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
