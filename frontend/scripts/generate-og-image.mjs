// Rasterize the editable SVG for social crawlers that do not support SVG.
// Run from frontend/: npm run generate:og (requires a Korean system font).
import puppeteer from 'puppeteer';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = new URL('../public/og-image.svg', import.meta.url);
const output = new URL('../public/og-image.png', import.meta.url);
const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setRequestInterception(true);
  page.on('request', (request) => request.abort());
  await page.setContent(`<style>body{margin:0}svg{display:block;width:1200px;height:630px}</style>${await readFile(source, 'utf8')}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: fileURLToPath(output), type: 'png' });
  console.log('Generated public/og-image.png (1200 × 630)');
} finally {
  await browser.close();
}
