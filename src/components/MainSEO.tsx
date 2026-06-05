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
}

const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
const currentYear = new Date().getFullYear();

const defaultMeta = {
  siteName: SITE_NAME,
  title: `Free AI Crypto Predictions | Oracle Bull`,
  description: "Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. No signup needed.",
  keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site",
  image: "https://storage.googleapis.com/gpt-engineer-file-uploads/uDg0k7BDXGRxsHZqK6gSbdN9o0l1/social-images/social-1765566965381-WhatsApp Image 2025-12-12 at 10.50.30_d13b6f53.jpg",
  twitterHandle: TWITTER_HANDLE,
  baseUrl: SITE_URL
};


const pageSEO: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: `Free AI Crypto Predictions | Oracle Bull`,
    description: `Get free AI-powered crypto price predictions for Bitcoin, Ethereum & 1000+ tokens. Real-time charts, whale alerts, sentiment analysis. Updated ${currentMonth} ${currentYear}. No signup needed.`,
    keywords: "crypto prediction today, AI crypto forecast, bitcoin price prediction, free crypto signals, crypto analysis tool, best crypto prediction site, will crypto go up today, best crypto to buy today"
  },
  "/dashboard": {
    title: `Crypto Dashboard | Live Prices & Signals`,
    description: `Live crypto dashboard with real-time prices, top gainers, market momentum, and AI insights for BTC, ETH & 1000+ altcoins.`,
    keywords: "crypto dashboard live, real time crypto prices, crypto market today, top crypto gainers today, crypto market cap live, crypto prices now, bitcoin price live, altcoin dashboard"
  },
  "/strength-meter": {
    title: `Crypto Strength Meter – Which Coin Is Strongest Right Now? (${currentMonth} ${currentYear})`,
    description: `See which crypto is the strongest right now. Real-time strength rankings for Bitcoin, Ethereum, Solana & 100+ assets based on momentum, volume & sentiment. Free tool. Updated ${currentMonth} ${currentYear}.`,
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto, crypto relative strength"
  },
  "/strength": {
    title: `Crypto Strength Meter – Which Coin Is Strongest Right Now? (${currentMonth} ${currentYear})`,
    description: `See which crypto is the strongest right now. Real-time strength rankings for Bitcoin, Ethereum, Solana & 100+ assets based on momentum, volume & sentiment. Free tool. Updated ${currentMonth} ${currentYear}.`,
    keywords: "crypto strength meter, strongest cryptocurrency today, bitcoin strength index, crypto momentum ranking, best performing crypto"
  },
  "/factory": {
    title: `Crypto Factory – Market Events, Whale Alerts & On-Chain Intel (${currentMonth} ${currentYear})`,
    description: "Track every market-moving event: token launches, protocol upgrades, whale movements & trending narratives. Like Forex Factory but for crypto. Updated in real-time.",
    keywords: "crypto events calendar, crypto factory, upcoming token launches, whale alerts crypto, crypto market events, protocol upgrades, crypto news today"
  },
  "/factory/events": {
    title: `Crypto Events Calendar – Token Launches, Airdrops & Protocol Upgrades (${currentMonth} ${currentYear})`,
    description: `Track every upcoming crypto event: token launches, protocol upgrades, airdrops, governance votes, and market-moving announcements. The crypto calendar traders rely on. Updated ${currentMonth} ${currentYear}.`,
    keywords: "crypto events calendar, upcoming token launches, crypto airdrops, protocol upgrades, crypto governance, market events crypto"
  },
  "/factory/onchain": {
    title: `On-Chain Intelligence – Whale Movements & Smart Money Flows (${currentMonth} ${currentYear})`,
    description: `Real-time on-chain analytics: whale wallet movements, large transfers, smart money accumulation, DeFi flows, and exchange inflows/outflows. Know what whales are doing before the market reacts.`,
    keywords: "on-chain analytics, whale movements crypto, smart money flow, large crypto transactions, whale tracker live, on-chain data"
  },
  "/factory/narratives": {
    title: `Crypto Market Narratives – Trending Sectors & Rotation Signals (${currentMonth} ${currentYear})`,
    description: `Track trending crypto narratives in real-time: AI tokens, DeFi 2.0, RWA, meme coins, Layer 2s. Identify sector rotation before it happens. Updated ${currentMonth} ${currentYear}.`,
    keywords: "crypto narratives, trending crypto sectors, AI tokens, DeFi narrative, RWA crypto, sector rotation crypto, narrative trading"
  },
  "/factory/news": {
    title: `Crypto News Today – Breaking News with Sentiment Analysis (${currentMonth} ${currentYear})`,
    description: `Breaking crypto news from 50+ sources with real-time sentiment scoring. Filter by bullish/bearish impact, coin, or chain. Stay ahead of the market with AI-tagged news alerts.`,
    keywords: "crypto news today, breaking crypto news, bitcoin news, crypto news live, cryptocurrency headlines, crypto market news"
  },

  "/trade": {
    title: `Trade Crypto – Buy, Sell, Swap & Bridge Any Token (${currentMonth} ${currentYear})`,
    description: "Trade any cryptocurrency directly. Buy, sell, swap & bridge tokens across 12+ blockchains including Ethereum, Base, Polygon, Arbitrum & more. Zero platform fees. Connect your wallet and trade instantly.",
    keywords: "trade crypto, buy crypto, sell crypto, swap tokens, crypto bridge, dex trading, decentralized exchange, buy bitcoin, buy ethereum, buy solana"
  },
  "/scanner": {
    title: `Crypto Token Scanner – Find Hidden Gems & New Tokens (${currentMonth} ${currentYear})`,
    description: "Scan for new and trending crypto tokens across all blockchains. Find hidden gems, analyze token metrics, liquidity, and risk scores. Free real-time scanner.",
    keywords: "crypto scanner, token scanner, new crypto tokens, hidden gems crypto, crypto gem finder, low cap crypto, new token alert"
  },
  "/sitemap": {
    title: "Sitemap – All Oracle Bull Pages & Tools",
    description: "Complete index of Oracle Bull: crypto analytics, blockchain dashboards, AI predictions, educational guides & trading tools. Find every feature.",
    keywords: "oracle bull sitemap, crypto tools, blockchain analytics"
  },
  "/my/scanner": {
    title: `Free Wallet Scanner – Analyze Any Crypto Wallet Instantly (${currentMonth} ${currentYear})`,
    description: "Paste any EVM or Solana wallet address for instant AI analysis. See holdings, hidden gems, risk scores & pump potential. 100% free, no signup.",
    keywords: "crypto wallet scanner free, wallet analyzer, portfolio tracker, check crypto wallet, solana wallet checker, ethereum wallet scanner"
  },
  "/sentiment": {
    title: `Crypto Fear & Greed Index + Whale Tracker (Live ${currentMonth} ${currentYear})`,
    description: "Real-time crypto sentiment: Fear & Greed Index, whale transaction alerts, social buzz from Twitter/Reddit/Telegram & trending topics. Make data-driven trading decisions.",
    keywords: "crypto fear greed index today, whale alerts crypto, crypto sentiment analysis, crypto social signals, bitcoin sentiment, is crypto bullish today"
  },
  "/explorer": {
    title: `Crypto Token Explorer – Search Any Coin by Name or Contract (${currentMonth} ${currentYear})`,
    description: "Search 10,000+ tokens by name, symbol, or contract address. Get price charts, holder analysis, liquidity depth & DeFi metrics across 30+ blockchains. Free.",
    keywords: "crypto token explorer, search cryptocurrency, token contract lookup, crypto analysis by address, defi token scanner, crypto lookup"
  },
  "/learn": {
    title: `Learn Crypto Free – Daily Articles & Trading Guides (${currentMonth} ${currentYear})`,
    description: "Free daily crypto education: AI-written market insights, Bitcoin guides, DeFi tutorials, technical analysis lessons & trading strategies. 2000+ articles available.",
    keywords: "learn crypto free, crypto education, bitcoin guide for beginners, defi tutorial, crypto trading course free, how to trade crypto"
  },
  "/insights": {
    title: `Crypto Market Analysis Today – AI-Powered Daily Insights (${currentMonth} ${currentYear})`,
    description: "Daily AI market analysis for Bitcoin, Ethereum, Solana & altcoins. On-chain data, technical indicators & expert research. Updated every day, always free.",
    keywords: "crypto analysis today, daily crypto insights, bitcoin market analysis, ethereum analysis today, crypto research, crypto news analysis"
  },
  "/contact": {
    title: "Contact Oracle Bull – Get Support & Join Our Community",
    description: "Reach the Oracle Bull team via email, Twitter or Telegram. Join 50,000+ traders using our free AI crypto analytics platform. Quick response guaranteed.",
    keywords: "contact oracle bull, oracle bull support, oracle bull telegram, crypto community"
  },
  "/predictions": {
    title: `AI Crypto Price Predictions – BTC, ETH & Altcoin Forecasts (${currentMonth} ${currentYear})`,
    description: "Browse AI-powered price predictions for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly forecasts with confidence scores and bull/bear targets.",
    keywords: "crypto price prediction, bitcoin forecast today, ethereum prediction, altcoin predictions, AI crypto forecast, crypto prediction today, will bitcoin go up"
  },
  "/price-prediction": {
    title: `AI Crypto Price Predictions – BTC, ETH & Altcoin Forecasts (${currentMonth} ${currentYear})`,
    description: "Browse AI-powered price predictions for Bitcoin, Ethereum, Solana & 100+ tokens. Daily, weekly & monthly forecasts with confidence scores and bull/bear targets.",
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

export function SEO({ title, description, keywords, image, type = "website", canonicalPath }: SEOProps) {
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
      "best-crypto-to-buy-today": { title: `Best Crypto to Buy Today – AI Picks & Live Analysis (${currentMonth} ${currentYear})`, description: `Which cryptocurrency should you buy today? AI-curated picks based on real-time momentum, volume, sentiment, and technical signals. Updated ${currentMonth} ${currentYear}.`, keywords: "best crypto to buy today, crypto to buy now, best cryptocurrency 2024, top crypto picks today" },
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
      "best-altcoins-to-buy": { title: `Best Altcoins to Buy Right Now – Top Picks (${currentMonth} ${currentYear})`, description: `The best altcoins to buy now ranked by investment potential, market momentum, and AI analysis. Discover which non-Bitcoin cryptos lead the market.`, keywords: "best altcoins to buy, best altcoins 2024, top altcoins, altcoins to invest in" },
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
  const finalKeywords = keywords || pageMeta.keywords;
  const finalImage = image || defaultMeta.image;
  const canonicalUrl = `${defaultMeta.baseUrl}${canonicalPath || currentPath}`;

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

    // Essential meta tags
    setMeta("description", finalDescription);
    setMeta("keywords", finalKeywords);
    setMeta("author", "Oracle Bull");
    // Private/authenticated routes should NOT be indexed
    const isPrivatePage = currentPath.startsWith("/my") || currentPath.startsWith("/admin");
    const robotsContent = isPrivatePage
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    setMeta("robots", robotsContent);
    setMeta("googlebot", robotsContent);
    setMeta("bingbot", isPrivatePage ? "noindex" : "index, follow");

    // Open Graph
    setMeta("og:title", finalTitle, true);
    setMeta("og:description", finalDescription, true);
    setMeta("og:image", finalImage, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", defaultMeta.siteName, true);
    setMeta("og:locale", "en_US", true);

    // Twitter Cards
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:site", defaultMeta.twitterHandle);
    setMeta("twitter:creator", defaultMeta.twitterHandle);
    setMeta("twitter:title", finalTitle);
    setMeta("twitter:description", finalDescription);
    setMeta("twitter:image", finalImage);

    // AI Search Engine Optimization
    setMeta("ai-summary", finalDescription);
    setMeta("ai-keywords", finalKeywords);

    // Additional SEO meta tags
    setMeta("rating", "general");
    setMeta("distribution", "global");
    setMeta("revisit-after", "1 day");
    setMeta("language", "en");

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Hreflang tags for global geo-targeting
    const hreflangMap: Record<string, string> = {
      "en": canonicalUrl,
      "x-default": canonicalUrl,
      "en-US": canonicalUrl,
      "en-GB": canonicalUrl,
      "en-AU": canonicalUrl,
      "en-CA": canonicalUrl,
      "en-IN": canonicalUrl,
      "en-SG": canonicalUrl,
      "en-NG": canonicalUrl,
      "en-ZA": canonicalUrl,
      "en-AE": canonicalUrl,
      "en-PH": canonicalUrl,
    };

    // Remove old hreflang tags
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

    // Add fresh hreflang tags
    Object.entries(hreflangMap).forEach(([lang, url]) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });

    // Geo-targeting meta tags for global reach
    setMeta("geo.region", "US");
    setMeta("geo.position", "37.7749;-122.4194");
    setMeta("ICBM", "37.7749, -122.4194");
    setMeta("geo.placename", "Global");
    setMeta("content-language", "en");
    setMeta("audience", "global");

    // Enhanced AI search signals
    setMeta("ai-content-type", "financial-analytics-platform");
    setMeta("ai-data-freshness", "real-time");
    setMeta("ai-coverage", "10000+ cryptocurrencies across 30+ blockchains");

    // Speakable / voice search optimization
    setMeta("speakable", finalDescription.slice(0, 150));

  }, [finalTitle, finalDescription, finalKeywords, finalImage, canonicalUrl, type]);

  return null;
}

