import { getToolUiResourceUri, McpUiToolMetaSchema } from "@modelcontextprotocol/ext-apps/app-bridge";
import type { Tool } from "@modelcontextprotocol/client";
import { Component, type ErrorInfo, type ReactNode, StrictMode, Suspense, use, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { callTool, connectToServer, hasAppHtml, initializeApp, loadSandboxProxy, log, newAppBridge, type ServerInfo, type ToolCallInfo } from "./implementation";
import { getTheme, toggleTheme, onThemeChange, type Theme } from "./theme";
import styles from "./index.module.css";
import * as conversation from "./conversation";
import { PRESETS, getPreset, onPresetChange, setPreset, type PresetId } from "./presets";
import { ProtocolLog } from "./ProtocolLog";
import { Guide } from "./Guide";

/**
 * Check if a tool is visible to the model (not app-only).
 * Tools with `visibility: ["app"]` should not be shown in tool lists.
 */
function isToolVisibleToModel(tool: { _meta?: Record<string, unknown> }): boolean {
  const result = McpUiToolMetaSchema.safeParse(tool._meta?.ui);
  if (!result.success) return true; // default: visible to model
  const visibility = result.data.visibility;
  if (!visibility) return true; // default: visible to model
  return visibility.includes("model");
}

/** Compare tools: UI-enabled first, then alphabetically by name. */
function compareTools(a: Tool, b: Tool): number {
  const aHasUi = !!getToolUiResourceUri(a);
  const bHasUi = !!getToolUiResourceUri(b);
  if (aHasUi && !bHasUi) return -1;
  if (!aHasUi && bHasUi) return 1;
  return a.name.localeCompare(b.name);
}

/**
 * Extract default values from a tool's JSON Schema inputSchema.
 * Returns a formatted JSON string with defaults, or "{}" if none found.
 */
function getToolDefaults(tool: Tool | undefined): string {
  if (!tool?.inputSchema?.properties) return "{}";

  const defaults: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
    if (prop && typeof prop === "object" && "default" in prop) {
      defaults[key] = prop.default;
    }
  }

  return Object.keys(defaults).length > 0
    ? JSON.stringify(defaults, null, 2)
    : "{}";
}


// Host passes serversPromise to CallToolPanel
interface HostProps {
  serversPromise: Promise<ServerInfo[]>;
}

type ToolCallEntry = ToolCallInfo & { id: number };
let nextToolCallId = 0;

// Parse URL query params for debugging: ?server=name&tool=name&call=true&theme=hide
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    server: params.get("server"),
    tool: params.get("tool"),
    call: params.get("call") === "true",
    hideThemeToggle: params.get("theme") === "hide",
  };
}

/**
 * Theme toggle button with light/dark icons.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme);

  useEffect(() => {
    return onThemeChange(setTheme);
  }, []);

  return (
    <button
      className={styles.themeToggle}
      onClick={() => toggleTheme()}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}


function PresetSelect() {
  const [preset, setPresetState] = useState(getPreset);
  useEffect(() => onPresetChange(setPresetState), []);
  return (
    <label className={styles.toolbarField}>
      Host theme
      <select value={preset.id} onChange={(e) => setPreset(e.target.value as PresetId)}>
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
    </label>
  );
}


/** Workshop: whether the guide pane is open. Remembered per browser. */
function useGuideOpen(): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("workshop.guide") !== "closed";
    } catch {
      return true;
    }
  });
  const set = (next: boolean) => {
    setOpen(next);
    try {
      localStorage.setItem("workshop.guide", next ? "open" : "closed");
    } catch {
      // Private windows may refuse storage. The pane still toggles.
    }
  };
  return [open, set];
}


/**
 * Workshop layout: the step's guide on the left, then the chat stand-in, the tool calls and their views,
 * and the protocol log on the right.
 */
