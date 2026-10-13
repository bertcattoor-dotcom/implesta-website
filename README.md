# implesta.com

The Implesta website: a static site built from content files with plain Node, no framework.
Every edit is a reviewable diff, and the checks catch changes you didn't intend before they go live.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs the dev tools (Playwright, the two font packages) |
| `npm run fonts` | Copies Inter and Outfit into `public/fonts/` (once, then commit them) |
| `npm run dev` | Preview on http://localhost:4321, rebuilds when you save a file |
| `npm run build` | Builds the site into `dist/` (no analytics) |
| `PLAUSIBLE=1 npm run build` | Production build, with analytics |
| `npm run check` | Content, links, structured data and style rules |
| `npm run check:launch` | The same, plus everything still missing before launch |
| `npm run test:visual` | Every page at phone and desktop width, compared with the approved screenshots |

## Where things live

| To change | Edit | Effect |
| --- | --- | --- |
| Words on a page | `src/content/<lang>/<page>.json` | That page only |
| Prices, company details, booking link, hosting facts | `src/company.js` | Everywhere they appear, including structured data |
| Pages, URLs, navigation, what leads where | `src/pages.js` | Navigation, breadcrumbs, sitemap, internal links |
| Languages, site URL, analytics | `src/site.config.js` | Site-wide |
| Look and layout | `src/styles/`, `src/templates/` | Every page using that component, on purpose |

Content never contains styles, and links point to page ids (`[pricing](page:pricing)`), never to URLs.
`**bold**` makes text bold. `{price}`, `{founder}`, `{minutes}` and the other `{...}` words are
filled in from `src/company.js`.

## Placeholders

Anything written as `[[...]]` is a placeholder. It shows highlighted in the preview, and
`npm run check:launch` lists every one that is left, with the pages it appears on. The site
launches when that list is empty.

## Product screenshots

Screenshots come from the app's demo environment (`pnpm demo:screens` in the Resource-Flow repo).
Copy its output into `public/screens/`:

```
public/screens/manifest.json          (from out/screens/manifest.json)
public/screens/en/<id>.avif|.webp|.png
public/screens/en/<id>@2x.avif|...
public/screens/en/<id>-narrow.avif|... (phone crops)
```

`<id>` is the shot id used in the content files (for example `stage-3-planning`). A shot that is
missing shows as a placeholder.

## Languages

English lives at the root (`/pricing/`), Dutch at `/nl/`, French at `/fr/`. To add a language:
write `src/content/nl/` with every page (same file names as `en/`), then set `enabled: true` in
`src/site.config.js`. The build refuses to run while a page is missing, so one language can't
quietly fall behind.

## Visual tests

The first time, and after any intended design change, update the approved screenshots on Linux
(CI or a Linux machine, since fonts render differently per system):
`npm run test:visual:update`, then commit `tests/visual.spec.js-snapshots/`.

## Booking and analytics

- Booking: set `company.booking.calLink` to the Cal.com event. In Cal.com, ask for name, work
  email and team size, and redirect after booking to `/demo/confirmed/`. The site passes the
  visitor's first page and referrer to the booking as metadata.
- Analytics: Plausible, cookieless. Events: `Demo CTA click` (with position), `Demo booked`,
  `Lifecycle stage`, `Log in click`, `Language switch`, `404`. Add them as goals in Plausible.

## Hosting

`firebase.json` serves `dist/` on Firebase Hosting with the site's URL rules. Any static host works.
