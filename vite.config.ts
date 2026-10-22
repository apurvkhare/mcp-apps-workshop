/**
 * Builds a view into one self-contained HTML file: <dir>/dist/mcp-app.html.
 * The host renders it in a sandboxed iframe that cannot fetch your JS or CSS, so everything
 * is inlined. That is all vite-plugin-singlefile does.
 *
 * Which app to build comes from APP_DIR: playground (default), app, or any exercise step.
 */
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const appDir = resolve(process.env.APP_DIR ?? 'playground');

export default defineConfig({
  root: resolve(appDir, 'ui'),
  plugins: [react(), viteSingleFile()],
  logLevel: 'warn',
  build: {
    outDir: resolve(appDir, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: resolve(appDir, 'ui/mcp-app.html') }
  }
});
