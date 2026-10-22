/**
 * npm run solution [--step 3.3] [--json]
 *
 * Puts the current step's solution in the playground, so you can catch up and carry on.
 * Your own version is backed up to .playground-backups/ first.
 */
import { relative } from 'node:path';
import { backupPlayground, fail, loadIntoPlayground, nextStep, print } from './lib.ts';
import { ROOT, findStep, readState, wantsJson } from './steps.ts';

const json = wantsJson();
const flag = process.argv.indexOf('--step');
const state = await readState();
const step = findStep(flag > 0 ? process.argv[flag + 1] : state?.step) ?? fail(json, 'No step loaded. Run: npm run go 2.1');

const backup = await backupPlayground(state ? `${state.step}.${state.kind}` : 'playground');
await loadIntoPlayground(step, 'solution');
const after = nextStep(step.id);

print(json, { ok: true, step: step.id, kind: 'solution', backup: backup && relative(ROOT, backup), next: after && `npm run go ${after.id}` }, () =>
  [
    `The ${step.id} solution is now in playground/.`,
    backup ? `Your version is in ${relative(ROOT, backup)}.` : '',
    'Run npm start to try it, then read the code against the README before moving on.',
    after ? `Next step: npm run go ${after.id}` : 'That was the last step.'
  ]
    .filter(Boolean)
    .join('\n')
);
