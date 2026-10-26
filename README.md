# MCP Apps Workshop

Hands-on workshop material for **MCP Apps with React** (React India). You build Expensify, an expense tracker in INR, as an MCP server with a React dashboard that renders inside Claude, ChatGPT, VS Code and other MCP Apps hosts.

> Work in progress. The reference app, the workshop host, the exercises and the agent setup are in place. The slides are in `slides/`. Handouts come next.

## Setup

Needs Node 22 or later. Full instructions, to do a few days before: [SETUP.md](SETUP.md).

```bash
npm install
npm run doctor
```

`doctor` checks Node, the dependencies, the ports, and builds and tests the finished app. Once it passes, everything works offline.

## With an AI agent

[AGENTS.md](AGENTS.md) tells your agent how the workshop works: one step at a time, only in `playground/`, no peeking at solutions, and an explanation of what it wrote at the end. Cursor, Copilot, Codex and Antigravity read it directly, and Claude Code reads it through `CLAUDE.md`.

Say "do step 3.3", or use the shortcut: `/step 3.3` in Claude Code and Copilot Chat.

## How the workshop works

Each step is a pair of folders in `exercises/`: a **problem** with gaps marked 🔨, and its **solution**. You work in `playground/`.

```bash
npm run go 2.1      # load step 2.1 into playground/
npm start           # build it and open the workshop host on http://localhost:8080
npm run status      # where you are, what's left, and whether the tests pass
npm test            # check the step
npm run go next     # on to the next step
```

Each step's `README.md` (also copied into `playground/`) has the task, how it works, what to look for in the protocol log, and "Explain it back" questions.

The workshop host shows that README in its **Guide** pane, on the left of the live view and the protocol log, and switches to the new step by itself when you run `npm run go`.

Stuck? Read the 💡 hints in the code, then `npm run diff` to compare with the solution, then `npm run solution` to copy it in. Your own version is backed up to `.playground-backups/` first.

### The markers

| Marker | Meaning |
|---|---|
| 🔨 | Build: what to write, with its step number (`🔨 3.3`) |
| 💡 | Hint: the shape of the answer |
| 🧠 | Why: the reason it works this way |
| 📡 | Traffic: which messages to find in the protocol log |
| 📖 | Docs: a spec or SDK link |
| 🧪 | Test: what `npm test` checks |
| 🔥 | Bonus: extra credit for fast finishers |
| ✅ | Done: work from an earlier step |

## Commands

Every command is non-interactive. Add `-- --json` for JSON output, for example `npm run status -- --json`.

| Command | What it does |
|---|---|
| `npm run go <step>` | Load a step's problem into `playground/` (`--solution` for its solution, `next` for the next step) |
| `npm run status` | Current step, open 🔨 markers with file and line, and the test result |
| `npm test` | Run the playground's tests: this step's and every earlier one's |
| `npm run diff` | Your playground against the current step's solution |
| `npm run solution` | Copy the current step's solution into `playground/` |
| `npm start` | Build the view, run the server and the workshop host, and rebuild as you save. `-- --app app` runs the finished app, `-- --server URL` connects the host to a deployed server |
| `npm run inspect` | MCP Inspector, pointed at the running server |
| `npm run doctor` | Check this machine is ready |
| `npm run deploy` | Build the view and deploy the playground's server to Cloudflare Workers (needs a free account; see [DEPLOY.md](DEPLOY.md)). `-- --app app` deploys the finished app |
| `npm run smoke` | Call every tool, resource and prompt on the running server, like a host would. Add `-- https://…/mcp` to check a deployed server |

For workshop authors: `npm run cut` regenerates every exercise folder and `app/` from `scripts/authoring/source/`, and `npm run verify` checks every step: typecheck, tests, markers and builds.

## What is where

| Path | What it is |
|---|---|
| `exercises/` | The steps, one folder per section. Each step is a problem folder and a solution folder |
| `playground/` | Where you work. `npm run go` fills it. Not committed |
| `app/` | The finished app: the last step's solution |
| `app/server/server.ts` | The MCP server: four tools, a resource, a prompt, and the `ui://` view resource |
| `app/server/http.ts` · `worker.ts` | The same server on Node (port 3001) and on Cloudflare Workers |
| `app/ui/mcp-app.tsx` | The view: `useApp`, tool input and result, host context, host styles |
| `app/ui/data.ts` · `chat.ts` | Every call the view makes: to the server, and to the conversation |
| `app/ui/host-bridge.ts` | Maps the host's theme variables onto tenet-ui tokens |
| `shared/` | The expense store, the presentational components, and test helpers. Not MCP code, shared by every step |
| `host/` | The workshop host, based on the official SDK's `basic-host` example, with the step's guide, a protocol log, a conversation pane and theme presets |
| `slides/` | The presenter deck (Slidev), with speaker notes. Its own install: `cd slides && npm install && npm run dev` |
| `scripts/` | The commands above. `scripts/authoring/` holds the source every step is cut from |
