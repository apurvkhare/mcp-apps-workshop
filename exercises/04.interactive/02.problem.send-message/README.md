# 4.2 Send a message to the chat

🔨 **Your task:** Make the "Ask" buttons send a question to the conversation with `app.sendMessage`.

**Where:** `ui/chat.ts`: the 🔨 4.2 marker in `askAbout`.

## 🧠 How it works

**`ui/message`** adds a user message to the conversation, and the model answers it. The view hands work to the model.

**`role` is always `'user'`.** The view can't speak as the assistant. `content` is a list of the same content blocks a tool result uses.

**The host decides.** It may show the message straight away, ask the user first, or refuse. Use it when the user asked for something only the model can do: explain, compare, plan. Don't use it for status updates or to chat on the user's behalf.

## 📡 In the protocol log

Click "Ask" on a bar: `ui/message` from the view and its result, and a new user turn in the conversation pane.

## What breaks without it

The "Ask" buttons do nothing.

## 🧪 Check it

`npm test`. In the host, click "Ask" next to a category.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why is the role always `'user'`?
2. When would `sendMessage` be the wrong tool?
3. What does a real host do with the message?

## 📖 Read more

- [App.sendMessage](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
