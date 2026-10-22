/**
 * For workshop authors, not attendees: npm run cut
 *
 * Cuts every exercise folder, and the finished app/, from one annotated copy of the app in
 * scripts/authoring/source/. Change the source, run this, and every step stays consistent.
 * Step READMEs are written by hand and never touched. `npm run cut -- --check` only compares.
 *
 * Directives (whole lines, removed from the output):
 *
 *   //#file 6.1            first line: the file only exists from step 6.1 on
 *   //#step 3.3 [given]    code added in step 3.3 (the solution)
 *   //#gap                 what the 3.3 problem shows instead (🔨 markers, a stub). Defaults to #before.
 *   //#before              what steps before 3.3 show. Defaults to nothing.
 *   //#end
 *
 * "given" means the problem already has the solution code: wiring the attendee reads but doesn't write.
 * Blocks nest. Inside a step's code, a `#done text` comment becomes `✅ 3.3 text` in later steps.
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { ROOT, STEPS, compareIds, type Kind } from '../steps.ts';

const SOURCE = resolve(import.meta.dirname, 'source');
/** Generated into each folder. README.md and anything else in the folder is left alone. */
const OUTPUT_DIRS = ['server', 'ui', 'tests'];
const FINAL = '99.99';

type Node = string | Block;
interface Block {
  step: string;
  given: boolean;
  sol: Node[];
  gap?: Node[];
  before?: Node[];
  line: number;
}

function parse(lines: string[], file: string): Node[] {
  const root: Node[] = [];
  const stack: { block: Block; into: Node[] }[] = [];
  const target = () => stack.at(-1)?.into ?? root;
  lines.forEach((line, i) => {
    const d = /^\s*\/\/#(step|gap|before|end)\b\s*(.*)$/.exec(line);
    if (!d) return void target().push(line);
    const [, kind, rest] = d as unknown as [string, string, string];
    const top = stack.at(-1);
    if (kind === 'step') {
      const [step, flag] = rest.split(/\s+/);
      if (!step || !/^\d+\.\d+$/.test(step)) throw new Error(`${file}:${i + 1}: bad step "${rest}"`);
      const block: Block = { step, given: flag === 'given', sol: [], line: i + 1 };
      target().push(block);
      stack.push({ block, into: block.sol });
    } else if (!top) {
      throw new Error(`${file}:${i + 1}: //#${kind} outside a block`);
    } else if (kind === 'gap') {
      top.into = top.block.gap = [];
    } else if (kind === 'before') {
      top.into = top.block.before = [];
    } else {
      stack.pop();
    }
  });
  if (stack.length) throw new Error(`${file}:${stack.at(-1)!.block.line}: //#step without //#end`);
  return root;
}

const DONE = /^(\s*)(\/\/|\{\/\*|<!--)\s*#done\s+(.*?)\s*(\*\/\}|-->)?$/;

function render(nodes: Node[], at: string, kind: Kind, out: string[] = [], doneStep?: string): string[] {
  for (const node of nodes) {
    if (typeof node === 'string') {
      const done = DONE.exec(node);
      if (!done) out.push(node);
      else if (doneStep) out.push(`${done[1]}${done[2]} ✅ ${doneStep} ${done[3]}${done[4] ? ` ${done[4]}` : ''}`);
      continue;
    }
    const cmp = compareIds(at, node.step);
    if (cmp > 0 || (cmp === 0 && (kind === 'solution' || node.given))) {
      // Mark finished work, but not in the problem that is about to ask for it.
      render(node.sol, at, kind, out, cmp === 0 && kind === 'problem' ? undefined : node.step);
    } else if (cmp === 0) {
      render(node.gap ?? node.before ?? [], at, kind, out, doneStep);
    } else {
      render(node.before ?? [], at, kind, out, doneStep);
    }
  }
  return out;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return files.flat();
}

interface SourceFile {
  rel: string;
  from?: string;
  nodes: Node[];
  /** tests/3.3.test.ts belongs to step 3.3 */
  testStep?: string;
}

async function loadSource(): Promise<SourceFile[]> {
  const files: SourceFile[] = [];
  for (const path of await walk(SOURCE)) {
    const rel = relative(SOURCE, path);
    const lines = (await readFile(path, 'utf8')).split('\n');
    const gate = /^\s*\/\/#file\s+(\d+\.\d+)\s*$/.exec(lines[0] ?? '');
    if (gate) lines.shift();
    const testStep = /^tests\/(\d+\.\d+)\.test\.tsx?$/.exec(rel)?.[1];
    files.push({ rel, from: gate?.[1] ?? testStep, testStep, nodes: parse(lines, rel) });
  }
  return files;
}

/** With --check, nothing is written: the script lists what differs and exits 1. */
const CHECK = process.argv.includes('--check');
const stale: string[] = [];

async function cut(files: SourceFile[], at: string, kind: Kind, dest: string) {
  const expected = new Map<string, string>();
  for (const file of files) {
    if (file.from && compareIds(at, file.from) < 0) continue;
    expected.set(join(dest, file.rel), render(file.nodes, at, kind).join('\n'));
  }
  if (CHECK) {
    const existing = (await Promise.all(OUTPUT_DIRS.map((d) => (existsSync(join(dest, d)) ? walk(join(dest, d)) : [])))).flat();
    for (const path of new Set([...existing, ...expected.keys()])) {
      const want = expected.get(path);
      const have = existsSync(path) ? await readFile(path, 'utf8') : undefined;
      if (want !== have) stale.push(relative(ROOT, path));
    }
    return;
  }
  for (const d of OUTPUT_DIRS) await rm(join(dest, d), { recursive: true, force: true });
  for (const [path, text] of expected) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text);
  }
}

const files = await loadSource();
for (const step of STEPS) {
  for (const kind of ['problem', 'solution'] as const) {
    const dest = step.dir(kind);
    if (!CHECK) await mkdir(dest, { recursive: true });
    await cut(files, step.id, kind, dest);
  }
}
await cut(files, FINAL, 'solution', resolve(ROOT, 'app'));

if (CHECK) {
  console.log(stale.length ? `${stale.length} file(s) differ from the source: ${stale.slice(0, 5).join(', ')}${stale.length > 5 ? ', …' : ''}.` : 'Up to date.');
  process.exit(stale.length ? 1 : 0);
}

const missing = STEPS.flatMap((s) => (['problem', 'solution'] as const).map((k) => s.dir(k))).filter((d) => !existsSync(join(d, 'README.md')));
console.log(`Cut ${STEPS.length} steps (${STEPS.length * 2} folders) and app/ from ${relative(ROOT, SOURCE)}.`);
if (missing.length) console.log(`No README.md yet in:\n${missing.map((d) => `  ${relative(ROOT, d)}`).join('\n')}`);
