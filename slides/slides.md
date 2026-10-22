---
theme: seriph
title: MCP Apps with React
info: |
  React India, hands-on workshop, 150 minutes. Build interactive UI that runs inside Claude and ChatGPT.
  MCP protocol 2026-07-28, MCP Apps 2026-01-26 (ext-apps 2.0.3), TypeScript SDK 2.3.1, React 19.
  The app is Expensify, an INR expense tracker.
class: text-center
highlighter: shiki
lineNumbers: false
transition: slide-left
mdc: true
colorSchema: dark
favicon: '/favicon.svg'
fonts:
  serif: 'Newsreader'
  sans: 'Newsreader'
  mono: 'Fira Code'
  provider: none
---

<div class="nameplate"><span class="kicker">Apurv Khare</span></div>

# MCP Apps with React

<div class="cover-sub mt-4">interactive UI that runs <em>inside</em> Claude and ChatGPT</div>

<div class="cover-rule"></div>

<div class="cover-tagline mt-6">MCP 2026-07-28 · ext-apps 2.0.3 · React 19 · Expensify, in ₹</div>

<style>
.slidev-layout.cover h1 { font-size: 4.8rem; }
.slidev-layout.cover .cover-sub { font-size: 2.2rem; }
</style>

<div class="nameplate nameplate--foot"><span class="kicker">React India · Workshop · 150 min</span></div>

<!--
0:00. Doors. Put this up while people sit down.
Versions on the tagline: MCP protocol revision 2026-07-28 (the July revision, stateless, no handshake), the MCP Apps extension through ext-apps 2.0.3, React 19.
Ask the room to run `npm run doctor` now if they have not. Everything after install works offline.
Say: "Laptops open, terminal open, repo cloned. We start building in about 25 minutes."
-->

---
layout: center
---

# About me

- Staff Software Engineer at Procore
- 10 years building large-scale frontends
- Leading agentic engineering efforts at Procore
- Mentored and taught 10,000+ developers
- I teach what I know, and learn what I don't

<!--
0:01. Thirty seconds. Do not linger. The room came for the code.
-->

---

# The agenda: seven sections in 150 minutes

<div class="grid grid-cols-2 gap-x-10 mt-4">
<div class="talk-plan">
  <div class="item"><b>1</b><div><div class="name">Read the MCP traffic</div><div class="sub">No code. Read every message</div></div><span class="t">0:03</span></div>
  <div class="item"><b>2</b><div><div class="name">Serve the view, link the tool</div><div class="sub">Steps 2.1 and 2.2</div></div><span class="t">0:23</span></div>
  <div class="item"><b>3</b><div><div class="name">Connect the view with useApp</div><div class="sub">Steps 3.1 to 3.4</div></div><span class="t">0:38</span></div>
  <div class="item is-break"><b>·</b><div><div class="name">Break</div><div class="sub">TAs help anyone stuck</div></div><span class="t">1:11</span></div>
</div>
<div class="talk-plan">
  <div class="item"><b>4</b><div><div class="name">Make the view interactive</div><div class="sub">Steps 4.1 to 4.4</div></div><span class="t">1:21</span></div>
  <div class="item"><b>5</b><div><div class="name">Theme it with the host's styles</div><div class="sub">Steps 5.1 to 5.3</div></div><span class="t">1:48</span></div>
  <div class="item"><b>6</b><div><div class="name">Deploy to Cloudflare Workers</div><div class="sub">Step 6.1</div></div><span class="t">2:08</span></div>
  <div class="item"><b>7</b><div><div class="name">Run it in every host</div><div class="sub">Demo, optional. Then wrap and Q&A at 2:24</div></div><span class="t">2:16</span></div>
</div>
</div>

<!--
0:01. The shape of the day. Section 7 is the first thing cut if we run late. A2UI is a stretch goal at the very end, only if time is left.
Section 3 is the longest, and the break sits right after it on purpose: anyone behind catches up there.
-->

---

# The dashboard you'll build

<div class="grid grid-cols-5 gap-6 mt-2 items-center">

<div class="col-span-3 dash">
  <h4>October 2026</h4>
  <div class="chips"><span>All time</span><span class="on">This month</span><span>Last month</span></div>
  <div class="tot"><div>Total<b>₹21,776</b></div><div>Expenses<b>18</b></div></div>
  <div class="bar"><span>travel</span><i style="width:100%"></i><span>₹6,420</span></div>
  <div class="bar"><span>shopping</span><i style="width:59%"></i><span>₹3,798</span></div>
  <div class="bar"><span>food</span><i style="width:50%"></i><span>₹3,188</span></div>
  <div class="bar"><span>groceries</span><i style="width:47%"></i><span>₹3,005</span></div>
  <div class="bar"><span>bills</span><i style="width:41%"></i><span>₹2,629</span></div>
  <div class="bar"><span>entertainment</span><i style="width:24%"></i><span>₹1,569</span></div>
  <div class="bar"><span>health</span><i style="width:10%"></i><span>₹640</span></div>
  <div class="bar"><span>transport</span><i style="width:8%"></i><span>₹527</span></div>
</div>

<div class="col-span-2 text-sm space-y-3">
  <div class="ed-card">"How much did I spend this month?" The answer is an <b>app</b>, not a paragraph.</div>
  <div class="ed-card">Change dates, click a bar, delete a row, ask the model about a category.</div>
  <div class="ed-card ed-card--accent">One React build. It wears Claude's clothes in Claude and ChatGPT's in ChatGPT.</div>
</div>

</div>

<div class="src mt-3">A sketch of the real dashboard, with the real numbers from get_summary on 22 Oct 2026</div>

<!--
0:02. Show the finish line first. If the workshop host is already running on the presenter laptop, switch to it and call get_summary instead: that is better than this sketch.
The seed data is relative to today, so the numbers on the day will differ. That is fine.
-->

---

# Every section runs the same five steps

<div class="grid grid-cols-5 gap-3 mt-6 text-sm">
  <div class="ed-card"><div class="kicker">1 · 8–12 min</div><b class="text-lg">Understand</b><br/><span class="text-gray-400">Each export: what it does, when it fires, what breaks without it.</span></div>
  <div class="ed-card ed-card--accent"><div class="kicker">2 · 6–10 min</div><b class="text-lg">Fill</b><br/><span class="text-gray-400">Fill the 🔨 markers yourself, or tell your agent "do step 3.3".</span></div>
  <div class="ed-card"><div class="kicker">3 · 2 min</div><b class="text-lg">Run</b><br/><span class="text-gray-400"><code>npm test</code>, then try it in the workshop host.</span></div>
  <div class="ed-card"><div class="kicker">4 · 3–5 min</div><b class="text-lg">Read the traffic</b><br/><span class="text-gray-400">Find the messages you caused in the protocol log.</span></div>
  <div class="ed-card"><div class="kicker">5 · 1 min</div><b class="text-lg">Checkpoint</b><br/><span class="text-gray-400">Behind? <code>npm run solution</code>, then go on.</span></div>
</div>

<div class="mt-6 grid grid-cols-3 gap-3 text-sm">
  <div class="cmd">npm run go 3.3</div>
  <div class="cmd">npm run status</div>
  <div class="cmd">npm test</div>
</div>

<div class="mt-3 text-sm text-gray-400">You work in <code>playground/</code>. <code>go</code> loads a step (and backs up what was there), <code>status</code> says where you are and what is left, <code>diff</code> and <code>solution</code> are there when you are stuck.</div>

<!--
0:02. The rhythm. Say it once, clearly, then never again: every section repeats it.
Key line: "Nobody gets left behind. npm run solution puts the answer in the playground in one command."
-->

---

# The eight code markers and what each means

<div class="text-sm text-gray-400 mb-3">Every gap in the code is marked with one emoji, with one fixed meaning. People scan them. Agents follow them.</div>

<div class="markers">
  <div><span class="e">🔨</span><div><b>Build</b><span>The work, with its step number: <code>🔨 3.3</code></span></div></div>
  <div><span class="e">💡</span><div><b>Hint</b><span>The shape of the answer</span></div></div>
  <div><span class="e">🧠</span><div><b>Why</b><span>Why it works this way</span></div></div>
  <div><span class="e">📡</span><div><b>Traffic</b><span>Messages to find in the protocol log</span></div></div>
  <div><span class="e">📖</span><div><b>Docs</b><span>A spec or SDK link</span></div></div>
  <div><span class="e">🧪</span><div><b>Test</b><span>What <code>npm test</code> checks</span></div></div>
  <div><span class="e">🔥</span><div><b>Bonus</b><span>For fast finishers</span></div></div>
  <div><span class="e">✅</span><div><b>Done</b><span>Earlier work. Leave it.</span></div></div>
</div>

<div class="cmd mt-4">grep -rn "🔨" playground --exclude-dir=tests</div>

<!--
0:02. Point at the 🔨: that is the only one you must act on. 📡 is the one people skip and should not: it tells you what to look for in the log.
-->

---

# Doing a step with your coding agent

<div class="grid grid-cols-2 gap-6 mt-2 text-sm">

<div class="space-y-3">
  <div class="ed-card"><b>AGENTS.md is the rulebook.</b> Read natively by Cursor, Copilot, Codex and others. <code>CLAUDE.md</code> is one line: <code>@AGENTS.md</code>.</div>
  <div class="ed-card">The rules: run <code>npm run status</code> first, edit only <code>playground/</code>, do only this step's 🔨, never read the solution unless you ask, run <code>npm test</code>.</div>
  <div class="ed-card ed-card--accent"><b>Then it must "Explain it back"</b>: answer the step's questions in chat, quoting the lines it wrote. You read that, and push back.</div>
</div>

<div>

| You type | Where |
|---|---|
| `/step 3.3` | Claude Code (a skill) |
| `/step 3.3` | VS Code Copilot (a prompt file) |
| "do step 3.3" | any other agent |

<div class="mt-4 text-gray-400">No agent? Same steps, by hand. The agent is optional for every step.</div>

<div class="mt-3 ed-card ed-card--warn">The one thing it can't do for you: <b>read the protocol log.</b> That part is yours.</div>

</div>

</div>

<!--
0:03. Without the rules an agent would finish the whole app in one go, or copy the solution, and nobody learns anything. With them it fills one gap and then teaches you what it did.
Tell them: if your agent wanders into exercises/ or app/, stop it and point it at AGENTS.md.
-->

---

# The workshop host on localhost:8080: chat, view, protocol log

<div class="grid grid-cols-3 gap-3 mt-4 text-sm">
  <div class="ed-card"><div class="kicker">Conversation</div>Pick a tool, fill in its arguments, press <b>Call</b>. You play the model. Messages from the view land here as user turns, and the latest model context is pinned on top.</div>
  <div class="ed-card ed-card--accent"><div class="kicker">View</div>Your MCP App, in the same double iframe a web host uses: a sandbox proxy on <code>:8081</code>, then your HTML, under a CSP built from your <code>_meta.ui.csp</code>.</div>
  <div class="ed-card"><div class="kicker">Protocol log</div>Every JSON-RPC message, tagged <b>server</b> (host ⇄ server) or <b>view</b> (host ⇄ view). Click to see the raw JSON. CSP violations show up here too.</div>
</div>

<div class="grid grid-cols-2 gap-4 mt-5 text-sm">
  <div class="ed-card">Toolbar: <b>Host theme</b> (SDK basic, Claude-style, ChatGPT-style, none), ☀️ / 🌙, display mode.</div>
  <div class="cue"><div><code>npm start</code> · builds the view, server on <code>:3001</code>, host on <code>:8080</code></div></div>
</div>

<!--
0:03. LIVE: switch to the browser, show the three panes for 30 seconds. No model runs anywhere: you are the model. That is why it works offline and needs no account.
If anyone's ports are busy: `npm run doctor` names the process.
-->

