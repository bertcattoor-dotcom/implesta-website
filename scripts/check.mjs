// Checks that catch unintended changes before they go live. Runs on every pull request.
//   npm run check          content, links, structured data, style rules
//   npm run check:launch   the same, plus: no placeholders left, fonts, screenshots, booking

import fs from 'node:fs';
import path from 'node:path';
import { build } from './build.mjs';
import { pages } from '../src/pages.js';
import { site, enabledLanguages } from '../src/site.config.js';
import { company } from '../src/company.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const launch = process.argv.includes('--launch');
const problems = [];
const fail = (area, message) => problems.push(`${area}: ${message}`);

const BANNED_WORDS = ['pivot', 'runway', 'seamless', 'seamlessly', 'robust', 'leverage', 'empower', 'supercharge', 'streamline', 'enterprise-grade', 'next-gen', 'unlock', 'holistic', 'synergy', 'formal'];

const written = build();

// --- 1. Content -------------------------------------------------------------------
for (const { code: lang } of enabledLanguages()) {
  const queries = new Map();
  for (const w of written.filter((x) => x.lang === lang)) {
    const c = w.content;
    const where = `src/content/${lang}/${w.page.id}.json`;
    for (const field of ['title', 'description', 'navLabel', 'h1']) if (!c[field]) fail('Content', `${where} has no "${field}"`);
    if (c.title && c.title.length > site.limits.titleMax) fail('Content', `${where} title is ${c.title.length} characters (max ${site.limits.titleMax})`);
    if (c.description && c.description.length > site.limits.descriptionMax) fail('Content', `${where} description is ${c.description.length} characters (max ${site.limits.descriptionMax})`);
    if (w.page.index) {
      if (!c.primaryQuery) fail('Content', `${where} has no primaryQuery`);
      else if (queries.has(c.primaryQuery)) fail('Content', `${where} targets "${c.primaryQuery}", already targeted by ${queries.get(c.primaryQuery)}`);
      else queries.set(c.primaryQuery, w.page.id);
    }
  }
}

// --- 2. Links, orphans, dead ends ---------------------------------------------------
const htmlFiles = written.map((w) => ({ ...w, file: w.urlPath.endsWith('.html') ? path.join(DIST, w.urlPath) : path.join(DIST, w.urlPath, 'index.html') }));
const inbound = new Map(htmlFiles.map((h) => [h.urlPath, 0]));

