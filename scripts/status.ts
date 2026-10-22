/**
 * npm run status [--no-test] [--json]
 *
 * Where am I, and what's left? The current step, its open 🔨 markers with file and line, and the test result.
 * Run it first, every time: people and agents alike.
 */
import { fail, findMarkers, nextStep, print, runTests } from './lib.ts';
import { PLAYGROUND, STEPS, findStep, readState, wantsJson } from './steps.ts';

const json = wantsJson();
const state = await readState();

if (!state) {
  print(json, { ok: true, step: null, next: 'npm run go 2.1' }, () => 'The playground is empty. Start with: npm run go 2.1');
  process.exit(0);
}

const step = findStep(state.step) ?? fail(json, `playground/.step.json names an unknown step "${state.step}". Run: npm run go 2.1`);
const todo = await findMarkers(PLAYGROUND, ['🔨']);
const bonus = await findMarkers(PLAYGROUND, ['🔥']);
const tests = process.argv.includes('--no-test') ? undefined : await runTests([PLAYGROUND]);
const current = tests?.filter((t) => t.step === step.id);
const earlier = tests?.filter((t) => t.step !== step.id && !t.passed);
const passing = current ? current.length > 0 && current.every((t) => t.passed) && !earlier?.length : undefined;
const after = nextStep(step.id);

const next =
  passing === true
    ? after
      ? `Step ${step.id} passes. Answer "Explain it back" in playground/README.md, then: npm run go ${after.id}`
      : 'Every step is done. Try the deployed server in a real host: see DEPLOY.md.'
    : todo.length
      ? `Fill the 🔨 markers, then: npm test`
      : 'No 🔨 markers left, but the tests do not pass yet. Run npm test for details, or npm run diff to compare with the solution.';

print(
  json,
  {
    ok: true,
    step: step.id,
    title: step.title,
    kind: state.kind,
    of: STEPS.length,
    position: STEPS.indexOf(step) + 1,
    todo,
    bonus,
    tests: tests && { passing, current, brokenEarlier: earlier },
    next
  },
  () => {
    const lines = [`Step ${step.id}: ${step.title} (${state.kind}, step ${STEPS.indexOf(step) + 1} of ${STEPS.length})`, ''];
    if (todo.length) lines.push(`🔨 ${todo.length} to do:`, ...todo.map((m) => `  ${m.file}:${m.line}  ${m.text}`), '');
    else lines.push('🔨 No markers left.', '');
    if (bonus.length) lines.push(`🔥 ${bonus.length} bonus: ${bonus.map((m) => `${m.file}:${m.line}`).join(', ')}`, '');
    if (tests) {
      for (const t of current ?? []) lines.push(`🧪 ${t.file}: ${t.passed ? 'passing' : `${t.failures.length} failing`}`, ...t.failures.map((f) => `   ✗ ${f.name}\n     ${f.message}`));
      for (const t of earlier ?? []) lines.push(`🧪 ${t.file} (step ${t.step}, done earlier) now fails:`, ...t.failures.map((f) => `   ✗ ${f.name}\n     ${f.message}`));
      lines.push('');
    }
    lines.push(`Next: ${next}`);
    return lines.join('\n');
  }
);