---
layout: section
---

<div class="kicker">Section 1 · 0:03 · 20 min · no code</div>

# Read the MCP traffic of the finished server

<div class="sec-build">Walk the finished Expensify server in MCP Inspector and read every message of protocol 2026-07-28: <code>server/discover</code>, <code>tools/list</code>, <code>tools/call</code>, <code>resources/read</code>, <code>prompts/get</code>.</div>

<!--
0:03. Twenty minutes of MCP before any UI. About 8 minutes of concepts, then real messages from the real server, then Inspector live.
Ask: "Who has used an MCP server? Who has written one?" Calibrate speed from the hands.
-->

---

# MCP turns N × M integrations into N + M

<div class="grid grid-cols-2 gap-6 mt-6 text-sm">
  <div class="ed-card ed-card--bad">
    <div class="kicker">Before · N × M</div>
    <div class="mt-2">Claude, ChatGPT, Copilot and Cursor each need their own plugin for your expense tracker, your calendar, your database. Four hosts, three tools: twelve integrations, all slightly different.</div>
  </div>
  <div class="ed-card ed-card--good">
    <div class="kicker">After · N + M</div>
    <div class="mt-2">Each host speaks MCP once. Each tool speaks MCP once. Your Expensify server works in every host that speaks it, and today, with a UI.</div>
  </div>
</div>

<div v-click class="big-line big-line--sm mt-10 text-center">MCP is <em>one protocol</em> between any AI app and any tool.</div>

<!--
0:04. One minute. This is the USB-C pitch, and everyone has heard it. Move on fast.
-->

---

# Host, client and server: who runs what

<img src="/mcp-roles.svg" class="diagram" style="max-height: 230px" alt="The host (Claude, ChatGPT, VS Code, the workshop host) holds the model and one MCP client per server. One client sends tools/call to the Expensify server on localhost:3001/mcp; another speaks JSON-RPC to another server." />

<div class="grid grid-cols-3 gap-4 mt-5 text-sm">
  <div class="ed-card"><div class="kicker">Host</div><div class="mt-1">The AI app the user sees. It owns the model and the UI.</div></div>
  <div class="ed-card"><div class="kicker">Client</div><div class="mt-1">One per server, inside the host. Speaks MCP.</div></div>
  <div class="ed-card ed-card--accent"><div class="kicker">Server</div><div class="mt-1">Your code. Exposes tools, resources and prompts. <b>This is what we build.</b></div></div>
</div>

<!--
0:05. The host runs one client per server it connects to. People mix up host and client all day; the rest of the workshop uses "host", because with MCP Apps the host also renders your UI.
-->

---

# Tools, resources and prompts, and who uses each

| Primitive | Who decides to use it | In Expensify |
|---|---|---|
| **Tools** | the **model** calls them | `get_summary`, `list_expenses`, `add_expense`, `delete_expense` |
| **Resources** | the **app** attaches them | `expenses://categories`, and soon `ui://expensify/dashboard.html` |
| **Prompts** | the **user** picks them | `monthly_review`: "Review my spending for 2026-10…" |

<div v-click class="mt-6 ed-card ed-card--accent text-sm">MCP Apps is built from two of these: a <b>resource</b> that holds the HTML, and a <b>tool</b> that points at it. Nothing new on the wire to learn, except a few <code>_meta</code> fields.</div>

<!--
0:06. The control question is the one people get wrong in interviews: who decides. Model, app, user.
Prompts are user-controlled templates, like slash commands. Resources are context the app chooses to attach.
-->

---

# Transports: Streamable HTTP, stdio and postMessage

<div class="grid grid-cols-2 gap-6 mt-4 text-sm">
  <div class="ed-card ed-card--accent">
    <div class="kicker">Streamable HTTP · what we use</div>
    <div class="mt-2">One endpoint, <code>POST /mcp</code>. Every message is its own HTTP request, and carries its own version and capabilities.</div>
    <div class="mt-2">The reply is one JSON object, or a short SSE stream on that same response when there's progress to report.</div>
    <div class="mt-2"><b>No session, no handshake.</b> Any instance can answer any request: Node on your laptop, Cloudflare Workers in section 6.</div>
  </div>
  <div class="grid gap-4 content-start">
    <div class="ed-card">
      <div class="kicker">stdio · local</div>
      <div class="mt-2">The host starts your server as a child process and talks over stdin and stdout. Good for a CLI tool on your laptop.</div>
    </div>
    <div class="ed-card">
      <div class="kicker">postMessage · the view, section 3</div>
      <div class="mt-2">Between your view's iframe and the host. Same JSON-RPC, a different pipe.</div>
    </div>
  </div>
</div>

<div class="text-xs text-gray-400 mt-6">Older clients and servers use the 2025 revision: an <code>initialize</code> handshake and an <code>Mcp-Session-Id</code>. The SDK still serves them, and real hosts may still negotiate it, so the workshop host connects with <code>versionNegotiation: { mode: 'auto' }</code>.</div>

<!--
0:07. Keep it short. The takeaway: same JSON-RPC messages, different pipes. HTTP, stdio, and later postMessage.
Our server is stateless: createMcpHandler builds a fresh McpServer per request. That's only possible because protocol 2026-07-28 puts the version and capabilities on every request instead of in a session.
The footnote, only if asked: the SDK (2.3.1) speaks both eras. The client opts in to 2026-07-28 with versionNegotiation. The workshop host uses mode 'auto': it probes with server/discover and falls back to the 2025 handshake for an older server. The tests, the smoke check and the wire capture pin '2026-07-28' so they fail loudly if the server can't speak it.
Removed in 2026-07-28, if someone asks: sessions, the GET stream for server-to-client messages, resumable streams. A server that needs input from the user returns resultType input_required; the client answers and retries.
-->

---

# JSON-RPC: request, response, notification

<div class="grid grid-cols-3 gap-4 mt-4">

<div>
<div class="dir"><b>request</b> · has an id</div>

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "get_summary" }
}
```
</div>

<div>
<div class="dir res"><b>response</b> · same id</div>

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": { "content": [] }
}
```
</div>

<div>
<div class="dir"><b>notification</b> · no id, no reply</div>

```json
{
  "jsonrpc": "2.0",
  "method":
    "ui/notifications/tool-result",
  "params": { "content": [] }
}
```
</div>

</div>

<div class="mt-4 text-sm text-gray-400">A response carries a <code>result</code> or an <code>error</code>, never both. The <b>id</b> is the only thing that pairs it with its request. You'll match ids by eye in the protocol log all day.</div>

<!--
0:08. Three shapes. That is all of JSON-RPC that matters today. Ask the room: "What pairs a response with its request?" Answer: the id.
The notification is one the view gets in section 3. Between host and view you'll see lots of them. Between host and server, in 2026-07-28, almost everything is a request and its response.
-->

---

# Lifecycle step 1 (2026-07-28): server/discover

<img src="/mcp-lifecycle-discover.svg" class="diagram" style="max-height: 400px; width: 100%" alt="Sequence: the client sends server/discover and gets back supportedVersions, capabilities and serverInfo. One request, one answer, no handshake to finish." />

<div class="text-sm text-center mt-2"><code>server/discover</code> asks what the server supports. One request, one answer.</div>

<!--
0:09. The whole lifecycle of protocol 2026-07-28 is two steps, one per slide. This is the first.
Discover is optional for a client that already knows the server, but every SDK client does it at connect. There's no negotiation phase to remember and nothing to finish before the first real request.
-->

---

# Lifecycle step 2: every request carries its _meta

<div class="grid grid-cols-5 gap-6 items-center">

<div class="col-span-3">
<img src="/mcp-lifecycle-requests.svg" class="diagram" style="max-height: 450px" alt="Sequence: any request, in any order: tools/list returns tools with _meta.ui.resourceUri, tools/call get_summary returns content and structuredContent, resources/read and prompts/get return contents and messages. No session id; any instance can answer." />
</div>

<div class="col-span-2 text-sm space-y-3">
  <div class="ed-card"><div class="kicker">Any request, any order</div><div class="mt-1">Each request carries the protocol version and the client's capabilities in its own <code>_meta</code>.</div></div>
  <div class="ed-card ed-card--accent"><div class="kicker">MCP Apps switches on here</div><div class="mt-1">The client lists the <code>io.modelcontextprotocol/ui</code> extension in those capabilities. On every request.</div></div>
</div>

</div>

<!--
0:10. Nothing to clean up: the server holds no state about the client between requests. That's why the same code runs on Workers, where any instance can answer.
MCP Apps rides on capabilities: a host that can render views says so with the io.modelcontextprotocol/ui extension. Next slide shows it, in the real bytes.
-->

---
class: dense
---

# On the wire: server/discover

<div class="grid grid-cols-2 gap-5">

<div>
<div class="dir"><b>client → server</b> · POST /mcp</div>

```text
mcp-protocol-version: 2026-07-28
mcp-method: server/discover
```

```json {4-8|8-11|all}
{ "jsonrpc": "2.0", "id": "server-discover-probe-1",
  "method": "server/discover",
  "params": { "_meta": {
    "io.modelcontextprotocol/protocolVersion":
      "2026-07-28",
    "io.modelcontextprotocol/clientInfo":
      { "name": "workshop-test", "version": "1.0.0" },
    "io.modelcontextprotocol/clientCapabilities": {
      "extensions": {
        "io.modelcontextprotocol/ui": {
          "mimeTypes": ["text/html;profile=mcp-app"] } } }
  } }
}
```
</div>

<div>
<div class="dir res"><b>server → client</b> · 200 application/json</div>

```json
{ "jsonrpc": "2.0", "id": "server-discover-probe-1",
  "result": {
    "supportedVersions": ["2026-07-28"],
    "capabilities": {
      "tools": { "listChanged": true },
      "resources": { "listChanged": true },
      "prompts": { "listChanged": true } },
    "instructions": "Personal expense tracker in INR. …",
    "resultType": "complete",
    "ttlMs": 0, "cacheScope": "private",
    "_meta": { "io.modelcontextprotocol/serverInfo":
      { "name": "expensify", "title": "Expensify", … } }
  }
}
```
</div>

</div>

<div class="src mt-2">Captured from app/server/server.ts with @modelcontextprotocol/client 2.3.1, pinned to 2026-07-28 · slides/scripts/capture-wire.ts · reflowed</div>

<!--
0:10. Real traffic, not a drawing. Captured by slides/scripts/capture-wire.ts against the finished server, in process.
Click 1: the envelope. protocolVersion, clientInfo, clientCapabilities. In 2026-07-28 every request carries these three keys. This is the only slide that shows it in full.
Click 2: the extension. This one block is how a host says "I can render MCP Apps". A host without it just never sees a view. The server can check it with getUiCapability; ours doesn't need to.
The answer: the versions it speaks, what it has (tools, resources, prompts), instructions (a hint for the model about how to use this server), and serverInfo in _meta.
resultType "complete" means "here is your answer". ttlMs and cacheScope are cache hints: 0 and private mean "don't cache".
-->

---
class: dense
---

# Every request carries its own envelope

<div class="grid grid-cols-2 gap-5">

<div>
<div class="dir"><b>client → server</b> · tools/call, the HTTP headers</div>

```text
POST /mcp
content-type: application/json
accept: application/json, text/event-stream
mcp-protocol-version: 2026-07-28
mcp-method: tools/call
mcp-name: get_summary
```

<div class="dir mt-2"><b>client → server</b> · the body</div>

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": {
    "name": "get_summary",
    "arguments": { "from": "2026-10-01", … },
    "_meta": { "io.modelcontextprotocol/protocolVersion": …,
               "io.modelcontextprotocol/clientInfo": …,
               "io.modelcontextprotocol/clientCapabilities": … }
  } }
