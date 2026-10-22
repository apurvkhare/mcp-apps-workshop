/**
 * Workshop addition: the guide pane. The playground's step README, next to the host, so the
 * instructions and the live view are on one screen.
 *
 * Data comes from the host server (serve.ts): GET /api/guide, then again each time the
 * /api/guide/events stream says "changed", which happens when `npm run go` loads another step.
 * Nothing here runs commands. Picking another step only shows the command to type.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { renderMarkdown } from "./markdown";
import styles from "./index.module.css";

interface StepInfo {
  id: string;
  title: string;
  section: number;
  sectionTitle: string;
}

type GuideData =
  | { mode: "step"; steps: StepInfo[]; step: StepInfo & { kind: "problem" | "solution" }; readme: string | null; sectionReadme: string | null }
  | { mode: "empty"; steps: StepInfo[] }
  | { mode: "app"; steps: StepInfo[]; readme: string };

/** The guide's data, refetched whenever the server says the playground changed. */
function useGuideData() {
  const [data, setData] = useState<GuideData | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let latest = 0;
    const load = async () => {
      const call = ++latest;
      try {
        const res = await fetch("/api/guide", { cache: "no-store" });
        const next = (await res.json()) as GuideData;
        if (call === latest) {
          setData(next);
          setOffline(false);
        }
      } catch {
        if (call === latest) setOffline(true);
      }
    };
    load();
    // EventSource reconnects by itself, so a restarted host server picks up again: onopen refetches.
    const events = new EventSource("/api/guide/events");
    events.onmessage = load;
    events.onopen = load;
    events.onerror = () => setOffline(true);
    return () => events.close();
  }, []);

  return { data, offline };
}

/** Copies text, with a fallback for browsers that refuse the Clipboard API. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

function useFlash(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const flash = useCallback(() => {
    setOn(true);
    setTimeout(() => setOn(false), 1200);
  }, []);
  return [on, flash];
}

/** A command to type in the terminal, with a button that copies it. */
function Command({ text }: { text: string }) {
  const [copied, flash] = useFlash();
  return (
    <span className={styles.command}>
      <code>{text}</code>
      <button type="button" onClick={() => copyText(text).then(flash)} title={`Copy "${text}"`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

const compareIds = (a: string, b: string) => {
  const [a1, a2] = a.split(".").map(Number) as [number, number];
  const [b1, b2] = b.split(".").map(Number) as [number, number];
  return a1 - b1 || a2 - b2;
};

/** Every step, grouped by section. The current one is highlighted; clicking another one shows how to load it. */
function Progress({ steps, current, picked, onPick }: { steps: StepInfo[]; current?: string; picked: string | null; onPick: (id: string | null) => void }) {
  const sections = useMemo(() => {
    const bySection = new Map<number, StepInfo[]>();
    for (const s of steps) bySection.set(s.section, [...(bySection.get(s.section) ?? []), s]);
    return [...bySection.values()];
  }, [steps]);

  return (
    <nav className={styles.progress} aria-label="Workshop steps">
      {sections.map((group) => (
        <ol key={group[0]!.section} title={`Section ${group[0]!.section}: ${group[0]!.sectionTitle}`}>
          {group.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                aria-current={s.id === current ? "step" : undefined}
                aria-pressed={s.id === picked}
                data-done={current && compareIds(s.id, current) < 0 ? "" : undefined}
                title={`${s.id} ${s.title}`}
                onClick={() => onPick(s.id === current || s.id === picked ? null : s.id)}
              >
                {s.id}
              </button>
            </li>
          ))}
        </ol>
      ))}
    </nav>
  );
}

export function Guide() {
  const { data, offline } = useGuideData();
  const [picked, setPicked] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const current = data?.mode === "step" ? data.step : undefined;
  const stepKey = data ? `${data.mode}:${current?.id ?? ""}:${current?.kind ?? ""}` : "";
  const readme = data && data.mode !== "empty" ? data.readme : null;
  const html = useMemo(() => (readme ? renderMarkdown(readme) : ""), [readme]);
  const sectionHtml = useMemo(
    () => (data?.mode === "step" && data.sectionReadme ? renderMarkdown(data.sectionReadme) : ""),
    [data],
  );

  // A new step starts at the top. The same step re-rendering (an edited README) keeps its scroll position,
  // because the scrolling element stays mounted.
  useLayoutEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setPicked(null);
  }, [stepKey]);

  // Copy buttons in the rendered README: one listener for all of them.
  const onBodyClick = (e: MouseEvent<HTMLDivElement>) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-copy]");
    const code = button?.parentElement?.querySelector("code");
    if (!button || !code) return;
    copyText(code.textContent ?? "").then(() => {
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = "Copy"), 1200);
    });
  };

  const pickedStep = data?.steps.find((s) => s.id === picked);

  return (
    <section className={styles.guide} aria-label="Guide">
      <header className={styles.guideHead}>
        {current ? (
          <>
            <div className={styles.guideTitle}>
              <span className={styles.stepId}>{current.id}</span>
              <h2>{current.title}</h2>
              <span className={styles.kind} data-kind={current.kind}>{current.kind === "problem" ? "Problem" : "Solution"}</span>
            </div>
            <p className={styles.guideSection}>Section {current.section} · {current.sectionTitle}</p>
          </>
        ) : (
          <div className={styles.guideTitle}>
            <h2>{data?.mode === "app" ? "The finished app" : "Guide"}</h2>
          </div>
        )}
        {data && <Progress steps={data.steps} current={current?.id} picked={picked} onPick={setPicked} />}
        {pickedStep && (
          <div className={styles.pickedStep}>
            <span>
              <b>{pickedStep.id}</b> {pickedStep.title}. To load it, run:
            </span>
            <Command text={`npm run go ${pickedStep.id}`} />
          </div>
        )}
        {current && (
          <div className={styles.commands}>
            <Command text="npm test" />
            <Command text="npm run status" />
          </div>
        )}
      </header>

      <div className={styles.guideBody} ref={bodyRef}>
        {offline && <p className={styles.guideNotice}>The host server isn't answering. Is <code>npm start</code> still running?</p>}
        {!data && !offline && <p className={styles.hint}>Loading the guide …</p>}
        {data?.mode === "empty" && (
          <div className={styles.guideNotice}>
            <p>No step is loaded in <code>playground/</code> yet. In a terminal, run:</p>
            <Command text="npm run go 2.1" />
            <p>This pane follows along: it shows each step's instructions as you load it.</p>
          </div>
        )}
        {data?.mode === "step" && !readme && (
          <div className={styles.guideNotice}>
            <p><code>playground/README.md</code> is missing. Load the step again (your files are backed up first):</p>
            <Command text={`npm run go ${data.step.id}${data.step.kind === "solution" ? " -- --solution" : ""}`} />
          </div>
        )}
        {sectionHtml && (
          <details className={styles.sectionIntro}>
            <summary>About section {current?.section}</summary>
            <div className={styles.markdown} onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: sectionHtml }} />
          </details>
        )}
        {html && <article className={styles.markdown} onClick={onBodyClick} dangerouslySetInnerHTML={{ __html: html }} />}
      </div>
    </section>
  );
}
