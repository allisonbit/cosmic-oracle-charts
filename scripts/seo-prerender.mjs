// SEO prerender: writes a static index.html per crawlable URL into dist/.
// Runs after `vite build`. Each page gets:
//   - its own <title> (≤65 chars), meta description, canonical, OG/Twitter tags
//   - JSON-LD (WebPage + Breadcrumbs; WebSite + Organization on home)
//   - a static crawlable <body> block: <h1>, intro paragraph, contextual
//     internal links and a global "explore" link footer — all inside #root,
//     so React replaces it on hydration (users see nothing, crawlers see a
//     real page and a full internal-link graph).
//
// Meta is derived from the same enumeration as generate-sitemap.js — the two
// must stay in sync (same URL set, same canonical domain).

import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const TEMPLATE_PATH = path.join(DIST, "index.html");
const BASE = "https://oraclebull.com";
const BRAND = " | Oracle Bull";

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error("[seo-prerender] dist/index.html not found — run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

// Title + brand suffix, word-trimmed to the 65-char SERP limit.
function T(core) {
  const measure = (t) => esc(t).length;
  if (measure(core + BRAND) <= 65) return core + BRAND;
  let c = core;
  while (c.length > 0 && measure(c + BRAND) > 65) {
    const cut = c.lastIndexOf(" ");
    if (cut <= 0) { c = c.slice(0, 50); break; }
    c = c.slice(0, cut);
  }
  return c + BRAND;
}
const D = (s) => (s.length > 165 ? s.slice(0, 162).replace(/\s+\S*$/, "") + "…" : s);

// Slug aliases: routing slugs used by some families → the canonical
// CoinGecko-style id other families' URLs are built from.
const ALIAS = {
  bnb: "binancecoin", xrp: "ripple", polygon: "matic-network",
  avalanche: "avalanche-2", ondo: "ondo-finance", jupiter: "jupiter-exchange-solana",
  worldcoin: "worldcoin-wld", sei: "sei-network", injective: "injective-protocol",
  theta: "theta-token", render: "render-token", dogwifhat: "dogwifcoin",
};
const canonicalCoin = (c) => ALIAS[c] ?? c;

const COIN_NAMES = {
  bitcoin: "Bitcoin", ethereum: "Ethereum", solana: "Solana", binancecoin: "BNB",
  ripple: "XRP", xrp: "XRP", bnb: "BNB", cardano: "Cardano", dogecoin: "Dogecoin",
  polkadot: "Polkadot", chainlink: "Chainlink", "avalanche-2": "Avalanche",
  avalanche: "Avalanche", "matic-network": "Polygon", polygon: "Polygon",
  "shiba-inu": "Shiba Inu", litecoin: "Litecoin", uniswap: "Uniswap",
  cosmos: "Cosmos", near: "NEAR", arbitrum: "Arbitrum", optimism: "Optimism",
  aptos: "Aptos", sui: "Sui", pepe: "Pepe", floki: "Floki", bonk: "Bonk",
  toncoin: "Toncoin", tron: "TRON", stellar: "Stellar", monero: "Monero",
  okb: "OKB", hedera: "Hedera", filecoin: "Filecoin", vechain: "VeChain",
  "internet-computer": "Internet Computer", "render-token": "Render",
  render: "Render", "fetch-ai": "Fetch.ai", "injective-protocol": "Injective",
  injective: "Injective", kaspa: "Kaspa", "theta-token": "Theta", theta: "Theta",
  aave: "Aave", maker: "Maker", "lido-dao": "Lido DAO", "the-graph": "The Graph",
  ens: "ENS", "immutable-x": "Immutable X", gala: "Gala",
  "worldcoin-wld": "Worldcoin", worldcoin: "Worldcoin", "sei-network": "Sei",
  sei: "Sei", celestia: "Celestia", "jupiter-exchange-solana": "Jupiter",
  jupiter: "Jupiter", "jito-governance-token": "Jito", "pyth-network": "Pyth",
  wormhole: "Wormhole", "ondo-finance": "Ondo", ondo: "Ondo", ethena: "Ethena",
  pendle: "Pendle", eigenlayer: "EigenLayer", starknet: "Starknet",
  zksync: "zkSync", mantle: "Mantle", "mantra-dao": "MANTRA",
  bittensor: "Bittensor", "akash-network": "Akash", arweave: "Arweave",
  helium: "Helium", iota: "IOTA", eos: "EOS", neo: "NEO", zilliqa: "Zilliqa",
  algorand: "Algorand", "elrond-erd-2": "MultiversX", "quant-network": "Quant",
  fantom: "Fantom", decentraland: "Decentraland", "the-sandbox": "The Sandbox",
  "axie-infinity": "Axie Infinity", enjincoin: "Enjin", "flow-token": "Flow",
  "mina-protocol": "Mina", "oasis-network": "Oasis", celo: "Celo",
  harmony: "Harmony", kava: "Kava", thorchain: "THORChain", "1inch": "1inch",
  sushi: "SushiSwap", "compound-governance-token": "Compound",
  "yearn-finance": "Yearn Finance", "curve-dao-token": "Curve DAO",
  balancer: "Balancer", "synthetix-network-token": "Synthetix",
  "rocket-pool": "Rocket Pool", "frax-share": "Frax Share",
  "convex-finance": "Convex Finance", "ribbon-finance": "Ribbon Finance",
  gmx: "GMX", dydx: "dYdX", "pancakeswap-token": "PancakeSwap",
  raydium: "Raydium", orca: "Orca", "marinade-staked-sol": "Marinade Staked SOL",
  trump: "OFFICIAL TRUMP", melania: "MELANIA", brett: "Brett", popcat: "Popcat",
  "wen-4": "WEN", "cat-in-a-dogs-world": "Cats in a Dogs World",
  solayer: "Solayer", grass: "Grass", ai16z: "AI16Z",
  "virtual-protocol": "Virtuals Protocol", griffain: "GRIFFAIN",
  dogwifcoin: "dogwifcoin", dogwifhat: "dogwifhat",
};
const coinName = (id) =>
  COIN_NAMES[id] ||
  id.split("-").map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ");

const titleCase = (slug) =>
  slug.split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

const fmtTarget = (t) => {
  const n = Number(t);
  if (!isFinite(n)) return "$" + t;
  return n >= 1000 ? "$" + n.toLocaleString("en-US") : "$" + t;
};

// ── page model ─────────────────────────────────────────────────────────────
// pages: { path, title, description, h1, intro, links: [{href, text}] }
const pages = [];
function add(path, title, description, h1, intro, links = []) {
  pages.push({ path, title: T(title), description: D(description), h1, intro, links });
}

// ── URL enumeration (mirrors generate-sitemap.js) ─────────────────────────
const topCryptos = [
  "bitcoin","ethereum","solana","binancecoin","ripple","cardano","dogecoin","polkadot",
  "chainlink","avalanche-2","matic-network","shiba-inu","litecoin","uniswap","cosmos",
  "near","arbitrum","optimism","aptos","sui","pepe","floki","bonk","toncoin","tron",
  "stellar","monero","okb","hedera","filecoin","vechain","internet-computer",
  "render-token","fetch-ai","injective-protocol","kaspa","theta-token","aave",
  "maker","lido-dao","the-graph","ens","immutable-x","gala","worldcoin-wld",
  "sei-network","celestia","jupiter-exchange-solana","jito-governance-token",
  "pyth-network","wormhole","ondo-finance","ethena","pendle","eigenlayer",
  "starknet","zksync","mantle","mantra-dao","bittensor","akash-network",
  "arweave","helium","iota","eos","neo","zilliqa","algorand","elrond-erd-2",
  "quant-network","fantom","decentraland","the-sandbox","axie-infinity",
  "enjincoin","flow-token","mina-protocol","oasis-network","celo","harmony",
  "kava","thorchain","1inch","sushi","compound-governance-token","yearn-finance",
  "curve-dao-token","balancer","synthetix-network-token","rocket-pool",
  "frax-share","convex-finance","ribbon-finance","gmx","dydx",
  "pancakeswap-token","raydium","orca","marinade-staked-sol","trump","melania",
  "brett","popcat","wen-4","cat-in-a-dogs-world","solayer","grass",
  "ai16z","virtual-protocol","griffain","dogwifcoin",
];
const years = [2026, 2027, 2028, 2030];
const top30 = topCryptos.slice(0, 30);
const top50 = topCryptos.slice(0, 50);
const TF_LABEL = { daily: "Today", weekly: "This Week", monthly: "This Month" };

const STATIC_SEO = {
  "/dashboard": [
    "Crypto Dashboard — Live Prices, Fear & Greed",
    "One live view of the crypto market: real-time prices, global market cap, the Fear & Greed index and today's top gainers and losers — free, no signup.",
    "Crypto Dashboard",
  ],
  "/predictions": [
    "AI Crypto Predictions — Live Token Analysis",
    "Live technical forecasts for 1,000+ tokens: trend bias, conviction score, entry zones, stop-loss and take-profit levels computed from real-time market data.",
    "AI Crypto Predictions",
  ],
  "/sentiment": [
    "Crypto Sentiment — Fear, Greed & Psychology",
    "Gauge the market's mood: live Fear & Greed index, momentum breadth, volatility read and trend alignment across the top 250 coins — updated continuously.",
    "Crypto Sentiment Dashboard",
  ],
  "/crypto-strength-meter": [
    "Crypto Strength Meter — Live Momentum Rankings",
    "Rank the top 250 cryptocurrencies by live momentum strength across 1-hour, 24-hour and 7-day timeframes. Spot what's actually moving right now.",
    "Crypto Strength Meter",
  ],
  "/scanner": [
    "Crypto Token Scanner — Tokens, CEX & DEX",
    "Scan tokens across chains and exchanges with live price, volume and liquidity data. Filter the whole market in seconds — free, no wallet needed.",
    "Crypto Token Scanner",
  ],
  "/explorer": [
    "Crypto Token Explorer — Live Prices & DEX Data",
    "Explore live token data on every major chain: prices, liquidity, 24h volume and DEX pools pulled straight from on-chain markets.",
    "Crypto Token Explorer",
  ],
  "/accuracy": [
    "Prediction Accuracy — Every Forecast Graded",
    "Every expired Oracle Bull forecast gets resolved against live market prices. Per-coin hit rates, graded checkpoints, full transparency — judge the signals yourself.",
    "Prediction Accuracy Leaderboard",
  ],
  "/news": [
    "Crypto News — Market-Moving Headlines",
    "The latest crypto headlines and market analysis, curated for traders. Prices, signals and context in one feed.",
    "Crypto News",
  ],
  "/market-recap": [
    "Daily Market Recap — What Moved Crypto Today",
    "Today's crypto market in one page: total cap movement, top gainers and losers, Fear & Greed and the stories behind the moves.",
    "Daily Market Recap",
  ],
  "/reports": [
    "Weekly Crypto Reports — Analysis & Signals",
    "Weekly crypto market reports: performance review, momentum shifts and the signals that worked — all graded against live data.",
    "Weekly Crypto Reports",
  ],
  "/insights": [
    "Crypto Insights — Analysis & Research",
    "In-depth crypto analysis: market structure, narratives, on-chain trends and trading frameworks, written from live data.",
    "Crypto Insights",
  ],
  "/airdrops": [
    "Crypto Airdrops — Live Opportunities & Guides",
    "Active and upcoming crypto airdrops with eligibility steps, timelines and editorial scoring — find real opportunities, not hype.",
    "Crypto Airdrops",
  ],
  "/tools": [
    "Free Crypto Tools — Calculators & Scanners",
    "Free crypto calculators and tools: profit calculator, DCA planner, impermanent loss, position sizing — fast, private, no signup.",
    "Free Crypto Tools",
  ],
  "/tools/profit-calculator": [
    "Crypto Profit Calculator — Free & Instant",
    "Calculate crypto profit or loss on any trade: entry, exit, fees and ROI — instant results, completely free.",
    "Crypto Profit Calculator",
  ],
  "/tools/dca-calculator": [
    "DCA Calculator — Dollar-Cost Averaging Returns",
    "Model a dollar-cost-averaging strategy on any coin: schedule, total invested and portfolio value over time.",
    "DCA Calculator",
  ],
  "/tools/impermanent-loss-calculator": [
    "Impermanent Loss Calculator — LP Risk",
    "Estimate impermanent loss on any liquidity pair before you provide it — price-change scenarios computed instantly.",
    "Impermanent Loss Calculator",
  ],
  "/tools/position-size-calculator": [
    "Position Size Calculator — Risk Per Trade",
    "Size any crypto trade correctly: account risk, stop distance and leverage — protect your capital with proper position sizing.",
    "Position Size Calculator",
  ],
  "/compare": [
    "Compare Cryptocurrencies Side-by-Side",
    "Compare any two cryptocurrencies on price, momentum, market cap and performance across timeframes — live data, zero fluff.",
    "Compare Cryptocurrencies",
  ],
  "/factory": [
    "Crypto Factory — Live Market Intelligence",
    "The market's engine room: live global stats, top movers, Fear & Greed and on-chain activity in one continuously updating view.",
    "Crypto Factory",
  ],
  "/factory/events": [
    "Crypto Market Events — Live Calendar",
    "Market-moving crypto events and what they historically do to price — tracked in real time.",
    "Crypto Market Events",
  ],
  "/factory/onchain": [
    "On-Chain Activity — Live Flows & Pools",
    "Live on-chain view: DEX pool volumes, buy/sell pressure and flow direction across major chains.",
    "On-Chain Activity",
  ],
  "/factory/narratives": [
    "Crypto Narratives — What the Market Trades",
    "Which stories are pulling capital right now: AI, RWA, memecoins and more — ranked by live momentum.",
    "Crypto Narratives",
  ],
  "/factory/news": [
    "Crypto News Hub — Live Headlines",
    "Market-moving crypto news as it happens: headlines, prices and context filtered for traders — one continuously updated feed.",
    "Crypto News Hub",
  ],
  "/learn": [
    "Learn Crypto Free — Guides & Education",
    "Free crypto education: market sentiment, cycles, risk management, on-chain data and more — practical guides for traders.",
    "Learn Crypto Free",
  ],
  "/how-to-buy": [
    "How to Buy Crypto — Step-by-Step Guides",
    "Step-by-step guides to buying any major cryptocurrency: exchanges, wallets, fees and safety — beginner friendly.",
    "How to Buy Crypto",
  ],
  "/liquidations/bitcoin-heatmap": [
    "Bitcoin Liquidation Heatmap — Leverage Levels",
    "See where Bitcoin leveraged positions cluster: derived liquidation levels and the price zones where cascades can trigger.",
    "Bitcoin Liquidation Heatmap",
  ],
  "/polymarket": [
    "Polymarket Signals — Live Odds & Risk",
    "Live Polymarket odds decoded: implied probabilities, volume and risk badges on the 100 biggest prediction markets.",
    "Polymarket Signals",
  ],
  "/embed": [
    "Free Embeddable Crypto Widgets",
    "Embed live crypto widgets on any site: price tickers, prediction cards, Fear & Greed and strength meters — free, one line of code.",
    "Embeddable Crypto Widgets",
  ],
  "/about": [
    "About Oracle Bull — Free Crypto Analytics",
    "Who we are: a free, transparent crypto analytics platform. Live data, graded predictions, no paywall — read our methodology.",
    "About Oracle Bull",
  ],
  "/contact": [
    "Contact Oracle Bull — Get in Touch",
    "Questions, feedback or partnership ideas? Reach the Oracle Bull team at contact@oraclebull.com.",
    "Contact Oracle Bull",
  ],
  "/api-docs": [
    "Oracle Bull Public API — Free Endpoints",
    "Free public API for Oracle Bull market data: prices, predictions and sentiment endpoints with fair-use limits.",
    "Oracle Bull Public API",
  ],
  "/how-to-read-predictions": [
    "How to Read Predictions — Signal Guide",
    "Understand every part of an Oracle Bull forecast: bias, conviction, entry zones, stop-loss and take-profit — explained simply.",
    "How to Read Predictions",
  ],
  "/tutorial/interactive": [
    "Interactive Tutorial — Learn the Platform",
    "Take the interactive tour of Oracle Bull: dashboards, predictions, sentiment and tools explained step by step.",
    "Interactive Tutorial",
  ],
  "/privacy-policy": ["Privacy Policy", "How Oracle Bull collects, uses and protects your data — what we store, what we never sell, and the controls you have over your information.", "Privacy Policy"],
  "/terms": ["Terms of Service", "The terms governing your use of Oracle Bull: acceptable use, account responsibilities, disclaimers and the limits of our liability.", "Terms of Service"],
  "/cookie-policy": ["Cookie Policy", "The cookies Oracle Bull uses and why: preference storage, traffic measurement and advertising — plus how to control them in your browser.", "Cookie Policy"],
  "/risk-disclaimer": [
    "Risk Disclaimer",
    "Crypto markets are volatile and losses can be substantial. Read our full risk disclosure before acting on any signal, forecast or data point on this site.",
    "Risk Disclaimer",
  ],
  "/editorial-policy": ["Editorial Policy", "How Oracle Bull researches, sources and reviews its content: our data-first methodology, correction process and the line between analysis and advice.", "Editorial Policy"],
  "/welcome": ["Welcome to Oracle Bull", "Get started with Oracle Bull — free live crypto analytics: predictions, dashboards, sentiment and tools, all without a paywall or signup.", "Welcome to Oracle Bull"],
  "/launch": ["Oracle Bull Launch", "Oracle Bull is live: free crypto predictions, dashboards and tools — real-time data from CoinGecko, DexScreener and GeckoTerminal, no signup required.", "Oracle Bull Launch"],
  "/m": ["Live Market Pulse", "The fastest view of the crypto market: live prices, momentum rankings and the Fear & Greed index in one glance — built for your phone.", "Live Market Pulse"],
  "/game": [
    "Daily Crypto Price Game — Call It & Get Graded",
    "Call Bitcoin's daily move and get graded against the real close. Free daily game with your full call history.",
    "Daily Crypto Price Game",
  ],
  "/recap": [
    "Market Recap — Live Daily Summary",
    "A running summary of the crypto market today: total cap movement, top movers, Fear & Greed and the stories behind the moves.",
    "Market Recap",
  ],
};
Object.entries(STATIC_SEO).forEach(([p, [t, d, h1]]) => add(p, t, d, h1, d));

// Home — gets the same treatment so the static HTML carries an h1, intro and
// the global link graph (React replaces the block on hydration).
add(
  "/",
  "Free AI Crypto Predictions Today",
  "Free crypto price predictions, whale tracking and sentiment for Bitcoin, Ethereum, Solana and 1,000+ tokens — live data, graded accuracy, no signup needed.",
  "Free AI Crypto Predictions for 1,000+ Cryptocurrencies",
  "Oracle Bull computes live technical forecasts for 1,000+ cryptocurrencies from real market data — directional bias, conviction scores and concrete entry, stop-loss and take-profit levels. Track accuracy on every graded call, watch whale-scale flows, and gauge market sentiment in real time — all free, no paywall."
);

// Dynamic families
topCryptos.forEach((c) => {
  const n = coinName(c);
  add(`/price-prediction/${c}`,
    `${n} Price Prediction — Live Forecast & Targets`,
    `Live ${n} forecast computed from real market data: trend bias, conviction score, entry zone, stop-loss and take-profit targets — updated continuously, free.`,
    `${n} Price Prediction`,
    `Where is ${n} headed next? This page computes a live technical read for ${n} from real-time market data — directional bias, a conviction score, and concrete entry, stop-loss and take-profit levels. No hype, no paywall: the same data updates continuously as the market moves.`);
  add(`/price-prediction/${c}/daily`,
    `${n} Price Prediction Today — Live Levels`,
    `Where is ${n} headed today? Live technical read with momentum, key levels, entry zone, stop-loss and targets — computed from real-time data.`,
    `${n} Price Prediction Today`,
    `Today's ${n} outlook, computed from live momentum and trend structure. You get the directional bias, the levels that decide the day, and clear entry and invalidation points — refreshed continuously.`);
  add(`/price-prediction/${c}/weekly`,
    `${n} Price Prediction This Week — Live Read`,
    `${n} weekly outlook from live market data: trend strength, support and resistance, entry and exit levels — no hype, just the read.`,
    `${n} Price Prediction This Week`,
    `The week ahead for ${n}: live weekly trend read, the support and resistance zones that frame it, and scenario levels for both directions.`);
  add(`/price-prediction/${c}/monthly`,
    `${n} Price Prediction This Month — Live Outlook`,
    `${n} monthly forecast built on live momentum and trend structure: scenario levels, risk zones and the key data behind them.`,
    `${n} Price Prediction This Month`,
    `This month's ${n} outlook built from live momentum and trend structure — scenario levels, risk zones, and the data behind the read.`);
});
top30.forEach((c) => {
  const n = coinName(c);
  years.forEach((y) => {
    add(`/price-prediction/${c}/${y}`,
      `${n} Price Prediction ${y} — Scenario Targets`,
      `${n} in ${y}: scenario-based price targets, the technical path there, and what live data says about the trend today.`,
      `${n} Price Prediction for ${y}`,
      `What could ${n} do by ${y}? Scenario-based targets grounded in today's live technical structure — bull, base and risk cases with the levels that matter.`);
  });
});
top50.forEach((c) => {
  const n = coinName(c);
  add(`/today/${c}`,
    `${n} Today — Live Price & Signal`,
    `${n} right now: live price, today's signal, momentum and the market context behind it — one page, real data.`,
    `${n} Today`,
    `Everything ${n}, today: the live price, today's computed signal, momentum read and the market context behind the move — one continuously updated page.`);
  add(`/accuracy/${c}`,
    `${n} Prediction Accuracy — Graded Record`,
    `How accurate are Oracle Bull's ${n} predictions? Every expired call resolved against live prices — see the real hit rate.`,
    `${n} Prediction Accuracy`,
    `The graded record of ${n} forecasts: every expired prediction resolved against live market prices, with the real per-coin hit rate. Full transparency — judge the signals yourself.`);
  add(`/how-to-buy/${c}`,
    `How to Buy ${n} — Step-by-Step Guide`,
    `How to buy ${n} safely: choosing an exchange, funding your account, storage options and fees — a clear beginner guide.`,
    `How to Buy ${n}`,
    `A clear, current guide to buying ${n}: picking an exchange, funding your account, executing the purchase, and storing it safely — with fees and beginner pitfalls covered.`);
});

// Question-intent pages
const qCoins = [
  "bitcoin","ethereum","solana","ripple","cardano","dogecoin","shiba-inu","pepe",
  "chainlink","polkadot","avalanche","toncoin","sui","aptos","near","arbitrum",
  "optimism","bonk","floki","kaspa","render-token","fetch-ai","litecoin","uniswap",
  "cosmos","stellar","monero","hedera","aave","bittensor","pendle","starknet",
  "trump","tron","bnb","polygon","celestia","ondo","injective","worldcoin",
  "sei","vechain","filecoin","maker","the-graph","immutable-x","gala","jupiter",
  "internet-computer","theta",
];
const qPatterns = [
  ["will-{coin}-go-up-today", (n) => [`Will ${n} Go Up Today? Live Signal`, `Real-time technical read on ${n}: momentum, trend strength and the key levels that decide today's direction.`, `Will ${n} Go Up Today?`]],
  ["{coin}-price-prediction-today", (n) => [`${n} Price Prediction Today`, `${n} live forecast: trend bias, conviction and the exact levels that matter today — computed from real market data.`, `${n} Price Prediction Today`]],
  ["is-{coin}-bullish-today", (n) => [`Is ${n} Bullish Today? Live Check`, `Is ${n} showing bullish structure right now? Check the live momentum, breadth and level read before you trade.`, `Is ${n} Bullish Today?`]],
  ["should-i-buy-{coin}-today", (n) => [`Should I Buy ${n} Today? Data Read`, `A data-first answer on buying ${n} today: live trend, conviction and risk levels — plus what would change the read.`, `Should I Buy ${n} Today?`]],
  ["{coin}-forecast-today", (n) => [`${n} Forecast Today — Momentum & Bias`, `Today's ${n} forecast from live data: directional bias, momentum score and the levels to watch.`, `${n} Forecast Today`]],
  ["{coin}-price-prediction-this-week", (n) => [`${n} Price Prediction This Week`, `${n} this week: weekly trend structure, momentum and the price zones that shape the outlook.`, `${n} Price Prediction This Week`]],
  ["{coin}-weekly-forecast", (n) => [`${n} Weekly Forecast — Trend & Levels`, `The week ahead for ${n}: live weekly trend read, support and resistance, and scenario levels.`, `${n} Weekly Forecast`]],
  ["is-{coin}-a-good-investment-this-month", (n) => [`Is ${n} a Good Investment This Month?`, `A monthly read on ${n}: trend, momentum and risk data to inform your own decision — not financial advice.`, `Is ${n} a Good Investment This Month?`]],
  ["{coin}-monthly-forecast", (n) => [`${n} Monthly Forecast — Outlook & Levels`, `${n} monthly outlook built from live trend data: scenario levels and the technical path.`, `${n} Monthly Forecast`]],
  ["{coin}-price-prediction-2026", (n) => [`${n} Price Prediction 2026`, `${n} in 2026: scenario-based targets and what today's live trend data says about the path.`, `${n} Price Prediction 2026`]],
  ["{coin}-price-prediction-2027", (n) => [`${n} Price Prediction 2027`, `${n} in 2027: long-horizon scenarios grounded in today's live technical structure.`, `${n} Price Prediction 2027`]],
  ["is-{coin}-a-good-investment", (n) => [`Is ${n} a Good Investment? Live Read`, `The live-data view on ${n} as an investment: trend, momentum and risk — so you can decide with data.`, `Is ${n} a Good Investment?`]],
  ["{coin}-buy-or-sell", (n) => [`${n}: Buy or Sell? Live Verdict`, `Buy or sell ${n} right now? See the live technical verdict with conviction, entries and invalidation levels.`, `${n}: Buy or Sell?`]],
  ["{coin}-technical-analysis", (n) => [`${n} Technical Analysis — Live Read`, `Live ${n} technical analysis: trend structure, momentum, volume and the levels that matter now.`, `${n} Technical Analysis`]],
  ["{coin}-whale-activity", (n) => [`${n} Whale Activity — Live Flows`, `Track ${n} whale-scale activity: live DEX pool flows, buy and sell pressure over the last 24 hours.`, `${n} Whale Activity`]],
];
qCoins.forEach((coin) => {
  const n = coinName(coin);
  qPatterns.forEach(([pattern, gen]) => {
    const [t, d, h1] = gen(n);
    add(`/q/${pattern.replace(/\{coin\}/g, coin)}`, t, d, h1,
      d + ` The read below is computed from live ${n} market data and refreshes continuously.`);
  });
});

// Market SEO pages
const marketSlugs = [
  "best-crypto-to-buy-today","top-crypto-gainers-today","crypto-market-prediction-today",
  "which-crypto-will-go-up-today","crypto-losers-today","is-crypto-going-up-today",
  "best-crypto-to-buy-this-week","crypto-prediction-this-week","crypto-to-watch-this-week",
  "top-crypto-gainers-this-week","next-crypto-to-explode","safest-crypto-to-invest",
  "cheap-crypto-to-buy-now","undervalued-crypto-to-buy","crypto-with-most-potential",
  "best-altcoins-to-buy","top-meme-coins","best-defi-tokens","top-ai-crypto-tokens",
  "best-crypto-under-1-dollar","best-long-term-crypto","crypto-to-buy-before-bull-run",
  "best-staking-crypto","highest-apy-crypto","best-layer-2-crypto","best-gaming-crypto",
  "best-metaverse-crypto","best-privacy-coins","best-crypto-for-passive-income",
  "trending-crypto-today","crypto-bull-run-prediction","will-crypto-crash-today",
  "crypto-market-outlook","best-crypto-to-buy-2026","best-crypto-to-buy-2027",
  "crypto-with-highest-potential-2027","bitcoin-prediction-today","ethereum-prediction-today",
  "solana-prediction-today","xrp-prediction-today","will-bitcoin-reach-100k",
  "will-ethereum-reach-10k","best-crypto-for-beginners","most-undervalued-crypto",
  "crypto-to-hold-long-term","best-crypto-presale","top-100-crypto",
  "which-crypto-to-buy-right-now","best-crypto-exchange","crypto-market-cap-today",
  "bitcoin-vs-ethereum","will-solana-go-up","will-xrp-go-up","will-cardano-go-up",
];
marketSlugs.forEach((s) => {
  const h = titleCase(s);
  const isQuestion = /^(will|is|should|which)/.test(s);
  const title = isQuestion ? `${h}? — Live Data Answer` : `${h} — Live Ranked Data`;
  const desc = isQuestion
    ? `Get a live, data-backed answer to "${h.toLowerCase()}" — computed from real-time prices, volume and momentum across the top 250 coins.`
    : `${h}: ranked live from real-time market data — prices, volume and momentum. No paywall, no hype.`;
  add(`/market/${s}`, title, desc, h + (isQuestion ? "?" : ""), desc);
});

// Predict target pages
const predictData = {
  bitcoin: [100000, 150000, 200000, 500000, 1000000], ethereum: [5000, 10000, 15000, 25000, 50000],
  solana: [250, 500, 1000, 2000, 5000], xrp: [1, 5, 10, 25, 100], bnb: [500, 1000, 2000, 5000, 10000],
  cardano: [1, 2, 5, 10, 25], dogecoin: [0.5, 1, 5, 10, 25], avalanche: [50, 100, 250, 500, 1000],
  polygon: [1, 5, 10, 25, 50], polkadot: [10, 25, 50, 100, 250], chainlink: [25, 50, 100, 250, 500],
  litecoin: [100, 250, 500, 1000, 2500], uniswap: [10, 25, 50, 100, 250], near: [10, 25, 50, 100, 250],
  sui: [5, 10, 25, 50, 100], aptos: [10, 25, 50, 100, 250], arbitrum: [2, 5, 10, 25, 50],
  optimism: [2, 5, 10, 25, 50], pepe: [0.00001, 0.00005, 0.0001, 0.0005, 0.001],
  "shiba-inu": [0.0001, 0.0005, 0.001, 0.005, 0.01], dogwifhat: [1, 5, 10, 25, 50],
  render: [5, 10, 25, 50, 100], injective: [25, 50, 100, 250, 500], kaspa: [0.5, 1, 5, 10, 25],
  aave: [250, 500, 1000, 2500, 5000], bittensor: [500, 1000, 2500, 5000, 10000],
  hedera: [0.25, 0.5, 1, 5, 10], celestia: [10, 25, 50, 100, 250], toncoin: [5, 10, 25, 50, 100],
  floki: [0.0001, 0.0005, 0.001, 0.005, 0.01],
};
Object.entries(predictData).forEach(([coin, targets]) => {
  const n = coinName(coin);
  targets.forEach((t) => {
    years.forEach((y) => {
      const tgt = fmtTarget(t);
      add(`/predict/${coin}/${t}/${y}`,
        `Will ${n} Hit ${tgt} by ${y}? Live Read`,
        `Can ${n} reach ${tgt} by ${y}? See the live technical read and what the data says about the path.`,
        `Will ${n} Hit ${tgt} by ${y}?`,
        `A live-data answer to whether ${n} can reach ${tgt} by ${y}: the current trend, momentum and the technical path the price would need to take.`);
    });
  });
});

// VS / compare / convert
const vsCoins = [
  "bitcoin","ethereum","solana","xrp","bnb","cardano","dogecoin","avalanche",
  "polygon","polkadot","chainlink","litecoin","uniswap","near","sui","aptos",
  "arbitrum","optimism","pepe","shiba-inu",
];
for (let i = 0; i < vsCoins.length; i++) {
  for (let j = i + 1; j < vsCoins.length; j++) {
    const a = coinName(vsCoins[i]), b = coinName(vsCoins[j]);
    add(`/vs/${vsCoins[i]}/${vsCoins[j]}`,
      `${a} vs ${b} — Live Head-to-Head`,
      `${a} or ${b}? Compare live price, momentum, market cap and performance side-by-side before you choose.`,
      `${a} vs ${b}`,
      `${a} or ${b}? A live, side-by-side comparison of price, momentum, market cap and timeframe performance — so the choice is grounded in data, not narrative.`);
  }
}
[
  "bitcoin-vs-ethereum","ethereum-vs-solana","bitcoin-vs-solana","cardano-vs-solana",
  "dogecoin-vs-shiba-inu","xrp-vs-stellar","polygon-vs-arbitrum","near-vs-aptos",
  "pepe-vs-shiba-inu","render-vs-fetch-ai","bitcoin-vs-cardano","bitcoin-vs-dogecoin",
  "ethereum-vs-cardano","solana-vs-arbitrum","bitcoin-vs-litecoin","ethereum-vs-polygon",
  "solana-vs-avalanche","chainlink-vs-the-graph","cosmos-vs-polkadot","uniswap-vs-sushiswap",
  "optimism-vs-arbitrum","sui-vs-aptos","bonk-vs-floki","bitcoin-vs-xrp","ethereum-vs-bnb",
].forEach((p) => {
  const [rawA, rawB] = p.split("-vs-");
  const a = coinName(rawA), b = coinName(rawB);
  add(`/compare/${p}`,
    `${a} vs ${b} — Live Comparison`,
    `${a} vs ${b} on live data: price, market cap, momentum and timeframe performance — the honest head-to-head.`,
    `${a} vs ${b}`,
    `${a} vs ${b} on live data: price, market cap, momentum and performance across timeframes — the honest head-to-head, no hype.`);
});
const convCoins = vsCoins;
["usd", "eur", "gbp"].forEach((f) => {
  convCoins.forEach((c) => {
    const n = coinName(c);
    add(`/convert/${c}/${f}`,
      `${n} to ${f.toUpperCase()} — Live Rate & Calculator`,
      `Convert ${n} to ${f.toUpperCase()} at the live rate: instant calculator, current price and 24h change.`,
      `${n} to ${f.toUpperCase()}`,
      `Convert ${n} to ${f.toUpperCase()} at the live rate: an instant calculator, the current price and the 24h change — always current.`);
  });
});

// Chains
["ethereum","solana","bnb","avalanche","polygon","arbitrum","base","optimism","sui","ton"].forEach((c) => {
  const n = c === "bnb" ? "BNB Chain" : c === "ton" ? "TON" : titleCase(c);
  add(`/chain/${c}`,
    `${n} DeFi — Live DEX Volume & Pools`,
    `Live ${n} on-chain data: 24h DEX volume, top pools, trending tokens and whale-scale flows — straight from on-chain markets.`,
    `${n} DeFi Dashboard`,
    `Live ${n} on-chain data: 24-hour DEX volume, the top pools by liquidity, trending tokens and whale-scale flow direction — pulled straight from on-chain markets.`);
});

// Airdrops
["linea","monad","berachain","scroll","hyperliquid","zksync","megaeth","base"].forEach((a) => {
  const n = titleCase(a);
  add(`/airdrops/${a}`,
    `${n} Airdrop Guide — Steps & Timeline`,
    `${n} airdrop: eligibility criteria, step-by-step farming guide, tokenomics and key dates — with an honest editorial score.`,
    `${n} Airdrop Guide`,
    `${n} airdrop, covered honestly: eligibility criteria, a step-by-step farming guide, tokenomics and key dates — with an editorial score and no hype.`);
});

// Learn articles
[
  "what-is-crypto-market-sentiment","how-ai-is-used-in-crypto-market-analysis",
  "bitcoin-market-cycles-explained","risk-management-in-volatile-crypto-markets",
  "how-to-analyze-altcoins-using-market-data","technical-analysis-vs-sentiment-analysis",
  "on-chain-data-explained-for-beginners","how-market-psychology-affects-crypto-prices",
  "how-whales-influence-market-trends","understanding-liquidity-in-crypto-markets",
  "what-is-the-forex-market-and-how-does-it-work","forex-market-structure-explained",
  "currency-sentiment-analysis-explained","forex-vs-crypto-key-market-differences",
  "macroeconomic-factors-that-move-forex-markets","how-ai-forecasting-models-work-in-finance",
  "limitations-of-ai-market-predictions","indicators-vs-ai-models-whats-the-difference",
  "data-sources-used-in-market-intelligence-platforms","how-to-read-market-analytics-dashboards",
].forEach((s) => {
  const h = titleCase(s);
  add(`/learn/${s}`, h, `${h}: a practical, data-driven guide from the Oracle Bull education library.`, h,
    `${h} — a practical guide from the Oracle Bull education library, grounded in live market data rather than theory.`);
});

// Insights articles
try {
  const src = fs.readFileSync("src/data/insightsArticles.ts", "utf8");
  const slugs = [...new Set([...src.matchAll(/slug:\s*["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1]))];
  slugs.forEach((s) => {
    const h = titleCase(s).slice(0, 50);
    add(`/insights/${s}`, h, `${h}: analysis from the Oracle Bull research library, grounded in live market data.`, h,
      `${h} — analysis from the Oracle Bull research library, grounded in live market data.`);
  });
} catch {
  console.warn("[seo-prerender] insightsArticles.ts not found — skipping /insights slugs");
}

// Embeds
["bitcoin","ethereum","solana","ripple","binancecoin","cardano","dogecoin","polkadot",
 "chainlink","avalanche-2","litecoin","uniswap","near","sui","aptos","arbitrum",
 "optimism","pepe","shiba-inu","toncoin"].forEach((c) => {
  const n = coinName(c);
  add(`/embed/price/${c}`, `${n} Price Widget — Free Embed`,
    `Embed a live ${n} price widget on your site — free, one line of code, always current.`, `${n} Price Widget`,
    `A live ${n} price widget for your site: free, one line of code, always current.`);
  add(`/embed/prediction/${c}`, `${n} Prediction Widget — Free Embed`,
    `Embed the live ${n} prediction card: bias, conviction and targets on your site.`, `${n} Prediction Widget`,
    `Embed the live ${n} prediction card: directional bias, conviction and target levels for your site.`);
  add(`/embed/strength/${c}`, `${n} Strength Widget — Free Embed`,
    `Embed the live ${n} momentum strength meter on your site — free and auto-updating.`, `${n} Strength Widget`,
    `Embed the live ${n} momentum strength meter: free, auto-updating, one line of code.`);
});
add("/embed/fear-greed", "Fear & Greed Widget — Free Embed",
  "Embed the live crypto Fear & Greed index on your site — free, one line of code.", "Fear & Greed Widget",
  "Embed the live crypto Fear & Greed index on your site: free, one line of code, always current.");

// Explorer token details
[
  ["ethereum","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","WETH"],
  ["ethereum","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","USDC"],
  ["ethereum","0x514910771af9ca656af840dff83e8264ecf986ca","LINK"],
  ["ethereum","0x1f9840a85d5af5bf1d1762f925bdaddc4201f984","UNI"],
  ["bsc","0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c","WBNB"],
  ["base","0x4200000000000000000000000000000000000006","WETH"],
  ["arbitrum","0x912ce59144191c1204e64559fe8253a0e49e6548","ARB"],
  ["polygon","0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270","WPOL"],
  ["avalanche","0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7","WAVAX"],
  ["optimism","0x4200000000000000000000000000000000000042","WETH"],
].forEach(([chain, addr, sym]) => {
  const cn = chain === "bsc" ? "BNB Chain" : titleCase(chain);
  add(`/explorer/${chain}/${addr}`,
    `${sym} on ${cn} — Live Token Data`,
    `${sym} token contract live on ${cn}: current price, liquidity depth, 24-hour DEX volume, pool activity and chart — pulled straight from on-chain markets in real time.`,
    `${sym} on ${cn}`,
    `${sym} live on ${cn}: price, liquidity, 24-hour volume and DEX pools — straight from on-chain markets.`);
});

// ── internal-link graph ────────────────────────────────────────────────────
// Global "explore" footer links — hubs + highest-value deep pages. Present on
// every prerendered page, so every URL family is reachable from site-wide
// chrome (crawl depth 1 for hubs, depth 2+ for deep pages).
const GLOBAL_LINKS = [
  ["Crypto Predictions", "/predictions"],
  ["Market Dashboard", "/dashboard"],
  ["Market Sentiment", "/sentiment"],
  ["Strength Meter", "/crypto-strength-meter"],
  ["Accuracy Leaderboard", "/accuracy"],
  ["Daily Market Recap", "/market-recap"],
  ["Weekly Reports", "/reports"],
  ["Crypto Insights", "/insights"],
  ["Crypto News", "/news"],
  ["Crypto Airdrops", "/airdrops"],
  ["Token Explorer", "/explorer"],
  ["Token Scanner", "/scanner"],
  ["Crypto Factory", "/factory"],
  ["Polymarket Signals", "/polymarket"],
  ["Compare Coins", "/compare"],
  ["Free Tools", "/tools"],
  ["Profit Calculator", "/tools/profit-calculator"],
  ["DCA Calculator", "/tools/dca-calculator"],
  ["Impermanent Loss Calculator", "/tools/impermanent-loss-calculator"],
  ["Position Size Calculator", "/tools/position-size-calculator"],
  ["Learn Crypto", "/learn"],
  ["How to Buy Crypto", "/how-to-buy"],
  ["Liquidation Heatmap", "/liquidations/bitcoin-heatmap"],
  ["Fear & Greed Widget", "/embed/fear-greed"],
  ["Bitcoin Price Prediction", "/price-prediction/bitcoin"],
  ["Ethereum Price Prediction", "/price-prediction/ethereum"],
  ["Solana Price Prediction", "/price-prediction/solana"],
  ["XRP Price Prediction", "/price-prediction/ripple"],
  ["Dogecoin Price Prediction", "/price-prediction/dogecoin"],
  ["Cardano Price Prediction", "/price-prediction/cardano"],
  ["BNB Price Prediction", "/price-prediction/binancecoin"],
  ["Chainlink Price Prediction", "/price-prediction/chainlink"],
  ["Pepe Price Prediction", "/price-prediction/pepe"],
  ["Shiba Inu Price Prediction", "/price-prediction/shiba-inu"],
  ["Bitcoin Today", "/today/bitcoin"],
  ["Ethereum Today", "/today/ethereum"],
  ["Solana Today", "/today/solana"],
  ["XRP Today", "/today/ripple"],
  ["Will Bitcoin Go Up Today?", "/q/will-bitcoin-go-up-today"],
  ["Will Ethereum Go Up Today?", "/q/will-ethereum-go-up-today"],
  ["Will Solana Go Up Today?", "/q/will-solana-go-up-today"],
  ["Bitcoin Price Prediction 2026", "/price-prediction/bitcoin/2026"],
  ["Best Crypto to Buy Today", "/market/best-crypto-to-buy-today"],
  ["Bitcoin Prediction Today", "/market/bitcoin-prediction-today"],
  ["Next Crypto to Explode", "/market/next-crypto-to-explode"],
  ["Crypto Market Outlook", "/market/crypto-market-outlook"],
  ["Will Bitcoin Reach $100k?", "/market/will-bitcoin-reach-100k"],
  ["Bitcoin vs Ethereum", "/vs/bitcoin/ethereum"],
  ["Bitcoin to USD", "/convert/bitcoin/usd"],
  ["Ethereum DeFi Dashboard", "/chain/ethereum"],
  ["Solana DeFi Dashboard", "/chain/solana"],
  ["Daily Price Game", "/game"],
];

// Contextual links per path family (deep links that only make sense there).
function contextualLinks(p) {
  const links = [];
  const pred = (c) => `/price-prediction/${c}`;
  if (p.startsWith("/price-prediction/")) {
    const rest = p.slice("/price-prediction/".length);
    const [coin, sub] = rest.split("/");
    const n = coinName(coin);
    if (!sub) {
      [["Today's forecast", `${pred(coin)}/daily`], ["This week", `${pred(coin)}/weekly`], ["This month", `${pred(coin)}/monthly`]]
        .forEach(([t, h]) => topCryptos.includes(coin) && links.push([t, h]));
      if (top50.includes(coin)) links.push([`${n} today`, `/today/${coin}`], [`${n} accuracy record`, `/accuracy/${coin}`]);
      const qc = canonicalCoin(coin);
      if (qCoins.includes(qc)) links.push([`Will ${coinName(qc)} go up today?`, `/q/will-${qc}-go-up-today`]);
      if (top30.includes(coin)) links.push([`${n} in 2026`, `${pred(coin)}/2026`]);
      if (coin === "bitcoin") links.push(["Ethereum forecast", pred("ethereum")], ["Solana forecast", pred("solana")]);
    }
  } else if (p.startsWith("/q/")) {
    const coin = qCoins.find((c) => p.includes(`-${c}-`) || p.startsWith(`/q/${c}-`) || p.endsWith(`-${c}`));
    if (coin) {
      const qc = canonicalCoin(coin);
      if (topCryptos.includes(qc)) links.push([`${coinName(qc)} full forecast`, pred(qc)]);
      if (top50.includes(qc)) links.push([`${coinName(qc)} today`, `/today/${qc}`]);
    }
  } else if (p.startsWith("/today/")) {
    const coin = p.slice("/today/".length);
    if (topCryptos.includes(coin)) {
      const n = coinName(coin);
      links.push([`${n} full forecast`, pred(coin)], [`${n} accuracy record`, `/accuracy/${coin}`], [`How to buy ${n}`, `/how-to-buy/${coin}`]);
    }
  } else if (p.startsWith("/accuracy/")) {
    const coin = p.slice("/accuracy/".length);
    if (topCryptos.includes(coin)) links.push([`${coinName(coin)} forecast`, pred(coin)]);
  } else if (p.startsWith("/vs/")) {
    const [, a, b] = p.split("/");
    const ca = canonicalCoin(a), cb = canonicalCoin(b);
    if (topCryptos.includes(ca)) links.push([`${coinName(ca)} forecast`, pred(ca)]);
    if (topCryptos.includes(cb)) links.push([`${coinName(cb)} forecast`, pred(cb)]);
  } else if (p.startsWith("/convert/")) {
    const [, coin] = p.split("/");
    const cc = canonicalCoin(coin);
    if (topCryptos.includes(cc)) links.push([`${coinName(cc)} forecast`, pred(cc)]);
    if (top50.includes(cc)) links.push([`${coinName(cc)} today`, `/today/${cc}`]);
  } else if (p.startsWith("/how-to-buy/")) {
    const coin = p.slice("/how-to-buy/".length);
    if (topCryptos.includes(coin)) links.push([`${coinName(coin)} forecast`, pred(coin)]);
  } else if (p.startsWith("/market/")) {
    const s = p.slice("/market/".length);
    const m = s.match(/^(bitcoin|ethereum|solana|xrp|cardano)-/);
    if (m && topCryptos.includes(canonicalCoin(m[1]))) links.push([`${coinName(canonicalCoin(m[1]))} forecast`, pred(canonicalCoin(m[1]))]);
    links.push(["All predictions", "/predictions"], ["Accuracy leaderboard", "/accuracy"]);
  }
  return links;
}

// ── rendering ──────────────────────────────────────────────────────────────
function buildHead({ title, description, canonical, breadcrumbs, isHome }) {
  const ogTags = `
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Oracle Bull" />
    <meta property="og:image" content="https://oraclebull.com/og-image.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="https://oraclebull.com/og-image.jpg" />`;

  const schema = isHome
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "Oracle Bull",
            url: BASE + "/",
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: BASE + "/predictions?q={search_term_string}" },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "Organization",
            name: "Oracle Bull",
            url: BASE + "/",
            logo: "https://oraclebull.com/oracle-bot-mascot.jpg",
          },
        ],
      }
    : {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            name: title,
            description,
            url: canonical,
            isPartOf: { "@type": "WebSite", name: "Oracle Bull", url: BASE + "/" },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: b.name,
              item: BASE + b.path,
            })),
          },
        ],
      };

  return `
    <link rel="canonical" href="${esc(canonical)}" />${ogTags}
    <script type="application/ld+json">${escJson(schema)}</script>`;
}

