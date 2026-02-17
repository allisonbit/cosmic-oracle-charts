import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

// All top crypto IDs for prediction links
const topCryptos = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'ripple', name: 'XRP', symbol: 'XRP' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'matic-network', name: 'Polygon', symbol: 'MATIC' },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR' },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
  { id: 'optimism', name: 'Optimism', symbol: 'OP' },
  { id: 'aptos', name: 'Aptos', symbol: 'APT' },
  { id: 'sui', name: 'Sui', symbol: 'SUI' },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE' },
  { id: 'floki', name: 'Floki', symbol: 'FLOKI' },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK' },
  { id: 'toncoin', name: 'Toncoin', symbol: 'TON' },
  { id: 'tron', name: 'TRON', symbol: 'TRX' },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
  { id: 'monero', name: 'Monero', symbol: 'XMR' },
  { id: 'okb', name: 'OKB', symbol: 'OKB' },
  { id: 'hedera', name: 'Hedera', symbol: 'HBAR' },
  { id: 'filecoin', name: 'Filecoin', symbol: 'FIL' },
  { id: 'vechain', name: 'VeChain', symbol: 'VET' },
  { id: 'internet-computer', name: 'Internet Computer', symbol: 'ICP' },
  { id: 'render-token', name: 'Render', symbol: 'RNDR' },
  { id: 'fetch-ai', name: 'Fetch.ai', symbol: 'FET' },
  { id: 'injective-protocol', name: 'Injective', symbol: 'INJ' },
  { id: 'kaspa', name: 'Kaspa', symbol: 'KAS' },
  { id: 'theta-token', name: 'Theta', symbol: 'THETA' },
];

const chains = [
  { id: 'ethereum', name: 'Ethereum', desc: 'Smart contracts, DeFi TVL, whale activity, ERC-20 token discovery, gas tracker' },
  { id: 'solana', name: 'Solana', desc: 'High-speed transactions, TPS metrics, validator health, SPL tokens, Raydium DEX' },
  { id: 'base', name: 'Base', desc: 'Coinbase L2, low gas fees, native token ecosystem, bridge analytics' },
  { id: 'arbitrum', name: 'Arbitrum', desc: 'Ethereum L2 rollup, DeFi protocols, ARB governance, sequencer data' },
  { id: 'polygon', name: 'Polygon', desc: 'EVM sidechain, MATIC staking, zkEVM, gaming tokens, low-cost transactions' },
  { id: 'optimism', name: 'Optimism', desc: 'Optimistic rollup, OP Stack, retroactive public goods, L2 performance' },
  { id: 'avalanche', name: 'Avalanche', desc: 'Subnet architecture, sub-second finality, AVAX staking, C-Chain analytics' },
  { id: 'bnb', name: 'BNB Chain', desc: 'Binance ecosystem, BSC tokens, PancakeSwap, high throughput, low fees' },
];

const marketQuestions = [
  { slug: 'best-crypto-to-buy-today', label: 'Best Crypto to Buy Today', desc: 'AI-curated daily picks based on momentum, volume, and sentiment signals' },
  { slug: 'top-crypto-gainers-today', label: 'Top Crypto Gainers Today', desc: 'Biggest percentage winners in the last 24 hours with volume analysis' },
  { slug: 'crypto-market-prediction-today', label: 'Crypto Market Prediction Today', desc: 'Overall market outlook with BTC dominance and altcoin rotation analysis' },
  { slug: 'which-crypto-will-go-up-today', label: 'Which Crypto Will Go Up Today?', desc: 'Technical and sentiment-based predictions for today\'s movers' },
  { slug: 'crypto-losers-today', label: 'Crypto Losers Today', desc: 'Biggest decliners and potential bounce-back opportunities' },
  { slug: 'is-crypto-going-up-today', label: 'Is Crypto Going Up Today?', desc: 'Market-wide bullish or bearish analysis for the current session' },
  { slug: 'best-crypto-to-buy-this-week', label: 'Best Crypto to Buy This Week', desc: 'Weekly picks with swing trading entry and exit zones' },
  { slug: 'crypto-prediction-this-week', label: 'Crypto Prediction This Week', desc: 'Weekly market forecast with support and resistance levels' },
  { slug: 'crypto-to-watch-this-week', label: 'Crypto to Watch This Week', desc: 'Tokens with upcoming catalysts, events, or technical breakouts' },
  { slug: 'top-crypto-gainers-this-week', label: 'Top Crypto Gainers This Week', desc: 'Weekly performance leaders across all market cap tiers' },
  { slug: 'next-crypto-to-explode', label: 'Next Crypto to Explode', desc: 'High-potential altcoins with strong fundamentals and growing communities' },
  { slug: 'safest-crypto-to-invest', label: 'Safest Crypto to Invest', desc: 'Low-risk blue-chip cryptocurrencies for conservative portfolios' },
  { slug: 'cheap-crypto-to-buy-now', label: 'Cheap Crypto to Buy Now', desc: 'Affordable tokens under $1 with strong growth potential' },
  { slug: 'undervalued-crypto-to-buy', label: 'Undervalued Crypto to Buy', desc: 'Fundamentally strong tokens trading below fair value estimates' },
  { slug: 'crypto-with-most-potential', label: 'Crypto with Most Potential', desc: 'Highest upside tokens based on technology, team, and market positioning' },
  { slug: 'best-altcoins-to-buy', label: 'Best Altcoins to Buy', desc: 'Top non-Bitcoin cryptocurrencies ranked by investment potential' },
  { slug: 'top-meme-coins', label: 'Top Meme Coins', desc: 'Trending meme tokens with community strength and viral potential' },
  { slug: 'best-defi-tokens', label: 'Best DeFi Tokens', desc: 'Leading decentralized finance protocols by TVL and revenue' },
  { slug: 'top-ai-crypto-tokens', label: 'Top AI Crypto Tokens', desc: 'Artificial intelligence blockchain projects leading the AI narrative' },
];

