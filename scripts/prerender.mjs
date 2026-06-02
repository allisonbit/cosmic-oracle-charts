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

// 1. Create a simple static server for the SPA
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
    // SPA Fallback
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

// The routes we want to prerender for SEO
const SEO_ROUTES = [
  '/',
  '/market/best-crypto-to-buy-today',
  '/market/crypto-gainers-and-losers-today',
  '/market/crypto-bull-run-indicator',
  '/market/altcoin-season-index',
  '/learn',
  '/about',
  '/contact'
];

async function runPrerender() {
  console.log(`Starting local server on port ${PORT}...`);
  await new Promise(resolve => server.listen(PORT, resolve));

  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (const route of SEO_ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    console.log(`Prerendering ${route} ...`);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for the main content to render (ensuring React has hydrated)
    await page.waitForFunction(() => {
      const root = document.querySelector('#root');
      return root && root.innerHTML.length > 500;
    }, { timeout: 10000 }).catch(() => console.warn(`Timeout waiting for React hydration on ${route}`));

    let html = await page.content();
    
    // Determine the save path
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    const savePath = path.join(routeDir, 'index.html');
    
    fs.writeFileSync(savePath, html, 'utf8');
    console.log(`✅ Saved ${savePath}`);
  }

  await browser.close();
  server.close();
  console.log("Prerendering complete! 🎉");
}

runPrerender().catch(err => {
  console.error("Prerendering failed:", err);
  process.exit(1);
});
