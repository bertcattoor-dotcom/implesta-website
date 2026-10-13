// Reusable pieces. Each takes content and returns HTML. Components never take styles from
// content, so a content edit can't change the design, and a design change here changes
// every page that uses the component, on purpose.

import fs from 'node:fs';
import path from 'node:path';
import { esc, html, href, rich, plain } from './html.js';
import { ancestry, pathFor } from '../pages.js';
import { site } from '../site.config.js';
import { company } from '../company.js';

const ROOT = path.resolve(import.meta.dirname, '../..');

// --- Buttons ---------------------------------------------------------------

// The one primary action on the site. `position` is sent to analytics, so we know
// which Book a demo button people actually use.
export function demoButton(lang, label, position, { large = false } = {}) {
  return html`<a class="btn btn--primary${large ? ' btn--large' : ''}" href="${pathFor('demo', lang)}" data-event="Demo CTA click" data-event-position="${esc(position)}">${esc(label)}</a>`;
}

export function textLink(lang, label, target, event) {
  return html`<a class="text-link" href="${esc(href(target, lang))}"${event ? ` data-event="${esc(event)}"` : ''}>${esc(label)}</a>`;
}

// --- Product screens -------------------------------------------------------

// Screenshots come from the app's demo environment (pnpm demo:screens in Resource-Flow),
// copied into public/screens/<lang>/ with their manifest.json. Until a shot exists, a
// placeholder is shown and check:launch fails.
let manifestCache;
function screensManifest() {
  if (manifestCache) return manifestCache;
  const file = path.join(ROOT, 'public/screens/manifest.json');
  manifestCache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  return manifestCache;
}

function screenFiles(id, lang) {
  const dir = path.join(ROOT, 'public/screens', lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.startsWith(`${id}.`) || f.startsWith(`${id}@`) || f.startsWith(`${id}-narrow`));
}