```
</div>

<div class="text-sm space-y-2">
  <div class="ed-card" style="padding: 0.55rem 0.9rem"><div class="kicker">Headers</div><div class="mt-1"><code>mcp-method</code> and <code>mcp-name</code> copy the body, so a load balancer or gateway can route without parsing JSON.</div></div>
  <div class="ed-card" style="padding: 0.55rem 0.9rem"><div class="kicker">_meta envelope</div><div class="mt-1">The same three keys on every request. The server needs nothing from an earlier one.</div></div>
  <div class="ed-card" style="padding: 0.55rem 0.9rem"><div class="kicker">Result</div><div class="mt-1"><code>resultType: "complete"</code>, plus <code>serverInfo</code> in its <code>_meta</code>. <code>"input_required"</code> would mean "ask the user, then retry".</div></div>
  <div class="ed-card ed-card--accent" style="padding: 0.55rem 0.9rem"><div class="kicker">Not on the wire</div><div class="mt-1">No <code>mcp-session-id</code>, no GET stream. That's what <b>stateless</b> means.</div></div>
</div>

</div>

<div class="src mt-2">From here on, the slides trim the envelope, the headers and serverInfo. They're the same on every message.</div>

<!--
0:11. The one slide about the envelope. After this, every wire slide hides it, and says so.
Headers: mcp-protocol-version on every request, mcp-method always, mcp-name for tools/call, resources/read and prompts/get. Routing without reading the body.
input_required: the 2026-07-28 way for a server to ask the user something mid-call (elicitation). The server returns a result that says what it needs; the client gets the answer and sends the request again with it. Our server never needs it. Mention only if asked.
Inspector and the workshop host show the same headers in their logs.
-->

---
class: dense
---

# On the wire: tools/list

<div class="grid grid-cols-5 gap-5">

<div class="col-span-3">
<div class="dir res"><b>server → client</b> · one of four tools · envelope and serverInfo trimmed</div>

```json {2-4|5-9|10|11|12-17}
{
  "name": "get_summary",
  "title": "Spending summary",
  "description": "Total spend and a breakdown …",
  "inputSchema": { "type": "object", "properties": {
    "from":    { "type": "string", "pattern": "^\\d{4}-…" },
    "to":      { "type": "string", "pattern": "^\\d{4}-…" },
    "groupBy": { "enum": ["category", "merchant", "month"] }
  } },
  "outputSchema": { "type": "object", "required": [ … ] },
  "annotations": { "readOnlyHint": true, … },
  "_meta": {
    "ui": {
      "resourceUri": "ui://expensify/dashboard.html"
    },
    "ui/resourceUri": "ui://expensify/dashboard.html"
  }
}
```
</div>

<div class="col-span-2 text-sm space-y-3">
  <div class="ed-card"><b>Zod on the server</b> became <b>JSON Schema</b> on the wire. The model reads the description and <code>inputSchema</code> to decide how to call it.</div>
  <div class="ed-card"><code>outputSchema</code> promises the shape of <code>structuredContent</code>.</div>
  <div class="ed-card ed-card--accent"><code>_meta.ui.resourceUri</code>: the link to the view. You add it in step 2.2. The flat <code>ui/resourceUri</code> key is a copy for older hosts.</div>
</div>

</div>

<!--
0:12. This is the finished server, so the _meta is already there. Plant the seed: "In 20 minutes you will write the lines that produce this _meta block."
Annotations are hints for the host: readOnlyHint means no confirmation dialog needed.
-->

---
class: dense
---

# On the wire: tools/call

<div class="grid grid-cols-2 gap-5">

<div>
<div class="dir"><b>client → server</b> · envelope trimmed</div>

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_summary",
    "arguments": {
      "from": "2026-10-01", "to": "2026-10-31",
      "groupBy": "category"
    }
  }
}
```

<div class="mt-3 text-sm ed-card ed-card--accent"><b>Two halves, two readers.</b> <code>content</code> is text for the model. <code>structuredContent</code> is data for code. The rest of the workshop lives in the second half.</div>
</div>

<div>
<div class="dir res"><b>server → client</b> · id 1 · serverInfo trimmed</div>

```json {3-6|7-15|16}
{
  "result": {
    "content": [{
      "type": "text",
      "text": "Total ₹21,776 across 18 expenses\n…"
    }],
    "structuredContent": {
      "currency": "INR",
      "from": "2026-10-01", "to": "2026-10-31",
      "total": 21776, "count": 18,
      "groupBy": "category",
      "groups": [
        { "key": "travel", "total": 6420, "count": 1 },
        { "key": "shopping", "total": 3798, … }, …
      ]
    },
    "resultType": "complete"
  }
}
```
</div>

</div>

<!--
0:13. The single most important slide in section 1. Stop and let it sit.
content: the model reads and quotes it. And every host without MCP Apps shows it. structuredContent: typed by outputSchema, numbers not strings. The view will render from this and never parse the text.
-->

---
class: dense
---

# On the wire: resources/read and prompts/get

<div class="grid grid-cols-2 gap-5">

<div>
<div class="dir res"><b>resources/read</b> · <code>expenses://categories</code> · the result, trimmed</div>

```json
{ "contents": [{
    "uri": "expenses://categories",
    "mimeType": "application/json",
    "text": "[\"food\",\"transport\",\"groceries\",\"shopping\",…]"
} ] }
```

<div class="dir res mt-3"><b>resources/read</b> · <code>ui://expensify/dashboard.html</code></div>

```json
{ "contents": [{
    "uri": "ui://expensify/dashboard.html",
    "mimeType": "text/html;profile=mcp-app",
    "text": "<!doctype html><html>…the built view…</html>",
    "_meta": { "ui": {
      "csp": { "resourceDomains": [
        "https://fonts.googleapis.com", "https://fonts.gstatic.com" ] },
      "prefersBorder": false } }
} ] }
```
</div>

<div>
<div class="dir res"><b>prompts/get</b> · <code>monthly_review { month: "2026-10" }</code> · the result</div>

```json
{ "messages": [{
    "role": "user",
    "content": { "type": "text",
      "text": "Review my spending for 2026-10. Call get_summary for 2026-10-01 to the end of that month, grouped by category, then point out the two categories I could cut back on most, with numbers." }
} ] }
```

<div class="mt-3 text-sm ed-card ed-card--accent">Spot it: the view <b>is</b> a resource. Same <code>resources/read</code>, a different MIME type. That's section 2.</div>
</div>

</div>

<!--
0:14. Resources are just read by URI. The ui:// one is the view: an ordinary resource with a special MIME type and a CSP declaration. Prompts return messages that the host drops into the chat as if the user typed them.
-->

---

# Follow along: the finished server in MCP Inspector

<div class="cue mt-2">
  <div><code>npm start -- --app app</code> · the finished server on <code>:3001</code></div>
  <div><code>npm run inspect</code> · Inspector on <code>:6274</code>, already pointed at <code>localhost:3001/mcp</code>. Press <b>Connect</b>.</div>
  <div><b>Tools</b>: list them, call <code>get_summary</code> with <code>{ "groupBy": "category" }</code>. Find <code>content</code> and <code>structuredContent</code>.</div>
  <div><b>Resources</b>: read <code>expenses://categories</code>. <b>Prompts</b>: get <code>monthly_review</code>, with and without a month.</div>
  <div><b>History</b>: find <code>server/discover</code> first. Open each request and its response, and find the <code>id</code> that pairs them.</div>
</div>

<div class="mt-3 text-sm text-gray-400">Explain it back: who decides when a tool, a resource and a prompt are used? What pairs a response with its request?</div>

<!--
0:15 to 0:23. LIVE DEMO, then the room does it. About 8 minutes.
If Inspector won't open: it prints a URL with a token, copy the full URL.
Walk the room. Most common problem: the server isn't running, so Connect fails.
Inspector 2.10 can speak either protocol revision. Against our server it should open with server/discover; if someone's History shows the older 2025 handshake instead, their Inspector negotiated down. Not a problem for the exercise. Check this in the dry run.
At 0:22 ask the three "Explain it back" questions out loud, take one answer each. Then move on whether or not everyone finished: nothing later depends on Inspector.
-->

---
layout: section
---

<div class="kicker">Section 2 · 0:23 · 15 min · steps 2.1 and 2.2</div>

# Serve the view and link the tool to it

<div class="sec-build">Add a <code>ui://</code> resource with the view's HTML, and point <code>get_summary</code> at it. By the end, calling the tool mounts your view in the workshop host.</div>

<div class="sec-meta"><span>server/server.ts</span></div>

<!--
0:23. From here on, every section has the same rhythm. This one is short: two small server changes.
-->

---

# The three parts of an MCP App: server, host, view

<div class="grid grid-cols-11 gap-2 items-center mt-4">

<div class="col-span-6 bx">
  <span class="bx-l">HOST · Claude, ChatGPT, VS Code, localhost:8080</span>
  <div class="grid grid-cols-2 gap-3 mt-1">
    <div class="bx bx--raised"><span class="bx-l">MODEL</span>Sees the tools. Reads <code>content</code>. Decides to call <code>get_summary</code>.</div>
    <div class="bx bx--ours"><span class="bx-l">VIEW · React</span>Your HTML, in a <b>sandboxed iframe</b>. Renders <code>structuredContent</code>.</div>
  </div>
  <div class="pipe mt-2">view ⇄ host: <b>postMessage</b>, JSON-RPC</div>
</div>

<div class="col-span-1 pipe"><span class="ar">⇄</span>MCP</div>

<div class="col-span-4 bx">
  <span class="bx-l">YOUR MCP SERVER · :3001</span>
  <div class="bx bx--raised mt-1"><span class="bx-l">TOOL</span><code>get_summary</code><br/><code>_meta.ui.resourceUri</code></div>
  <div class="bx bx--ours mt-2"><span class="bx-l">UI RESOURCE</span><code>ui://expensify/dashboard.html</code><br/><code>text/html;profile=mcp-app</code></div>
</div>

</div>

<div class="grid grid-cols-3 gap-3 mt-4 text-sm">
  <div v-click class="ed-card"><b>Server</b> declares tools and one HTML resource.</div>
  <div v-click class="ed-card"><b>Host</b> renders the view, and sits in the middle of every message.</div>
  <div v-click class="ed-card ed-card--accent"><b>View</b> talks only to the host. Never to your server.</div>
</div>

<!--
0:24. The one mental model for the day: the host is always in the middle. The view is a client of the host; the host is a client of your server.
-->

---

# Steps 2.1 and 2.2: what you'll fill in

<div class="grid grid-cols-2 gap-6 mt-2">

<div>
<div class="cmd">npm run go 2.1</div>

<div class="steps mt-3">
  <div><span class="n">🔨 2.1</span><span><code>registerAppResource</code> for <code>ui://expensify/dashboard.html</code></span><span class="w">server/server.ts</span></div>
  <div><span class="n">🔨 2.2</span><span><code>registerAppTool</code> with <code>_meta.ui.resourceUri</code></span><span class="w">server/server.ts</span></div>
  <div><span class="n">🔥 2.2</span><span>The same for <code>list_expenses</code></span><span class="w">server/server.ts</span></div>
</div>

<div class="mt-3 text-sm text-gray-400">Or tell your agent: <code>/step 2.1</code>, then <code>/step 2.2</code>.</div>
</div>

<div class="text-sm space-y-3">
  <div class="ed-card">The view in <code>ui/</code> is a starter: it only says "Waiting for the host…". <code>npm start</code> builds it into <code>dist/mcp-app.html</code>.</div>
  <div class="ed-card"><code>http.ts</code> already hands that file to <code>createServer</code> as <code>viewHtml</code>. Nothing serves it yet.</div>
  <div class="ed-card ed-card--accent">Done when: <code>npm test</code> passes, and calling <code>get_summary</code> in the host mounts an iframe.</div>
