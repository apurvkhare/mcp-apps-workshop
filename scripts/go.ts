/**
 * npm run go 3.3            load step 3.3's problem into playground/
 * npm run go 3.3 --solution load its solution instead
 * npm run go next           the step after the current one
 *
 * The old playground is backed up to .playground-backups/ first, so nothing is ever lost.
 */
import { relative } from 'node:path';
import { backupPlayground, fail, findMarkers, loadIntoPlayground, nextStep, print, stepList } from './lib.ts';
import { PLAYGROUND, ROOT, findStep, positional, readState, wantsJson } from './steps.ts';

const json = wantsJson();
const arg = positional()[0];
const state = await readState();
const step = arg === 'next' ? (state ? nextStep(state.step) : findStep('2.1')) : findStep(arg);
if (!step) {
  fail(json, arg === 'next' && state ? `Step ${state.step} is the last one.` : `Which step? npm run go <step>, one of:\n${stepList()}`);
}
const kind = process.argv.includes('--solution') ? 'solution' : 'problem';

const backup = await backupPlayground(state ? `${state.step}.${state.kind}` : 'playground');
await loadIntoPlayground(step, kind);
const todo = await findMarkers(PLAYGROUND, ['🔨']);
const rel = (p: string) => relative(ROOT, p);

print(
  json,
  { ok: true, step: step.id, kind, title: step.title, readme: rel(`${PLAYGROUND}/README.md`), backup: backup ? rel(backup) : null, todo },
  () =>
    [
      `Loaded ${step.id} ${step.title} (${kind}) into playground/.`,
      backup ? `Your previous playground is in ${rel(backup)}.` : '',
      '',
      kind === 'problem'
        ? `Read playground/README.md, then fill the ${todo.length} 🔨 marker${todo.length === 1 ? '' : 's'}:\n${todo.map((m) => `  ${m.file}:${m.line}`).join('\n')}`
        : 'This is the finished step. Read it, run it, and compare it with the README.',
      '',
      'npm start        build and run it in the workshop host',
      'npm test         check it',
      'npm run status   where you are and what is left'
    ]
      .filter((l, i, all) => l || all[i - 1])
      .join('\n')
);
