/**
 * npm test [--json]
 *
 * Runs the playground's tests: the current step's, plus every earlier step's, so nothing you finished breaks.
 * Exits 0 only when all of them pass. For vitest's own output: npx vitest run playground/tests
 */
import { fail, print, runTests } from './lib.ts';
import { PLAYGROUND, findStep, readState, wantsJson } from './steps.ts';

const json = wantsJson();
const state = await readState();
const step = findStep(state?.step) ?? fail(json, 'No step loaded. Run: npm run go 2.1');

const results = await runTests([PLAYGROUND]);
const passed = results.length > 0 && results.every((r) => r.passed);

print(json, { ok: passed, step: step.id, passed, files: results }, () =>
  [
    ...results.flatMap((r) => [
      `${r.passed ? '✓' : '✗'} ${r.step === step.id ? `${r.step} (this step)` : r.step}  ${r.file}`,
      ...r.failures.map((f) => `    ✗ ${f.name}\n      ${f.message}`)
    ]),
    '',
    passed ? `All passing. 🧪 Step ${step.id} is done.` : 'Not passing yet. Stuck? 💡 Read the hints, then npm run diff, then npm run solution.'
  ].join('\n')
);
process.exit(passed ? 0 : 1);
