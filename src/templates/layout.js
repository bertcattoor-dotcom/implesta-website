// The page shell: head, header, footer. Navigation and footer links come from the page
// registry (src/pages.js), labels from src/content/<lang>/_ui.json.

import { esc, html, plain } from './html.js';
import { demoButton, menuIcon, breadcrumb } from './components.js';
import { pages, pathFor, getPage } from '../pages.js';
import { site, enabledLanguages } from '../site.config.js';
import { company } from '../company.js';

export function layout({ lang, pageId, content, ui, body, jsonld, contentFor, assets, production }) {
  const page = getPage(pageId);
  const langs = enabledLanguages();
  const url = (id, l = lang) => site.url + pathFor(id, l);
  const title = pageId === 'home' ? plain(content.title) : `${plain(content.title)} | ${site.name}`;

  const alternates = page.index
    ? langs.map((l) => `<link rel="alternate" hreflang="${l.hreflang}" href="${url(pageId, l.code)}">`).join('') +
      `<link rel="alternate" hreflang="x-default" href="${url(pageId, site.defaultLang)}">`
    : '';

  const analytics = production
    ? html`<script defer data-domain="${site.analytics.plausibleDomain}" src="${site.analytics.scriptSrc}"></script><script>window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}</script>`
    : '';

  const navItems = pages.filter((p) => p.nav === 'main');
  const navLink = (p) => {
    const current = p.id === pageId || getPage(pageId).parent === p.id;
    return `<a class="nav-link${current ? ' is-current' : ''}" href="${pathFor(p.id, lang)}"${p.id === pageId ? ' aria-current="page"' : ''}>${esc(contentFor(p.id).navLabel)}</a>`;
  };

  const langSwitch = langs.length > 1
    ? langs.map((l) => (l.code === lang
      ? `<span class="nav-link is-current" aria-current="true">${l.label}</span>`
      : `<a class="nav-link" href="${pathFor(pageId, l.code)}" hreflang="${l.hreflang}" lang="${l.code}" data-event="Language switch" data-event-to="${l.code}">${l.label}</a>`)).join(' ')
    : '';

  const isDemo = pageId === 'demo';

  const footerColumn = (key) => {
    const items = pages.filter((p) => p.footer === key);
    return html`<div><h2>${esc(ui.footer[key])}</h2><ul>${items.map((p) => `<li><a href="${pathFor(p.id, lang)}">${esc(contentFor(p.id).navLabel)}</a></li>`)}</ul></div>`;
  };

  return html`<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(plain(content.description))}">
${page.index ? `<link rel="canonical" href="${url(pageId)}">` : '<meta name="robots" content="noindex">'}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(plain(content.title))}">
<meta property="og:description" content="${esc(plain(content.description))}">
<meta property="og:url" content="${url(pageId)}">
<meta property="og:image" content="${site.url}/brand/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/brand/icon.svg" type="image/svg+xml">
<link rel="icon" href="/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="preload" href="/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
${jsonld.map((block) => `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)}
${analytics}
<script src="${assets.js}" defer></script>
</head>
<body data-page="${pageId}">
<a class="skip-link" href="#main">${esc(ui.skip)}</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="${pathFor('home', lang)}" aria-label="${esc(ui.home)}"><img src="/brand/implesta-logo.svg" alt="implesta" width="187" height="43"></a>
    ${isDemo ? '<span class="site-nav"></span>' : html`<nav class="site-nav" aria-label="${esc(ui.mainNav)}">${navItems.map(navLink)}</nav>`}
    <div class="site-header__aside">
      ${langSwitch}
      ${isDemo ? '' : html`<a class="nav-link" href="${company.appUrl.includes('[[') ? '#' : company.appUrl}" data-event="Log in click">${esc(ui.logIn)}</a>`}
      ${isDemo ? '' : demoButton(lang, ui.bookDemo, 'header')}
      ${isDemo ? '' : html`<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="${esc(ui.openMenu)}" data-menu-toggle>${menuIcon()}</button>`}
    </div>
  </div>
  ${isDemo ? '' : html`<nav id="mobile-nav" class="mobile-nav container" data-open="false" aria-label="${esc(ui.mainNav)}">${navItems.map((p) => `<a class="nav-link" href="${pathFor(p.id, lang)}">${esc(contentFor(p.id).navLabel)}</a>`)}<a class="nav-link" href="${company.appUrl.includes('[[') ? '#' : company.appUrl}">${esc(ui.logIn)}</a></nav>`}
</header>
${pageId === 'home' ? '' : breadcrumb(pageId, lang, contentFor)}
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <img src="/brand/implesta-logo.svg" alt="implesta" width="160" height="37" loading="lazy">
        <span>${esc(ui.footer.tagline)}</span>
      </div>
      ${footerColumn('product')}
      ${footerColumn('for')}
      ${footerColumn('company')}
      ${footerColumn('legal')}
    </div>
    <div class="site-footer__base">
      <span>${html`© ${new Date().getFullYear()} ${esc(plain(company.legalName).includes('Registered') ? site.name : plain(company.legalName))} · ${ui.footer.enterpriseNumber} ${esc(company.enterpriseNumber)}`.replace(/\[\[(.+?)\]\]/g, '<mark class="todo" data-todo>$1</mark>')}</span>
      <span>${esc(company.address.city.includes('[[') ? company.address.countryName : `${company.address.city}, ${company.address.countryName}`)}</span>
    </div>
  </div>
</footer>
</body>
</html>`;
}