</div>

</div>

<!--
0:25. Say what they're about to do, then explain it on the next two slides, then let them type. About 6 minutes of filling for both steps together.
-->

---
class: dense
---

# 2.1 · Register the view as a ui:// resource

<div class="file"><b>server/server.ts</b> · resources</div>

```ts {1-5|6-10|11-14|all}
registerAppResource(
  server,
  'Expenses dashboard',
  VIEW_URI,                                  // 'ui://expensify/dashboard.html'
  { description: 'Interactive dashboard for get_summary and list_expenses.' },
  async () => ({
    contents: [
      {
        uri: VIEW_URI,
        mimeType: RESOURCE_MIME_TYPE,        // 'text/html;profile=mcp-app'
        text: await viewHtml()               // the whole built view, one file
      }
    ]
  })
);
```

<div class="grid grid-cols-3 gap-3 mt-2 text-sm">
  <div class="ed-card"><b>Why a resource?</b> A stable URI the host can fetch early, cache, and review before anything runs.</div>
  <div class="ed-card"><b><code>profile=mcp-app</code></b> says: render me in a sandbox and talk to me. Plain <code>text/html</code> would show as text.</div>
  <div class="ed-card"><b>Why one file?</b> The sandbox has no URL to load scripts from. <code>vite-plugin-singlefile</code> inlines all JS and CSS.</div>
</div>

<!--
0:26. Click through: the registration (name, uri, config), the read callback, then the three fields.
registerAppResource is registerResource with the MIME type filled in for resources/list. The callback still sets mimeType, because resources/read is what the host actually reads.
The _meta.ui.csp you saw on the wire comes later, in 5.3.
-->

---
class: dense
---

# 2.2 · Point get_summary at the view

<div class="file"><b>server/server.ts</b> · tools, trimmed</div>

```ts {1-3|4-10|11|12-19}
registerAppTool(
  server,
  'get_summary',
  {
    title: 'Spending summary',
    description: 'Total spend and a breakdown … Hosts that render MCP Apps show this as an interactive dashboard …',
    inputSchema: z.object({ ...range, groupBy: z.enum(GROUP_BY).default('category') }),
    outputSchema: z.object({ currency: z.literal('INR'), total: z.number(), /* … */ }),
    annotations: { readOnlyHint: true, idempotentHint: true },
    _meta: { ui: { resourceUri: VIEW_URI } }
  },
  async (args) => {
    const summary = store.summary(args);
    return {
      content: [{ type: 'text', text: `Total ${formatINR(summary.total)} across ${summary.count} expenses …` }],
      structuredContent: { ...summary }
    };
  }
);
```

<div class="mt-1 text-sm text-gray-400"><code>registerAppTool</code> is <code>server.registerTool</code> with <code>server</code> first, plus a copy of the URI in the flat <code>_meta["ui/resourceUri"]</code> key older hosts read.</div>

<!--
0:28. The only change from the plain tool: the function, and one _meta line. The handler and the result are untouched.
Point at the description: "show this as an interactive dashboard … do not repeat every number". Tell the model the user can see it, or it will narrate the chart.
A host without MCP Apps ignores _meta and shows the text. Graceful degradation, for free.
Optional mention: getUiCapability(clientCapabilities) from ext-apps/server tells you whether this host renders views. We don't need it: the text is good on its own.
-->

---

# How the host finds, reads and mounts the view

<img src="/host-mounts-view.svg" class="diagram" style="max-height: 410px" alt="Sequence: at connect the workshop host sends server/discover and tools/list to the Expensify server, and learns get_summary has _meta.ui.resourceUri. You call get_summary; the host sends tools/call, then resources/read ui://expensify/dashboard.html, gets text/html;profile=mcp-app, and mounts it in the sandbox. The view shows Waiting for the host." />

<!--
0:30. Fill time starts after this slide. Put this slide back up while they work.
Note the order: the workshop host calls the tool, then reads the resource. A real host may read it at connect time, before any call: that's what "prefetch" means.
-->

---

# Read the traffic: the host reads your view

<div class="text-sm text-gray-400 mb-3">Call <code>get_summary</code> in the host. In the protocol log, filter to <b>server</b>:</div>

<div class="plog">
  <div><span class="leg">server →</span><span class="m">server/discover</span><span class="why">first, at connect: what the server has</span></div>
  <div><span class="leg">server →</span><span class="m">tools/list</span><span class="why">find <code>_meta.ui.resourceUri</code> on get_summary</span></div>
  <div><span class="leg">server →</span><span class="m">tools/call get_summary</span><span class="why">the same call as in Inspector</span></div>
  <div class="new"><span class="leg">server →</span><span class="m">resources/read ui://expensify/…</span><span class="why">new: the host fetches your view</span></div>
  <div><span class="leg">view</span><span class="m">(nothing)</span><span class="why">the view doesn't speak yet</span></div>
</div>

<div class="mt-5 grid grid-cols-3 gap-3 text-sm">
  <div class="ed-card">Where does a host learn which view belongs to a tool, and when?</div>
  <div class="ed-card">What does a host without MCP Apps show for <code>get_summary</code>?</div>
  <div class="ed-card">Could a host read the resource <b>before</b> <code>tools/call</code>? Why would it?</div>
</div>

<!--
0:34 to 0:38. Read the traffic, then checkpoint. Ask the three questions.
Answers: in tools/list, at connect time. The text content. Yes: to prefetch, cache, review, and to start rendering while the tool runs.
Checkpoint: anyone not seeing an iframe runs npm run solution, then npm run go 3.1.
-->

---
layout: section
---

<div class="kicker">Section 3 · 0:38 · 33 min · steps 3.1 to 3.4</div>

# Connect the view to the host with useApp

<div class="sec-build">Run the MCP Apps handshake, read the model's arguments, render the server's answer and follow the host's theme. By the end: the dashboard, with real totals.</div>

<div class="sec-meta"><span>ui/mcp-app.tsx</span></div>

<!--
0:38. The main block. About 12 minutes of understanding first, then 4 steps of filling. If this runs long, 3.4 can be shown on stage instead of filled.
MUST-SAY CORE if short on time: the handshake, listeners before connect, content vs structuredContent.
-->

---

# Steps 3.1 to 3.4: what you'll fill in

<div class="grid grid-cols-2 gap-6 mt-2">

<div>
<div class="cmd">npm run go 3.1</div>

<div class="steps mt-3">
  <div><span class="n">🔨 3.1</span><span><code>useApp({ appInfo, capabilities, onAppCreated })</code></span><span class="w">ui/initialize</span></div>
  <div><span class="n">🔨 3.2</span><span>a <code>'toolinput'</code> listener</span><span class="w">…/tool-input</span></div>
  <div><span class="n">🔨 3.3</span><span>a <code>'toolresult'</code> listener</span><span class="w">…/tool-result</span></div>
  <div><span class="n">🔨 3.4</span><span><code>getHostContext()</code> + <code>'hostcontextchanged'</code></span><span class="w">…/host-context-changed</span></div>
</div>
</div>

<div class="text-sm space-y-3">
  <div class="ed-card">All four live in <code>ui/mcp-app.tsx</code>, in <code>ExpensifyApp</code>.</div>
  <div class="ed-card">Each step is its own folder. Finish 3.1, then <code>npm run go 3.2</code> (or <code>npm run go next</code>).</div>
  <div class="ed-card ed-card--accent">Agent users: <code>/step 3.1</code>, read its "Explain it back", then <code>/step 3.2</code>.</div>
</div>

</div>

<!--
0:39. Show the map. We understand all four first, then fill them back to back, with a traffic check after each run.
-->

---

# The four ext-apps entry points and what each is for

<div class="text-sm text-gray-400 mb-2">All from <code>@modelcontextprotocol/ext-apps</code> 2.0.3:</div>

| Import | For | You will use |
|---|---|---|
| `…/ext-apps/server` | your MCP server | `registerAppTool`, `registerAppResource`, `RESOURCE_MIME_TYPE`, `getUiCapability` |
| `…/ext-apps` | the view | `App`, `PostMessageTransport`, `McpUiHostContext` |
| `…/ext-apps/react` | the view, in React | `useApp`, `useHostStyles` (also `useAutoResize`, `useDocumentTheme`) |
| `…/ext-apps/app-bridge` | building a host | `AppBridge` (the workshop host uses it) |

<div class="mt-5 text-sm text-gray-400">The SDK writes every <code>ui/*</code> message for you. You won't type a single method string today. You will <b>read</b> all of them.</div>

<!--
0:40. Orientation. Section 2 used the first row. Sections 3 to 5 use rows two and three. Row four is the other end of the pipe: the workshop host is built on AppBridge.
-->

---

# The view talks to the host over postMessage

<div class="grid grid-cols-5 gap-6 mt-2">

<div class="col-span-3">
<div class="file"><b>what useApp does for you</b> · the vanilla version</div>

```ts {1|2-4|5-6|all}
const app = new App({ name: 'Expensify', version: '1.0.0' }, {});
// listeners go here, before connect
app.addEventListener('toolinput', (params) => { /* … */ });
app.addEventListener('toolresult', (result) => { /* … */ });
const transport = new PostMessageTransport(window.parent, window.parent);
await app.connect(transport);
```

<div class="mt-3 text-sm text-gray-400"><code>connect()</code> sends <code>ui/initialize</code>, waits for the host's answer, then sends <code>ui/notifications/initialized</code>.</div>

<div class="mt-3 text-sm ed-card ed-card--warn"><b>A different handshake.</b> MCP 2026-07-28 dropped its own, between host and server. <code>ui/initialize</code> belongs to MCP Apps, between view and host, and stays.</div>
</div>

<div class="col-span-2 text-sm space-y-3">
  <div class="ed-card">The view speaks <b>JSON-RPC over <code>postMessage</code></b> to its parent window. The same message shapes as MCP.</div>
  <div class="ed-card">It uses familiar methods (<code>tools/call</code>, <code>resources/read</code>) plus a small <code>ui/*</code> set.</div>
  <div class="ed-card ed-card--accent">By default it <b>cannot</b> make a network call at all. The host is its only door.</div>
</div>

</div>

<!--
0:41. useApp is a thin React wrapper around exactly these three lines. Show the vanilla version so the hook isn't magic.
Say the yellow card out loud: people who read the MCP changelog will ask "didn't they remove the handshake?" They removed MCP's, between host and server. The view still introduces itself to the host with ui/initialize, because it needs the host context and capabilities before it renders.
-->

---
class: dense
---

# Render, part 1: call the tool, mount the view

<img src="/lifecycle-render-host.svg" class="diagram" style="max-height: 420px; width: 100%" alt="Sequence: at connect the host sends server/discover and tools/list. The user asks how much they spent; the host calls get_summary, reads the ui:// view resource, and mounts the view in a sandbox." />

<!--
0:42. Walk it top to bottom. Everything on this slide is host to server, MCP 2026-07-28, and section 2 already set it up.
The host reads the view from tools/list's _meta.ui.resourceUri, fetches it with resources/read, and mounts it. It does not wait for the tool result: the view can show a loading state.
-->

---

# Render, part 2: the view connects, gets the data

<img src="/lifecycle-render-view.svg" class="diagram" style="max-height: 420px; width: 100%" alt="Sequence: the view sends ui/initialize (3.1), receives tool-input (3.2), the server's content and structuredContent reach the host, the view receives tool-result (3.3), then host-context-changed any time after (3.4)." />

<!--
0:43. Now view to host, the MCP Apps side. Name the step that handles each arrow.
1. Handshake: ui/initialize (3.1), the host answers with hostContext and capabilities, the view sends ui/notifications/initialized. This is the MCP Apps handshake (spec 2026-01-26), view to host. Host to server there is none: that leg is MCP 2026-07-28.
2. tool-input (3.2): the arguments the model chose. Can arrive before the server answers.
3. tool-result (3.3): the same result the server sent the host.
4. host-context-changed (3.4): any time later. Theme flip, resize, display mode.
-->

---
class: dense
---

# 3.1 · Connect to the host with useApp

<div class="file"><b>ui/mcp-app.tsx</b> · ExpensifyApp, trimmed</div>

```tsx {1-3|4-8|11-12|all}
const { app, error } = useApp({
  appInfo: { name: 'Expensify', version: '1.0.0' },
  capabilities: {},
  // Runs before the handshake. Tool input and result arrive once, right after it, so listen first.
  onAppCreated: (created) => {
    // 3.2, 3.3 and 3.4 go here
  }
});

