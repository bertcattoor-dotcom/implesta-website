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

  pricing: {
    currency: 'EUR',
    perUserPerMonth: null, // number, e.g. 39. Shown on Pricing and the homepage, and in structured data.
    billing: '[[Monthly or yearly, and any yearly discount]]',
    minimumSeats: '[[Minimum number of users, if any]]',
    onboarding: '[[What onboarding costs, or "included"]]',
    contract: '[[Contract length and notice period]]',
    foundingOffer: null, // e.g. 'Founding customers get 12 months at 30% off.'
  },

  // Short placeholders on purpose: they appear inside sentences, e.g. "Switching takes [[X weeks]]".
  facts: {
    firmSize: '20 to 150 people',
    hostingRegion: '[[Hosting provider and region, e.g. Google Cloud in Belgium]]', // full sentence on its own
    accountingTools: '[[accounting tools connected at launch]]',
    onboardingTime: '[[X weeks]]',
    appLanguages: '[[Which languages the app itself is available in]]', // full sentence on its own
  },
};

export const isPlaceholder = (value) => typeof value === 'string' && value.includes('[[');