function breadcrumbsFor(p) {
  const crumbs = [{ name: "Home", path: "/" }];
  const parts = p.split("/").filter(Boolean);
  let acc = "";
  for (const seg of parts) {
    acc += "/" + seg;
    crumbs.push({ name: titleCase(seg).slice(0, 40) || seg, path: acc });
  }
  return crumbs;
}

const FOOTER_STYLE = `max-width:960px;margin:0 auto;padding:24px 20px 48px;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#1e293b`;
const H1_STYLE = `font-size:1.6rem;line-height:1.25;margin:0 0 12px`;
const P_STYLE = `font-size:.95rem;line-height:1.6;margin:0 0 20px;max-width:70ch;color:#334155`;
const H2_STYLE = `font-size:1rem;margin:28px 0 10px`;
const A_STYLE = `color:#2563eb;text-decoration:underline;margin-right:14px;display:inline-block;padding:2px 0`;

function buildBody({ h1, intro, links, contextual, picks }) {
  const ctxLinks = contextual.length
    ? `<h2 style="${H2_STYLE}">Related on Oracle Bull</h2><p>` +
      contextual.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join("") +
      `</p>`
    : "";
  const pickLinks = picks.length
    ? `<h2 style="${H2_STYLE}">More on Oracle Bull</h2><p>` +
      picks.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join("") +
      `</p>`
    : "";
  const footerLinks = `<h2 style="${H2_STYLE}">Explore Oracle Bull</h2><p>` +
    GLOBAL_LINKS.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join("") +
    `</p>`;
  return `<div style="${FOOTER_STYLE}">
      <h1 style="${H1_STYLE}">${esc(h1)}</h1>
      <p style="${P_STYLE}">${esc(intro)}</p>
      ${ctxLinks}
      ${pickLinks}
      ${footerLinks}
    </div>`;
}

