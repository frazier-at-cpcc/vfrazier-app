import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'og-image-template.html');
const outputPath = path.join(__dirname, '..', 'public', 'og-default.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('file://' + templatePath);
// Give @import url() time to resolve the Inter web font.
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await page.screenshot({ path: outputPath, omitBackground: false, type: 'png' });
await browser.close();
console.log('Wrote', outputPath);
