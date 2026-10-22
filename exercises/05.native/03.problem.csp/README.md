# 5.3 Load a web font through the CSP

🔨 **Your task:** The view now loads the Newsreader font from Google Fonts, and the sandbox blocks it. Find the violation in the protocol log, then allow the font's origins with `_meta.ui.csp.resourceDomains`.

**Where:** `server/server.ts`: the 🔨 5.3 marker in the view resource. The font link is already in `ui/mcp-app.html`.

## 🧠 How it works

**The sandbox is closed by default.** A host renders the view in a sandboxed iframe and gives it a Content-Security-Policy built from the resource's `_meta.ui.csp`, and nothing else. Without a declaration, the view can load nothing from the network.

**The fields:**
- `resourceDomains`: scripts, styles, images, fonts and media
- `connectDomains`: `fetch`, XHR and WebSocket
- `frameDomains`: iframes inside the view
- `baseUriDomains`: the document's base URI

**The font needs two origins.** The stylesheet comes from `fonts.googleapis.com`. It then loads the font files from `fonts.gstatic.com`.

**Declare the least you need.** Hosts can show these domains to people reviewing an app, and may refuse broad ones.

**The other `_meta.ui` fields on a resource:** `permissions` (camera, microphone, geolocation, clipboard writes), `domain` (a stable origin for the view), and `prefersBorder` (🔥).

**On the web, hosts add a second layer:** a sandbox proxy iframe on a separate origin, which loads the view inside it. The workshop host does the same, on port 8081.

## 📡 In the protocol log

Before the fix: `workshop/csp-violation` from the view, naming `fonts.googleapis.com`. That message isn't part of MCP: the workshop host reports violations so you can see them. After the fix: none, and the dashboard headings switch to Newsreader.

## What breaks without it

The headings fall back to Georgia, and the view logs a CSP violation every time it loads.

## 🧪 Check it

`npm test`. In the host, call `get_summary` and look at the "Where it went" heading.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why does the font need two origins?
2. Which CSP field would a `fetch()` to your own API need?
3. Who builds the CSP: the server, the host or the view?

## 📖 Read more

- [McpUiResourceCsp](https://apps.extensions.modelcontextprotocol.io/api/modules/app-bridge.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
