// SEO prerender: writes a static index.html per crawlable URL into dist/.
// Runs after `vite build`. Each page gets its own <title>, meta description,
// canonical, Open Graph / Twitter tags and JSON-LD (WebPage + Breadcrumbs),
// so crawlers never see duplicated homepage meta across 1,600+ clean URLs.
//
// Meta is derived from the same enumeration as generate-sitemap.js — the two
// must stay in sync (same URL set, same canonical domain).
//
// Body remains the standard app shell: the SPA hydrates as usual. Crawlers
// get real head content instantly; users notice nothing.

import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.cwd(), "dist");
const TEMPLATE_PATH = path.join(DIST, "index.html");
const BASE = "https://oraclebull.com";

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error("[seo-prerender] dist/index.html not found — run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(TEMPLATE_PATH, "utf8");

// ── helpers ────────────────────────────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escJson = (o) => JSON.stringify(o).replace(/</g, "\\u003c");

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
  if (!isFinite(n)) return t;
  return n >= 1000 ? "$" + n.toLocaleString("en-US") : "$" + t;
};

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

// Static pages: path → [title, description]
const STATIC_SEO = {
  "/dashboard": [
    "Crypto Dashboard — Live Prices, Fear & Greed & Top Movers | Oracle Bull",
    "One live view of the crypto market: real-time prices, global market cap, the Fear & Greed index and today's top gainers and losers — free, no signup.",
  ],
  "/predictions": [
    "AI Crypto Predictions | Real-Time Token Analysis | Oracle Bull",
    "Live technical forecasts for 1,000+ tokens: trend bias, conviction score, entry zones, stop-loss and take-profit levels computed from real-time market data.",
  ],
  "/sentiment": [
    "Crypto Sentiment Dashboard — Fear, Greed & Market Psychology | Oracle Bull",
    "Gauge the market's mood: live Fear & Greed index, momentum breadth, volatility read and trend alignment across the top 250 coins — updated continuously.",
  ],
  "/crypto-strength-meter": [
    "Crypto Strength Meter — Real-Time Market Momentum Rankings | Oracle Bull",
    "Rank the top 250 cryptocurrencies by live momentum strength across 1-hour, 24-hour and 7-day timeframes. Spot what's actually moving right now.",
  ],
  "/scanner": [
    "Crypto Token Scanner – Every Token, CEX & DEX, All Chains | Oracle Bull",
    "Scan tokens across chains and exchanges with live price, volume and liquidity data. Filter the whole market in seconds — free, no wallet needed.",
  ],
  "/explorer": [
    "Crypto Token Explorer — Live Prices, Charts & DEX Data on Every Chain | Oracle Bull",
    "Explore live token data on every major chain: prices, liquidity, 24h volume and DEX pools pulled straight from on-chain markets.",
  ],
  "/accuracy": [
    "Prediction Accuracy Leaderboard — Every Forecast Graded | Oracle Bull",
    "Every expired Oracle Bull forecast gets resolved against live market prices. Per-coin hit rates, graded checkpoints, full transparency — judge the signals yourself.",
  ],
  "/news": [
    "Crypto News — Market-Moving Headlines | Oracle Bull",
    "The latest crypto headlines and market analysis, curated for traders. Prices, signals and context in one feed.",
  ],
  "/market-recap": [
    "Daily Market Recap — What Moved Crypto Today | Oracle Bull",
    "Today's crypto market in one page: total cap movement, top gainers and losers, Fear & Greed and the stories behind the moves.",
  ],
  "/reports": [
    "Weekly Crypto Reports — Market Analysis & Signals | Oracle Bull",
    "Weekly crypto market reports: performance review, momentum shifts and the signals that worked — all graded against live data.",
  ],
  "/insights": [
    "Crypto Insights — Analysis & Research Articles | Oracle Bull",
    "In-depth crypto analysis: market structure, narratives, on-chain trends and trading frameworks, written from live data.",
  ],
  "/airdrops": [
    "Crypto Airdrops — Live Opportunities & Guides | Oracle Bull",
    "Active and upcoming crypto airdrops with eligibility steps, timelines and editorial scoring — find real opportunities, not hype.",
  ],
  "/tools": [
    "Free Crypto Tools -- Calculators, Scanners & Analysis | Oracle Bull",
    "Free crypto calculators and tools: profit calculator, DCA planner, impermanent loss, position sizing — fast, private, no signup.",
  ],
  "/tools/profit-calculator": [
    "Crypto Profit Calculator — Free & Instant | Oracle Bull",
    "Calculate crypto profit or loss on any trade: entry, exit, fees and ROI — instant results, completely free.",
  ],
  "/tools/dca-calculator": [
    "DCA Calculator — Dollar-Cost Averaging Returns | Oracle Bull",
    "Model a dollar-cost-averaging strategy on any coin: schedule, total invested and portfolio value over time.",
  ],
  "/tools/impermanent-loss-calculator": [
    "Impermanent Loss Calculator — LP Position Risk | Oracle Bull",
    "Estimate impermanent loss on any liquidity pair before you provide it — price-change scenarios computed instantly.",
  ],
  "/tools/position-size-calculator": [
    "Position Size Calculator — Risk Per Trade | Oracle Bull",
    "Size any crypto trade correctly: account risk, stop distance and leverage — protect your capital with proper position sizing.",
  ],
  "/compare": [
    "Compare Cryptocurrencies Side-by-Side — Live Data | Oracle Bull",
    "Compare any two cryptocurrencies on price, momentum, market cap and performance across timeframes — live data, zero fluff.",
  ],
  "/factory": [
    "Crypto Factory — Real-Time Market Intelligence, On-Chain Flows & Narratives | Oracle Bull",
    "The market's engine room: live global stats, top movers, Fear & Greed and on-chain activity in one continuously updating view.",
  ],
  "/factory/events": [
    "Crypto Market Events — Live Calendar & Impact | Oracle Bull",
    "Market-moving crypto events and what they historically do to price — tracked in real time.",
  ],
  "/factory/onchain": [
    "On-Chain Activity — Live Flows & Pool Volume | Oracle Bull",
    "Live on-chain view: DEX pool volumes, buy/sell pressure and flow direction across major chains.",
  ],
  "/factory/narratives": [
    "Crypto Narratives — What the Market Is Trading | Oracle Bull",
    "Which stories are pulling capital right now: AI, RWA, memecoins and more — ranked by live momentum.",
  ],
  "/factory/news": [
    "Crypto News Hub — Live Headlines | Oracle Bull",
    "Market-moving crypto news as it happens, filtered for traders.",
  ],
  "/learn": [
    "Learn Crypto Free – Guides & Trading Education | Oracle Bull",
    "Free crypto education: market sentiment, cycles, risk management, on-chain data and more — practical guides for traders.",
  ],
  "/how-to-buy": [
    "How to Buy Crypto — Step-by-Step Guides | Oracle Bull",
    "Step-by-step guides to buying any major cryptocurrency: exchanges, wallets, fees and safety — beginner friendly.",
  ],
  "/liquidations/bitcoin-heatmap": [
    "Bitcoin Liquidation Heatmap — Key Leverage Levels | Oracle Bull",
    "See where Bitcoin leveraged positions cluster: derived liquidation levels and the price zones where cascades can trigger.",
  ],
  "/polymarket": [
    "Polymarket Signals — Live Odds, Implied Probability & Risk Analysis | Oracle Bull",
    "Live Polymarket odds decoded: implied probabilities, volume and risk badges on the 100 biggest prediction markets.",
  ],
  "/embed": [
    "Free Embeddable Crypto Widgets — Price, Prediction & Fear & Greed | Oracle Bull",
    "Embed live crypto widgets on any site: price tickers, prediction cards, Fear & Greed and strength meters — free, one line of code.",
  ],
  "/about": [
    "About Oracle Bull — Free AI Crypto Analytics | Oracle Bull",
    "Who we are: a free, transparent crypto analytics platform. Live data, graded predictions, no paywall — read our methodology.",
  ],
  "/contact": [
    "Contact Oracle Bull — Get in Touch | Oracle Bull",
    "Questions, feedback or partnership ideas? Reach the Oracle Bull team at contact@oraclebull.com.",
  ],
  "/api-docs": [
    "Oracle Bull Public API — Free Market Data Endpoints | Oracle Bull",
    "Free public API for Oracle Bull market data: prices, predictions and sentiment endpoints with fair-use limits.",
  ],
  "/how-to-read-predictions": [
    "How to Read Oracle Bull Predictions — Signal Guide | Oracle Bull",
    "Understand every part of an Oracle Bull forecast: bias, conviction, entry zones, stop-loss and take-profit — explained simply.",
  ],
  "/tutorial/interactive": [
    "Interactive Tutorial — Learn the Platform | Oracle Bull",
    "Take the interactive tour of Oracle Bull: dashboards, predictions, sentiment and tools explained step by step.",
  ],
  "/privacy-policy": ["Privacy Policy | Oracle Bull", "How Oracle Bull collects, uses and protects your data."],
  "/terms": ["Terms of Service | Oracle Bull", "The terms governing your use of Oracle Bull."],
  "/cookie-policy": ["Cookie Policy | Oracle Bull", "The cookies Oracle Bull uses and why."],
  "/risk-disclaimer": ["Risk Disclaimer | Oracle Bull", "Crypto markets are volatile. Read our full risk disclosure before acting on any signal."],
  "/editorial-policy": ["Editorial Policy | Oracle Bull", "How Oracle Bull researches, sources and reviews its content."],
  "/welcome": ["Welcome to Oracle Bull", "Get started with Oracle Bull — free live crypto analytics."],
  "/launch": ["Oracle Bull — Launch", "Oracle Bull is live: free crypto predictions, dashboards and tools."],
  "/m": ["Oracle Bull — Live Market Pulse", "The fastest view of the crypto market: prices, momentum and fear in one glance."],
  "/game": ["Daily Crypto Price Game — Call It & Get Graded | Oracle Bull", "Call Bitcoin's daily move and get graded against the real close. Free daily game with your full call history."],
  "/recap": ["Daily Market Recap — What Moved Crypto Today | Oracle Bull", "Today's crypto market in one page: total cap movement, top movers, Fear & Greed and the stories behind the moves."],
};

