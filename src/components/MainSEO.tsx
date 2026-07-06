import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, SITE_NAME, TWITTER_HANDLE } from "@/lib/siteConfig";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonicalPath?: string;
  /** Force noindex,nofollow regardless of path — used by the 404/NotFound route
      so soft-404s (the SPA serves the homepage shell for unknown URLs) aren't
      indexed once Googlebot renders the JS and lands on the catch-all route. */
  noindex?: boolean;
}

const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
const currentYear = new Date().getFullYear();

// Map CoinGecko-ID alias slugs → the primary friendly slug used by the prerendered
// prediction pages. Keep in sync with COIN_ALIASES in scripts/seo-prerender.mjs.
const PREDICTION_SLUG_ALIASES: Record<string, string> = {
  "binancecoin": "bnb",
  "avalanche-2": "avalanche",
  "matic-network": "polygon",
  "render-token": "render",
  "injective-protocol": "injective",
  "toncoin": "ton",
  "xrp": "ripple",
  "immutable": "immutable-x",
};

// For /price-prediction/{slug}[/tf] paths whose slug is an alias, return the
// canonical path pointing at the primary slug. All other paths return unchanged.
function resolveCanonicalPath(path: string): string {
  if (!path.startsWith("/price-prediction/")) return path;
  const rest = path.slice("/price-prediction/".length);
  const [slug, ...tail] = rest.split("/");
  const primary = PREDICTION_SLUG_ALIASES[slug];
  if (!primary) return path;
  return `/price-prediction/${[primary, ...tail].join("/")}`;
}

const defaultMeta = {
  siteName: SITE_NAME,
  title: `Free AI Crypto Predictions | Oracle Bull`,
  description: "Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. No signup needed.",
  keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site",
  image: "https://oraclebull.com/og-image.jpg",
  twitterHandle: TWITTER_HANDLE,
  baseUrl: SITE_URL
};


const pageSEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: `Free AI Crypto Predictions | Oracle Bull`,
    description: `Free AI crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts & sentiment analysis. No signup needed.`,
    keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site, will crypto go up today, best crypto to buy today"
  },
  "/dashboard": {
    title: `Crypto Dashboard | Live Prices & Signals`,
    description: `Live crypto dashboard with real-time prices, top gainers, market momentum, and AI insights for BTC, ETH & 1000+ altcoins.`,
    keywords: "crypto dashboard live, real time crypto prices, crypto market today, top crypto gainers today, crypto market cap live, crypto prices now, bitcoin price live, altcoin dashboard"
  },
  "/strength-meter": {
    title: `Crypto Strength Meter – Live Asset Rankings`,
    description: `See which crypto is strongest right now. Real-time rankings for BTC, ETH, SOL & 100+ assets by momentum, volume & sentiment. Free tool.`,
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto, crypto relative strength"
  },
  "/strength": {
    title: `Compare Crypto Strength – Live Asset Rankings`,
    description: `Compare crypto strength in real time. Rankings for BTC, ETH, SOL & 100+ assets by momentum, volume & sentiment scores. Free tool, no signup.`,
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto"
  },
  "/factory": {
    title: `Crypto Factory – Events & On-Chain Intel`,
    description: "Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto. Updated in real-time.",
    keywords: "crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto, crypto market events, protocol upgrades, crypto news today"
  },
  "/factory/events": {
    title: `Crypto Events Calendar – Launches & Upgrades`,
    description: `Track upcoming crypto events: token launches, protocol upgrades, airdrops, governance votes & market-moving announcements. Updated live.`,
    keywords: "crypto events calendar, upcoming token launches, crypto airdrops, protocol upgrades, crypto governance, market events crypto"
  },
  "/factory/onchain": {
    title: `On-Chain Intel – Whale Moves & Smart Money`,
    description: `Real-time on-chain analytics: whale wallet movements, large transfers, smart money accumulation, DeFi flows, and exchange inflows/outflows. Know what whales are doing before the market reacts.`,
    keywords: "on-chain analytics, whale movements crypto, smart money flow, large crypto transactions, whale tracker live, on-chain data"
  },
  "/factory/narratives": {
    title: `Crypto Narratives – Trending Sectors & Rotation`,
    description: `Track trending crypto narratives in real-time: AI tokens, DeFi 2.0, RWA, meme coins, Layer 2s. Identify sector rotation before it happens. Updated ${currentMonth} ${currentYear}.`,
    keywords: "crypto narratives, trending crypto sectors, AI tokens, DeFi narrative, RWA crypto, sector rotation crypto, narrative trading"
  },
  "/factory/news": {
    title: `Crypto News Today – Sentiment-Tagged Headlines`,
    description: `Breaking crypto news from 50+ sources with real-time sentiment scoring. Filter by bullish/bearish impact, coin, or chain. Stay ahead of the market with AI-tagged news alerts.`,
    keywords: "crypto news today, breaking crypto news, bitcoin news, crypto news live, cryptocurrency headlines, crypto market news"
  },

  "/scanner": {
    title: `Crypto Token Scanner – Find Hidden Gems & New Tokens`,
    description: "Scan for new and trending crypto tokens across all blockchains. Find hidden gems, analyze token metrics, liquidity, and risk scores. Free real-time scanner.",
    keywords: "crypto scanner, token scanner, new crypto tokens, hidden gems crypto, crypto gem finder, low cap crypto, new token alert"
  },
  "/my/scanner": {
    title: `Free Wallet Scanner – Analyze Any Crypto Wallet`,
    description: "Paste any EVM or Solana wallet address for instant AI analysis. See holdings, hidden gems, risk scores & pump potential. 100% free, no signup.",
    keywords: "crypto wallet scanner free, wallet analyzer, portfolio tracker, check crypto wallet, solana wallet checker, ethereum wallet scanner"
  },
  "/sentiment": {
    title: `Crypto Fear & Greed Index + Live Whale Tracker`,
    description: "Real-time crypto sentiment: Fear & Greed Index, whale transaction alerts, social buzz from Twitter/Reddit/Telegram & trending topics. Make data-driven trading decisions.",
    keywords: "crypto fear greed index today, whale alerts crypto, crypto sentiment analysis, crypto social signals, bitcoin sentiment, is crypto bullish today"
  },
  "/explorer": {
    title: `Crypto Token Explorer – Search Coin or Contract`,
    description: "Search 10,000+ tokens by name, symbol, or contract address. Get price charts, holder analysis, liquidity depth & DeFi metrics across 30+ blockchains. Free.",
    keywords: "crypto token explorer, search cryptocurrency, token contract lookup, crypto analysis by address, defi token scanner, crypto lookup"
  },
  "/learn": {
    title: `Learn Crypto Free – Articles & Trading Guides`,
    description: "Free daily crypto education: AI-written market insights, Bitcoin guides, DeFi tutorials, technical analysis lessons & trading strategies. 2000+ articles available.",
    keywords: "learn crypto free, crypto education, bitcoin guide for beginners, defi tutorial, crypto trading course free, how to trade crypto"
  },
  "/insights": {
    title: `Crypto Market Analysis – AI-Powered Daily Insights`,
    description: "Daily AI market analysis for Bitcoin, Ethereum, Solana & altcoins. On-chain data, technical indicators & expert research. Updated every day, always free.",
    keywords: "crypto analysis today, daily crypto insights, bitcoin market analysis, ethereum analysis today, crypto research, crypto news analysis"
  },
  "/contact": {
    title: "Contact Oracle Bull – Get Support & Join Our Community",
    description: "Reach the Oracle Bull team via email, Twitter or Telegram. Join 50,000+ traders using our free AI crypto analytics platform. Quick response guaranteed.",
    keywords: "contact oracle bull, oracle bull support, oracle bull telegram, crypto community"
  },
  "/predictions": {
    title: `AI Crypto Predictions – Browse All Forecasts`,
    description: "Browse AI-powered price predictions for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly forecasts with confidence scores and bull/bear targets.",
    keywords: "crypto price prediction, bitcoin forecast today, ethereum prediction, altcoin predictions, AI crypto forecast, crypto prediction today, will bitcoin go up"
  },
  "/price-prediction": {
    title: `AI Crypto Forecasts – Price Targets & Zones`,
    description: "Get AI-powered price forecasts for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly targets with entry zones, stop-loss and take-profit levels.",
    keywords: "crypto price prediction, bitcoin forecast today, ethereum prediction, altcoin predictions, AI crypto forecast, crypto prediction today, will bitcoin go up"
  },
  "/about": {
    title: "About Oracle Bull – Free AI Crypto Analytics Platform",
    description: "Oracle Bull is a free AI-powered crypto forecasting platform used by 50,000+ traders. Real-time predictions, whale tracking & sentiment analysis for 1000+ tokens.",
    keywords: "about oracle bull, AI crypto platform, free crypto analytics"
  },
  "/privacy-policy": {
    title: "Privacy Policy – Oracle Bull",
    description: "Oracle Bull privacy policy. How we protect your data, what we collect, and your rights as a user of our free crypto analytics platform.",
    keywords: "oracle bull privacy policy, crypto platform privacy"
  },
  "/terms": {
    title: "Terms of Service – Oracle Bull",
    description: "Terms and conditions for using Oracle Bull's free AI-powered cryptocurrency analytics, predictions, and trading tools.",
    keywords: "oracle bull terms, crypto platform terms of service"
  },
  "/risk-disclaimer": {
    title: "Risk Disclaimer – Oracle Bull",
    description: "Important risk disclosure for cryptocurrency trading and AI predictions. Understand the risks before using Oracle Bull's analytics tools.",
    keywords: "crypto risk disclaimer, trading risk, AI prediction disclaimer"
  },
  "/my": {
    title: `My Hub – Personal Crypto Dashboard & Tools (${currentMonth} ${currentYear})`,
    description: "Your personal crypto command center. Track your portfolio, set price alerts, manage watchlists, journal trades, and access AI trading signals all in one place.",
    keywords: "crypto dashboard personal, crypto portfolio tracker, crypto alerts, trading journal, watchlist crypto"
  },
  "/my/watchlist": {
    title: "My Watchlist | Oracle Bull",
    description: "Track your favorite cryptocurrencies with real-time prices, alerts, and market signals in your personal watchlist.",
    keywords: "crypto watchlist, portfolio watchlist, price alerts, token tracker"
  },
  "/my/portfolio": {
    title: "My Portfolio | Oracle Bull",
    description: "Monitor your crypto holdings, P&L, and asset allocation across wallets in one personalized dashboard.",
    keywords: "crypto portfolio, portfolio tracker, crypto holdings, asset allocation"
  },
  "/my/alerts": {
    title: "My Alerts | Oracle Bull",
    description: "Manage price alerts and notifications for Bitcoin, Ethereum, and your favorite crypto tokens.",
    keywords: "crypto alerts, price notifications, bitcoin alert, ethereum alert"
  },
  "/my/settings": {
    title: "My Settings | Oracle Bull",
    description: "Customize your Oracle Bull preferences, notifications, and account settings.",
    keywords: "crypto dashboard settings, notification preferences, account settings"
  },
  "/my/signals": {
    title: "My Signals | Oracle Bull",
    description: "View personalized AI trading signals with entry zones, price targets, and confidence scores.",
    keywords: "AI trading signals, crypto signals, buy sell signals, price targets"
  },
  "/my/tracker": {
    title: "My Tracker | Oracle Bull",
    description: "Advanced portfolio tracking with profit & loss analysis, historical charts, and performance metrics.",
    keywords: "portfolio tracker, crypto P&L, investment tracking, performance analytics"
  },
  "/my/social": {
    title: "My Social | Oracle Bull",
    description: "Curated crypto social feed with real-time sentiment from Twitter, Reddit, and Telegram.",
    keywords: "crypto social feed, sentiment analysis, twitter crypto, reddit crypto"
  },
  "/my/journal": {
    title: "My Journal | Oracle Bull",
    description: "Log and review your crypto trades with performance notes and analytics to refine your strategy.",
    keywords: "trading journal, crypto trade log, trade review, strategy tracker"
  },
  "/my/news": {
    title: "My News | Oracle Bull",
    description: "Personalized crypto news feed with AI-tagged bullish and bearish market headlines and analysis.",
    keywords: "crypto news feed, personalized crypto news, market headlines, AI news tags"
  },
  "/my/dca": {
    title: "My DCA Planner | Oracle Bull",
    description: "Plan your dollar-cost averaging strategy with automated schedules and projected return estimates.",
    keywords: "DCA planner, dollar cost averaging crypto, automated investing, crypto DCA"
  },
  "/my/copy": {
    title: "My Copy Trading | Oracle Bull",
    description: "Discover top crypto traders and set up automated copy trading based on verified performance.",
    keywords: "copy trading crypto, follow traders, automated trading, social trading"
  },
  "/market/best-crypto-to-buy-today": {
    title: `Best Crypto to Buy Today – AI Picks (${currentMonth} ${currentYear})`,
    description: `AI-curated list of the best cryptocurrencies to buy today based on momentum, volume, sentiment, and technical signals. Updated ${currentMonth} ${currentYear}.`,
    keywords: "best crypto to buy today, crypto to buy now, top crypto picks today, AI crypto picks"
  },
  "/market/top-crypto-gainers-today": {
    title: `Top Crypto Gainers Today – Biggest Winners Right Now (${currentMonth} ${currentYear})`,
    description: `Real-time list of today's biggest crypto gainers ranked by 24h price change. Includes volume analysis, momentum scores, and AI commentary. Updated live.`,
    keywords: "top crypto gainers today, biggest crypto movers, best performing crypto today, crypto winners today"
  },
  "/market/next-crypto-to-explode": {
    title: `Next Crypto to Explode – High Potential Altcoins (${currentMonth} ${currentYear})`,
    description: `AI-identified cryptocurrencies with the highest explosion potential based on fundamentals, community growth, and technical breakouts. ${currentMonth} ${currentYear} picks.`,
    keywords: "next crypto to explode, crypto to explode soon, high potential crypto, crypto moonshot, altcoins to watch"
  },
  "/market/cheap-crypto-to-buy-now": {
    title: `Cheap Crypto to Buy Now – Best Value Picks Under $1 (${currentMonth} ${currentYear})`,
    description: `Top cheap cryptocurrencies worth buying now. Affordable tokens under $1 with strong growth potential, analyzed by AI for momentum, utility, and risk score.`,
    keywords: "cheap crypto to buy, best crypto under $1, affordable cryptocurrency, low price high potential crypto"
  },
  "/market/top-meme-coins": {
    title: `Top Meme Coins Right Now – Best Meme Crypto Rankings (${currentMonth} ${currentYear})`,
    description: `Live rankings of the hottest meme coins by community strength, social buzz, and price momentum. Includes DOGE, SHIB, PEPE, FLOKI & emerging meme tokens.`,
    keywords: "top meme coins, best meme crypto, meme coin rankings, dogecoin shiba inu pepe, meme coin to buy"
  },
  "/market/top-ai-crypto-tokens": {
    title: `Top AI Crypto Tokens – Best Artificial Intelligence Coins (${currentMonth} ${currentYear})`,
    description: `Rankings of the best AI-focused cryptocurrency projects by market cap, utility, and ecosystem growth. Track the AI crypto narrative in real time.`,
    keywords: "top AI crypto, best AI tokens, artificial intelligence crypto, AI blockchain projects, AI coins to buy"
  },
};

