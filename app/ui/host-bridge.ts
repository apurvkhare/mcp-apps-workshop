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
  '--borderColor-muted': '--color-border-secondary',
  '--fontFamily-body': '--font-sans',
  '--fontFamily-mono': '--font-mono',
  '--borderRadius-medium': '--border-radius-md',
  '--borderRadius-large': '--border-radius-lg'
};

export function bridgeHostTheme(context: McpUiHostContext | undefined, root = document.documentElement): void {
  // tenet-ui switches palettes with data-color-mode; the host tells us light or dark in context.theme.
  root.dataset.colorMode = context?.theme ?? 'light';
  // ✅ 5.2 Each tenet-ui token follows the host's variable when the host sent one.
  const sent: Partial<Record<McpUiStyleVariableKey, string>> = context?.styles?.variables ?? {};
  for (const [token, hostVar] of Object.entries(TOKEN_MAP)) {
    if (sent[hostVar]) root.style.setProperty(token, `var(${hostVar})`);
    else root.style.removeProperty(token);
  }
}
