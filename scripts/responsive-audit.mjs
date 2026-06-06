import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.map':'application/json' };
const server = http.createServer((req, res) => {
  let fp = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html');
  try { res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(fs.readFileSync(fp)); }
  catch (e) { res.writeHead(500); res.end(String(e)); }
});
const PORT = 5066;

const VIEWPORTS = [
  { name: 'mobile-360', w: 360, h: 740 },
  { name: 'mobile-390', w: 390, h: 844 },
  { name: 'tablet-768', w: 768, h: 1024 },
  { name: 'desktop-1280', w: 1280, h: 800 },
];
const ROUTES = process.argv[2]
  ? process.argv[2].split(',')
  : ['/', '/dashboard', '/predictions', '/price-prediction/bitcoin', '/strength-meter', '/sentiment',
     '/explorer', '/scanner', '/factory', '/market/best-crypto-to-buy-today', '/chain/ethereum',
     '/learn', '/news', '/tools/profit-calculator', '/compare', '/how-to-buy', '/airdrops',
     '/about', '/contact', '/my/watchlist', '/trade'];

async function run() {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const findings = [];

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1, isMobile: vp.w < 768, hasTouch: vp.w < 768 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 40000 });
        await new Promise(r => setTimeout(r, 3500)); // let React mount + data settle
      } catch (e) { findings.push({ route, vp: vp.name, overflow: -1, note: 'NAV TIMEOUT', offenders: [] }); await page.close(); continue; }

      const result = await page.evaluate((vw) => {
        const overflow = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - document.documentElement.clientWidth;
        // Root overflow-x:hidden clips content, so scan for elements that are
        // themselves WIDER than the viewport (they get cut off on mobile),
        // excluding ones inside a legitimate horizontal-scroll container.
        const insideScroller = (el) => {
          let p = el.parentElement;
          while (p && p !== document.body) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'auto' || ox === 'scroll') return true;
            p = p.parentElement;
          }
          return false;
        };
        const offenders = [];
        const isMarquee = (el) => { // intentional animated ticker inside overflow-hidden
          let p = el;
          while (p && p !== document.body) {
            const c = typeof p.className === 'string' ? p.className : '';
            if (/\bticker\b|marquee|animate-(scroll|marquee)/.test(c)) return true;
            p = p.parentElement;
          }
          return false;
        };
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') continue;
          const cls = (typeof el.className === 'string' ? el.className : '').slice(0, 100);
          if (el.clientWidth <= 2) continue;                 // sr-only / visually hidden
          if (/sr-only|sidebar/.test(cls)) continue;         // a11y + collapsed offscreen sidebar
          if (isMarquee(el)) continue;                        // animated price ticker
          // Overflow ORIGIN: element fits the viewport but its content (children)
          // is wider than it, and it is NOT a designated scroller.
          const fitsViewport = el.clientWidth <= vw + 4;
          const contentOverflows = el.scrollWidth > el.clientWidth + 8;
          const ox = cs.overflowX;
          // True origin = element does NOT clip its own overflow (overflow-x:visible)
          // yet its children are wider than it, so the overflow propagates to root.
          if (fitsViewport && contentOverflows && ox === 'visible' && !insideScroller(el)) {
            offenders.push({ tag: el.tagName.toLowerCase(), cls, cw: el.clientWidth, sw: el.scrollWidth });
          }
        }
        const map = new Map();
        for (const o of offenders) { const k = o.tag + '|' + o.cls; if (!map.has(k) || (map.get(k).sw - map.get(k).cw) < (o.sw - o.cw)) map.set(k, o); }
        return { overflow, offenders: [...map.values()].sort((a,b)=>(b.sw-b.cw)-(a.sw-a.cw)).slice(0, 8) };
      }, vp.w);

      if ((result.offenders && result.offenders.length) || result.overflow > 2 || errors.length) {
        findings.push({ route, vp: vp.name, overflow: result.overflow, errors: errors.slice(0,2), offenders: result.offenders });
      }
      await page.close();
    }
  }

  await browser.close();
  server.close();

  if (!findings.length) { console.log('✅ No horizontal overflow or page errors at any viewport.'); return; }
  console.log(`⚠️  ${findings.length} issue group(s):\n`);
  for (const f of findings) {
    console.log(`■ ${f.route}  [${f.vp}]  overflow=${f.overflow}px${f.errors?.length ? '  ERRORS:'+JSON.stringify(f.errors) : ''}`);
    for (const o of (f.offenders||[])) console.log(`    <${o.tag}> client=${o.cw} content=${o.sw} (+${o.sw-o.cw})  class="${o.cls}"`);
  }
}
run().catch(e => { console.error('audit crashed:', e); server.close(); process.exit(1); });