const learnArticles = [
  { slug: 'what-is-crypto-market-sentiment', title: 'What Is Crypto Market Sentiment?', desc: 'Complete guide to understanding fear & greed index, social signals, and market psychology in cryptocurrency trading' },
  { slug: 'how-ai-is-used-in-crypto-market-analysis', title: 'How AI Is Used in Crypto Market Analysis', desc: 'Machine learning models, neural networks, and natural language processing applied to cryptocurrency forecasting' },
  { slug: 'bitcoin-market-cycles-explained', title: 'Bitcoin Market Cycles Explained', desc: 'Understanding Bitcoin halving cycles, accumulation phases, bull runs, and bear markets with historical data' },
  { slug: 'risk-management-in-volatile-crypto-markets', title: 'Risk Management in Volatile Crypto Markets', desc: 'Position sizing, stop-loss strategies, portfolio diversification, and risk-reward ratios for crypto traders' },
  { slug: 'how-to-analyze-altcoins-using-market-data', title: 'How to Analyze Altcoins Using Market Data', desc: 'Fundamental and technical analysis framework for evaluating altcoin investment opportunities' },
  { slug: 'technical-analysis-vs-sentiment-analysis', title: 'Technical Analysis vs Sentiment Analysis', desc: 'Comparing chart patterns and indicators with social media and news-based trading signals' },
  { slug: 'on-chain-data-explained-for-beginners', title: 'On-Chain Data Explained for Beginners', desc: 'Understanding blockchain metrics like active addresses, transaction volume, and whale movements' },
  { slug: 'how-market-psychology-affects-crypto-prices', title: 'How Market Psychology Affects Crypto Prices', desc: 'FOMO, FUD, herd behavior, and cognitive biases that drive cryptocurrency market movements' },
  { slug: 'how-whales-influence-market-trends', title: 'How Whales Influence Market Trends', desc: 'Tracking large holders, understanding accumulation and distribution patterns, and whale alert systems' },
  { slug: 'understanding-liquidity-in-crypto-markets', title: 'Understanding Liquidity in Crypto Markets', desc: 'Order book depth, slippage, market making, and how liquidity affects price stability' },
  { slug: 'what-is-the-forex-market-and-how-does-it-work', title: 'What Is the Forex Market and How Does It Work?', desc: 'Introduction to foreign exchange trading, currency pairs, and global market structure' },
  { slug: 'forex-market-structure-explained', title: 'Forex Market Structure Explained', desc: 'Interbank market, retail brokers, market makers, and ECN trading explained' },
  { slug: 'currency-sentiment-analysis-explained', title: 'Currency Sentiment Analysis Explained', desc: 'How to measure and interpret currency market sentiment using COT reports and positioning data' },
  { slug: 'forex-vs-crypto-key-market-differences', title: 'Forex vs Crypto: Key Market Differences', desc: 'Comparing trading hours, volatility, regulation, leverage, and market participants' },
  { slug: 'macroeconomic-factors-that-move-forex-markets', title: 'Macroeconomic Factors That Move Forex Markets', desc: 'Interest rates, GDP, inflation, employment data, and central bank policies' },
  { slug: 'how-ai-forecasting-models-work-in-finance', title: 'How AI Forecasting Models Work in Finance', desc: 'LSTM networks, transformer models, ensemble methods, and backtesting for financial predictions' },
  { slug: 'limitations-of-ai-market-predictions', title: 'Limitations of AI Market Predictions', desc: 'Overfitting, black swan events, data quality issues, and why AI predictions are probabilities not certainties' },
  { slug: 'indicators-vs-ai-models-whats-the-difference', title: 'Indicators vs AI Models: What\'s the Difference?', desc: 'Traditional RSI, MACD, and moving averages compared to machine learning approaches' },
  { slug: 'data-sources-used-in-market-intelligence-platforms', title: 'Data Sources Used in Market Intelligence Platforms', desc: 'Exchange APIs, social media feeds, on-chain data providers, and news aggregation for market analysis' },
  { slug: 'how-to-read-market-analytics-dashboards', title: 'How to Read Market Analytics Dashboards', desc: 'Interpreting charts, heat maps, correlation matrices, and real-time data feeds for trading decisions' },
];

