// Renders print/business-cards-avery-28878.pdf from the standalone template in
// scripts/business-cards-template.html. Run `npm run cards:pdf`.
//
// Output is a two-page US Letter PDF laid out for Avery 28878 Clean Edge
// business cards (10 per sheet, 3.5in x 2in): page 1 is fronts, page 2 is
// backs. Print at 100% scale ("Actual size") with no printer margins/fit
// scaling, duplex long-edge if printing the backs.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Same fallback as render-cv-pdf.mjs: prefer the environment's pinned Chromium
// symlink when present; otherwise let Playwright resolve its own browser.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const launchOpts = existsSync(chromiumPath) ? { executablePath: chromiumPath } : {};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'business-cards-template.html');
const outputDir = path.join(__dirname, '..', 'print');
const outputPath = path.join(outputDir, 'business-cards-avery-28878.pdf');

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch(launchOpts);
try {
  const page = await browser.newPage();
  await page.goto('file://' + templatePath, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: outputPath,
    width: '8.5in',
    height: '11in',
    printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  console.log('Wrote', outputPath);
} finally {
  await browser.close();
}