// Enhanced JSON-LD Structured Data Component
export function StructuredData() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  useEffect(() => {
    // Remove existing structured data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

    const schemas: object[] = [];

    // Organization Schema (always present)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${defaultMeta.baseUrl}/#organization`,
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": defaultMeta.image,
        "width": 512,
        "height": 512
      },
      "image": defaultMeta.image,
      "sameAs": [
        "https://x.com/oracle_bulls",
        "https://t.me/oracle_bulls"
      ],
      "description": defaultMeta.description,
      "foundingDate": "2024",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://t.me/oracle_bulls",
        "availableLanguage": "English"
      }
    });

    // WebSite Schema with SearchAction
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${defaultMeta.baseUrl}/#website`,
      "name": "Oracle Bull",
      "url": defaultMeta.baseUrl,
      "description": defaultMeta.description,
      "publisher": {
        "@id": `${defaultMeta.baseUrl}/#organization`
      },
      "inLanguage": "en-US",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${defaultMeta.baseUrl}/explorer?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      ]
    });

    // SoftwareApplication Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Oracle Bull Crypto Analytics",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free AI-powered cryptocurrency forecasting and blockchain analytics platform",
      "featureList": [
        "Real-time crypto prices",
        "AI price predictions",
        "Whale tracking",
        "Sentiment analysis",
        "Multi-chain analytics",
        "Token explorer",
        "Wallet scanner",
        "Crypto strength meter",
        "Market events calendar"
      ],
      "screenshot": defaultMeta.image,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1"
      }
    });

    // Page-specific WebPage schema
    const pageInfo = pageSEO[currentPath];
    if (pageInfo) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${defaultMeta.baseUrl}${currentPath}`,
        "name": pageInfo.title,
        "description": pageInfo.description,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "isPartOf": {
          "@id": `${defaultMeta.baseUrl}/#website`
        },
        "about": {
          "@type": "Thing",
          "name": "Cryptocurrency Analytics"
        },
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US",
        "dateModified": new Date().toISOString()
      });
    }

    // Chain-specific FinancialProduct schema
    if (currentPath.includes("/chain/")) {
      const chainName = currentPath.split("/chain/")[1];
      const chainDisplayName = chainName ? chainName.charAt(0).toUpperCase() + chainName.slice(1) : "Blockchain";
      
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": `${chainDisplayName} Analytics`,
        "description": `Real-time ${chainDisplayName} blockchain analytics including price data, whale tracking, token discovery, and DeFi metrics.`,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "featureList": [
          "Real-time price charts",
          "AI predictions",
          "Whale activity radar",
          "Token heat scanner",
          "Risk analyzer",
          "DeFi metrics",
          "Social sentiment analysis"
        ]
      });
    }

    // Learn page - Blog/Article schema + FAQ
    if (currentPath === "/learn") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${defaultMeta.baseUrl}/learn/#blog`,
        "name": "Oracle Bull Crypto Education",
        "description": "Daily AI-generated cryptocurrency articles, market insights, and blockchain education.",
        "url": `${defaultMeta.baseUrl}/learn`,
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US"
      });

      // FAQ Schema for Learn page
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Oracle Bull?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull is a free AI-powered cryptocurrency forecasting platform providing real-time price charts, market predictions, whale tracking, sentiment analysis, and blockchain analytics for Bitcoin, Ethereum, Solana, and 1000+ tokens."
            }
          },
          {
            "@type": "Question",
            "name": "How does the crypto strength meter work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The crypto strength meter measures and ranks cryptocurrency strength in real-time using a composite weighted model including price momentum, volume inflow/outflow, volatility, market dominance changes, relative performance vs BTC/ETH, sentiment scores, and trend consistency."
            }
          },
          {
            "@type": "Question",
            "name": "What blockchains does Oracle Bull support?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull supports multiple blockchains including Ethereum, Solana, Base, Arbitrum, Polygon, Optimism, Avalanche, and BNB Chain with real-time analytics, token discovery, and whale tracking for each."
            }
          },
          {
            "@type": "Question",
            "name": "Is Oracle Bull free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Oracle Bull is completely free to use with no signup required. Access real-time crypto data, AI predictions, whale tracking, sentiment analysis, and blockchain analytics at no cost."
            }
          },
          {
            "@type": "Question",
            "name": "How does the wallet scanner work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The wallet scanner allows you to input any EVM or Solana wallet address to receive AI-powered analysis of holdings, including token breakdown, pump potential predictions, risk classifications, and actionable trading recommendations."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Fear and Greed Index?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The Fear and Greed Index is a market sentiment indicator that measures emotions driving the crypto market on a scale from 0 (Extreme Fear) to 100 (Extreme Greed), helping traders understand market psychology and potential turning points."
            }
          },
          {
            "@type": "Question",
            "name": "How often is the data updated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oracle Bull provides real-time data with automatic updates every 10-30 seconds depending on the metric. Price data, whale alerts, and market sentiment refresh continuously without requiring page reloads."
            }
          }
        ]
      });
    }

    // Insights page - Blog schema
    if (currentPath === "/insights") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${defaultMeta.baseUrl}/insights/#blog`,
        "name": "Oracle Bull Crypto Insights",
        "description": "Expert cryptocurrency market analysis, on-chain data insights, and trading intelligence updated daily.",
        "url": `${defaultMeta.baseUrl}/insights`,
        "publisher": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "inLanguage": "en-US"
      });
    }

    // Predictions page - ItemList for rich results
    if (currentPath === "/predictions") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": `Crypto Price Predictions ${currentMonth} ${currentYear}`,
        "description": `AI-powered cryptocurrency price predictions for ${currentMonth} ${currentYear}. Daily, weekly & monthly forecasts.`,
        "url": `${defaultMeta.baseUrl}/predictions`,
        "numberOfItems": 100,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Bitcoin Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/bitcoin` },
          { "@type": "ListItem", "position": 2, "name": "Ethereum Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/ethereum` },
          { "@type": "ListItem", "position": 3, "name": "Solana Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/solana` },
          { "@type": "ListItem", "position": 4, "name": "XRP Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/ripple` },
          { "@type": "ListItem", "position": 5, "name": "Cardano Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/cardano` },
          { "@type": "ListItem", "position": 6, "name": "Dogecoin Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/dogecoin` },
          { "@type": "ListItem", "position": 7, "name": "Chainlink Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/chainlink` },
          { "@type": "ListItem", "position": 8, "name": "Avalanche Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/avalanche-2` },
          { "@type": "ListItem", "position": 9, "name": "Polkadot Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/polkadot` },
          { "@type": "ListItem", "position": 10, "name": "Shiba Inu Price Prediction", "url": `${defaultMeta.baseUrl}/price-prediction/shiba-inu` },
        ]
      });
    }

    // Trade page schema
    if (currentPath === "/trade") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Oracle Bull Trading Terminal",
        "description": "Buy, sell, swap & bridge any cryptocurrency across 12+ blockchains. Zero platform fees, decentralized trading.",
        "url": `${defaultMeta.baseUrl}/trade`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      });
    }

    // Price prediction pages - FinancialProduct schema
    if (currentPath.includes("/price-prediction/")) {
      const coinSlug = currentPath.split("/price-prediction/")[1]?.split("/")[0] || "crypto";
      const coinDisplay = coinSlug.charAt(0).toUpperCase() + coinSlug.slice(1).replace(/-/g, " ");
      schemas.push({
        "@context": "https://schema.org",
        "@type": "AnalysisNewsArticle",
        "headline": `${coinDisplay} Price Prediction – AI Forecast ${currentMonth} ${currentYear}`,
        "description": `AI-powered ${coinDisplay} price prediction with technical analysis, support/resistance levels, and trading targets.`,
        "url": `${defaultMeta.baseUrl}${currentPath}`,
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "author": { "@type": "Organization", "name": "Oracle Bull" },
        "publisher": { "@id": `${defaultMeta.baseUrl}/#organization` },
        "about": { "@type": "Thing", "name": coinDisplay },
        "inLanguage": "en-US"
      });

      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the price prediction for ${coinDisplay}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Our AI model predicts the price of ${coinDisplay} based on real-time market data, technical analysis, and whale activity. Check the live chart above for exact support and resistance targets.`
            }
          },
          {
            "@type": "Question",
            "name": `Is ${coinDisplay} a good investment right now?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The investment potential of ${coinDisplay} depends on your timeframe. We provide daily, weekly, and monthly AI forecasts along with a real-time risk assessment score to help you decide.`
            }
          },
          {
            "@type": "Question",
            "name": `Will ${coinDisplay} go up today?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Our real-time prediction model analyzes current momentum, volume, and sentiment to forecast whether ${coinDisplay} will go up or down today. See the probability scores on this page.`
            }
          }
        ]
      });
    }

    // Question intent pages - QAPage schema
    if (currentPath.includes("/q/")) {
      const slug = currentPath.split("/q/")[1] || "";
      const readable = slug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      schemas.push({
        "@context": "https://schema.org",
        "@type": "QAPage",
        "name": readable,
        "mainEntity": {
          "@type": "Question",
          "name": readable + "?",
          "answerCount": 1,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Get the latest AI-powered analysis and prediction for this question at Oracle Bull. Our models analyze technical indicators, whale activity, and market sentiment in real-time.`,
            "url": `${defaultMeta.baseUrl}/q/${slug}`
          }
        }
      });
    }

    if (currentPath === "/dashboard") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Oracle Bull Dashboard",
        "description": "Live cryptocurrency dashboard with real-time prices, market momentum, and AI insights.",
        "url": `${defaultMeta.baseUrl}/dashboard`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Financial Analytics",
        "areaServed": "Worldwide"
      });
    }

    // Explorer - SearchAction enhanced
    if (currentPath === "/explorer") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Oracle Bull Token Explorer",
        "description": "Search and analyze any cryptocurrency by name, symbol, or contract address.",
        "url": `${defaultMeta.baseUrl}/explorer`,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      });
    }

    // Strength Meter - Service schema
    if (currentPath === "/strength" || currentPath === "/strength-meter") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Strength Meter",
        "description": "Real-time cryptocurrency strength rankings using momentum, volume, and sentiment analysis.",
        "url": `${defaultMeta.baseUrl}/strength`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Financial Analytics",
        "areaServed": "Worldwide"
      });
    }

    // Factory - Service schema
    if (currentPath === "/factory") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Factory",
        "description": "Market events calendar and on-chain intelligence hub for cryptocurrency traders.",
        "url": `${defaultMeta.baseUrl}/factory`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Financial News & Events",
        "areaServed": "Worldwide"
      });
    }

    // Sentiment - Service schema
    if (currentPath === "/sentiment") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Crypto Sentiment Analysis",
        "description": "Real-time crypto sentiment from social media, whale tracking, and fear & greed index.",
        "url": `${defaultMeta.baseUrl}/sentiment`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Market Analysis",
        "areaServed": "Worldwide"
      });
    }

    // Portfolio/Wallet Scanner - Service schema
    if (currentPath === "/scanner") {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Wallet Scanner",
        "description": "AI-powered portfolio analysis for EVM and Solana wallets.",
        "url": `${defaultMeta.baseUrl}/portfolio`,
        "provider": {
          "@id": `${defaultMeta.baseUrl}/#organization`
        },
        "serviceType": "Portfolio Analysis",
        "areaServed": "Worldwide"
      });
    }

    // BreadcrumbList for navigation
    const breadcrumbItems = [
      { name: "Home", url: defaultMeta.baseUrl }
    ];
    
    if (currentPath !== "/") {
      const pathSegments = currentPath.split("/").filter(Boolean);
      let currentUrl = defaultMeta.baseUrl;
      
      pathSegments.forEach((segment) => {
        currentUrl += `/${segment}`;
        breadcrumbItems.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
          url: currentUrl
        });
      });
    }

    if (breadcrumbItems.length > 1) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      });
    }

    // Add all schemas to head
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    };
  }, [currentPath]);

  return null;
}