const questionIntentCoins = ['bitcoin', 'ethereum', 'solana', 'ripple', 'cardano', 'dogecoin', 'shiba-inu', 'pepe', 'chainlink', 'polkadot'];
const questionPatterns = [
  { pattern: 'what-will-{coin}-price-be-today', label: 'What will {name} price be today?' },
  { pattern: 'will-{coin}-go-up-today', label: 'Will {name} go up today?' },
  { pattern: '{coin}-price-prediction-today', label: '{name} price prediction today' },
  { pattern: 'is-{coin}-bullish-today', label: 'Is {name} bullish today?' },
  { pattern: 'what-will-{coin}-price-be-this-week', label: 'What will {name} price be this week?' },
  { pattern: 'will-{coin}-go-up-this-week', label: 'Will {name} go up this week?' },
  { pattern: '{coin}-price-prediction-this-week', label: '{name} price prediction this week' },
  { pattern: '{coin}-weekly-forecast', label: '{name} weekly forecast' },
  { pattern: 'what-will-{coin}-price-be-this-month', label: 'What will {name} price be this month?' },
  { pattern: 'is-{coin}-a-good-investment-this-month', label: 'Is {name} a good investment this month?' },
  { pattern: '{coin}-price-prediction-this-month', label: '{name} price prediction this month' },
  { pattern: '{coin}-monthly-forecast', label: '{name} monthly forecast' },
];

const coinNames: Record<string, string> = {
  bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana', ripple: 'XRP',
  cardano: 'Cardano', dogecoin: 'Dogecoin', 'shiba-inu': 'Shiba Inu',
  pepe: 'Pepe', chainlink: 'Chainlink', polkadot: 'Polkadot',
};

const SectionTitle = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-xl font-bold text-foreground mt-10 mb-4 border-b border-border pb-2">{children}</h2>
);

