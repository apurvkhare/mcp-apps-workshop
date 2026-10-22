# 5 Make it look native

One build that looks at home in every host. Then the security model that every host enforces.

| Step | You write | Where |
|---|---|---|
| 5.1 | `useHostStyles(app, hostContext)`, and padding by `safeAreaInsets` | `ui/mcp-app.tsx` |
| 5.2 | the token map and the bridge between tenet-ui and the host | `ui/host-bridge.ts` |
| 5.3 | `_meta.ui.csp.resourceDomains` for a web font | `server/server.ts` |

Use the host's **Host theme** menu and its ☀️ / 🌙 toggle throughout. By the end, the dashboard follows all four presets in light and dark.

Start with `npm run go 5.1`.
