// Company facts: the single source for everything the site states about implesta.
// Pages, footer, pricing and structured data all read from here.
//
// Anything written as [[...]] is a placeholder. It shows highlighted in previews,
// and `npm run check:launch` fails while any placeholder is left on the site.

export const company = {
  name: 'implesta',
  legalName: 'CBEC', // Bert's management company runs implesta for the first customers (decided 17 Oct 2026),
  enterpriseNumber: '1005.361.844',
  address: {
    street: 'Melkerij 6',
    postalCode: '9820',
    city: 'Merelbeke-Melle',
    country: 'BE',
    countryName: 'Belgium',
  },
  // All addresses are aliases of one mailbox (decided 16 Oct 2026).
  email: 'hello@implesta.com', // general contact: About, footer, structured data
  supportEmail: 'support@implesta.com', // support for customers (terms; the app's suspended page)
  privacyEmail: 'privacy@implesta.com', // data requests and the DPA (privacy policy, DPA)
  linkedin: null, // company LinkedIn URL, used in structured data when set

  appUrl: 'https://app.implesta.com', // the app's front door: asks for the workspace

  founder: {
    name: 'Bert Cattoor',
    role: 'Founder',
    linkedin: null, // personal LinkedIn URL, used on About and in structured data when set
    photo: null, // e.g. '/brand/bert-cattoor.jpg' once the photo is added to public/brand/
    // Professional photos arrive late Nov 2026 (session on 16 Nov). Until then the site
    // launches without a photo. Set `photo` when it arrives; this flag then no longer matters.
    launchWithoutPhoto: true,
  },

  // Booking: the Cal.com event implesta uses for demos, e.g. 'implesta/demo'.
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
    contract: 'Monthly billing: cancel any time with one month\'s notice. Yearly billing: 12 months, renewing automatically unless cancelled 30 days before the renewal date. Founding customers commit to 12 months',
    payment: 'By invoice, payable by bank transfer within 30 days',
    foundingOffer: 'Founding customers: our first 5 customers pay half price for their first 12 months, in exchange for feedback and a reference.',
    // The worked example on the pricing page. Change the numbers here, never in the content.
    example: { fullUsers: 8, teamMembers: 34 },
  },

  // Short placeholders on purpose: they appear inside sentences, e.g. "Switching takes [[X weeks]]".
  facts: {
    firmSize: '20 to 150 people',
    // Only what is decided: app and database in europe-west1. Sign-in (Firebase) and email
    // (Resend, EU region) are listed as subprocessors, not covered by this sentence.
    hostingRegion: 'The app and its database run on Google Cloud in Belgium (europe-west1)', // full sentence on its own
    accountingTools: '[[accounting tools connected at launch]]',
    onboardingTime: '2 to 4 weeks', // with the included onboarding; migrations take longer
    appLanguages: '[[Which languages the app itself is available in]]', // full sentence on its own
  },
};

export const isPlaceholder = (value) => typeof value === 'string' && value.includes('[[');
