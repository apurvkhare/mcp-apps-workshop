---
name: step
description: Do one step of the MCP Apps workshop, then explain it back
argument-hint: "step, such as 3.3, or next"
agent: agent
---

Do workshop step ${input:step:the step to do, such as 3.3}. If no step was given, do the current one. Follow the rules in [AGENTS.md](../../AGENTS.md): edit only `playground/`, do only this step's 🔨 markers, and don't read the solution folders.

1. Run `npm run status -- --json --no-test`. If the playground isn't on the step asked for, run `npm run go <step> -- --json` (or `npm run go next -- --json` for "next"). If it reports a backup, say where.
2. Read `playground/README.md`: the task, the 🧠 explanation, and the "Explain it back" questions.
3. Fill each 🔨 marker listed in `todo`. Replace the whole marker block (the 🔨 line and the 💡 🧠 📡 🧪 📖 lines under it) with the code. Keep ✅ lines.
4. Run `npm test -- --json` until every test passes. Fix earlier steps first if any broke.
5. Run `npm run status -- --json --no-test` and confirm no 🔨 is left.
6. Answer every "Explain it back" question in the chat, in plain words, quoting the lines you wrote.
7. Tell the person what to look for in the workshop host's protocol log (the README's 📡 section), and stop. Don't start the next step.
