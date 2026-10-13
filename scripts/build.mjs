// Builds the static site into dist/.
//   npm run build               preview build (no analytics)
//   PLAUSIBLE=1 npm run build   production build (with analytics)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pages, pathFor } from '../src/pages.js';
import { site, enabledLanguages } from '../src/site.config.js';
import { layout } from '../src/templates/layout.js';
import { templates, fill } from '../src/templates/pages.js';
import { structuredData } from '../src/structured-data.js';
import { plain } from '../src/templates/html.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const production = process.env.PLAUSIBLE === '1';

// --- Content ---------------------------------------------------------------------

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`${path.relative(ROOT, file)}: ${err.message}`);
  }
}

// Company facts ({price}, {founder}, ...) are filled into every content string, so meta
// tags, structured data and the page all say the same thing.
function deepFill(value, lang) {
  if (typeof value === 'string') return fill(value, lang);
  if (Array.isArray(value)) return value.map((v) => deepFill(v, lang));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepFill(v, lang)]));
  return value;
}

export function loadContent(lang) {
  const dir = path.join(ROOT, 'src/content', lang);
  const ui = readJson(path.join(dir, '_ui.json'));
  const byId = new Map();
  for (const page of pages) {
    const file = path.join(dir, `${page.id}.json`);
    if (!fs.existsSync(file)) throw new Error(`Missing content: src/content/${lang}/${page.id}.json (every enabled language needs every page)`);
    byId.set(page.id, deepFill(readJson(file), lang));
  }
  return { ui, byId };
}

// --- Assets ----------------------------------------------------------------------

function hashed(name, ext, contents) {
  const hash = crypto.createHash('sha256').update(contents).digest('hex').slice(0, 10);
  const file = `/assets/${name}.${hash}.${ext}`;
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, file), contents);
  return file;
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}

// --- Build -----------------------------------------------------------------------

export function build() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  copyDir(path.join(ROOT, 'public'), DIST);

  const css = ['tokens.css', 'site.css'].map((f) => fs.readFileSync(path.join(ROOT, 'src/styles', f), 'utf8')).join('\n');
  const js = fs.readFileSync(path.join(ROOT, 'src/client/site.js'), 'utf8');
  const assets = { css: hashed('site', 'css', css), js: hashed('site', 'js', js) };

  const written = [];
  for (const { code: lang } of enabledLanguages()) {
    const { ui, byId } = loadContent(lang);
    const contentFor = (id) => byId.get(id);

    for (const page of pages) {
      const template = templates[page.template];
      if (!template) throw new Error(`Page "${page.id}" uses unknown template "${page.template}"`);
      const content = contentFor(page.id);
      let body;
      try {
        body = template({ lang, c: content, ui, pageId: page.id, contentFor });
      } catch (err) {
        throw new Error(`Rendering ${lang}/${page.id}: ${err.message}`);
      }
      const doc = layout({
        lang, pageId: page.id, content, ui, body, contentFor, assets, production,
        jsonld: structuredData(page.id, lang, content, contentFor),
      });
      const urlPath = pathFor(page.id, lang);
      const file = urlPath.endsWith('.html') ? path.join(DIST, urlPath) : path.join(DIST, urlPath, 'index.html');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, doc.replace(/\n\s*\n/g, '\n'));
      written.push({ page, lang, urlPath, content });
    }
  }

  writeSitemap(written);
  writeRobots();
  writeLlmsTxt(written);
  return written;
}

function writeSitemap(written) {
  const langs = enabledLanguages();
  const indexable = written.filter((w) => w.page.index && w.lang === site.defaultLang);
  const urls = indexable.map(({ page }) => {
    const alts = langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${site.url}${pathFor(page.id, l.code)}"/>`).join('');
    return langs.map((l) => `<url><loc>${site.url}${pathFor(page.id, l.code)}</loc>${alts}<xhtml:link rel="alternate" hreflang="x-default" href="${site.url}${pathFor(page.id, site.defaultLang)}"/></url>`).join('\n');
  });
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
}

function writeRobots() {
  // Search and AI assistants may read everything. Choosing to block AI training crawlers
  // (GPTBot, Google-Extended, ClaudeBot, CCBot) is a separate decision: add Disallow rules here.
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /demo/confirmed/\n\nSitemap: ${site.url}/sitemap.xml\n`);
}

function writeLlmsTxt(written) {
  const en = written.filter((w) => w.lang === site.defaultLang && w.page.index);
  const line = (w) => `- [${plain(w.content.navLabel)}](${site.url}${w.urlPath}): ${plain(w.content.description)}`;
  const home = en.find((w) => w.page.id === 'home');
  const group = (ids) => en.filter((w) => ids(w.page)).map(line).join('\n');
  const text = `# ${site.name}\n\n> ${plain(home.content.description)}\n\n## Product\n${group((p) => p.id === 'product' || p.parent === 'product')}\n\n## Who it's for\n${group((p) => p.id === 'for' || p.parent === 'for')}\n\n## Company\n${group((p) => ['pricing', 'about', 'security', 'demo'].includes(p.id))}\n`;
  fs.writeFileSync(path.join(DIST, 'llms.txt'), text);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const written = build();
  console.log(`Built ${written.length} pages into dist/${production ? ' (production, with analytics)' : ''}`);
}
