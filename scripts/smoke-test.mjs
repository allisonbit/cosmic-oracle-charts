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
  if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html'); // SPA fallback
  try {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(fs.readFileSync(fp));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});

const PORT = 5055;
let failures = 0;
const log = (ok, msg) => { console.log(`${ok ? '✅' : '❌'} ${msg}`); if (!ok) failures++; };

async function test() {
  await new Promise(r => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });

  async function visit(routePath) {
    const page = await browser.newPage();
    const errors = [];
    const requests = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('request', r => requests.push(r.url()));
    // Use domcontentloaded (not networkidle0): once Privy loads it keeps live
    // websockets open, so the network never goes idle.
    await page.goto(`http://localhost:${PORT}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await new Promise(r => setTimeout(r, 4000)); // settle: let React mount + lazy chunks load
    const rootLen = await page.evaluate(() => (document.querySelector('#root')?.innerHTML || '').length);
    const bodyText = await page.evaluate(() => document.body.innerText || '');
    const stillBooting = await page.evaluate(() => !!document.getElementById('boot-fallback'));
    const privyLoaded = requests.some(u => /PrivyLayer/.test(u));
    await page.close();
    // ignore benign network errors (analytics/ads blocked, supabase fetches in test env)
    const fatal = errors.filter(e => !/supabase|coingecko|googletag|adsbygoogle|net::ERR|Failed to fetch|401|403|429|privy|analytics|gtag|favicon/i.test(e));
    return { rootLen, bodyText, stillBooting, privyLoaded, errors, fatal };
  }

  console.log('\n── Homepage (/) ──');
  const home = await visit('/');
  log(!home.stillBooting, 'React mounted (boot-fallback replaced)');
  log(home.rootLen > 1500, `#root has rendered content (${home.rootLen} chars)`);
  log(!home.privyLoaded, 'Privy/web3 NOT loaded on public homepage (deferred ✓)');
  log(home.fatal.length === 0, `no fatal console/page errors (${home.fatal.length})`);
  if (home.fatal.length) console.log('   fatal:', home.fatal.slice(0, 5));

  console.log('\n── Protected route (/my/watchlist) ──');
  const prot = await visit('/my/watchlist');
  log(!prot.stillBooting, 'React mounted');
  log(prot.privyLoaded, 'Privy WAS loaded on protected route (ensurePrivy ✓)');
  const showsAuthUI = /sign in|unlock|loading|watchlist/i.test(prot.bodyText);
  log(showsAuthUI, 'shows sign-in/auth UI without crashing');
  log(prot.fatal.length === 0, `no fatal errors (${prot.fatal.length})`);
  if (prot.fatal.length) console.log('   fatal:', prot.fatal.slice(0, 5));

  console.log('\n── A prediction page (/price-prediction/bitcoin) ──');
  const pp = await visit('/price-prediction/bitcoin');
  log(!pp.stillBooting, 'React mounted');
  log(!pp.privyLoaded, 'Privy NOT loaded on public prediction page (deferred ✓)');
  log(pp.fatal.length === 0, `no fatal errors (${pp.fatal.length})`);
  if (pp.fatal.length) console.log('   fatal:', pp.fatal.slice(0, 5));

  await browser.close();
  server.close();
  console.log(`\n${failures === 0 ? '🎉 ALL SMOKE TESTS PASSED' : `⚠️  ${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}
test().catch(e => { console.error('smoke test crashed:', e); server.close(); process.exit(1); });
