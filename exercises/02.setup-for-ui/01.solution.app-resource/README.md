# ✅ 2.1 Serve the view as a ui:// resource

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** Register the built view as an MCP resource at `ui://expensify/dashboard.html`, with the MCP App MIME type.

**Where:** `server/server.ts`: the 2.1 change, under "resources".

**📡 In the protocol log:** Nothing in the workshop host yet: no tool points at the view, so the host never asks for it. To see it now, run `npm run inspect` (MCP Inspector) and open Resources: `ui://expensify/dashboard.html` is listed, and reading it returns the HTML.

## Explain it back

1. Why is the view a resource, rather than part of `get_summary`'s result?
2. What does the `profile=mcp-app` part of the MIME type tell a host?
3. Where does the HTML in `text` come from, and why is it a single file?

**Next:** `npm run go 2.2`
