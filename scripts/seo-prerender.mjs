// ──────────────────────────────────────────────────────────────────────────────
// Pure-Node, NO-BROWSER static SEO prerenderer.
//
// WHY: The app is a client-rendered SPA. Without this step, every URL ships an
// empty <div id="root"> and Googlebot indexes a blank shell -> ~zero organic
// traffic. Puppeteer-based prerender can't be relied on inside Lovable's build
// sandbox (no Chrome), so this script bakes per-route <title>, meta, canonical,
// Open Graph, JSON-LD AND real visible content (H1 + copy + FAQ + internal
// links) directly into static HTML using string ops only. React replaces the
// content on mount (createRoot), so users still get the full app.
//
// Runs as part of `npm run build` (after `vite build`). It NEVER fails the build:
// any error is logged and the process exits 0.
// ──────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COIN_FACTS, SECTOR_LABELS, sectorDriver } from './coin-facts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://oraclebull.com';
const OG_IMAGE = 'https://oraclebull.com/og-image.jpg';

const now = new Date();
const MONTH = now.toLocaleString('en-US', { month: 'long' });
const YEAR = now.getFullYear();
const ISO = now.toISOString();
const TODAY = ISO.split('T')[0];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Read the /learn article corpus (plain JSON, safe to import at build time).
let EDU_ARTICLES = [];
try {
  EDU_ARTICLES = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'educational-articles.json'), 'utf8'),
  );
} catch (e) {
  console.warn('[seo-prerender] could not read educational-articles.json:', e.message);
}