function Host({ serversPromise }: HostProps) {
  const [toolCalls, setToolCalls] = useState<ToolCallEntry[]>([]);
  const [guideOpen, setGuideOpen] = useGuideOpen();
  const [destroyingIds, setDestroyingIds] = useState<Set<number>>(new Set());
  const queryParams = useMemo(() => getQueryParams(), []);

  const requestClose = (id: number) => {
    setDestroyingIds((s) => new Set(s).add(id));
  };

  const completeClose = (id: number) => {
    setDestroyingIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    setToolCalls((calls) => calls.filter((c) => c.id !== id));
  };

  return (
    <div className={styles.workshop} data-guide={guideOpen ? "open" : "closed"}>
      <header className={styles.toolbar}>
        <button type="button" className={styles.guideToggle} aria-pressed={guideOpen} aria-controls="guide" onClick={() => setGuideOpen(!guideOpen)} title={guideOpen ? "Hide the guide" : "Show the guide"}>
          Guide
        </button>
        <strong className={styles.brand}>MCP Apps workshop host</strong>
        <PresetSelect />
        {!queryParams.hideThemeToggle && <ThemeToggle />}
      </header>
      {guideOpen && (
        <aside id="guide" className={styles.guideColumn}>
          <Guide />
        </aside>
      )}
      <aside className={styles.chatColumn}>
        <CallToolPanel
          serversPromise={serversPromise}
          addToolCall={(info) => {
            conversation.addCall(info.tool.name, info.input);
            setToolCalls((calls) => [...calls, { ...info, id: nextToolCallId++ }]);
          }}
          initialServer={queryParams.server}
          initialTool={queryParams.tool}
          autoCall={queryParams.call}
        />
        <Conversation />
      </aside>
      <main className={styles.viewColumn}>
        {toolCalls.length === 0 && <p className={styles.hint}>Pick a tool and press <b>Call Tool</b>. You are playing the model.</p>}
        {toolCalls.map((info) => (
          <ToolCallInfoPanel
            key={info.id}
            label={`${info.tool.name} #${info.id}`}
            toolCallInfo={info}
            isDestroying={destroyingIds.has(info.id)}
            onRequestClose={() => requestClose(info.id)}
            onCloseComplete={() => completeClose(info.id)}
          />
        ))}
      </main>
      <aside className={styles.logColumn}>
        <ProtocolLog />
      </aside>
    </div>
  );
}


/** The chat stand-in: the calls you made, messages the views sent, and the latest model context. */
function Conversation() {
  const turns = useSyncExternalStore(conversation.subscribe, conversation.getTurns);
  const context = useSyncExternalStore(conversation.subscribe, conversation.getModelContext);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns.length]);

  return (
    <section className={styles.conversation} aria-label="Conversation">
      <h2>Conversation</h2>
      {context && (
        <div className={styles.modelContext}>
          <span className={styles.turnLabel}>Model context · from {context.from} · ui/update-model-context</span>
          <pre>{context.text}</pre>
        </div>
      )}
      {turns.length === 0 && <p className={styles.hint}>Nothing yet. Tool calls you make, and messages a view sends with ui/message, appear here.</p>}
      {turns.map((t) =>
        t.kind === "call" ? (
          <div key={t.seq} className={styles.turnCall}>
            <span className={styles.turnLabel}>Model calls a tool</span>
            <code>{t.tool}({JSON.stringify(t.input)})</code>
          </div>
        ) : (
          <div key={t.seq} className={styles.turnMessage}>
            <span className={styles.turnLabel}>User message · from {t.from} · ui/message</span>
            <p>{t.text}</p>
          </div>
        ),
      )}
      <div ref={endRef} />
    </section>
  );
}


