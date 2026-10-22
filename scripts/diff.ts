/**
 * npm run diff [--step 3.3] [--json]
 *
 * Your playground against the current step's solution, as a unified diff ("-" is yours, "+" is the solution).
 * READMEs, tests and build output are left out: only the code you are writing.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fail, print, walk } from './lib.ts';
import { PLAYGROUND, ROOT, findStep, readState, wantsJson } from './steps.ts';

const json = wantsJson();
const flag = process.argv.indexOf('--step');
const state = await readState();
const step = findStep(flag > 0 ? process.argv[flag + 1] : state?.step) ?? fail(json, 'No step loaded. Run: npm run go 2.1');
const solution = step.dir('solution');

const codeFiles = async (dir: string) =>
  (await walk(dir)).map((f) => relative(dir, f)).filter((f) => !f.startsWith('tests') && !f.endsWith('.md') && !f.startsWith('.'));

const files = [...new Set([...(await codeFiles(PLAYGROUND)), ...(await codeFiles(solution))])].sort();
const changes: { file: string; status: 'changed' | 'only-yours' | 'only-solution'; patch: string }[] = [];

for (const file of files) {
  const yours = join(PLAYGROUND, file);
  const theirs = join(solution, file);
  if (existsSync(yours) && existsSync(theirs) && (await readFile(yours, 'utf8')) === (await readFile(theirs, 'utf8'))) continue;
  changes.push({
    file,
    status: !existsSync(yours) ? 'only-solution' : !existsSync(theirs) ? 'only-yours' : 'changed',
    patch: unified(existsSync(yours) ? yours : null, existsSync(theirs) ? theirs : null)
  });
}

function unified(a: string | null, b: string | null): string {
  const args = ['diff', '--no-index', '--no-color', '--', a ? relative(ROOT, a) : '/dev/null', b ? relative(ROOT, b) : '/dev/null'];
  const git = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (git.status !== null && git.status <= 1 && !git.error) return git.stdout;
  // No git: plain diff does the same job.
  return spawnSync('diff', ['-u', a ?? '/dev/null', b ?? '/dev/null'], { cwd: ROOT, encoding: 'utf8' }).stdout ?? '';
}

print(json, { ok: true, step: step.id, solution: relative(ROOT, solution), same: changes.length === 0, changes }, () =>
  changes.length
    ? [`Playground vs ${relative(ROOT, solution)} ("-" yours, "+" solution):`, '', ...changes.map((c) => c.patch)].join('\n')
    : `Your code matches the ${step.id} solution exactly.`
);
