/**
 * Tests for the steps. Each step folder has a tests/ folder that tests the code next to it,
 * so the same files check the playground, a problem, a solution, or app/.
 * `npm test` runs the playground's; `npm run verify` runs every solution's.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const AS_TEXT = '?as-text';

export default defineConfig({
  plugins: [
    {
      // worker.ts imports the built view the way Wrangler does: an .html file as a string.
      // Use the real build when there is one, and a stub otherwise, so tests don't need a build first.
      name: 'built-view-as-text',
      enforce: 'pre',
      resolveId(source, importer) {
        if (importer && source.endsWith('dist/mcp-app.html')) return resolve(dirname(importer), source) + AS_TEXT;
      },
      load(id) {
        if (!id.endsWith(AS_TEXT)) return;
        const file = id.slice(0, -AS_TEXT.length);
        const html = existsSync(file) ? readFileSync(file, 'utf8') : '<!doctype html><html><head></head><body><div id="root"></div></body></html>';
        return `export default ${JSON.stringify(html)};`;
      }
    }
  ],
  test: {
    include: ['**/tests/*.test.ts'],
    exclude: ['**/node_modules/**', 'scripts/**', 'host/**'],
    css: false
  }
});
