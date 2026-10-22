# 6 Deploy it

The same server, from localhost to a public HTTPS URL on Cloudflare Workers. That URL is what section 7 plugs into every host.

| Step | You write | Where |
|---|---|---|
| 6.1 | `createMcpHandler` behind a Workers fetch handler | `server/worker.ts` |

Deploying needs a free Cloudflare account. Without one, finish the step and run the tests; the deploy commands are in the step's README for later.

Start with `npm run go 6.1`.
