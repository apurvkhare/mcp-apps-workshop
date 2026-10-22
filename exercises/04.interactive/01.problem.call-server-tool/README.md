# 4.1 Call server tools from the view

🔨 **Your task:** Write `getSummary` and `listExpenses` with `app.callServerTool`.

**Where:** `ui/data.ts`: two 🔨 4.1 markers.

## 🧠 How it works

**The request path:** the view sends `tools/call` to the host over `postMessage`. The host decides whether to allow it, then makes an ordinary `tools/call` to the server, and passes the result back. To the server, it looks like any other call.

**The server validates the arguments** against the tool's `inputSchema`. `clean()` drops empty values, because a missing filter means "no filter" but an empty string is invalid.

**The result is a normal `CallToolResult`.** Check `isError` and the shape of `structuredContent`, and throw with the result's text so the dashboard can show it.

**The model doesn't see these calls.** If something the user did matters to the conversation, the view has to say so: that's step 4.4.

**Only user actions fetch.** `Dashboard.refresh()` runs on clicks, never on mount, so it never races the model's own call.

## 📡 In the protocol log

Change the date range in the view: `tools/call` view → host, then `tools/call` host → server, then both results. The ids differ on the two legs: they are two separate requests.

## What breaks without it

Every control in the dashboard shows an error: the view can only display what the model fetched.

## 🧪 Check it

`npm test`. In the host, try the date presets, the Category, Merchant and Month tabs, "Show the expenses behind these numbers", and a click on a bar.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Trace one click through the log. How many messages, and which ids?
2. Why are the ids different on the view side and the server side?
3. Does the model learn about these calls? Should it?

## 📖 Read more

- [App.callServerTool](https://apps.extensions.modelcontextprotocol.io/api/modules/app.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`.
