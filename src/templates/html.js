// Small HTML helpers. Every string from content goes through esc() or rich(), never raw.

import { pageById, pathFor } from '../pages.js';
import { site } from '../site.config.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// Join template parts, dropping false/null/undefined so conditionals read cleanly.
export function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    const v = values[i];
    if (v === undefined || v === null || v === false) return;
    out += Array.isArray(v) ? v.join('') : v;
  });
  return out;
}

// Resolve a link target written in content: 'page:pricing', 'page:pricing#faq', '#flow' or 'https://...'.
export function href(target, lang) {
  if (target.startsWith('page:')) {
    const [id, hash] = target.slice(5).split('#');
    if (!pageById.has(id)) throw new Error(`Link to unknown page id "${id}"`);
    return pathFor(id, lang, site.defaultLang) + (hash ? `#${hash}` : '');
  }
  if (target.startsWith('#') || target.startsWith('https://') || target.startsWith('mailto:')) return target;
  throw new Error(`Link "${target}" must be page:<id>, #anchor, https:// or mailto:`);
}

// Inline formatting for content strings:
//   **bold**            -> <strong>
//   [text](page:id)     -> internal link by page id
//   [text](https://..)  -> external link
//   [[placeholder]]     -> highlighted placeholder (blocked at launch)
export function rich(text, lang) {
  let out = esc(text);
  out = out.replace(/\[\[(.+?)\]\]/g, (_, t) => `<mark class="todo" data-todo>${t}</mark>`);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
    const url = href(target.replace(/&amp;/g, '&'), lang);
    const external = url.startsWith('https://');
    return `<a href="${esc(url)}"${external ? ' rel="noopener"' : ''}>${label}</a>`;
  });
  return out;
}

// Plain text without markup, for meta tags and structured data.
export function plain(text) {
  return String(text ?? '')
    .replace(/\[\[(.+?)\]\]/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
