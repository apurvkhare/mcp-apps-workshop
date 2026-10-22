# 4 Make it interactive

The user takes over from the model. Clicks go to the server through the host, and the view tells the conversation what changed.

| Step | You write | The message you'll see |
|---|---|---|
| 4.1 | `app.callServerTool` | `tools/call` from the view, then to the server |
| 4.2 | `app.sendMessage` | `ui/message` |
| 4.3 | `visibility: ['app']`, and a call to `delete_expense` | `tools/call` for a tool the model can't see |
| 4.4 | `app.updateModelContext` | `ui/update-model-context` |

The code goes in `ui/data.ts`, `ui/chat.ts` and, for 4.3, `server/server.ts`. The buttons are already wired in `ui/mcp-app.tsx`.

```
 view ── tools/call ──▶ host ── tools/call ──▶ server       (4.1, 4.3)
 view ── ui/message ──▶ host ── a new user turn ──▶ model  (4.2)
 view ── ui/update-model-context ──▶ host ── next turn ──▶ model   (4.4)
```

Start with `npm run go 4.1`.