if (error) return <Notice tone="error">Could not connect to the host: {error.message}</Notice>;
if (!app) return <Notice>Waiting for the host…</Notice>;
if (!ready) return <Notice>{waitingFor(range, groupBy)}</Notice>;
```

<div class="grid grid-cols-3 gap-3 mt-3 text-sm">
  <div class="ed-card"><code>app</code> stays <code>null</code> until the handshake is done. Also returns <code>isConnected</code>.</div>
  <div class="ed-card"><code>capabilities</code>: what the view supports beyond the basics, like its display modes. <code>{}</code> is fine.</div>
  <div class="ed-card ed-card--accent"><b>Listeners in <code>onAppCreated</code></b>: the input and result fire <b>once</b>. A listener added after <code>useApp</code> returns misses them.</div>
</div>

<!--
0:44. The one idea that bites everyone: timing. onAppCreated runs after new App() and before connect(). The host sends tool-input and tool-result right after ui/notifications/initialized. If you add listeners in a useEffect after app arrives, they're already gone.
Live option: comment out a listener in the solution, call the tool, and show the log has tool-result but the view sits on "Connected. Waiting…".
-->

---
class: dense
---

# 3.2 · Read the model's arguments from toolinput

<div class="grid grid-cols-5 gap-5">

<div class="col-span-3">
<div class="file"><b>ui/mcp-app.tsx</b> · inside onAppCreated</div>

```tsx {1|2|3-4}
created.addEventListener('toolinput', ({ arguments: args }) => {
  setRange({ from: str(args?.from), to: str(args?.to) });
  const g = GROUP_BY.find((x) => x === args?.groupBy);
  if (g) setGroupBy(g);
});
```

<div class="mt-3 text-sm text-gray-400">The arguments come from a model. Treat them like user input: <code>str()</code> drops empty values, and only a <code>groupBy</code> from <code>GROUP_BY</code> gets in.</div>
</div>

<div class="col-span-2">

| Event | When |
|---|---|
| `toolinputpartial` | while the model is still writing args. Preview only, never act on it. |
| `toolinput` | the complete args, once |
| `toolresult` | the server's answer, once |
| `toolcancelled` | the user stopped the call |
| `hostcontextchanged` | theme, size, mode changed |

</div>

</div>

<!--
0:46. Why seed the controls from input? So the date filter and tabs match the data about to arrive, and so the user's next change in section 4 starts from what the model asked.
Input usually arrives while the tool is still running. Partial input is optional and streams; it can change, so never fetch or write on it.
-->

---
class: dense
---

# 3.3 · Render structuredContent from toolresult

<div class="file"><b>ui/mcp-app.tsx</b> · inside onAppCreated</div>

```tsx {1-2|3-6|7-9|10-12|13}
created.addEventListener('toolresult', (result) => {
  const data = result.structuredContent;
  if (isSummary(data)) {
    setSummary(data);
    setGroupBy(data.groupBy);
    setEntry('summary');
  } else if (isExpenseList(data)) {
    setExpenses(data.expenses);
    setEntry('list');
  } else {
    setEntry(created.getHostContext()?.toolInfo?.tool.name === 'list_expenses' ? 'list' : 'summary');
  }
  setReady(true);
});
created.addEventListener('toolcancelled', () => setReady(true));   // 🔥
```

<div class="grid grid-cols-3 gap-3 mt-3 text-sm">
  <div class="ed-card">Render from <code>structuredContent</code>. Never parse the model's text.</div>
  <div class="ed-card"><b>One view, two tools.</b> The shape of the data says which tool opened it. <code>toolInfo</code> is the fallback.</div>
  <div class="ed-card ed-card--accent"><b>Don't fetch on load.</b> The result is already here. Fetching again races the model for the same numbers.</div>
</div>

<!--
0:48. isSummary and isExpenseList still check at runtime, even with an outputSchema: the view can't assume which tool opened it, and a host might send an error result.
After this step, the dashboard renders with real totals. That's the moment the room gets loud. Let it.
-->

---
class: dense
---

# 3.4 · Track the host context: theme, size, locale

<div class="grid grid-cols-9 gap-5">

<div class="col-span-5">
<div class="file"><b>ui/mcp-app.tsx</b> · three small pieces</div>

```tsx {1-2|4-7|9-11}
const [hostContext, setHostContext] =
  useState<McpUiHostContext | undefined>();

// The first context comes with the handshake.
useEffect(() => {
  if (app) setHostContext(app.getHostContext());
}, [app]);

// in onAppCreated: only what changed, so merge
created.addEventListener('hostcontextchanged', (changed) =>
  setHostContext((prev) => ({ ...prev, ...changed })));
```
</div>

<div class="col-span-4">

| `McpUiHostContext` | For |
|---|---|
| `theme`, `styles` | light or dark, CSS variables, fonts |
| `displayMode`, `availableDisplayModes` | inline, fullscreen, pip |
| `containerDimensions` | fixed or max width and height |
| `locale`, `timeZone` | format ₹ and dates |
| `platform`, `deviceCapabilities` | web, desktop, mobile; touch, hover |
| `safeAreaInsets` | notches, host overlays |
| `toolInfo` | which tool opened this view |

</div>

</div>

<div class="mt-2 text-sm text-gray-400">Every field is optional. Each host sends what it has. 🔥 Bonus: a Fullscreen button with <code>app.requestDisplayMode({ mode: 'fullscreen' })</code>.</div>

<!--
0:50. Merge, don't replace: a theme flip sends only { theme }. Replacing would throw away styles, size and toolInfo.
In this step the visible effect is light and dark: tenet-ui reads data-color-mode on <html>. Section 5 uses styles.
0:52: fill time for 3.1 to 3.4, about 12 minutes. Walk the room. Then read the traffic together.
-->

---

# Read the traffic: the view's handshake and notifications

<div class="text-sm text-gray-400 mb-3">Call <code>get_summary</code> with <code>{"from": "2026-10-01", "groupBy": "merchant"}</code>. Filter to <b>view</b>:</div>

<div class="plog">
  <div class="new"><span class="leg">view →</span><span class="m">ui/initialize</span><span class="why">open the result: <code>hostContext</code></span></div>
  <div><span class="leg">view →</span><span class="m">ui/notifications/initialized</span><span class="why">a notification: no id, no reply</span></div>
  <div class="new"><span class="leg">→ view</span><span class="m">ui/notifications/tool-input</span><span class="why">the model's arguments</span></div>
  <div class="new"><span class="leg">→ view</span><span class="m">ui/notifications/tool-result</span><span class="why">compare with the <b>server</b> tools/call result</span></div>
  <div><span class="leg">→ view</span><span class="m">ui/notifications/host-context-changed</span><span class="why">flip ☀️ / 🌙: just <code>{ theme }</code></span></div>
  <div><span class="leg">view →</span><span class="m">ui/notifications/size-changed</span><span class="why">auto-resize, which useApp turns on</span></div>
</div>

<div class="mt-4 grid grid-cols-3 gap-3 text-sm">
  <div class="ed-card">Which arrives first, input or result? Why?</div>
  <div class="ed-card">Who reads <code>content</code>, who reads <code>structuredContent</code>?</div>
  <div class="ed-card">Why merge context changes instead of replacing?</div>
</div>

<!--
1:04 to 1:11. Get people to open tool-result next to the server-side tools/call result: it is the same object, relayed.
Also show: switch the Host theme preset: one host-context-changed with { styles }. Resize the window: { containerDimensions }.
Checkpoint, then break.
-->

---
layout: center
class: text-center
---

# Break: 10 minutes

<div class="text-xl text-gray-400 mt-4">Behind? <code>npm run solution</code>, then after the break <code>npm run go 4.1</code></div>

<div class="mt-8 text-sm text-gray-500">TAs are walking around. Back at 1:21.</div>

<!--
1:11. Put a timer on screen. TAs: priority is anyone whose dashboard doesn't render. npm run status tells you where they are.
-->

---
layout: section
---

<div class="kicker">Section 4 · 1:21 · 27 min · steps 4.1 to 4.4</div>

# Make the view interactive

<div class="sec-build">Clicks call the server through the host, a button hands a question to the chat, a tool the model can't see deletes a row, and a context update keeps the model's numbers right.</div>

<div class="sec-meta"><span>ui/data.ts</span><span>ui/chat.ts</span><span>server/server.ts</span></div>

<!--
1:21. Welcome back. Everyone should be on 4.1 with a rendering dashboard. If not, npm run go 4.1 loads the 3.4 solution as the starting point.
-->

---

# Steps 4.1 to 4.4: what you'll fill in

<div class="grid grid-cols-2 gap-6 mt-2">

<div>
<div class="cmd">npm run go 4.1</div>

<div class="steps mt-3">
  <div><span class="n">🔨 4.1</span><span><code>app.callServerTool</code> for get_summary, list_expenses</span><span class="w">ui/data.ts</span></div>
  <div><span class="n">🔨 4.2</span><span><code>app.sendMessage</code> for the Ask buttons</span><span class="w">ui/chat.ts</span></div>
  <div><span class="n">🔨 4.3</span><span><code>visibility: ['app']</code> + call <code>delete_expense</code></span><span class="w">server.ts · data.ts</span></div>
  <div><span class="n">🔨 4.4</span><span><code>app.updateModelContext</code> after a delete</span><span class="w">ui/chat.ts</span></div>
</div>
</div>

<div class="text-sm space-y-3">
  <div class="ed-card">The buttons are already wired in <code>mcp-app.tsx</code>. You write what they call.</div>
  <div class="ed-card ed-card--accent">Four lines of SDK, give or take. The interesting part is <b>who sees what</b>: the model, the user, the server.</div>
</div>

</div>

<!--
1:22. Same rhythm. Understand all four (about 10 minutes), fill (about 10), traffic (5).
-->

---

# A click's tools/call goes view, host, server

<img src="/request-path.svg" class="diagram" style="max-height: 300px" alt="Sequence: you pick This month in the view; the view sends tools/call get_summary to the host with id 3; the host may refuse; the host sends its own tools/call get_summary to the Expensify server with id 7; the result comes back with id 7, and the host answers the view with id 3." />

<div v-click class="big-line big-line--sm mt-6 text-center">No model in this loop. <em>No tokens, no turn.</em></div>

<!--
1:23. Two separate requests, two different ids. Point that out now, because they will see it in the log.
To the server this looks like any other tools/call: it can't tell the view from the model. That matters in 4.3.
-->

---
class: dense
---

# 4.1 · Refetch on a click with callServerTool

<div class="file"><b>ui/data.ts</b></div>

```ts {1-4|5-6|7|9-10}
export async function getSummary(app: App, range: DateRange, groupBy: GroupBy): Promise<Summary> {
  const result = await app.callServerTool({
    name: 'get_summary', arguments: clean({ ...range, groupBy })
  });
  if (result.isError || !isSummary(result.structuredContent))
    throw new Error(textOf(result) || 'get_summary returned no data.');
  return result.structuredContent;
}

