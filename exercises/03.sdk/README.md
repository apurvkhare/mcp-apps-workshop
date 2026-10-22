# 3 Understand the SDK, then fill the gaps

The view gets a voice. It connects to the host, then hears what the model asked for, what the server answered, and where it's being shown.

| Step | You write | The message you'll see |
|---|---|---|
| 3.1 | `useApp({ appInfo, capabilities, onAppCreated })` | `ui/initialize` |
| 3.2 | a `'toolinput'` listener | `ui/notifications/tool-input` |
| 3.3 | a `'toolresult'` listener | `ui/notifications/tool-result` |
| 3.4 | `getHostContext()` and a `'hostcontextchanged'` listener | `ui/notifications/host-context-changed` |

All four are in `ui/mcp-app.tsx`.

```
 view ── ui/initialize ──────────────▶ host
 view ◀── result (hostContext) ─────── host
 view ── ui/notifications/initialized ▶ host
 view ◀── tool-input ───────────────── host
 view ◀── tool-result ──────────────── host
 view ◀── host-context-changed ─────── host   (any time after)
```

Start with `npm run go 3.1`.
