// Visual tests: every page at phone and desktop width, compared with the approved screenshot.
// A change you didn't intend shows up as a failed test with a diff image.
//
// First run, or after an intended design change: the "Update visual baselines" workflow
// (.github/workflows/visual-baselines.yml) makes the files in tests/visual.spec.js-snapshots/ on
// the platform CI uses (Linux, since fonts render slightly differently per system) and pushes
// them to a branch for review.

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: 'http://localhost:4322', reducedMotion: 'reduce' },
  webServer: { command: 'PORT=4322 node scripts/serve.mjs', url: 'http://localhost:4322', reuseExistingServer: false },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  ],
});
