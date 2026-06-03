import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, TrendingDown, ArrowRight, GitCompare, ShieldCheck, Zap, BarChart3, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Coin metadata for display
const COIN_META: Record<string, { name: string; ticker: string; color: string }> = {
  "bitcoin": { name: "Bitcoin", ticker: "BTC", color: "#f7931a" },
  "ethereum": { name: "Ethereum", ticker: "ETH", color: "#627eea" },
  "solana": { name: "Solana", ticker: "SOL", color: "#9945ff" },
  "binancecoin": { name: "BNB", ticker: "BNB", color: "#f3ba2f" },
  "ripple": { name: "XRP", ticker: "XRP", color: "#00aae4" },
  "toncoin": { name: "Toncoin", ticker: "TON", color: "#0088cc" },
  "cardano": { name: "Cardano", ticker: "ADA", color: "#3cc8c8" },
  "dogecoin": { name: "Dogecoin", ticker: "DOGE", color: "#c3a634" },
  "polkadot": { name: "Polkadot", ticker: "DOT", color: "#e6007a" },
  "chainlink": { name: "Chainlink", ticker: "LINK", color: "#375bd2" },
  "avalanche-2": { name: "Avalanche", ticker: "AVAX", color: "#e84142" },
  "matic-network": { name: "Polygon", ticker: "MATIC", color: "#8247e5" },
  "shiba-inu": { name: "Shiba Inu", ticker: "SHIB", color: "#e84040" },
  "litecoin": { name: "Litecoin", ticker: "LTC", color: "#bfbbbb" },
  "uniswap": { name: "Uniswap", ticker: "UNI", color: "#ff007a" },
  "cosmos": { name: "Cosmos", ticker: "ATOM", color: "#2e3148" },
  "near": { name: "NEAR", ticker: "NEAR", color: "#00ec97" },
  "arbitrum": { name: "Arbitrum", ticker: "ARB", color: "#28a0f0" },
  "optimism": { name: "Optimism", ticker: "OP", color: "#ff0420" },
  "aptos": { name: "Aptos", ticker: "APT", color: "#00c0ff" },
  "sui": { name: "Sui", ticker: "SUI", color: "#6fbcf0" },
  "tron": { name: "TRON", ticker: "TRX", color: "#ef0027" },
  "stellar": { name: "Stellar", ticker: "XLM", color: "#14b6e7" },
  "pepe": { name: "Pepe", ticker: "PEPE", color: "#4caf50" },
  "floki": { name: "Floki", ticker: "FLOKI", color: "#d4a12c" },
  "bonk": { name: "Bonk", ticker: "BONK", color: "#ff8c00" },
  "render-token": { name: "Render", ticker: "RENDER", color: "#c81010" },
  "fetch-ai": { name: "Fetch.ai", ticker: "FET", color: "#1eb4fb" },
  "injective-protocol": { name: "Injective", ticker: "INJ", color: "#00f2fe" },
  "bittensor": { name: "Bittensor", ticker: "TAO", color: "#e6c87e" },
  "sei-network": { name: "Sei", ticker: "SEI", color: "#9d2735" },
  "the-graph": { name: "The Graph", ticker: "GRT", color: "#6747ed" },
  "aave": { name: "Aave", ticker: "AAVE", color: "#b6509e" },
  "maker": { name: "Maker", ticker: "MKR", color: "#1aab9b" },
  "dogwifcoin": { name: "dogwifhat", ticker: "WIF", color: "#ce8d3e" },
  "mantle": { name: "Mantle", ticker: "MNT", color: "#7ce3cb" },
  "immutable-x": { name: "Immutable X", ticker: "IMX", color: "#17b5cb" },
  "axie-infinity": { name: "Axie Infinity", ticker: "AXS", color: "#0055d5" },
  "sandbox": { name: "The Sandbox", ticker: "SAND", color: "#04d0e5" },
  "decentraland": { name: "Decentraland", ticker: "MANA", color: "#fc4e41" },
  "hedera": { name: "Hedera", ticker: "HBAR", color: "#00acaf" },
  "kaspa": { name: "Kaspa", ticker: "KAS", color: "#49eacb" },
  "raydium": { name: "Raydium", ticker: "RAY", color: "#5ac4be" },
  "pendle": { name: "Pendle", ticker: "PENDLE", color: "#4b7cf3" },
  "curve-dao-token": { name: "Curve", ticker: "CRV", color: "#2b9b55" },
  "1inch": { name: "1inch", ticker: "1INCH", color: "#1b314f" },
  "sushi": { name: "SushiSwap", ticker: "SUSHI", color: "#fa52a0" },
  "yearn-finance": { name: "Yearn Finance", ticker: "YFI", color: "#006ae3" },
};

