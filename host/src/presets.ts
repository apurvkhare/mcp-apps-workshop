/**
 * Workshop addition: host theme presets.
 *
 * A real host sends its own style variables in hostContext.styles.variables. These presets imitate
 * the general look of two real hosts, so the same view can be checked against both offline.
 * They are hand-picked approximations for testing, not the hosts' published values.
 * Values use light-dark(), so one set covers both themes once the view sets color-scheme.
 */
import type { McpUiStyles } from "@modelcontextprotocol/ext-apps";
import { HOST_STYLE_VARIABLES } from "./host-styles";

export type PresetId = "basic" | "claude" | "chatgpt" | "none";

export interface Preset {
  id: PresetId;
  label: string;
  /** undefined means the host sends no style variables at all. */
  variables?: Partial<McpUiStyles>;
}

const CLAUDE_STYLE: Partial<McpUiStyles> = {
  "--color-background-primary": "light-dark(#faf9f5, #262624)",
  "--color-background-secondary": "light-dark(#f0eee6, #30302e)",
  "--color-background-tertiary": "light-dark(#e8e6dc, #1f1e1d)",
  "--color-background-inverse": "light-dark(#141413, #faf9f5)",
  "--color-background-danger": "light-dark(#fbe9e5, #4a2620)",
  "--color-text-primary": "light-dark(#141413, #faf9f5)",
  "--color-text-secondary": "light-dark(#5e5d59, #b7b5a9)",
  "--color-text-tertiary": "light-dark(#87867f, #87867f)",
  "--color-text-info": "light-dark(#c6613f, #d97757)",
  "--color-text-danger": "light-dark(#b53333, #f08a7a)",
  "--color-border-primary": "light-dark(#dedcd1, #3e3e38)",
  "--color-border-secondary": "light-dark(#e8e6dc, #30302e)",
  "--font-sans": "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  "--font-mono": "ui-monospace, 'SF Mono', Menlo, monospace",
  "--border-radius-md": "8px",
  "--border-radius-lg": "12px"
};

const CHATGPT_STYLE: Partial<McpUiStyles> = {
  "--color-background-primary": "light-dark(#ffffff, #212121)",
  "--color-background-secondary": "light-dark(#f4f4f4, #2f2f2f)",
  "--color-background-tertiary": "light-dark(#ececec, #171717)",
  "--color-background-inverse": "light-dark(#0d0d0d, #ffffff)",
  "--color-background-danger": "light-dark(#fdecec, #4b1f1f)",
  "--color-text-primary": "light-dark(#0d0d0d, #ececec)",
  "--color-text-secondary": "light-dark(#5d5d5d, #b4b4b4)",
  "--color-text-tertiary": "light-dark(#8f8f8f, #8f8f8f)",
  "--color-text-info": "light-dark(#0169cc, #48aaff)",
  "--color-text-danger": "light-dark(#d52c2c, #ff8583)",
  "--color-border-primary": "light-dark(#e5e5e5, #424242)",
  "--color-border-secondary": "light-dark(#ededed, #333333)",
  "--font-sans": "ui-sans-serif, -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif",
  "--font-mono": "ui-monospace, SFMono-Regular, Menlo, monospace",
  "--border-radius-md": "12px",
  "--border-radius-lg": "18px"
};

export const PRESETS: Preset[] = [
  { id: "basic", label: "SDK basic host", variables: HOST_STYLE_VARIABLES },
  { id: "claude", label: "Claude-style", variables: CLAUDE_STYLE },
  { id: "chatgpt", label: "ChatGPT-style", variables: CHATGPT_STYLE },
  { id: "none", label: "No host styles" }
];

let current: PresetId = (new URLSearchParams(location.search).get("preset") as PresetId | null) ?? "claude";
if (!PRESETS.some((p) => p.id === current)) current = "claude";
const listeners = new Set<(preset: Preset) => void>();

/** What goes in hostContext.styles.variables. Hosts may send any subset of the keys. */
export const styleVariables = (preset: Preset) => (preset.variables ?? {}) as McpUiStyles;

export function getPreset(): Preset {
  return PRESETS.find((p) => p.id === current)!;
}

export function setPreset(id: PresetId) {
  if (id === current) return;
  current = id;
  const url = new URL(location.href);
  url.searchParams.set("preset", id);
  history.replaceState(null, "", url);
  applyToHostPage();
  for (const listener of listeners) listener(getPreset());
}

export function onPresetChange(listener: (preset: Preset) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The host page wears the preset too, so the view can be judged against its surroundings. */
export function applyToHostPage() {
  const root = document.documentElement;
  const v = getPreset().variables;
  const set = (name: string, value?: string) => (value ? root.style.setProperty(name, value) : root.style.removeProperty(name));
  set("--color-bg", v?.["--color-background-primary"]);
  set("--color-bg-secondary", v?.["--color-background-secondary"]);
  set("--color-text", v?.["--color-text-primary"]);
  set("--color-text-secondary", v?.["--color-text-secondary"]);
  set("--color-border", v?.["--color-border-primary"]);
}
applyToHostPage();
