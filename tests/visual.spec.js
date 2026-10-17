import { test, expect } from '@playwright/test';
import { pages, pathFor } from '../src/pages.js';
import { enabledLanguages } from '../src/site.config.js';

// The demo page embeds Cal.com's live booking calendar: other dates every day, and markup of its own
// (it added a second h1). The tests check implesta's pages, so Cal.com stays out and the booking
// panel renders the same on every run.
test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/([a-z0-9-]+\.)?cal\.com\//, (route) => route.abort());
});

for (const { code: lang } of enabledLanguages()) {
  for (const page of pages) {
    const url = pathFor(page.id, lang);

    test(`${lang} ${page.id}`, async ({ page: browser }) => {
      await browser.goto(url, { waitUntil: 'networkidle' });
      await browser.evaluate(() => document.fonts.ready);

      // No horizontal scrolling at any width.
      const overflow = await browser.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'page scrolls sideways').toBeLessThanOrEqual(0);

      // Exactly one h1.
      await expect(browser.locator('h1')).toHaveCount(1);

      await expect(browser).toHaveScreenshot(`${lang}-${page.id}.png`, { fullPage: true });
    });
  }
}

test('lifecycle slider moves between stages', async ({ page }) => {
  await page.goto('/');
  const stages = page.locator('[data-stage]');
  await expect(stages.nth(0)).toBeVisible();
  await page.locator('[data-range]').fill('6');
  await expect(stages.nth(6)).toBeVisible();
  await expect(stages.nth(0)).toBeHidden();
});
