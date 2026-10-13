// Local preview: builds the site, serves dist/ on http://localhost:4321 and rebuilds when a
// file in src/ or public/ changes. Refresh the browser to see the change.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { serveDist } from './serve.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 4321);

async function rebuild() {
  const started = Date.now();
  try {
    const { build } = await import(`./build.mjs?t=${started}`);
    const written = build();
    console.log(`Built ${written.length} pages in ${Date.now() - started} ms`);
  } catch (err) {
    console.error(`Build failed: ${err.message}`);
  }
}

await rebuild();
http.createServer(serveDist).listen(port, () => console.log(`Preview on http://localhost:${port}`));

let timer;
for (const dir of ['src', 'public']) {
  fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}
