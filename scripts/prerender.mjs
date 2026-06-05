import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error("No dist/ directory found. Run 'npm run build' first.");
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url.split('?')[0]);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  } catch (err) {
    res.writeHead(500);
    res.end('Error: ' + err.message);
  }
});

const PORT = 8080;
const BASE_URL = 'https://oraclebull.com';
const TODAY = new Date().toISOString().split('T')[0];

// ──────────────────────────────────────────────────────────────────────────────
// ALL ROUTES — priority 1.0 = most important, 0.3 = least
// format: { path, priority, changefreq }
// ──────────────────────────────────────────────────────────────────────────────
const SEO_ROUTES = [
  // Core pages
  { path: '/',                              priority: '1.0', changefreq: 'daily' },
  { path: '/dashboard',                     priority: '0.9', changefreq: 'daily' },
  { path: '/predictions',                   priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction',             priority: '0.9', changefreq: 'daily' },
  { path: '/sentiment',                     priority: '0.8', changefreq: 'daily' },
  { path: '/airdrops',                      priority: '0.9', changefreq: 'daily' },
  { path: '/strength-meter',               priority: '0.8', changefreq: 'daily' },
  { path: '/explorer',                      priority: '0.8', changefreq: 'daily' },
  { path: '/factory',                       priority: '0.8', changefreq: 'daily' },
  { path: '/tools',                         priority: '0.8', changefreq: 'weekly' },
  { path: '/learn',                         priority: '0.8', changefreq: 'weekly' },
  { path: '/news',                          priority: '0.8', changefreq: 'daily' },
  { path: '/insights',                      priority: '0.8', changefreq: 'daily' },
  { path: '/compare',                       priority: '0.7', changefreq: 'weekly' },
  { path: '/how-to-buy',                   priority: '0.8', changefreq: 'weekly' },
  { path: '/scanner',                       priority: '0.7', changefreq: 'weekly' },
  { path: '/sitemap',                       priority: '0.5', changefreq: 'weekly' },
  { path: '/about',                         priority: '0.5', changefreq: 'monthly' },
  { path: '/contact',                       priority: '0.5', changefreq: 'monthly' },
  { path: '/advertise',                     priority: '0.4', changefreq: 'monthly' },
  { path: '/privacy-policy',              priority: '0.3', changefreq: 'monthly' },
  { path: '/terms',                         priority: '0.3', changefreq: 'monthly' },
  { path: '/risk-disclaimer',             priority: '0.3', changefreq: 'monthly' },
  { path: '/editorial-policy',            priority: '0.3', changefreq: 'monthly' },

  // Factory sub-pages
  { path: '/factory/events',               priority: '0.7', changefreq: 'daily' },
  { path: '/factory/onchain',              priority: '0.7', changefreq: 'daily' },
  { path: '/factory/narratives',          priority: '0.7', changefreq: 'daily' },
  { path: '/factory/news',                 priority: '0.7', changefreq: 'daily' },

  // Tools sub-pages
  { path: '/tools/profit-calculator',     priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/dca-calculator',        priority: '0.7', changefreq: 'monthly' },
  { path: '/tools/impermanent-loss-calculator', priority: '0.6', changefreq: 'monthly' },

  // ── Price Predictions — top 25 coins ──
  { path: '/price-prediction/bitcoin',    priority: '1.0', changefreq: 'daily' },
  { path: '/price-prediction/ethereum',   priority: '1.0', changefreq: 'daily' },
  { path: '/price-prediction/solana',     priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction/ripple',     priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction/bnb',        priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction/dogecoin',   priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction/cardano',    priority: '0.9', changefreq: 'daily' },
  { path: '/price-prediction/avalanche',  priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/polkadot',   priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/chainlink',  priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/shiba-inu',  priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/litecoin',   priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/tron',       priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/sui',        priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/aptos',      priority: '0.8', changefreq: 'daily' },
  { path: '/price-prediction/near',       priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/uniswap',    priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/arbitrum',   priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/optimism',   priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/polygon',    priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/pepe',       priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/cosmos',     priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/render',     priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/injective',  priority: '0.7', changefreq: 'daily' },
  { path: '/price-prediction/ton',        priority: '0.8', changefreq: 'daily' },

  // Year predictions — top 5 coins × 4 years
  { path: '/price-prediction/bitcoin/2026',  priority: '0.9', changefreq: 'weekly' },
  { path: '/price-prediction/bitcoin/2027',  priority: '0.8', changefreq: 'weekly' },
  { path: '/price-prediction/bitcoin/2028',  priority: '0.8', changefreq: 'monthly' },
  { path: '/price-prediction/bitcoin/2030',  priority: '0.8', changefreq: 'monthly' },
  { path: '/price-prediction/ethereum/2026', priority: '0.9', changefreq: 'weekly' },
  { path: '/price-prediction/ethereum/2027', priority: '0.8', changefreq: 'weekly' },
  { path: '/price-prediction/ethereum/2028', priority: '0.7', changefreq: 'monthly' },
  { path: '/price-prediction/ethereum/2030', priority: '0.7', changefreq: 'monthly' },
  { path: '/price-prediction/solana/2026',   priority: '0.8', changefreq: 'weekly' },
  { path: '/price-prediction/solana/2027',   priority: '0.7', changefreq: 'monthly' },
  { path: '/price-prediction/ripple/2026',   priority: '0.8', changefreq: 'weekly' },
  { path: '/price-prediction/dogecoin/2026', priority: '0.8', changefreq: 'weekly' },

  // ── Chain pages ──
  { path: '/chain/bitcoin',          priority: '0.8', changefreq: 'daily' },
  { path: '/chain/ethereum',         priority: '0.8', changefreq: 'daily' },
  { path: '/chain/solana',           priority: '0.8', changefreq: 'daily' },
  { path: '/chain/bnb-smart-chain',  priority: '0.8', changefreq: 'daily' },
  { path: '/chain/polygon',          priority: '0.7', changefreq: 'daily' },
  { path: '/chain/avalanche',        priority: '0.7', changefreq: 'daily' },
  { path: '/chain/arbitrum',         priority: '0.7', changefreq: 'daily' },
  { path: '/chain/optimism',         priority: '0.7', changefreq: 'daily' },
  { path: '/chain/base',             priority: '0.7', changefreq: 'daily' },
  { path: '/chain/tron',             priority: '0.7', changefreq: 'daily' },
  { path: '/chain/cardano',          priority: '0.7', changefreq: 'daily' },
  { path: '/chain/sui',              priority: '0.7', changefreq: 'daily' },

  // ── Market pages ──
  { path: '/market/best-crypto-to-buy-today',            priority: '0.9', changefreq: 'daily' },
  { path: '/market/crypto-gainers-and-losers-today',     priority: '0.9', changefreq: 'daily' },
  { path: '/market/crypto-bull-run-indicator',           priority: '0.8', changefreq: 'daily' },
  { path: '/market/altcoin-season-index',                priority: '0.8', changefreq: 'daily' },
  { path: '/market/crypto-market-prediction-today',      priority: '0.8', changefreq: 'daily' },
  { path: '/market/top-crypto-gainers-today',            priority: '0.8', changefreq: 'daily' },
  { path: '/market/next-crypto-to-explode',              priority: '0.8', changefreq: 'daily' },
  { path: '/market/best-altcoins-to-buy-now',           priority: '0.8', changefreq: 'daily' },

  // ── How to Buy ──
  { path: '/how-to-buy/bitcoin',      priority: '0.8', changefreq: 'monthly' },
  { path: '/how-to-buy/ethereum',     priority: '0.8', changefreq: 'monthly' },
  { path: '/how-to-buy/solana',       priority: '0.7', changefreq: 'monthly' },
  { path: '/how-to-buy/dogecoin',     priority: '0.7', changefreq: 'monthly' },
  { path: '/how-to-buy/cardano',      priority: '0.7', changefreq: 'monthly' },
  { path: '/how-to-buy/ripple',       priority: '0.7', changefreq: 'monthly' },
  { path: '/how-to-buy/shiba-inu',    priority: '0.7', changefreq: 'monthly' },
  { path: '/how-to-buy/bnb',          priority: '0.7', changefreq: 'monthly' },

  // ── Compare pages ──
  { path: '/compare/bitcoin-vs-ethereum',   priority: '0.7', changefreq: 'weekly' },
  { path: '/compare/bitcoin-vs-solana',     priority: '0.7', changefreq: 'weekly' },
  { path: '/compare/ethereum-vs-solana',    priority: '0.7', changefreq: 'weekly' },
  { path: '/compare/cardano-vs-solana',     priority: '0.6', changefreq: 'weekly' },
  { path: '/compare/dogecoin-vs-shiba-inu', priority: '0.6', changefreq: 'weekly' },

  // ── Airdrop guides ──
  { path: '/airdrops/linea',       priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/monad',       priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/berachain',   priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/scroll',      priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/hyperliquid', priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/zksync',      priority: '0.7', changefreq: 'weekly' },
  { path: '/airdrops/megaeth',     priority: '0.8', changefreq: 'weekly' },
  { path: '/airdrops/base',        priority: '0.8', changefreq: 'weekly' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Sitemap XML generator
// ──────────────────────────────────────────────────────────────────────────────
function generateSitemap(routes) {
  const urls = routes.map(r => `
  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Robots.txt generator
// ──────────────────────────────────────────────────────────────────────────────
function generateRobots() {
  return `User-agent: *
Allow: /

# Block private/auth pages
Disallow: /admin
Disallow: /my/
Disallow: /api/

# Allow all bots on public content
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Prerender single route
// ──────────────────────────────────────────────────────────────────────────────
async function prerenderRoute(page, route) {
  const url = `http://localhost:${PORT}${route}`;
  console.log(`⏳ Prerendering ${route} ...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.waitForFunction(() => {
      const root = document.querySelector('#root');
      return root && root.innerHTML.length > 200;
    }, { timeout: 15000 }).catch(() =>
      console.warn(`⚠️  Hydration timeout on ${route} — saving anyway`)
    );
    const html = await page.content();
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
    console.log(`✅ ${route}`);
  } catch (err) {
    console.warn(`⚠️  Skipped ${route}: ${err.message}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function runPrerender() {
  // NOTE: sitemap.xml and robots.txt are served from public/ — Vite copies them
  // to dist/ automatically during build. Do NOT overwrite them here.

  console.log(`\nStarting local server on port ${PORT}...`);
  await new Promise(resolve => server.listen(PORT, resolve));

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(45000);

  console.log(`\n📄 Prerendering ${SEO_ROUTES.length} pages...\n`);
  for (const route of SEO_ROUTES) {
    await prerenderRoute(page, route.path);
  }

  await browser.close();
  server.close();
  console.log(`\n🎉 Prerendering complete! ${SEO_ROUTES.length} pages rendered.`);
  console.log(`📍 Sitemap: ${BASE_URL}/sitemap.xml`);
}

runPrerender().catch(err => {
  console.error('Prerendering failed:', err);
  process.exit(0);
});
