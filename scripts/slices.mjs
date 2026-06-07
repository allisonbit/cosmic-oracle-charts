import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'shots');
fs.mkdirSync(outDir, { recursive: true });
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.map':'application/json' };
const server = http.createServer((req, res) => {
  let fp = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html');
  try { res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(fs.readFileSync(fp)); }
  catch (e) { res.writeHead(500); res.end(String(e)); }
});
const PORT = 5099;
const route = process.argv[2] || '/';
const run = async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
  await new Promise(r => setTimeout(r, 5000));
  // scroll to bottom slowly to trigger lazy sections
  await page.evaluate(async () => { for (let y=0; y<document.body.scrollHeight; y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,120)); } window.scrollTo(0,0); });
  await new Promise(r => setTimeout(r, 1500));
  const total = await page.evaluate(() => document.body.scrollHeight);
  const vh = 900; let i = 0;
  for (let y = 0; y < total; y += vh) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, `slice_${String(i).padStart(2,'0')}.png`) });
    i++;
  }
  console.log(`captured ${i} slices, total height ${total}px`);
  await browser.close(); server.close();
};
run().catch(e => { console.error(e); server.close(); process.exit(1); });
