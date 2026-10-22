/**
 * Helpers shared by the step scripts: copying step folders, finding markers, running tests.
 * Every script prints plain text, or one JSON object with --json, and never prompts.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { PLAYGROUND, ROOT, STATE_FILE, STEPS, compareIds, type Kind, type PlaygroundState, type Step } from './steps.ts';

/** Never copied between step folders and the playground. */
const SKIP = new Set(['dist', 'node_modules', '.step.json']);

export async function copyStep(from: string, to: string) {
  await cp(from, to, { recursive: true, filter: (src) => !SKIP.has(basename(src)) });
}

/** Copies the playground aside before anything replaces it. Returns the backup's path, or undefined if empty. */
export async function backupPlayground(label: string): Promise<string | undefined> {
  if (!existsSync(PLAYGROUND) || (await readdir(PLAYGROUND)).length === 0) return undefined;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = resolve(ROOT, '.playground-backups', `${stamp}-${label}`);
  await mkdir(dest, { recursive: true });
  await copyStep(PLAYGROUND, dest);
  return dest;
}

/** Replaces the playground with a step folder and records which one it is. */
export async function loadIntoPlayground(step: Step, kind: Kind) {
  await rm(PLAYGROUND, { recursive: true, force: true });
  await copyStep(step.dir(kind), PLAYGROUND);
  const state: PlaygroundState = { step: step.id, kind, loadedAt: new Date().toISOString() };
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// ------------------------------------------------------------------ markers

export const MARKERS = {
  '🔨': 'build',
  '💡': 'hint',
  '🧠': 'why',
  '📡': 'traffic',
  '📖': 'docs',
  '🧪': 'test',
  '🔥': 'bonus',
  '✅': 'done'
} as const;
export type Marker = keyof typeof MARKERS;

export interface MarkerHit {
  marker: Marker;
  file: string;
  line: number;
  text: string;
}

const CODE = /\.(ts|tsx|html|css)$/;

export async function walk(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.filter((e) => !SKIP.has(e.name)).map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
  );
  return nested.flat();
}

/** Markers in a folder's code (not its README or tests). Paths are relative to the repo root. */
export async function findMarkers(dir: string, only?: Marker[]): Promise<MarkerHit[]> {
  const hits: MarkerHit[] = [];
  for (const file of await walk(dir)) {
    const rel = relative(dir, file);
    if (!CODE.test(file) || rel.startsWith('tests')) continue;
    const lines = (await readFile(file, 'utf8')).split('\n');
    lines.forEach((text, i) => {
      for (const marker of Object.keys(MARKERS) as Marker[]) {
        if ((!only || only.includes(marker)) && text.includes(marker)) {
          hits.push({ marker, file: relative(ROOT, file), line: i + 1, text: text.trim().replace(/^(\/\/|\{\/\*|<!--)\s*/, '') });
        }
      }
    });
  }
  return hits;
}

// -------------------------------------------------------------------- tests

export interface TestFile {
  /** The step a test file belongs to: tests/3.3.test.ts is "3.3". */
  step: string;
  /** Folder the tests/ directory sits in, relative to the repo root. */
  folder: string;
  file: string;
  passed: boolean;
  failures: { name: string; message: string }[];
}

interface VitestJson {
  testResults: {
    name: string;
    status: string;
    message?: string;
    assertionResults: { fullName: string; status: string; failureMessages: string[] }[];
  }[];
}

/** Runs vitest on the given folders (each with a tests/ inside) and returns one entry per test file. */
export async function runTests(folders: string[]): Promise<TestFile[]> {
  const dirs = folders.map((f) => join(f, 'tests')).filter((d) => existsSync(d));
  if (!dirs.length) return [];
  const out = join(await mkdtemp(join(tmpdir(), 'workshop-tests-')), 'results.json');
  spawnSync('npx', ['vitest', 'run', ...dirs.map((d) => relative(ROOT, d)), '--reporter=json', `--outputFile=${out}`], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: process.platform === 'win32'
  });
  if (!existsSync(out)) throw new Error('vitest did not run. Try: npx vitest run playground/tests');
  const json = JSON.parse(await readFile(out, 'utf8')) as VitestJson;
  return json.testResults
    .map((r) => {
      const testsDir = resolve(r.name, '..');
      const failures = r.assertionResults
        .filter((a) => a.status === 'failed')
        .map((a) => ({ name: a.fullName, message: firstLine(a.failureMessages[0] ?? '') }));
      // A file that fails to load (a syntax error, a missing export) has no assertions, only a message.
      if (r.status !== 'passed' && !failures.length) failures.push({ name: basename(r.name), message: firstLine(r.message ?? 'failed to load') });
      return {
        step: basename(r.name).replace(/\.test\.tsx?$/, ''),
        folder: relative(ROOT, resolve(testsDir, '..')),
        file: relative(ROOT, r.name),
        passed: r.status === 'passed',
        failures
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder) || compareIds(a.step, b.step));
}

const firstLine = (s: string) =>
  s
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split('\n')
    .map((l) => l.trim())
    .find(Boolean) ?? '';

// -------------------------------------------------------------------- output

export function print(json: boolean, data: unknown, text: () => string) {
  console.log(json ? JSON.stringify(data, null, 2) : text());
}

export function fail(json: boolean, message: string, extra: Record<string, unknown> = {}): never {
  if (json) console.log(JSON.stringify({ ok: false, error: message, ...extra }, null, 2));
  else console.error(message);
  process.exit(1);
}

export const stepList = () => STEPS.map((s) => `  ${s.id.padEnd(4)} ${s.title}`).join('\n');
export const nextStep = (id: string) => STEPS[STEPS.findIndex((s) => s.id === id) + 1];
