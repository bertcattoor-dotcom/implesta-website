// One function per template. Each receives the page's content and returns the <main> body.
// The order of sections is fixed here on purpose: content decides the words, the template
// decides the structure.

import { esc, html, rich, plain } from './html.js';
import { demoButton, textLink, screen, lifecycle, faq, nextCard, founderPhoto, signalCard } from './components.js';
import { pages, pathFor, getPage } from '../pages.js';
import { company, isPlaceholder } from '../company.js';

const money = (amount, lang) => {
  if (typeof amount !== 'number') return '[[price]]';
  return new Intl.NumberFormat(lang === 'en' ? 'en-IE' : `${lang}-BE`, { style: 'currency', currency: company.pricing.currency, maximumFractionDigits: 0 }).format(amount);
};

// The pricing example is computed from company.js, so it can never disagree with the prices.
const example = () => {
  const p = company.pricing;
  const { fullUsers, teamMembers } = p.example;
  const total = fullUsers * p.fullUserPerMonth + teamMembers * p.teamMemberPerMonth;
  return { fullUsers, teamMembers, people: fullUsers + teamMembers, total, founding: total * (1 - p.foundingDiscountPct / 100) };
};

const fill = (text, lang) => String(text)
  .replaceAll('{price}', money(company.pricing.fullUserPerMonth, lang))
  .replaceAll('{teamPrice}', money(company.pricing.teamMemberPerMonth, lang))
  .replaceAll('{minimumFullUsers}', String(company.pricing.minimumFullUsers))
  .replaceAll('{foundingDiscount}', `${company.pricing.foundingDiscountPct}%`)
  .replaceAll('{exampleFull}', String(example().fullUsers))
  .replaceAll('{exampleTeam}', String(example().teamMembers))
  .replaceAll('{examplePeople}', String(example().people))
  .replaceAll('{exampleTotal}', money(example().total, lang))
  .replaceAll('{exampleFounding}', money(example().founding, lang))
  .replaceAll('{firmSize}', company.facts.firmSize)
  .replaceAll('{minutes}', String(company.booking.minutes))
  .replaceAll('{founder}', company.founder.name)
  .replaceAll('{hosting}', company.facts.hostingRegion)
  .replaceAll('{accountingTools}', company.facts.accountingTools)
  .replaceAll('{onboardingTime}', company.facts.onboardingTime)
  .replaceAll('{appLanguages}', company.facts.appLanguages)
  .replaceAll('{contract}', company.pricing.contract)
  .replaceAll('{payment}', company.pricing.payment)
  .replaceAll('{onboarding}', company.pricing.onboarding)
  .replaceAll('{minimumSeats}', company.pricing.minimumSeats)
  .replaceAll('{billing}', company.pricing.billing)
  .replaceAll('{legalName}', company.legalName)
  .replaceAll('{enterpriseNumber}', company.enterpriseNumber)
  .replaceAll('{email}', company.email);

// rich() with company facts filled in.
const r = (text, lang) => rich(fill(text, lang), lang);

function finalCta(lang, c, ui, position) {
  return html`
  <section class="section section--dark">
    <div class="container cta-band">
      <div class="cta-band__copy">
        <h2>${r(c.h2, lang)}</h2>
        <p>${r(c.text, lang)}</p>
      </div>
      ${demoButton(lang, ui.bookDemo, position, { large: true })}
    </div>
  </section>`;
}

function nextFor(pageId, lang, contentFor, ui) {
  const next = getPage(pageId).next;
  if (!next || next === 'demo') return '';
  const c = contentFor(next);
  return nextCard(lang, { id: next, title: c.navLabel || c.h1, text: c.teaser || plain(c.description) }, { label: ui.nextInFlow });
}

// --- Home ---------------------------------------------------------------------

