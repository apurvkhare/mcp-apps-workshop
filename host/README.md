> Vendored from [modelcontextprotocol/ext-apps](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/basic-host) (examples/basic-host, commit 82221c0), under the license in `LICENSE-ext-apps`. It is extended into the workshop host: a guide pane, a conversation pane, a protocol log, and theme presets. Changes are marked "Workshop".

## Workshop additions

- **Guide** ([`src/Guide.tsx`](src/Guide.tsx), [`src/markdown.ts`](src/markdown.ts)): the current step's `playground/README.md`, rendered next to the host, with the step's id and title, problem or solution, a strip of every step, and copyable commands. Picking another step shows `npm run go <step>` to copy; it never runs anything. `serve.ts` serves it at `GET /api/guide` and sends `changed` on the `GET /api/guide/events` stream (server-sent events) when `.step.json` or the README changes, so `npm run go` updates the pane without a reload. With `npm start -- --app app` (`APP_DIR=app`) it describes the finished app. The **Guide** button in the toolbar hides it. `markdown.ts` is a small escaping renderer for what the READMEs use, so there's no Markdown dependency.
- **Conversation** (in `src/index.tsx`, [`src/conversation.ts`](src/conversation.ts)): tool calls, `ui/message` and `ui/update-model-context` from the views.
- **Protocol log** ([`src/ProtocolLog.tsx`](src/ProtocolLog.tsx), [`src/protocol-log.ts`](src/protocol-log.ts)): every JSON-RPC message on both connections.
- **Theme presets** ([`src/presets.ts`](src/presets.ts)): host style variables that imitate other hosts.

Layout: from 1700px wide, guide, chat, views and log sit side by side. Below that, the log moves under the views. Below 900px, everything stacks.

# Example: Basic Host

A reference implementation showing how to build an MCP host application that connects to MCP servers and renders tool UIs in a secure sandbox.

This basic host can also be used to test MCP Apps during local development.

## Key Files

- [`index.html`](index.html) / [`src/index.tsx`](src/index.tsx) - React UI host with tool selection, parameter input, and iframe management
- [`sandbox.html`](sandbox.html) / [`src/sandbox.ts`](src/sandbox.ts) - Outer iframe proxy with security validation and bidirectional message relay
- [`src/implementation.ts`](src/implementation.ts) - Core logic: server connection, tool calling, and AppBridge setup

## Getting Started

```bash
npm install
npm run start
# Open http://localhost:8080
```

By default, the host application will try to connect to an MCP server at `http://localhost:3001/mcp`. You can configure this behavior by setting the `SERVERS` environment variable with a JSON array of server URLs:

```bash
SERVERS='["http://localhost:1234/mcp", "http://localhost:5678/mcp"]' npm run start
```

## Architecture

This example uses a double-iframe sandbox pattern for secure UI isolation:

```
Host (port 8080)
  └── Outer iframe (port 8081) - sandbox proxy
        └── Inner iframe (srcdoc) - untrusted tool UI
```

**Why two iframes?**

- The outer iframe runs on a separate origin (port 8081) preventing direct access to the host
- The inner iframe receives HTML via `srcdoc` and is restricted by sandbox attributes
- Messages flow through the outer iframe which validates and relays them bidirectionally

This architecture ensures that even if tool UI code is malicious, it cannot access the host application's DOM, cookies, or JavaScript context.
