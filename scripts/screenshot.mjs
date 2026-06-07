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
const PORT = 5077;
const routes = (process.argv[2] || '/,/dashboard,/price-prediction/bitcoin,/learn').split(',');
const full = process.argv[3] === 'full';

const run = async () => {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  for (const route of routes) {
    for (const vp of [{ n:'desktop', w:1280, h:900 }, { n:'mobile', w:390, h:844 }]) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.w<768 });
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
        await new Promise(r => setTimeout(r, 4500));
        const name = (route === '/' ? 'home' : route.replace(/[\/]/g,'_').replace(/^_/,'')) + '_' + vp.n + '.png';
        await page.screenshot({ path: path.join(outDir, name), fullPage: full && vp.n==='desktop' });
        console.log('shot', name);
      } catch (e) { console.log('FAIL', route, vp.n, e.message); }
      await page.close();
    }
  }
  await browser.close(); server.close();
  console.log('done ->', outDir);
};
run().catch(e => { console.error(e); server.close(); process.exit(1); });
