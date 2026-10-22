/**
 * The workshop's steps, in order. Every script reads this list, so a step id like "3.3" means the same
 * thing everywhere: section 03, step 03, folders exercises/03.sdk/03.problem.tool-result and 03.solution.tool-result.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface Section {
  n: number;
  slug: string;
  title: string;
  steps: { slug: string; title: string }[];
}

export const SECTIONS: Section[] = [
  {
    n: 2,
    slug: 'setup-for-ui',
    title: 'Setting up for UI',
    steps: [
      { slug: 'app-resource', title: 'Serve the view as a ui:// resource' },
      { slug: 'app-tool', title: 'Link get_summary to the view' }
    ]
  },
  {
    n: 3,
    slug: 'sdk',
    title: 'Understand the SDK, then fill the gaps',
    steps: [
      { slug: 'connect', title: 'Connect to the host with useApp' },
      { slug: 'tool-input', title: 'Read the tool input' },
      { slug: 'tool-result', title: 'Render the tool result' },
      { slug: 'host-context', title: 'Follow the host context' }
    ]
  },
  {
    n: 4,
    slug: 'interactive',
    title: 'Make it interactive',
    steps: [
      { slug: 'call-server-tool', title: 'Call server tools from the view' },
      { slug: 'send-message', title: 'Send a message to the chat' },
      { slug: 'app-only-tool', title: 'Delete with an app-only tool' },
      { slug: 'model-context', title: 'Tell the model what changed' }
    ]
  },
  {
    n: 5,
    slug: 'native',
    title: 'Make it look native',
    steps: [
      { slug: 'host-styles', title: "Apply the host's styles" },
      { slug: 'design-tokens', title: 'Map the design system to the host' },
      { slug: 'csp', title: 'Load a web font through the CSP' }
    ]
  },
  {
    n: 6,
    slug: 'deploy',
    title: 'Deploy it',
    steps: [{ slug: 'worker', title: 'Run the same server on Cloudflare Workers' }]
  }
];

export type Kind = 'problem' | 'solution';

export interface Step {
  /** "3.3" */
  id: string;
  section: Section;
  index: number;
  slug: string;
  title: string;
  /** exercises/03.sdk */
  sectionDir: string;
  dir: (kind: Kind) => string;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const ROOT = resolve(import.meta.dirname, '..');
export const PLAYGROUND = resolve(ROOT, 'playground');
/** Which step the playground holds, written by `npm run go`. */
export const STATE_FILE = resolve(PLAYGROUND, '.step.json');

export const STEPS: Step[] = SECTIONS.flatMap((section) =>
  section.steps.map((s, i) => {
    const sectionDir = resolve(ROOT, 'exercises', `${pad(section.n)}.${section.slug}`);
    return {
      id: `${section.n}.${i + 1}`,
      section,
      index: i + 1,
      slug: s.slug,
      title: s.title,
      sectionDir,
      dir: (kind: Kind) => resolve(sectionDir, `${pad(i + 1)}.${kind}.${s.slug}`)
    };
  })
);

/** Accepts "3.3", "03.03", "3.3.tool-result". Returns undefined for anything else. */
export function findStep(input: string | undefined): Step | undefined {
  const m = /^0?(\d+)\.0?(\d+)/.exec(input ?? '');
  return m ? STEPS.find((s) => s.id === `${Number(m[1])}.${Number(m[2])}`) : undefined;
}

export const compareIds = (a: string, b: string) => {
  const [a1, a2] = a.split('.').map(Number) as [number, number];
  const [b1, b2] = b.split('.').map(Number) as [number, number];
  return a1 - b1 || a2 - b2;
};

export interface PlaygroundState {
  step: string;
  kind: Kind;
  loadedAt: string;
}

export async function readState(): Promise<PlaygroundState | undefined> {
  if (!existsSync(STATE_FILE)) return undefined;
  const { readFile } = await import('node:fs/promises');
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8')) as PlaygroundState;
  } catch {
    return undefined;
  }
}

/** Shared by every script: --json switches output to one JSON object on stdout. */
export const wantsJson = () => process.argv.includes('--json');
export const positional = () => process.argv.slice(2).filter((a) => !a.startsWith('--'));
