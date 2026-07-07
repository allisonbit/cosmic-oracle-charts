import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GitCompare, TrendingUp, Zap, ArrowRight, Search, X, Loader2, Globe, Sparkles } from "lucide-react";
import { CoinImage } from "@/components/ui/CoinImage";
import { useLiveTokenSearch, type LiveToken } from "@/hooks/useLiveTokenSearch";
import { tokenToSlug, useCoinList, searchCoinList } from "@/hooks/useCompareToken";
import { SITE_URL } from "@/lib/siteConfig";
import { cn } from "@/lib/utils";

// Picked token (subset we need for slug + display)
interface Picked {
  symbol: string; name: string; logo?: string; chain?: string; contractAddress?: string; coingeckoId?: string;
}

const POPULAR: Picked[] = [
  { coingeckoId: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { coingeckoId: "ethereum", symbol: "ETH", name: "Ethereum" },
  { coingeckoId: "solana", symbol: "SOL", name: "Solana" },
  { coingeckoId: "binancecoin", symbol: "BNB", name: "BNB" },
  { coingeckoId: "ripple", symbol: "XRP", name: "XRP" },
  { coingeckoId: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { coingeckoId: "cardano", symbol: "ADA", name: "Cardano" },
  { coingeckoId: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { coingeckoId: "chainlink", symbol: "LINK", name: "Chainlink" },
  { coingeckoId: "the-open-network", symbol: "TON", name: "Toncoin" },
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

function TokenPicker({ label, selected, onSelect }: { label: string; selected: Picked | null; onSelect: (t: Picked | null) => void }) {
  const [q, setQ] = useState("");
  const { data: live, isLoading } = useLiveTokenSearch(q, "all");
  const { data: coinList = [] } = useCoinList();

  // Merge live DEX/contract results (have logos, chain, price) with instant
  // matches from the full ~17,000-coin CoinGecko catalog.
  const results = useMemo<Picked[]>(() => {
    if (q.trim().length < 2) return [];
    const liveTokens = (live?.tokens || []).slice(0, 12);
    const seen = new Set(liveTokens.map((t) => t.symbol?.toLowerCase()));
    const merged: Picked[] = liveTokens.map((t: LiveToken) => ({
      symbol: t.symbol, name: t.name, logo: t.logo, chain: t.chain, contractAddress: t.contractAddress, coingeckoId: (t as any).coingeckoId,
    }));
    for (const c of searchCoinList(coinList, q, 25)) {
      if (seen.has(c.symbol.toLowerCase())) continue;
      seen.add(c.symbol.toLowerCase());
      merged.push({ symbol: c.symbol.toUpperCase(), name: c.name, coingeckoId: c.id });
      if (merged.length >= 24) break;
    }
    return merged;
  }, [q, live, coinList]);

  const pick = (t: Picked) => {
    onSelect({ symbol: t.symbol, name: t.name, logo: t.logo, chain: t.chain, contractAddress: t.contractAddress, coingeckoId: t.coingeckoId });
    setQ("");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</label>

      {selected ? (
        <div className="flex items-center gap-3 p-3 border-l-2 border-primary">
          <CoinImage symbol={selected.symbol} image={selected.logo} size={36} />
          <div className="min-w-0 flex-1">
            <div className="font-bold truncate">{selected.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{selected.symbol}{selected.chain ? ` · ${selected.chain}` : ""}</div>
          </div>
          <button onClick={() => onSelect(null)} className="p-1.5 hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search 17,000+ tokens or paste contract…" value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full bg-background/50 border border-border pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-primary" />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
          </div>
          <div className="h-52 overflow-y-auto border border-border bg-background/50">
            {q.length >= 2 ? (
              results.length > 0 ? results.map((t, i) => (
                <button key={`${t.symbol}-${t.coingeckoId || t.chain}-${i}`} onClick={() => pick(t)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-border/40 last:border-0">
                  <CoinImage symbol={t.symbol} image={t.logo} size={26} />
                  <div className="min-w-0 flex-1"><div className="text-sm font-semibold truncate">{t.symbol} <span className="text-muted-foreground font-normal text-xs">{t.name}</span></div></div>
                  {t.chain && <span className="text-[10px] text-muted-foreground capitalize shrink-0">{t.chain}</span>}
                </button>
              )) : !isLoading && <div className="p-4 text-center text-xs text-muted-foreground">No tokens found for “{q}”.</div>
            ) : (
              <div className="p-2">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1">Popular</div>
                {POPULAR.map((c) => (
                  <button key={c.coingeckoId} onClick={() => pick(c)} className="w-full flex items-center gap-2.5 px-2 py-2 text-left hover:bg-muted transition-colors">
                    <CoinImage symbol={c.symbol} size={24} />
                    <span className="text-sm font-medium">{c.name}</span><span className="text-xs text-muted-foreground font-mono ml-auto">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function CompareHub() {
  const navigate = useNavigate();
  const [coinA, setCoinA] = useState<Picked | null>(POPULAR[0]);
  const [coinB, setCoinB] = useState<Picked | null>(POPULAR[1]);

  const canCompare = coinA && coinB && tokenToSlug(coinA) !== tokenToSlug(coinB);
  const handleCompare = () => {
    if (!coinA || !coinB) return;
    navigate(`/compare/${tokenToSlug(coinA)}-vs-${tokenToSlug(coinB)}`);
  };

  return (
    <Layout>
      <Helmet>
        <title>Compare Cryptocurrencies Side by Side | Oracle Bull</title>
        <meta name="description" content="Compare any of 17,000+ cryptocurrencies side-by-side. Search by name, symbol or contract address across every chain — live price, market cap, volume, momentum & an AI verdict on which is the better buy." />
        
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <GitCompare className="w-4 h-4" /><span>COMPARE ANY TOKEN · ANY CHAIN</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Compare Any Two Cryptocurrencies</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search <span className="text-foreground font-medium">17,000+ tokens</span> by name, symbol or contract address — then get a live side-by-side breakdown and an AI verdict on which wins.
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><Globe className="w-3.5 h-3.5" /> Powered by DexScreener · CoinGecko · on-chain</div>
          </div>

          {/* Picker */}
          <div className="border-t border-border/30 pt-6 md:pt-8 mb-10">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-start">
              <TokenPicker label="First Token" selected={coinA} onSelect={setCoinA} />
              <div className="hidden md:flex flex-col items-center justify-center pt-8">
                <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center"><span className="font-black text-primary text-sm">VS</span></div>
              </div>
              <TokenPicker label="Second Token" selected={coinB} onSelect={setCoinB} />
            </div>
            <div className="mt-6 flex justify-center">
              <button onClick={handleCompare} disabled={!canCompare}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Zap className="w-5 h-5" /> Compare <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trending battles */}
          <div className="mb-12">
            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Trending Battles</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TRENDING_BATTLES.map((b) => (
                <Link key={`${b.a}-${b.b}`} to={`/compare/${b.a}-vs-${b.b}`}
                  className="border border-border/40 px-4 py-3 text-sm font-semibold text-center hover:text-primary hover:border-primary/40 transition-all group">
                  <span className="flex items-center justify-center gap-2">{b.label}<ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
                </Link>
              ))}
            </div>
          </div>

          {/* SEO content */}
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Compare any cryptocurrency, on any chain</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most comparison tools only cover a handful of major coins. Oracle Bull lets you compare <strong>any token in the world</strong> —
              type a name or symbol, or paste a contract address from Ethereum, Solana, BNB Chain, Base, Arbitrum, Polygon and beyond. We pull
              live data from DexScreener, CoinGecko and on-chain sources, then put the two tokens head-to-head across price, market cap, 24-hour
              and weekly momentum, trading volume and liquidity — and finish with an AI verdict on which looks stronger right now.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pick two tokens above to start, jump into a trending battle, or open the <Link to="/explorer" className="text-primary">Token Explorer</Link> and
              <Link to="/strength-meter" className="text-primary"> Strength Meter</Link> for deeper analysis. Comparisons are for research only and are not financial advice.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