// Deterministic page-specific picks from the full URL pool: gives every deep
// page inbound links from many other pages (no orphans, shallow crawl depth).
function pickLinksFor(seedPath, count = 12) {
  let h = 2166136261;
  for (let i = 0; i < seedPath.length; i++) {
    h ^= seedPath.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = [];
  const used = new Set([seedPath]);
  let idx = 0;
  while (out.length < count && idx < pages.length) {
    const p = pages[Math.abs(h + idx * 7919) % pages.length];
    idx++;
    if (!p) continue;
    const href = p.path.replace(/\/+$/, "") || "/";
    if (used.has(href)) continue;
    used.add(href);
    out.push([p.h1, href]);
  }
  return out;
}

let written = 0;
let skipped = 0;
for (const page of pages) {
  const clean = page.path.replace(/\/+$/, "") || "/";
  const isHome = clean === "/";
  const canonical = BASE + (isHome ? "/" : clean);
  const dir = isHome ? DIST : path.join(DIST, clean.replace(/^\//, ""));
  const outFile = path.join(dir, "index.html");

  if (!isHome && fs.existsSync(outFile)) {
    // A real static build output already occupies this URL — never clobber it.
    skipped++;
    continue;
  }

  const head = buildHead({
    title: page.title,
    description: page.description,
    canonical,
    breadcrumbs: breadcrumbsFor(clean),
    isHome,
  });

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/,
    `<meta name="description" content="${esc(page.description)}" />`
  );
  html = html.replace("</head>", `${head}\n  </head>`);

  if (!isHome || clean === "/") {
    const body = buildBody({
      h1: page.h1,
      intro: page.intro,
      links: page.links,
      contextual: isHome ? [] : contextualLinks(clean),
      picks: isHome ? [] : pickLinksFor(clean, 12),
    });
    // Inside #root so React wipes it on hydration.
    html = html.replace('<div id="root">', `<div id="root">${body}`);
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, html);
  written++;
}

console.log(`[seo-prerender] wrote ${written} prerendered pages, skipped ${skipped} (already static), base ${BASE}`);
