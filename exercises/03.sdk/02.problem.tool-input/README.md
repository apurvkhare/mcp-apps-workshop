# 3.2 Read the tool input

🔨 **Your task:** Listen for `'toolinput'` and seed the date range and grouping from the model's arguments.

**Where:** `ui/mcp-app.tsx`: the 🔨 3.2 marker inside `onAppCreated`.

## 🧠 How it works

**`ui/notifications/tool-input`** carries the complete arguments the model called the tool with. It arrives once, after the handshake, usually while the tool is still running.

**Why seed the controls?** The date filters and the grouping tabs should match the data about to arrive. And when the user changes them in section 4, the new fetch starts from what the model asked for.

**`'toolinputpartial'`** is a separate event some hosts send while the model is still writing the arguments, so a view can show a preview. Never act on partial input: it can still change.

**The arguments come from the model.** Treat them like user input: `str()` drops empty values, and only a `groupBy` from `GROUP_BY` is accepted.

## 📡 In the protocol log

`ui/notifications/tool-input`, host → view, right after `ui/notifications/initialized`.

## What breaks without it

The dashboard ignores what the model asked for: the date filter shows "All time" even when the model asked for October.

## 🧪 Check it

`npm test`. In the host, call `get_summary` with `{"from": "2026-10-01", "groupBy": "merchant"}`: the waiting message names the dates and the grouping.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Which arrives first, the tool input or the tool result? Why?
2. When would you use `toolinputpartial`, and what should you never do with it?
3. Why does the code check `groupBy` against `GROUP_BY` instead of trusting it?

## 📖 Read more

- [App events](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
