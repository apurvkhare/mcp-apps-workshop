# 4.4 Tell the model what changed

🔨 **Your task:** After a delete, put a note in the model's context with `app.updateModelContext`.

**Where:** `ui/chat.ts`: the 🔨 4.4 marker in `reportDeletions`.

## 🧠 How it works

**The model's numbers are now stale.** It called `get_summary` earlier, and the user just deleted an expense. Unless it's told, its next answer uses the old total.

**`ui/update-model-context`** is quiet. It starts no turn and shows nothing in the chat. The host keeps the **latest** update from each view and gives it to the model with the next user message.

**Each update replaces the last one**, so `Dashboard` keeps every deletion in a list and sends the whole list each time.

**Not every host supports it.** `Dashboard` catches a refusal and carries on: the delete itself already worked.

## 📡 In the protocol log

Delete a row: `ui/update-model-context` from the view, and the model-context card at the top of the conversation pane. Delete another: the card shows both.

## What breaks without it

The next answer from the model uses totals that include expenses that no longer exist.

## 🧪 Check it

`npm test`. In the host, delete two expenses and read the model-context card.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. How is `updateModelContext` different from `sendMessage`? When would you use each?
2. Why does the view send every deletion so far, not just the newest one?
3. What happens in a host that doesn't support it?

## 📖 Read more

- [App.updateModelContext](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