// CallToolPanel renders the unified form with Suspense around ServerSelect
interface CallToolPanelProps {
  serversPromise: Promise<ServerInfo[]>;
  addToolCall: (info: ToolCallInfo) => void;
  initialServer?: string | null;
  initialTool?: string | null;
  autoCall?: boolean;
}
function CallToolPanel({ serversPromise, addToolCall, initialServer, initialTool, autoCall }: CallToolPanelProps) {
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null);
  const [selectedTool, setSelectedTool] = useState("");
  const [inputJson, setInputJson] = useState("{}");
  const [hasAutoCalledRef] = useState({ called: false });

  // Filter out app-only tools, prioritize tools with UIs
  const toolNames = selectedServer
    ? Array.from(selectedServer.tools.values())
        .filter((tool) => isToolVisibleToModel(tool))
        .sort(compareTools)
        .map((tool) => tool.name)
    : [];

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(inputJson);
      return true;
    } catch {
      return false;
    }
  }, [inputJson]);

  const handleServerSelect = (server: ServerInfo, preferredTool?: string) => {
    setSelectedServer(server);
    // Filter out app-only tools, prioritize tools with UIs
    const visibleTools = Array.from(server.tools.values())
      .filter((tool) => isToolVisibleToModel(tool))
      .sort(compareTools);

    // Use preferred tool if it exists and is visible, otherwise first visible tool
    const targetTool = preferredTool && visibleTools.some(t => t.name === preferredTool)
      ? preferredTool
      : visibleTools[0]?.name ?? "";

    setSelectedTool(targetTool);
    // Set input JSON to tool defaults (if any)
    setInputJson(getToolDefaults(server.tools.get(targetTool)));
  };

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    // Set input JSON to tool defaults (if any)
    setInputJson(getToolDefaults(selectedServer?.tools.get(toolName)));
  };

  // Submit with optional override for server/tool (used by auto-call)
  const handleSubmit = (overrideServer?: ServerInfo, overrideTool?: string) => {
    const server = overrideServer ?? selectedServer;
    const tool = overrideTool ?? selectedTool;
    if (!server) return;

    const toolCallInfo = callTool(server, tool, JSON.parse(inputJson));
    addToolCall(toolCallInfo);

    // Update URL for easy refresh/sharing (without triggering navigation)
    const url = new URL(window.location.href);
    url.searchParams.set("server", server.name);
    url.searchParams.set("tool", tool);
    url.searchParams.set("call", "true"); // Auto-call on refresh
    history.replaceState(null, "", url.toString());
  };

  return (
    <div className={styles.callToolPanel}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <label>
          Server
          <Suspense fallback={<select disabled><option>Loading...</option></select>}>
            <ServerSelect
              serversPromise={serversPromise}
              onSelect={handleServerSelect}
              initialServer={initialServer}
              initialTool={initialTool}
              autoCall={autoCall && !hasAutoCalledRef.called}
              onAutoCall={(server, tool) => {
                hasAutoCalledRef.called = true;
                handleSubmit(server, tool);
              }}
            />
          </Suspense>
        </label>
        <label>
          Tool
          <select
            className={styles.toolSelect}
            value={selectedTool}
            onChange={(e) => handleToolSelect(e.target.value)}
          >
            {selectedServer && toolNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          Input
          <textarea
            className={styles.toolInput}
            aria-invalid={!isValidJson}
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
          />
        </label>
        <button type="submit" disabled={!selectedTool || !isValidJson}>
          Call Tool
        </button>
      </form>
    </div>
  );
}


// ServerSelect calls use() and renders the server <select>
interface ServerSelectProps {
  serversPromise: Promise<ServerInfo[]>;
  onSelect: (server: ServerInfo, toolName?: string) => void;
  initialServer?: string | null;
  initialTool?: string | null;
  autoCall?: boolean;
  onAutoCall?: (server: ServerInfo, tool: string) => void;
}
function ServerSelect({ serversPromise, onSelect, initialServer, initialTool, autoCall, onAutoCall }: ServerSelectProps) {
  const servers = use(serversPromise);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize with the correct server/tool when servers are loaded
  useEffect(() => {
    if (hasInitialized || servers.length === 0) return;

    // Find initial server index if specified
    let idx = 0;
    if (initialServer) {
      const foundIdx = servers.findIndex(s => s.name === initialServer);
      if (foundIdx >= 0) idx = foundIdx;
    }

    const server = servers[idx];
    setSelectedIndex(idx);

    // Find the tool to use
    const visibleTools = Array.from(server.tools.values())
      .filter((tool) => isToolVisibleToModel(tool))
      .sort(compareTools);
    const targetTool = initialTool && visibleTools.some(t => t.name === initialTool)
      ? initialTool
      : visibleTools[0]?.name ?? "";

    onSelect(server, targetTool);
    setHasInitialized(true);

    // Auto-call after initial selection if requested
    if (autoCall && targetTool) {
      onAutoCall?.(server, targetTool);
    }
  }, [servers, hasInitialized, initialServer, initialTool, autoCall, onSelect, onAutoCall]);

  if (servers.length === 0) {
    return <select disabled><option>No servers configured</option></select>;
  }

  return (
    <select
      value={selectedIndex}
      onChange={(e) => {
        const newIndex = Number(e.target.value);
        setSelectedIndex(newIndex);
        onSelect(servers[newIndex]);
      }}
    >
      {servers.map((server, i) => (
        <option key={i} value={i}>{server.name}</option>
      ))}
    </select>
  );
}


