//#file 5.2
/**
 * Our design system (tenet-ui) meets the host's theme.
 *
 * useHostStyles puts the host's CSS variables (--color-text-primary, --font-sans, ...) on :root.
 * Our components only know tenet-ui names (--fgColor-default, --fontFamily-body, ...).
 * This table points each tenet-ui token at the matching host variable, but only when the host sent one:
 * hosts send different subsets, and anything missing keeps tenet-ui's own value.
 */
import type { McpUiHostContext, McpUiStyleVariableKey } from '@modelcontextprotocol/ext-apps';

export const TOKEN_MAP: Record<string, McpUiStyleVariableKey> = {
  '--bgColor-default': '--color-background-primary',
  '--bgColor-muted': '--color-background-secondary',
  '--bgColor-inset': '--color-background-tertiary',
  '--bgColor-emphasis': '--color-background-inverse',
  '--bgColor-danger-muted': '--color-background-danger',
  '--fgColor-default': '--color-text-primary',
  '--fgColor-muted': '--color-text-secondary',
  '--fgColor-accent': '--color-text-info',
  '--fgColor-danger': '--color-text-danger',
  '--borderColor-default': '--color-border-primary',
//#step 5.2
  '--borderColor-muted': '--color-border-secondary',
  '--fontFamily-body': '--font-sans',
  '--fontFamily-mono': '--font-mono',
  '--borderRadius-medium': '--border-radius-md',
  '--borderRadius-large': '--border-radius-lg'
//#gap
  '--borderColor-muted': '--color-border-secondary',
  // 🔨 5.2 Colors are done. Add the fonts and corner radii: --fontFamily-body, --fontFamily-mono,
  //    --borderRadius-medium and --borderRadius-large, each pointing at the host variable that means the same thing.
  // 💡 The host's names autocomplete here: they are the McpUiStyleVariableKey type. Look for --font-* and --border-radius-*.
//#end
};

export function bridgeHostTheme(context: McpUiHostContext | undefined, root = document.documentElement): void {
  // tenet-ui switches palettes with data-color-mode; the host tells us light or dark in context.theme.
  root.dataset.colorMode = context?.theme ?? 'light';
//#step 5.2
  // #done Each tenet-ui token follows the host's variable when the host sent one.
  const sent: Partial<Record<McpUiStyleVariableKey, string>> = context?.styles?.variables ?? {};
  for (const [token, hostVar] of Object.entries(TOKEN_MAP)) {
    if (sent[hostVar]) root.style.setProperty(token, `var(${hostVar})`);
    else root.style.removeProperty(token);
  }
//#gap
  // 🔨 5.2 (part 2) For each [token, hostVar] in TOKEN_MAP: if the host sent hostVar in
  //    context.styles.variables, set the token to var(hostVar) on root. If it didn't, remove the token,
  //    so tenet-ui's own value shows through.
  // 💡 root.style.setProperty(token, `var(${hostVar})`) and root.style.removeProperty(token)
  // 🧠 Point at the variable, don't copy its value: useHostStyles keeps the variable current, and
  //    light-dark() values switch with the theme on their own. Removing what the host didn't send matters
  //    when switching hosts: a token left over from the last host would stick.
  // 📡 Switch the host theme preset: one ui/notifications/host-context-changed carries the new styles.
  // 🧪 npm test runs bridgeHostTheme with a partial set of variables, like a real host sends.
//#end
}