for (const h of htmlFiles) {
  const doc = fs.readFileSync(h.file, 'utf8');
  const ids = new Set([...doc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const main = doc.slice(doc.indexOf('<main'), doc.indexOf('</main>'));

  for (const [, href] of doc.matchAll(/\shref="([^"]+)"/g)) {
    if (href.startsWith('#')) {
      if (href.length > 1 && !ids.has(href.slice(1))) fail('Links', `${h.urlPath} links to ${href}, which is not on the page`);
      continue;
    }
    if (!href.startsWith('/')) continue;
    if (href.startsWith('/fonts/')) continue; // font files are checked by check:launch
    const [target, hash] = href.split('#');
    const file = target.endsWith('/') ? path.join(DIST, target, 'index.html') : path.join(DIST, target);
    if (!fs.existsSync(file)) { fail('Links', `${h.urlPath} links to ${href}, which does not exist`); continue; }
    if (hash && target.endsWith('/')) {
      const targetDoc = fs.readFileSync(file, 'utf8');
      if (!targetDoc.includes(`id="${hash}"`)) fail('Links', `${h.urlPath} links to ${href}, but #${hash} is not on that page`);
    }
    if (target !== h.urlPath && inbound.has(target)) inbound.set(target, inbound.get(target) + 1);
  }

  const mainLinks = [...main.matchAll(/\shref="(\/[^"#]*)/g)].map((m) => m[1]).filter((t) => t !== h.urlPath);
  if (mainLinks.length === 0) fail('Links', `${h.urlPath} is a dead end: its content links to no other page`);
}
for (const h of htmlFiles) {
  if (h.page.index && h.page.id !== 'home' && inbound.get(h.urlPath) === 0) fail('Links', `${h.urlPath} is an orphan: no other page links to it`);
}

// --- 3. Structured data --------------------------------------------------------------
for (const h of htmlFiles) {
  const doc = fs.readFileSync(h.file, 'utf8');
  const blocks = [...doc.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (blocks.length === 0) { fail('Structured data', `${h.urlPath} has none`); continue; }
  for (const [, json] of blocks) {
    let data;
    try { data = JSON.parse(json); } catch (err) { fail('Structured data', `${h.urlPath}: invalid JSON (${err.message})`); continue; }
    if (data['@context'] !== 'https://schema.org') fail('Structured data', `${h.urlPath}: missing @context`);
    for (const node of data['@graph'] || []) {
      if (!node['@type']) fail('Structured data', `${h.urlPath}: a node has no @type`);
      if (JSON.stringify(node).includes('[[')) fail('Structured data', `${h.urlPath}: ${node['@type']} contains a placeholder`);
    }
  }
}

// --- 4. Style rules (STYLE_BOOK v2.1 and the website plan) -----------------------------
const contentDir = path.join(ROOT, 'src/content');
for (const lang of fs.readdirSync(contentDir)) {
  for (const f of fs.readdirSync(path.join(contentDir, lang))) {
    const text = fs.readFileSync(path.join(contentDir, lang, f), 'utf8');
    for (const word of BANNED_WORDS) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(text)) fail('Style', `src/content/${lang}/${f} uses the banned word "${word}"`);
    }
    if (/\p{Extended_Pictographic}/u.test(text)) fail('Style', `src/content/${lang}/${f} contains an emoji`);
    if (/!\s*"/.test(text) && /[a-z]!/.test(text)) fail('Style', `src/content/${lang}/${f} uses an exclamation mark`);
  }
}
const css = fs.readFileSync(path.join(ROOT, 'src/styles/site.css'), 'utf8') + fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
if (/text-transform:\s*uppercase/.test(css)) fail('Style', 'CSS uses uppercase text');
if (/letter-spacing:\s*0?\.\d+(em|px)|letter-spacing:\s*[1-9]/.test(css)) fail('Style', 'CSS uses wide letter-spacing');
if (/gradient\(/.test(css)) fail('Style', 'CSS uses a gradient (only the logo may have one)');
for (const [, value] of css.matchAll(/border-radius:\s*(\d+)px/g)) {
  if (Number(value) > 12 && Number(value) !== 9999) fail('Style', `CSS uses border-radius ${value}px (max 12px, 9999px for dots and avatars)`);
}

// --- 5. Launch readiness ---------------------------------------------------------------
if (launch) {
  // One line per missing item, with the pages it appears on.
  const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const todos = new Map();
  for (const h of htmlFiles) {
    const doc = fs.readFileSync(h.file, 'utf8');
    for (const [, t] of doc.matchAll(/<mark class="todo" data-todo>([\s\S]*?)<\/mark>/g)) {
      const key = decode(t);
      if (!todos.has(key)) todos.set(key, new Set());
      todos.get(key).add(h.urlPath);
    }
  }
  for (const [t, where] of todos) {
    const list = [...where];
    fail('Placeholder', `${t} (${list.length > 3 ? `${list.length} pages` : list.join(', ')})`);
  }
  for (const f of ['inter-latin-wght-normal.woff2', 'outfit-latin-600-normal.woff2']) {
    if (!fs.existsSync(path.join(ROOT, 'public/fonts', f))) fail('Launch', `public/fonts/${f} is missing (run npm install && npm run fonts)`);
  }
  if (!company.booking.calLink) fail('Launch', 'company.booking.calLink is not set');
  for (const key of ['fullUserPerMonth', 'teamMemberPerMonth']) {
    if (typeof company.pricing[key] !== 'number') fail('Launch', `company.pricing.${key} is not set`);
  }
}

// --- Report ---------------------------------------------------------------------------
if (problems.length) {
  console.error(`${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  const byArea = Object.groupBy(problems, (p) => p.split(':')[0]);
  for (const [area, list] of Object.entries(byArea)) {
    console.error(area);
    for (const p of list) console.error(`  - ${p.slice(area.length + 2)}`);
  }
  process.exit(1);
}
console.log(`All checks passed${launch ? ', ready to launch' : ''}: ${written.length} pages.`);
