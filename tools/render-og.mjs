/* Renders tools/og-card.html to site/assets/og.jpg (1200×630).
 *
 *   node tools/render-og.mjs
 *
 * JPEG, not PNG: WhatsApp only renders the large link preview when the image
 * is comfortably small (a few hundred KB); a PNG of two photographs blows past
 * that and the preview silently degrades to a tiny thumbnail or nothing.
 *
 * Needs playwright-core and the Chromium at PLAYWRIGHT_BROWSERS_PATH.
 */
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const OUT = path.join(repo, 'site/assets/og.jpg');
const PORT = 8199;

// inline the font so the render is network-independent
const html = fs.readFileSync(path.join(here, 'og-card.html'), 'utf8')
  .replace('__FONT__', fs.readFileSync(path.join(here, 'frl.b64'), 'utf8').trim());

const types = { '.html':'text/html', '.css':'text/css', '.png':'image/png', '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/tools/og-card.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  const file = path.join(repo, url);
  if (!file.startsWith(repo) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const exe = fs.readdirSync('/opt/pw-browsers').filter(d => d.startsWith('chromium-'))
  .map(d => `/opt/pw-browsers/${d}/chrome-linux/chrome`).find(p => fs.existsSync(p));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${PORT}/tools/og-card.html`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);

await page.locator('.card').screenshot({ path: OUT, type: 'jpeg', quality: 88 });
await browser.close();
server.close();

const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`wrote ${path.relative(repo, OUT)} — ${kb} KB`);
if (kb > 300) console.log('WARNING: over 300 KB — WhatsApp may skip the large preview.');