export function SEO({ title, description, keywords, image, type = "website", canonicalPath, noindex = false }: SEOProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get page-specific or default SEO
  const pageMeta = pageSEO[currentPath] || (currentPath.includes("/chain/") ? (() => {
    const chainSlug = currentPath.split("/chain/")[1] || "blockchain";
    const chainDisplay = chainSlug.charAt(0).toUpperCase() + chainSlug.slice(1);
    return {
      title: `${chainDisplay} Analytics – Live Price, DeFi & Whale Alerts (${currentMonth} ${currentYear})`,
      description: `Real-time ${chainDisplay} blockchain analytics: price charts, whale tracking, token discovery, risk analysis & AI predictions. Free ${chainDisplay} dashboard updated every 30 seconds. ${currentMonth} ${currentYear}.`,
      keywords: `${chainSlug} analytics, ${chainSlug} price today, ${chainSlug} whale alerts, ${chainSlug} DeFi, ${chainSlug} tokens, ${chainSlug} prediction, ${chainSlug} news`
    };
  })() : currentPath.includes("/price-prediction/") ? (() => {
    const coinSlug = currentPath.split("/price-prediction/")[1]?.split("/")[0] || "crypto";
    const coinDisplay = coinSlug.charAt(0).toUpperCase() + coinSlug.slice(1).replace(/-/g, " ");
    const tf = currentPath.includes("/daily") ? "Today" : currentPath.includes("/weekly") ? "This Week" : currentPath.includes("/monthly") ? "This Month" : "";
    return {
      title: `${coinDisplay} Price Prediction ${tf || currentMonth + " " + currentYear} – AI Forecast & Targets`,
      description: `${coinDisplay} price prediction ${tf ? tf.toLowerCase() : "for " + currentMonth + " " + currentYear}. AI-powered forecast with entry zones, support/resistance levels, bull/bear targets & confidence scores. Updated live.`,
      keywords: `${coinSlug} price prediction, ${coinSlug} forecast ${tf.toLowerCase()}, will ${coinSlug} go up, ${coinSlug} analysis, ${coinSlug} price target, should I buy ${coinSlug}`
    };
  })() : currentPath.includes("/q/") ? (() => {
    const slug = currentPath.split("/q/")[1] || "";
    const readable = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: `${readable} – AI Answer & Live Analysis (${currentMonth} ${currentYear})`,
      description: `${readable}? Get the AI-powered answer with live market data, technical analysis, whale activity & price targets. Updated ${currentMonth} ${currentYear}.`,
      keywords: `${slug.replace(/-/g, " ")}, crypto prediction today, should i buy crypto`
    };
  })() : currentPath.includes("/market/") ? (() => {
    const slug = currentPath.split("/market/")[1] || "";
    const readable = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    // Map common market slugs to highly optimized titles
    const marketTitles: Record<string, { title: string; description: string; keywords: string }> = {
      "best-crypto-to-buy-today": { title: `Best Crypto to Buy Today – AI Picks & Live Analysis (${currentMonth} ${currentYear})`, description: `Which cryptocurrency should you buy today? AI-curated picks based on real-time momentum, volume, sentiment, and technical signals. Updated ${currentMonth} ${currentYear}.`, keywords: `best crypto to buy today, crypto to buy now, best cryptocurrency ${currentYear}, top crypto picks today` },
      "top-crypto-gainers-today": { title: `Top Crypto Gainers Today – Biggest Winners Right Now (${currentMonth} ${currentYear})`, description: `Live list of today's top crypto gainers by 24h price change with volume analysis, momentum scores, and AI insights. Updated every 30 seconds.`, keywords: "top crypto gainers today, biggest crypto movers today, best performing crypto today, crypto up today" },
      "crypto-market-prediction-today": { title: `Crypto Market Prediction Today – Bullish or Bearish? (${currentMonth} ${currentYear})`, description: `AI-powered crypto market prediction for today. BTC dominance, altcoin rotation signals, Fear & Greed Index, and overall market outlook. Updated ${currentMonth} ${currentYear}.`, keywords: "crypto market prediction today, will crypto go up today, crypto market outlook, bitcoin market today" },
      "which-crypto-will-go-up-today": { title: `Which Crypto Will Go Up Today? AI Predictions (${currentMonth} ${currentYear})`, description: `AI-ranked list of cryptocurrencies most likely to go up today based on momentum, breakout signals, and whale activity. See today's top movers.`, keywords: "which crypto will go up today, crypto going up today, crypto to buy today, best crypto for today" },
      "crypto-losers-today": { title: `Crypto Losers Today – Biggest Decliners & Bounce Candidates (${currentMonth} ${currentYear})`, description: `Today's biggest crypto losers ranked by 24h decline. Includes oversold bounce probability, support levels, and AI recovery analysis.`, keywords: "crypto losers today, biggest crypto decliners, crypto down today, oversold crypto" },
      "is-crypto-going-up-today": { title: `Is Crypto Going Up Today? Market Analysis (${currentMonth} ${currentYear})`, description: `Is the crypto market going up or down today? Real-time analysis of BTC, ETH, market cap trends, Fear & Greed Index, and AI-powered market outlook.`, keywords: "is crypto going up today, crypto market direction, will crypto rise today, crypto bullish today" },
      "best-crypto-to-buy-this-week": { title: `Best Crypto to Buy This Week – Top Weekly Picks (${currentMonth} ${currentYear})`, description: `This week's top cryptocurrency picks with swing trading entry zones, resistance targets, and weekly AI forecasts. Updated every Monday.`, keywords: "best crypto to buy this week, top crypto this week, crypto weekly picks, swing trading crypto" },
      "crypto-prediction-this-week": { title: `Crypto Prediction This Week – Weekly Market Forecast (${currentMonth} ${currentYear})`, description: `Complete weekly crypto market forecast with BTC, ETH, and altcoin outlooks, key support/resistance levels, and macro event calendar.`, keywords: "crypto prediction this week, crypto forecast this week, weekly crypto analysis, bitcoin this week" },
      "crypto-to-watch-this-week": { title: `Crypto to Watch This Week – Upcoming Catalysts & Breakouts (${currentMonth} ${currentYear})`, description: `This week's top cryptocurrencies to watch with upcoming catalysts, technical breakouts, and whale accumulation signals. Don't miss these.`, keywords: "crypto to watch this week, crypto catalysts this week, crypto breakouts, crypto alerts this week" },
      "top-crypto-gainers-this-week": { title: `Top Crypto Gainers This Week – Weekly Performance Leaders (${currentMonth} ${currentYear})`, description: `This week's best performing cryptocurrencies ranked by weekly gain across all market cap tiers with trend analysis and momentum scores.`, keywords: "top crypto gainers this week, best performing crypto this week, weekly crypto winners" },
      "next-crypto-to-explode": { title: `Next Crypto to Explode – High Potential Altcoins (${currentMonth} ${currentYear})`, description: `AI-identified cryptocurrencies with the highest growth potential right now. Based on fundamentals, community growth, and technical breakout signals.`, keywords: "next crypto to explode, crypto to explode soon, next 100x crypto, altcoins about to pump" },
      "safest-crypto-to-invest": { title: `Safest Crypto to Invest – Low Risk Blue Chips (${currentMonth} ${currentYear})`, description: `The safest cryptocurrencies for conservative investors. Blue-chip assets with proven track records, high liquidity, and low volatility scores.`, keywords: "safest crypto to invest, safe cryptocurrency, low risk crypto, stable crypto investment" },
      "cheap-crypto-to-buy-now": { title: `Cheap Crypto to Buy Now – Best Affordable Coins Under $1 (${currentMonth} ${currentYear})`, description: `Top low-priced cryptocurrencies worth buying now. Affordable tokens under $1 with strong fundamentals, growing communities, and AI growth scores.`, keywords: "cheap crypto to buy now, best crypto under $1, affordable crypto, low price high potential" },
      "undervalued-crypto-to-buy": { title: `Undervalued Crypto to Buy – Hidden Gems Below Fair Value (${currentMonth} ${currentYear})`, description: `Cryptocurrencies trading below their AI-estimated fair value. Find fundamentally strong tokens that are currently undervalued by the market.`, keywords: "undervalued crypto to buy, undervalued cryptocurrency, crypto hidden gems, crypto below fair value" },
      "crypto-with-most-potential": { title: `Crypto with Most Potential – Highest Upside Picks (${currentMonth} ${currentYear})`, description: `Cryptocurrencies with the highest long-term growth potential. AI-scored by technology, team, tokenomics, ecosystem growth, and market positioning.`, keywords: "crypto with most potential, highest potential crypto, best crypto long term, most promising crypto" },
      "best-altcoins-to-buy": { title: `Best Altcoins to Buy Right Now – Top Picks (${currentMonth} ${currentYear})`, description: `The best altcoins to buy now ranked by investment potential, market momentum, and AI analysis. Discover which non-Bitcoin cryptos lead the market.`, keywords: `best altcoins to buy, best altcoins ${currentYear}, top altcoins, altcoins to invest in` },
      "top-meme-coins": { title: `Top Meme Coins Right Now – Best Meme Crypto Rankings (${currentMonth} ${currentYear})`, description: `Live rankings of the hottest meme coins by community strength, social buzz, trading volume, and price momentum. Includes DOGE, SHIB, PEPE & more.`, keywords: "top meme coins, best meme crypto, meme coin rankings, best meme coins to buy" },
      "best-defi-tokens": { title: `Best DeFi Tokens to Buy – Top DeFi Coins (${currentMonth} ${currentYear})`, description: `The best decentralized finance tokens ranked by TVL growth, protocol revenue, tokenomics, and AI analysis. Find the top DeFi investments.`, keywords: "best defi tokens, top defi coins, defi tokens to buy, best defi crypto" },
      "top-ai-crypto-tokens": { title: `Top AI Crypto Tokens – Best Artificial Intelligence Coins (${currentMonth} ${currentYear})`, description: `Rankings of the best AI-focused blockchain projects by market cap, utility, and ecosystem growth. Track the AI crypto narrative in real time.`, keywords: "top AI crypto tokens, best AI crypto, artificial intelligence coins, AI blockchain projects" },
    };
    const marketMeta = marketTitles[slug];
    if (marketMeta) return marketMeta;
    return {
      title: `${readable} – AI Analysis & Live Data (${currentMonth} ${currentYear})`,
      description: `${readable}: AI-powered market analysis with live prices, technical indicators, whale activity & sentiment scores. Updated ${currentMonth} ${currentYear}.`,
      keywords: `${slug.replace(/-/g, " ")}, best crypto to buy, crypto picks today`
    };
  })() : currentPath.includes("/insights/") ? (() => {
    const slug = currentPath.split("/insights/")[1]?.split("/")[0] || "";
    const readable = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: `${readable} – Crypto Market Analysis | Oracle Bull`,
      description: `${readable}. Expert cryptocurrency market analysis with on-chain data, technical indicators, and AI-powered insights. Read the full report on Oracle Bull.`,
      keywords: `${slug.replace(/-/g, " ")}, crypto analysis, market insight, oracle bull`
    };
  })() : currentPath.includes("/learn/") ? (() => {
    const slug = currentPath.split("/learn/")[1]?.split("/")[0] || "";
    const readable = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    return {
      title: `${readable} – Free Crypto Education | Oracle Bull`,
      description: `${readable}. Comprehensive free guide covering everything you need to know. Written for all experience levels — beginner to advanced crypto traders.`,
      keywords: `${slug.replace(/-/g, " ")}, crypto education, learn cryptocurrency, oracle bull guide`
    };
  })() : {
    title: defaultMeta.title,
    description: defaultMeta.description,
    keywords: defaultMeta.keywords
  });

  const finalTitle = title || pageMeta.title;
  const finalDescription = description || pageMeta.description;
  const finalImage = image || defaultMeta.image;

  useEffect(() => {
    document.title = finalTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Only the basic, user-facing meta remain — title + description. All crawler
    // markup (keywords, robots, Open Graph, Twitter cards, canonical) removed.
    setMeta("description", finalDescription);

  }, [finalTitle, finalDescription, currentPath]);

  return null;
}

// Enhanced JSON-LD Structured Data Component

// StructuredData removed — no JSON-LD schema shipped. Kept as a no-op export
// so any lingering import resolves without error.
export function StructuredData() {
  return null;
}
