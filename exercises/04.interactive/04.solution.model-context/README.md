# ✅ 4.4 Tell the model what changed

This folder is the finished step. Every ✅ comment in the code marks work from this step or an earlier one.

**What was built:** After a delete, put a note in the model's context with `app.updateModelContext`.

**Where:** `ui/chat.ts`: the 4.4 change in `reportDeletions`.

**📡 In the protocol log:** Delete a row: `ui/update-model-context` from the view, and the model-context card at the top of the conversation pane. Delete another: the card shows both.

## Explain it back

1. How is `updateModelContext` different from `sendMessage`? When would you use each?
2. Why does the view send every deletion so far, not just the newest one?
3. What happens in a host that doesn't support it?

**Next:** `npm run go 5.1`
