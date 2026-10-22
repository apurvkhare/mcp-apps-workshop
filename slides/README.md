# Workshop slides

Slidev deck for "MCP Apps with React", React India. Theme: seriph with the Editorial Ink `style.css`
from the MCP Apps masterclass, plus a "WORKSHOP ADDITIONS" block at the bottom.

```bash
npm install
npm run dev        # http://localhost:3030, `o` for overview, `p` for presenter notes
npm run build      # static site in dist/
npm run export     # PDF; needs playwright-chromium (npm i -D playwright-chromium) the first time
npm run diagrams   # re-render diagrams/*.d2 to public/*.svg (needs d2)
npm run wire       # re-capture the section 1 JSON-RPC traffic from the finished server
```

- Works offline: fonts come from `@fontsource` (styles/index.ts), Mermaid is bundled, no remote images.
- Section 1 quotes real traffic from `scripts/capture-wire.ts`: SDK 2.3.1 client, finished `app/server`,
  in process. The seed data is relative to today, so totals change from day to day.
- Timings and the run of show come from `../plan/workshop-plan.html`. Speaker notes carry the clock.
