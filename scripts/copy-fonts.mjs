// Copies the two font files the site uses from npm packages into public/fonts/, so fonts are
// served from implesta.com itself (no request to Google Fonts, nothing to consent to).
// Runs after `npm install`; the files are committed so the build never depends on it.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/fonts');

const fonts = [
  ['node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'inter-latin-wght-normal.woff2'],
  ['node_modules/@fontsource/outfit/files/outfit-latin-600-normal.woff2', 'outfit-latin-600-normal.woff2'],
  // The SIL Open Font License travels with the fonts.
  ['node_modules/@fontsource-variable/inter/LICENSE', 'LICENSE-inter.txt'],
  ['node_modules/@fontsource/outfit/LICENSE', 'LICENSE-outfit.txt'],
];

fs.mkdirSync(OUT, { recursive: true });
let missing = 0;
for (const [from, to] of fonts) {
  const src = path.join(ROOT, from);
  if (!fs.existsSync(src)) {
    console.error(`Missing ${from}. Run npm install first.`);
    missing++;
    continue;
  }
  fs.copyFileSync(src, path.join(OUT, to));
  console.log(`Copied ${to}`);
}
process.exit(missing ? 1 : 0);
