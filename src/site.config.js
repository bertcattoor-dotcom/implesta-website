// Site-wide settings. Changing a value here changes it everywhere it is used, and nowhere else.

export const site = {
  url: 'https://implesta.com',
  name: 'implesta',

  // English lives at the root (/), Dutch at /nl/, French at /fr/.
  // A language is built, linked and listed in the sitemap only when `enabled` is true,
  // and the build fails if an enabled language is missing a page (see scripts/check.mjs).
  defaultLang: 'en',
  languages: [
    { code: 'en', hreflang: 'en', label: 'EN', name: 'English', enabled: true },
    { code: 'nl', hreflang: 'nl-BE', label: 'NL', name: 'Nederlands', enabled: false },
    { code: 'fr', hreflang: 'fr-BE', label: 'FR', name: 'Français', enabled: false },
  ],

  // Plausible (cookieless, EU-hosted). Only included in production builds: PLAUSIBLE=1 npm run build.
  analytics: {
    plausibleDomain: 'implesta.com',
    scriptSrc: 'https://plausible.io/js/script.js',
  },

  // Content limits enforced by the checks.
  limits: {
    titleMax: 60,
    descriptionMax: 155,
  },
};

export const enabledLanguages = () => site.languages.filter((l) => l.enabled);
