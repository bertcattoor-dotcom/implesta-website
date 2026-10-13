# Instructions for Claude Code

This is the implesta.com website. Read README.md first. The strategy behind it is in the
Implesta project docs (website plan, signals plan, demo company plan).

## Rules

- **Edit the narrowest thing.** Copy changes go in `src/content/`. Facts (prices, company
  details, hosting, booking) go in `src/company.js`, never typed into content. Only touch
  `src/templates/` or `src/styles/` when the request is about layout or look.
- **Link by page id**: `[text](page:pricing)`. Never write a URL to our own pages.
- **New page**: add it to `src/pages.js` (slug for every language, parent, next) and a content
  file for every enabled language. Every page must lead to a next step.
- **Signal copy** on the site must match what the app actually sends (see the signals plan).
  Never show a signal the product doesn't send.
- **No claims the product can't back up.** If a fact is unknown, write a `[[placeholder]]`.
- **Style book v2.1**: sentence case, no uppercase or letter-spaced labels, no gradients (except
  the logo), no pill badges, one primary button per section, radius 12px max, no emoji, no
  exclamation marks, none of the banned words (pivot, runway, seamless, robust, leverage, empower,
  supercharge, streamline, enterprise-grade, next-gen, unlock, holistic, synergy, formal).
- **Motion**: 200 ms ease, subtle, always off with reduced motion.
- **No new dependencies** without asking. The site builds with plain Node on purpose.

## Before you finish

Run `npm run check`. If you changed anything visual, run `npm run test:visual` and explain
every screenshot difference in the PR; update snapshots only for differences that were intended.
