import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitCompare, TrendingUp, Zap, ArrowRight, Search } from "lucide-react";

// Master coin list matching sitemap generation
const COIN_LIST = [
  { id: "bitcoin", name: "Bitcoin", ticker: "BTC" },
  { id: "ethereum", name: "Ethereum", ticker: "ETH" },
  { id: "solana", name: "Solana", ticker: "SOL" },
  { id: "binancecoin", name: "BNB", ticker: "BNB" },
  { id: "ripple", name: "XRP", ticker: "XRP" },
  { id: "toncoin", name: "Toncoin", ticker: "TON" },
  { id: "cardano", name: "Cardano", ticker: "ADA" },
  { id: "dogecoin", name: "Dogecoin", ticker: "DOGE" },
  { id: "polkadot", name: "Polkadot", ticker: "DOT" },
  { id: "chainlink", name: "Chainlink", ticker: "LINK" },
  { id: "avalanche-2", name: "Avalanche", ticker: "AVAX" },
  { id: "matic-network", name: "Polygon", ticker: "MATIC" },
  { id: "shiba-inu", name: "Shiba Inu", ticker: "SHIB" },
  { id: "litecoin", name: "Litecoin", ticker: "LTC" },
  { id: "uniswap", name: "Uniswap", ticker: "UNI" },
  { id: "cosmos", name: "Cosmos", ticker: "ATOM" },
  { id: "near", name: "NEAR", ticker: "NEAR" },
  { id: "arbitrum", name: "Arbitrum", ticker: "ARB" },
  { id: "optimism", name: "Optimism", ticker: "OP" },
  { id: "aptos", name: "Aptos", ticker: "APT" },
  { id: "sui", name: "Sui", ticker: "SUI" },
  { id: "tron", name: "TRON", ticker: "TRX" },
  { id: "stellar", name: "Stellar", ticker: "XLM" },
  { id: "pepe", name: "Pepe", ticker: "PEPE" },
  { id: "floki", name: "Floki", ticker: "FLOKI" },
  { id: "bonk", name: "Bonk", ticker: "BONK" },
  { id: "render-token", name: "Render", ticker: "RENDER" },
  { id: "fetch-ai", name: "Fetch.ai", ticker: "FET" },
  { id: "injective-protocol", name: "Injective", ticker: "INJ" },
  { id: "bittensor", name: "Bittensor", ticker: "TAO" },
  { id: "sei-network", name: "Sei", ticker: "SEI" },
  { id: "the-graph", name: "The Graph", ticker: "GRT" },
  { id: "aave", name: "Aave", ticker: "AAVE" },
  { id: "maker", name: "Maker", ticker: "MKR" },
  { id: "dogwifcoin", name: "dogwifhat", ticker: "WIF" },
  { id: "mantle", name: "Mantle", ticker: "MNT" },
  { id: "immutable-x", name: "Immutable X", ticker: "IMX" },
  { id: "axie-infinity", name: "Axie Infinity", ticker: "AXS" },
  { id: "sandbox", name: "The Sandbox", ticker: "SAND" },
  { id: "decentraland", name: "Decentraland", ticker: "MANA" },
  { id: "hedera", name: "Hedera", ticker: "HBAR" },
  { id: "kaspa", name: "Kaspa", ticker: "KAS" },
  { id: "raydium", name: "Raydium", ticker: "RAY" },
  { id: "pendle", name: "Pendle", ticker: "PENDLE" },
  { id: "curve-dao-token", name: "Curve", ticker: "CRV" },
  { id: "1inch", name: "1inch", ticker: "1INCH" },
  { id: "sushi", name: "SushiSwap", ticker: "SUSHI" },
  { id: "yearn-finance", name: "Yearn Finance", ticker: "YFI" },
];

const TRENDING_BATTLES = [
  { a: "bitcoin", b: "ethereum", label: "BTC vs ETH" },
  { a: "ethereum", b: "solana", label: "ETH vs SOL" },
  { a: "solana", b: "avalanche-2", label: "SOL vs AVAX" },
  { a: "dogecoin", b: "shiba-inu", label: "DOGE vs SHIB" },
  { a: "arbitrum", b: "optimism", label: "ARB vs OP" },
  { a: "pepe", b: "dogwifcoin", label: "PEPE vs WIF" },
  { a: "cardano", b: "polkadot", label: "ADA vs DOT" },
  { a: "near", b: "aptos", label: "NEAR vs APT" },
  { a: "chainlink", b: "the-graph", label: "LINK vs GRT" },
  { a: "uniswap", b: "sushi", label: "UNI vs SUSHI" },
  { a: "bittensor", b: "fetch-ai", label: "TAO vs FET" },
  { a: "ripple", b: "stellar", label: "XRP vs XLM" },
];

