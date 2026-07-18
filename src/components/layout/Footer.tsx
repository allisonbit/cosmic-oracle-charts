import { Twitter, MessageCircle, Shield, FileText, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";

// All top coins for internal linking grid — eliminates orphan pages for Google
const TOP_COINS = [
  { id: "bitcoin", name: "Bitcoin (BTC)" },
  { id: "ethereum", name: "Ethereum (ETH)" },
  { id: "solana", name: "Solana (SOL)" },
  { id: "ripple", name: "XRP (Ripple)" },
  { id: "binancecoin", name: "BNB" },
  { id: "cardano", name: "Cardano (ADA)" },
  { id: "dogecoin", name: "Dogecoin (DOGE)" },
  { id: "toncoin", name: "Toncoin (TON)" },
  { id: "shiba-inu", name: "Shiba Inu (SHIB)" },
  { id: "polkadot", name: "Polkadot (DOT)" },
  { id: "chainlink", name: "Chainlink (LINK)" },
  { id: "avalanche-2", name: "Avalanche (AVAX)" },
  { id: "matic-network", name: "Polygon (MATIC)" },
  { id: "litecoin", name: "Litecoin (LTC)" },
  { id: "uniswap", name: "Uniswap (UNI)" },
  { id: "cosmos", name: "Cosmos (ATOM)" },
  { id: "near", name: "NEAR Protocol" },
  { id: "pepe", name: "Pepe (PEPE)" },
  { id: "arbitrum", name: "Arbitrum (ARB)" },
  { id: "optimism", name: "Optimism (OP)" },
  { id: "aptos", name: "Aptos (APT)" },
  { id: "sui", name: "Sui (SUI)" },
  { id: "floki", name: "Floki (FLOKI)" },
  { id: "bonk", name: "Bonk (BONK)" },
  { id: "tron", name: "TRON (TRX)" },
  { id: "stellar", name: "Stellar (XLM)" },
  { id: "monero", name: "Monero (XMR)" },
  { id: "hedera", name: "Hedera (HBAR)" },
  { id: "filecoin", name: "Filecoin (FIL)" },
  { id: "vechain", name: "VeChain (VET)" },
  { id: "internet-computer", name: "ICP" },
  { id: "render-token", name: "Render (RNDR)" },
  { id: "fetch-ai", name: "Fetch.ai (FET)" },
  { id: "injective-protocol", name: "Injective (INJ)" },
  { id: "kaspa", name: "Kaspa (KAS)" },
  { id: "theta-token", name: "Theta (THETA)" },
  { id: "bittensor", name: "Bittensor (TAO)" },
  { id: "dogwifcoin", name: "dogwifhat (WIF)" },
  { id: "pendle", name: "Pendle (PENDLE)" },
  { id: "starknet", name: "StarkNet (STRK)" },
];

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card/50 backdrop-blur-xl" role="contentinfo">
      {/* Disclaimer Banner */}
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-xs md:text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 inline-block mr-2 text-warning" />
            <span className="font-medium text-warning">Disclaimer:</span>{" "}
            Oracle Bull provides market analysis and educational insights only. This is not financial advice.
            <Link to="/risk-disclaimer" className="text-primary hover:underline ml-2">
              Read full disclaimer →
            </Link>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3" aria-label="Oracle Bull – Home">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30">
               <img src={oracleLogo} alt="Oracle Bull logo" width={40} height={40} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-lg font-bold glow-text">ORACLEBULL</span>
            </Link>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Free AI-powered cryptocurrency price predictions, whale tracking, sentiment analysis & blockchain dashboards for 1000+ tokens.
            </p>
          </div>

          {/* Analysis & Insights */}
          <nav className="space-y-4" aria-label="Footer – Analysis">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">ANALYSIS</h4>
            <ul className="space-y-2">
              <li><Link to="/predictions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">AI Price Predictions</Link></li>
              <li><Link to="/sentiment" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Sentiment Analysis</Link></li>
              <li><Link to="/crypto-strength-meter" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Crypto Strength Meter</Link></li>
              <li><Link to="/factory" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Crypto Factory</Link></li>
              <li><Link to="/factory/events" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Market Events</Link></li>
              <li><Link to="/factory/onchain" className="block text-sm text-muted-foreground hover:text-primary transition-colors">On-Chain Intelligence</Link></li>
              <li><Link to="/factory/narratives" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Market Narratives</Link></li>
              <li><Link to="/factory/news" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Crypto News</Link></li>
              <li><Link to="/insights" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Market Insights</Link></li>
            </ul>
          </nav>

          {/* Tools */}
          <nav className="space-y-4" aria-label="Footer – Tools">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">TOOLS</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Live Market Dashboard</Link></li>
              <li><Link to="/explorer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Token Explorer</Link></li>
              <li><Link to="/scanner" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Wallet Scanner</Link></li>
              <li><Link to="/chain/ethereum" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Ethereum Analytics</Link></li>
              <li><Link to="/chain/solana" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Solana Analytics</Link></li>
              <li><Link to="/chain/base" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Base Analytics</Link></li>
              <li><Link to="/chain/arbitrum" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Arbitrum Analytics</Link></li>
              <li><Link to="/chain/bnb" className="block text-sm text-muted-foreground hover:text-primary transition-colors">BNB Chain Analytics</Link></li>
            </ul>
          </nav>

          {/* Learn & Content */}
          <nav className="space-y-4" aria-label="Footer – Learn">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">LEARN</h4>
            <ul className="space-y-2">
              <li><Link to="/learn" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Educational Articles</Link></li>
              <li><Link to="/how-to-read-predictions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">How to Read AI Predictions</Link></li>
              <li><Link to="/learn/what-is-crypto-market-sentiment" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Crypto Sentiment Guide</Link></li>
              <li><Link to="/learn/bitcoin-market-cycles-explained" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Bitcoin Market Cycles</Link></li>
              <li><Link to="/learn/how-ai-is-used-in-crypto-market-analysis" className="block text-sm text-muted-foreground hover:text-primary transition-colors">AI in Crypto Analysis</Link></li>
              <li><Link to="/learn/on-chain-data-explained-for-beginners" className="block text-sm text-muted-foreground hover:text-primary transition-colors">On-Chain Data Guide</Link></li>
              <li><Link to="/learn/how-whales-influence-market-trends" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Whale Market Influence</Link></li>
              <li><Link to="/learn/risk-management-in-volatile-crypto-markets" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Crypto Risk Management</Link></li>
              <li><Link to="/learn/technical-analysis-vs-sentiment-analysis" className="block text-sm text-muted-foreground hover:text-primary transition-colors">TA vs Sentiment Analysis</Link></li>
            </ul>
          </nav>

          {/* Company & Legal */}
          <nav className="space-y-4" aria-label="Footer – Company">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">COMPANY</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Info className="w-3 h-3" /> About Us</Link></li>
              <li><Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/connect" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Connect to ChatGPT / Claude</Link></li>
              <li><Link to="/editorial-policy" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Editorial Policy</Link></li>
              <li><Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Shield className="w-3 h-3" /> Privacy Policy</Link></li>
              <li><Link to="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><FileText className="w-3 h-3" /> Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Shield className="w-3 h-3" /> Cookie Policy</Link></li>
              <li><Link to="/risk-disclaimer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><AlertTriangle className="w-3 h-3" /> Risk Disclaimer</Link></li>
            </ul>
          </nav>
        </div>

        {/* ═══ INTERNAL LINK GRID: AI Price Predictions (all coins) — eliminates orphan pages ═══ */}
        <div className="mt-10 pt-8 border-t border-border/30">
          <h4 className="font-display font-bold text-foreground text-sm mb-4 uppercase tracking-wider">
            AI Crypto Price Predictions
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-1.5">
            {TOP_COINS.map((coin) => (
              <Link
                key={coin.id}
                to={`/price-prediction/${coin.id}/daily`}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors truncate py-0.5"
                title={`${coin.name} Price Prediction`}
              >
                {coin.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ MARKET ANALYSIS PAGES ═══ */}
        <div className="mt-6 pt-6 border-t border-border/20">
          <h4 className="font-display font-bold text-foreground text-sm mb-4 uppercase tracking-wider">
            Market Analysis
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { path: "/market/best-crypto-to-buy-today", label: "Best Crypto to Buy Today" },
              { path: "/market/top-crypto-gainers-today", label: "Top Crypto Gainers Today" },
              { path: "/market/next-crypto-to-explode", label: "Next Crypto to Explode" },
              { path: "/market/which-crypto-will-go-up-today", label: "Which Crypto Will Go Up Today" },
              { path: "/market/crypto-market-prediction-today", label: "Crypto Market Prediction Today" },
              { path: "/market/is-crypto-going-up-today", label: "Is Crypto Going Up Today" },
              { path: "/market/cheap-crypto-to-buy-now", label: "Cheap Crypto to Buy Now" },
              { path: "/market/undervalued-crypto-to-buy", label: "Undervalued Crypto to Buy" },
              { path: "/market/best-altcoins-to-buy", label: "Best Altcoins to Buy" },
              { path: "/market/top-meme-coins", label: "Top Meme Coins" },
              { path: "/market/best-defi-tokens", label: "Best DeFi Tokens" },
              { path: "/market/top-ai-crypto-tokens", label: "Top AI Crypto Tokens" },
              { path: "/market/crypto-with-most-potential", label: "Crypto With Most Potential" },
              { path: "/market/safest-crypto-to-invest", label: "Safest Crypto to Invest" },
              { path: "/market/best-crypto-to-buy-this-week", label: "Best Crypto This Week" },
              { path: "/market/crypto-prediction-this-week", label: "Crypto Prediction This Week" },
              { path: "/market/top-crypto-gainers-this-week", label: "Top Gainers This Week" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ POPULAR QUESTION PAGES (high-traffic SEO) ═══ */}
        <div className="mt-6 pt-6 border-t border-border/20">
          <h4 className="font-display font-bold text-foreground text-sm mb-4 uppercase tracking-wider">
            Popular Questions
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { path: "/q/will-bitcoin-go-up-today", label: "Will Bitcoin Go Up Today?" },
              { path: "/q/bitcoin-price-prediction-today", label: "Bitcoin Price Prediction Today" },
              { path: "/q/will-ethereum-go-up-today", label: "Will Ethereum Go Up Today?" },
              { path: "/q/ethereum-price-prediction-today", label: "Ethereum Price Prediction Today" },
              { path: "/q/will-solana-go-up-today", label: "Will Solana Go Up Today?" },
              { path: "/q/solana-price-prediction-today", label: "Solana Price Prediction Today" },
              { path: "/q/ripple-price-prediction-today", label: "XRP Price Prediction Today" },
              { path: "/q/dogecoin-price-prediction-today", label: "Dogecoin Price Prediction Today" },
              { path: "/q/is-bitcoin-bullish-today", label: "Is Bitcoin Bullish Today?" },
              { path: "/q/is-ethereum-bullish-today", label: "Is Ethereum Bullish Today?" },
              { path: "/q/bitcoin-weekly-forecast", label: "Bitcoin Weekly Forecast" },
              { path: "/q/ethereum-weekly-forecast", label: "Ethereum Weekly Forecast" },
              { path: "/q/bitcoin-monthly-forecast", label: "Bitcoin Monthly Forecast" },
              { path: "/q/is-bitcoin-a-good-investment-this-month", label: "Is Bitcoin a Good Investment?" },
              { path: "/q/is-ethereum-a-good-investment-this-month", label: "Is Ethereum a Good Investment?" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ COIN COMPARISONS (internal linking to /compare hub) ═══ */}
        <div className="mt-6 pt-6 border-t border-border/20">
          <h4 className="font-display font-bold text-foreground text-sm mb-4 uppercase tracking-wider">
            Popular Comparisons
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { path: "/compare/bitcoin-vs-ethereum", label: "Bitcoin vs Ethereum" },
              { path: "/compare/ethereum-vs-solana", label: "Ethereum vs Solana" },
              { path: "/compare/bitcoin-vs-solana", label: "Bitcoin vs Solana" },
              { path: "/compare/cardano-vs-solana", label: "Cardano vs Solana" },
              { path: "/compare/dogecoin-vs-shiba-inu", label: "Dogecoin vs Shiba Inu" },
              { path: "/compare/xrp-vs-stellar", label: "XRP vs Stellar" },
              { path: "/compare/polygon-vs-arbitrum", label: "Polygon vs Arbitrum" },
              { path: "/compare/near-vs-aptos", label: "NEAR vs Aptos" },
              { path: "/compare/pepe-vs-shiba-inu", label: "Pepe vs Shiba Inu" },
              { path: "/compare/render-vs-fetch-ai", label: "Render vs Fetch.ai" },
              { path: "/compare", label: "Compare All Coins →" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ═══ HOW TO BUY GUIDES (internal linking to /how-to-buy hub) ═══ */}
        <div className="mt-6 pt-6 border-t border-border/20">
          <h4 className="font-display font-bold text-foreground text-sm mb-4 uppercase tracking-wider">
            How to Buy Crypto
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { path: "/how-to-buy/bitcoin", label: "How to Buy Bitcoin" },
              { path: "/how-to-buy/ethereum", label: "How to Buy Ethereum" },
              { path: "/how-to-buy/solana", label: "How to Buy Solana" },
              { path: "/how-to-buy/ripple", label: "How to Buy XRP" },
              { path: "/how-to-buy/cardano", label: "How to Buy Cardano" },
              { path: "/how-to-buy/dogecoin", label: "How to Buy Dogecoin" },
              { path: "/how-to-buy/shiba-inu", label: "How to Buy Shiba Inu" },
              { path: "/how-to-buy/pepe", label: "How to Buy Pepe" },
              { path: "/how-to-buy", label: "All Buying Guides →" },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Social Links & Bottom */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              aria-label="Follow Oracle Bull on X (Twitter)"
            >
              <Twitter className="w-5 h-5" aria-hidden="true" />
            </a>
            <a
              href="https://t.me/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              aria-label="Join Oracle Bull Telegram community"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>

          <div className="text-center text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} OracleBull.com - Free AI Crypto Analytics Platform. All rights reserved.</p>
            <div className="mt-4 p-4 rounded-xl bg-background/50 border border-border text-[11px] md:text-xs text-muted-foreground max-w-5xl mx-auto text-left md:text-center leading-relaxed">
              <span className="font-bold text-foreground">Financial Risk Warning:</span> Cryptocurrency trading and investments are highly volatile and carry a high degree of risk. You could lose some or all of your initial investment. Oracle Bull provides data, market analysis, and AI predictions for informational and educational purposes only, and does not constitute financial or investment advice. We are not a registered broker or financial advisor. Never invest money you cannot afford to lose. Past performance is not indicative of future results.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