// listExpenses: the same shape, with 'list_expenses', { ...range, ...filter, limit: 50 },
// and isExpenseList(result.structuredContent), returning .expenses
```

<div class="grid grid-cols-3 gap-3 mt-3 text-sm">
  <div class="ed-card">A normal <code>CallToolResult</code>. Check <code>isError</code> and the shape, then throw the text.</div>
  <div class="ed-card"><code>clean()</code> drops empty values: a missing filter means "no filter", but <code>""</code> fails the schema.</div>
  <div class="ed-card ed-card--accent"><b>Only clicks fetch.</b> <code>refresh()</code> never runs on mount, so it never races the model.</div>
</div>

<!--
1:25. Mention: the model doesn't see these calls or their results. If something the user did matters to the conversation, the view has to say so. That's 4.4.
-->

---
class: dense
---

# 4.2 · Ask the model with sendMessage

<div class="grid grid-cols-2 gap-5">

<div>
<div class="file"><b>ui/chat.ts</b> · askAbout</div>

```ts
const text = question(groupBy, key, summary);
// "Tell me more about my category "food" spending
//  between 2026-10-01 and 2026-10-31. Is anything unusual?"
await app.sendMessage({
  role: 'user',
  content: [{ type: 'text', text }]
});
```

<div class="mt-3 text-sm text-gray-400"><code>role</code> is always <code>'user'</code>: a view can't speak as the assistant. The host may show it, ask first, or refuse.</div>
</div>

<div>

| | `sendMessage` | `updateModelContext` |
|---|---|---|
| Method | `ui/message` | `ui/update-model-context` |
| In the chat | a visible user turn | nothing visible |
| Model | answers now | reads it next turn |
| Kept | every one | only the **latest** |
| Use for | "explain this", "compare" | "the data changed" |

</div>

</div>

<!--
1:27. The two ways a view talks to the conversation, with very different weight. sendMessage starts a turn: use it when the user asked for something only the model can do. Never for status updates or chatting on the user's behalf.
updateModelContext is 4.4. Introduce it now so the contrast lands.
-->

---
class: dense
---

# 4.3 · delete_expense, a tool only the view can call

<div class="grid grid-cols-2 gap-5">

<div>
<div class="file"><b>server/server.ts</b> · delete_expense</div>

```ts {5-6|7-12}
registerAppTool(server, 'delete_expense', {
  inputSchema: z.object({ id: z.string() }),
  annotations: { destructiveHint: true },
  // … title, description
  _meta: { ui: { resourceUri: VIEW_URI,
                 visibility: ['app'] } }
}, async ({ id }) => {
  // Never trust the caller.
  const removed = store.remove(id);
  return removed ? text(`Deleted …`)
                 : fail(`No expense with id ${id}.`);
});
```

<div class="file mt-3"><b>ui/data.ts</b> · deleteExpense</div>

```ts
const result = await app.callServerTool({
  name: 'delete_expense', arguments: { id }
});
```
</div>

<div class="text-sm space-y-3">

| `visibility` | Model sees it | View can call it |
|---|---|---|
| `['model', 'app']` (default) | yes | yes |
| `['app']` | **no** | yes |
| `['model']` | yes | no |

<div class="ed-card">Why app-only? A person clicked Delete on <b>a specific row</b>. The model can't delete on a guess.</div>
<div class="ed-card ed-card--bad"><b>A promise from the host, not a lock.</b> The server can't tell who called. Check every input as if the model sent it.</div>
</div>

</div>

<!--
1:29. The server line is one word: visibility. The view line is one call.
Stress the red card. Anything the view sends is user input. Authorization lives in the tool handler, never in the view.
In the workshop host, delete_expense disappears from the tool picker: the picker plays the model.
-->

---
class: dense
---

# 4.4 · Report deletions with updateModelContext

<div class="file"><b>ui/chat.ts</b> · reportDeletions</div>

```ts {1-3|4-5}
const text =
  `The user deleted these expenses in the Expensify dashboard, so earlier totals ` +
  `in this conversation are out of date:\n${deleted.map((d) => `- ${d}`).join('\n')}`;
// A quiet note for the model's next turn.
await app.updateModelContext({ content: [{ type: 'text', text }] });
```

<div class="file mt-3"><b>ui/mcp-app.tsx</b> · onDelete, already there</div>

```ts
deleted.current.push(`${e.merchant}, ${formatINR(e.amount)} on ${e.date} (${e.id})`);
// Not every host takes context updates. The delete itself already succeeded, so ignore a refusal.
await reportDeletions(app, deleted.current).catch(() => {});
```

<div class="grid grid-cols-2 gap-3 mt-3 text-sm">
  <div class="ed-card">The model said "₹21,776". The user deleted the ₹1,299 Amazon row. Without this note, its next answer is wrong.</div>
  <div class="ed-card ed-card--accent">Each update <b>replaces</b> the last, so send the <b>whole list</b> every time.</div>
</div>

<!--
1:31. The host keeps the latest update from each view and gives it to the model with the next user message. So one update with everything, not a stream of deltas.
1:33: fill time for 4.1 to 4.4, about 10 minutes.
-->

---
class: dense
---

# Every message the view sends in section 4

<img src="/lifecycle-interact.svg" class="diagram" style="max-height: 400px" alt="Sequence: the user picks This month and the view calls get_summary through the host. The user clicks Ask and the view sends ui/message. The user clicks Delete, the view calls the app-only delete_expense, and updates the model context." />

<!--
1:43. The whole section on one picture, after they've written it. The model is in exactly one place: the ui/message. Everything else is view, host, server.
-->

---

# Other App methods: openLink, requestDisplayMode and more

| Method | Message | For |
|---|---|---|
| `openLink({ url })` | `ui/open-link` | open a URL in the user's browser; sandboxed views can't navigate |
| `requestDisplayMode({ mode })` | `ui/request-display-mode` | inline, fullscreen, pip. The result says what you actually got. |
| `sendSizeChanged(…)` | `ui/notifications/size-changed` | auto by default, through `useApp` |
| `sendLog({ level, data })` | `notifications/message` | logs that reach the host |
| `downloadFile(…)` | `ui/download-file` | hand the user a file |
| `readServerResource(…)` | `resources/read` | read a resource through the host |

<div class="mt-4 text-sm text-gray-400">Check <code>app.getHostCapabilities()</code> before relying on any of these. Each host says what it will do for you.</div>

<!--
1:44. One slide, no exercise. The 3.4 bonus already used requestDisplayMode.
-->

---

# Read the traffic: view calls, messages, context updates

<div class="plog">
  <div class="new"><span class="leg">view →</span><span class="m">tools/call get_summary</span><span class="why">a date preset; note the id</span></div>
  <div class="new"><span class="leg">server →</span><span class="m">tools/call get_summary</span><span class="why">the same call, a different id</span></div>
  <div><span class="leg">view →</span><span class="m">ui/message</span><span class="why">click Ask: a user turn in the conversation pane</span></div>
  <div class="new"><span class="leg">view →</span><span class="m">tools/call delete_expense</span><span class="why">not in the tool picker any more</span></div>
  <div><span class="leg">view →</span><span class="m">tools/call get_summary · list_expenses</span><span class="why">the refresh after a delete</span></div>
  <div class="new"><span class="leg">view →</span><span class="m">ui/update-model-context</span><span class="why">the pinned card; delete twice, it lists both</span></div>
</div>

<div class="mt-4 grid grid-cols-3 gap-3 text-sm">
  <div class="ed-card">Why do the two legs of one click have different ids?</div>
  <div class="ed-card">Which other actions here should be app-only?</div>
  <div class="ed-card">When should a click become a <code>ui/message</code>?</div>
</div>

<!--
1:43 to 1:48. Read the traffic and checkpoint. Answers: the view's request and the server's request are two separate JSON-RPC conversations; the host makes a new one.
Behind: npm run solution, then npm run go 5.1.
-->

---
layout: section
---

<div class="kicker">Section 5 · 1:48 · 20 min · steps 5.1 to 5.3</div>

# Theme the view with the host's styles

<div class="sec-build">Apply the host's colours and fonts, map them onto tenet-ui's tokens, then load one web font through the sandbox's CSP. One build that looks at home in every host.</div>

<div class="sec-meta"><span>ui/mcp-app.tsx</span><span>ui/host-bridge.ts</span><span>server/server.ts</span></div>

<!--
1:48. Keep the Host theme menu and the sun/moon toggle in view for the whole section. By the end, the dashboard follows all four presets in light and dark.
-->

---

# Steps 5.1 to 5.3: what you'll fill in

<div class="grid grid-cols-2 gap-6 mt-2">

<div>
<div class="cmd">npm run go 5.1</div>

<div class="steps mt-3">
  <div><span class="n">🔨 5.1</span><span><code>useHostStyles(app, hostContext)</code> + <code>safeAreaInsets</code></span><span class="w">ui/mcp-app.tsx</span></div>
  <div><span class="n">🔨 5.2</span><span>the token map and the bridge</span><span class="w">ui/host-bridge.ts</span></div>
  <div><span class="n">🔨 5.3</span><span><code>_meta.ui.csp.resourceDomains</code></span><span class="w">server/server.ts</span></div>
</div>
</div>

<div class="text-sm space-y-3">
  <div class="ed-card">5.1 changes nothing on screen. That's expected: 5.2 connects it.</div>
  <div class="ed-card ed-card--accent">5.3 starts <b>broken on purpose</b>. Find the violation in the log before you fix it.</div>
</div>

</div>

<!--
1:49. Warn them about 5.1 so nobody thinks it's broken.
-->

---
class: dense
---

# 5.1 · Apply the host's theme with useHostStyles

<div class="grid grid-cols-2 gap-5">

<div>
<div class="file"><b>ui/mcp-app.tsx</b></div>

```tsx {1-2|4-9}
// ExpensifyApp: variables, fonts, color-scheme
useHostStyles(app, hostContext);

// Dashboard: keep clear of notches and overlays
const insets = hostContext?.safeAreaInsets;
const padding: CSSProperties = {
  paddingTop: insets?.top, paddingRight: insets?.right,
  paddingBottom: insets?.bottom, paddingLeft: insets?.left
};
```

<div class="mt-3 text-sm text-gray-400"><code>useHostStyles</code> = <code>useHostStyleVariables</code> (variables on <code>:root</code>, plus the theme) + <code>useHostFonts</code> (the host's <code>@font-face</code>). It follows later changes by itself.</div>
</div>

<div>
<div class="dir">hostContext.styles.variables · a few of ~75 standard names</div>

```css
--color-background-primary   --color-text-primary
--color-background-secondary --color-text-secondary
--color-border-primary       --color-text-danger
--font-sans                  --font-mono
--border-radius-md           --border-radius-lg
--shadow-sm                  --font-weight-semibold
```

<div class="mt-3 text-sm ed-card">Every host sends a <b>different subset</b>. The <code>McpUiStyleVariableKey</code> type lists them all.</div>
</div>

</div>

<!--
1:50. The host speaks one vocabulary of CSS variables, standardised by the spec. Some hosts also send font CSS in styles.css.fonts.
-->

---
class: dense
---

# 5.2 · Map tenet-ui tokens to the host's variables

<div class="file"><b>ui/host-bridge.ts</b> · trimmed</div>

```ts {1-7|9-10|11-15}
export const TOKEN_MAP: Record<string, McpUiStyleVariableKey> = {
  '--bgColor-default': '--color-background-primary',
  '--fgColor-default': '--color-text-primary',
  '--borderColor-default': '--color-border-primary',
  '--fontFamily-body': '--font-sans',
  '--borderRadius-medium': '--border-radius-md',          // … 15 in all
};
export function bridgeHostTheme(context: McpUiHostContext | undefined, root = document.documentElement): void {
  root.dataset.colorMode = context?.theme ?? 'light';
  const sent: Partial<Record<McpUiStyleVariableKey, string>> = context?.styles?.variables ?? {};
  for (const [token, hostVar] of Object.entries(TOKEN_MAP)) {
    if (sent[hostVar]) root.style.setProperty(token, `var(${hostVar})`);   // point, don't copy
    else root.style.removeProperty(token);                                // tenet-ui's own value shows through
  }
}
```

<div class="grid grid-cols-3 gap-3 mt-3 text-sm">
  <div class="ed-card"><b>Two vocabularies.</b> Components only know tenet-ui names. This file is the only place that knows both.</div>
  <div class="ed-card"><b>Point, don't copy.</b> <code>var(--color-text-primary)</code> follows the host when it changes theme.</div>
  <div class="ed-card ed-card--accent"><b>Fallbacks.</b> Remove what the host didn't send, or the last host's value sticks.</div>
</div>

<!--
1:53. This is the "your own design system" answer from the abstract. Swap tenet-ui for your company's tokens and this file is the whole adapter. The components never learn which host they're in.
-->

---

# Five security layers around the view

| An attacker wants to | The layer that stops it |
|---|---|
| Deliver harmful HTML | Declared `ui://` templates the host can **review** before any tool runs |
| Escape the sandbox | A **sandboxed iframe**, and on the web a **proxy iframe on a separate origin** (here: `:8081`) |
| Exfiltrate data | **CSP**: no network unless a domain is declared, and the host may still say no |
| Use the camera or mic | **Permissions**, opt-in per resource: `_meta.ui.permissions` |
| Run tools it should not | The **host** gates every `tools/call`, and **visibility** limits what a view can reach |

