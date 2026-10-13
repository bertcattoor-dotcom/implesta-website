// Structured data (JSON-LD), built from the same facts and content as the visible page,
// so the two can't disagree. Fields that are still placeholders are left out.

import { site } from './site.config.js';
import { company, isPlaceholder } from './company.js';
import { ancestry, pathFor } from './pages.js';
import { plain } from './templates/html.js';

const known = (v) => v !== null && v !== undefined && v !== '' && !isPlaceholder(v);
const abs = (id, lang) => site.url + pathFor(id, lang);

function organization() {
  const org = {
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: company.name,
    url: `${site.url}/`,
    logo: `${site.url}/brand/icon-512.png`,
    founder: { '@type': 'Person', name: company.founder.name },
  };
  if (known(company.legalName)) org.legalName = company.legalName;
  if (known(company.enterpriseNumber)) org.vatID = company.enterpriseNumber;
  if (known(company.email)) org.email = company.email;
  const a = company.address;
  if (known(a.street) && known(a.city) && known(a.postalCode)) {
    org.address = { '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode, addressLocality: a.city, addressCountry: a.country };
  } else {
    org.address = { '@type': 'PostalAddress', addressCountry: a.country };
  }
  const sameAs = [company.linkedin].filter(known);
  if (sameAs.length) org.sameAs = sameAs;
  return org;
}

function software(lang, content) {
  const app = {
    '@type': 'SoftwareApplication',
    name: company.name,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Professional services automation',
    operatingSystem: 'Web',
    url: `${site.url}/`,
    description: plain(content.description),
    publisher: { '@id': `${site.url}/#organization` },
  };
  const seat = (name, amount, unitText) => ({
    '@type': 'Offer',
    name,
    price: String(amount),
    priceCurrency: company.pricing.currency,
    url: abs('pricing', lang),
    priceSpecification: { '@type': 'UnitPriceSpecification', price: String(amount), priceCurrency: company.pricing.currency, unitText, valueAddedTaxIncluded: false },
  });
  const { fullUserPerMonth, teamMemberPerMonth } = company.pricing;
  if (typeof fullUserPerMonth === 'number' && typeof teamMemberPerMonth === 'number') {
    app.offers = [
      seat('Full user', fullUserPerMonth, 'per full user per month'),
      seat('Team member', teamMemberPerMonth, 'per team member per month'),
    ];
  }
  return app;
}

function breadcrumbs(pageId, lang, contentFor) {
  const chain = ancestry(pageId);
  if (chain.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: chain.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: plain(contentFor(p.id).navLabel), item: abs(p.id, lang) })),
  };
}

export function structuredData(pageId, lang, content, contentFor) {
  const graph = [organization()];
  if (pageId === 'home') {
    graph.push({ '@type': 'WebSite', '@id': `${site.url}/#website`, name: company.name, url: `${site.url}/`, inLanguage: lang, publisher: { '@id': `${site.url}/#organization` } });
  }
  if (['home', 'product', 'pricing'].includes(pageId)) graph.push(software(lang, content));
  if (pageId === 'about') {
    const person = { '@type': 'Person', name: company.founder.name, jobTitle: company.founder.role, worksFor: { '@id': `${site.url}/#organization` } };
    if (known(company.founder.linkedin)) person.sameAs = [company.founder.linkedin];
    graph.push(person);
  }
  const crumbs = breadcrumbs(pageId, lang, contentFor);
  if (crumbs) graph.push(crumbs);
  return [{ '@context': 'https://schema.org', '@graph': graph }];
}
