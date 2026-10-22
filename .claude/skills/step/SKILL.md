---
name: step
description: Do one step of the MCP Apps workshop (fill its 🔨 markers in playground/, run the tests, then explain the code back). Use when the person says "do step 3.3", "next step" or similar.
argument-hint: "[step, such as 3.3, or next]"
allowed-tools: Bash(npm run status *) Bash(npm run go *) Bash(npm test *) Read Edit Grep
---

Do workshop step $ARGUMENTS. If no step was given, do the current one. Follow the rules in AGENTS.md: edit only `playground/`, do only this step's 🔨 markers, and don't read the solution folders.

1. Run `npm run status -- --json --no-test`. If the playground isn't on the step asked for, run `npm run go <step> -- --json` (or `npm run go next -- --json` for "next"). If it reports a backup, say where.
2. Read `playground/README.md`: the task, the 🧠 explanation, and the "Explain it back" questions.
3. Fill each 🔨 marker listed in `todo`. Replace the whole marker block (the 🔨 line and the 💡 🧠 📡 🧪 📖 lines under it) with the code. Keep ✅ lines.
4. Run `npm test -- --json` until every test passes. Fix earlier steps first if any broke.
5. Run `npm run status -- --json --no-test` and confirm no 🔨 is left.
6. Answer every "Explain it back" question in the chat, in plain words, quoting the lines you wrote.
7. Tell the person what to look for in the workshop host's protocol log (the README's 📡 section), and stop. Don't start the next step.
