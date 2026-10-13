// Company facts: the single source for everything the site states about Implesta.
// Pages, footer, pricing and structured data all read from here.
//
// Anything written as [[...]] is a placeholder. It shows highlighted in previews,
// and `npm run check:launch` fails while any placeholder is left on the site.

export const company = {
  name: 'Implesta',
  legalName: '[[Registered legal name]]',
  enterpriseNumber: '[[Enterprise number]]',
  address: {
    street: '[[Street and number]]',
    postalCode: '[[Postcode]]',
    city: '[[City]]',
    country: 'BE',
    countryName: 'Belgium',
  },
  email: '[[Contact email, e.g. hello@implesta.com]]',
  linkedin: null, // company LinkedIn URL, used in structured data when set

  appUrl: '[[App login URL, e.g. https://app.implesta.com]]',

  founder: {
    name: 'Bert Cattoor',
    role: 'Founder',
    linkedin: null, // personal LinkedIn URL, used on About and in structured data when set
    photo: null, // e.g. '/brand/bert-cattoor.jpg' once the photo is added to public/brand/
  },

  // Booking: the Cal.com event Implesta uses for demos, e.g. 'implesta/demo'.
  // While null, the demo page shows a placeholder instead of the calendar.
  booking: {
    calLink: null,
    minutes: 30,
  },

  // Two seat types, decided 13 Oct 2026. Prices per person per month, in euro, excl. VAT.
  // Full users: anyone who sells, plans other people, approves, or works in finance or admin.
  // Team members: My Space, time and leave, their own projects and tasks, their own signals.
  pricing: {
    currency: 'EUR',
    fullUserPerMonth: 49,
    teamMemberPerMonth: 12,
    minimumFullUsers: 5,
    foundingDiscountPct: 50, // first 5 customers, first 12 months
    billing: 'Monthly, or yearly with two months free',
    minimumSeats: 'At least 5 full users. Team members have no minimum',
    onboarding: 'Setup, one import from our spreadsheet templates, a training session per role and 30 days of support are included. Moving history out of another system is quoted separately',
    contract: '[[Contract length and notice period]]',
    foundingOffer: 'Founding customers: our first 5 customers pay half price for their first 12 months, in exchange for feedback and a reference.',
    // The worked example on the pricing page. Change the numbers here, never in the content.
    example: { fullUsers: 8, teamMembers: 34 },
  },

  // Short placeholders on purpose: they appear inside sentences, e.g. "Switching takes [[X weeks]]".
  facts: {
    firmSize: '20 to 150 people',
    hostingRegion: '[[Hosting provider and region, e.g. Google Cloud in Belgium]]', // full sentence on its own
    accountingTools: '[[accounting tools connected at launch]]',
    onboardingTime: '2 to 4 weeks', // with the included onboarding; migrations take longer
    appLanguages: '[[Which languages the app itself is available in]]', // full sentence on its own
  },
};

export const isPlaceholder = (value) => typeof value === 'string' && value.includes('[[');