// ── page list ──────────────────────────────────────────────────────────────
const pages = []; // { path, title, description }

function add(path, title, description) {
  pages.push({ path, title, description });
}
function addStatic(p) {
  const entry = STATIC_SEO[p];
  if (entry) add(p, entry[0], entry[1]);
}
Object.keys(STATIC_SEO).forEach(addStatic);

// Dynamic families
const TF_LABEL = { daily: "Today", weekly: "This Week", monthly: "This Month" };
topCryptos.forEach((c) => {
  const n = coinName(c);
  add(`/price-prediction/${c}`,
    `${n} Price Prediction — Live Technical Forecast & Targets | Oracle Bull`,
    `Live ${n} forecast computed from real market data: trend bias, conviction score, entry zone, stop-loss and take-profit targets — updated continuously, free.`);
  add(`/price-prediction/${c}/daily`,
    `${n} Price Prediction Today — Live Forecast & Levels | Oracle Bull`,
    `Where is ${n} headed today? Live technical read with momentum, key levels, entry zone, stop-loss and targets — computed from real-time data.`);
  add(`/price-prediction/${c}/weekly`,
    `${n} Price Prediction This Week — Live Forecast | Oracle Bull`,
    `${n} weekly outlook from live market data: trend strength, support and resistance, entry and exit levels — no hype, just the read.`);
  add(`/price-prediction/${c}/monthly`,
    `${n} Price Prediction This Month — Live Outlook | Oracle Bull`,
    `${n} monthly forecast built on live momentum and trend structure: scenario levels, risk zones and the key data behind them.`);
});
top30.forEach((c) => {
  const n = coinName(c);
  years.forEach((y) => {
    add(`/price-prediction/${c}/${y}`,
      `${n} Price Prediction for ${y} — Scenario Targets | Oracle Bull`,
      `${n} in ${y}: scenario-based price targets, the technical path there, and what live data says about the trend today.`);
  });
});
top50.forEach((c) => {
  const n = coinName(c);
  add(`/today/${c}`,
    `${n} Today — Live Price, Signal & Market Snapshot | Oracle Bull`,
    `${n} right now: live price, today's signal, momentum and the market context behind it — one page, real data.`);
  add(`/accuracy/${c}`,
    `${n} Prediction Accuracy — Graded Forecast Record | Oracle Bull`,
    `How accurate are Oracle Bull's ${n} predictions? Every expired call resolved against live prices — see the real hit rate.`);
  add(`/how-to-buy/${c}`,
    `How to Buy ${n} — Step-by-Step Guide & Wallets | Oracle Bull`,
    `How to buy ${n} safely: choosing an exchange, funding your account, storage options and fees — a clear beginner guide.`);
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
  ["will-{coin}-go-up-today", (n) => [`Will ${n} Go Up Today? Live Trend Signal | Oracle Bull`, `Real-time technical read on ${n}: momentum, trend strength and the key levels that decide today's direction.`]],
  ["{coin}-price-prediction-today", (n) => [`${n} Price Prediction Today — Live Forecast | Oracle Bull`, `${n} live forecast: trend bias, conviction and the exact levels that matter today — computed from real market data.`]],
  ["is-{coin}-bullish-today", (n) => [`Is ${n} Bullish Today? Live Trend Check | Oracle Bull`, `Is ${n} showing bullish structure right now? Check the live momentum, breadth and level read before you trade.`]],
  ["should-i-buy-{coin}-today", (n) => [`Should I Buy ${n} Today? Data-Backed Read | Oracle Bull`, `A data-first answer on buying ${n} today: live trend, conviction and risk levels — plus what would change the read.`]],
  ["{coin}-forecast-today", (n) => [`${n} Forecast Today — Momentum, Levels & Bias | Oracle Bull`, `Today's ${n} forecast from live data: directional bias, momentum score and the levels to watch.`]],
  ["{coin}-price-prediction-this-week", (n) => [`${n} Price Prediction This Week | Oracle Bull`, `${n} this week: weekly trend structure, momentum and the price zones that shape the outlook.`]],
  ["{coin}-weekly-forecast", (n) => [`${n} Weekly Forecast — Trend & Key Levels | Oracle Bull`, `The week ahead for ${n}: live weekly trend read, support and resistance, and scenario levels.`]],
  ["is-{coin}-a-good-investment-this-month", (n) => [`Is ${n} a Good Investment This Month? | Oracle Bull`, `A monthly read on ${n}: trend, momentum and risk data to inform your own decision — not financial advice.`]],
  ["{coin}-monthly-forecast", (n) => [`${n} Monthly Forecast — Outlook & Levels | Oracle Bull`, `${n} monthly outlook built from live trend data: scenario levels and the technical path.`]],
  ["{coin}-price-prediction-2026", (n) => [`${n} Price Prediction 2026 — Scenarios & Targets | Oracle Bull`, `${n} in 2026: scenario-based targets and what today's live trend data says about the path.`]],
  ["{coin}-price-prediction-2027", (n) => [`${n} Price Prediction 2027 — Scenarios & Targets | Oracle Bull`, `${n} in 2027: long-horizon scenarios grounded in today's live technical structure.`]],
  ["is-{coin}-a-good-investment", (n) => [`Is ${n} a Good Investment? Live Read | Oracle Bull`, `The live-data view on ${n} as an investment: trend, momentum and risk — so you can decide with data.`]],
  ["{coin}-buy-or-sell", (n) => [`${n}: Buy or Sell? Live Technical Verdict | Oracle Bull`, `Buy or sell ${n} right now? See the live technical verdict with conviction, entries and invalidation levels.`]],
  ["{coin}-technical-analysis", (n) => [`${n} Technical Analysis — Live Chart Read | Oracle Bull`, `Live ${n} technical analysis: trend structure, momentum, volume and the levels that matter now.`]],
  ["{coin}-whale-activity", (n) => [`${n} Whale Activity — Live Pool Flows | Oracle Bull`, `Track ${n} whale-scale activity: live DEX pool flows, buy and sell pressure over the last 24 hours.`]],
];
qCoins.forEach((coin) => {
  const n = coinName(coin);
  qPatterns.forEach(([pattern, gen]) => {
    const [t, d] = gen(n);
    add(`/q/${pattern.replace(/\{coin\}/g, coin)}`, t, d);
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
  const title = isQuestion
    ? `${h}? — Live Data Answer | Oracle Bull`
    : `${h} — Live Ranked Data | Oracle Bull`;
  const desc = isQuestion
    ? `Get a live, data-backed answer to "${h.toLowerCase()}" — computed from real-time prices, volume and momentum across the top 250 coins.`
    : `${h}: ranked live from real-time market data — prices, volume and momentum. No paywall, no hype.`;
  add(`/market/${s}`, title, desc);
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
      add(`/predict/${coin}/${t}/${y}`,
        `Will ${n} Hit ${fmtTarget(t)} by ${y}? — Live Scenario Read | Oracle Bull`,
        `Can ${n} reach ${fmtTarget(t)} by ${y}? See the live technical read and what the data says about the path.`);
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
      `${a} vs ${b} — Live Head-to-Head Comparison | Oracle Bull`,
      `${a} or ${b}? Compare live price, momentum, market cap and performance side-by-side before you choose.`);
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
    `${a} vs ${b} — Live Comparison: Price, Momentum & Fundamentals | Oracle Bull`,
    `${a} vs ${b} on live data: price, market cap, momentum and timeframe performance — the honest head-to-head.`);
});
const convCoins = vsCoins;
["usd", "eur", "gbp"].forEach((f) => {
  convCoins.forEach((c) => {
    const n = coinName(c);
    add(`/convert/${c}/${f}`,
      `${n} to ${f.toUpperCase()} — Live Conversion Rate & Calculator | Oracle Bull`,
      `Convert ${n} to ${f.toUpperCase()} at the live rate: instant calculator, current price and 24h change.`);
  });
});

// Chains
["ethereum","solana","bnb","avalanche","polygon","arbitrum","base","optimism","sui","ton"].forEach((c) => {
  const n = c === "bnb" ? "BNB Chain" : c === "ton" ? "TON" : titleCase(c);
  add(`/chain/${c}`,
    `${n} DeFi Dashboard — Live DEX Volume, Top Pools & Tokens | Oracle Bull`,
    `Live ${n} on-chain data: 24h DEX volume, top pools, trending tokens and whale-scale flows — straight from on-chain markets.`);
});

// Airdrops
["linea","monad","berachain","scroll","hyperliquid","zksync","megaeth","base"].forEach((a) => {
  const n = titleCase(a);
  add(`/airdrops/${a}`,
    `${n} Airdrop Guide — Eligibility, Steps & Timeline | Oracle Bull`,
    `${n} airdrop: eligibility criteria, step-by-step farming guide, tokenomics and key dates — with an honest editorial score.`);
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
  add(`/learn/${s}`, `${titleCase(s)} — Oracle Bull Guide | Oracle Bull`,
    `${titleCase(s)}: a practical, data-driven guide from the Oracle Bull education library.`);
});

// Insights articles (slugs from source of truth)
try {
  const src = fs.readFileSync("src/data/insightsArticles.ts", "utf8");
  const slugs = [...new Set([...src.matchAll(/slug:\s*["'`]([a-z0-9-]+)["'`]/g)].map((m) => m[1]))];
  slugs.forEach((s) => {
    add(`/insights/${s}`, `${titleCase(s)} — Oracle Bull Insights | Oracle Bull`,
      `${titleCase(s)}: analysis from the Oracle Bull research library, grounded in live market data.`);
  });
} catch {
  console.warn("[seo-prerender] insightsArticles.ts not found — skipping /insights slugs");
}

// Embeds
["bitcoin","ethereum","solana","ripple","binancecoin","cardano","dogecoin","polkadot",
 "chainlink","avalanche-2","litecoin","uniswap","near","sui","aptos","arbitrum",
 "optimism","pepe","shiba-inu","toncoin"].forEach((c) => {
  const n = coinName(c);
  add(`/embed/price/${c}`, `${n} Price Widget — Free Embed | Oracle Bull`,
    `Embed a live ${n} price widget on your site — free, one line of code, always current.`);
  add(`/embed/prediction/${c}`, `${n} Prediction Widget — Free Embed | Oracle Bull`,
    `Embed the live ${n} prediction card: bias, conviction and targets on your site.`);
  add(`/embed/strength/${c}`, `${n} Strength Meter Widget — Free Embed | Oracle Bull`,
    `Embed the live ${n} momentum strength meter on your site — free and auto-updating.`);
});
add("/embed/fear-greed", "Fear & Greed Index Widget — Free Embed | Oracle Bull",
  "Embed the live crypto Fear & Greed index on your site — free, one line of code.");

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
  add(`/explorer/${chain}/${addr}`,
    `${sym} on ${titleCase(chain)} — Live Token Data & Pools | Oracle Bull`,
    `${sym} (${addr.slice(0, 10)}…) live on ${titleCase(chain)}: price, liquidity, 24h volume and DEX pools.`);
});

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
  // Replace the template's title+description with page-specific ones
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[\s\S]*?" \/>/,
    `<meta name="description" content="${esc(page.description)}" />`
  );
  // Inject canonical + OG + schema before </head>
  html = html.replace("</head>", `${head}\n  </head>`);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, html);
  written++;
}

console.log(`[seo-prerender] wrote ${written} prerendered pages, skipped ${skipped} (already static), base ${BASE}`);
