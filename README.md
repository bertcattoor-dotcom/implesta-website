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

The first time, and after any intended design change, update the approved screenshots with the
**Update visual baselines** button: Actions › Update visual baselines › Run workflow, on `main`.
It makes them on the same Linux runner CI uses (fonts render differently per system) and pushes
them to a branch `visual-baselines/run-<id>`; the run's summary links to the pull request to open.
Review every image in that pull request before merging. Locally on Linux,
`npm run test:visual:update` does the same.

## Booking and analytics

- Booking: set `company.booking.calLink` to the Cal.com event. In Cal.com, ask for name, work
  email and team size, and redirect after booking to `/demo/confirmed/`. The site passes the
  visitor's first page and referrer to the booking as metadata.
- Analytics: Plausible, cookieless. Events: `Demo CTA click` (with position), `Demo booked`,
  `Lifecycle stage`, `Log in click`, `Language switch`, `404`. Add them as goals in Plausible.

## Hosting

`firebase.json` serves `dist/` on Firebase Hosting with the site's URL rules, in the Google Cloud
project `implesta-web` (organisation implesta.com). `.github/workflows/deploy.yml` deploys it:

| When | Where | Gate |
| --- | --- | --- |
| A pull request (from a branch of this repository, not a fork) | Preview channel `pr-<number>`, kept 7 days; its address is commented on the pull request | `npm run check` |
| A push to `main` | The live site | `PLAUSIBLE=1 npm run check:launch`: the production build itself, with no placeholder, missing screenshot, font or booking link left |

GitHub signs in to Google Cloud through Workload Identity Federation: no key exists. Only this
repository can sign in (checked by its numeric id and its owner's), from `main` or a pull request.

### Setting it up (once, in Cloud Shell)

1. The project, and the APIs:

   ```bash
   gcloud projects create implesta-web --organization=392013820808 --name="implesta website"
   gcloud services enable firebase.googleapis.com firebasehosting.googleapis.com iam.googleapis.com \
     iamcredentials.googleapis.com sts.googleapis.com cloudresourcemanager.googleapis.com --project implesta-web
   ```

2. Firebase, in the browser: <https://console.firebase.google.com> › **Create a project** › **Add
   Firebase to a Google Cloud project** › `implesta-web` (no Google Analytics). Then **Hosting** ›
   **Get started**, through to the end (the default site, `implesta-web.web.app`).
3. The deploy account and Workload Identity Federation:

   ```bash
   P=implesta-web; N="$(gcloud projects describe $P --format='value(projectNumber)')"
   gcloud iam service-accounts create github-deploy --project $P --display-name="GitHub Actions: implesta-website"
   SA=github-deploy@$P.iam.gserviceaccount.com
   for r in roles/firebasehosting.admin roles/serviceusage.apiKeysViewer; do
     gcloud projects add-iam-policy-binding $P --member="serviceAccount:$SA" --role=$r --condition=None --format=none
   done
   gcloud iam workload-identity-pools create github --project $P --location=global --display-name="GitHub"
   gcloud iam workload-identity-pools providers create-oidc github-actions --project $P --location=global \
     --workload-identity-pool=github --display-name="GitHub Actions: implesta-website" \
     --issuer-uri="https://token.actions.githubusercontent.com" \
     --attribute-mapping="google.subject=assertion.sub,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref,attribute.event_name=assertion.event_name" \
     --attribute-condition="assertion.repository_id == '1416440552' && assertion.repository_owner_id == '263050880' && (assertion.ref == 'refs/heads/main' || assertion.event_name == 'pull_request')"
   gcloud iam service-accounts add-iam-policy-binding $SA --project $P --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/$N/locations/global/workloadIdentityPools/github/attribute.repository_id/1416440552"
   echo "WEBSITE_WIF_PROVIDER = projects/$N/locations/global/workloadIdentityPools/github/providers/github-actions"
   ```

4. GitHub, in this repository's **Settings**: **Environments** › `production` with the deployment
   branch rule `main`; **Secrets and variables › Actions › Variables**: `WEBSITE_PROJECT_ID` =
   `implesta-web`, `WEBSITE_DEPLOY_SA` = `github-deploy@implesta-web.iam.gserviceaccount.com`,
   `WEBSITE_WIF_PROVIDER` = the line the last command printed.

Then a pull request gets a preview, and `main` goes live once `npm run check:launch` passes.
