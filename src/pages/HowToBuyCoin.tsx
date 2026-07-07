import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle,
  Brain, TrendingUp, DollarSign, CreditCard, Smartphone,
  BookOpen, Zap, BarChart3, Activity, Star, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoFetch } from "@/lib/coingecko";

// ─── Metadata ────────────────────────────────────────────────────────────────
export const COIN_META: Record<string, {
  name: string; ticker: string; color: string;
  tagline: string; category: string; year: number; founder: string;
}> = {
  "bitcoin":            { name: "Bitcoin",       ticker: "BTC",    color: "#f7931a", tagline: "The original cryptocurrency and digital gold standard.", category: "Store of Value", year: 2009, founder: "Satoshi Nakamoto" },
  "ethereum":           { name: "Ethereum",      ticker: "ETH",    color: "#627eea", tagline: "The world's programmable blockchain powering DeFi and NFTs.", category: "Smart Contract Platform", year: 2015, founder: "Vitalik Buterin" },
  "solana":             { name: "Solana",         ticker: "SOL",    color: "#9945ff", tagline: "Ultra-fast, low-fee blockchain built for mass adoption.", category: "Layer 1 Blockchain", year: 2020, founder: "Anatoly Yakovenko" },
  "ripple":             { name: "XRP",            ticker: "XRP",    color: "#00aae4", tagline: "Instant, low-cost international payment settlement.", category: "Payment Protocol", year: 2012, founder: "Ripple Labs" },
  "cardano":            { name: "Cardano",        ticker: "ADA",    color: "#3cc8c8", tagline: "Peer-reviewed, research-driven blockchain for secure transactions.", category: "Smart Contract Platform", year: 2017, founder: "Charles Hoskinson" },
  "dogecoin":           { name: "Dogecoin",       ticker: "DOGE",   color: "#c3a634", tagline: "The original meme coin with the strongest community in crypto.", category: "Meme Coin", year: 2013, founder: "Billy Markus & Jackson Palmer" },
  "polkadot":           { name: "Polkadot",       ticker: "DOT",    color: "#e6007a", tagline: "The blockchain of blockchains - connecting multiple networks.", category: "Interoperability", year: 2020, founder: "Gavin Wood" },
  "chainlink":          { name: "Chainlink",      ticker: "LINK",   color: "#375bd2", tagline: "Decentralised oracles connecting blockchains to real-world data.", category: "Oracle Network", year: 2017, founder: "Sergey Nazarov" },
  "avalanche-2":        { name: "Avalanche",      ticker: "AVAX",   color: "#e84142", tagline: "Blazing-fast blockchain with sub-second finality.", category: "Layer 1 Blockchain", year: 2020, founder: "Emin Gün Sirer" },
  "matic-network":      { name: "Polygon",        ticker: "MATIC",  color: "#8247e5", tagline: "Ethereum's leading scaling solution for cheap, fast transactions.", category: "Layer 2 Scaling", year: 2017, founder: "Sandeep Nailwal" },
  "shiba-inu":          { name: "Shiba Inu",      ticker: "SHIB",   color: "#e84040", tagline: "Ethereum-based meme coin with its own DEX and metaverse.", category: "Meme Coin", year: 2020, founder: "Ryoshi" },
  "binancecoin":        { name: "BNB",            ticker: "BNB",    color: "#f3ba2f", tagline: "Binance's exchange token powering the BNB Chain ecosystem.", category: "Exchange Token", year: 2017, founder: "Changpeng Zhao (CZ)" },
  "litecoin":           { name: "Litecoin",       ticker: "LTC",    color: "#bfbbbb", tagline: "The silver to Bitcoin's gold - faster, cheaper transactions.", category: "Payments", year: 2011, founder: "Charlie Lee" },
  "uniswap":            { name: "Uniswap",        ticker: "UNI",    color: "#ff007a", tagline: "The largest decentralised exchange on Ethereum.", category: "DeFi / DEX", year: 2018, founder: "Hayden Adams" },
  "near":               { name: "NEAR Protocol",  ticker: "NEAR",   color: "#00ec97", tagline: "Developer-friendly Layer 1 with sharding for infinite scale.", category: "Layer 1 Blockchain", year: 2020, founder: "Illia Polosukhin" },
  "arbitrum":           { name: "Arbitrum",       ticker: "ARB",    color: "#28a0f0", tagline: "Ethereum's leading optimistic rollup for cheap DeFi.", category: "Layer 2 Scaling", year: 2021, founder: "Ed Felten" },
  "optimism":           { name: "Optimism",       ticker: "OP",     color: "#ff0420", tagline: "Superchain L2 backed by the Ethereum Foundation.", category: "Layer 2 Scaling", year: 2019, founder: "Jinglan Wang" },
  "aptos":              { name: "Aptos",           ticker: "APT",    color: "#00c0ff", tagline: "High-performance L1 built by ex-Meta Diem engineers.", category: "Layer 1 Blockchain", year: 2022, founder: "Mo Shaikh" },
  "sui":                { name: "Sui",             ticker: "SUI",    color: "#6fbcf0", tagline: "Move-language L1 designed for speed and game/NFT apps.", category: "Layer 1 Blockchain", year: 2023, founder: "Evan Cheng" },
  "pepe":               { name: "Pepe",            ticker: "PEPE",   color: "#4caf50", tagline: "The most iconic frog-themed meme coin on Ethereum.", category: "Meme Coin", year: 2023, founder: "Anonymous" },
  "dogwifcoin":         { name: "dogwifhat",       ticker: "WIF",    color: "#ce8d3e", tagline: "Solana's most popular meme coin - a dog in a hat.", category: "Meme Coin", year: 2023, founder: "Anonymous" },
  "render-token":       { name: "Render",          ticker: "RENDER", color: "#c81010", tagline: "Decentralised GPU rendering network for AI and 3D content.", category: "AI / DePIN", year: 2017, founder: "Jules Urbach" },
  "fetch-ai":           { name: "Fetch.ai",        ticker: "FET",    color: "#1eb4fb", tagline: "AI autonomous agents operating on a decentralised network.", category: "AI Crypto", year: 2019, founder: "Humayun Sheikh" },
  "bittensor":          { name: "Bittensor",       ticker: "TAO",    color: "#e6c87e", tagline: "Decentralised AI network incentivising machine learning.", category: "AI Crypto", year: 2021, founder: "Jacob Steeves" },
  "injective-protocol": { name: "Injective",       ticker: "INJ",    color: "#00f2fe", tagline: "DeFi-first Layer 1 with native orderbook and cross-chain DEX.", category: "DeFi L1", year: 2020, founder: "Eric Chen" },
  "the-graph":          { name: "The Graph",       ticker: "GRT",    color: "#6747ed", tagline: "The indexing protocol for querying blockchain data.", category: "Infrastructure", year: 2018, founder: "Yaniv Tal" },
  "aave":               { name: "Aave",            ticker: "AAVE",   color: "#b6509e", tagline: "The leading decentralised lending and borrowing protocol.", category: "DeFi / Lending", year: 2017, founder: "Stani Kulechov" },
  "mantle":             { name: "Mantle",          ticker: "MNT",    color: "#7ce3cb", tagline: "Ethereum L2 backed by BitDAO with $4B+ treasury.", category: "Layer 2 Scaling", year: 2023, founder: "BitDAO" },
  "kaspa":              { name: "Kaspa",           ticker: "KAS",    color: "#49eacb", tagline: "The world's fastest PoW blockchain using the GHOSTDAG protocol.", category: "Proof of Work", year: 2021, founder: "Yonatan Sompolinsky" },
  "hedera":             { name: "Hedera",          ticker: "HBAR",   color: "#00acaf", tagline: "Enterprise-grade hashgraph for fast, fair, and secure transactions.", category: "Enterprise", year: 2019, founder: "Leemon Baird" },
  "immutable-x":        { name: "Immutable X",     ticker: "IMX",    color: "#17b5cb", tagline: "The leading L2 for NFTs and blockchain gaming.", category: "Gaming / NFT", year: 2021, founder: "Robbie Ferguson" },
};