function home({ lang, c, ui }) {
  return html`
  <section class="hero">
    <div class="container">
      <div class="hero__copy">
        <h1>${r(c.h1, lang)}</h1>
        <p class="lead">${r(c.lead, lang)}</p>
        <div class="actions">
          ${demoButton(lang, ui.bookDemo, 'hero', { large: true })}
          ${textLink(lang, c.secondaryCta.label, c.secondaryCta.target)}
        </div>
        <p class="action-note">${r(c.ctaNote, lang)}</p>
      </div>
      <div id="how-it-works">${lifecycle(c.lifecycle, lang)}</div>
    </div>
  </section>

  <section class="facts" aria-label="${esc(c.platform.label)}">
    <div class="container facts__inner">
      <span class="facts__label">${esc(c.platform.label)}</span>
      ${c.platform.items.map((item) => `<span class="facts__item">${esc(item)}</span>`)}
    </div>
  </section>
  <section class="facts facts--quiet" aria-label="${esc(c.facts.label)}">
    <div class="container facts__inner">
      ${c.facts.items.map((item) => `<span class="facts__item">${r(item, lang)}</span>`)}
    </div>
  </section>

  <section class="section">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.pullPush.h2, lang)}</h2>
      <div class="grid-2">
        <div class="column column--ruled-quiet">
          <h3 class="secondary">${esc(c.pullPush.todayTitle)}</h3>
          <ul class="bullets bullets--quiet">${c.pullPush.today.map((t) => `<li>${r(t, lang)}</li>`)}</ul>
        </div>
        <div class="column column--ruled">
          <h3>${esc(c.pullPush.withTitle)}</h3>
          <ul class="bullets">${c.pullPush.with.map((t) => `<li>${r(t, lang)}</li>`)}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--rule">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.outcomes.h2, lang)}</h2>
      <div class="grid-3">
        ${c.outcomes.items.map((o) => html`<div class="column"><h3>${esc(o.title)}</h3><p>${r(o.text, lang)}</p><p class="column__outcome">${esc(o.outcome)}</p></div>`)}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container split split--center">
      <div class="stack">
        <h2>${r(c.margin.h2, lang)}</h2>
        <p class="secondary">${r(c.margin.text, lang)}</p>
        ${textLink(lang, c.margin.link.label, c.margin.link.target)}
      </div>
      ${screen(c.margin.screen, lang)}
    </div>
  </section>

  <section class="section">
    <div class="container founder">
      ${founderPhoto()}
      <div class="stack measure">
        <h2>${r(c.founder.h2, lang)}</h2>
        <p class="lead">${r(c.founder.text, lang)}</p>
        <p class="small muted">${r(c.founder.byline, lang)}</p>
        ${textLink(lang, c.founder.link.label, c.founder.link.target)}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.switching.h2, lang)}</h2>
      <div class="grid-3">
        ${c.switching.items.map((s) => html`<div class="column"><h3>${esc(s.title)}</h3><p>${r(s.text, lang)}</p></div>`)}
      </div>
    </div>
  </section>

  <section class="section section--small">
    <div class="container next-step">
      <div class="stack">
        <h2>${r(c.price.h2, lang)}</h2>
        <p class="secondary">${r(c.price.text, lang)}</p>
      </div>
      ${textLink(lang, c.price.link.label, c.price.link.target)}
    </div>
  </section>

  <section class="section section--rule">
    <div class="container split">
      <h2>${r(c.faq.h2, lang)}</h2>
      ${faq(c.faq.items.map((q) => ({ q: q.q, a: fill(q.a, lang) })), lang)}
    </div>
  </section>

  ${finalCta(lang, c.final, ui, 'final')}`;
}

// --- Product hub --------------------------------------------------------------

function productHub({ lang, c, ui, contentFor }) {
  const children = pages.filter((p) => p.parent === 'product');
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
      <div class="actions">${demoButton(lang, ui.bookDemo, 'product-hub', { large: true })}</div>
    </div>
  </section>
  <section class="section section--small section--rule">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.flowTitle, lang)}</h2>
      <ol class="cards" style="list-style:none;padding:0;margin:0">
        ${children.map((p, i) => {
          const pc = contentFor(p.id);
          return html`<li><a class="card-link" href="${pathFor(p.id, lang)}"><span class="card-link__kicker">${esc(ui.step)} ${i + 1}</span><span class="card-link__title">${esc(pc.navLabel)}</span><span class="card-link__text">${esc(pc.teaser)}</span></a></li>`;
        })}
      </ol>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container split">
      <div class="stack">
        <h2>${r(c.signals.h2, lang)}</h2>
        <p class="secondary">${r(c.signals.text, lang)}</p>
      </div>
      <div class="stack">${c.signals.examples.map((s) => signalCard(s, lang, { to: ui.to }))}</div>
    </div>
  </section>
  <section class="section">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.also.h2, lang)}</h2>
      <div class="grid-3">${c.also.items.map((s) => html`<div class="column"><h3>${esc(s.title)}</h3><p>${r(s.text, lang)}</p></div>`)}</div>
    </div>
  </section>
  ${finalCta(lang, c.final, ui, 'product-hub-final')}`;
}

// --- Product page -------------------------------------------------------------

function productPage({ lang, c, ui, pageId, contentFor }) {
  return html`
  <section class="hero">
    <div class="container stack stack--large">
      <div class="hero__copy">
        <h1>${r(c.h1, lang)}</h1>
        <p class="lead">${r(c.lead, lang)}</p>
        <div class="actions">${demoButton(lang, ui.bookDemo, pageId, { large: true })}</div>
      </div>
      ${screen(c.heroScreen, lang, { tall: true, eager: true })}
    </div>
  </section>

  <section class="section section--rule">
    <div class="container">
      ${c.features.map((f, i) => html`
      <div class="feature${i % 2 ? ' feature--flip' : ''}">
        <div class="feature__copy"><h2>${esc(f.title)}</h2><p>${r(f.text, lang)}</p></div>
        ${screen(f.screen, lang)}
      </div>`)}
    </div>
  </section>

  ${c.signals ? html`
  <section class="section section--tint">
    <div class="container split">
      <div class="stack"><h2>${r(c.signals.h2, lang)}</h2><p class="secondary">${r(c.signals.text, lang)}</p></div>
      <div class="stack">${c.signals.items.map((s) => signalCard(s, lang, { to: ui.to }))}</div>
    </div>
  </section>` : ''}

  <section class="section">
    <div class="container split">
      <h2>${r(c.details.h2, lang)}</h2>
      <dl class="properties">${c.details.items.map((d) => html`<div><dt>${esc(d.term)}</dt><dd>${r(d.value, lang)}</dd></div>`)}</dl>
    </div>
  </section>

  <section class="section section--small section--rule">
    <div class="container next-step">
      ${nextFor(pageId, lang, contentFor, ui)}
      ${demoButton(lang, ui.bookDemo, `${pageId}-next`, { large: true })}
    </div>
  </section>`;
}

// --- Audience pages -----------------------------------------------------------

function audienceHub({ lang, c, ui, contentFor }) {
  const children = pages.filter((p) => p.parent === 'for');
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
    </div>
  </section>
  <section class="section section--small section--rule">
    <div class="container cards">
      ${children.map((p) => {
        const pc = contentFor(p.id);
        return html`<a class="card-link" href="${pathFor(p.id, lang)}"><span class="card-link__title">${esc(pc.navLabel)}</span><span class="card-link__text">${esc(pc.teaser)}</span></a>`;
      })}
    </div>
  </section>
  <section class="section section--tint">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.common.h2, lang)}</h2>
      <div class="grid-3">${c.common.items.map((s) => html`<div class="column"><h3>${esc(s.title)}</h3><p>${r(s.text, lang)}</p></div>`)}</div>
    </div>
  </section>
  ${finalCta(lang, c.final, ui, 'for-hub-final')}`;
}

