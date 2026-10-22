/**
 * npm start: build the view, then run the MCP server and the workshop host together.
 *   npm start                  the playground
 *   npm start -- --app app     the finished reference app
 * Ctrl+C stops both. Non-interactive: safe for an agent to run in the background.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const appArg = args.includes('--app') ? args[args.indexOf('--app') + 1] : undefined;
const appDir = appArg ?? 'playground';
const port = process.env.PORT ?? '3001';

if (!existsSync(resolve(appDir, 'server/http.ts'))) {
  console.error(`No server at ${appDir}/server/http.ts. Load a step first: npm run go 2.1`);
  process.exit(1);
}

const run = (cmd: string, cmdArgs: string[], env: Record<string, string> = {}, cwd?: string) =>
  spawnSync(cmd, cmdArgs, { stdio: 'inherit', env: { ...process.env, ...env }, cwd, shell: process.platform === 'win32' });

console.log(`Building the view in ${appDir}/ui …`);
if (run('npx', ['vite', 'build'], { APP_DIR: appDir }).status !== 0) process.exit(1);

if (!existsSync('host/dist/index.html') || !existsSync('host/dist/sandbox.html')) {
  console.log('Building the workshop host …');
  for (const input of ['index.html', 'sandbox.html']) {
    if (run('npx', ['vite', 'build'], { INPUT: input, NODE_ENV: 'development' }, 'host').status !== 0) process.exit(1);
  }
}

const children = [
  spawn('npx', ['tsx', `${appDir}/server/http.ts`], { stdio: 'inherit', env: { ...process.env, PORT: port }, shell: process.platform === 'win32' }),
  spawn('npx', ['tsx', 'serve.ts'], {
    stdio: 'inherit',
    cwd: 'host',
    env: { ...process.env, SERVERS: JSON.stringify([`http://localhost:${port}/mcp`]) },
    shell: process.platform === 'win32'
  })
];

const stop = () => {
  for (const child of children) child.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
for (const child of children) child.on('exit', (code) => code && stop());