export default function CompareHub() {
  const navigate = useNavigate();
  const [coinA, setCoinA] = useState("bitcoin");
  const [coinB, setCoinB] = useState("ethereum");
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");

  const filteredA = COIN_LIST.filter(c =>
    c.name.toLowerCase().includes(searchA.toLowerCase()) ||
    c.ticker.toLowerCase().includes(searchA.toLowerCase())
  );
  const filteredB = COIN_LIST.filter(c =>
    c.name.toLowerCase().includes(searchB.toLowerCase()) ||
    c.ticker.toLowerCase().includes(searchB.toLowerCase())
  );

  const handleCompare = () => {
    navigate(`/compare/${coinA}-vs-${coinB}`);
  };

  return (
    <Layout>
      <Helmet>
        <title>Crypto Coin Comparison Tool | Oracle Bull</title>
        <meta name="description" content="Compare any two cryptocurrencies side-by-side. AI-powered analysis of Bitcoin vs Ethereum, Solana vs Avalanche, and 1,700+ coin pairs with live data." />
        <link rel="canonical" href="https://oraclebull.com/compare" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Crypto Coin Comparison Tool | Oracle Bull",
          "description": "AI-powered side-by-side comparison of any two cryptocurrencies with live price data, market cap, and AI verdict.",
          "url": "https://oraclebull.com/compare"
        })}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <GitCompare className="w-4 h-4" />
              <span>AI COIN COMPARISON ENGINE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 glow-text">
              Which Coin Wins?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop debating. Our AI analyses live price data, market cap, momentum, and on-chain signals to deliver a definitive verdict on any two coins.
            </p>
          </div>

          {/* Comparison Selector */}
          <div className="holo-card p-6 md:p-8 mb-10">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">

              {/* Coin A Selector */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">First Coin</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search coin..."
                    value={searchA}
                    onChange={e => setSearchA(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="h-40 overflow-y-auto rounded-lg border border-border bg-background/50 divide-y divide-border/50">
                  {filteredA.map(coin => (
                    <button
                      key={coin.id}
                      onClick={() => { setCoinA(coin.id); setSearchA(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm ${coinA === coin.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'}`}
                    >
                      <span className="text-xs text-muted-foreground w-12 font-mono">{coin.ticker}</span>
                      {coin.name}
                    </button>
                  ))}
                </div>
                <div className="text-center font-bold text-primary text-lg">
                  {COIN_LIST.find(c => c.id === coinA)?.name}
                </div>
              </div>

              {/* VS divider */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="font-black text-primary text-sm">VS</span>
                </div>
              </div>

              {/* Coin B Selector */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Second Coin</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search coin..."
                    value={searchB}
                    onChange={e => setSearchB(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="h-40 overflow-y-auto rounded-lg border border-border bg-background/50 divide-y divide-border/50">
                  {filteredB.map(coin => (
                    <button
                      key={coin.id}
                      onClick={() => { setCoinB(coin.id); setSearchB(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors text-sm ${coinB === coin.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'}`}
                    >
                      <span className="text-xs text-muted-foreground w-12 font-mono">{coin.ticker}</span>
                      {coin.name}
                    </button>
                  ))}
                </div>
                <div className="text-center font-bold text-primary text-lg">
                  {COIN_LIST.find(c => c.id === coinB)?.name}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCompare}
                disabled={coinA === coinB}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Zap className="w-5 h-5" />
                Compare with AI
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trending Battles */}
          <div>
            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending Battles
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TRENDING_BATTLES.map(battle => (
                <button
                  key={`${battle.a}-${battle.b}`}
                  onClick={() => navigate(`/compare/${battle.a}-vs-${battle.b}`)}
                  className="holo-card px-4 py-3 text-sm font-semibold text-center hover:border-primary/50 hover:text-primary transition-all hover:scale-105 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {battle.label}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
