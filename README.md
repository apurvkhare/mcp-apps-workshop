# MCP Apps Workshop

Hands-on workshop material for **MCP Apps with React** (React India). You build Expensify, an expense tracker in INR, as an MCP server with a React dashboard that renders inside Claude, ChatGPT, VS Code and other MCP Apps hosts.

> Work in progress. The finished reference app is in place. The step-by-step exercises, slides and handouts come next.

## Run the reference app

Needs Node 22 or later.

```bash
npm install
npm start -- --app app
```

`npm start` builds the view, starts the MCP server on `http://localhost:3001/mcp`, and opens the local test host on `http://localhost:8080`. Pick `get_summary` and press **Call Tool**.

Other commands:

| Command | What it does |
|---|---|
| `npm run smoke` | Calls every tool, resource and prompt on the running server, like a host would |
| `npm run typecheck` | Typechecks the server, the view and the shared code |
| `APP_DIR=app npm run build` | Builds the view into `app/dist/mcp-app.html`, one self-contained file |
| `npm run deploy` | Builds the view and deploys the server to Cloudflare Workers (needs a free Cloudflare account) |

## What is where

| Path | What it is |
|---|---|
| `app/server/server.ts` | The MCP server: four tools, a resource, a prompt, and the `ui://` view resource |
| `app/server/http.ts` | Local entry: Node `http` plus `createMcpHandler` on port 3001 |
| `app/server/worker.ts` | Cloudflare Workers entry: the same server |
| `app/ui/mcp-app.tsx` | The view: `useApp`, tool input and result, host context, tool calls back, messages to the chat |
| `app/ui/data.ts` | Every `callServerTool` the view makes |
| `app/ui/host-bridge.ts` | Maps the host's theme variables onto tenet-ui tokens |
| `shared/` | The expense store and the presentational components. Not MCP code, and shared by every step |
| `host/` | The local MCP Apps host, vendored from the official SDK's `basic-host` example |