<div v-click class="mt-4 ed-card ed-card--accent text-sm"><b>Plus your layer: the server.</b> Whatever the view sends, the tool treats as user input. You did that in 4.3.</div>

<!--
1:55. Defence in depth. No single layer is trusted to hold. The masterclass spent 17 minutes here; today it gets one slide and one exercise.
The double iframe: the outer proxy is on a different origin from the host, so even allow-same-origin can't reach the host's DOM, cookies or storage.
-->

---
class: dense
---

# 5.3 · Allow Google Fonts in the view's CSP

<div class="grid grid-cols-2 gap-5">

<div>
<div class="file"><b>ui/mcp-app.html</b> · already there</div>

```html
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?…" />
```

<div class="file mt-3"><b>server/server.ts</b> · the view resource's contents</div>

```ts {5-8}
{
  uri: VIEW_URI,
  mimeType: RESOURCE_MIME_TYPE,
  text: await viewHtml(),
  _meta: { ui: { csp: { resourceDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ] }, prefersBorder: false } }
}
```
</div>

<div>

| `_meta.ui.csp` | CSP directive | For |
|---|---|---|
| `resourceDomains` | img, script, style, font, media | CDNs, fonts, images |
| `connectDomains` | `connect-src` | `fetch`, XHR, WebSocket |
| `frameDomains` | `frame-src` | iframes inside the view |
| `baseUriDomains` | `base-uri` | the document's base URI |

<div class="mt-3 text-sm ed-card">The font needs <b>two</b> origins: the stylesheet from <code>googleapis</code>, the files from <code>gstatic</code>.</div>
<div class="mt-2 text-sm text-gray-400">Also on the resource: <code>permissions</code>, <code>domain</code> (a stable origin), <code>prefersBorder</code> 🔥.</div>
</div>

</div>

<!--
1:57. Fill 5.1 to 5.3, about 8 minutes. For 5.3: first call get_summary and read the violation in the log. Only then fix it.
Declare the least you need: hosts can show these domains to reviewers, and may refuse broad ones. Prefer a tool over connectDomains: a tool call goes through the host, a fetch doesn't.
OFFLINE: if the venue Wi-Fi is down, the font can't load even after the fix. The violation still disappears from the log, and the heading falls back to Georgia. That still proves the point.
-->

---

# Read the traffic: a CSP violation and theme changes

<div class="plog">
  <div class="new"><span class="leg">view →</span><span class="m">workshop/csp-violation</span><span class="why">before 5.3: names <code>fonts.googleapis.com</code></span></div>
  <div><span class="leg">server ←</span><span class="m">resources/read · _meta.ui.csp</span><span class="why">after 5.3: the two origins</span></div>
  <div><span class="leg">→ view</span><span class="m">host-context-changed { styles }</span><span class="why">switch preset: Claude-style ⇄ ChatGPT-style</span></div>
  <div><span class="leg">→ view</span><span class="m">host-context-changed { theme }</span><span class="why">☀️ / 🌙: the dashboard follows all eight</span></div>
</div>

<div class="mt-3 text-sm text-gray-400"><code>workshop/csp-violation</code> isn't MCP. The workshop host's sandbox reports violations so you can see them. Real hosts log them to the devtools console.</div>

<div class="mt-4 grid grid-cols-3 gap-3 text-sm">
  <div class="ed-card">Where would <b>your</b> company's tokens meet the host's?</div>
  <div class="ed-card">Look like the host, or like your brand? Who decides?</div>
  <div class="ed-card">What would this view declare to call your own API?</div>
</div>

<!--
2:05 to 2:08. Answer to the last one: connectDomains with your API's origin. Then ask: why not make it a tool instead? Because then the host sees it, can gate it, and you don't need CORS.
Checkpoint: npm run go 6.1.
-->

---
layout: section
---

<div class="kicker">Section 6 · 2:08 · 8 min · step 6.1</div>

# Deploy the server to a public URL

<div class="sec-build">The same server, from localhost to a public HTTPS URL on Cloudflare Workers' free plan. Follow along or watch. That URL is what section 7 plugs into every host.</div>

<div class="sec-meta"><span>server/worker.ts</span></div>

<!--
2:08. Short and practical. Only people with a free Cloudflare account deploy; everyone else fills 6.1, runs the tests, and watches.
-->

---
class: dense
---

# 6.1 · One createServer, two entry points: Node and Workers

<div class="grid grid-cols-5 gap-5">

<div class="col-span-3">
<div class="file"><b>server/worker.ts</b> · trimmed</div>

```ts {1-3|5-6|8-15}
import { createMcpHandler } from '@modelcontextprotocol/server';
import viewHtml from '../dist/mcp-app.html'; // bundled as text
import { createServer } from './server.ts';

const handler = createMcpHandler(() =>
  createServer({ store, viewHtml: () => viewHtml }));

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname !== '/mcp')
      return new Response('The MCP endpoint is /mcp\n', …404);
    return handler.fetch(request, {}); // plus CORS headers
  }
};
```
</div>

<div class="col-span-2">

<img src="/server-entries.svg" class="diagram" style="max-height: 230px" alt="createServer in server.ts feeds createMcpHandler, Request in and Response out, which both http.ts on Node port 3001 and worker.ts on Cloudflare Workers call with fetch." />

<div class="mt-2 text-sm space-y-2">
  <div class="ed-card"><b>Stateless</b> Streamable HTTP: any instance, anywhere, can answer any request.</div>
  <div class="ed-card ed-card--warn">The in-memory store is <b>per instance</b>. A delete may not stick. Fine for a demo.</div>
</div>
</div>

</div>

<!--
2:10. createServer knows nothing about transports. createMcpHandler makes it fetch-shaped. Node needs http.ts to adapt; Workers already speaks fetch.
-->

---

# Deploy to Cloudflare Workers with wrangler

<div class="cue mt-2">
  <div><code>npx wrangler login</code> · once per machine, free account, no card</div>
  <div><code>npm run deploy</code> · builds the view, then <code>wrangler deploy</code> with your <code>worker.ts</code> (<code>-- --app app</code> for the finished one)</div>
  <div><code>https://expensify-mcp-app.&lt;you&gt;.workers.dev</code> · your server is that URL plus <code>/mcp</code></div>
  <div><code>npm start -- --server YOUR_URL</code> · the same dashboard and the same log, now from <code>*.workers.dev</code></div>
</div>

<div class="grid grid-cols-3 gap-3 mt-4 text-sm">
  <div class="ed-card"><b>Auth.</b> OAuth 2.1 in front of <code>/mcp</code>. The masterclass covers it.</div>
  <div class="ed-card"><b>Data.</b> D1 or KV instead of memory, so every instance agrees.</div>
  <div class="ed-card"><b>Origin.</b> <code>_meta.ui.domain</code> for a stable view origin, when you need one.</div>
</div>

<!--
2:12. LIVE: run npm run deploy on the presenter laptop. If deploy or the network fails, use the pre-deployed URL (have it in a sticky note). Takes about 30 seconds.
Say clearly: this deploy has no login and demo data. Anyone with the URL can delete the 30 seeded expenses. Don't put real data in it. `npx wrangler delete expensify-mcp-app` takes it down.
-->

---
layout: section
---

<div class="kicker">Section 7 · 2:16 · 8 min · optional demo</div>

# Run the same build in Claude, ChatGPT, VS Code and Gemini

<div class="sec-build">One build, no changes, no adapters, in every host that renders MCP Apps. Same prompt every time: "How much did I spend this month?"</div>

<!--
2:16. FIRST THING TO CUT if late: drop to two hosts, or skip to the wrap. Nobody follows along; watch.
BACKUP: the pre-recorded 2-minute supercut, if the venue Wi-Fi or a host is down.
Point out while switching: theme variables differ, display modes differ, container size differs, updateModelContext may not be supported. That's why fallbacks and capability checks matter.
-->

---

# Add the server to Claude as a custom connector <span class="badge">optional</span>

<div class="cue mt-2">
  <div><b>Customize › Connectors › Add custom connector</b></div>
  <div>A name, and <code>YOUR_URL</code>. Authentication: <b>No sign-in</b>, if asked. <b>Add</b>.</div>
  <div>In a chat: <b>+</b> › Connectors › turn on Expensify. Ask: "How much did I spend this month?"</div>
  <div>Claude asks before showing the app: <b>Allow</b>.</div>
</div>

<div class="grid grid-cols-2 gap-3 mt-4 text-sm">
  <div class="ed-card">Works on Free (one custom connector). Team and Enterprise: an Owner adds it under Organization settings.</div>
  <div class="ed-card">Debug: Claude Desktop › Help › Troubleshooting › Enable Developer Mode, then <code>Cmd+Option+I</code>. The view is the inner of two iframes.</div>
</div>

<div class="mt-3 text-sm text-gray-400">Claude Code: <code>claude mcp add --transport http expensify YOUR_URL</code> (tools in the terminal; check whether it renders the view in the dry run).</div>

<!--
2:17. About a minute. Show the dashboard picking up Claude's fonts and colours through the section 5 bridge. Click a bar, click Ask, delete a row, then ask "what's my total now?".
-->

---

# Add the server to ChatGPT as a custom MCP server <span class="badge">optional</span>

<div class="cue mt-2">
  <div><b>chatgpt.com/plugins</b> › <b>+</b> › <b>Add custom MCP server</b></div>
  <div>A name, a description, and under Connection the public endpoint <code>YOUR_URL</code></div>
  <div>No authentication, accept the warning, <b>Create as a plugin</b>, install it</div>
  <div>New chat: type <code>@</code>, pick the plugin, ask the same question</div>
</div>

<div class="grid grid-cols-2 gap-3 mt-4 text-sm">
  <div class="ed-card ed-card--warn">Needs a <b>public HTTPS URL</b>. ChatGPT can't reach <code>localhost</code>. That's why section 6 exists.</div>
  <div class="ed-card">Changed the tools? <b>Refresh</b> the connection and start a new chat. Which plans may add servers depends on the account.</div>
</div>

<!--
2:18. Same build, ChatGPT's look. Point at the font and the corner radius changing with zero code changes.
-->

---

# Add the server to VS Code with .vscode/mcp.json <span class="badge">optional</span>

<div class="grid grid-cols-2 gap-5 mt-2">

