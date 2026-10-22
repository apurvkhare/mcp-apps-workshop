/**
 * npm start: build the view, then run the MCP server and the workshop host together.
 *   npm start                  the playground
 *   npm start -- --app app     the finished reference app
 *
 * Watches as you work: saving a view file rebuilds the view, saving a server file restarts the server,
 * and `npm run go` in another terminal reloads everything for the new step. Call the tool again in the
 * host to see a change. Ctrl+C stops it all. Non-interactive: safe for an agent to run in the background.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync, watchFile } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const appArg = args.includes('--app') ? args[args.indexOf('--app') + 1] : undefined;
const appDir = appArg ?? 'playground';
const port = process.env.PORT ?? '3001';
const shell = process.platform === 'win32';

if (!existsSync(resolve(appDir, 'server/http.ts'))) {
  console.error(`No server at ${appDir}/server/http.ts. Load a step first: npm run go 2.1`);
  process.exit(1);
}

// Run the local binaries directly, not through npx, so stopping one stops the real process.
const bin = (name: string) => resolve('node_modules/.bin', shell ? `${name}.cmd` : name);

const run = (cmd: string, cmdArgs: string[], env: Record<string, string> = {}, cwd?: string) =>
  spawnSync(cmd, cmdArgs, { stdio: 'inherit', env: { ...process.env, ...env }, cwd, shell });

if (!existsSync('host/dist/index.html') || !existsSync('host/dist/sandbox.html')) {
  console.log('Building the workshop host …');
  for (const input of ['index.html', 'sandbox.html']) {
    if (run('npx', ['vite', 'build'], { INPUT: input, NODE_ENV: 'development' }, 'host').status !== 0) process.exit(1);
  }
}

let app: ChildProcess[] = [];
let stopping = false;

/** The view builder and the MCP server. Both restart when the playground switches steps. */
function startApp() {
  console.log(`Building the view in ${appDir}/ui …`);
  if (run('npx', ['vite', 'build'], { APP_DIR: appDir }).status !== 0) console.error('The view did not build. Fix the error above and save: it rebuilds on its own.');
  app = [
    spawn(bin('vite'), ['build', '--watch'], { stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, APP_DIR: appDir }, shell }),
    spawn(bin('tsx'), ['watch', '--clear-screen=false', `${appDir}/server/http.ts`], { stdio: 'inherit', env: { ...process.env, PORT: port }, shell })
  ];
}

function stopApp() {
  for (const child of app) child.kill();
  app = [];
}

startApp();
const host = spawn(bin('tsx'), ['serve.ts'], {
  stdio: 'inherit',
  cwd: 'host',
  env: { ...process.env, SERVERS: JSON.stringify([`http://localhost:${port}/mcp`]) },
  shell
});
host.on('exit', (code) => code && !stopping && stop());

// `npm run go` and `npm run solution` rewrite playground/.step.json last, once the new files are in place.
if (appDir === 'playground') {
  watchFile(resolve(appDir, '.step.json'), { interval: 500 }, () => {
    console.log('\nThe playground changed step. Restarting the view and the server …');
    stopApp();
    setTimeout(startApp, 300);
  });
}

function stop() {
  stopping = true;
  stopApp();
  host.kill();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