const EXCHANGES = [
  { name: "Coinbase", flag: "", rating: 4.8, fee: "0.6%", best: "USA & UK Beginners", kycRequired: true, regulated: true, url: "https://coinbase.com" },
  { name: "Binance", flag: "", rating: 4.7, fee: "0.1%", best: "Lowest Fees Globally", kycRequired: true, regulated: true, url: "https://binance.com" },
  { name: "Kraken", flag: "", rating: 4.6, fee: "0.26%", best: "Security-First Traders", kycRequired: true, regulated: true, url: "https://kraken.com" },
  { name: "Bybit", flag: "", rating: 4.5, fee: "0.1%", best: "Advanced & Derivatives", kycRequired: true, regulated: true, url: "https://bybit.com" },
  { name: "KuCoin", flag: "", rating: 4.3, fee: "0.1%", best: "Altcoin Variety", kycRequired: true, regulated: false, url: "https://kucoin.com" },
];

const PAYMENT_METHODS = [
  { icon: CreditCard, label: "Debit / Credit Card", speed: "Instant", fee: "High (1.5–3.5%)", note: "Fastest way to buy. Best for small amounts." },
  { icon: DollarSign, label: "Bank Transfer (ACH/SEPA)", speed: "1–3 days", fee: "Low (0–0.5%)", note: "Best for large purchases. Cheapest fees." },
  { icon: Smartphone, label: "Apple Pay / Google Pay", speed: "Instant", fee: "High (1.5–2.5%)", note: "Easiest for mobile users." },
  { icon: TrendingUp, label: "Crypto-to-Crypto Swap", speed: "Seconds", fee: "Very Low (0.1%)", note: "Best if you already own another crypto." },
];

