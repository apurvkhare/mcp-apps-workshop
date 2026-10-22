# AGENTS.md

This repo is a **hands-on workshop**: MCP Apps with React. A person is learning here, and you are helping them do one step at a time. The goal isn't finished code. The goal is that they understand the code you write. Work in small, explained steps, and stop when the step is done.

## The rules

1. **Start with `npm run status -- --json`.** It tells you the current step, the open 🔨 markers with file and line, and the test result. Run it before anything else, and again whenever you're unsure.
2. **Edit only `playground/`.** Never edit `exercises/`, `app/`, `shared/`, `host/` or `scripts/`.
3. **Do only the current step's 🔨 markers.** Not the next step, and not 🔥 bonus work, unless the person asks for it.
4. **Don't look at the answer.** Don't read or copy from `exercises/**/*.solution.*`, `app/` or `scripts/authoring/source/`, and don't run `npm run diff` or `npm run solution`, unless the person asks you to. Work from the step's `playground/README.md`, the 💡 hints and the SDK's types in `node_modules/@modelcontextprotocol/`.
5. **Check with `npm test -- --json`.** It runs this step's tests and every earlier step's. The step is done when all of them pass. If an earlier step's test breaks, fix that first.
6. **Explain it back.** When the tests pass, answer each question under "Explain it back" in `playground/README.md`, in the chat, quoting the lines you wrote. Then stop and let the person read it. Don't move to the next step until they say so.
7. **Leave the protocol log to the person.** Each README has a 📡 section about messages in the workshop host's protocol log. You can't see it; they can. Tell them what to look for.

## Doing a step

When the person says "do step 3.3", or `/step 3.3`:

1. `npm run status -- --json --no-test`. If the playground isn't on 3.3, run `npm run go 3.3 -- --json`. It backs up the old playground first, so this is safe. If `backup` isn't null, mention its path.
2. Read `playground/README.md`.
3. Find the work: the `todo` list from `status`, or `grep -rn "🔨" playground --exclude-dir=tests --exclude=README.md`.
4. Fill each 🔨 marker. Replace the whole marker block, meaning the 🔨 line and the 💡 🧠 📡 🧪 📖 lines under it, with the code, the way a finished step looks. Where a marker says to replace a stub line (such as `const app = null as App | null;`), replace it. Keep ✅ lines: they mark earlier work.
5. `npm test -- --json`. If something fails, read the failure message, fix it, and run it again.
6. `npm run status -- --json --no-test` should show no 🔨 left.
7. Answer "Explain it back" (rule 6). Then suggest they run `npm start` (if it isn't running already), call the tool in the workshop host, and read the traffic the 📡 section describes.

When the person writes the code themselves and asks for help, give a hint first (the 💡 line, or the next small step). Write the code only if they ask.

## The markers

Every marker is one emoji with a fixed meaning. They're comments in `.ts`, `.tsx` and `.html` files.

| Marker | Meaning | What to do |
|---|---|---|
| 🔨 | Build. The step number follows: `🔨 3.3` | The work. Replace it with code |
| 💡 | Hint: the shape of the answer | Follow it |
| 🧠 | Why it works this way | Use it in your explanation |
| 📡 | Traffic: messages to find in the protocol log | Tell the person to look |
| 📖 | Docs link | Read it if you need more |
| 🧪 | What `npm test` checks | Make it pass |
| 🔥 | Bonus for fast finishers | Only when asked |
| ✅ | Done in an earlier step | Leave it |

## Commands

None of them prompt. Each prints plain text, or one JSON object with `-- --json`. The `--` matters: npm keeps a bare `--json` for itself.

| Command | What it does |
|---|---|
| `npm run status -- --json` | Current step, open 🔨 markers, test result, and the suggested next action. `--no-test` skips the tests |
| `npm run go <step> -- --json` | Loads a step's problem into `playground/` and backs up the old one. `next` for the next step, `--solution` for the solution |
| `npm test -- --json` | Runs the playground's tests. Exits 1 if any fail |
| `npm run diff -- --json` | Playground against the step's solution. Only when asked |
| `npm run solution -- --json` | Copies the step's solution into `playground/`. Only when asked |
| `npm start` | Builds the view and runs the MCP server (port 3001) and the workshop host (port 8080). Long-running: run it in the background, or ask the person to run it in their own terminal. It rebuilds on save and reloads on `npm run go` |
| `npm run doctor -- --json` | Checks the machine: Node, dependencies, ports, build, tests |

Steps are numbered by section: 2.1 and 2.2, 3.1 to 3.4, 4.1 to 4.4, 5.1 to 5.3, 6.1. Section 1 has no code.

## The project

- **`playground/server/server.ts`** builds the MCP server: `McpServer` from `@modelcontextprotocol/server`, plus `registerAppTool` and `registerAppResource` from `@modelcontextprotocol/ext-apps/server`. `http.ts` serves it on Node, and `worker.ts` (step 6.1) on Cloudflare Workers.
- **`playground/ui/`** is the view: React 19, with `App` from `@modelcontextprotocol/ext-apps` and `useApp` and `useHostStyles` from `@modelcontextprotocol/ext-apps/react`. Vite builds it into one HTML file, `playground/dist/mcp-app.html`.
- **`shared/`** has the expense store and the presentational components. It isn't MCP code. Use what it exports; don't change it.
- **TypeScript is strict.** Imports use the `.ts` and `.tsx` extensions. Match the style of the code around you: comments, naming, two-space indents, single quotes.
- **Don't add dependencies.** Everything the workshop needs is installed, and the room may be offline.
- **Versions are pinned:** `@modelcontextprotocol/ext-apps` 2.0.3, `@modelcontextprotocol/server` and `/client` 2.3.1, React 19.3, Zod 4. The host and the tests speak MCP protocol **2026-07-28** (`server/discover`, then a `_meta` envelope on every request, no `initialize`); the server also still answers 2025-era clients. When you're unsure of an API, read the types rather than guessing from older versions: `node_modules/@modelcontextprotocol/ext-apps/dist/src/` (`app.d.ts` for the view, `server/index.d.ts` for the server helpers, `react/` for the hooks) and `node_modules/@modelcontextprotocol/server/`.

## Working on the workshop itself

The rules above are for people doing the workshop. If the person says they're **writing or changing the workshop** (the author, or a contributor), they don't apply. Instead:

- Steps are cut from one annotated source. Edit `scripts/authoring/source/`, never the generated `server/`, `ui/` and `tests/` folders in `exercises/` or `app/`, then run `npm run cut`. The directives (`//#step`, `//#gap`, `//#before`, `//#end`, `//#file`, `#done`) are documented at the top of `scripts/authoring/cut.ts`.
- Step READMEs and the section `README.md` and `FINISHED.md` files are hand-written. A problem folder and its solution folder each have one.
- `npm run verify` checks every step: the folders match the source, everything typechecks, each solution passes, each problem fails only its own step and has 🔨 markers, and each solution builds. Run it before committing.
- The step list lives in `scripts/steps.ts`.
- `host/` is the workshop host, based on the SDK's `basic-host` example. Its changes are marked "Workshop".
