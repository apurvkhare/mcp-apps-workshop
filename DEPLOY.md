# Deploy

Put the Expensify server on a public HTTPS URL with Cloudflare Workers, then add it to real hosts. This is section 6 and 7 of the workshop, and optional: everything before it runs on your laptop.

**What you deploy has no login and only demo data.** Anyone with the URL can read and delete the 30 seeded expenses. Each Worker instance keeps its own copy in memory, and it resets whenever Cloudflare starts a fresh instance. That's fine for a workshop. Don't put real expenses in it. For the production version (OAuth 2.1, a real database), see the MCP Apps masterclass.

## 1. Deploy to Workers

You need a free Cloudflare account. No card is needed.

```bash
npx wrangler login
```

This opens a browser to sign in, once per machine. Then deploy one of these:

```bash
npm run deploy
```

```bash
npm run deploy -- --app app
```

The first deploys your playground. It needs step 6.1 done, because that's where `worker.ts` comes from. The second deploys the finished app.

`deploy` builds the view, then runs `wrangler deploy` with the chosen `server/worker.ts`. The Worker's name and settings are in `wrangler.jsonc`. It prints your URL:

```
https://expensify-mcp-app.<your-subdomain>.workers.dev
```

**Your MCP server is that URL plus `/mcp`.** The rest of this page calls it `YOUR_URL`.

Want to try the Worker before deploying? `npx wrangler dev app/server/worker.ts` runs it locally, in the same runtime, at `http://localhost:8787/mcp`. To check the bundle without uploading anything, run `npm run deploy -- --dry-run`.

## 2. Check it in the workshop host

```bash
npm start -- --server YOUR_URL
```

This runs only the workshop host, connected to your Worker instead of a local server. Call `get_summary`: the same dashboard, and the same messages in the protocol log, now from `*.workers.dev`.

## 3. Add it to a host

Each host connects to `YOUR_URL` with no sign-in. MCP Apps support changes quickly, so check each one shortly before you rely on it.

### Claude (web and desktop)

1. Go to **Customize > Connectors** and click **Add custom connector**.
2. Enter a name and `YOUR_URL`. For authentication, choose **No sign-in** if you're asked.
3. Click **Add**.
4. In a chat, turn the connector on from the **+** menu under **Connectors**, then ask: "How much did I spend this month?"

This works on the Free plan too, which allows one custom connector. On Team and Enterprise plans, an Owner adds it under **Organization settings > Connectors**. Claude asks before it shows the app: click **Allow**.

To debug the view in Claude Desktop, open **Help > Troubleshooting > Enable Developer Mode**, then `Cmd+Option+I`. The view is the inner of two nested iframes.

### ChatGPT

1. Go to [chatgpt.com/plugins](https://chatgpt.com/plugins), click **+**, then **Add custom MCP server**.
2. Enter a name, a description and, under **Connection**, the public endpoint `YOUR_URL`.
3. Set no authentication, accept the warning, then **Create as a plugin** and install it.
4. In a new chat, type `@`, pick the plugin, and ask the same question.

ChatGPT needs a public HTTPS URL. It can't reach `localhost`. After changing the server's tools, click **Refresh** on the connection and start a new chat. Which plans and workspaces may add custom servers depends on the account.

### VS Code with GitHub Copilot

Add `.vscode/mcp.json` to the workspace:

```json
{
  "servers": {
    "expensify": {
      "type": "http",
      "url": "YOUR_URL"
    }
  }
}
```

Start the server from the file, or with **MCP: List Servers**, then ask in Copilot Chat in agent mode. VS Code can also use `http://localhost:3001/mcp` directly while `npm start` is running. MCP Apps rendering is experimental in VS Code.

### Claude Code

```bash
claude mcp add --transport http expensify YOUR_URL
```

### Gemini CLI

```bash
gemini mcp add --transport http expensify YOUR_URL
```

The Claude Code and Gemini CLI tool calls work in a terminal. Whether either one renders the view, and not just the text, is to be checked in the dry run.

## Taking it further

- **A stable origin.** `_meta.ui.domain` on the view resource pins the origin the view is served from. Each host defines its own format. For Claude, it's the first 32 hex characters of the SHA-256 of `YOUR_URL`, then `.claudemcpcontent.com`. A wrong value stops the view rendering, so leave it out until you need it (for example, for the view's own OAuth flow).
- **Real data.** Swap the in-memory `ExpenseStore` for D1 or KV, so every Worker instance sees the same expenses.
- **Auth.** Put OAuth 2.1 in front of `/mcp` before anyone stores anything real.
- **Remove it.** `npx wrangler delete expensify-mcp-app` takes the Worker down.
