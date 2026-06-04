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

// Simple static server for the SPA
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml'
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
    res.end('Error reading file: ' + err.message);
  }
});

const PORT = 8080;

// All routes to prerender for SEO
const SEO_ROUTES = [
  '/',
  '/market/best-crypto-to-buy-today',
  '/market/crypto-gainers-and-losers-today',
  '/market/crypto-bull-run-indicator',
  '/market/altcoin-season-index',
  '/learn',
  '/about',
  '/contact',
  '/airdrops',
  '/airdrops/linea',
  '/airdrops/monad',
  '/airdrops/berachain',
  '/airdrops/scroll',
  '/airdrops/hyperliquid',
  '/airdrops/zksync',
  '/airdrops/megaeth',
  '/airdrops/base',
];

async function prerenderRoute(page, route) {
  const url = `http://localhost:${PORT}${route}`;
  console.log(`Prerendering ${route} ...`);
  
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

    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    const savePath = path.join(routeDir, 'index.html');
    fs.writeFileSync(savePath, html, 'utf8');
    console.log(`✅ Saved ${savePath}`);
  } catch (err) {
    console.warn(`⚠️  Skipped ${route}: ${err.message}`);
  }
}

async function runPrerender() {
  console.log(`Starting local server on port ${PORT}...`);
  await new Promise(resolve => server.listen(PORT, resolve));

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(45000);

  for (const route of SEO_ROUTES) {
    await prerenderRoute(page, route);
  }

  await browser.close();
  server.close();
  console.log('Prerendering complete! 🎉');
}

runPrerender().catch(err => {
  console.error('Prerendering failed:', err);
  // Don't exit with error — Vite build already succeeded
  process.exit(0);
});
