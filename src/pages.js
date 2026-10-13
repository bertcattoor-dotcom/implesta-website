// The page registry: every page on the site, its address in each language, where it sits,
// and which page it leads to next. Navigation, breadcrumbs, the sitemap, hreflang links,
// llms.txt and internal links are all generated from this list.
//
// Link to pages by id in content ([text](page:pricing)), never by URL, so renaming a slug
// can't break a link.
//
// Fields
//   id        stable identifier, also the content file name (src/content/<lang>/<id>.json)
//   slug      path per language, without leading or trailing slash ('' is the homepage)
//   template  which template renders it (src/templates/pages.js)
//   parent    id of the page above it, for breadcrumbs
//   next      id of the page it leads to; every page must lead somewhere
//   nav       'main' puts it in the header navigation, in the order listed here
//   footer    which footer column lists it
//   index     false keeps it out of search engines and the sitemap

export const pages = [
  { id: 'home', slug: { en: '', nl: '', fr: '' }, template: 'home', next: 'demo', index: true },

  { id: 'product', slug: { en: 'product', nl: 'product', fr: 'produit' }, template: 'productHub', parent: 'home', next: 'product-sales', nav: 'main', footer: 'product', index: true },
  { id: 'product-sales', slug: { en: 'product/sales-and-proposals', nl: 'product/verkoop-en-offertes', fr: 'produit/ventes-et-offres' }, template: 'productPage', parent: 'product', next: 'product-planning', footer: 'product', index: true },
  { id: 'product-planning', slug: { en: 'product/planning-and-delivery', nl: 'product/planning-en-uitvoering', fr: 'produit/planification-et-execution' }, template: 'productPage', parent: 'product', next: 'product-time', footer: 'product', index: true },
  { id: 'product-time', slug: { en: 'product/time-and-approvals', nl: 'product/tijd-en-goedkeuring', fr: 'produit/temps-et-validation' }, template: 'productPage', parent: 'product', next: 'product-invoicing', footer: 'product', index: true },
  { id: 'product-invoicing', slug: { en: 'product/invoicing-and-margins', nl: 'product/facturatie-en-marges', fr: 'produit/facturation-et-marges' }, template: 'productPage', parent: 'product', next: 'demo', footer: 'product', index: true },

  { id: 'for', slug: { en: 'for', nl: 'voor', fr: 'pour' }, template: 'audienceHub', parent: 'home', next: 'for-secondment', nav: 'main', footer: 'for', index: true },
  { id: 'for-secondment', slug: { en: 'for/secondment-and-staffing', nl: 'voor/detachering', fr: 'pour/detachement' }, template: 'audiencePage', parent: 'for', next: 'demo', footer: 'for', index: true },
  { id: 'for-it-services', slug: { en: 'for/it-services', nl: 'voor/it-dienstverlening', fr: 'pour/services-it' }, template: 'audiencePage', parent: 'for', next: 'demo', footer: 'for', index: true },
  { id: 'for-engineering', slug: { en: 'for/engineering-consultancies', nl: 'voor/ingenieursbureaus', fr: 'pour/bureaux-d-ingenierie' }, template: 'audiencePage', parent: 'for', next: 'demo', footer: 'for', index: true },

  { id: 'pricing', slug: { en: 'pricing', nl: 'prijzen', fr: 'tarifs' }, template: 'pricing', parent: 'home', next: 'demo', nav: 'main', footer: 'company', index: true },
  { id: 'about', slug: { en: 'about', nl: 'over-ons', fr: 'a-propos' }, template: 'about', parent: 'home', next: 'demo', nav: 'main', footer: 'company', index: true },
  { id: 'security', slug: { en: 'security', nl: 'beveiliging', fr: 'securite' }, template: 'security', parent: 'home', next: 'demo', footer: 'company', index: true },

  { id: 'demo', slug: { en: 'demo', nl: 'demo', fr: 'demo' }, template: 'demo', parent: 'home', next: 'demo-confirmed', index: true },
  { id: 'demo-confirmed', slug: { en: 'demo/confirmed', nl: 'demo/bevestigd', fr: 'demo/confirme' }, template: 'confirmed', parent: 'demo', next: 'product', index: false },

  { id: 'privacy', slug: { en: 'privacy', nl: 'privacy', fr: 'confidentialite' }, template: 'legal', parent: 'home', next: 'home', footer: 'legal', index: true },
  { id: 'terms', slug: { en: 'terms', nl: 'voorwaarden', fr: 'conditions' }, template: 'legal', parent: 'home', next: 'home', footer: 'legal', index: true },

  { id: 'not-found', slug: { en: '404', nl: 'nl/404', fr: 'fr/404' }, template: 'notFound', next: 'home', index: false, special: '404' },
];

export const pageById = new Map(pages.map((p) => [p.id, p]));

export function getPage(id) {
  const page = pageById.get(id);
  if (!page) throw new Error(`Unknown page id "${id}"`);
  return page;
}

// Public URL path of a page in a language: '/', '/pricing/', '/nl/prijzen/'.
export function pathFor(id, lang, defaultLang = 'en') {
  const page = getPage(id);
  const slug = page.slug[lang];
  if (slug === undefined) throw new Error(`Page "${id}" has no slug for "${lang}"`);
  if (page.special === '404') return lang === defaultLang ? '/404.html' : `/${lang}/404.html`;
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return slug === '' ? `${prefix}/` : `${prefix}/${slug}/`;
}

// The chain from the homepage down to this page, for breadcrumbs.
export function ancestry(id) {
  const chain = [];
  let current = pageById.get(id);
  while (current) {
    chain.unshift(current);
    current = current.parent ? pageById.get(current.parent) : null;
  }
  return chain;
}