<div>
<div class="file"><b>.vscode/mcp.json</b></div>

```json
{
  "servers": {
    "expensify": {
      "type": "http",
      "url": "http://localhost:3001/mcp"
    }
  }
}
```
</div>

<div class="text-sm space-y-3">
  <div class="ed-card">Start it from the file, or <b>MCP: List Servers</b>. Then Copilot Chat, in <b>agent mode</b>.</div>
  <div class="ed-card ed-card--accent">VS Code can use <code>localhost</code> while <code>npm start</code> runs. No deploy needed. Or use <code>YOUR_URL</code>.</div>
  <div class="ed-card ed-card--warn">MCP Apps rendering in VS Code is still marked experimental. Check the version in the dry run.</div>
</div>

</div>

<!--
2:20. The only host in the list that can hit localhost directly. Good for the people who didn't deploy: they can try this one tonight.
-->

---

# Gemini: where to add the server, and whether it renders <span class="badge">optional</span> <span class="badge">to confirm</span>

<div class="grid grid-cols-2 gap-5 mt-2 text-sm">

<div class="space-y-3">
  <div class="ed-card"><b>Gemini app</b>: custom MCP servers by remote URL, under connected apps in settings. Remote only, so use <code>YOUR_URL</code>.</div>
  <div class="ed-card"><b>Gemini Enterprise</b>: custom MCP server connectors, Streamable HTTP only. An admin enables them.</div>
  <div class="ed-card"><b>Gemini CLI</b>: add the server to <code>~/.gemini/settings.json</code> under <code>mcpServers</code>, with <code>httpUrl</code>.</div>
</div>

<div class="space-y-3">
  <div class="ed-card ed-card--warn"><b>MCP Apps rendering is the open question.</b> Gemini isn't on the official MCP Apps client list yet. Where it doesn't render, you get the <b>text</b> half.</div>
  <div class="ed-card ed-card--accent">And that's the point of <code>content</code>: a host without UI still gets a correct, useful answer. Nothing breaks.</div>
</div>

</div>

<!--
2:22. DRY RUN: confirm a week before which Gemini surface renders views, if any, and where the setting lives today. If none render, demo the text fallback here: it's a good lesson in graceful degradation.
Others if time allows: Goose, Cursor, Postman, MCPJam (all on the official MCP Apps client list as of Oct 2026).
-->

---

# Six rules for good MCP Apps

<div class="grid grid-cols-2 gap-3 mt-4 text-sm">
  <div v-click class="ed-card"><div class="kicker">Text still matters</div><div class="mt-1 text-gray-400">Always return useful <code>content</code>. The model reads it, and so does every host without UI.</div></div>
  <div v-click class="ed-card"><div class="kicker">Tell the model the user can see it</div><div class="mt-1 text-gray-400">Say so in the description, or it narrates the chart.</div></div>
  <div v-click class="ed-card"><div class="kicker">Don't race the model</div><div class="mt-1 text-gray-400">Render the result you were given. Fetch only on a click.</div></div>
  <div v-click class="ed-card"><div class="kicker">Keep the model in sync</div><div class="mt-1 text-gray-400">After a user edit, <code>updateModelContext</code>, with the whole picture.</div></div>
  <div v-click class="ed-card"><div class="kicker">Belong to the host</div><div class="mt-1 text-gray-400">Host variables, with your design system as the fallback.</div></div>
  <div v-click class="ed-card"><div class="kicker">Never trust the view</div><div class="mt-1 text-gray-400">Checks live in the tool handler. Declare the least CSP you need.</div></div>
</div>

<!--
2:24. The wrap always happens, even if section 7 is cut. Six rules, each one is something they wrote today. Click through at a steady pace.
-->

---
class: dense
---

# Cheat sheet: server helpers, view API, messages

<div class="grid grid-cols-3 gap-4 text-xs">

<div>

| Server · `ext-apps/server` |
|---|
| `registerAppResource(server, name, uri, config, read)` |
| `registerAppTool(server, name, config, handler)` |
| `RESOURCE_MIME_TYPE` · `getUiCapability(caps)` |
| `_meta.ui.resourceUri` · `_meta.ui.visibility` |
| `_meta.ui.csp` · `permissions` · `domain` · `prefersBorder` |

</div>

<div>

| View · `ext-apps/react` and `App` |
|---|
| `useApp({ appInfo, capabilities, onAppCreated })` |
| `useHostStyles(app, hostContext)` |
| `addEventListener('toolinput' \| 'toolresult' \| …)` |
| `getHostContext()` · `getHostCapabilities()` |
| `callServerTool` · `sendMessage` · `updateModelContext` |
| `requestDisplayMode` · `openLink` · `sendLog` |

</div>

<div>

| Messages, view ⇄ host |
|---|
| `ui/initialize` · `ui/notifications/initialized` |
| `ui/notifications/tool-input` · `tool-result` |
| `ui/notifications/host-context-changed` |
| `tools/call` · `ui/message` |
| `ui/update-model-context` · `ui/request-display-mode` |
| `ui/resource-teardown` |

</div>

</div>

<div class="mt-4 text-sm text-gray-400">MIME type <code>text/html;profile=mcp-app</code> · extension <code>io.modelcontextprotocol/ui</code> · MCP Apps spec 2026-01-26 · MCP protocol 2026-07-28</div>

<!--
2:27. Leave this up during Q&A. Tell them to photograph it.
-->

---

# Docs, examples and agent skills to keep going

<div class="grid grid-cols-2 gap-4 mt-4 text-sm">
  <div class="ed-card"><div class="kicker">Docs and API</div><div class="mt-1 text-gray-400">apps.extensions.modelcontextprotocol.io</div></div>
  <div class="ed-card"><div class="kicker">Spec and examples</div><div class="mt-1 text-gray-400">github.com/modelcontextprotocol/ext-apps · <code>basic-host</code>, and starters for React, Vue, Svelte, Preact, Solid, vanilla</div></div>
  <div class="ed-card"><div class="kicker">Agent skills</div><div class="mt-1 text-gray-400"><code>create-mcp-app</code>, <code>add-app-to-server</code>, <code>convert-web-app</code>, <code>migrate-oai-app</code></div></div>
  <div class="ed-card"><div class="kicker">This repo</div><div class="mt-1 text-gray-400">Every step, its solution, the workshop host, and DEPLOY.md. Run <code>npm run go 2.1</code> again at home.</div></div>
</div>

<!--
2:28. Then Q&A. If more than 6 minutes are left after Q&A, go to the A2UI stretch slides after the thank-you.
-->

---
layout: center
class: text-center
---

# Thank you

<div class="text-xl text-gray-400 mt-4">Questions?</div>

<div class="page-foot"><span>Apurv Khare</span><span class="accent">React India · MCP Apps with React</span></div>

<!--
2:29. Q&A. Everything after this slide is the A2UI stretch: only if time is left. Skipping it costs nothing.
-->

---
layout: section
---

<div class="kicker">Stretch goal · 4 to 8 min · only if time is left</div>

# A2UI: UI as data instead of HTML

<div class="sec-build">MCP Apps ships your HTML in a sandbox. A2UI ships a description of a UI, and the host draws it with its own components. Who owns the look? Who owns the logic?</div>

<!--
STRETCH. Only if the earlier sections came in early. 4 to 8 minutes.
Sources (checked Oct 2026):
- a2ui.org: v0.9.1 is the current production release, v1.0 is a candidate. Apache 2.0, created by Google with CopilotKit and the community.
- Google Developers Blog, "A2UI v0.9", 17 Apr 2026: official React renderer, Basic catalog (renamed from Standard), transports including MCP, A2A, AG-UI, WebSockets, REST.
- a2ui.org/specification/v0.9-a2ui: message types createSurface, updateComponents, updateDataModel, deleteSurface; client sends action.
- a2ui.org/guides/a2ui-in-mcp-apps: an MCP App can render A2UI payloads (application/a2ui+json) inside its own sandboxed iframe.
-->

---
class: dense tight
---

# An A2UI v0.9 stream for an Expensify card <span class="badge">stretch</span>

<div class="grid grid-cols-5 gap-5">

<div class="col-span-3">
<div class="dir"><b>agent → client</b> · A2UI v0.9 shape from a2ui.org, written for this slide</div>

```json
{"version": "v0.9", "createSurface": {
  "surfaceId": "summary",
  "catalogId": "https://a2ui.org/…/v0_9/catalogs/basic/catalog.json"
}}

{"version": "v0.9", "updateComponents": {
  "surfaceId": "summary",
  "components": [
    {"id": "root", "component": "Column",
     "children": ["total", "ask"]},
    {"id": "total", "component": "Text",
     "text": {"path": "/summary/total"}},
    {"id": "ask", "component": "Button", "child": "ask_label",
     "action": {"event": {"name": "ask_about",
                          "context": {"key": "food"}}}},
    {"id": "ask_label", "component": "Text", "text": "Ask about food"}
  ]
}}

{"version": "v0.9", "updateDataModel": {
  "surfaceId": "summary", "path": "/summary/total", "value": "₹21,776"
}}
```
</div>

<div class="col-span-2 text-sm space-y-3">
  <div class="ed-card"><b>No code crosses the wire.</b> Only components from a <b>catalog</b> the client already trusts.</div>
  <div class="ed-card">A flat list of components, data bound by JSON Pointer, streamed so it renders as the model writes.</div>
  <div class="ed-card">A click sends an <code>action</code> back to the agent, which answers with more messages.</div>
</div>

</div>


<!--
Walk the three messages: create a surface with a catalog, describe the components, fill the data model. The client (Angular, Flutter, Lit, React renderers exist) draws Column, Text, Button with its own widgets.
v0.9.1 is current; v1.0 is a candidate that adds client-to-server RPC and action ids. Don't promise v1.0 features.
-->

---
class: dense
---

# MCP Apps and A2UI compared <span class="badge">stretch</span>

| | MCP Apps | A2UI |
|---|---|---|
| What ships | your **HTML, CSS, JS** as a `ui://` resource | **JSON** describing components |
| Who renders | your code, in a sandboxed iframe | the host's own components, from a catalog |
| Look | yours, themed by host variables | the host's, by construction |
| Logic | anything React can do: charts, editors, maps | what the catalog allows, plus client functions |
| Security | sandbox, separate origin, CSP, host gating | no code executes; only trusted components |
| Who writes it | a developer, ahead of time | often the model, at run time |
| Protocol | MCP extension `io.modelcontextprotocol/ui` | its own spec, over A2A, MCP, AG-UI and more |
| Status | spec 2026-01-26 on MCP 2026-07-28, ext-apps 2.0.3 | v0.9.1 current, v1.0 candidate |

<!--
The one-line version: MCP Apps trusts the sandbox, A2UI trusts the catalog.
-->

---

# When to use MCP Apps and when to use A2UI <span class="badge">stretch</span>

<div class="grid grid-cols-2 gap-6 mt-4 text-sm">

<div class="ed-card ed-card--accent">
  <div class="kicker">MCP Apps</div>
  <div class="mt-2">You have a real UI: a chart you click, a table you edit, a map, a PDF viewer. You want your brand and your component library. A developer builds it once.</div>
</div>

<div class="ed-card ed-card--good">
  <div class="kicker">A2UI</div>
  <div class="mt-2">The agent composes small, one-off UI on the fly: a form, a confirmation, a card. You want it to look exactly native, on web and mobile, with no code to review.</div>
</div>

</div>

<div v-click class="mt-6 ed-card ed-card--accent text-sm"><b>They compose.</b> The A2UI docs show an MCP App that renders A2UI payloads inside its own sandbox, and A2UI running over MCP. Not a fork in the road: two layers.</div>

<!--
Close the stretch here and go back to Q&A. Source for "they compose": a2ui.org/guides/a2ui-in-mcp-apps.
-->