interface ToolCallInfoPanelProps {
  label: string;
  toolCallInfo: ToolCallInfo;
  isDestroying?: boolean;
  onRequestClose?: () => void;
  onCloseComplete?: () => void;
}
function ToolCallInfoPanel({ label, toolCallInfo, isDestroying, onRequestClose, onCloseComplete }: ToolCallInfoPanelProps) {
  const isApp = hasAppHtml(toolCallInfo);

  // For non-app tool calls, close immediately when isDestroying becomes true
  useEffect(() => {
    if (isDestroying && !isApp) {
      onCloseComplete?.();
    }
  }, [isDestroying, isApp, onCloseComplete]);

  const inputJson = JSON.stringify(toolCallInfo.input, null, 2);

  return (
    <div
      className={styles.toolCallInfoPanel}
      style={isDestroying ? { opacity: 0.5, pointerEvents: "none" } : undefined}
    >
      {/* Row 1: Header with server:tool name and close button */}
      <div className={styles.appHeader}>
        <span>{toolCallInfo.serverInfo.name}:<span className={styles.toolName}>{toolCallInfo.tool.name}</span></span>
        {onRequestClose && !isDestroying && (
          <button
            className={styles.closeButton}
            onClick={onRequestClose}
            title="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Row 2: Tool Input */}
      <CollapsiblePanel icon="📥" label="Tool Input" content={inputJson} />

      {/* Row 3: App iframe (if app) */}
      {isApp && (
        <ErrorBoundary>
          <Suspense fallback="Loading...">
            <AppIFramePanel
              label={label}
              toolCallInfo={toolCallInfo}
              isDestroying={isDestroying}
              onTeardownComplete={onCloseComplete}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Row 4: Tool Result */}
      <ErrorBoundary>
        <Suspense fallback="Loading result...">
          <ToolResultPanel toolCallInfo={toolCallInfo} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}


interface CollapsiblePanelProps {
  icon: string;
  label: string;
  content: string;
  badge?: string;
  defaultExpanded?: boolean;
}
function CollapsiblePanel({ icon, label, content, badge, defaultExpanded = false }: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={styles.collapsiblePanel}
      onClick={() => setExpanded(!expanded)}
      title={expanded ? "Click to collapse" : "Click to expand"}
    >
      <div className={styles.collapsibleHeader}>
        <span className={styles.collapsibleLabel}>{icon} {label}</span>
        <span className={styles.collapsibleSize}>
          {badge ?? `${content.length} chars`}
        </span>
        <span className={styles.collapsibleToggle}>
          {expanded ? "▼" : "▶"}
        </span>
      </div>
      {expanded ? (
        <pre className={styles.collapsibleFull}>{content}</pre>
      ) : (
        <div className={styles.collapsiblePreview}>
          {content.slice(0, 100)}{content.length > 100 ? "…" : ""}
        </div>
      )}
    </div>
  );
}


// Format content blocks - handle text, images, resources, etc.
const formatContentBlock = (c: { type: string; [key: string]: unknown }) => {
  switch (c.type) {
    case "text":
      return (c as { type: "text"; text: string }).text;
    case "image":
      return `<image: ${(c as { mimeType?: string }).mimeType ?? "unknown"}>`;
    case "audio":
      return `<audio: ${(c as { mimeType?: string }).mimeType ?? "unknown"}>`;
    case "resource":
      return `<resource: ${(c as { resource?: { uri?: string } }).resource?.uri ?? "unknown"}>`;
    default:
      return `<${c.type}>`;
  }
};


interface AppIFramePanelProps {
  label: string;
  toolCallInfo: Required<ToolCallInfo>;
  isDestroying?: boolean;
  onTeardownComplete?: () => void;
}
function AppIFramePanel({ label, toolCallInfo, isDestroying, onTeardownComplete }: AppIFramePanelProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const appBridgeRef = useRef<ReturnType<typeof newAppBridge> | null>(null);
  const [displayMode, setDisplayMode] = useState<"inline" | "fullscreen">("inline");

  useEffect(() => {
    const iframe = iframeRef.current!;

    // First get CSP and permissions from resource, then load sandbox
    // CSP is set via HTTP headers (tamper-proof), permissions via iframe allow attribute
    toolCallInfo.appResourcePromise.then(({ csp, permissions }) => {
      loadSandboxProxy(iframe, csp, permissions).then((firstTime) => {
        // The `firstTime` check guards against React Strict Mode's double
        // invocation (mount → unmount → remount simulation in development).
        // Outside of Strict Mode, this `useEffect` runs only once per
        // `toolCallInfo`.
        if (firstTime) {
          const appBridge = newAppBridge(toolCallInfo.serverInfo, iframe, {
            // Workshop: what the view tells "the model" goes to the conversation pane.
            onContextUpdate: (ctx) => {
              conversation.setModelContext(label, ctx ? [ctx.content?.map(formatContentBlock).join("\n"), ctx.structuredContent ? JSON.stringify(ctx.structuredContent, null, 2) : ""].filter(Boolean).join("\n\n") : null);
            },
            onMessage: (msg) => {
              conversation.addMessage(label, msg.content.map(formatContentBlock).join("\n"));
            },
            onDisplayModeChange: setDisplayMode,
          }, {
            // Provide container dimensions - maxHeight for flexible sizing
            containerDimensions: { maxHeight: 6000 },
            displayMode: "inline",
          });
          appBridgeRef.current = appBridge;
          initializeApp(iframe, appBridge, toolCallInfo, label);
        }
      });
    });

  }, [toolCallInfo]);

  // Graceful teardown: wait for guest to respond before unmounting
  // This follows the spec: "Host SHOULD wait for a response before tearing
  // down the resource (to prevent data loss)."
  useEffect(() => {
    if (!isDestroying) return;

    if (!appBridgeRef.current) {
      // Bridge not ready yet (e.g., user closed before iframe loaded)
      onTeardownComplete?.();
      return;
    }

    log.info("Sending teardown notification to MCP App");
    appBridgeRef.current.teardownResource({})
      .catch((err) => {
        log.warn("Teardown request failed (app may have already closed):", err);
      })
      .finally(() => {
        onTeardownComplete?.();
      });
  }, [isDestroying, onTeardownComplete]);

  const panelClassName = displayMode === "fullscreen"
    ? `${styles.appIframePanel} ${styles.fullscreen}`
    : styles.appIframePanel;

  return (
    <div className={panelClassName}>
      <iframe ref={iframeRef} />
    </div>
  );
}


interface ToolResultPanelProps {
  toolCallInfo: ToolCallInfo;
}
function ToolResultPanel({ toolCallInfo }: ToolResultPanelProps) {
  const result = use(toolCallInfo.resultPromise);
  const resultJson = JSON.stringify(result, null, 2);
  return <CollapsiblePanel icon="📤" label="Tool Result" content={resultJson} />;
}


interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: unknown;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: undefined };

  // Called during render phase - must be pure (no side effects)
  // Note: error is `unknown` because JS allows throwing any value
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // Called during commit phase - can have side effects (logging, etc.)
  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    log.error("Caught:", error, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const { error } = this.state;
      const message = error instanceof Error ? error.message : String(error);
      return <div className={styles.error}><strong>ERROR:</strong> {message}</div>;
    }
    return this.props.children;
  }
}


async function connectToAllServers(): Promise<ServerInfo[]> {
  const serverUrlsResponse = await fetch("/api/servers");
  const serverUrls = (await serverUrlsResponse.json()) as string[];

  // Use allSettled to be resilient to individual server failures
  const results = await Promise.allSettled(
    serverUrls.map((url) => connectToServer(new URL(url)))
  );

  const servers: ServerInfo[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      servers.push(result.value);
    } else {
      console.warn(`[HOST] Failed to connect to ${serverUrls[i]}:`, result.reason);
    }
  }

  if (servers.length === 0 && serverUrls.length > 0) {
    throw new Error(`Failed to connect to any servers (${serverUrls.length} attempted)`);
  }

  return servers;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Host serversPromise={connectToAllServers()} />
    </ErrorBoundary>
  </StrictMode>,
);
