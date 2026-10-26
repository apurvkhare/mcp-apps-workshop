# ✅ 5.3 Load a web font through the CSP

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** The view now loads the Newsreader font from Google Fonts, and the sandbox blocks it. Find the violation in the protocol log, then allow the font's origins with `_meta.ui.csp.resourceDomains`.

**Where:** `server/server.ts`: the 5.3 change in the view resource. The font link is already in `ui/mcp-app.html`.

**📡 In the protocol log:** Before the fix: `workshop/csp-violation` from the view, naming `fonts.googleapis.com`. That message isn't part of MCP: the workshop host reports violations so you can see them. After the fix: none, and the dashboard headings switch to Newsreader. Offline, the violation still goes away, but the font itself only loads with internet.

## Explain it back

1. Why does the font need two origins?
2. Which CSP field would a `fetch()` to your own API need?
3. Who builds the CSP: the server, the host or the view?

**Next:** `npm run go 6.1`
