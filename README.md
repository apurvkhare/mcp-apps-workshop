# MCP Apps Workshop

Hands-on workshop material for **MCP Apps with React** (React India). You build Expensify, an expense tracker in INR, as an MCP server with a React dashboard that renders inside Claude, ChatGPT, VS Code and other MCP Apps hosts.

> Work in progress. The reference app, the workshop host and the exercises are in place. Slides and handouts come next.

## Setup

Needs Node 22 or later.

```bash
npm install
npm run doctor
```

`doctor` checks Node, the dependencies, the ports, and builds and tests the finished app. Once it passes, everything works offline.

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
| `npm start` | Build the view, run the server and the workshop host, and rebuild as you save. `-- --app app` runs the finished app |
| `npm run inspect` | MCP Inspector, pointed at the running server |
| `npm run doctor` | Check this machine is ready |
| `npm run deploy` | Build the view and deploy the playground's server to Cloudflare Workers (needs a free account) |
| `npm run smoke` | Call every tool, resource and prompt on the running server, like a host would |

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
| `host/` | The workshop host, based on the official SDK's `basic-host` example, with a protocol log, a conversation pane and theme presets |
| `scripts/` | The commands above. `scripts/authoring/` holds the source every step is cut from |