export function screen(shot, lang, { tall = false, eager = false } = {}) {
  const entry = screensManifest().find((e) => (e.file || '').replace(/\.[a-z]+$/, '') === shot.id || e.id === shot.id);
  const files = screenFiles(shot.id, lang);
  const url = (f) => `/screens/${lang}/${f}`;
  const pick = (re) => files.find((f) => re.test(f));

  if (!entry || files.length === 0) {
    return html`<figure class="screen screen--placeholder${tall ? ' screen--tall' : ''}" data-screen="${esc(shot.id)}"><figcaption><mark class="todo" data-todo>Screenshot ${esc(shot.id)}: ${esc(shot.describes)}</mark></figcaption></figure>`;
  }

  const sources = [];
  for (const type of ['avif', 'webp']) {
    const x1 = pick(new RegExp(`^${shot.id}\\.${type}$`));
    const x2 = pick(new RegExp(`^${shot.id}@2x\\.${type}$`));
    const n1 = pick(new RegExp(`^${shot.id}-narrow\\.${type}$`));
    const n2 = pick(new RegExp(`^${shot.id}-narrow@2x\\.${type}$`));
    if (n1) sources.push(`<source type="image/${type}" media="(max-width: 720px)" srcset="${url(n1)} 1x${n2 ? `, ${url(n2)} 2x` : ''}">`);
    if (x1) sources.push(`<source type="image/${type}" srcset="${url(x1)} 1x${x2 ? `, ${url(x2)} 2x` : ''}">`);
  }
  const fallback = pick(new RegExp(`^${shot.id}\\.png$`)) || files[0];
  const alt = entry.alt || shot.describes;
  return html`<figure class="screen" data-screen="${esc(shot.id)}"><picture>${sources.join('')}<img src="${url(fallback)}" alt="${esc(alt)}"${entry.width ? ` width="${entry.width}" height="${entry.height}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async"></picture></figure>`;
}

// --- Signals (mirror the app's For you rows) -------------------------------

export function signalCard(signal, lang, labels) {
  return html`<div class="signal"><span class="signal__to">${esc(labels.to)} ${esc(signal.to)}</span><span class="signal__title">${rich(signal.title, lang)}</span><span class="signal__line">${rich(signal.line, lang)}</span></div>`;
}

// --- Homepage lifecycle slider ---------------------------------------------
// All stages are in the HTML, so search engines, AI assistants and visitors without
// JavaScript read the full story. src/client/site.js turns it into a slider.

export function lifecycle(data, lang) {
  const total = data.stages.length;
  const stops = data.stages.map((s, i) => html`<button type="button" class="lifecycle__stop" data-stop="${i}" aria-pressed="${i === 0}">${esc(s.name)}</button>`);
  const stages = data.stages.map((s, i) => html`
    <li class="lifecycle__stage${i === 0 ? ' is-active' : ''}" data-stage="${i}" aria-label="${esc(s.name)}">
      <div class="lifecycle__stage-copy">
        <span class="lifecycle__count">${esc(data.stageLabel.replace('{n}', i + 1).replace('{total}', total))}</span>
        <h3>${esc(s.name)}</h3>
        <p>${rich(s.happens, lang)}</p>
        ${screen(s.screen, lang, { eager: i === 0 })}
      </div>
      <div class="lifecycle__signals">
        <span class="lifecycle__signals-title">${esc(data.signalsTitle)}</span>
        ${s.signals.map((sig) => signalCard(sig, lang, { to: data.toLabel }))}
      </div>
    </li>`);

  return html`
  <div class="lifecycle" data-lifecycle aria-label="${esc(data.title)}">
    <div class="lifecycle__head">
      <span class="lifecycle__title">${esc(data.title)}</span>
      <span class="lifecycle__hint">${esc(data.hint)}</span>
    </div>
    <div class="lifecycle__controls">
      <label class="visually-hidden" for="lifecycle-range">${esc(data.rangeLabel)}</label>
      <input id="lifecycle-range" class="lifecycle__range" type="range" min="0" max="${total - 1}" step="1" value="0" data-range>
      <div class="lifecycle__stops">${stops}</div>
      <div class="lifecycle__phone-nav">
        <button type="button" class="icon-btn" data-prev aria-label="${esc(data.previousLabel)}">${chevron('left')}</button>
        <span data-current-name>${esc(data.stages[0].name)}</span>
        <button type="button" class="icon-btn" data-next aria-label="${esc(data.nextLabel)}">${chevron('right')}</button>
      </div>
    </div>
    <ol class="lifecycle__stages">${stages}</ol>
  </div>`;
}

function chevron(dir) {
  const d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${d}"/></svg>`;
}

export function menuIcon() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
}

// --- Breadcrumb -------------------------------------------------------------

export function breadcrumb(pageId, lang, contentFor) {
  const chain = ancestry(pageId);
  if (chain.length < 2) return '';
  const items = chain.map((p, i) => {
    const name = esc(contentFor(p.id).navLabel || contentFor(p.id).h1);
    return i === chain.length - 1
      ? `<li><span aria-current="page">${name}</span></li>`
      : `<li><a href="${pathFor(p.id, lang)}">${name}</a></li>`;
  });
  return html`<nav class="breadcrumb container" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

// --- Questions --------------------------------------------------------------

export function faq(items, lang) {
  return html`<div class="faq">${items.map((q) => html`<details><summary>${esc(q.q)}</summary><p>${rich(q.a, lang)}</p></details>`)}</div>`;
}

// --- Next step card -----------------------------------------------------------

export function nextCard(lang, target, ui) {
  return html`<a class="card-link" href="${pathFor(target.id, lang)}"><span class="card-link__kicker">${esc(ui.label)}</span><span class="card-link__title">${esc(target.title)}</span><span class="card-link__text">${esc(target.text)}</span></a>`;
}

// --- Founder photo ------------------------------------------------------------

export function founderPhoto(className = 'founder__photo') {
  if (company.founder.photo) return html`<img class="${className}" src="${esc(company.founder.photo)}" alt="${esc(company.founder.name)}" width="400" height="480" loading="lazy">`;
  return html`<div class="${className} ${className}--placeholder"><mark class="todo" data-todo>Photo of ${esc(company.founder.name)}</mark></div>`;
}

export { rich, esc, html, plain, href };
