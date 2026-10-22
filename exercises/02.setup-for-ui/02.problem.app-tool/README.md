# 2.2 Link get_summary to the view

🔨 **Your task:** Make `get_summary` an app tool: register it with `registerAppTool` and give it `_meta.ui.resourceUri`.

**Where:** `server/server.ts`: two 🔨 2.2 markers on `get_summary`. 🔥 `list_expenses` is the bonus.

## 🧠 How it works

**The link lives on the tool**, in `_meta.ui.resourceUri`, so it shows up in `tools/list`. A host knows which view belongs to a tool before calling it, and can fetch the view early.

**What a host does with it:** after `tools/call`, it reads the resource, renders it in a sandboxed iframe under the result, and then gives the view the tool's input and result. Section 3 is about that second half.

**The result doesn't change.** `content` is text for the model. `structuredContent` is data for the view. A host without MCP Apps support ignores `_meta` and shows the text, so the same server works everywhere.

**`registerAppTool`** is `registerTool` with `server` as the first argument, plus one convenience: it also copies the URI to the older flat key `_meta["ui/resourceUri"]`, which hosts built before the spec settled still read.

A server can also ask whether the host renders views at all: `getUiCapability(clientCapabilities)` from `@modelcontextprotocol/ext-apps/server`. This server doesn't need to, because its text fallback is already good.

## 📡 In the protocol log

Call `get_summary` in the host. On the host ⇄ server side: `tools/call`, then `resources/read` for `ui://expensify/dashboard.html`. The view renders and says "Waiting for the host…". Nothing comes from the view itself yet: it doesn't know how to talk. That's section 3.

## What breaks without it

The host shows the tool result as JSON, and no view.

## 🧪 Check it

`npm test` checks `_meta.ui.resourceUri` in `tools/list`. Then `npm start` and call `get_summary`.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Where does a host learn which view belongs to a tool, and when?
2. What does a host without MCP Apps support show for `get_summary`?
3. In the log, `tools/call` comes before `resources/read`. Could a host do it the other way round? Why might it want to?

## 📖 Read more

- [Server helpers: registerAppTool](https://apps.extensions.modelcontextprotocol.io/api/modules/server-helpers.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
