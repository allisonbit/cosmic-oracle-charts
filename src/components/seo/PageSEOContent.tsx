import { Link } from "react-router-dom";
import { 
  TrendingUp, BarChart3, Activity, Brain, Target, Shield, Zap, ArrowRight,
  Search, Wallet, Globe, Flame, Clock, Calendar
} from "lucide-react";

// ============================================================
// STRENGTH METER PAGE SEO CONTENT
// ============================================================

export function StrengthMeterSEOHeader() {
  return (
    <noscript>
      <div>
        <h1>Crypto Strength Meter | Real-Time Relative Strength Analysis</h1>
        <p>The Oracle Bull Crypto Strength Meter measures the relative strength of cryptocurrencies and blockchains in real-time. Track which assets are outperforming the market using our proprietary strength scoring algorithm.</p>
        <p>Strength Score is calculated using: price momentum (25%), relative performance vs BTC/ETH (20%), volume flow (15%), sentiment (10%), volatility (10%), dominance changes (10%), and trend consistency (10%).</p>
      </div>
    </noscript>
  );
}

export function StrengthMeterSEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">Understanding the Crypto Strength Meter</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          The Crypto Strength Meter is a proprietary tool that measures the relative strength of cryptocurrencies 
          compared to the overall market. Unlike simple price change metrics, our strength score incorporates 
          multiple factors including momentum, volume, sentiment, and trend consistency to provide a comprehensive 
          view of asset performance.
        </p>
        <h3 className="text-base font-semibold text-foreground mt-4">How to Use the Strength Meter</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Scores above 70:</strong> Strong bullish momentum - consider as potential long opportunities</li>
          <li><strong>Scores 55-70:</strong> Bullish trend with moderate strength - watch for confirmation</li>
          <li><strong>Scores 45-55:</strong> Neutral - market indecision, wait for directional clarity</li>
          <li><strong>Scores 30-45:</strong> Weak/bearish - exercise caution, potential shorting opportunities</li>
          <li><strong>Scores below 30:</strong> Strong bearish momentum - high risk for long positions</li>
        </ul>
      </div>
      
      {/* Internal links */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/factory" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Calendar className="w-4 h-4" />
          <span>Crypto Factory</span>
        </Link>
        <Link to="/predictions" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Target className="w-4 h-4" />
          <span>Price Predictions</span>
        </Link>
        <Link to="/sentiment" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Brain className="w-4 h-4" />
          <span>Sentiment Scanner</span>
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// CRYPTO FACTORY PAGE SEO CONTENT
// ============================================================

export function CryptoFactorySEOHeader() {
  return (
    <noscript>
      <div>
        <h1>Crypto Factory | Market Events Calendar & On-Chain Intelligence</h1>
        <p>Oracle Bull Crypto Factory is your centralized intelligence hub for market-moving events, on-chain activity, trending narratives, and crypto news. Track token unlocks, network upgrades, governance votes, and whale movements in real-time.</p>
      </div>
    </noscript>
  );
}

export function CryptoFactorySEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">About Crypto Factory Intelligence</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Crypto Factory aggregates the most important market-moving events across the cryptocurrency ecosystem. 
          From token unlocks that can impact prices to network upgrades that signal project development, 
          we track everything that matters for informed trading and investment decisions.
        </p>
        <h3 className="text-base font-semibold text-foreground mt-4">What We Track</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Market Events:</strong> Token unlocks, vesting schedules, network upgrades, hard forks</li>
          <li><strong>On-Chain Activity:</strong> Large transactions, whale movements, exchange flows</li>
          <li><strong>Trending Narratives:</strong> Emerging sectors, hot tokens, market themes</li>
          <li><strong>Crypto News:</strong> Breaking news with AI-powered sentiment analysis</li>
        </ul>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/strength-meter" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Zap className="w-4 h-4" />
          <span>Strength Meter</span>
        </Link>
        <Link to="/explorer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Search className="w-4 h-4" />
          <span>Token Explorer</span>
        </Link>
        <Link to="/portfolio" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Wallet className="w-4 h-4" />
          <span>Wallet Scanner</span>
        </Link>
        <Link to="/insights" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Flame className="w-4 h-4" />
          <span>Market Insights</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// LEARN PAGE SEO CONTENT
// ============================================================

export function LearnSEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">Crypto Education & Market Analysis</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          The Oracle Bull Learn section provides comprehensive cryptocurrency education and market analysis. 
          Our AI-generated articles cover 20 different topics including technical analysis, on-chain analytics, 
          DeFi strategies, risk management, and macro economic factors affecting crypto markets.
        </p>
        <p>
          Each article is designed to help both beginners and advanced traders understand market dynamics. 
          We publish fresh content daily, ensuring you always have access to current market insights and 
          educational material tailored to today's market conditions.
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link to="/insights" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Flame className="w-4 h-4" />
          <span>Daily Insights</span>
        </Link>
        <Link to="/predictions" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Target className="w-4 h-4" />
          <span>Price Predictions</span>
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <BarChart3 className="w-4 h-4" />
          <span>Live Dashboard</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// INSIGHTS PAGE SEO CONTENT
// ============================================================

export function InsightsSEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">Daily AI-Powered Market Insights</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull Insights delivers fresh, AI-generated cryptocurrency market analysis every day. 
          Our articles cover Ethereum ecosystem updates, Bitcoin price analysis, Solana network developments, 
          Base chain opportunities, and broader market trends.
        </p>
        <p>
          Each insight is crafted to provide actionable intelligence for traders and investors. We analyze 
          on-chain data, technical indicators, market sentiment, and news events to create comprehensive 
          articles that help you make informed decisions.
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/learn" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Brain className="w-4 h-4" />
          <span>Learn Center</span>
        </Link>
        <Link to="/chain/ethereum" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Globe className="w-4 h-4" />
          <span>Ethereum Analysis</span>
        </Link>
        <Link to="/chain/bitcoin" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <TrendingUp className="w-4 h-4" />
          <span>Bitcoin Analysis</span>
        </Link>
        <Link to="/sentiment" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Activity className="w-4 h-4" />
          <span>Market Sentiment</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// PREDICTION HUB SEO CONTENT
// ============================================================

export function PredictionHubSEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">How Our AI Predictions Work</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull's price prediction system uses a multi-layer analysis approach combining technical indicators, 
          market sentiment, on-chain metrics, and macro economic factors to generate forecasts for over 1,000 
          cryptocurrencies.
        </p>
        <h3 className="text-base font-semibold text-foreground mt-4">Our Analysis Layers</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Technical Analysis:</strong> RSI, MACD, Bollinger Bands, moving averages, support/resistance</li>
          <li><strong>Sentiment Analysis:</strong> Social media, news sentiment, fear & greed index</li>
          <li><strong>On-Chain Metrics:</strong> Whale movements, exchange flows, active addresses</li>
          <li><strong>Macro Factors:</strong> Bitcoin correlation, market dominance, global liquidity</li>
        </ul>
        <p className="mt-4">
          Each prediction includes specific entry zones, stop-loss levels, and take-profit targets designed 
          for both manual trading and future automated trading bot compatibility.
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link to="/price-prediction/bitcoin/daily" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Clock className="w-4 h-4" />
          <span>Bitcoin Today</span>
        </Link>
        <Link to="/price-prediction/ethereum/weekly" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Calendar className="w-4 h-4" />
          <span>Ethereum Weekly</span>
        </Link>
        <Link to="/market/best-crypto-to-buy-today" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Target className="w-4 h-4" />
          <span>Best Buys Today</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// CHAIN PAGE SEO CONTENT
// ============================================================

interface ChainSEOContentProps {
  chainName: string;
  chainSymbol: string;
  chainId: string;
}

export function ChainSEOContent({ chainName, chainSymbol, chainId }: ChainSEOContentProps) {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">{chainName} Network Analysis & Intelligence</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull provides comprehensive {chainName} ({chainSymbol}) network analysis including real-time 
          price data, on-chain metrics, DeFi TVL tracking, whale activity monitoring, and AI-powered price 
          predictions. Our dashboard helps traders and investors understand the health and momentum of the 
          {chainName} ecosystem.
        </p>
        <h3 className="text-base font-semibold text-foreground mt-4">What We Track for {chainName}</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Price Analysis:</strong> Real-time price, volume, market cap, and technical indicators</li>
          <li><strong>Network Health:</strong> TPS, gas fees, active addresses, transaction counts</li>
          <li><strong>DeFi Metrics:</strong> Total Value Locked, top protocols, yield opportunities</li>
          <li><strong>Whale Activity:</strong> Large transactions, smart money flows, exchange movements</li>
          <li><strong>Token Discovery:</strong> New tokens, trending assets, ecosystem opportunities</li>
        </ul>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to={`/price-prediction/${chainId}/daily`} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Clock className="w-4 h-4" />
          <span>{chainSymbol} Today</span>
        </Link>
        <Link to={`/price-prediction/${chainId}/weekly`} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Calendar className="w-4 h-4" />
          <span>{chainSymbol} Weekly</span>
        </Link>
        <Link to="/explorer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Search className="w-4 h-4" />
          <span>Token Explorer</span>
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </section>
  );
}

