// Comprehensive page scanner: visits one concrete URL per route type,
// captures fatal console/page errors, and reports a per-page table.
// Serves the prerendered dist with SPA fallback (same as smoke-test.mjs).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain','.map':'application/json','.webp':'image/webp' };

const server = http.createServer((req, res) => {
  let fp = path.join(dist, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html'); // SPA fallback
  try {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(fs.readFileSync(fp));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});

// One concrete URL per route type. Dynamic params use real prerendered slugs.
const ROUTES = [
  '/', '/about', '/advertise', '/contact', '/editorial-policy', '/privacy-policy',
  '/risk-disclaimer', '/terms', '/sitemap',
  '/airdrops', '/airdrops/eigenlayer',
  '/chain/arbitrum', '/chain/base', '/chain/ethereum',
  '/compare', '/compare/aave-vs-maker',
  '/crypto-factory', '/factory', '/factory/events', '/factory/narratives', '/factory/news', '/factory/onchain',
  '/how-to-buy', '/how-to-buy/aave', '/how-to-buy/bitcoin',
  '/insights', '/insights/how-to-read-the-crypto-fear-and-greed-index',
  '/learn',
  '/market/altcoin-season-index', '/market/best-altcoins-to-buy',
  '/news',
  '/polymarket', '/predictions',
  '/price-prediction', '/price-prediction/bitcoin', '/price-prediction/ethereum',
  '/price-prediction/bitcoin/2026', '/price-prediction/bitcoin/2030',
  '/q/1inch-forecast-today', '/q/1inch-buy-or-sell',
  '/scanner', '/sentiment', '/crypto-strength-meter', '/strength', '/strength-meter',
  '/explorer', '/explorer/ethereum/0xdAC17F958D2ee523a2206206994597C13D831ec7',
  '/tools', '/tools/dca-calculator', '/tools/impermanent-loss-calculator', '/tools/profit-calculator',
  '/trade', '/dashboard',
  '/my', '/my/watchlist', '/my/portfolio', '/my/alerts', '/my/copy', '/my/dca',
  '/my/journal', '/my/news', '/my/scanner', '/my/settings', '/my/signals', '/my/social', '/my/tracker',
  '/this-route-does-not-exist-404',
];

const PORT = 5077;

async function run() {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    let navOk = true;
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    } catch (e) { navOk = false; errors.push('NAV: ' + e.message); }
    await new Promise(r => setTimeout(r, 3500)); // settle: React mount + lazy chunks
    const rootLen = await page.evaluate(() => (document.querySelector('#root')?.innerHTML || '').length).catch(() => 0);
    const stillBooting = await page.evaluate(() => !!document.getElementById('boot-fallback')).catch(() => false);
    await page.close();
    // Ignore benign network errors (analytics/ads/3rd-party blocked, supabase data fetches in test env)
    const fatal = errors.filter(e => !/supabase|coingecko|googletag|adsbygoogle|pagead|doubleclick|net::ERR|Failed to fetch|ERR_|40[0-9]|429|5[0-9][0-9]|privy|analytics|gtag|favicon|coinzilla|bitmedia|wallet|web3|rpc|infura|alchemy|funding rates|non-JSON|fetch error/i.test(e));
    results.push({ route, rootLen, mounted: !stillBooting && rootLen > 800, navOk, fatal });
  }

  await browser.close();
  server.close();

  let failures = 0;
  console.log('\n  ROUTE                                                      MOUNT   #root   FATAL');
  console.log('  ' + '─'.repeat(86));
  for (const r of results) {
    const mountIcon = r.mounted ? '✅' : '❌';
    const fatalCount = r.fatal.length;
    const fatalIcon = fatalCount === 0 ? '  0' : `❌${fatalCount}`;
    if (!r.mounted || fatalCount > 0) failures++;
    console.log(`  ${r.route.padEnd(56)} ${mountIcon}    ${String(r.rootLen).padStart(7)}   ${fatalIcon}`);
    if (fatalCount > 0) r.fatal.slice(0, 3).forEach(f => console.log(`        ⮑  ${f.slice(0, 160)}`));
  }
  console.log('  ' + '─'.repeat(86));
  console.log(`\n  Scanned ${results.length} routes · ${failures === 0 ? '🎉 ALL CLEAN' : `⚠️  ${failures} route(s) with issues`}`);
  process.exit(failures === 0 ? 0 : 1);
}
run().catch(e => { console.error('scan crashed:', e); server.close(); process.exit(1); });
