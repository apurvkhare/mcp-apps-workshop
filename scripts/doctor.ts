/**
 * npm run doctor [--json]
 *
 * Checks this machine is ready for the workshop: Node, dependencies, free ports, and a full build and
 * test of the finished app. Run it a few days before, on the network you'll install from.
 * After it passes once, the workshop runs offline.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { print, runTests } from './lib.ts';
import { ROOT, wantsJson } from './steps.ts';

const json = wantsJson();
type Status = 'ok' | 'warn' | 'fail';
const checks: { name: string; status: Status; detail: string; fix?: string }[] = [];
const check = (name: string, status: Status, detail: string, fix?: string) => checks.push({ name, status, detail, fix });
const run = (cmd: string, args: string[], env: Record<string, string> = {}, cwd = ROOT) =>
  spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, ...env }, shell: process.platform === 'win32' });

// Node
const major = Number(process.versions.node.split('.')[0]);
check('Node 22 or later', major >= 22 ? 'ok' : 'fail', `node ${process.versions.node}`, 'Install Node 22 LTS from https://nodejs.org, or run: nvm install 22');

// Dependencies, at the pinned versions
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')) as { dependencies: Record<string, string> };
const wrong = Object.entries(pkg.dependencies).flatMap(([name, want]) => {
  const file = resolve(ROOT, 'node_modules', name, 'package.json');
  if (!existsSync(file)) return [`${name} missing`];
  const have = (JSON.parse(readFileSync(file, 'utf8')) as { version: string }).version;
  return have === want ? [] : [`${name} ${have}, want ${want}`];
});
check('Dependencies installed', wrong.length ? 'fail' : 'ok', wrong.length ? wrong.join('; ') : 'all pinned versions present', 'npm install');

// Ports
async function free(port: number) {
  return new Promise<boolean>((done) => {
    const server = createServer().once('error', () => done(false));
    server.listen(port, () => server.close(() => done(true)));
  });
}
for (const [port, what] of [
  [3001, 'MCP server'],
  [8080, 'workshop host'],
  [8081, 'host sandbox']
] as const) {
  const ok = await free(port);
  check(`Port ${port} free (${what})`, ok ? 'ok' : 'warn', ok ? 'free' : 'in use', `Stop whatever uses port ${port}. If it's an earlier npm start, press Ctrl+C in that terminal.`);
}

// git (only npm run diff uses it, and it falls back to diff)
const git = run('git', ['--version']);
check('git', git.status === 0 ? 'ok' : 'warn', git.status === 0 ? git.stdout.trim() : 'not found', 'Optional. npm run diff uses git, and falls back to diff without it.');

// Builds
const view = run('npx', ['vite', 'build'], { APP_DIR: 'app' });
check('Builds the view', view.status === 0 ? 'ok' : 'fail', view.status === 0 ? 'app/dist/mcp-app.html' : (view.stderr || view.stdout).trim().split('\n').slice(-3).join(' '), 'Run npm install again, then: APP_DIR=app npx vite build');

const hostBuilt = ['index.html', 'sandbox.html'].every((input) => run('npx', ['vite', 'build'], { INPUT: input, NODE_ENV: 'development' }, resolve(ROOT, 'host')).status === 0);
check('Builds the workshop host', hostBuilt ? 'ok' : 'fail', hostBuilt ? 'host/dist' : 'vite build failed in host/', 'cd host && INPUT=index.html npx vite build');

// Tests
const tests = await runTests([resolve(ROOT, 'app')]);
const failing = tests.filter((t) => !t.passed);
check('Runs the tests', tests.length && !failing.length ? 'ok' : 'fail', tests.length ? `${tests.length - failing.length}/${tests.length} test files pass in app/` : 'no tests ran', 'npx vitest run app/tests');

const failed = checks.filter((c) => c.status === 'fail');
const icon = { ok: '✓', warn: '!', fail: '✗' };
print(json, { ok: failed.length === 0, checks }, () =>
  [
    ...checks.map((c) => `${icon[c.status]} ${c.name.padEnd(32)} ${c.detail}${c.status !== 'ok' && c.fix ? `\n    → ${c.fix}` : ''}`),
    '',
    failed.length ? `${failed.length} problem${failed.length === 1 ? '' : 's'} to fix before the workshop.` : 'Ready for the workshop. Everything from here on works offline.'
  ].join('\n')
);
process.exit(failed.length ? 1 : 0);
