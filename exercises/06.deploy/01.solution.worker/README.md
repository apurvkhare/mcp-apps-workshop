# ✅ 6.1 Run the same server on Cloudflare Workers

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Finish `server/worker.ts`: the same `createServer` behind a fetch handler. Then deploy it, if you have a Cloudflare account.

**Where:** `server/worker.ts`: two 6.1 changes.

**📡 In the protocol log:** Point the workshop host at your Worker with `npm start -- --server https://expensify-mcp-app.<you>.workers.dev/mcp` (or `http://localhost:8787/mcp` for `npx wrangler dev`, after `npm run build`) and call `get_summary`: the same messages as on localhost.

## Explain it back

1. What does `createMcpHandler` return, and why does that make Workers easy?
2. Why does a stateless server suit serverless platforms?
3. Name two things you would change before real people put real expenses in this.

**That was the last step.** Section 7 puts this server in every host.