// Turn an article's Markdown body into 1–2 clean plain-text intro paragraphs
// (skip headings and list blocks; strip inline markdown) so the prerendered
// HTML carries real, readable content for crawlers.
function mdToIntro(md, maxParas = 2) {
  const out = [];
  for (const block of String(md || '').split(/\n\s*\n/)) {
    let t = block.trim();
    if (!t || /^#{1,6}\s/.test(t) || /^[-*]\s/.test(t) || /^\d+\.\s/.test(t)) continue;
    t = t
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (t.length < 40) continue;
    out.push(t);
    if (out.length >= maxParas) break;
  }
  return out;
}

// Load the hand-written /insights corpus from TypeScript at build time. It only
// type-imports InsightPost, so esbuild bundles it to a self-contained ESM that we
// import via a data: URL — no temp files, no app refactor. Falls back to an empty
// list (the build never fails over this).
let INSIGHTS = [];
try {
  const esbuild = await import('esbuild');
  const res = esbuild.buildSync({
    entryPoints: [path.join(__dirname, '..', 'src', 'data', 'insightsArticles.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  });
  const code = res.outputFiles[0].text;
  const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  INSIGHTS = Array.isArray(mod.INSIGHTS_ARTICLES) ? mod.INSIGHTS_ARTICLES : [];
  console.log(`[seo-prerender] loaded ${INSIGHTS.length} insights articles from TS`);
} catch (e) {
  console.warn('[seo-prerender] insights load failed, keeping fallback:', e.message);
}

// Extract airdrop projects from airdropData.ts. The data is a const array literal,
// so rather than bundle/execute TS we lightweight-parse the top-level scalar fields
// straight from source (re-read every build → no drift).
// WHY: /airdrops links to /airdrops/{id} detail pages that were NOT prerendered,
// so crawlers hitting those internal links got a blank SPA shell. This bakes real
// content for each one (matches the /price-prediction/.../daily fix pattern).
// NOTE: the data was split out of AirdropList.tsx into airdropData.ts (commit a2b65bf);
// anchor on `= [` so the `AirdropProject[]` type annotation can't be mistaken for the
// array start (that regression silently dropped all 8 detail pages to blank shells).
let AIRDROPS = [];
try {
  const adSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'airdrops', 'airdropData.ts'), 'utf8').replace(/\r\n/g, '\n');
  const arrStart = adSrc.indexOf('= [', adSrc.indexOf('AIRDROPS_DATA')) + 2;
  const chunks = adSrc.slice(arrStart).split(/\n  \{\n/).slice(1);
  AIRDROPS = chunks.map((c) => {
    const f = (k) => (c.match(new RegExp(`\\b${k}:\\s*"([^"]*)"`)) || [])[1] || null;
    return {
      id: f('id'), name: f('name'), ticker: f('ticker'), category: f('category'),
      estValue: f('estValue'), funding: f('funding'), status: f('status'),
      difficulty: f('difficulty'), description: f('description'),
    };
  }).filter((r) => r.id && r.name);
  console.log(`[seo-prerender] parsed ${AIRDROPS.length} airdrop projects from TSX`);
} catch (e) {
  console.warn('[seo-prerender] airdrop parse failed, skipping airdrop detail pages:', e.message);
}

// ── Reference data ────────────────────────────────────────────────────────────
const COINS = [
  ['bitcoin', 'Bitcoin', 'BTC'], ['ethereum', 'Ethereum', 'ETH'], ['solana', 'Solana', 'SOL'],
  ['ripple', 'XRP', 'XRP'], ['bnb', 'BNB', 'BNB'], ['dogecoin', 'Dogecoin', 'DOGE'],
  ['cardano', 'Cardano', 'ADA'], ['avalanche', 'Avalanche', 'AVAX'], ['polkadot', 'Polkadot', 'DOT'],
  ['chainlink', 'Chainlink', 'LINK'], ['shiba-inu', 'Shiba Inu', 'SHIB'], ['litecoin', 'Litecoin', 'LTC'],
  ['tron', 'TRON', 'TRX'], ['sui', 'Sui', 'SUI'], ['aptos', 'Aptos', 'APT'], ['near', 'NEAR Protocol', 'NEAR'],
  ['uniswap', 'Uniswap', 'UNI'], ['arbitrum', 'Arbitrum', 'ARB'], ['optimism', 'Optimism', 'OP'],
  ['polygon', 'Polygon', 'POL'], ['pepe', 'Pepe', 'PEPE'], ['cosmos', 'Cosmos', 'ATOM'],
  ['render', 'Render', 'RNDR'], ['injective', 'Injective', 'INJ'], ['ton', 'Toncoin', 'TON'],
  ['stellar', 'Stellar', 'XLM'], ['hedera', 'Hedera', 'HBAR'], ['filecoin', 'Filecoin', 'FIL'],
  ['bitcoin-cash', 'Bitcoin Cash', 'BCH'], ['aave', 'Aave', 'AAVE'],
  // ── Expanded coverage ──
  ['kaspa', 'Kaspa', 'KAS'], ['monero', 'Monero', 'XMR'], ['ethereum-classic', 'Ethereum Classic', 'ETC'],
  ['vechain', 'VeChain', 'VET'], ['algorand', 'Algorand', 'ALGO'], ['internet-computer', 'Internet Computer', 'ICP'],
  ['fantom', 'Fantom', 'FTM'], ['the-graph', 'The Graph', 'GRT'], ['fetch-ai', 'Fetch.ai', 'FET'],
  ['bittensor', 'Bittensor', 'TAO'], ['sei-network', 'Sei', 'SEI'], ['immutable-x', 'Immutable', 'IMX'],
  ['maker', 'Maker', 'MKR'], ['lido-dao', 'Lido DAO', 'LDO'], ['thorchain', 'THORChain', 'RUNE'],
  ['mantle', 'Mantle', 'MNT'], ['bonk', 'Bonk', 'BONK'], ['floki', 'Floki', 'FLOKI'],
  ['dogwifcoin', 'dogwifhat', 'WIF'], ['jupiter', 'Jupiter', 'JUP'], ['worldcoin', 'Worldcoin', 'WLD'],
  ['ondo-finance', 'Ondo', 'ONDO'], ['ethena', 'Ethena', 'ENA'], ['pendle', 'Pendle', 'PENDLE'],
  ['starknet', 'Starknet', 'STRK'], ['celestia', 'Celestia', 'TIA'], ['pyth-network', 'Pyth Network', 'PYTH'],
  ['jito', 'Jito', 'JTO'], ['raydium', 'Raydium', 'RAY'], ['gala', 'Gala', 'GALA'],
  ['the-sandbox', 'The Sandbox', 'SAND'], ['decentraland', 'Decentraland', 'MANA'], ['axie-infinity', 'Axie Infinity', 'AXS'],
  ['chiliz', 'Chiliz', 'CHZ'], ['curve-dao-token', 'Curve', 'CRV'], ['synthetix', 'Synthetix', 'SNX'],
  ['1inch', '1inch', '1INCH'], ['compound', 'Compound', 'COMP'], ['dydx', 'dYdX', 'DYDX'],
  ['gmx', 'GMX', 'GMX'], ['flow', 'Flow', 'FLOW'], ['tezos', 'Tezos', 'XTZ'],
  ['eos', 'EOS', 'EOS'], ['iota', 'IOTA', 'IOTA'], ['neo', 'NEO', 'NEO'],
  ['quant-network', 'Quant', 'QNT'], ['kava', 'Kava', 'KAVA'], ['zcash', 'Zcash', 'ZEC'],
  ['dash', 'Dash', 'DASH'], ['helium', 'Helium', 'HNT'], ['arweave', 'Arweave', 'AR'],
  ['ens', 'Ethereum Name Service', 'ENS'], ['blur', 'Blur', 'BLUR'], ['jasmycoin', 'JasmyCoin', 'JASMY'],
  ['gmt', 'STEPN', 'GMT'], ['mina-protocol', 'Mina', 'MINA'], ['conflux-token', 'Conflux', 'CFX'],
  ['akash-network', 'Akash', 'AKT'], ['ordinals', 'ORDI', 'ORDI'], ['ribbon-finance', 'Ribbon', 'RBN'],
  ['rocket-pool', 'Rocket Pool', 'RPL'], ['frax', 'Frax', 'FRAX'], ['gnosis', 'Gnosis', 'GNO'],
  ['enjincoin', 'Enjin', 'ENJ'], ['theta-token', 'Theta', 'THETA'], ['nervos-network', 'Nervos', 'CKB'],
  ['singularitynet', 'SingularityNET', 'AGIX'], ['ocean-protocol', 'Ocean Protocol', 'OCEAN'],
];

// ── Coin slug aliases ──────────────────────────────────────────────────────────
// The app's internal links (Footer, MarketCategoriesHub) and the vite sitemap use
// CoinGecko IDs (e.g. "binancecoin", "avalanche-2") while the prerendered pages use
// friendly slugs (e.g. "bnb", "avalanche"). Without prerendered alias pages, those
// internal links land on a blank SPA shell for crawlers. We prerender each alias
// (base + timeframes) but point its <link rel=canonical> at the primary page, so
// crawlers get real content AND we avoid any duplicate-content signal.
const COIN_ALIASES = {
  'binancecoin': 'bnb',
  'avalanche-2': 'avalanche',
  'matic-network': 'polygon',
  'render-token': 'render',
  'injective-protocol': 'injective',
  'toncoin': 'ton',
  'xrp': 'ripple',
  'immutable': 'immutable-x',
};
const COIN_BY_SLUG = Object.fromEntries(COINS.map((c) => [c[0], c]));

// ── Per-coin factual content helpers ───────────────────────────────────────────
// Turn the evergreen COIN_FACTS dataset into UNIQUE, accurate prose per coin so
// the prediction/how-to-buy/q/compare pages stop being name-swapped boilerplate
// (was ~58% 5-gram similarity → Google Helpful-Content demotion risk). Each
// helper degrades gracefully to generic copy when a coin has no facts entry.
const SECTOR_BY_SLUG = Object.fromEntries(
  Object.entries(COIN_FACTS).map(([slug, f]) => [slug, f.sector]),
);
// Map a coin slug to up-to-N peer coins in the SAME sector (for richer, more
// relevant internal links + comparison context). Only returns coins that are in
// the prerendered COINS set, so every link lands on a real page.
function sectorPeers(slug, limit = 4) {
  const sector = SECTOR_BY_SLUG[slug];
  if (!sector) return [];
  return COINS
    .filter(([s]) => s !== slug && SECTOR_BY_SLUG[s] === sector && COIN_BY_SLUG[s])
    .slice(0, limit)
    .map(([s, n]) => [s, n]);
}
// A factual "what is X" sentence + a sector/era sentence. Returns [] if no facts.
function coinFactSentences(slug, name, sym) {
  const f = COIN_FACTS[slug];
  if (!f) return [];
  const out = [f.blurb];
  const sectorLabel = SECTOR_LABELS[f.sector] || f.cat;
  const peers = sectorPeers(slug, 3).map(([, n]) => n);
  let context = `As a ${sectorLabel}`;
  if (f.year) context += ` launched in ${f.year}`;
  if (f.consensus) context += `, ${sym} relies on ${f.consensus}`;
  context += '.';
  if (peers.length) {
    context += ` It is frequently compared with peers such as ${peers.join(', ')}.`;
  }
  out.push(context);
  return out;
}
// One factual FAQ Q/A about what the coin is (distinct per coin via the blurb).
function coinFactFaq(slug, name, sym) {
  const f = COIN_FACTS[slug];
  if (!f) return null;
  const sectorLabel = SECTOR_LABELS[f.sector] || f.cat;
  let a = f.blurb;
  if (f.year) a += ` It launched in ${f.year}`;
  if (f.consensus) a += (f.year ? ' and ' : ' It ') + `uses ${f.consensus}`;
  a += '.';
  return { q: `What is ${name} (${sym}) and how does it work?`, a };
}

const YEARS = [2026, 2027, 2028, 2030];
// Timeframe pages: [urlSegment, displayLabel, horizonWord, keywordPhrase]
const TIMEFRAMES = [
  ['daily', 'Today', 'short-term', 'today'],
  ['weekly', 'This Week', 'weekly', 'this week'],
  ['monthly', 'This Month', 'monthly', 'this month'],
];
const CHAINS = [
  ['ethereum', 'Ethereum'], ['solana', 'Solana'], ['bnb', 'BNB Chain'], ['avalanche', 'Avalanche'],
  ['polygon', 'Polygon'], ['arbitrum', 'Arbitrum'], ['base', 'Base'], ['optimism', 'Optimism'],
  ['sui', 'Sui'], ['ton', 'TON'],
];
const MARKET_PAGES = [
  'best-crypto-to-buy-today', 'top-crypto-gainers-today', 'crypto-market-prediction-today',
  'which-crypto-will-go-up-today', 'crypto-losers-today', 'is-crypto-going-up-today',
  'best-crypto-to-buy-this-week', 'crypto-prediction-this-week', 'crypto-to-watch-this-week',
  'next-crypto-to-explode', 'safest-crypto-to-invest', 'cheap-crypto-to-buy-now',
  'undervalued-crypto-to-buy', 'crypto-with-most-potential', 'best-altcoins-to-buy',
  'top-meme-coins', 'best-defi-tokens', 'top-ai-crypto-tokens', 'altcoin-season-index',
  'crypto-bull-run-indicator',
  // ── Expanded long-tail market intent ──
  'top-crypto-gainers-this-week', 'biggest-crypto-losers-this-week', 'crypto-to-buy-before-bull-run',
  'best-crypto-under-1-dollar', 'best-crypto-under-1-cent', 'best-long-term-crypto',
  'best-crypto-for-beginners', 'best-staking-crypto', 'highest-apy-crypto',
  'best-layer-2-crypto', 'best-layer-1-crypto', 'best-gaming-crypto', 'best-metaverse-crypto',
  'best-privacy-coins', 'best-rwa-crypto', 'best-depin-crypto', 'best-crypto-for-passive-income',
  'most-undervalued-crypto', 'crypto-to-hold-long-term', 'top-100-crypto',
  'which-crypto-to-buy-right-now', 'crypto-market-cap-today', 'will-crypto-crash-today',
  'crypto-market-outlook', 'crypto-bull-run-prediction', 'best-crypto-to-day-trade',
  'best-low-cap-crypto-gems', 'next-100x-crypto', 'best-crypto-presale', 'trending-crypto-today',
  'best-solana-meme-coins', 'best-base-tokens', 'best-new-crypto-coins',
];
const COMPARE_PAIRS = [
  'bitcoin-vs-ethereum', 'bitcoin-vs-solana', 'ethereum-vs-solana', 'cardano-vs-solana',
  'dogecoin-vs-shiba-inu', 'bitcoin-vs-bnb', 'ethereum-vs-cardano', 'solana-vs-avalanche',
  'xrp-vs-stellar', 'polygon-vs-arbitrum', 'near-vs-aptos', 'chainlink-vs-uniswap',
  // ── Expanded comparisons ──
  'bitcoin-vs-xrp', 'ethereum-vs-bnb', 'xrp-vs-cardano',
  'avalanche-vs-polygon', 'arbitrum-vs-optimism', 'sui-vs-aptos', 'pepe-vs-shiba-inu',
  'dogecoin-vs-pepe', 'litecoin-vs-bitcoin-cash', 'cosmos-vs-polkadot', 'fetch-ai-vs-bittensor',
  'render-vs-fetch-ai', 'injective-vs-sei-network', 'aave-vs-maker', 'uniswap-vs-curve-dao-token',
  'ethena-vs-ondo-finance', 'starknet-vs-zksync', 'ton-vs-solana', 'kaspa-vs-bitcoin',
  'tron-vs-ethereum', 'monero-vs-zcash', 'hedera-vs-stellar', 'algorand-vs-cardano',
];
// NOTE: /learn pages are emitted from the EDU_ARTICLES corpus (public/data/
// educational-articles.json) below — see LEARN_ARTICLE_SLUGS. A hardcoded
// LEARN_SLUGS list used to live here but was dead code: many of its slugs had no
// matching article, so anything that cross-linked to them produced crawl-time
// dead links. Don't reintroduce a hand-maintained learn-slug list — the corpus
// is the single source of truth.

// Curated insights articles (kept in sync with src/data/insightsArticles.ts).
const INSIGHT_SLUGS = [
  'how-to-read-the-crypto-fear-and-greed-index', 'what-whale-movements-tell-you-about-crypto',
  'how-spot-bitcoin-etfs-changed-crypto-market-structure', 'stablecoin-flows-as-a-crypto-market-signal',
  'crypto-market-cycles-and-the-four-year-theory', 'funding-rates-and-open-interest-explained',
  'tokenomics-supply-unlocks-and-emissions', 'bitcoin-dominance-and-what-it-signals-for-altcoins',
  'narrative-rotation-how-capital-moves-in-crypto', 'the-mechanics-behind-memecoin-mania',
  'restaking-and-the-yield-narrative-explained', 'real-world-assets-bringing-tradfi-on-chain',
  'how-to-spot-a-crypto-rug-pull-before-you-buy', 'dollar-cost-averaging-vs-lump-sum-in-volatile-markets',
];

// ── Question-intent (/q/) programmatic pages ─────────────────────────────────
// High-intent coins × question patterns → unique answer pages. These target the
// exact "will X go up today / should I buy X" long-tail searches. Coins are
// drawn from the prerendered coin set so every /q page links to a real page.
const Q_COINS = COINS.slice(0, 75).map(([slug, name]) => [slug, name]);
// Slugs that actually get /q/ pages — used to avoid linking to /q pages that
// don't exist (COINS has 98 entries but only the first 75 get question pages).
const Q_COIN_SLUGS = new Set(Q_COINS.map(([s]) => s));
// Each pattern: [slugTemplate, kind] — kind drives the answer copy.
const Q_PATTERNS = [
  ['{coin}-price-prediction-today', 'today'],
  ['will-{coin}-go-up-today', 'updown'],
  ['should-i-buy-{coin}-today', 'buy'],
  ['is-{coin}-a-good-investment', 'invest'],
  ['{coin}-price-prediction-this-week', 'week'],
  ['{coin}-price-prediction-this-month', 'month'],
  ['will-{coin}-go-up', 'updown'],
  ['{coin}-forecast-today', 'today'],
  ['is-{coin}-bullish-today', 'updown'],
  ['{coin}-buy-or-sell', 'buy'],
  ['will-{coin}-reach-new-highs', 'highs'],
  ['{coin}-price-target', 'today'],
  ['is-{coin}-worth-buying', 'buy'],
  ['{coin}-price-prediction-2026', 'month'],
];

const titleCase = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ── Per-route SEO + content definition ────────────────────────────────────────
// Each route -> { title, description, keywords, h1, intro:[..paras], faq:[{q,a}], links:[{href,label}], jsonld:[..] }
function faqJsonLd(faq) {
  if (!faq || !faq.length) return null;
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
function webPageJsonLd(routePath, title, description) {
  return {
    '@context': 'https://schema.org', '@type': 'WebPage',
    '@id': `${BASE_URL}${routePath}`, url: `${BASE_URL}${routePath}`,
    name: title, description, inLanguage: 'en-US',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    dateModified: ISO,
  };
}
function breadcrumbJsonLd(routePath) {
  const items = [{ name: 'Home', url: BASE_URL }];
  let url = BASE_URL;
  for (const seg of routePath.split('/').filter(Boolean)) {
    url += `/${seg}`;
    items.push({ name: titleCase(seg), url });
  }
  if (items.length < 2) return null;
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

const coinLinks = COINS.slice(0, 8).map(([slug, name]) => ({ href: `/price-prediction/${slug}`, label: `${name} Prediction` }));
const toolLinks = [
  { href: '/predictions', label: 'AI Price Predictions' },
  { href: '/strength-meter', label: 'Crypto Strength Meter' },
  { href: '/sentiment', label: 'Fear & Greed Index' },
  { href: '/scanner', label: 'Token Scanner' },
  { href: '/tools/profit-calculator', label: 'Profit Calculator' },
  { href: '/learn', label: 'Learn Crypto' },
];

const routes = {};
function add(p, def) { routes[p] = def; }

// Core pages
add('/', {
  title: 'Free AI Crypto Predictions | Oracle Bull',
  description: `Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. Updated ${MONTH} ${YEAR}. No signup needed.`,
  keywords: 'crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, best crypto to buy today',
  h1: 'Free AI Crypto Price Predictions & Market Intelligence',
  intro: [
    `Oracle Bull is a free, AI-powered cryptocurrency analytics platform. Get real-time price predictions, whale tracking, market sentiment, and on-chain intelligence for Bitcoin, Ethereum, Solana and 1,000+ tokens — no signup required.`,
    `Our models combine live market data, technical indicators, volume flow and sentiment to produce daily, weekly and monthly forecasts with confidence scores and bull/bear targets. Updated continuously, ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'Is Oracle Bull free to use?', a: 'Yes. Oracle Bull is 100% free with no signup required — including AI predictions, whale tracking, sentiment analysis and blockchain dashboards.' },
    { q: 'How accurate are the crypto predictions?', a: 'Predictions are probabilistic AI forecasts built from live market data, technical indicators and sentiment. They are research tools, not financial advice — always do your own research.' },
    { q: 'Which cryptocurrencies are covered?', a: 'Bitcoin, Ethereum, Solana, XRP, BNB and 1,000+ tokens across 8 blockchains, with dedicated prediction pages for the top coins.' },
  ],
  links: [...coinLinks, ...toolLinks],
});
add('/dashboard', {
  title: 'Crypto Dashboard | Live Prices & Signals',
  description: 'Live crypto dashboard with real-time prices, top gainers, market momentum, correlation matrix and AI insights for BTC, ETH & 1000+ altcoins.',
  keywords: 'crypto dashboard live, real time crypto prices, crypto market today, top crypto gainers today',
  h1: 'Live Crypto Dashboard',
  intro: [
    'A real-time command center for the crypto market: live prices, top gainers and losers, market-cap dominance, sector performance, a correlation matrix and live trade flow — all in one view.',
    'Track momentum across the entire market and spot rotation between sectors and assets as it happens.',
    `Instead of juggling a dozen tabs, the dashboard pulls the signals that matter — what is moving, where capital is rotating and how assets correlate — into one continuously-updating screen for ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What does the Oracle Bull crypto dashboard show?', a: 'Live prices for Bitcoin, Ethereum, Solana and 1,000+ altcoins, plus top gainers and losers, market-cap dominance, sector performance, a correlation matrix and real-time trade flow — all in a single view.' },
    { q: 'Is the crypto dashboard free and real-time?', a: 'Yes. The dashboard is 100% free with no signup, and every panel updates in real time as the market moves.' },
  ],
  links: toolLinks,
});
add('/predictions', {
  title: `AI Crypto Price Predictions – BTC, ETH & Altcoin Forecasts (${MONTH} ${YEAR})`,
  description: 'Browse AI-powered price predictions for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly forecasts with confidence scores and bull/bear targets.',
  keywords: 'crypto price prediction, bitcoin forecast today, ethereum prediction, altcoin predictions, AI crypto forecast',
  h1: `AI Crypto Price Predictions (${MONTH} ${YEAR})`,
  intro: [
    'Explore AI-powered price forecasts for the top cryptocurrencies. Each prediction page includes daily, weekly and monthly outlooks, support and resistance levels, entry zones, and bull/bear targets with confidence scores.',
    'Pick a coin below to see its full AI forecast and live technical analysis.',
    `Every forecast is rebuilt continuously from live price action, momentum, volume flow, volatility and market sentiment — so the outlook you see reflects current conditions, not a stale snapshot. Coverage spans Bitcoin, Ethereum, Solana and 90+ major altcoins for ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'How accurate are AI crypto price predictions?', a: 'These are probabilistic forecasts built from live market data, technical structure and sentiment — not guarantees. They are best used as one research input alongside your own analysis and risk management, never as financial advice.' },
    { q: 'Which cryptocurrencies have prediction pages?', a: 'Bitcoin, Ethereum, Solana, XRP, BNB and 90+ major altcoins each have dedicated pages with daily, weekly, monthly and long-term (2026–2030) forecasts.' },
    { q: 'How often are the predictions updated?', a: 'Continuously. Each prediction page refreshes its live chart and AI read as the market moves, so the daily, weekly and monthly outlooks always reflect current conditions.' },
  ],
  links: COINS.slice(0, 16).map(([s, n]) => ({ href: `/price-prediction/${s}`, label: `${n} Price Prediction` })),
});
add('/strength-meter', {
  title: `Crypto Strength Meter – Which Coin Is Strongest Right Now? (${MONTH} ${YEAR})`,
  description: `See which crypto is strongest right now. Real-time strength rankings for Bitcoin, Ethereum, Solana & 100+ assets based on momentum, volume & sentiment. Free tool. Updated ${MONTH} ${YEAR}.`,
  keywords: 'crypto strength meter, strongest cryptocurrency today, crypto momentum ranking, best performing crypto',
  h1: 'Crypto Strength Meter',
  intro: [
    'Find the strongest cryptocurrencies right now. The Strength Meter ranks coins and chains in real time using a weighted model of price momentum, volume flow, volatility, dominance change, relative performance vs BTC/ETH, sentiment and trend consistency.',
    'Use it to spot leaders and laggards before the broader market reacts.',
    `Each asset gets a single 0–100 strength score: above 60 signals an asset gaining strength, below 40 signals weakening. Rankings update live so you can catch sector rotation early and confirm entries with momentum rather than fading a trend. ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'Which crypto is strongest right now?', a: 'The leaderboard updates live and ranks every asset by a 0–100 strength score built from momentum, volume flow and relative performance versus Bitcoin. The asset at the top of the table is the strongest at that moment.' },
    { q: 'How is the crypto strength score calculated?', a: 'It is a weighted composite of price momentum, relative performance vs BTC/ETH, volume flow, volatility, dominance change, sentiment and trend consistency, normalized into a single 0–100 number.' },
    { q: 'Is a high strength score a buy signal?', a: 'A high score shows strong momentum and outperformance, which many traders use as confirmation — but it is not a guarantee. Always combine it with your own analysis and risk management. Not financial advice.' },
  ],
  links: toolLinks,
});
// /strength is a valid SPA route (renders the same StrengthMeter page) and is
// linked internally, but was not prerendered. Serve real content with its
// canonical pointing at /strength-meter to consolidate ranking signals.
add('/strength', {
  ...routes['/strength-meter'],
  canonicalPath: '/strength-meter',
});
add('/crypto-strength-meter', {
  title: `Crypto Strength Meter — Real-Time Market Momentum Rankings (${MONTH} ${YEAR}) | Oracle Bull`,
  description: `See which cryptocurrencies are gaining or losing strength right now. Free real-time strength meter ranking Bitcoin, Ethereum, Solana & 100+ altcoins by momentum, volume and trend strength. Updated ${MONTH} ${YEAR}.`,
  keywords: 'crypto strength meter, cryptocurrency strength indicator, real-time crypto momentum, which crypto is strongest right now, altcoin strength ranking, bitcoin strength today',
  h1: 'Crypto Strength Meter',
  intro: [
    'A crypto strength meter is a real-time ranking tool that measures the momentum, volume and trend health of a cryptocurrency at any moment. Oracle Bull combines price momentum, volume flow, volatility, dominance, relative performance vs BTC/ETH, sentiment and trend consistency into a single 0–100 strength score for Bitcoin, Ethereum, Solana and 100+ altcoins.',
    'A score above 60 means an asset is gaining strength; below 40 means it is weakening. Rankings update live so you can spot rotation, confirm entries and avoid fading trends.',
  ],
  faq: [
    { q: 'Which crypto is strongest right now?', a: 'The leaderboard updates live and ranks every asset by a 0–100 strength score built from momentum, volume flow and relative performance versus Bitcoin. The top of the table is the strongest at any given moment.' },
    { q: 'How is the crypto strength score calculated?', a: 'It is a weighted composite: price momentum (25%), relative performance vs BTC/ETH (20%), volume flow (15%), volatility (10%), dominance change (10%), sentiment (10%) and trend consistency (10%), normalized into a single 0–100 number.' },
    { q: 'Is a high strength score a buy signal?', a: 'A high score shows strong momentum and outperformance, which many traders use as confirmation — but it is not a guarantee. Always combine it with your own analysis and risk management.' },
  ],
  links: [
    { href: '/sentiment', label: 'Fear & Greed Index' },
    { href: '/scanner', label: 'Token Scanner' },
    { href: '/predictions', label: 'AI Price Predictions' },
    { href: '/explorer', label: 'Token Explorer' },
    { href: '/dashboard', label: 'Crypto Dashboard' },
  ],
});
add('/sentiment', {
  title: `Crypto Fear & Greed Index + Whale Tracker (Live ${MONTH} ${YEAR})`,
  description: 'Real-time crypto sentiment: Fear & Greed Index, whale transaction alerts, social buzz and trending topics. Make data-driven trading decisions.',
  keywords: 'crypto fear greed index today, whale alerts crypto, crypto sentiment analysis, is crypto bullish today',
  h1: 'Crypto Sentiment — Fear & Greed Index & Whale Tracker',
  intro: [
    'Gauge market psychology in real time with the crypto Fear & Greed Index, live whale transaction alerts, social sentiment and trending narratives.',
    'Sentiment extremes often mark turning points — track them here as they develop.',
    `Extreme fear can flag capitulation and potential bottoms, while extreme greed often precedes pullbacks. Pairing the index with live whale flows and social buzz gives you a fuller read on where the market\'s emotion sits right now, ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What is the crypto Fear & Greed Index today?', a: 'The Fear & Greed Index distills market emotion into a single 0–100 score from volatility, momentum, volume, social sentiment and dominance. Low readings signal fear (often near bottoms); high readings signal greed (often near local tops). The live value is shown at the top of this page.' },
    { q: 'How do whale alerts help my trading?', a: 'Large on-chain transfers can foreshadow volatility — heavy exchange inflows often precede selling, while outflows suggest accumulation. Tracking whale moves alongside sentiment helps you anticipate shifts before price reacts.' },
    { q: 'Is extreme fear a good time to buy?', a: 'Historically, extreme fear has often coincided with local bottoms and extreme greed with tops — but sentiment is one input, not a timing guarantee. Always combine it with your own analysis. Not financial advice.' },
  ],
  links: toolLinks,
});
add('/scanner', {
  title: `Crypto Token Scanner – Find Hidden Gems & New Tokens (${MONTH} ${YEAR})`,
  description: 'Scan for new and trending crypto tokens across all blockchains. Find hidden gems, analyze metrics, liquidity and risk scores. Free real-time scanner.',
  keywords: 'crypto scanner, token scanner, new crypto tokens, hidden gems crypto, low cap crypto',
  h1: 'Crypto Token Scanner',
  intro: [
    'Scan thousands of tokens across every major chain to surface trending coins, new listings and potential hidden gems — with liquidity, volume and risk metrics for each.',
    `The scanner filters by chain, liquidity, volume and momentum so you can move from thousands of tokens to a short, researchable shortlist in seconds. Every result links to deeper on-chain analysis. Updated continuously, ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What does the crypto token scanner do?', a: 'It scans thousands of tokens across every major blockchain in real time and ranks them by liquidity, trading volume, momentum and risk — surfacing new listings, trending coins and potential hidden gems you can then research in depth.' },
    { q: 'How do I find new crypto tokens early?', a: 'Filter the scanner by recent listings and rising volume on your chosen chain, then check each candidate\'s liquidity depth and risk score before doing your own research. Early tokens are high-risk — never invest more than you can afford to lose.' },
    { q: 'Is the token scanner free?', a: 'Yes. The Oracle Bull token scanner is completely free with no signup required.' },
  ],
  links: toolLinks,
});
// Bitcoin liquidation heatmap — was a valid SPA route (/liquidations/bitcoin-heatmap)
// with strong meta but NOT prerendered, so crawlers got a blank shell. Bake the
// real H1/intro/FAQ (mirrored from the React page) so it is fully indexable for
// the high-volume "bitcoin liquidation heatmap" search intent.
add('/liquidations/bitcoin-heatmap', {
  title: 'Bitcoin Liquidation Heatmap | Live BTC Liquidity Levels | Oracle Bull',
  description: 'Free real-time Bitcoin liquidation heatmap. Track BTC long and short liquidation clusters, leverage zones, and price levels where cascading liquidations are likely to trigger reversals.',
  keywords: 'bitcoin liquidation heatmap, btc liquidation map, bitcoin liquidations, btc leverage heatmap, bitcoin liquidity heatmap, crypto liquidation levels, btc long short liquidations',
  h1: 'Bitcoin Liquidation Heatmap',
  intro: [
    'Real-time map of Bitcoin liquidity clusters and leverage-driven price levels. Identify where cascading long and short liquidations are most likely to drive BTC price reversals and breakouts.',
    'The heatmap aggregates open interest, funding rates and price data from major BTC futures venues to estimate where leveraged positions will be forcibly closed. When Bitcoin approaches a dense cluster, cascading liquidations frequently accelerate the move — making these zones high-probability reversal or breakout areas.',
  ],
  faq: [
    { q: 'What is a Bitcoin liquidation heatmap?', a: 'A Bitcoin liquidation heatmap visualizes the price levels where leveraged long and short positions are likely to be force-closed. Clusters of liquidations act as magnets for price because large traders often push toward these zones to trigger cascading liquidations and harvest liquidity.' },
    { q: 'How do I read a Bitcoin liquidation heatmap?', a: 'Brighter or larger clusters indicate higher concentrations of leveraged positions at that price. Long-heavy zones below price are downside liquidity targets; short-heavy zones above price are upside liquidity targets. A balanced level signals consolidation.' },
    { q: 'Why does Bitcoin price move toward liquidation clusters?', a: 'When leveraged traders are stopped out, their forced market orders create one-sided pressure that accelerates price. Sophisticated participants often anticipate these zones, making liquidation maps a useful tool for spotting potential reversal points and high-volatility breakouts.' },
    { q: 'Is the Bitcoin liquidation heatmap real-time?', a: 'Yes. The heatmap pulls live open interest, price and funding data from major futures exchanges and refreshes every 20 seconds so you can monitor leverage build-up around Bitcoin in real time.' },
  ],
  links: [
    { href: '/dashboard', label: 'Crypto Dashboard' },
    { href: '/price-prediction/bitcoin', label: 'Bitcoin Price Prediction' },
    { href: '/sentiment', label: 'Fear & Greed Index' },
    { href: '/crypto-factory', label: 'Crypto Factory' },
    { href: '/scanner', label: 'Token Scanner' },
  ],
});
add('/explorer', {
  title: `Crypto Token Explorer – Search Any Coin by Name or Contract (${MONTH} ${YEAR})`,
  description: 'Search 10,000+ tokens by name, symbol or contract address. Price charts, holder analysis, liquidity depth & DeFi metrics across 30+ blockchains. Free.',
  keywords: 'crypto token explorer, search cryptocurrency, token contract lookup, defi token scanner',
  h1: 'Crypto Token Explorer',
  intro: [
    'Search any cryptocurrency by name, symbol or contract address and get instant price charts, holder analysis, liquidity depth and DeFi metrics across 30+ blockchains.',
    `Paste a contract address to vet a token in seconds — holder distribution, liquidity, volume and risk signals in one place — or search by name to pull up any of 10,000+ assets. Free, no signup, ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'How do I look up a crypto token by contract address?', a: 'Paste the token\'s contract address into the explorer search. It resolves the token across 30+ chains and returns its price chart, holder analysis, liquidity depth and DeFi metrics instantly.' },
    { q: 'Can I check if a token is safe before buying?', a: 'The explorer surfaces holder concentration, liquidity depth and volume — common red flags for risky tokens. Use them as a first screen, but always do your own due diligence before investing.' },
  ],
  links: toolLinks,
});
add('/factory', {
  title: `Crypto Factory – Market Events, Whale Alerts & On-Chain Intel (${MONTH} ${YEAR})`,
  description: 'Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto.',
  keywords: 'crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto',
  h1: 'Crypto Factory — Market Events & On-Chain Intel',
  intro: [
    'A real-time feed of everything that moves the market: token launches, protocol upgrades, airdrops, whale movements and trending narratives — the crypto equivalent of Forex Factory.',
    `Each item is scored for impact and tagged to the assets it affects, so instead of refreshing a dozen sources you see what matters — and why — in one continuously-updating feed. ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What is the Crypto Factory?', a: 'Crypto Factory is a real-time market intelligence feed that aggregates token launches, protocol upgrades, airdrops, whale movements and trending narratives into one place, each scored for market impact — the crypto equivalent of Forex Factory.' },
    { q: 'How is it different from a crypto news feed?', a: 'A news feed lists headlines; Crypto Factory adds structure — it scores each event for impact, tags the coins affected, and surfaces on-chain whale flows and active narratives alongside the news so you see what is actually moving capital.' },
  ],
  links: [
    { href: '/factory/events', label: 'Events Calendar' },
    { href: '/factory/onchain', label: 'On-Chain Intel' },
    { href: '/factory/narratives', label: 'Narratives' },
    { href: '/factory/news', label: 'Crypto News' },
  ],
});
add('/crypto-factory', {
  title: `Crypto Factory — Real-Time Market Intelligence, On-Chain Flows & Narratives (${MONTH} ${YEAR}) | Oracle Bull`,
  description: `Live crypto intelligence hub tracking events, narratives, whale flows, news and sentiment from 50+ sources — all auto-updating. The fastest way to know what's moving the market right now. ${MONTH} ${YEAR}.`,
  keywords: 'crypto market intelligence hub, real-time crypto news aggregator, crypto factory, live crypto events feed, crypto whale alert tracker, crypto narrative tracker, on-chain flow tracker',
  h1: 'Crypto Factory',
  intro: [
    `Crypto Factory is Oracle Bull's real-time market intelligence hub — one place that replaces refreshing a dozen news sites, whale-alert bots and social feeds. It aggregates events, narratives, on-chain whale flows and news, scores every item for impact, and tags the assets it affects so you see what matters in seconds.`,
    `The feed auto-updates continuously. Track which narratives are driving capital, watch large on-chain flows as they confirm, and never miss a market-moving event. Updated ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What is the Crypto Factory?', a: `Crypto Factory is Oracle Bull's real-time market intelligence hub that aggregates crypto news, on-chain whale flows, market narratives and key events into one auto-updating command center, scored by impact.` },
    { q: 'How often does Crypto Factory update?', a: 'The feed auto-refreshes every 60 seconds, and whale/on-chain flow cards reflect large transactions as they confirm on-chain.' },
    { q: 'What is a crypto market narrative?', a: 'A narrative is the dominant theme driving capital right now — AI tokens, Bitcoin ETF, RWA, memecoins. Crypto Factory ranks active narratives by momentum so you can see where money is rotating.' },
    { q: 'What are on-chain flows in crypto?', a: 'On-chain flows are movements of crypto between wallets. Large exchange inflows often precede selling, outflows suggest accumulation, and big wallet-to-wallet transfers can signal positioning before price reacts.' },
  ],
  links: [
    { href: '/crypto-strength-meter', label: 'Crypto Strength Meter' },
    { href: '/sentiment', label: 'Fear & Greed Index' },
    { href: '/compare', label: 'Compare Tokens' },
    { href: '/scanner', label: 'Token Scanner' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
});
add('/learn', {
  title: `Learn Crypto Free – Guides & Trading Education (${MONTH} ${YEAR})`,
  description: 'Free crypto education: Bitcoin guides, DeFi tutorials, technical analysis lessons and trading strategies for all levels.',
  keywords: 'learn crypto free, crypto education, bitcoin guide for beginners, how to trade crypto',
  h1: 'Learn Crypto — Free Guides & Education',
  intro: [
    'Free, beginner-friendly crypto education covering Bitcoin, DeFi, technical analysis, on-chain data, risk management and trading strategy.',
    `Each guide is written in plain language and builds from the fundamentals up — start with what a blockchain is, then progress to reading charts, understanding tokenomics and managing risk. No jargon, no paywall, ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'Where should a beginner start learning crypto?', a: 'Start with the fundamentals — what a blockchain is, how wallets work and how to buy your first coin safely — then move on to reading charts, tokenomics and risk management. The guides below are ordered to build that foundation step by step.' },
    { q: 'Is Oracle Bull\'s crypto education free?', a: 'Yes. Every guide is completely free with no signup or paywall.' },
  ],
  links: [...new Map(EDU_ARTICLES.map((a) => [a.slug, a])).values()]
    .slice(0, 12)
    .map((a) => ({ href: `/learn/${a.slug}`, label: a.title })),
});
add('/insights', {
  title: `Crypto Market Analysis Today – AI-Powered Daily Insights (${MONTH} ${YEAR})`,
  description: 'Daily AI market analysis for Bitcoin, Ethereum, Solana & altcoins. On-chain data, technical indicators & expert research. Updated daily, always free.',
  keywords: 'crypto analysis today, daily crypto insights, bitcoin market analysis, crypto research',
  h1: `Crypto Market Analysis & Insights (${MONTH} ${YEAR})`,
  intro: [
    'Daily AI-generated market analysis covering Bitcoin, Ethereum, Solana and the broader altcoin market — combining on-chain data, technical indicators and sentiment.',
    `Each piece goes beyond price to explain the why — what on-chain flows, positioning and macro context suggest about where the market may head next. Research, not financial advice, refreshed for ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'How often is the crypto market analysis updated?', a: 'New AI-generated analysis is published daily, covering Bitcoin, Ethereum, Solana and the broader altcoin market using live on-chain data, technical indicators and sentiment.' },
    { q: 'Is this crypto analysis financial advice?', a: 'No. The insights are research and education built from data and AI modeling. They are one input for your own decisions — always do your own research and manage risk.' },
  ],
  links: toolLinks,
});
add('/news', {
  title: `Crypto News Today – Live Headlines + AI Sentiment (${MONTH} ${YEAR}) | Oracle Bull`,
  description: `Breaking cryptocurrency news from 50+ trusted sources, each rated Bullish, Bearish or Neutral by Oracle AI. Bitcoin, Ethereum, Solana, DeFi & regulation — updated every 30 minutes. ${MONTH} ${YEAR}.`,
  keywords: 'crypto news today, bitcoin news, ethereum news, latest cryptocurrency news, crypto market news, crypto headlines',
  h1: `Crypto News Today — Live Headlines & AI Sentiment`,
  intro: [
    `The fastest way to read crypto news. Oracle Bull aggregates breaking headlines from 50+ trusted publications — including CoinDesk, Cointelegraph, Decrypt and The Block — and runs every story through our AI sentiment engine, so you instantly know whether the news is bullish, bearish or neutral for the market.`,
    `Every brief links back to the original publisher and to the coins it affects, and the feed refreshes automatically every 30 minutes, around the clock. Updated ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'How often is the crypto news updated?', a: 'The Oracle Bull news feed refreshes automatically every 30 minutes, pulling the latest stories from 50+ crypto publications around the clock.' },
    { q: 'What does the AI sentiment rating mean?', a: 'Each story is scored Bullish, Bearish or Neutral based on its likely short-term market impact — a research signal to gauge how the market may react, not financial advice.' },
    { q: 'Where does the news come from?', a: 'Headlines are aggregated from trusted crypto publishers such as CoinDesk, Cointelegraph, Decrypt and The Block. Every article links back to the original source.' },
  ],
  links: [
    { href: '/predictions', label: 'AI Price Predictions' },
    { href: '/sentiment', label: 'Fear & Greed Index' },
    { href: '/strength-meter', label: 'Crypto Strength Meter' },
    { href: '/scanner', label: 'Token Scanner' },
    ...coinLinks.slice(0, 6),
  ],
});
add('/airdrops', {
  title: `Crypto Airdrops 2026–2027 — All Active, Upcoming & Confirmed Airdrops | Oracle Bull`,
  description: `Track every crypto airdrop in 2026 and 2027. Active tasks, snapshot dates, eligibility, estimated values and step-by-step guides for Base, Ethereum, Solana, zkSync and more. Updated ${MONTH} ${YEAR}.`,
  keywords: 'crypto airdrops 2026, crypto airdrops 2027, best crypto airdrops 2026, base airdrop 2026, ethereum airdrop 2026, solana airdrop 2026, zksync airdrop, how to qualify for crypto airdrops, confirmed crypto airdrops 2026',
  h1: 'Crypto Airdrops 2026 — 2027',
  intro: [
    `2026–2027 is one of the biggest windows for crypto airdrops since 2020. Hundreds of well-funded protocols launched without a token between 2022 and 2025 and are now approaching their token launches — across Ethereum Layer-2s (Linea, zkSync, Scroll), new Layer-1s (Monad, Berachain, MegaETH), the Base ecosystem and Hyperliquid.`,
    `This page tracks the highest-conviction airdrops with their status, estimated value range and the exact tasks to qualify, plus a complete guide on how airdrops work, how to farm them safely, how values are estimated and the tax basics. Updated ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What crypto airdrops are happening in 2026?', a: 'Major confirmed and expected airdrops in 2026–2027 span Ethereum Layer-2 rollups (Linea, zkSync, Scroll), new Layer-1s (Monad, Berachain, MegaETH), the Base ecosystem and Hyperliquid — each tracked with status, estimated value and qualifying tasks.' },
    { q: 'How do I qualify for a crypto airdrop?', a: 'Use a protocol before its snapshot date with genuine, varied activity — bridging, swapping, lending and holding over time. Most projects filter Sybil farmers who repeat identical minimum actions, so organic usage performs best.' },
    { q: 'What are Base blockchain airdrops?', a: "Base is Coinbase's Ethereum Layer-2. Base uses ETH for gas and has no token, but the hundreds of protocols built on Base can launch tokens and reward early users — making early Base activity a common airdrop strategy." },
    { q: 'Are crypto airdrops taxable?', a: 'In most jurisdictions airdropped tokens are treated as ordinary income at fair-market value when received, with capital gains on later disposal. Treatment varies by country — consult a qualified tax professional. Not tax advice.' },
  ],
  links: [
    ...AIRDROPS.slice(0, 6).map((a) => ({ href: `/airdrops/${a.id}`, label: `${a.name} Airdrop Guide` })),
    { href: '/crypto-factory', label: 'Crypto Factory' },
    { href: '/crypto-strength-meter', label: 'Strength Meter' },
  ],
});
// Airdrop detail pages — one per project in AIRDROPS_DATA. These were linked from
// /airdrops but never prerendered (blank shell for crawlers). Each ships real
// title/intro/FAQ from the project's own data, so the internal links resolve and
// the long-tail "<project> airdrop guide / how to qualify" intent is indexable.
for (const ad of AIRDROPS) {
  const statusBit = ad.status ? `${ad.status}. ` : '';
  const valueBit = ad.estValue ? `Estimated value: ${ad.estValue}. ` : '';
  add(`/airdrops/${ad.id}`, {
    title: `${ad.name} (${ad.ticker || ''}) Airdrop Guide ${YEAR} – How to Qualify | Oracle Bull`.replace(' ()', ''),
    description: `How to qualify for the ${ad.name} airdrop in ${YEAR}. ${statusBit}${valueBit}Eligibility, tasks, snapshot timing and a step-by-step farming guide. Not financial advice.`.slice(0, 160),
    keywords: `${ad.name.toLowerCase()} airdrop, how to qualify ${ad.name.toLowerCase()} airdrop, ${ad.name.toLowerCase()} airdrop guide ${YEAR}, ${(ad.ticker || '').toLowerCase()} token`,
    h1: `${ad.name} Airdrop Guide`,
    intro: [
      ad.description || `${ad.name} is a ${ad.category || 'crypto'} project with a potential token airdrop.`,
      `This guide covers how to position for a potential ${ad.name}${ad.ticker ? ` (${ad.ticker})` : ''} airdrop: current status${ad.status ? ` (${ad.status})` : ''}, the tasks that tend to matter, snapshot timing and the risks to weigh. ${valueBit}Updated ${MONTH} ${YEAR}.`,
      `Airdrop allocations are never guaranteed and eligibility rules can change without notice. Farm genuinely, manage risk, and treat estimated values as speculative. This is research, not financial advice.`,
    ],
    faq: [
      { q: `How do I qualify for the ${ad.name} airdrop?`, a: `Use ${ad.name} genuinely and consistently ahead of any snapshot — varied, organic on-chain activity tends to outperform repeated minimum actions, which projects often filter as Sybil behavior. ${ad.status ? `Current status: ${ad.status}.` : ''}` },
      { q: `Is the ${ad.name} airdrop confirmed?`, a: `${ad.name}'s status is currently "${ad.status || 'unconfirmed'}." Airdrops are speculative until officially announced — never risk more than you can afford on an unconfirmed allocation. Not financial advice.` },
      ...(ad.estValue ? [{ q: `What is the ${ad.name} airdrop worth?`, a: `Community and AI estimates put the potential ${ad.name} airdrop value around ${ad.estValue}, but this is a speculative range, not a promise. Actual allocations depend on eligibility, timing and the final tokenomics.` }] : []),
    ],
    article: { headline: `${ad.name} Airdrop Guide ${YEAR}`, about: ad.name },
    links: [
      { href: '/airdrops', label: 'All Crypto Airdrops' },
      ...AIRDROPS.filter((o) => o.id !== ad.id).slice(0, 4).map((o) => ({ href: `/airdrops/${o.id}`, label: `${o.name} Airdrop` })),
      { href: '/crypto-factory', label: 'Crypto Factory' },
    ],
  });
}
const polymarketDef = {
  title: `Polymarket Signals — Live Odds, Implied Probability & Risk Analysis (${MONTH} ${YEAR}) | Oracle Bull`,
  description: `Analyze any Polymarket prediction market in real time. See implied probabilities, the favored outcome, a risk rating and 24h momentum for politics, crypto, sports, economy & more. Search any market free. ${MONTH} ${YEAR}.`,
  keywords: 'polymarket signals, polymarket odds, polymarket implied probability, prediction market analysis, polymarket risk, what to choose polymarket, polymarket bitcoin, polymarket election odds',
  h1: 'Polymarket Signals',
  intro: [
    `Analyze any Polymarket prediction market in real time. For every market we read the live prices — which are the market's implied probabilities — and surface the favored outcome, a clarity score, a risk rating (blending decisiveness, liquidity and spread) and 24-hour momentum.`,
    `Search any market by keyword or browse by theme — politics, crypto, sports, economy, geopolitics, tech and culture. Informational analysis of public prediction-market data only, not betting advice. Updated ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What is a Polymarket implied probability?', a: `Polymarket prices each outcome between $0 and $1, and that price is the market's implied probability. A "Yes" share at $0.72 means a roughly 72% implied chance. Our analyzer converts every market's live prices into clear percentages.` },
    { q: 'How is the risk level calculated?', a: 'The risk rating blends how decisive the market is (a near 50/50 toss-up is riskier than an 85% favorite), liquidity depth, and the bid/ask spread. It is an informational read of uncertainty, not betting advice.' },
    { q: 'Can I search any Polymarket market?', a: 'Yes — search any market on Polymarket by keyword (politics, crypto, sports, economy and more) or browse by theme. Every result is analyzed live for implied odds and risk.' },
  ],
  links: [
    { href: '/crypto-strength-meter', label: 'Crypto Strength Meter' },
    { href: '/sentiment', label: 'Fear & Greed Index' },
    { href: '/crypto-factory', label: 'Crypto Factory' },
    { href: '/compare', label: 'Compare Tokens' },
  ],
};
add('/tools', {
  title: `Free Crypto Tools – Calculators, Scanners & Prediction-Market Analysis (${MONTH} ${YEAR}) | Oracle Bull`,
  description: `Free crypto tools in one place: profit & DCA calculators, impermanent-loss calculator, token scanner, strength meter and live Polymarket prediction-market analysis. No signup. Updated ${MONTH} ${YEAR}.`,
  keywords: 'free crypto tools, crypto calculator, crypto profit calculator, dca calculator, impermanent loss calculator, prediction market analysis',
  h1: 'Free Crypto Tools',
  intro: [
    `Oracle Bull's free crypto toolkit in one place — no signup required. Calculate trading profit and ROI, model a dollar-cost-averaging plan, estimate impermanent loss before providing liquidity, scan tokens for risk, and analyze any Polymarket prediction market in real time.`,
    `Every tool runs on live data and is built for fast, practical research. Updated ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'Are Oracle Bull tools free?', a: 'Yes. Every Oracle Bull tool — profit, DCA and impermanent-loss calculators, the token scanner, strength meter and prediction-market analyzer — is 100% free with no signup required.' },
    { q: 'What can I calculate with the crypto profit calculator?', a: 'Enter your entry and exit prices, position size and exchange fees to see exact profit, loss and ROI on a trade, including the impact of fees on both sides.' },
  ],
  links: [
    { href: '/tools/profit-calculator', label: 'Profit Calculator' },
    { href: '/tools/dca-calculator', label: 'DCA Calculator' },
    { href: '/tools/impermanent-loss-calculator', label: 'Impermanent Loss Calculator' },
    { href: '/scanner', label: 'Token Scanner' },
    { href: '/crypto-strength-meter', label: 'Crypto Strength Meter' },
    { href: '/polymarket', label: 'Polymarket Signals' },
  ],
});
add('/polymarket', polymarketDef);
add('/compare', {
  title: 'Compare Cryptocurrencies Side by Side | Oracle Bull',
  description: 'Compare any two cryptocurrencies side by side: price, market cap, performance, fundamentals and AI verdict. Make informed decisions.',
  keywords: 'compare crypto, crypto comparison, bitcoin vs ethereum, which crypto is better',
  h1: 'Compare Cryptocurrencies',
  intro: [
    'Put any two coins head-to-head: price, market cap, volume, performance, fundamentals and an AI verdict on which is stronger right now.',
    `Each comparison goes past the price chart to weigh what each asset actually is — its category, launch era, consensus and the catalysts that drive it — so "which is better" gets a reasoned answer, not just a number. Pick a matchup below for ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'How do I compare two cryptocurrencies?', a: 'Choose a matchup below (or any two coins) to see them side by side: price, market cap, volume, recent performance and fundamentals, plus an AI verdict on which looks stronger right now.' },
    { q: 'Is "X vs Y" a good way to pick a crypto?', a: 'Head-to-head comparison helps you weigh trade-offs — category, tokenomics, momentum and adoption — but no single comparison is a buy signal. Use it as research alongside your own analysis and risk tolerance.' },
  ],
  links: COMPARE_PAIRS.map((p) => ({ href: `/compare/${p}`, label: titleCase(p) })),
});
add('/how-to-buy', {
  title: 'How to Buy Cryptocurrency – Beginner Guides | Oracle Bull',
  description: 'Step-by-step guides on how to buy Bitcoin, Ethereum, Solana and more — safely, for beginners.',
  keywords: 'how to buy crypto, how to buy bitcoin, buy ethereum, crypto for beginners',
  h1: 'How to Buy Cryptocurrency',
  intro: [
    'Clear, beginner-friendly, step-by-step guides on how to buy the most popular cryptocurrencies safely.',
    `Every guide walks the same safe path — choose a reputable exchange, secure your account, fund it, place your order and move coins to self-custody — tailored to each asset. Start with a coin below. ${MONTH} ${YEAR}.`,
  ],
  faq: [
    { q: 'What do I need to buy cryptocurrency?', a: 'A reputable exchange account (verified with ID), a funding method such as a bank transfer or card, and ideally a self-custody wallet for storing your coins long-term. Each guide below walks you through it for a specific coin.' },
    { q: 'What is the safest way to buy crypto as a beginner?', a: 'Use a well-known regulated exchange, enable two-factor authentication, start small, and move larger holdings to a hardware or self-custody wallet. Never share your seed phrase. Not financial advice.' },
  ],
  links: COINS.slice(0, 8).map(([s, n]) => ({ href: `/how-to-buy/${s}`, label: `How to Buy ${n}` })),
});
// Factory subpages
const factorySub = {
  '/factory/events': ['Crypto Events Calendar', 'Token launches, protocol upgrades, airdrops, governance votes and market-moving announcements — the crypto calendar traders rely on.',
    'Each event is dated and tagged to the assets it affects, so you can plan around catalysts instead of being surprised by them.',
    [
      { q: 'What is a crypto events calendar?', a: 'A crypto events calendar tracks scheduled, market-moving events — token launches, mainnet and protocol upgrades, token unlocks, airdrops and governance votes — so traders can anticipate volatility and plan around catalysts.' },
      { q: 'Why do crypto events move prices?', a: 'Events like token unlocks, upgrades and launches change supply, utility or sentiment, often triggering volatility before and after the date. Knowing the schedule helps you manage risk around it.' },
    ]],
  '/factory/onchain': ['On-Chain Intelligence', 'Real-time whale movements, large transfers, smart-money accumulation and exchange in/outflows.',
    'On-chain flows reveal what large holders are actually doing — often before it shows up in price — so you can read positioning rather than guess at it.',
    [
      { q: 'What is on-chain intelligence in crypto?', a: 'On-chain intelligence reads activity recorded directly on the blockchain — whale transfers, exchange inflows and outflows, and smart-money accumulation — to reveal how large holders are positioning before price reacts.' },
      { q: 'What do exchange inflows and outflows mean?', a: 'Large inflows to exchanges often precede selling (coins moved on to sell), while outflows suggest accumulation and self-custody. Sustained one-sided flow can foreshadow a move.' },
    ]],
  '/factory/narratives': ['Crypto Market Narratives', 'Track trending sectors — AI tokens, DeFi, RWA, meme coins, Layer 2s — and spot rotation early.',
    'Capital rotates between narratives in cycles; spotting which theme is gaining momentum early is often where the biggest moves come from.',
    [
      { q: 'What is a crypto narrative?', a: 'A crypto narrative is the dominant theme attracting capital at a given time — for example AI tokens, real-world assets (RWA), memecoins or Layer-2s. Narratives drive sector-wide rallies as money rotates in.' },
      { q: 'How do I spot narrative rotation?', a: 'Watch which sectors are outperforming on rising volume while others fade. This narrative tracker ranks active themes by momentum so you can see where capital is rotating before it is obvious.' },
    ]],
  '/factory/news': ['Crypto News Sentiment & Market Impact', 'Breaking crypto news from 50+ sources, each scored bullish, bearish or neutral for its likely market impact.',
    'Every headline is scored bullish, bearish or neutral and tagged to the coins it affects, so you get signal — not just a wall of stories.',
    [
      { q: 'How often does the crypto news update?', a: 'The feed aggregates breaking stories from 50+ trusted crypto publications and refreshes continuously, each scored for bullish, bearish or neutral market impact.' },
      { q: 'What does the AI sentiment score mean?', a: 'Each story is rated bullish, bearish or neutral based on its likely short-term market impact — a quick research signal, not financial advice.' },
    ]],
};
for (const [p, [h1, blurb, extraPara, faq]] of Object.entries(factorySub)) {
  add(p, {
    title: `${h1} (${MONTH} ${YEAR}) | Oracle Bull`,
    description: blurb, keywords: `${h1.toLowerCase()}, crypto ${p.split('/').pop()}`,
    h1, intro: [blurb, ...(extraPara ? [extraPara] : [])], faq: faq || [],
    links: [{ href: '/factory', label: 'Crypto Factory' }, ...toolLinks.slice(0, 4)],
  });
}
// Tools subpages
const toolPages = {
  '/tools/profit-calculator': ['Crypto Profit Calculator', 'Calculate exact trading profit and ROI, accounting for exchange fees on both entry and exit.',
    'Enter your buy price, sell price, position size and fees to see net profit or loss, ROI percentage and break-even price — so you know the real number after costs, not a rough guess.',
    [
      { q: 'How do I calculate crypto profit?', a: 'Profit = (sell price − buy price) × amount, minus trading fees on both entry and exit. Enter those values and the calculator returns your exact net profit, ROI percentage and break-even price.' },
      { q: 'Does the calculator include exchange fees?', a: 'Yes. It applies fees to both your entry and exit, so the profit and ROI it shows reflect what you actually keep after costs.' },
    ]],
  '/tools/dca-calculator': ['Crypto DCA Calculator', 'Model a dollar-cost-averaging strategy and project returns across a schedule.',
    'See how investing a fixed amount on a regular schedule would have performed — your average entry, total invested and current value — so you can compare DCA against a lump-sum approach.',
    [
      { q: 'What is dollar-cost averaging (DCA) in crypto?', a: 'DCA means investing a fixed amount at regular intervals regardless of price. It smooths out volatility by spreading your entry over time, lowering the risk of buying everything at a local top.' },
      { q: 'Is DCA better than buying all at once?', a: 'DCA reduces timing risk and is easier psychologically in volatile markets; lump-sum can outperform when prices trend up. This calculator lets you model both and compare outcomes for your own schedule.' },
    ]],
  '/tools/impermanent-loss-calculator': ['Impermanent Loss Calculator', 'Calculate impermanent loss for AMM liquidity pools before you provide liquidity.',
    'Enter the two pool assets and their price change to see your impermanent loss versus simply holding — essential before committing capital to a liquidity pool.',
    [
      { q: 'What is impermanent loss?', a: 'Impermanent loss is the difference in value between providing liquidity to an AMM pool and simply holding the two assets, caused by their prices diverging. It becomes permanent only if you withdraw while prices are diverged.' },
      { q: 'How do I avoid impermanent loss?', a: 'Use pools of correlated or pegged assets (like two stablecoins), factor in trading-fee and reward income that can offset it, and model the scenario here before depositing. Not financial advice.' },
    ]],
};
for (const [p, [h1, blurb, extraPara, faq]] of Object.entries(toolPages)) {
  add(p, {
    title: `${h1} – Free Tool | Oracle Bull`,
    description: blurb, keywords: `${h1.toLowerCase()}, crypto calculator, free crypto tool`,
    h1, intro: [blurb, ...(extraPara ? [extraPara] : [])], faq: faq || [],
    links: [{ href: '/tools', label: 'All Tools' }, ...toolLinks.slice(0, 4)],
  });
}
// Legal / about
const simplePages = {
  '/about': ['About Oracle Bull', 'Oracle Bull is a free AI-powered crypto analytics platform offering real-time predictions, whale tracking and sentiment analysis for 1,000+ tokens.'],
  '/contact': ['Contact Oracle Bull', 'Get in touch with the Oracle Bull team and join our community of traders.'],
  '/advertise': ['Advertise on Oracle Bull', 'Reach an engaged audience of active crypto traders. Explore advertising options on Oracle Bull.'],
  '/privacy-policy': ['Privacy Policy', 'How Oracle Bull collects, uses and protects your data.'],
  '/terms': ['Terms of Service', 'The terms and conditions for using Oracle Bull.'],
  '/risk-disclaimer': ['Risk Disclaimer', 'Important risk disclosure for cryptocurrency trading and AI predictions.'],
  '/editorial-policy': ['Editorial Policy', 'How Oracle Bull produces and reviews its content.'],
  '/sitemap': ['Sitemap', 'Complete index of Oracle Bull pages, tools and guides.'],
};
for (const [p, [h1, blurb]] of Object.entries(simplePages)) {
  add(p, { title: `${h1} | Oracle Bull`, description: blurb, keywords: `oracle bull ${h1.toLowerCase()}`, h1, intro: [blurb], links: toolLinks.slice(0, 4) });
}

// Price prediction coin pages
for (const [slug, name, sym] of COINS) {
  const facts = coinFactSentences(slug, name, sym);
  const factFaq = coinFactFaq(slug, name, sym);
  const driver = sectorDriver(slug);
  // Sector peers first (most relevant), then fill to 6 with general top coins.
  const peerLinks = sectorPeers(slug, 4).map(([s, n]) => ({ href: `/price-prediction/${s}`, label: `${n} Prediction` }));
  const fillLinks = COINS.filter((c) => c[0] !== slug && !peerLinks.some((l) => l.href === `/price-prediction/${c[0]}`)).slice(0, 6 - peerLinks.length).map(([s, n]) => ({ href: `/price-prediction/${s}`, label: `${n} Prediction` }));
  const related = [...peerLinks, ...fillLinks];
  add(`/price-prediction/${slug}`, {
    title: `${name} (${sym}) Price Prediction ${MONTH} ${YEAR} – AI Forecast & Targets`,
    description: `${name} price prediction for ${MONTH} ${YEAR}. AI-powered ${name} (${sym}) forecast with entry zones, support/resistance levels, bull/bear targets & confidence scores. Updated live.`,
    keywords: `${slug} price prediction, ${name} forecast, will ${slug} go up, ${slug} price target, should i buy ${slug}`,
    h1: `${name} (${sym}) Price Prediction — ${MONTH} ${YEAR}`,
    intro: [
      ...facts,
      `Looking for the latest ${name} price prediction? Oracle Bull's AI analyzes live ${name} (${sym}) market data — price action, momentum, volume, volatility and sentiment — to produce daily, weekly and monthly forecasts with support/resistance levels and bull/bear targets.`,
      ...(driver ? [`Beyond the chart, ${name}'s longer-term value is driven by ${driver}.`] : []),
      `This page updates continuously. Use the live chart and AI analysis to gauge whether ${name} is likely to go up or down, and where the key entry and exit zones are.`,
    ],
    faq: [
      ...(factFaq ? [factFaq] : []),
      { q: `What is the ${name} price prediction for ${MONTH} ${YEAR}?`, a: `Our AI model forecasts ${name} (${sym}) using real-time market data, technical analysis and sentiment. See the live chart above for exact support, resistance and target levels for ${MONTH} ${YEAR}.` },
      { q: `Will ${name} go up?`, a: `The model analyzes ${name}'s current momentum, volume and sentiment to estimate the probability of an up or down move across daily, weekly and monthly timeframes.` },
      { q: `Is ${name} a good investment right now?`, a: `${name}'s investment potential depends on your timeframe and risk tolerance. We provide a real-time risk score plus daily, weekly and monthly AI forecasts to help you decide. This is not financial advice.` },
    ],
    article: { headline: `${name} Price Prediction – AI Forecast ${MONTH} ${YEAR}`, about: name },
    links: [...related, { href: '/predictions', label: 'All Predictions' }, { href: `/how-to-buy/${slug}`, label: `How to Buy ${name}` }],
  });
  // Timeframe pages — daily / weekly / monthly. These target high-volume
  // "today / this week / this month" intent and are the exact URLs the Footer
  // and category hubs link to (/price-prediction/{slug}/daily). Each has its own
  // distinct intro/FAQ copy so they are genuinely unique pages, not thin dupes.
  for (const [tf, label, horizon, kw] of TIMEFRAMES) {
    add(`/price-prediction/${slug}/${tf}`, {
      title: `${name} (${sym}) Price Prediction ${label} – AI Forecast (${MONTH} ${YEAR})`,
      description: `${name} price prediction ${label.toLowerCase()}. AI-powered ${name} (${sym}) ${horizon} forecast with entry zones, support/resistance, ${kw} targets and confidence scores. Updated live ${MONTH} ${YEAR}.`,
      keywords: `${slug} price prediction ${label.toLowerCase()}, ${name} ${kw} forecast, will ${slug} go up ${label.toLowerCase()}, ${slug} ${horizon} target`,
      h1: `${name} (${sym}) Price Prediction — ${label}`,
      intro: [
        `Will ${name} go up ${label.toLowerCase()}? Oracle Bull's AI builds a ${horizon} ${name} (${sym}) forecast from live price action, momentum, volume flow, volatility and market sentiment — refreshed continuously throughout ${MONTH} ${YEAR}.`,
        ...(facts.length ? [facts[0]] : []),
        ...(driver ? [`Over a ${horizon} horizon, ${name}'s price is shaped less by hype and more by ${driver} — the AI weighs these alongside the live technical setup.`] : []),
        `This ${label.toLowerCase()} outlook highlights the key support and resistance zones, the probability of an up or down move, and the bull/bear targets that matter most over a ${horizon} horizon. Use the live chart above alongside the AI read.`,
      ],
      faq: [
        { q: `What is the ${name} price prediction ${label.toLowerCase()}?`, a: `Our AI model forecasts ${name} (${sym}) over a ${horizon} horizon using real-time market data, technical structure and sentiment. The live chart shows exact support, resistance and ${kw} target levels.` },
        { q: `Will ${name} go up ${label.toLowerCase()}?`, a: `The model estimates the probability of an up or down ${name} move ${label.toLowerCase()} from current momentum, volume and sentiment. See the probability read on this page — it updates live.` },
        { q: `Is now a good time to buy ${name}?`, a: `Timing depends on your risk tolerance and the ${horizon} setup. We pair this ${label.toLowerCase()} forecast with a live risk score and entry/exit zones to help you decide. This is research, not financial advice.` },
        ...(driver ? [{ q: `What affects the ${name} price ${label.toLowerCase()}?`, a: `${name} (${sym}) is most influenced by ${driver}, together with overall crypto market direction and Bitcoin's trend. The AI tracks these factors live.` }] : []),
        ...(factFaq ? [factFaq] : []),
      ],
      article: { headline: `${name} Price Prediction ${label} – AI Forecast ${MONTH} ${YEAR}`, about: name },
      links: [
        { href: `/price-prediction/${slug}`, label: `${name} Full Prediction` },
        ...TIMEFRAMES.filter((t) => t[0] !== tf).map((t) => ({ href: `/price-prediction/${slug}/${t[0]}`, label: `${name} ${t[1]} Forecast` })),
        { href: '/predictions', label: 'All Predictions' },
      ],
    });
  }
  // Year predictions — every coin now gets long-term 2026/2027/2028/2030 pages.
  // "{coin} price prediction 2030" is high-volume long-tail intent, and the
  // per-coin facts + sector-driver copy keeps each page genuinely unique (not a
  // thin dupe). The SPA's /price-prediction/:coinId/<year> routes are coin-generic
  // so every slug renders correctly.
  {
    for (const yr of YEARS) {
      add(`/price-prediction/${slug}/${yr}`, {
        title: `${name} (${sym}) Price Prediction ${yr} – Long-Term AI Forecast`,
        description: `${name} price prediction for ${yr}. Long-term ${name} (${sym}) forecast, price targets and scenario analysis based on adoption trends, cycles and AI modeling.`,
        keywords: `${slug} price prediction ${yr}, ${name} ${yr} forecast, ${slug} price target ${yr}, will ${slug} reach new highs`,
        h1: `${name} (${sym}) Price Prediction ${yr}`,
        intro: [
          `What could ${name} be worth in ${yr}? This long-term ${name} (${sym}) forecast combines historical market cycles, adoption trends and AI scenario modeling to map out bull, base and bear cases for ${yr}.`,
          ...(facts.length ? [facts[0]] : []),
          ...(driver ? [`By ${yr}, ${name}'s trajectory will hinge on ${driver} rather than short-term price swings.`] : []),
          `Long-term crypto forecasts are inherently uncertain — treat these as scenario ranges for research, not guarantees.`,
        ],
        faq: [
          { q: `What will ${name} be worth in ${yr}?`, a: `Our ${yr} ${name} forecast presents bull, base and bear scenarios derived from market cycles, adoption trends and AI modeling. See the scenario ranges on this page.` },
          { q: `Will ${name} reach a new all-time high by ${yr}?`, a: `The ${yr} outlook weighs ${name}'s historical cycle behavior and momentum to estimate the likelihood of new highs. It is a probabilistic scenario, not financial advice.` },
          ...(factFaq ? [factFaq] : []),
        ],
        article: { headline: `${name} Price Prediction ${yr} – Long-Term AI Forecast`, about: name },
        links: [
          { href: `/price-prediction/${slug}`, label: `${name} Prediction` },
          ...YEARS.filter((y) => y !== yr).map((y) => ({ href: `/price-prediction/${slug}/${y}`, label: `${name} ${y} Forecast` })),
          { href: '/predictions', label: 'All Predictions' },
        ],
      });
    }
  }
}

// ── Alias coin pages ────────────────────────────────────────────────────────
// Generate real prerendered HTML for the CoinGecko-ID alias slugs that internal
// links/sitemaps use, each canonical-pointing at the primary friendly-slug page.
// This closes the "internal link → blank SPA shell" gap for crawlers without
// creating duplicate-content (the canonical consolidates ranking signals).
for (const [aliasSlug, primarySlug] of Object.entries(COIN_ALIASES)) {
  const coin = COIN_BY_SLUG[primarySlug];
  if (!coin) continue;
  const [, name, sym] = coin;
  const primaryDef = routes[`/price-prediction/${primarySlug}`];
  if (primaryDef) {
    add(`/price-prediction/${aliasSlug}`, {
      ...primaryDef,
      canonicalPath: `/price-prediction/${primarySlug}`,
      links: [
        { href: `/price-prediction/${primarySlug}`, label: `${name} (${sym}) Full Prediction` },
        ...(primaryDef.links || []),
      ],
    });
  }
  for (const [tf, label] of TIMEFRAMES) {
    const tfDef = routes[`/price-prediction/${primarySlug}/${tf}`];
    if (!tfDef) continue;
    add(`/price-prediction/${aliasSlug}/${tf}`, {
      ...tfDef,
      canonicalPath: `/price-prediction/${primarySlug}/${tf}`,
      links: [
        { href: `/price-prediction/${primarySlug}/${tf}`, label: `${name} ${label} Forecast` },
        ...(tfDef.links || []),
      ],
    });
  }
}

// Chain pages
for (const [slug, name] of CHAINS) {
  add(`/chain/${slug}`, {
    title: `${name} Analytics – Live Price, DeFi & Whale Alerts (${MONTH} ${YEAR})`,
    description: `Real-time ${name} blockchain analytics: price charts, whale tracking, token discovery, TVL, risk analysis & AI predictions. Free ${name} dashboard. ${MONTH} ${YEAR}.`,
    keywords: `${slug} analytics, ${name} price today, ${slug} whale alerts, ${slug} defi, ${slug} tokens`,
    h1: `${name} Analytics Dashboard`,
    intro: [
      `Real-time ${name} blockchain analytics in one dashboard: native price, TVL, whale movements, token discovery, DeFi metrics and AI predictions.`,
      `Monitor ${name} network activity and capital flows as they happen.`,
      `Whether you are tracking ${name} DeFi activity, hunting new tokens in its ecosystem or watching large on-chain transfers, everything updates live in one place — no need to stitch together explorers and dashboards. ${MONTH} ${YEAR}.`,
    ],
    faq: [
      { q: `What can I track on the ${name} analytics dashboard?`, a: `Live ${name} price and TVL, whale movements and large transfers, new and trending tokens in the ${name} ecosystem, DeFi metrics and AI-driven predictions — all updating in real time.` },
      { q: `How do I find new tokens on ${name}?`, a: `Use the token discovery and scanner tools to surface new and trending ${name} tokens ranked by liquidity, volume and momentum, then check each one's risk metrics before researching further.` },
      { q: `Is the ${name} dashboard free?`, a: `Yes. The ${name} analytics dashboard is completely free with no signup required.` },
    ],
    links: CHAINS.filter((c) => c[0] !== slug).slice(0, 6).map(([s, n]) => ({ href: `/chain/${s}`, label: `${n} Analytics` })),
  });
}

// Market pages (+ chain-specific ecosystem pages)
const CHAIN_MARKET_PAGES = CHAINS.flatMap(([cslug]) => [
  `best-${cslug}-tokens`, `top-${cslug}-gainers-today`, `best-${cslug}-defi-tokens`, `best-${cslug}-meme-coins`,
]);
for (const slug of [...MARKET_PAGES, ...CHAIN_MARKET_PAGES]) {
  const readable = titleCase(slug);
  add(`/market/${slug}`, {
    title: `${readable} – AI Picks & Live Analysis (${MONTH} ${YEAR})`,
    description: `${readable}: AI-powered analysis with live prices, momentum, volume and sentiment scores. Updated ${MONTH} ${YEAR}.`,
    keywords: `${slug.replace(/-/g, ' ')}, best crypto to buy, crypto picks today`,
    h1: `${readable} (${MONTH} ${YEAR})`,
    intro: [
      `${readable} — an AI-curated answer updated for ${MONTH} ${YEAR}, based on real-time momentum, trading volume, market sentiment and technical signals across the crypto market.`,
      `The list below is ranked by live data, not opinion, and refreshes as conditions change — so it reflects what the market is actually doing right now rather than a stale pick.`,
      `Use the live rankings and analysis on this page to inform your research. Nothing here is financial advice.`,
    ],
    faq: [
      { q: `How is "${readable}" decided?`, a: `The ranking is generated from live market data — price momentum, trading volume, sentiment and technical signals — and updated for ${MONTH} ${YEAR}. It is an AI-curated research shortlist, not a recommendation.` },
      { q: 'Is this financial advice?', a: 'No. This page is research and information only. Crypto is volatile and high-risk — always do your own research and never invest more than you can afford to lose.' },
    ],
    links: [...coinLinks.slice(0, 6), { href: '/predictions', label: 'All Predictions' }],
  });
}

// Compare pages — curated list + full top-20 matrix (every unique pair)
const TOP20_COMPARE = (() => {
  const top = ['bitcoin', 'ethereum', 'ripple', 'bnb', 'solana', 'dogecoin', 'cardano', 'tron', 'avalanche', 'chainlink', 'shiba-inu', 'polkadot', 'litecoin', 'bitcoin-cash', 'near', 'uniswap', 'aptos', 'sui', 'pepe', 'polygon'];
  const pairs = [];
  for (let i = 0; i < top.length; i++) for (let j = i + 1; j < top.length; j++) pairs.push(`${top[i]}-vs-${top[j]}`);
  return pairs;
})();
// Intra-sector compare pairs — "X vs Y" where both coins are in the SAME sector
// is high-intent ("which is better, aave or compound?") and the facts layer makes
// each page genuinely informative. Capped per sector to avoid a combinatorial
// explosion of low-demand pairs. Reuses the /compare/:coins SPA route.
const SECTOR_COMPARE = (() => {
  const bySector = {};
  for (const [slug] of COINS) {
    const f = COIN_FACTS[slug];
    if (!f) continue;
    (bySector[f.sector] ||= []).push(slug);
  }
  const pairs = [];
  for (const slugs of Object.values(bySector)) {
    // Limit each sector to its first 6 coins → max 15 pairs/sector.
    const pool = slugs.slice(0, 6);
    for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) pairs.push(`${pool[i]}-vs-${pool[j]}`);
  }
  return pairs;
})();
// Dedup across orderings (a-vs-b vs b-vs-a) and against curated/top20 sets.
const allComparePairs = (() => {
  const seen = new Set();
  const out = [];
  for (const pair of [...COMPARE_PAIRS, ...TOP20_COMPARE, ...SECTOR_COMPARE]) {
    const [a, b] = pair.split('-vs-');
    if (!a || !b || a === b) continue;
    const key = [a, b].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pair);
  }
  return out;
})();
// Build a UNIQUE, factual head-to-head body for a compare pair from COIN_FACTS.
// The prose varies by the two coins' real attributes (sector, age, consensus,
// use-case, market drivers) so each of the ~320 /compare pages reads differently
// instead of being a name-swapped template. Returns { intro:[], faq:[] }.
function comparePair(a, b, an, bn) {
  const fa = COIN_FACTS[a], fb = COIN_FACTS[b];
  const intro = [];
  const faq = [];
  // Deterministic phrasing picker: hash the pair to a stable index so same-sector
  // pages (e.g. all L2-vs-L2) don't share one identical templated sentence. Same
  // input → same output (prerender must be reproducible), but different pairs vary.
  const h = [...(a + b)].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);
  const pick = (arr) => arr[h % arr.length];

  if (fa && fb) {
    const la = SECTOR_LABELS[fa.sector] || fa.cat;
    const lb = SECTOR_LABELS[fb.sector] || fb.cat;
    const sameSector = fa.sector === fb.sector;

    // 1) What each is — distinct categories or same-category framing (varied).
    intro.push(
      sameSector
        ? pick([
            `${an} and ${bn} are both ${la}s, which makes this a direct head-to-head: they compete for the same users, liquidity and developer attention, so the edge comes down to execution, adoption and tokenomics rather than category.`,
            `Both ${an} and ${bn} sit in the ${la} category, so this is less about what they do and more about who does it better — the deciding factors are real usage, ecosystem depth, token supply dynamics and momentum.`,
            `${an} versus ${bn} is a same-category matchup: both are ${la}s chasing the same opportunity. With the use case held constant, traction, fees, security and tokenomics are what actually separate them.`,
          ])
        : `${an} is a ${la}${fa.year ? `, launched in ${fa.year}` : ''}, while ${bn} is a ${lb}${fb.year ? `, launched in ${fb.year}` : ''}. They serve different jobs, so "which is better" depends on whether you want exposure to ${la === lb ? 'that niche' : `the ${la} thesis or the ${lb} thesis`}.`
    );

    // 2) Technical / consensus contrast when we know both.
    if (fa.consensus && fb.consensus) {
      intro.push(
        fa.consensus === fb.consensus
          ? `Under the hood both secure their network with ${fa.consensus}, so neither has a fundamental consensus advantage — differentiation comes from throughput, fees, ecosystem size and where real on-chain activity is actually happening.`
          : `Technically they differ at the base layer: ${an} uses ${fa.consensus} while ${bn} uses ${fb.consensus}. That shapes their trade-offs around security, decentralisation, energy use and transaction throughput — and it is a key reason long-term holders pick one camp over the other.`
      );
    }

    // 3) Age / maturity angle when launch years differ enough to matter.
    if (fa.year && fb.year && Math.abs(fa.year - fb.year) >= 2) {
      const [older, younger, oy, yy] = fa.year < fb.year ? [an, bn, fa.year, fb.year] : [bn, an, fb.year, fa.year];
      intro.push(
        `${older} is the more battle-tested of the two (live since ${oy}), which usually means deeper liquidity and a longer security track record, while ${younger} (${yy}) is younger — typically higher risk but with more room to grow if it executes. Match that risk profile to your own time horizon.`
      );
    }

    // 4) What moves each — sector drivers (only add the second if it's different).
    const da = sectorDriver(a), db = sectorDriver(b);
    if (da && db) {
      intro.push(
        da === db
          ? pick([
              `Both tend to move on the same forces — ${da} — plus overall Bitcoin direction, so in practice they often rise and fall together and the question is which captures more of the upside.`,
              `Because they share a category, ${an} and ${bn} react to the same catalysts — ${da} — so relative performance, not direction, is usually the real decision.`,
              `Expect ${an} and ${bn} to be driven by the same things: ${da}. They tend to trend together, so watch which one is gaining share rather than which way the sector moves.`,
            ])
          : `${an} is driven mainly by ${da}, whereas ${bn} responds more to ${db}. Knowing which catalyst you are betting on matters more than the headline price.`
      );
    }

    // FAQ — keep the existing two "what is" entries plus a decision-oriented one.
    faq.push(
      { q: `Is ${an} or ${bn} a better investment?`, a: `Neither is universally "better" — it depends on your goals, risk tolerance and time horizon. This page compares ${an} and ${bn} across price, market cap, momentum and fundamentals with an AI verdict, but it is research, not financial advice. Many investors hold both for diversification.` },
      { q: `What is the main difference between ${an} and ${bn}?`, a: sameSector
          ? `${an} and ${bn} are both ${la}s competing in the same category; the difference is in their adoption, performance, tokenomics and momentum rather than their core purpose.`
          : `${an} is a ${la} and ${bn} is a ${lb} — they are built for different use cases, which is the single biggest factor when choosing between them.` },
      { q: `What is ${an}?`, a: fa.blurb },
      { q: `What is ${bn}?`, a: fb.blurb },
      { q: `Can I hold both ${an} and ${bn}?`, a: `Yes. ${sameSector ? `Even though they overlap, ` : `Because they target different niches, `}many investors hold both to spread risk across ${sameSector ? 'competing projects in the same sector' : 'different parts of the crypto market'}. Always size positions to your own risk tolerance.` },
    );
  } else {
    // Fallback when facts are missing for one/both assets — keep it honest.
    intro.push(`${an} vs ${bn}: a side-by-side comparison of price, market cap, trading volume, recent performance and fundamentals, plus an AI verdict on which looks stronger right now (${MONTH} ${YEAR}).`);
    faq.push(
      { q: `Is ${an} or ${bn} a better investment?`, a: `It depends on your goals and risk tolerance. This page compares ${an} and ${bn} across price, market cap, momentum and fundamentals, with an AI verdict — but it is research, not financial advice.` },
      ...(fa ? [{ q: `What is ${an}?`, a: fa.blurb }] : []),
      ...(fb ? [{ q: `What is ${bn}?`, a: fb.blurb }] : []),
    );
  }

  // Always close the intro with the on-page-data sentence so the H1 context is clear.
  intro.push(`Below, compare ${an} and ${bn} side by side on live price, market cap, trading volume and recent performance, with Oracle Bull's AI verdict on which looks stronger in ${MONTH} ${YEAR}.`);
  return { intro, faq };
}

// Resolve a coin's display name: prefer the canonical name from COINS (so `xrp`
// renders "XRP", `bnb` → "BNB"), then a small acronym override map, then titleCase.
const COMPARE_NAME_OVERRIDE = {
  xrp: 'XRP', bnb: 'BNB', zksync: 'zkSync Era', 'curve-dao-token': 'Curve DAO',
  'fetch-ai': 'Fetch.ai', 'sei-network': 'Sei', 'maker': 'Maker', 'ton': 'Toncoin',
};
const coinName = (slug) => COMPARE_NAME_OVERRIDE[slug] || (COIN_BY_SLUG[slug] && COIN_BY_SLUG[slug][1]) || titleCase(slug);

for (const pair of allComparePairs) {
  const [a, b] = pair.split('-vs-');
  const an = coinName(a), bn = coinName(b);
  const { intro, faq } = comparePair(a, b, an, bn);
  add(`/compare/${pair}`, {
    title: `${an} vs ${bn} – Which Is Better? (${MONTH} ${YEAR})`,
    description: `${an} vs ${bn} compared side by side: price, market cap, performance, fundamentals and an AI verdict on which is the stronger buy in ${MONTH} ${YEAR}.`,
    keywords: `${a} vs ${b}, ${an} vs ${bn}, ${a} or ${b}, which is better ${a} ${b}`,
    h1: `${an} vs ${bn}`,
    intro,
    faq,
    links: [
      ...(COIN_BY_SLUG[a] ? [{ href: `/price-prediction/${a}`, label: `${an} Prediction` }] : []),
      ...(COIN_BY_SLUG[b] ? [{ href: `/price-prediction/${b}`, label: `${bn} Prediction` }] : []),
      { href: '/compare', label: 'Compare More' },
    ],
  });
}

// Question-intent (/q/) pages — unique answer copy per question type
function qAnswer(name, kind) {
  const base = `Oracle Bull's AI analyzes live ${name} market data — price action, momentum, trading volume and sentiment — to answer this in real time, updated for ${MONTH} ${YEAR}.`;
  switch (kind) {
    case 'updown':
      return [
        `${base} The model weighs ${name}'s current 24-hour momentum, volume trend and relative strength versus Bitcoin to estimate the probability of an up or down move. See the live probability score and chart below.`,
        `Short-term direction can flip quickly on news and liquidity. Use the support and resistance levels on this page as your guide, and never trade on a single signal. This is research, not financial advice.`,
      ];
    case 'buy':
      return [
        `${base} Whether ${name} is a buy right now depends on your timeframe and risk tolerance — our AI breaks the decision into daily, weekly and monthly outlooks with entry zones and a live risk score.`,
        `A higher AI confidence reading with rising volume is the cleaner setup; a falling score on thin volume argues for patience. Check the live ${name} analysis above before acting. Not financial advice.`,
      ];
    case 'invest':
      return [
        `${base} For a longer horizon, ${name}'s investment case rests on adoption, liquidity, tokenomics and where it sits in the current market cycle — alongside the live momentum read on this page.`,
        `We present bull, base and bear scenarios rather than a single number, because crypto is volatile and outcomes are uncertain. Use the forecast as one input in your own research. Not financial advice.`,
      ];
    case 'week':
      return [
        `${base} For the week ahead, the AI projects a ${name} range from current momentum, weekly volatility and the key support/resistance levels shown on the chart.`,
        `Weekly forecasts are scenario ranges, not guarantees — treat the upper and lower bounds as zones to watch. Updated continuously. Not financial advice.`,
      ];
    case 'month':
      return [
        `${base} The monthly ${name} outlook blends trend, market structure and macro context into bull, base and bear scenarios for the weeks ahead.`,
        `Longer windows carry more uncertainty; use the scenario ranges and the live chart together. Not financial advice.`,
      ];
    case 'highs':
      return [
        `${base} Whether ${name} reaches a new all-time high depends on cycle position, momentum and how far price sits below its previous peak — all tracked live on this page.`,
        `Reaching new highs is a probabilistic scenario, not a certainty. We map the path and the levels that would need to break. Not financial advice.`,
      ];
    default:
      return [
        `${base} The live ${name} forecast below includes daily, weekly and monthly outlooks with support, resistance and price targets, plus a confidence score that updates as the market moves.`,
        `Use the chart and AI analysis together to gauge ${name}'s likely path. This page is research and information only — not financial advice.`,
      ];
  }
}
for (const [coinSlug, coinName] of Q_COINS) {
  const coinSym = (COIN_BY_SLUG[coinSlug] || [])[2] || coinName;
  const qFacts = coinFactSentences(coinSlug, coinName, coinSym);
  const qFactFaq = coinFactFaq(coinSlug, coinName, coinSym);
  for (const [tmpl, kind] of Q_PATTERNS) {
    const slug = tmpl.replace('{coin}', coinSlug);
    const readable = titleCase(slug);
    add(`/q/${slug}`, {
      title: `${readable} – AI Answer & Live Analysis (${MONTH} ${YEAR})`,
      description: `${readable}? Get the AI-powered answer with live ${coinName} market data, technical analysis, momentum and price targets. Updated ${MONTH} ${YEAR}. Not financial advice.`,
      keywords: `${slug.replace(/-/g, ' ')}, ${coinName} prediction, will ${coinName} go up, should i buy ${coinName}, ${coinName} forecast`,
      h1: readable,
      intro: [...qAnswer(coinName, kind), ...(qFacts.length ? [qFacts[0]] : [])],
      faq: [
        { q: `${readable}?`, a: `Our AI answers "${readable}" using real-time ${coinName} momentum, volume and sentiment, refreshed continuously. See the live analysis above for the current read. Not financial advice.` },
        { q: `Is ${coinName} a good investment right now?`, a: `${coinName}'s outlook depends on your timeframe and risk tolerance. We provide a live risk score plus daily, weekly and monthly AI forecasts to help you decide. Always do your own research.` },
        ...(qFactFaq ? [qFactFaq] : []),
      ],
      links: [
        { href: `/price-prediction/${coinSlug}`, label: `${coinName} Price Prediction` },
        { href: '/predictions', label: 'All AI Predictions' },
        { href: '/sentiment', label: 'Fear & Greed Index' },
      ],
    });
  }
}

// How-to-buy coin pages. The title promises a "Step-by-Step Guide", so the
// prerendered body must actually contain the steps (it previously had none — just
// two generic sentences). Bake real numbered steps + a fuller FAQ so these
// high-intent pages have unique, useful content and deliver on the H1.
for (const [slug, name, sym] of COINS) {
  const facts = coinFactSentences(slug, name, sym);
  const f = COIN_FACTS[slug];
  const sectorLine = f ? `${name} is a ${SECTOR_LABELS[f.sector] || f.cat}${f.year ? `, live since ${f.year}` : ''}, so it is listed on most major exchanges and is straightforward for beginners to buy.` : null;
  add(`/how-to-buy/${slug}`, {
    title: `How to Buy ${name} (${sym}) – Step-by-Step Guide (${YEAR})`,
    description: `Learn how to buy ${name} (${sym}) safely in ${YEAR}. A beginner-friendly, step-by-step guide covering exchanges, wallets, fees and security.`,
    keywords: `how to buy ${slug}, buy ${name}, ${slug} for beginners, where to buy ${slug}, best exchange for ${slug}`,
    h1: `How to Buy ${name} (${sym})`,
    intro: [
      ...(facts.length ? [facts[0]] : []),
      ...(sectorLine ? [sectorLine] : []),
      `Here is how to buy ${name} (${sym}) safely in ${YEAR}, step by step:`,
      `1. Choose a reputable, regulated exchange that lists ${sym}. Compare trading fees, withdrawal fees, supported payment methods and whether the exchange operates in your country before signing up.`,
      `2. Create your account and complete identity verification (KYC). Turn on two-factor authentication (2FA) with an authenticator app immediately — this is the single most important step for protecting your funds.`,
      `3. Fund your account. Most exchanges accept bank transfer, debit/credit card or a stablecoin deposit. Bank transfer is usually the cheapest; card is the fastest but carries higher fees.`,
      `4. Buy ${sym}. Search for ${name}, choose a market order (instant, at the current price) or a limit order (executes only at a price you set), enter the amount, and confirm. You can buy a fraction of a ${sym} — you do not need to buy a whole one.`,
      `5. Secure your ${name}. For long-term holding, withdraw to a self-custody wallet (a hardware wallet is safest) so you control the private keys, rather than leaving ${sym} on the exchange.`,
      `Always invest only what you can afford to lose, and treat ${name}'s price as volatile — this guide is educational, not financial advice.`,
    ],
    faq: [
      { q: `What is the safest way to buy ${name}?`, a: `Use a reputable, regulated exchange, enable two-factor authentication, and consider moving your ${name} (${sym}) to a hardware or self-custody wallet for long-term storage.` },
      { q: `What is the minimum amount of ${name} I can buy?`, a: `On most exchanges you can buy a small fractional amount of ${name} — often from around $1–$10 worth of ${sym}. You never need to buy a whole ${sym}.` },
      { q: `How much does it cost to buy ${name}?`, a: `Beyond the price of ${sym} itself, you pay a trading fee (typically 0.1%–1.5% depending on the exchange and payment method) and sometimes a deposit or withdrawal fee. Bank transfers are usually cheaper than card purchases.` },
      { q: `Do I need a wallet to buy ${name}?`, a: `Not to buy it — the exchange holds ${sym} for you initially. But for security and true ownership, moving ${name} to your own wallet (especially a hardware wallet for larger amounts) is strongly recommended.` },
      { q: `Is buying ${name} taxable?`, a: `Buying ${sym} with fiat is usually not a taxable event itself, but selling, swapping or spending it generally is, in most jurisdictions. Keep records of your purchases and consult a local tax professional — this is not tax advice.` },
      ...(coinFactFaq(slug, name, sym) ? [coinFactFaq(slug, name, sym)] : []),
    ],
    links: [
      { href: `/price-prediction/${slug}`, label: `${name} Prediction` },
      ...(Q_COIN_SLUGS.has(slug) ? [{ href: `/q/should-i-buy-${slug}-today`, label: `Should I Buy ${name} Today?` }] : []),
      { href: '/how-to-buy', label: 'More Buying Guides' },
    ],
  });
}

// Learn article pages — bake real title/intro/FAQ so /learn/<slug> ships with
// actual content instead of an empty SPA shell (these were sitemap'd but not
// prerendered, so crawlers saw only the homepage fallback). Driven by the
// educational-articles.json corpus so the sitemap matches what truly exists.
const LEARN_ARTICLE_SLUGS = [];
const seenLearn = new Set();
for (const art of EDU_ARTICLES) {
  if (!art || !art.slug || seenLearn.has(art.slug)) continue;
  seenLearn.add(art.slug);
  const intro = mdToIntro(art.content);
  add(`/learn/${art.slug}`, {
    title: art.metaTitle || art.title,
    description: art.metaDescription || (intro[0] || '').slice(0, 160),
    keywords: [art.primaryKeyword, ...(art.secondaryKeywords || [])].filter(Boolean).join(', '),
    h1: art.title,
    intro: intro.length ? intro : [art.metaDescription].filter(Boolean),
    faq: (art.faqs || []).map((f) => ({ q: f.question, a: f.answer })),
    article: { headline: art.title, about: 'Cryptocurrency' },
    links: [
      ...(art.relatedLinks || []).slice(0, 4).map((l) => ({ href: l.url, label: l.text })),
      { href: '/learn', label: 'More Crypto Guides' },
    ],
  });
  LEARN_ARTICLE_SLUGS.push(art.slug);
}

// Insight article pages — same treatment as /learn: bake real title/intro/FAQ so
// /insights/<slug> is indexable instead of an empty SPA shell.
const INSIGHT_ARTICLE_SLUGS = [];
const seenInsight = new Set();
for (const art of INSIGHTS) {
  if (!art || !art.slug || seenInsight.has(art.slug)) continue;
  seenInsight.add(art.slug);
  const intro = mdToIntro(art.content);
  const takeaways = Array.isArray(art.takeaways) ? art.takeaways : [];
  add(`/insights/${art.slug}`, {
    title: art.metaTitle || art.title,
    description: art.metaDescription || (intro[0] || '').slice(0, 160),
    keywords: [art.primaryKeyword, ...(art.secondaryKeywords || [])].filter(Boolean).join(', '),
    h1: art.title,
    intro: [
      ...(intro.length ? intro : [art.metaDescription].filter(Boolean)),
      ...(takeaways.length ? ['Key takeaways: ' + takeaways.join(' ')] : []),
    ],
    faq: (art.faqs || []).map((f) => ({ q: f.question, a: f.answer })),
    article: { headline: art.title, about: 'Cryptocurrency' },
    links: [
      { href: '/insights', label: 'More Market Analysis' },
      { href: '/predictions', label: 'AI Price Predictions' },
      { href: '/sentiment', label: 'Fear & Greed Index' },
    ],
  });
  INSIGHT_ARTICLE_SLUGS.push(art.slug);
}

// ── HTML builders ─────────────────────────────────────────────────────────────
function renderContent(def, routePath) {
  const paras = (def.intro || []).map((p) => `<p style="margin:0 0 14px;line-height:1.6;">${esc(p)}</p>`).join('');
  const faqHtml = (def.faq && def.faq.length)
    ? `<section style="margin-top:28px;"><h2 style="font-size:20px;margin:0 0 12px;">Frequently Asked Questions</h2>${def.faq.map((f) => `<div style="margin-bottom:14px;"><h3 style="font-size:16px;margin:0 0 4px;">${esc(f.q)}</h3><p style="margin:0;line-height:1.6;opacity:.85;">${esc(f.a)}</p></div>`).join('')}</section>`
    : '';
  const linksHtml = (def.links && def.links.length)
    ? `<nav aria-label="Related pages" style="margin-top:28px;"><h2 style="font-size:18px;margin:0 0 10px;">Explore more</h2><ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:10px;">${def.links.map((l) => `<li><a href="${esc(l.href)}" style="color:#2563eb;text-decoration:underline;">${esc(l.label)}</a></li>`).join('')}</ul></nav>`
    : '';
  // This block lives inside #root; React (createRoot) replaces it on mount.
  return `<div id="seo-prerender" style="max-width:880px;margin:0 auto;padding:32px 20px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1e293b;">
<header><a href="/" style="font-weight:700;color:#2563eb;text-decoration:none;">Oracle Bull</a></header>
<main>
<h1 style="font-size:30px;line-height:1.2;margin:18px 0 14px;">${esc(def.h1)}</h1>
${paras}
${faqHtml}
${linksHtml}
</main>
<footer style="margin-top:32px;font-size:12px;opacity:.6;">Oracle Bull — free AI crypto analytics. Not financial advice.</footer>
</div>`;
}

function buildJsonLd(def, routePath) {
  const blocks = [];
  blocks.push(webPageJsonLd(routePath, def.title, def.description));
  const bc = breadcrumbJsonLd(routePath);
  if (bc) blocks.push(bc);
  const faq = faqJsonLd(def.faq);
  if (faq) blocks.push(faq);
  if (def.article) {
    blocks.push({
      '@context': 'https://schema.org', '@type': 'AnalysisNewsArticle',
      headline: def.article.headline, description: def.description,
      url: `${BASE_URL}${routePath}`, datePublished: ISO, dateModified: ISO,
      author: { '@type': 'Organization', name: 'Oracle Bull' },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: { '@type': 'Thing', name: def.article.about }, inLanguage: 'en-US',
    });
  }
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n');
}

function applyRoute(template, routePath, def) {
  // `def.canonicalPath` lets alias/duplicate routes point their canonical at the
  // primary page (avoids duplicate-content signals while still serving real HTML).
  const canonical = `${BASE_URL}${def.canonicalPath || (routePath === '/' ? '/' : routePath)}`;
  let html = template;
  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(def.title)}</title>`);
  // description (first match)
  html = html.replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${esc(def.description)}">`);
  // keywords
  if (def.keywords) {
    if (/<meta\s+name="keywords"[^>]*>/.test(html)) {
      html = html.replace(/<meta\s+name="keywords"[^>]*>/, `<meta name="keywords" content="${esc(def.keywords)}">`);
    }
  }
  // og:title / og:description / og:url (replace all)
  html = html.replace(/<meta\s+property="og:title"[^>]*>/g, `<meta property="og:title" content="${esc(def.title)}">`);
  html = html.replace(/<meta\s+property="og:description"[^>]*>/g, `<meta property="og:description" content="${esc(def.description)}">`);
  html = html.replace(/<meta\s+property="og:url"[^>]*>/g, `<meta property="og:url" content="${esc(canonical)}">`);
  // Inject canonical + twitter + JSON-LD before </head>
  const headInject =
    `<link rel="canonical" href="${esc(canonical)}">\n` +
    `<meta name="twitter:card" content="summary_large_image">\n` +
    `<meta name="twitter:title" content="${esc(def.title)}">\n` +
    `<meta name="twitter:description" content="${esc(def.description)}">\n` +
    `<meta name="twitter:image" content="${esc(OG_IMAGE)}">\n` +
    buildJsonLd(def, routePath) + '\n';
  html = html.replace('</head>', headInject + '</head>');
  // Replace the boot-fallback block inside #root with real content
  html = html.replace(/<div id="boot-fallback"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, renderContent(def, routePath));
  // Replace the generic, identical-on-every-page <noscript> SEO block with a
  // per-route version so each page is unique (avoids duplicate-content signal).
  // Uses <h2> (not <h1>) because the prerendered #seo-prerender block above
  // already provides the single page <h1>; this keeps exactly one h1 per page.
  const perRouteNoscript = `<noscript><div style="max-width:880px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;"><h2>${esc(def.h1)}</h2><p>${esc((def.intro && def.intro[0]) || def.description)}</p><p><a href="/">Oracle Bull</a> — free AI crypto analytics.</p></div></noscript>`;
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, perRouteNoscript);
  return html;
}