// ============================================================
// CONTACT PAGE SEO CONTENT
// ============================================================

export function ContactSEOContent() {
  return (
    <section className="holo-card p-6 mt-6">
      <h2 className="font-display text-lg font-bold mb-4">About Oracle Bull</h2>
      <div className="prose max-w-none text-sm text-muted-foreground space-y-3">
        <p>
          Oracle Bull is an AI-powered cryptocurrency analytics platform providing institutional-grade market 
          intelligence to traders and investors worldwide. Our platform combines real-time data, advanced 
          machine learning algorithms, and comprehensive on-chain analysis to deliver actionable insights.
        </p>
        <p>
          Whether you're a day trader looking for intraday signals, a swing trader seeking weekly opportunities, 
          or a long-term investor evaluating market conditions, Oracle Bull provides the tools and intelligence 
          you need to make informed decisions.
        </p>
      </div>
      
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <BarChart3 className="w-4 h-4" />
          <span>Live Dashboard</span>
        </Link>
        <Link to="/predictions" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Target className="w-4 h-4" />
          <span>Predictions</span>
        </Link>
        <Link to="/learn" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Brain className="w-4 h-4" />
          <span>Learn</span>
        </Link>
        <Link to="/insights" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 p-2 rounded-lg bg-primary/5 hover:bg-primary/10">
          <Flame className="w-4 h-4" />
          <span>Insights</span>
        </Link>
      </div>
    </section>
  );
}
