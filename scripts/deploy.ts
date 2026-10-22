/**
 * npm run deploy                  build the playground's view, then deploy its server/worker.ts to Cloudflare Workers
 * npm run deploy -- --app app     deploy the finished app instead
 * npm run deploy -- --dry-run     build and bundle, but don't upload
 *
 * Needs a free Cloudflare account and `npx wrangler login` once. See DEPLOY.md.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const appDir = args.includes('--app') ? args[args.indexOf('--app') + 1]! : 'playground';
const dryRun = args.includes('--dry-run');
const worker = `${appDir}/server/worker.ts`;
const shell = process.platform === 'win32';

if (!existsSync(resolve(worker))) {
  console.error(
    appDir === 'playground'
      ? 'The playground has no server/worker.ts yet. It comes in step 6.1: npm run go 6.1\nOr deploy the finished app: npm run deploy -- --app app'
      : `No ${worker}.`
  );
  process.exit(1);
}

console.log(`Building the view in ${appDir}/ui …`);
const build = spawnSync('npx', ['vite', 'build'], { stdio: 'inherit', env: { ...process.env, APP_DIR: appDir }, shell });
if (build.status !== 0) process.exit(1);

// The Worker's name and settings come from wrangler.jsonc. Only the entry file changes.
const deploy = spawnSync('npx', ['wrangler', 'deploy', worker, ...(dryRun ? ['--dry-run'] : [])], { stdio: 'inherit', shell });
if (deploy.status === 0 && !dryRun) {
  console.log('\nYour MCP server is the URL above, plus /mcp. Try it in the workshop host:\n  npm start -- --server https://<your-worker>.workers.dev/mcp');
}
process.exit(deploy.status ?? 1);