const formatNum = (n: number) => {
  if (!n) return "N/A";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};

const formatPct = (n: number) => n >= 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`;

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d_in_currency: { usd: number };
    price_change_percentage_30d_in_currency: { usd: number };
    circulating_supply: number;
    total_supply: number;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    market_cap_rank: number;
  };
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
}

function useCoinData(id: string) {
  return useQuery<CoinData>({
    queryKey: ["compare-coin", id],
    queryFn: async () => {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

function ScoreBar({ label, a, b, higherIsBetter = true }: { label: string; a: number; b: number; higherIsBetter?: boolean }) {
  const maxVal = Math.max(Math.abs(a), Math.abs(b));
  const pctA = maxVal ? (Math.abs(a) / maxVal) * 100 : 50;
  const pctB = maxVal ? (Math.abs(b) / maxVal) * 100 : 50;
  const aWins = higherIsBetter ? a > b : a < b;
  const bWins = higherIsBetter ? b > a : b < a;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-b border-border/50 last:border-none">
      {/* A side */}
      <div className="flex justify-end">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pctA}%`, background: aWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: aWins ? 1 : 0.4 }}
        />
      </div>
      {/* Label */}
      <div className="text-center text-xs text-muted-foreground font-medium min-w-28 px-2">{label}</div>
      {/* B side */}
      <div className="flex justify-start">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pctB}%`, background: bWins ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))", opacity: bWins ? 1 : 0.4 }}
        />
      </div>
    </div>
  );
}

function CoinColumn({ data, meta, isLoading }: { data?: CoinData; meta?: { name: string; ticker: string; color: string }; isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const price24h = data.market_data.price_change_percentage_24h;
  const price7d = data.market_data.price_change_percentage_7d_in_currency?.usd;
  const price30d = data.market_data.price_change_percentage_30d_in_currency?.usd;

  return (
    <div className="space-y-3">
      <div className="text-center p-4 rounded-xl bg-background/50 border border-border">
        <img src={data.image.large} alt={data.name} className="w-14 h-14 mx-auto mb-2" />
        <div className="font-bold font-display text-xl">{data.name}</div>
        <div className="text-xs text-muted-foreground">{data.symbol.toUpperCase()}</div>
        <div className="text-2xl font-bold mt-1">${data.market_data.current_price.usd.toLocaleString()}</div>
        <div className={cn("text-sm font-semibold mt-1", price24h >= 0 ? "text-success" : "text-danger")}>
          {price24h >= 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
          {formatPct(price24h)} (24h)
        </div>
      </div>

      {[
        { label: "Market Cap", value: formatNum(data.market_data.market_cap.usd) },
        { label: "Rank", value: `#${data.market_data.market_cap_rank}` },
        { label: "24h Volume", value: formatNum(data.market_data.total_volume.usd) },
        { label: "7D Change", value: formatPct(price7d ?? 0), positive: (price7d ?? 0) >= 0 },
        { label: "30D Change", value: formatPct(price30d ?? 0), positive: (price30d ?? 0) >= 0 },
        { label: "ATH", value: formatNum(data.market_data.ath.usd) },
        { label: "From ATH", value: `${data.market_data.ath_change_percentage.usd.toFixed(1)}%`, positive: false },
        { label: "Community Score", value: data.community_score?.toFixed(1) ?? "N/A" },
        { label: "Liquidity Score", value: data.liquidity_score?.toFixed(1) ?? "N/A" },
        { label: "CG Score", value: data.coingecko_score?.toFixed(1) ?? "N/A" },
      ].map(({ label, value, positive }) => (
        <div key={label} className="px-3 py-2.5 rounded-lg bg-background/50 border border-border text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{label}</div>
          <div className={cn("font-bold text-sm", positive !== undefined ? (positive ? "text-success" : "text-danger") : "text-foreground")}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function AIVerdict({ coinAData, coinBData, metaA, metaB }: { coinAData: CoinData; coinBData: CoinData; metaA: { name: string; ticker: string }; metaB: { name: string; ticker: string } }) {
  // Scoring algorithm
  let scoreA = 0;
  let scoreB = 0;

  const mktA = coinAData.market_data;
  const mktB = coinBData.market_data;

  // Market cap rank (lower = better)
  if (mktA.market_cap_rank < mktB.market_cap_rank) scoreA += 2; else scoreB += 2;
  // 24h momentum
  if (mktA.price_change_percentage_24h > mktB.price_change_percentage_24h) scoreA += 2; else scoreB += 2;
  // 7d momentum
  const p7a = mktA.price_change_percentage_7d_in_currency?.usd ?? 0;
  const p7b = mktB.price_change_percentage_7d_in_currency?.usd ?? 0;
  if (p7a > p7b) scoreA += 2; else scoreB += 2;
  // 30d momentum
  const p30a = mktA.price_change_percentage_30d_in_currency?.usd ?? 0;
  const p30b = mktB.price_change_percentage_30d_in_currency?.usd ?? 0;
  if (p30a > p30b) scoreA += 1; else scoreB += 1;
  // Volume
  if (mktA.total_volume.usd > mktB.total_volume.usd) scoreA += 1; else scoreB += 1;
  // Community
  if ((coinAData.community_score ?? 0) > (coinBData.community_score ?? 0)) scoreA += 1; else scoreB += 1;
  // Liquidity
  if ((coinAData.liquidity_score ?? 0) > (coinBData.liquidity_score ?? 0)) scoreA += 1; else scoreB += 1;

  const totalScore = scoreA + scoreB;
  const pctA = Math.round((scoreA / totalScore) * 100);
  const pctB = Math.round((scoreB / totalScore) * 100);
  const winner = scoreA >= scoreB ? metaA : metaB;
  const winnerScore = scoreA >= scoreB ? pctA : pctB;

  const momentum24A = mktA.price_change_percentage_24h >= 0;
  const momentum24B = mktB.price_change_percentage_24h >= 0;

  return (
    <div className="holo-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-bold font-display text-xl text-foreground">Oracle AI Verdict</h2>
          <p className="text-xs text-muted-foreground">Based on live market data, momentum & on-chain signals</p>
        </div>
      </div>

      {/* Winner Banner */}
      <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 mb-6 text-center">
        <div className="text-xs text-primary font-bold uppercase tracking-widest mb-1">AI Recommends</div>
        <div className="text-3xl font-display font-black text-foreground mb-1">{winner.name}</div>
        <div className="text-sm text-muted-foreground">AI Confidence Score: <span className="text-primary font-bold">{winnerScore}%</span></div>
      </div>

      {/* Score Bars */}
      <div className="mb-6">
        <div className="grid grid-cols-[1fr_auto_1fr] text-xs text-muted-foreground font-bold mb-3 px-2">
          <div className="text-right">{metaA.ticker}</div>
          <div className="text-center min-w-28 px-2">METRIC</div>
          <div className="text-left">{metaB.ticker}</div>
        </div>
        <ScoreBar label="Market Cap Rank" a={mktB.market_cap_rank} b={mktA.market_cap_rank} higherIsBetter={false} />
        <ScoreBar label="24h Momentum" a={mktA.price_change_percentage_24h} b={mktB.price_change_percentage_24h} />
        <ScoreBar label="7D Performance" a={p7a} b={p7b} />
        <ScoreBar label="30D Performance" a={p30a} b={p30b} />
        <ScoreBar label="24h Volume" a={mktA.total_volume.usd} b={mktB.total_volume.usd} />
        <ScoreBar label="Community Score" a={coinAData.community_score ?? 0} b={coinBData.community_score ?? 0} />
        <ScoreBar label="Liquidity Score" a={coinAData.liquidity_score ?? 0} b={coinBData.liquidity_score ?? 0} />
      </div>

      {/* AI Write-up */}
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          <strong className="text-foreground">{metaA.name} ({metaA.ticker})</strong> is currently trading at{" "}
          <strong className="text-foreground">${mktA.current_price.usd.toLocaleString()}</strong> with a{" "}
          <span className={momentum24A ? "text-success" : "text-danger"}>{formatPct(mktA.price_change_percentage_24h)} 24-hour performance</span>.{" "}
          At a market cap rank of <strong className="text-foreground">#{mktA.market_cap_rank}</strong>, it commands{" "}
          <strong className="text-foreground">{formatNum(mktA.market_cap.usd)}</strong> in market capitalization.
        </p>
        <p>
          <strong className="text-foreground">{metaB.name} ({metaB.ticker})</strong> is trading at{" "}
          <strong className="text-foreground">${mktB.current_price.usd.toLocaleString()}</strong> with{" "}
          <span className={momentum24B ? "text-success" : "text-danger"}>{formatPct(mktB.price_change_percentage_24h)} in 24 hours</span>.{" "}
          Ranked <strong className="text-foreground">#{mktB.market_cap_rank}</strong> globally, it has{" "}
          <strong className="text-foreground">{formatNum(mktB.market_cap.usd)}</strong> in total market cap.
        </p>
        <p>
          Across 7 weighted indicators - covering momentum, liquidity, community strength, and volume -{" "}
          <strong className="text-foreground">{winner.name}</strong> scores higher with a{" "}
          <strong className="text-primary">{winnerScore}% AI confidence rating</strong>.{" "}
          {scoreA === scoreB
            ? "Both assets are evenly matched at this moment in time. Monitor our live signals for a directional break."
            : `The momentum and market structure currently favour ${winner.name} as the stronger short-term play.`}
        </p>
      </div>

      {/* Cross-Promotion */}
      <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3">
        <Link to={`/price-prediction/${coinAData.id}`} className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
          <BarChart3 className="w-4 h-4" /> {metaA.ticker} AI Prediction
        </Link>
        <Link to={`/price-prediction/${coinBData.id}`} className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
          <BarChart3 className="w-4 h-4" /> {metaB.ticker} AI Prediction
        </Link>
        <Link to="/sentiment" className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-colors">
          <Activity className="w-4 h-4" /> Market Sentiment
        </Link>
        <Link to="/tools/profit-calculator" className="inline-flex items-center gap-2 text-sm bg-primary/10 border border-primary/30 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors">
          <Zap className="w-4 h-4" /> Calculate Your Profit <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function CoinComparison() {
  const { coins } = useParams<{ coins: string }>();

  // Parse "bitcoin-vs-ethereum" pattern
  const vsIndex = coins?.indexOf("-vs-") ?? -1;
  const idA = vsIndex !== -1 ? coins!.substring(0, vsIndex) : "";
  const idB = vsIndex !== -1 ? coins!.substring(vsIndex + 4) : "";

  const metaA = COIN_META[idA] ?? { name: idA, ticker: idA.toUpperCase(), color: "#888" };
  const metaB = COIN_META[idB] ?? { name: idB, ticker: idB.toUpperCase(), color: "#888" };

  const { data: dataA, isLoading: loadingA } = useCoinData(idA);
  const { data: dataB, isLoading: loadingB } = useCoinData(idB);

  const pageTitle = `${metaA.name} (${metaA.ticker}) vs ${metaB.name} (${metaB.ticker}) | Which is Better? | Oracle Bull`;
  const pageDesc = `AI-powered comparison of ${metaA.name} vs ${metaB.name}. Live price, market cap, volume, momentum and an AI verdict on which crypto is the better investment today.`;
  const canonicalUrl = `https://oraclebull.com/compare/${idA}-vs-${idB}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": pageTitle,
    "description": pageDesc,
    "url": canonicalUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://oraclebull.com" },
        { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://oraclebull.com/compare" },
        { "@type": "ListItem", "position": 3, "name": `${metaA.ticker} vs ${metaB.ticker}`, "item": canonicalUrl }
      ]
    }
  };

  if (!idA || !idB) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Invalid Comparison</h1>
          <p className="text-muted-foreground mb-6">Please use the format: /compare/bitcoin-vs-ethereum</p>
          <Link to="/compare" className="text-primary hover:underline">← Back to Compare Hub</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <div className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/compare" className="hover:text-primary">Compare</Link>
            <span>/</span>
            <span className="text-foreground">{metaA.ticker} vs {metaB.ticker}</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <GitCompare className="w-4 h-4" />
              <span>LIVE AI COMPARISON</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 glow-text">
              {metaA.name} vs {metaB.name}
            </h1>
            <p className="text-muted-foreground">
              Which is the better crypto investment today? Our AI analyses live data across 7 key metrics and delivers a verdict.
            </p>
          </div>

          {/* Side-by-side columns */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 mb-8">
            <CoinColumn data={dataA} meta={metaA} isLoading={loadingA} />
            {/* VS divider */}
            <div className="hidden md:flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center sticky top-24">
                <span className="font-black text-primary text-xs">VS</span>
              </div>
            </div>
            <CoinColumn data={dataB} meta={metaB} isLoading={loadingB} />
          </div>

          {/* AI Verdict */}
          {dataA && dataB && (
            <AIVerdict coinAData={dataA} coinBData={dataB} metaA={metaA} metaB={metaB} />
          )}

          {/* SEO Content */}
          <div className="mt-16 prose prose-invert max-w-none">
            <h2>How to Compare {metaA.name} and {metaB.name}</h2>
            <p>
              When choosing between <strong>{metaA.name} ({metaA.ticker})</strong> and <strong>{metaB.name} ({metaB.ticker})</strong>,
              investors should evaluate several key factors: market capitalization and rank, trading volume and liquidity,
              short-term and long-term price momentum, community strength, and underlying project fundamentals.
            </p>
            <h3>Market Cap & Rank</h3>
            <p>
              Market capitalization is the best measure of a coin's size and relative stability. A higher market cap
              generally means lower volatility and more institutional participation. Use our{" "}
              <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link> to dive deeper into
              on-chain fundamentals for both assets.
            </p>
            <h3>Momentum & Timing</h3>
            <p>
              24-hour and 7-day price performance tells you where smart money is flowing right now. Our{" "}
              <Link to="/strength-meter" className="text-primary hover:underline">Market Strength Meter</Link>{" "}
              tracks real-time relative strength across 100+ coins to help you identify which asset has the better entry timing.
            </p>
            <h3>Calculate Your Returns</h3>
            <p>
              Before investing, always calculate your potential profit and downside risk. Use our{" "}
              <Link to="/tools/profit-calculator" className="text-primary hover:underline">Profit Calculator</Link> to
              see exactly how much you'll make if either coin hits your price target.
            </p>
            <h3>AI Price Predictions</h3>
            <p>
              For a forward-looking view, check our dedicated AI price prediction pages for{" "}
              <Link to={`/price-prediction/${idA}`} className="text-primary hover:underline">{metaA.name} price prediction</Link>{" "}
              and <Link to={`/price-prediction/${idB}`} className="text-primary hover:underline">{metaB.name} price prediction</Link>.
            </p>
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link to="/compare" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ShieldCheck className="w-4 h-4" />
              Compare other coins →
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