function writeRoute(routePath, html) {
  const target = routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, 'utf8');
}

function generateSitemap(paths) {
  const urls = paths.map((p) => {
    const isCore = p === '/' || ['/dashboard', '/predictions', '/price-prediction'].includes(p) || p.startsWith('/price-prediction/');
    const priority = p === '/' ? '1.0' : p.startsWith('/price-prediction/') || p.startsWith('/market/') ? '0.9' : isCore ? '0.9' : '0.7';
    const cf = p.startsWith('/price-prediction/') || p.startsWith('/market/') || p.startsWith('/chain/') ? 'daily' : 'weekly';
    return `  <url><loc>${BASE_URL}${p === '/' ? '/' : p}</loc><lastmod>${TODAY}</lastmod><changefreq>${cf}</changefreq><priority>${priority}</priority></url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ── Internal-link sanitization ─────────────────────────────────────────────────
// Article corpora (educational-articles.json, insightsArticles.ts) contain
// relatedLinks that occasionally point to sibling articles that were never
// written, producing crawl-time 404s (e.g. /learn/what-is-ethereum-staking-…).
// Prune any link whose href lives in a PRERENDERED namespace but has no matching
// route. SPA-only routes (/strength, /factory/*, dynamic detail pages) are left
// untouched so we never strip a valid app link. Add-only: drops dead links,
// removes no features.
const PRERENDERED_NS = ['/learn/', '/insights/', '/price-prediction/', '/compare/', '/q/', '/market/', '/chain/', '/how-to-buy/'];
const knownRoutes = new Set(Object.keys(routes).map((r) => r.replace(/\/$/, '') || '/'));
let prunedLinks = 0;
for (const def of Object.values(routes)) {
  if (!def.links || !def.links.length) continue;
  const before = def.links.length;
  def.links = def.links.filter((l) => {
    const href = (l.href || '').split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    if (!href.startsWith('/')) return true; // external — leave it
    const inNs = PRERENDERED_NS.some((ns) => (href + '/').startsWith(ns) || href === ns.replace(/\/$/, ''));
    if (!inNs) return true; // not a prerendered-namespace link → leave it (SPA route)
    return knownRoutes.has(href);
  });
  prunedLinks += before - def.links.length;
}
if (prunedLinks) console.log(`[seo-prerender] pruned ${prunedLinks} dead internal links (missing prerendered targets).`);

// ── Run ───────────────────────────────────────────────────────────────────────
try {
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.warn('[seo-prerender] dist/index.html not found — skipping.');
    process.exit(0);
  }
  const template = fs.readFileSync(templatePath, 'utf8');
  const allPaths = Object.keys(routes);
  let ok = 0;
  for (const routePath of allPaths) {
    try {
      writeRoute(routePath, applyRoute(template, routePath, routes[routePath]));
      ok++;
    } catch (e) {
      console.warn(`[seo-prerender] failed ${routePath}: ${e.message}`);
    }
  }
  // Sitemap = everything we actually prerendered, EXCEPT alias pages whose
  // canonical points elsewhere (listing a non-canonical URL in the sitemap is a
  // best-practice violation — Google should only see the primary URL there).
  // allPaths now includes the /learn AND /insights article pages (emitted from
  // their corpora), so we only fall back to INSIGHT_SLUGS if the TS corpus failed
  // to load.
  const selfCanonicalPaths = allPaths.filter((p) => {
    const def = routes[p];
    return !def.canonicalPath || def.canonicalPath === p;
  });
  const sitemapPaths = INSIGHT_ARTICLE_SLUGS.length
    ? [...selfCanonicalPaths]
    : [...selfCanonicalPaths, ...INSIGHT_SLUGS.map((s) => `/insights/${s}`)];
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemap([...new Set(sitemapPaths)]), 'utf8');
  console.log(`[seo-prerender] ✅ Prerendered ${ok}/${allPaths.length} routes + sitemap (${new Set(sitemapPaths).size} URLs).`);
} catch (err) {
  console.warn('[seo-prerender] non-fatal error:', err.message);
  process.exit(0);
}
