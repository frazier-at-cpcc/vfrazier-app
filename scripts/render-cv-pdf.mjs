// Regenerates public/cv.pdf from the canonical /cv page so the download always
// reflects the site. Run `npm run cv:pdf` (which builds first). Requires the
// production build in ./dist — this script serves that build over a local HTTP
// server, loads /cv in headless Chromium, and prints it with the page's own
// `@media print` stylesheet (nav/footer/POV bar hidden).
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// In the managed remote environment the bundled Chromium revision may not match
// what this Playwright version resolves by default; fall back to the pinned
// browser symlink when it exists. Locally, Playwright resolves its own browser.
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const launchOpts = existsSync(chromiumPath) ? { executablePath: chromiumPath } : {};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const outputPath = path.join(__dirname, '..', 'public', 'cv.pdf');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.json': 'application/json',
};

async function resolveFile(urlPath) {
  // Strip query/hash, decode, and map a directory route to its index.html.
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  let candidate = path.join(distDir, clean);
  try {
    if ((await stat(candidate)).isDirectory()) candidate = path.join(candidate, 'index.html');
  } catch {
    candidate = path.join(distDir, clean, 'index.html');
  }
  return candidate;
}

const server = createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url ?? '/');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch(launchOpts);
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/cv`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: outputPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
  });
  console.log('Wrote', outputPath);
} finally {
  await browser.close();
  server.close();
}
