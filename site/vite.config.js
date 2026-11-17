// The site is a small React app built with Carbon itself (@carbon/react, pinned in package.json).
// It reads the capture pipeline's output from ../data, which isn't part of the build: the dev and
// preview servers serve it at /data, and the refresh workflow copies it next to the built site.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.resolve(import.meta.dirname, '../data');
const carbonVersion = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, '../node_modules/@carbon/react/package.json'), 'utf8')).version;

const TYPES = { '.json': 'application/json', '.png': 'image/png', '.md': 'text/markdown; charset=utf-8' };
function serveData() {
  const handler = (req, res, next) => {
    const url = decodeURIComponent((req.url || '').split('?')[0]);
    if (!url.startsWith('/data/')) return next();
    const file = path.join(DATA, url.slice('/data/'.length));
    if (!file.startsWith(DATA + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      // Screenshots aren't committed, so a fresh clone has none: borrow the published ones.
      if (url.startsWith('/data/shots/')) {
        res.statusCode = 302;
        res.setHeader('Location', `https://carbon-design-system.github.io/carbon-compare${url}`);
        return res.end();
      }
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(file).pipe(res);
  };
  return {
    name: 'serve-data',
    // Braces matter: a returned value from these hooks would be treated as a post-hook to call.
    configureServer(server) { server.middlewares.use(handler); },
    configurePreviewServer(server) { server.middlewares.use(handler); },
  };
}

export default defineConfig({
  root: import.meta.dirname,
  base: './', // GitHub Pages serves the site from /carbon-compare/
  publicDir: false,
  plugins: [react(), serveData()],
  // Carbon's Sass loads IBM Plex as "~@ibm/plex/…" (the webpack convention for "from node_modules").
  resolve: { alias: [{ find: /^~(@ibm\/plex\/.*)$/, replacement: '$1' }] },
  define: { __CARBON_VERSION__: JSON.stringify(carbonVersion) },
  css: {
    preprocessorOptions: {
      scss: { loadPaths: [path.resolve(import.meta.dirname, '../node_modules')], quietDeps: true },
    },
  },
  build: { outDir: path.resolve(import.meta.dirname, '../dist'), emptyOutDir: true, chunkSizeWarningLimit: 2000 },
  server: { port: 4321 },
  preview: { port: 4321 },
});