export default function Sitemap() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Complete Sitemap | All Pages & Content | Oracle Bull"
        description="Full sitemap of Oracle Bull with every page, prediction, market analysis, blockchain dashboard, educational article, and tool. Navigate the entire platform."
        keywords="oracle bull sitemap, crypto sitemap, all pages, complete navigation"
      />
      <header>
        <Navbar />
      </header>

      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Oracle Bull — Complete Sitemap</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Every page, tool, prediction, market analysis, blockchain dashboard, and educational article on Oracle Bull.
          This is the full index of our AI-powered cryptocurrency analytics platform — nothing is left out.
        </p>

        {/* ── Core Pages ── */}
        <SectionTitle id="core">Core Pages</SectionTitle>
        <ul className="grid md:grid-cols-2 gap-2">
          {[
            { path: '/', label: 'Home', desc: 'AI-powered crypto forecasts, real-time market overview, trending coins, and quick access to all tools' },
            { path: '/dashboard', label: 'Dashboard', desc: 'Live market data, top performers, volume leaders, AI insights, Fear & Greed Index, and market momentum' },
            { path: '/predictions', label: 'Prediction Hub', desc: 'Browse all AI price predictions for 1000+ cryptocurrencies with daily, weekly, and monthly forecasts' },
            { path: '/strength', label: 'Strength Meter', desc: 'Real-time asset strength rankings using momentum, volume, sentiment, and trend analysis' },
            { path: '/factory', label: 'Crypto Factory', desc: 'Market events calendar, on-chain intelligence, narratives, and breaking crypto news' },
            { path: '/portfolio', label: 'Wallet Scanner', desc: 'AI-powered portfolio analysis for any EVM or Solana wallet address' },
            { path: '/sentiment', label: 'Sentiment Analysis', desc: 'Social sentiment from Twitter, Reddit, Telegram — whale tracking and market signals' },
            { path: '/explorer', label: 'Token Explorer', desc: 'Search any cryptocurrency by name, symbol, or contract address across all blockchains' },
            { path: '/learn', label: 'Learn Crypto', desc: 'Free cryptocurrency education with daily AI-generated articles and in-depth guides' },
            { path: '/insights', label: 'Market Insights', desc: 'Daily AI-generated market analysis, on-chain data insights, and trading research' },
            { path: '/contact', label: 'Contact & Community', desc: 'Connect with Oracle Bull community on Twitter and Telegram, Oracle token information' },
            { path: '/about', label: 'About Oracle Bull', desc: 'Our mission, team, and the technology behind our AI-powered analytics platform' },
            { path: '/sitemap', label: 'Sitemap', desc: 'This page — complete index of all Oracle Bull content' },
          ].map(p => (
            <li key={p.path} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={p.path} className="block">
                <span className="font-medium text-primary hover:underline">{p.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Factory Sub-Pages ── */}
        <SectionTitle id="factory">Crypto Factory Sub-Pages</SectionTitle>
        <ul className="grid md:grid-cols-2 gap-2">
          {[
            { path: '/factory/events', label: 'Factory Events', desc: 'Token launches, protocol upgrades, airdrops, and market-moving crypto events calendar' },
            { path: '/factory/onchain', label: 'On-Chain Intelligence', desc: 'Whale movements, smart money flows, large transactions, and on-chain analytics' },
            { path: '/factory/narratives', label: 'Market Narratives', desc: 'Trending crypto narratives — AI, DeFi, RWA, meme coins, L2s, and sector rotation' },
            { path: '/factory/news', label: 'Crypto News', desc: 'Breaking cryptocurrency news from 50+ sources with sentiment analysis' },
          ].map(p => (
            <li key={p.path} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={p.path} className="block">
                <span className="font-medium text-primary hover:underline">{p.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Legal Pages ── */}
        <SectionTitle id="legal">Legal & Trust Pages</SectionTitle>
        <ul className="grid md:grid-cols-2 gap-2">
          {[
            { path: '/privacy-policy', label: 'Privacy Policy', desc: 'How Oracle Bull collects, uses, and protects your data' },
            { path: '/terms', label: 'Terms of Service', desc: 'Terms and conditions for using Oracle Bull platform' },
            { path: '/risk-disclaimer', label: 'Risk Disclaimer', desc: 'Cryptocurrency investment risks and disclaimer notice' },
          ].map(p => (
            <li key={p.path} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={p.path} className="block">
                <span className="font-medium text-primary hover:underline">{p.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Blockchain Analytics ── */}
        <SectionTitle id="chains">Blockchain Analytics — 8 Networks</SectionTitle>
        <p className="text-muted-foreground mb-4">Deep-dive analytics for every supported blockchain. Each page includes real-time metrics (TPS, gas fees, TVL), AI price predictions, whale activity radar, token heat scanner, risk analyzer, and ecosystem token discovery.</p>
        <ul className="grid md:grid-cols-2 gap-2">
          {chains.map(c => (
            <li key={c.id} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={`/chain/${c.id}`} className="block">
                <span className="font-medium text-primary hover:underline">{c.name} Analytics</span>
                <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Price Predictions ── */}
        <SectionTitle id="predictions">AI Price Predictions — {topCryptos.length} Cryptocurrencies × 3 Timeframes</SectionTitle>
        <p className="text-muted-foreground mb-4">Each cryptocurrency has dedicated daily, weekly, and monthly prediction pages with AI-generated forecasts, entry zones, stop-loss levels, take-profit targets, bull/bear scenarios, technical indicators (RSI, MACD, moving averages), and confidence scores.</p>
        <div className="space-y-4">
          {topCryptos.map(coin => (
            <div key={coin.id} className="p-3 rounded-lg border border-border">
              <h3 className="font-medium text-foreground mb-2">{coin.name} ({coin.symbol}) Predictions</h3>
              <div className="flex flex-wrap gap-2">
                <Link to={`/price-prediction/${coin.id}`} className="text-sm text-primary hover:underline">Overview</Link>
                <span className="text-muted-foreground">·</span>
                <Link to={`/price-prediction/${coin.id}/daily`} className="text-sm text-primary hover:underline">Daily Forecast</Link>
                <span className="text-muted-foreground">·</span>
                <Link to={`/price-prediction/${coin.id}/weekly`} className="text-sm text-primary hover:underline">Weekly Forecast</Link>
                <span className="text-muted-foreground">·</span>
                <Link to={`/price-prediction/${coin.id}/monthly`} className="text-sm text-primary hover:underline">Monthly Forecast</Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── Coin Market Pages ── */}
        <SectionTitle id="markets">Coin Market Landing Pages — {topCryptos.length} Assets</SectionTitle>
        <p className="text-muted-foreground mb-4">Dedicated market pages for each cryptocurrency with live price data, investor action summaries (Buy/Hold/Wait signals), risk levels, contextual news, related assets, and links to daily/weekly/monthly predictions.</p>
        <ul className="grid md:grid-cols-3 gap-2">
          {topCryptos.map(coin => (
            <li key={coin.id}>
              <Link to={`/markets/${coin.id}`} className="block p-2 rounded border border-border hover:border-primary/30 transition-colors">
                <span className="text-sm font-medium text-primary hover:underline">{coin.name} ({coin.symbol})</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Market Analysis Questions ── */}
        <SectionTitle id="market-questions">Market Analysis & Investment Questions — {marketQuestions.length} Pages</SectionTitle>
        <p className="text-muted-foreground mb-4">High-intent investment analysis pages targeting specific market questions. Each page combines live technical data with AI analysis, semantic HTML tables, FAQ structured data, and internal links to prediction pages.</p>
        <ul className="grid md:grid-cols-2 gap-2">
          {marketQuestions.map(q => (
            <li key={q.slug} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={`/market/${q.slug}`} className="block">
                <span className="font-medium text-primary hover:underline">{q.label}</span>
                <p className="text-sm text-muted-foreground mt-1">{q.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Question Intent Pages ── */}
        <SectionTitle id="questions">Question-Intent SEO Pages — {questionIntentCoins.length * questionPatterns.length} Pages</SectionTitle>
        <p className="text-muted-foreground mb-4">Direct-answer pages for specific cryptocurrency questions people search on Google. Each page provides AI-generated answers with technical analysis, FAQ schema for rich snippets, and links to full prediction pages.</p>
        {questionIntentCoins.map(coinId => {
          const name = coinNames[coinId] || coinId;
          return (
            <div key={coinId} className="mb-4">
              <h3 className="font-medium text-foreground mb-2">{name} Questions</h3>
              <ul className="grid md:grid-cols-2 gap-1">
                {questionPatterns.map(q => {
                  const slug = q.pattern.replace('{coin}', coinId);
                  const label = q.label.replace('{name}', name);
                  return (
                    <li key={slug}>
                      <Link to={`/q/${slug}`} className="text-sm text-primary hover:underline block py-1">{label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* ── Educational Articles ── */}
        <SectionTitle id="learn">Educational Articles — {learnArticles.length} In-Depth Guides</SectionTitle>
        <p className="text-muted-foreground mb-4">Comprehensive educational content covering cryptocurrency fundamentals, forex market intelligence, AI forecasting methods, and trading strategies. Each article is 1,200–2,000 words with FAQ schema and internal links to platform tools.</p>
        <ul className="space-y-2">
          {learnArticles.map(a => (
            <li key={a.slug} className="p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Link to={`/learn/${a.slug}`} className="block">
                <span className="font-medium text-primary hover:underline">{a.title}</span>
                <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Platform Features Description ── */}
        <SectionTitle id="features">Platform Features & Tools</SectionTitle>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <h3 className="text-foreground font-semibold text-base">AI Price Predictions</h3>
          <p>Oracle Bull uses machine learning models including LSTM neural networks, gradient boosting, and ensemble methods to generate daily, weekly, and monthly cryptocurrency price forecasts. Each prediction includes bull and bear scenarios, entry zones, stop-loss levels, take-profit targets, confidence scores, and technical indicators like RSI, MACD, Bollinger Bands, and moving average crossovers.</p>

          <h3 className="text-foreground font-semibold text-base">Real-Time Dashboard</h3>
          <p>The live dashboard tracks 1,000+ cryptocurrencies with real-time price updates, 24h volume, market cap changes, Fear & Greed Index, market dominance charts, top gainers and losers, volume leaders, and AI-powered market momentum analysis. Data refreshes every 10–30 seconds from multiple exchange APIs.</p>

          <h3 className="text-foreground font-semibold text-base">Crypto Strength Meter</h3>
          <p>A composite weighted model ranks cryptocurrency strength using price momentum (30%), volume inflow/outflow (25%), volatility (15%), market dominance changes (10%), relative performance vs BTC/ETH (10%), sentiment scores (5%), and trend consistency (5%). Assets are ranked from strongest to weakest with auto-refresh.</p>

          <h3 className="text-foreground font-semibold text-base">Whale Tracking & Smart Money</h3>
          <p>Monitor large holder transactions across all supported blockchains. The whale activity radar detects accumulation and distribution patterns, tracks smart money wallet movements, and alerts on significant transfers. Whale alerts include transaction size, wallet labels, and historical behavior analysis.</p>

          <h3 className="text-foreground font-semibold text-base">Sentiment Analysis Engine</h3>
          <p>Multi-source sentiment aggregation from Twitter, Reddit, Telegram, and news outlets. The engine processes thousands of posts per hour using natural language processing to generate sentiment scores, detect trending topics, identify FUD/FOMO patterns, and correlate social activity with price movements.</p>

          <h3 className="text-foreground font-semibold text-base">Token Explorer & Search</h3>
          <p>Search any cryptocurrency by name, symbol, or contract address across Ethereum, Solana, Base, Arbitrum, Polygon, and other supported chains. Each token page shows price history, holder distribution, liquidity depth, security audit status, and related tokens. Powered by CoinGecko and DexScreener APIs.</p>

          <h3 className="text-foreground font-semibold text-base">Wallet Scanner</h3>
          <p>Enter any EVM or Solana wallet address to get AI-powered portfolio analysis. The scanner identifies holdings, calculates portfolio concentration risk, estimates pump potential, detects diamond hands vs paper hands patterns, and provides actionable recommendations.</p>

          <h3 className="text-foreground font-semibold text-base">Crypto Factory</h3>
          <p>The centralized intelligence hub aggregates market events (token launches, protocol upgrades, airdrops), on-chain activity (whale movements, smart contract deployments), trending narratives (AI tokens, DeFi 2.0, RWA), and breaking news from 50+ crypto news sources. Like Forex Factory, but for cryptocurrency.</p>

          <h3 className="text-foreground font-semibold text-base">Multi-Chain Analytics</h3>
          <p>Deep-dive analytics for 8+ blockchain networks including real-time TPS, gas fees, TVL, active addresses, transaction counts, validator health, DeFi protocol rankings, and ecosystem token discovery. Each chain page features AI price predictions, whale activity radar, token heat scanner, and risk analyzer.</p>

          <h3 className="text-foreground font-semibold text-base">Daily AI-Generated Content</h3>
          <p>The autonomous content engine generates 20 new market analysis articles daily covering on-chain data insights, technical analysis breakdowns, sector rotation analysis, and market commentary. Articles are stored in an append-only database for compounding SEO authority. Supplemented by 20 cornerstone educational guides covering crypto fundamentals, forex market intelligence, and AI forecasting methods.</p>
        </div>

        {/* ── External Resources ── */}
        <SectionTitle id="external">External Resources & Community</SectionTitle>
        <ul className="grid md:grid-cols-2 gap-2">
          <li className="p-3 rounded-lg border border-border">
            <a href="https://x.com/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Twitter / X — @oracle_bulls</a>
            <p className="text-sm text-muted-foreground mt-1">Latest market updates, prediction alerts, and community discussion</p>
          </li>
          <li className="p-3 rounded-lg border border-border">
            <a href="https://t.me/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Telegram — Oracle Bulls Community</a>
            <p className="text-sm text-muted-foreground mt-1">Join the community for real-time alerts and market discussion</p>
          </li>
        </ul>

        {/* ── Total Page Count ── */}
        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border text-center">
          <p className="text-lg font-bold text-foreground">
            Total Indexed Pages: {13 + 4 + 3 + chains.length + (topCryptos.length * 4) + topCryptos.length + marketQuestions.length + (questionIntentCoins.length * questionPatterns.length) + learnArticles.length}+
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            All pages are fully crawlable, have unique titles and meta descriptions, canonical URLs, and structured data (JSON-LD).
            This sitemap is continuously updated as new content is generated.
          </p>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