function audiencePage({ lang, c, ui, pageId }) {
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
      <div class="actions">${demoButton(lang, ui.bookDemo, pageId, { large: true })}</div>
    </div>
  </section>
  <section class="section section--rule">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.situations.h2, lang)}</h2>
      <div class="grid-3">${c.situations.items.map((s) => html`<div class="column column--ruled"><h3>${esc(s.title)}</h3><p>${r(s.text, lang)}</p></div>`)}</div>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container split">
      <div class="stack"><h2>${r(c.signals.h2, lang)}</h2><p class="secondary">${r(c.signals.text, lang)}</p></div>
      <div class="stack">${c.signals.items.map((s) => signalCard(s, lang, { to: ui.to }))}</div>
    </div>
  </section>
  <section class="section">
    <div class="container stack stack--large">
      <h2 class="measure">${r(c.where.h2, lang)}</h2>
      <div class="cards">${c.where.items.map((w) => html`<a class="card-link" href="${pathFor(w.page, lang)}"><span class="card-link__title">${esc(w.title)}</span><span class="card-link__text">${esc(w.text)}</span></a>`)}</div>
    </div>
  </section>
  ${finalCta(lang, c.final, ui, `${pageId}-final`)}`;
}

// --- Pricing ------------------------------------------------------------------

function pricing({ lang, c, ui }) {
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
    </div>
  </section>
  <section class="section section--small" style="padding-top:0">
    <div class="container split split--even">
      <div class="panel">
        ${c.plan.seats.map((s) => html`
        <div class="seat">
          <h2 class="seat__name">${esc(s.name)}</h2>
          <div class="price"><span class="price__amount">${r(s.price, lang)}</span><span class="price__unit">${esc(c.plan.unit)}</span></div>
          <p class="secondary">${r(s.text, lang)}</p>
        </div>`)}
        <p class="secondary small">${r(c.plan.terms, lang)}</p>
        ${company.pricing.foundingOffer ? `<p>${esc(company.pricing.foundingOffer)}</p>` : ''}
        ${demoButton(lang, ui.bookDemo, 'pricing', { large: true })}
        <ul class="list-plain list-plain--ruled">${c.plan.included.map((i) => `<li>${r(i, lang)}</li>`)}</ul>
      </div>
      <div class="stack">
        <h2 style="font-size:1.5rem">${r(c.example.h2, lang)}</h2>
        <p class="secondary">${r(c.example.text, lang)}</p>
      </div>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container split">
      <h2>${r(c.faq.h2, lang)}</h2>
      ${faq(c.faq.items.map((q) => ({ q: q.q, a: fill(q.a, lang) })), lang)}
    </div>
  </section>
  ${finalCta(lang, c.final, ui, 'pricing-final')}`;
}