const STEPS = [
  { num: "01", title: "Choose a Regulated Exchange", desc: "Select one of the trusted exchanges below. Each one is fully KYC-compliant and insured. Beginners should start with Coinbase for its simplicity." },
  { num: "02", title: "Create & Verify Your Account", desc: "Sign up with your email. Complete KYC identity verification (passport or driving licence). This takes 5–15 minutes and is required by law." },
  { num: "03", title: "Deposit Funds", desc: "Add money via bank transfer (cheapest) or debit card (fastest). Bank transfers save you 1–3% in fees on large amounts." },
  { num: "04", title: "Search for the Coin & Place Your Order", desc: "Find the coin using its ticker symbol. Choose 'Market Order' to buy instantly at the current price, or 'Limit Order' to buy at your target price." },
  { num: "05", title: "Secure Your Investment", desc: "For amounts over $1,000, transfer your coins to a hardware wallet (Ledger or Trezor). Never leave large sums on an exchange." },
];

interface CoinPrice {
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    market_cap_rank: number;
  };
  sentiment_votes_up_percentage: number;
}

function useLivePrice(id: string) {
  return useQuery<CoinPrice>({
    queryKey: ["htb-price", id],
    queryFn: async () => {
      const data = await coingeckoFetch<CoinPrice>({
        path: `coins/${id}`,
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: false,
          sparkline: false,
        },
        ttlMs: 60_000,
      });
      if (!data) throw new Error("Failed to fetch");
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export default function HowToBuyCoin() {
  const { coin } = useParams<{ coin: string }>();
  const id = coin ?? "bitcoin";
  const meta = COIN_META[id] ?? { name: id, ticker: id.toUpperCase(), color: "#888", tagline: "", category: "Cryptocurrency", year: 2009, founder: "Unknown" };
  const { data: liveData } = useLivePrice(id);

  const currentPrice = liveData?.market_data?.current_price?.usd;
  const change24h = liveData?.market_data?.price_change_percentage_24h ?? 0;
  const rank = liveData?.market_data?.market_cap_rank;
  const sentiment = liveData?.sentiment_votes_up_percentage ?? 60;

  const pageTitle = `How to Buy ${meta.name} (${meta.ticker}) in 2025 - Step-by-Step Guide | Oracle Bull`;
  const pageDesc = `Learn exactly how to buy ${meta.name} (${meta.ticker}) safely in 2025. Compare the best exchanges, payment methods, and fees. Get AI-powered tips on the best time to buy ${meta.ticker}.`;
  const canonical = `https://oraclebull.com/how-to-buy/${id}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": pageTitle,
    "description": pageDesc,
    "url": canonical,
    "step": STEPS.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.desc
    })),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com" },
        { "@type": "ListItem", "position": 2, "name": "How to Buy Crypto", "item": "https://oraclebull.com/how-to-buy" },
        { "@type": "ListItem", "position": 3, "name": `How to Buy ${meta.name}`, "item": canonical }
      ]
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/how-to-buy" className="hover:text-primary transition-colors">Guides</Link>
            <span>/</span>
            <span className="text-foreground">How to Buy {meta.name}</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <BookOpen className="w-4 h-4" />
              <span>STEP-BY-STEP GUIDE - UPDATED 2025</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">
              How to Buy {meta.name} ({meta.ticker})
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-4">
              {meta.tagline} Follow our complete guide to buy {meta.ticker} safely today.
            </p>
            <div className="inline-block px-4 py-2 bg-background/50 border border-border text-xs text-muted-foreground/80 max-w-2xl">
              <strong>Advertiser Disclosure:</strong> Oracle Bull is an independent platform. We may receive compensation from the cryptocurrency exchanges or brokers recommended in this guide at no additional cost to you. This compensation does not impact our AI-driven market analysis or ratings.
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <div className="border-t border-border/30 pt-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Price</div>
              <div className="font-bold text-xl font-display">
                {currentPrice ? `$${currentPrice.toLocaleString()}` : <span className="animate-pulse text-muted-foreground">Loading...</span>}
              </div>
            </div>
            <div className="border-t border-border/30 pt-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">24h Change</div>
              <div className={cn("font-bold text-xl font-display", change24h >= 0 ? "text-success" : "text-danger")}>
                {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
              </div>
            </div>
            <div className="border-t border-border/30 pt-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Market Cap Rank</div>
              <div className="font-bold text-xl font-display">
                {rank ? `#${rank}` : <span className="animate-pulse text-muted-foreground">–</span>}
              </div>
            </div>
            <div className="border-t border-border/30 pt-5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Community Bullish</div>
              <div className={cn("font-bold text-xl font-display", sentiment >= 60 ? "text-success" : "text-warning")}>
                {sentiment.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* AI Timing Box */}
          <div className="bg-primary/5 border border-primary/30 p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold font-display text-lg mb-2">Is Now a Good Time to Buy {meta.ticker}?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Knowing <em>how</em> to buy is only half the battle. Knowing <em>when</em> to buy is what separates profitable traders from those who buy tops. Our AI analyses {meta.name}'s price momentum, on-chain flows, and market sentiment in real time to tell you the optimal entry point.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/price-prediction/${id}`}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    View AI {meta.ticker} Price Prediction
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/sentiment"
                    className="inline-flex items-center gap-2 bg-background/50 border border-border px-5 py-2.5 font-medium text-sm hover:border-primary/50 transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    Market Sentiment
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <h2 className="text-2xl font-bold font-display mb-6">How to Buy {meta.name} - Step by Step</h2>
          <div className="space-y-4 mb-12">
            {STEPS.map((step) => (
              <div key={step.num} className="border-t border-border/30 pt-5 flex gap-5">
                <div className="shrink-0 w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Exchanges */}
          <h2 className="text-2xl font-bold font-display mb-2">Best Exchanges to Buy {meta.name}</h2>
          <p className="text-muted-foreground text-sm mb-6">All platforms below are regulated and support {meta.ticker} purchases.</p>
          <div className="space-y-3 mb-12">
            {EXCHANGES.map((ex, i) => (
              <div key={ex.name} className="border-t border-border/30 pt-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-muted/50 border border-border flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-base flex items-center gap-2">
                      {ex.flag} {ex.name}
                      {ex.regulated && (
                        <span className="text-[10px] text-success border border-success/30 bg-success/10 px-1.5 py-0.5 font-semibold">Regulated</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Best for: {ex.best}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm shrink-0">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Fee</div>
                    <div className="font-bold text-foreground">{ex.fee}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <div className="font-bold text-warning flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-warning" />{ex.rating}
                    </div>
                  </div>
                  <a
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-4 py-2 text-sm font-bold hover:bg-primary/20 transition-colors"
                  >
                    Visit {ex.name} <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Methods */}
          <h2 className="text-2xl font-bold font-display mb-6">Payment Methods</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {PAYMENT_METHODS.map(({ icon: Icon, label, speed, fee, note }) => (
              <div key={label} className="border-t border-border/30 pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="font-bold text-sm">{label}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Speed: </span>
                    <span className="font-semibold text-foreground">{speed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fee: </span>
                    <span className="font-semibold text-foreground">{fee}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>

          {/* Risks & Tips */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Safety tips */}
            <div className="border-t border-border/30 pt-5">
              <h2 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-success" /> Safety Checklist
              </h2>
              <ul className="space-y-3">
                {[
                  "Only use regulated exchanges listed above",
                  "Enable 2-Factor Authentication (2FA) immediately",
                  "Never share your seed phrase or private key",
                  "Use a hardware wallet for holdings over $1,000",
                  "Bookmark the official exchange URL to avoid phishing",
                  "Start with a small amount to learn the process",
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Common mistakes */}
            <div className="border-t border-border/30 pt-5">
              <h2 className="font-bold font-display text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" /> Common Mistakes to Avoid
              </h2>
              <ul className="space-y-3">
                {[
                  "Buying at emotional highs driven by news hype",
                  "Leaving large amounts on centralised exchanges",
                  "Not checking network fees before withdrawing",
                  "Sending to the wrong blockchain network (e.g. ERC-20 vs BEP-20)",
                  "Investing more than you can afford to lose",
                  "Ignoring tax obligations on crypto gains",
                ].map(mistake => (
                  <li key={mistake} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cross-promotion: next steps */}
          <div className="border-t border-border/30 pt-5 mb-12">
            <h2 className="font-bold font-display text-xl mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              You Bought {meta.ticker}. Now What?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Don't just hold and hope. Use Oracle Bull's full suite of AI tools to maximise your investment and know exactly when to take profit.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Link to={`/price-prediction/${id}`} className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <BarChart3 className="w-5 h-5 mb-2 text-primary" />
                <div className="font-bold text-sm">{meta.ticker} AI Price Prediction</div>
                <div className="text-xs text-muted-foreground mt-1">See where AI thinks {meta.name} is heading</div>
              </Link>
              <Link to="/tools/profit-calculator" className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <DollarSign className="w-5 h-5 mb-2 text-success" />
                <div className="font-bold text-sm">Calculate Your Profit</div>
                <div className="text-xs text-muted-foreground mt-1">Set a target and calculate exact returns</div>
              </Link>
              <Link to="/tools/dca-calculator" className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <Clock className="w-5 h-5 mb-2 text-warning" />
                <div className="font-bold text-sm">DCA Simulator</div>
                <div className="text-xs text-muted-foreground mt-1">Simulate recurring buys to lower your average</div>
              </Link>
              <Link to="/sentiment" className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <Activity className="w-5 h-5 mb-2 text-purple-400" />
                <div className="font-bold text-sm">Market Sentiment</div>
                <div className="text-xs text-muted-foreground mt-1">Track Fear & Greed in real time</div>
              </Link>
              <Link to="/airdrops" className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <Zap className="w-5 h-5 mb-2 text-primary" />
                <div className="font-bold text-sm">Airdrop Tracker</div>
                <div className="text-xs text-muted-foreground mt-1">Earn free tokens alongside your holdings</div>
              </Link>
              <Link to="/compare" className="bg-background/50 border border-border p-4 hover:border-primary/50 hover:text-primary transition-all group">
                <Brain className="w-5 h-5 mb-2 text-primary" />
                <div className="font-bold text-sm">Compare Coins</div>
                <div className="text-xs text-muted-foreground mt-1">See how {meta.ticker} stacks up vs rivals</div>
              </Link>
            </div>
          </div>

          {/* SEO Prose */}
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>About {meta.name} ({meta.ticker})</h2>
            <p>
              {meta.name} was created in {meta.year} by {meta.founder}. It is classified as a <strong>{meta.category}</strong> asset and is currently ranked{" "}
              {rank ? `#${rank}` : "in the top assets"} globally by market capitalisation. {meta.tagline}
            </p>
            <h3>Is {meta.name} a Good Investment?</h3>
            <p>
              Whether {meta.name} is a good investment depends entirely on your risk tolerance, investment horizon, and portfolio allocation strategy.{" "}
              {meta.name} has historically been one of the most traded digital assets in its category. However, all cryptocurrencies are highly volatile assets.{" "}
              You should never invest more than you can afford to lose completely.
            </p>
            <p>
              For a data-driven view on {meta.ticker}'s potential, check our{" "}
              <Link to={`/price-prediction/${id}`} className="text-primary hover:underline">
                {meta.name} AI price prediction
              </Link>{" "}
              which analyses momentum, on-chain data, and market sentiment daily.
            </p>
            <h3>Where is {meta.name} Available?</h3>
            <p>
              {meta.name} ({meta.ticker}) is listed on all major global exchanges including Coinbase, Binance, Kraken, Bybit, and KuCoin. It is one of the most liquid digital assets in the market, meaning you can buy and sell at any time with minimal slippage.
            </p>
            <h3>How Much Does it Cost to Buy {meta.name}?</h3>
            <p>
              You do not need to buy a whole {meta.name}. All major exchanges allow fractional purchases, meaning you can invest as little as $1 or $5.{" "}
              Exchange fees typically range from 0.1% (Binance) to 0.6% (Coinbase), plus any card payment surcharge. Use our{" "}
              <Link to="/tools/profit-calculator" className="text-primary hover:underline">profit calculator</Link> to factor fees into your expected returns.
            </p>
          </article>

        </div>
      </div>
    </Layout>
  );
}
