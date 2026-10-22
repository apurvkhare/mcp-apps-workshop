/**
 * npm run verify [--no-build] [--json]
 *
 * For workshop authors: checks every step folder before the event.
 *   - the exercise folders match scripts/authoring/source (npm run cut was run)
 *   - everything typechecks, problems included
 *   - each solution passes its own tests and every earlier step's
 *   - each problem fails its own step's tests, passes the earlier ones, and has 🔨 markers; solutions have none
 *   - each solution's view builds (skip with --no-build)
 */
import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';
import { findMarkers, print, runTests } from './lib.ts';
import { ROOT, STEPS, wantsJson } from './steps.ts';

const json = wantsJson();
const problems: string[] = [];
const run = (cmd: string, args: string[], env: Record<string, string> = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env }, shell: process.platform === 'win32' });
const say = (line: string) => !json && console.log(line);

say('Checking the exercises match the authoring source …');
const cut = run('npx', ['tsx', 'scripts/authoring/cut.ts', '--check']);
if (cut.status !== 0) problems.push(`exercises are out of date with scripts/authoring/source: ${cut.stdout.trim()} Run npm run cut.`);

say('Typechecking …');
const tsc = run('npx', ['tsc', '-p', 'tsconfig.json']);
if (tsc.status !== 0) problems.push(`typecheck failed:\n${tsc.stdout.trim()}`);

say('Running every folder’s tests …');
const folders = STEPS.flatMap((s) => [s.dir('problem'), s.dir('solution')]);
const results = await runTests([...folders, `${ROOT}/app`]);
const byFolder = (dir: string) => results.filter((r) => r.folder === relative(ROOT, dir));

for (const step of STEPS) {
  for (const kind of ['problem', 'solution'] as const) {
    const dir = step.dir(kind);
    const name = relative(ROOT, dir);
    const own = byFolder(dir).filter((r) => r.step === step.id);
    const earlier = byFolder(dir).filter((r) => r.step !== step.id);
    if (!own.length) problems.push(`${name}: no tests/${step.id}.test.ts`);
    for (const r of earlier.filter((r) => !r.passed)) problems.push(`${name}: earlier step ${r.step} fails: ${r.failures[0]?.message}`);
    const todo = await findMarkers(dir, ['🔨']);
    if (kind === 'solution') {
      for (const r of own.filter((r) => !r.passed)) problems.push(`${name}: fails its own tests: ${r.failures.map((f) => f.name).join('; ')}`);
      if (todo.length) problems.push(`${name}: solution still has 🔨 at ${todo.map((m) => `${m.file}:${m.line}`).join(', ')}`);
    } else {
      if (own.some((r) => r.passed)) problems.push(`${name}: the problem already passes its own tests`);
      if (!todo.length) problems.push(`${name}: problem has no 🔨 markers`);
    }
  }
}
for (const r of byFolder(`${ROOT}/app`).filter((r) => !r.passed)) problems.push(`app: step ${r.step} fails: ${r.failures[0]?.message}`);

if (!process.argv.includes('--no-build')) {
  for (const step of STEPS) {
    say(`Building ${step.id} …`);
    const build = run('npx', ['vite', 'build'], { APP_DIR: step.dir('solution') });
    if (build.status !== 0) problems.push(`${relative(ROOT, step.dir('solution'))}: vite build failed`);
  }
}

print(json, { ok: problems.length === 0, steps: STEPS.length, testFiles: results.length, problems }, () =>
  problems.length ? `\n${problems.length} problem(s):\n${problems.map((p) => `✗ ${p}`).join('\n')}` : `\nAll ${STEPS.length} steps verified (${results.length} test files).`
);
process.exit(problems.length ? 1 : 0);