// --- About --------------------------------------------------------------------

function about({ lang, c, ui }) {
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
    </div>
  </section>
  <section class="section section--rule">
    <div class="container founder">
      ${founderPhoto()}
      <div class="prose">${c.story.map((p) => `<p>${r(p, lang)}</p>`)}</div>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container split">
      <h2>${r(c.company.h2, lang)}</h2>
      <dl class="properties">${c.company.items.map((d) => html`<div><dt>${esc(d.term)}</dt><dd>${r(d.value, lang)}</dd></div>`)}</dl>
    </div>
  </section>
  ${finalCta(lang, c.final, ui, 'about-final')}`;
}

// --- Security -----------------------------------------------------------------

function security({ lang, c, ui }) {
  return html`
  <section class="hero">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
    </div>
  </section>
  <section class="section section--rule">
    <div class="container">
      <dl class="properties" style="grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));gap:40px 64px">
        ${c.items.map((d) => html`<div><dt style="font-size:1.125rem;color:var(--text);font-weight:600">${esc(d.term)}</dt><dd class="secondary" style="margin-top:8px">${r(d.value, lang)}</dd></div>`)}
      </dl>
    </div>
  </section>
  ${finalCta(lang, c.final, ui, 'security-final')}`;
}

// --- Book a demo --------------------------------------------------------------

function demo({ lang, c }) {
  const cal = company.booking.calLink;
  const booking = cal
    ? html`<div class="panel booking" id="booking" data-cal-link="${esc(cal)}" data-confirmed="${pathFor('demo-confirmed', lang)}"><noscript><a href="https://cal.com/${esc(cal)}">${esc(c.noscript)}</a></noscript></div>`
    : html`<div class="panel panel--quiet booking booking--placeholder" id="booking"><mark class="todo" data-todo>Booking calendar: set company.booking.calLink to the Cal.com event (name, work email, team size; redirect after booking to ${pathFor('demo-confirmed', lang)})</mark></div>`;
  return html`
  <section class="section section--small" style="padding-top:48px">
    <div class="container demo-layout">
      <div class="stack" style="gap:28px">
        <h1>${r(c.h1, lang)}</h1>
        <p class="lead">${r(c.lead, lang)}</p>
        <div class="stack" style="gap:12px">
          <h2 style="font-family:var(--font-sans);font-size:1.125rem;letter-spacing:0">${esc(c.agendaTitle)}</h2>
          <ol class="bullets secondary">${c.agenda.map((a) => `<li>${r(a, lang)}</li>`)}</ol>
          <p class="small muted">${r(c.note, lang)}</p>
        </div>
        <div class="host">
          ${founderPhoto('host__photo')}
          <div><div style="font-weight:500">${esc(company.founder.name)}</div><div class="small muted">${r(c.hostRole, lang)}</div></div>
        </div>
      </div>
      ${booking}
    </div>
  </section>`;
}

function confirmed({ lang, c, ui }) {
  return html`
  <section class="section">
    <div class="container stack stack--large">
      <div class="hero__copy">
        <h1>${r(c.h1, lang)}</h1>
        <p class="lead">${r(c.lead, lang)}</p>
      </div>
      <div class="split">
        <h2 style="font-size:1.5rem">${esc(c.prepareTitle)}</h2>
        <ul class="bullets secondary">${c.prepare.map((p) => `<li>${r(p, lang)}</li>`)}</ul>
      </div>
      <div class="cards">${c.links.map((l) => html`<a class="card-link" href="${pathFor(l.page, lang)}"><span class="card-link__title">${esc(l.title)}</span><span class="card-link__text">${esc(l.text)}</span></a>`)}</div>
    </div>
  </section>`;
}

// --- Legal and 404 ------------------------------------------------------------

function legal({ lang, c }) {
  return html`
  <section class="section section--small">
    <div class="container stack stack--large">
      <div class="hero__copy"><h1>${r(c.h1, lang)}</h1><p class="lead">${r(c.lead, lang)}</p></div>
      <div class="prose">${c.sections.map((s) => html`<h2>${esc(s.h2)}</h2>${s.paragraphs.map((p) => `<p>${r(p, lang)}</p>`)}`)}</div>
    </div>
  </section>`;
}

function notFound({ lang, c, ui }) {
  return html`
  <section class="section">
    <div class="container hero__copy">
      <h1>${r(c.h1, lang)}</h1>
      <p class="lead">${r(c.lead, lang)}</p>
      <div class="actions">${textLink(lang, c.homeLink, 'page:home')}${demoButton(lang, ui.bookDemo, '404')}</div>
    </div>
  </section>`;
}

export const templates = { home, productHub, productPage, audienceHub, audiencePage, pricing, about, security, demo, confirmed, legal, notFound };
export { fill };
