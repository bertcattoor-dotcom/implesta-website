// A minimal static server for dist/, used by the preview and the visual tests.
// It mirrors how the host serves the site: /path/ -> /path/index.html, unknown -> 404.html.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

export function serveDist(req, res) {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  if (url.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (fs.existsSync(path.join(file, 'index.html'))) { res.writeHead(301, { Location: `${url}/` }); res.end(); return; }
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'Not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 4321);
  http.createServer(serveDist).listen(port, () => console.log(`Serving dist/ on http://localhost:${port}`));
}
