# 2.1 Serve the view as a ui:// resource

🔨 **Your task:** Register the built view as an MCP resource at `ui://expensify/dashboard.html`, with the MCP App MIME type.

**Where:** `server/server.ts`: the 🔨 2.1 marker, under "resources".

## Where you start

The server is an ordinary MCP server: four tools, one resource (`expenses://categories`) and one prompt. Nothing about UI yet.

The view in `ui/` is a starter that only says "Waiting for the host…". `npm start` builds it into `dist/mcp-app.html`, one self-contained file, and `server/http.ts` passes that file to `createServer` as `viewHtml`. It's ready to serve. Nothing serves it yet.

## 🧠 How it works

An MCP App adds exactly two things to a server: **a resource that holds the view's HTML**, and **a tool that points at it**. This step is the first one.

**Why a resource, and not HTML in the tool result?** A resource has a stable URI, so a host can fetch it before the tool runs, cache it, and review it before anything executes. HTML inside every tool result could do none of that.

**`ui://`** is the scheme for views. It's only a name: the host reads it with an ordinary `resources/read`, like any other resource.

**`text/html;profile=mcp-app`** (the `RESOURCE_MIME_TYPE` constant) tells the host this HTML is an MCP App: render it in a sandboxed iframe and talk to it. Plain `text/html` would be shown as text.

**`registerAppResource`** is `registerResource` with that MIME type filled in for `resources/list`. The read callback still sets `mimeType` on the contents it returns, because that's what `resources/read` sends.

**Why one file?** The view runs in a sandbox with no URL of its own to load scripts from. `vite-plugin-singlefile` inlines all the JavaScript and CSS into the HTML.

## 📡 In the protocol log

The host's `resources/list` at connect already lists `ui://expensify/dashboard.html`, but nothing reads it yet: no tool points at the view, so the host never asks for it. To see it now, run `npm run inspect` (MCP Inspector) and open Resources: `ui://expensify/dashboard.html` is listed, and reading it returns the HTML.

## What breaks without it

A tool could point at `ui://expensify/dashboard.html`, but the host's `resources/read` would fail, and no view would render.

## 🧪 Check it

`npm test` lists and reads the resource.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why is the view a resource, rather than part of `get_summary`'s result?
2. What does the `profile=mcp-app` part of the MIME type tell a host?
3. Where does the HTML in `text` come from, and why is it a single file?

## 📖 Read more

- [Server helpers: registerAppResource](https://apps.extensions.modelcontextprotocol.io/api/modules/server-helpers.html)
- [MCP Apps specification](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
