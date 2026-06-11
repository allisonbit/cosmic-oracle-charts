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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://oraclebull.com';
const OG_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/uDg0k7BDXGRxsHZqK6gSbdN9o0l1/social-images/social-1765566965381-WhatsApp Image 2025-12-12 at 10.50.30_d13b6f53.jpg';

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
];
const YEARS = [2026, 2027, 2028, 2030];
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
  'bitcoin-vs-xrp', 'ethereum-vs-bnb', 'solana-vs-cardano', 'xrp-vs-cardano',
  'avalanche-vs-polygon', 'arbitrum-vs-optimism', 'sui-vs-aptos', 'pepe-vs-shiba-inu',
  'dogecoin-vs-pepe', 'litecoin-vs-bitcoin-cash', 'cosmos-vs-polkadot', 'fetch-ai-vs-bittensor',
  'render-vs-fetch-ai', 'injective-vs-sei-network', 'aave-vs-maker', 'uniswap-vs-curve-dao-token',
  'ethena-vs-ondo-finance', 'starknet-vs-zksync', 'ton-vs-solana', 'kaspa-vs-bitcoin',
  'tron-vs-ethereum', 'monero-vs-zcash', 'hedera-vs-stellar', 'algorand-vs-cardano',
];
const LEARN_SLUGS = [
  'what-is-crypto-market-sentiment', 'how-ai-is-used-in-crypto-market-analysis',
  'bitcoin-market-cycles-explained', 'risk-management-in-volatile-crypto-markets',
  'how-to-analyze-altcoins-using-market-data', 'technical-analysis-vs-sentiment-analysis',
  'on-chain-data-explained-for-beginners', 'how-market-psychology-affects-crypto-prices',
  'how-whales-influence-market-trends', 'understanding-liquidity-in-crypto-markets',
  'what-is-bitcoin-halving-and-why-does-it-matter', 'how-to-read-crypto-candlestick-charts',
  'what-is-defi-decentralized-finance-explained', 'what-is-a-crypto-wallet-and-how-to-use-it',
  'how-to-spot-a-crypto-bull-market', 'how-to-spot-a-crypto-bear-market',
  'what-is-ethereum-staking-explained', 'what-are-layer-2-blockchains',
  'what-is-tokenomics-explained', 'how-to-read-a-crypto-whitepaper',
  'what-is-market-capitalization-in-crypto', 'dollar-cost-averaging-dca-strategy-for-crypto',
  'how-to-use-stop-loss-orders-in-crypto-trading', 'crypto-tax-basics-what-you-need-to-know',
  'what-is-a-crypto-airdrop-and-how-to-get-one', 'how-to-buy-bitcoin-for-beginners',
  'proof-of-work-vs-proof-of-stake', 'what-is-a-blockchain-explained-simply',
  'crypto-portfolio-diversification-strategy', 'how-to-identify-crypto-scams',
  'what-are-stablecoins-and-how-do-they-work',
];

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
  ],
  links: toolLinks,
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
  ],
  links: toolLinks,
});
add('/explorer', {
  title: `Crypto Token Explorer – Search Any Coin by Name or Contract (${MONTH} ${YEAR})`,
  description: 'Search 10,000+ tokens by name, symbol or contract address. Price charts, holder analysis, liquidity depth & DeFi metrics across 30+ blockchains. Free.',
  keywords: 'crypto token explorer, search cryptocurrency, token contract lookup, defi token scanner',
  h1: 'Crypto Token Explorer',
  intro: ['Search any cryptocurrency by name, symbol or contract address and get instant price charts, holder analysis, liquidity depth and DeFi metrics across 30+ blockchains.'],
  links: toolLinks,
});
add('/factory', {
  title: `Crypto Factory – Market Events, Whale Alerts & On-Chain Intel (${MONTH} ${YEAR})`,
  description: 'Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto.',
  keywords: 'crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto',
  h1: 'Crypto Factory — Market Events & On-Chain Intel',
  intro: ['A real-time feed of everything that moves the market: token launches, protocol upgrades, airdrops, whale movements and trending narratives — the crypto equivalent of Forex Factory.'],
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
  intro: ['Free, beginner-friendly crypto education covering Bitcoin, DeFi, technical analysis, on-chain data, risk management and trading strategy.'],
  links: LEARN_SLUGS.slice(0, 12).map((s) => ({ href: `/learn/${s}`, label: titleCase(s) })),
});
add('/insights', {
  title: `Crypto Market Analysis Today – AI-Powered Daily Insights (${MONTH} ${YEAR})`,
  description: 'Daily AI market analysis for Bitcoin, Ethereum, Solana & altcoins. On-chain data, technical indicators & expert research. Updated daily, always free.',
  keywords: 'crypto analysis today, daily crypto insights, bitcoin market analysis, crypto research',
  h1: `Crypto Market Analysis & Insights (${MONTH} ${YEAR})`,
  intro: ['Daily AI-generated market analysis covering Bitcoin, Ethereum, Solana and the broader altcoin market — combining on-chain data, technical indicators and sentiment.'],
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
    { href: '/airdrops/linea', label: 'Linea Airdrop Guide' },
    { href: '/airdrops/monad', label: 'Monad Airdrop Guide' },
    { href: '/airdrops/berachain', label: 'Berachain Airdrop Guide' },
    { href: '/airdrops/base', label: 'Base Airdrop Guide' },
    { href: '/crypto-factory', label: 'Crypto Factory' },
    { href: '/crypto-strength-meter', label: 'Strength Meter' },
  ],
});
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
add('/tools', polymarketDef);
add('/polymarket', polymarketDef);
add('/compare', {
  title: 'Compare Cryptocurrencies Side by Side | Oracle Bull',
  description: 'Compare any two cryptocurrencies side by side: price, market cap, performance, fundamentals and AI verdict. Make informed decisions.',
  keywords: 'compare crypto, crypto comparison, bitcoin vs ethereum, which crypto is better',
  h1: 'Compare Cryptocurrencies',
  intro: ['Put any two coins head-to-head: price, market cap, volume, performance, fundamentals and an AI verdict on which is stronger right now.'],
  links: COMPARE_PAIRS.map((p) => ({ href: `/compare/${p}`, label: titleCase(p) })),
});
add('/how-to-buy', {
  title: 'How to Buy Cryptocurrency – Beginner Guides | Oracle Bull',
  description: 'Step-by-step guides on how to buy Bitcoin, Ethereum, Solana and more — safely, for beginners.',
  keywords: 'how to buy crypto, how to buy bitcoin, buy ethereum, crypto for beginners',
  h1: 'How to Buy Cryptocurrency',
  intro: ['Clear, beginner-friendly, step-by-step guides on how to buy the most popular cryptocurrencies safely.'],
  links: COINS.slice(0, 8).map(([s, n]) => ({ href: `/how-to-buy/${s}`, label: `How to Buy ${n}` })),
});
// Factory subpages
const factorySub = {
  '/factory/events': ['Crypto Events Calendar', 'Token launches, protocol upgrades, airdrops, governance votes and market-moving announcements — the crypto calendar traders rely on.'],
  '/factory/onchain': ['On-Chain Intelligence', 'Real-time whale movements, large transfers, smart-money accumulation and exchange in/outflows.'],
  '/factory/narratives': ['Crypto Market Narratives', 'Track trending sectors — AI tokens, DeFi, RWA, meme coins, Layer 2s — and spot rotation early.'],
  '/factory/news': ['Crypto News Today', 'Breaking crypto news from 50+ sources with real-time sentiment scoring.'],
};
for (const [p, [h1, blurb]] of Object.entries(factorySub)) {
  add(p, {
    title: `${h1} (${MONTH} ${YEAR}) | Oracle Bull`,
    description: blurb, keywords: `${h1.toLowerCase()}, crypto ${p.split('/').pop()}`,
    h1, intro: [blurb], links: [{ href: '/factory', label: 'Crypto Factory' }, ...toolLinks.slice(0, 4)],
  });
}
// Tools subpages
const toolPages = {
  '/tools/profit-calculator': ['Crypto Profit Calculator', 'Calculate exact trading profit and ROI, accounting for exchange fees on both entry and exit.'],
  '/tools/dca-calculator': ['Crypto DCA Calculator', 'Model a dollar-cost-averaging strategy and project returns across a schedule.'],
  '/tools/impermanent-loss-calculator': ['Impermanent Loss Calculator', 'Calculate impermanent loss for AMM liquidity pools before you provide liquidity.'],
};
for (const [p, [h1, blurb]] of Object.entries(toolPages)) {
  add(p, {
    title: `${h1} – Free Tool | Oracle Bull`,
    description: blurb, keywords: `${h1.toLowerCase()}, crypto calculator, free crypto tool`,
    h1, intro: [blurb], links: [{ href: '/tools', label: 'All Tools' }, ...toolLinks.slice(0, 4)],
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
  const related = COINS.filter((c) => c[0] !== slug).slice(0, 6).map(([s, n]) => ({ href: `/price-prediction/${s}`, label: `${n} Prediction` }));
  add(`/price-prediction/${slug}`, {
    title: `${name} (${sym}) Price Prediction ${MONTH} ${YEAR} – AI Forecast & Targets`,
    description: `${name} price prediction for ${MONTH} ${YEAR}. AI-powered ${name} (${sym}) forecast with entry zones, support/resistance levels, bull/bear targets & confidence scores. Updated live.`,
    keywords: `${slug} price prediction, ${name} forecast, will ${slug} go up, ${slug} price target, should i buy ${slug}`,
    h1: `${name} (${sym}) Price Prediction — ${MONTH} ${YEAR}`,
    intro: [
      `Looking for the latest ${name} price prediction? Oracle Bull's AI analyzes live ${name} (${sym}) market data — price action, momentum, volume, volatility and sentiment — to produce daily, weekly and monthly forecasts with support/resistance levels and bull/bear targets.`,
      `This page updates continuously. Use the live chart and AI analysis to gauge whether ${name} is likely to go up or down, and where the key entry and exit zones are.`,
    ],
    faq: [
      { q: `What is the ${name} price prediction for ${MONTH} ${YEAR}?`, a: `Our AI model forecasts ${name} (${sym}) using real-time market data, technical analysis and sentiment. See the live chart above for exact support, resistance and target levels for ${MONTH} ${YEAR}.` },
      { q: `Will ${name} go up?`, a: `The model analyzes ${name}'s current momentum, volume and sentiment to estimate the probability of an up or down move across daily, weekly and monthly timeframes.` },
      { q: `Is ${name} a good investment right now?`, a: `${name}'s investment potential depends on your timeframe and risk tolerance. We provide a real-time risk score plus daily, weekly and monthly AI forecasts to help you decide. This is not financial advice.` },
    ],
    article: { headline: `${name} Price Prediction – AI Forecast ${MONTH} ${YEAR}`, about: name },
    links: [...related, { href: '/predictions', label: 'All Predictions' }, { href: `/how-to-buy/${slug}`, label: `How to Buy ${name}` }],
  });
  // Year predictions for a subset
  if (['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin', 'cardano', 'bnb', 'avalanche', 'chainlink', 'polkadot', 'shiba-inu', 'pepe', 'sui', 'arbitrum', 'near', 'litecoin', 'polygon', 'tron'].includes(slug)) {
    for (const yr of YEARS) {
      add(`/price-prediction/${slug}/${yr}`, {
        title: `${name} (${sym}) Price Prediction ${yr} – Long-Term AI Forecast`,
        description: `${name} price prediction for ${yr}. Long-term ${name} (${sym}) forecast, price targets and scenario analysis based on adoption trends, cycles and AI modeling.`,
        keywords: `${slug} price prediction ${yr}, ${name} ${yr} forecast, ${slug} price target ${yr}, will ${slug} reach new highs`,
        h1: `${name} (${sym}) Price Prediction ${yr}`,
        intro: [
          `What could ${name} be worth in ${yr}? This long-term ${name} (${sym}) forecast combines historical market cycles, adoption trends and AI scenario modeling to map out bull, base and bear cases for ${yr}.`,
          `Long-term crypto forecasts are inherently uncertain — treat these as scenario ranges for research, not guarantees.`,
        ],
        faq: [
          { q: `What will ${name} be worth in ${yr}?`, a: `Our ${yr} ${name} forecast presents bull, base and bear scenarios derived from market cycles, adoption trends and AI modeling. See the scenario ranges on this page.` },
          { q: `Will ${name} reach a new all-time high by ${yr}?`, a: `The ${yr} outlook weighs ${name}'s historical cycle behavior and momentum to estimate the likelihood of new highs. It is a probabilistic scenario, not financial advice.` },
        ],
        links: [{ href: `/price-prediction/${slug}`, label: `${name} Prediction` }, { href: '/predictions', label: 'All Predictions' }],
      });
    }
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
      `Use the live rankings and analysis on this page to inform your research. Nothing here is financial advice.`,
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
for (const pair of [...new Set([...COMPARE_PAIRS, ...TOP20_COMPARE])]) {
  const [a, b] = pair.split('-vs-');
  const an = titleCase(a), bn = titleCase(b);
  add(`/compare/${pair}`, {
    title: `${an} vs ${bn} – Which Is Better? (${MONTH} ${YEAR})`,
    description: `${an} vs ${bn} compared side by side: price, market cap, performance, fundamentals and an AI verdict on which is the stronger buy in ${MONTH} ${YEAR}.`,
    keywords: `${a} vs ${b}, ${an} vs ${bn}, ${a} or ${b}, which is better ${a} ${b}`,
    h1: `${an} vs ${bn}`,
    intro: [
      `${an} vs ${bn}: a side-by-side comparison of price, market cap, trading volume, recent performance and fundamentals, plus an AI verdict on which looks stronger right now (${MONTH} ${YEAR}).`,
    ],
    faq: [{ q: `Is ${an} or ${bn} a better investment?`, a: `It depends on your goals and risk tolerance. This page compares ${an} and ${bn} across price, market cap, momentum and fundamentals, with an AI verdict — but it is research, not financial advice.` }],
    links: [{ href: `/price-prediction/${a}`, label: `${an} Prediction` }, { href: `/price-prediction/${b}`, label: `${bn} Prediction` }, { href: '/compare', label: 'Compare More' }],
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
  for (const [tmpl, kind] of Q_PATTERNS) {
    const slug = tmpl.replace('{coin}', coinSlug);
    const readable = titleCase(slug);
    add(`/q/${slug}`, {
      title: `${readable} – AI Answer & Live Analysis (${MONTH} ${YEAR})`,
      description: `${readable}? Get the AI-powered answer with live ${coinName} market data, technical analysis, momentum and price targets. Updated ${MONTH} ${YEAR}. Not financial advice.`,
      keywords: `${slug.replace(/-/g, ' ')}, ${coinName} prediction, will ${coinName} go up, should i buy ${coinName}, ${coinName} forecast`,
      h1: readable,
      intro: qAnswer(coinName, kind),
      faq: [
        { q: `${readable}?`, a: `Our AI answers "${readable}" using real-time ${coinName} momentum, volume and sentiment, refreshed continuously. See the live analysis above for the current read. Not financial advice.` },
        { q: `Is ${coinName} a good investment right now?`, a: `${coinName}'s outlook depends on your timeframe and risk tolerance. We provide a live risk score plus daily, weekly and monthly AI forecasts to help you decide. Always do your own research.` },
      ],
      links: [
        { href: `/price-prediction/${coinSlug}`, label: `${coinName} Price Prediction` },
        { href: '/predictions', label: 'All AI Predictions' },
        { href: '/sentiment', label: 'Fear & Greed Index' },
      ],
    });
  }
}

// How-to-buy coin pages
for (const [slug, name, sym] of COINS) {
  add(`/how-to-buy/${slug}`, {
    title: `How to Buy ${name} (${sym}) – Step-by-Step Guide (${YEAR})`,
    description: `Learn how to buy ${name} (${sym}) safely in ${YEAR}. A beginner-friendly, step-by-step guide covering exchanges, wallets, fees and security.`,
    keywords: `how to buy ${slug}, buy ${name}, ${slug} for beginners, where to buy ${slug}`,
    h1: `How to Buy ${name} (${sym})`,
    intro: [
      `A beginner-friendly, step-by-step guide to buying ${name} (${sym}) safely: choosing a reputable exchange, creating and securing an account, funding it, placing your order, and moving ${name} to a self-custody wallet.`,
    ],
    faq: [{ q: `What is the safest way to buy ${name}?`, a: `Use a reputable, regulated exchange, enable two-factor authentication, and consider moving your ${name} (${sym}) to a hardware or self-custody wallet for long-term storage.` }],
    links: [{ href: `/price-prediction/${slug}`, label: `${name} Prediction` }, { href: '/how-to-buy', label: 'More Buying Guides' }],
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
  const canonical = `${BASE_URL}${routePath === '/' ? '/' : routePath}`;
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
  const perRouteNoscript = `<noscript><div style="max-width:880px;margin:0 auto;padding:24px;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;"><h1>${esc(def.h1)}</h1><p>${esc((def.intro && def.intro[0]) || def.description)}</p><p><a href="/">Oracle Bull</a> — free AI crypto analytics.</p></div></noscript>`;
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
  // Sitemap = everything we actually prerendered. allPaths now includes the
  // /learn AND /insights article pages, so we no longer emit the stale hardcoded
  // LEARN_SLUGS, and only fall back to INSIGHT_SLUGS if the TS corpus failed to load.
  const sitemapPaths = INSIGHT_ARTICLE_SLUGS.length
    ? [...allPaths]
    : [...allPaths, ...INSIGHT_SLUGS.map((s) => `/insights/${s}`)];
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemap([...new Set(sitemapPaths)]), 'utf8');
  console.log(`[seo-prerender] ✅ Prerendered ${ok}/${allPaths.length} routes + sitemap (${new Set(sitemapPaths).size} URLs).`);
} catch (err) {
  console.warn('[seo-prerender] non-fatal error:', err.message);
  process.exit(0);
}
