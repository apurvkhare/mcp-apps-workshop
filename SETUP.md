# Setup

Do this a few days before the workshop, on a network you trust. It takes about 10 minutes. After it, the workshop runs offline: venue Wi-Fi only matters for the optional deploy at the end.

## You need

- **Node 22 or later.** Check with `node --version`. Install the LTS from [nodejs.org](https://nodejs.org), or with `nvm install 22`.
- **git**, to clone the repo.
- **A laptop where ports 3001, 8080 and 8081 are free.** The server, the workshop host and its sandbox use them. MCP Inspector, in section 1, uses 6274 and 6275.
- **A code editor.**
- **An AI coding agent, optional.** Claude Code, GitHub Copilot, Cursor, Codex, Antigravity or any other. The exercises work with or without one.
- **A free Cloudflare account, optional,** for the deploy in section 6. No card is needed. Without one, you can watch that part.

No paid accounts and no API keys. Nothing in the workshop calls a model: the local host lets you play the model yourself.

## Install

```bash
git clone https://github.com/apurvkhare/mcp-apps-workshop.git
cd mcp-apps-workshop
npm install
npm run doctor
```

`doctor` checks your Node version, the dependencies, the ports, and builds and tests the finished app. Every line should show ✓. Each ✗ says what to do.

### If npm warns about install scripts

npm may list packages such as `esbuild`, `workerd` and `@modelcontextprotocol/inspector` whose install scripts it didn't run. The workshop works without them, and `doctor` passing confirms that. If `doctor` fails on "Builds the view", run `npm install-scripts approve esbuild`, then `npm install` again.

npm may also print audit vulnerabilities and deprecation warnings. They come from dev tools, and `doctor` passing means you can ignore them.

## Try it once

```bash
npm start -- --app app
```

Open [http://localhost:8080](http://localhost:8080), pick `get_summary`, and press **Call Tool**. You should see a spending dashboard, and messages in the protocol log. The **Guide** pane on the left describes the finished app; during the workshop it shows the current step's instructions. Press `Ctrl+C` to stop.

## If you'll use an agent

Open the repo in it once before the day, so it picks up `AGENTS.md`. That file keeps the agent to one step at a time, and has it explain its code. Try `/step 2.1` (Claude Code, Copilot) or "do step 2.1" in any other agent, then reset with `npm run go 2.1`.

## Before you leave home

- [ ] `npm run doctor` passes
- [ ] The dashboard showed up at localhost:8080
- [ ] Laptop charger
- [ ] Optional: `npx wrangler login` done, if you'll deploy
