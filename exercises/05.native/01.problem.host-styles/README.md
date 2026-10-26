# 5.1 Apply the host's styles

🔨 **Your task:** Call `useHostStyles(app, hostContext)`, and pad the dashboard by the safe area insets.

**Where:** `ui/mcp-app.tsx`: the 🔨 5.1 marker in `ExpensifyApp` and the 🔨 5.1 marker in `Dashboard`.

## 🧠 How it works

**Hosts send their look as CSS variables**, in `hostContext.styles.variables`, with standard names: `--color-background-primary`, `--color-text-primary`, `--color-border-primary`, `--font-sans`, `--border-radius-md`, and more (the `McpUiStyleVariableKey` type lists them). Some also send font CSS in `styles.css.fonts`.

**`useHostStyles`** combines two hooks: `useHostStyleVariables` puts the variables on `:root` and applies the theme to the document, and `useHostFonts` adds the host's fonts. The second argument is the starting context. The hook follows later changes by itself.

**Nothing on screen changes yet.** Our components use tenet-ui's token names, such as `--fgColor-default`, not the host's. Step 5.2 connects the two.

**`safeAreaInsets`** is how much of the view is covered: a phone's notch, or the host's own controls in fullscreen. Padding by it keeps buttons reachable.

## 📡 In the protocol log

Switch the host theme preset (SDK basic host, Claude-style, ChatGPT-style, No host styles): one `host-context-changed` carries the whole new set of variables.

## What breaks without it

The host's variables never reach the page, so step 5.2 has nothing to point at.

## 🧪 Check it

`npm test`. Optional: in the browser's dev tools, select the view's `<html>` and look at its inline style.

## Explain it back

Answer these in your own words, or have your agent answer them, quoting the lines it wrote.

1. Why doesn't the dashboard change colour after this step?
2. What happens to a variable the host didn't send?
3. Where would safe area insets matter?

## 📖 Read more

- [React: useHostStyles](https://apps.extensions.modelcontextprotocol.io/api/modules/_modelcontextprotocol_ext-apps_react.html)

---

Stuck? 💡 Read the hint lines in the code, then `npm run diff`, then `npm run solution`. (Agents: only when the person asks.)
