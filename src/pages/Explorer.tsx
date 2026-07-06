import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, X, Loader2, ExternalLink, Copy, TrendingUp, TrendingDown, Flame, Zap, BarChart3, ArrowUpDown, Clock, Globe, Sparkles, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";
import { useLiveTokenSearch, useInfiniteTrendingTokens, LiveToken } from "@/hooks/useLiveTokenSearch";
import { useInView } from "react-intersection-observer";
import { useTokenDiscovery, DiscoveryToken } from "@/hooks/useTokenDiscovery";
import { ALL_CHAINS, getChainById } from "@/lib/explorerChains";
import { SITE_URL } from "@/lib/siteConfig";
import { ExplorerSchema, ExplorerSEOContent } from "@/components/seo/index";
import { toast } from "sonner";
import { SEO } from "@/components/MainSEO";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewTab = 'trending' | 'top' | 'gainers' | 'losers' | 'new';
type TimeFilter = '5m' | '1h' | '6h' | '24h';

// ─── Formatters ───
function formatPrice(p: number): string {
  if (!p || p === 0) return '$0.00';
  if (p < 0.000001) return `$${(p ?? 0).toFixed(10)}`;
  if (p < 0.0001) return `$${(p ?? 0).toFixed(8)}`;
  if (p < 0.01) return `$${(p ?? 0).toFixed(6)}`;
  if (p < 1) return `$${(p ?? 0).toFixed(4)}`;
  if (p < 1000) return `$${(p ?? 0).toFixed(2)}`;
  return `$${(p ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
function formatCompact(n: number | undefined): string {
  if (!n || n === 0) return '$0';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${(n ?? 0).toFixed(0)}`;
}
function formatChange(c: number | undefined): string {
  if (c === undefined || c === null) return '—';
  return `${c >= 0 ? '+' : ''}${(c ?? 0).toFixed(2)}%`;
}
function formatAge(hours?: number): string {
  if (!hours) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 720)}mo`;
}
function changeClass(c?: number) { return (c || 0) > 0 ? "text-success" : (c || 0) < 0 ? "text-danger" : "text-muted-foreground"; }

// ─── Chain Sidebar ───
function ChainSidebar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return ALL_CHAINS;
    return ALL_CHAINS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <div className="w-full lg:w-52 shrink-0 border-r border-border/40 flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter chains" className="h-8 text-xs pl-7 bg-muted/50 border-border" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map(chain => (
            <button key={chain.id} onClick={() => onSelect(chain.id)}
              className={cn("w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted/80",
                selected === chain.id && "bg-primary/10 text-primary font-semibold border-l-2 border-primary")}>
              <span className="text-sm">{chain.icon}</span>
              <span className="truncate">{chain.name}</span>
              <span className="ml-auto text-[9px] text-muted-foreground uppercase">{chain.symbol}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Merged Token Type ───
interface DexToken {
  symbol: string; name: string; price: number;
  change5m?: number; change1h?: number; change6h?: number; change24h: number;
  volume24h: number; liquidity?: number; marketCap?: number; fdv?: number;
  txns24h?: number; buys24h?: number; sells24h?: number; makers?: number; ageHours?: number;
  logo?: string; contractAddress?: string; chain: string; rank?: number;
  verified?: boolean; isTrending?: boolean; momentum?: number; category?: string; coingeckoId?: string; dexId?: string;
}

function mergeTokens(discovery: DiscoveryToken[], live: LiveToken[], chain: string): DexToken[] {
  const map = new Map<string, DexToken>();
  discovery.forEach((t, i) => {
    const key = t.symbol.toLowerCase();
    map.set(key, {
      symbol: t.symbol, name: t.name, price: t.price, change24h: t.change24h, volume24h: t.volume24h, marketCap: t.marketCap,
      liquidity: t.liquidityScore && t.volume24h ? Math.round(t.liquidityScore * t.volume24h * 0.5) : undefined,
      logo: t.logo, chain, rank: t.rank || i + 1, momentum: t.momentum, category: t.category, coingeckoId: t.coingeckoId,
    });
  });
  live.forEach(t => {
    const key = t.symbol.toLowerCase();
    const existing = map.get(key);
    const liveData: Partial<DexToken> = {
      price: t.price || undefined,
      change5m: (t as any).change5m ?? (t as any).priceChange5m ?? undefined,
      change1h: (t as any).change1h ?? (t as any).priceChange1h ?? undefined,
      change6h: (t as any).change6h ?? (t as any).priceChange6h ?? undefined,
      change24h: t.change24h || undefined, volume24h: t.volume24h || undefined, liquidity: t.liquidity || undefined,
      marketCap: t.marketCap || undefined, fdv: t.fdv || undefined, txns24h: t.txns24h || undefined,
      buys24h: (t as any).buys24h || undefined, sells24h: (t as any).sells24h || undefined,
      makers: (t as any).makers || t.txns24h || undefined, ageHours: (t as any).ageHours || undefined,
      contractAddress: t.contractAddress || undefined, logo: t.logo || undefined, isTrending: t.isTrending, verified: t.verified,
      coingeckoId: (t as any).coingeckoId || undefined,
    };
    if (existing) {
      Object.entries(liveData).forEach(([k, v]) => { if (v !== undefined) (existing as any)[k] = v; });
    } else {
      map.set(key, { symbol: t.symbol, name: t.name, price: t.price, change24h: t.change24h, volume24h: t.volume24h, chain, rank: t.rank, ...liveData } as DexToken);
    }
  });
  return Array.from(map.values());
}

// ─── Main Page ───
const ExplorerPage = () => {
  const [selectedChain, setSelectedChain] = useState("solana");
  const [activeTab, setActiveTab] = useState<ViewTab>('trending');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('6h');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCol, setSortCol] = useState<string>('volume24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const chainData = getChainById(selectedChain) || ALL_CHAINS[0];

  const { data: discoveryData, isLoading: discoveryLoading } = useTokenDiscovery(selectedChain);
  const { data: trendingDataPages, isLoading: trendingLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteTrendingTokens(selectedChain, 50);
  const { data: searchResults, isLoading: searchLoading } = useLiveTokenSearch(searchQuery, selectedChain);
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => { if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage(); }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading = discoveryLoading || trendingLoading;

  const allTokens = useMemo(() => {
    const disc = discoveryData?.tokens || [];
    const live = trendingDataPages?.pages.flatMap(p => p.tokens) || [];
    return mergeTokens(disc, live, selectedChain);
  }, [discoveryData, trendingDataPages, selectedChain]);

  const tabTokens = useMemo(() => {
    let tokens = [...allTokens];
    switch (activeTab) {
      case 'trending': tokens.sort((a, b) => (b.momentum || b.volume24h) - (a.momentum || a.volume24h)); break;
      case 'top': tokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0)); break;
      case 'gainers': tokens.sort((a, b) => b.change24h - a.change24h); tokens = tokens.filter(t => t.change24h > 0); break;
      case 'losers': tokens.sort((a, b) => a.change24h - b.change24h); tokens = tokens.filter(t => t.change24h < 0); break;
      case 'new': tokens.sort((a, b) => (a.ageHours || 999) - (b.ageHours || 999)); break;
    }
    return tokens;
  }, [allTokens, activeTab]);

  const displayTokens = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults?.tokens?.length) {
      return searchResults.tokens.map((t, i) => ({
        symbol: t.symbol, name: t.name, price: t.price,
        change5m: (t as any).change5m ?? undefined, change1h: (t as any).change1h ?? undefined, change6h: (t as any).change6h ?? undefined,
        change24h: t.change24h, volume24h: t.volume24h, liquidity: t.liquidity, marketCap: t.marketCap, fdv: t.fdv,
        txns24h: t.txns24h, buys24h: (t as any).buys24h, sells24h: (t as any).sells24h, makers: (t as any).makers || t.txns24h || undefined,
        ageHours: (t as any).ageHours || undefined, contractAddress: t.contractAddress, logo: t.logo,
        chain: t.chain || selectedChain, rank: t.rank || i + 1, verified: t.verified, isTrending: t.isTrending, coingeckoId: (t as any).coingeckoId,
      } as DexToken));
    }
    return tabTokens;
  }, [searchQuery, searchResults, tabTokens, selectedChain]);

  const sortedTokens = useMemo(() => {
    const sorted = [...displayTokens];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortCol] || 0; const bVal = (b as any)[sortCol] || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  }, [displayTokens, sortCol, sortDir]);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortCol(col); setSortDir('desc'); }
  }, [sortCol]);

  const copyAddress = useCallback((addr: string) => {
    navigator.clipboard.writeText(addr); toast.success('Address copied');
  }, []);

  const getDexScreenerUrl = (token: DexToken) => {
    const chainMap: Record<string, string> = { ethereum: 'ethereum', solana: 'solana', bsc: 'bsc', polygon: 'polygon', arbitrum: 'arbitrum', base: 'base', avalanche: 'avalanche', optimism: 'optimism' };
    const c = chainMap[token.chain] || token.chain || 'ethereum';
    return token.contractAddress ? `https://dexscreener.com/${c}/${token.contractAddress}` : `https://dexscreener.com/${c}`;
  };
  const openToken = (token: DexToken) => {
    const id = token.contractAddress || token.coingeckoId;
    if (id) navigate(`/explorer/${token.chain || selectedChain}/${id}`);
  };

  const totalVolume = useMemo(() => allTokens.reduce((s, t) => s + (t.volume24h || 0), 0), [allTokens]);
  const totalTxns = useMemo(() => allTokens.reduce((s, t) => s + (t.txns24h || 0), 0), [allTokens]);
  const gainers = useMemo(() => allTokens.filter(t => t.change24h > 0).length, [allTokens]);
  const losers = useMemo(() => allTokens.filter(t => t.change24h < 0).length, [allTokens]);

  const itemListLd = useMemo(() => ({
    "@context": "https://schema.org", "@type": "ItemList",
    name: `Top ${chainData.name} tokens`,
    itemListElement: sortedTokens.slice(0, 20).map((t, i) => ({
      "@type": "ListItem", position: i + 1, name: `${t.name} (${t.symbol})`,
      url: `${SITE_URL}/explorer/${t.chain || selectedChain}/${t.contractAddress || t.coingeckoId || t.symbol.toLowerCase()}`,
    })),
  }), [sortedTokens, chainData.name, selectedChain]);

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'trending', label: 'Trending', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'top', label: 'Top', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'gainers', label: 'Gainers', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'losers', label: 'Losers', icon: <TrendingDown className="w-3.5 h-3.5" /> },
    { id: 'new', label: 'New', icon: <Zap className="w-3.5 h-3.5" /> },
  ];
  const timeFilters: TimeFilter[] = ['5m', '1h', '6h', '24h'];

  const SortHeader = ({ col, label, className }: { col: string; label: string; className?: string }) => (
    <th className={cn("px-2 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap", className)} onClick={() => toggleSort(col)}>
      <span className="flex items-center gap-0.5">{label}{sortCol === col && <ArrowUpDown className="w-3 h-3 text-primary" />}</span>
    </th>
  );

  return (
    <Layout>
      <SEO
        title="Crypto Token Explorer — Live Prices, Charts & DEX Data on Every Chain"
        description="Explore live prices, volume, liquidity, transactions and trends for every token across 30+ blockchains. Search any coin by name, symbol or contract address. Real-time data from DexScreener, CoinGecko & on-chain."
      />
      <ExplorerSchema chainCount={ALL_CHAINS.length} />
      <Helmet>
        
      </Helmet>

      {/* Page header (H1 for SEO) */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/15"><Layers className="w-5 h-5 text-primary" /></span>
                Crypto Token Explorer
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Live prices, liquidity and trading activity for <span className="text-foreground font-medium">every token across 30+ chains</span> — search any coin by name, symbol or contract address.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Globe className="w-3.5 h-3.5" /> DexScreener · CoinGecko · On-chain
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-12rem)]">
        {/* Mobile chain selector */}
        <div className="lg:hidden border-b border-border bg-card">
          <div className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-muted-foreground shrink-0">Chain:</span>
            {ALL_CHAINS.slice(0, 14).map(c => (
              <button key={c.id} onClick={() => setSelectedChain(c.id)}
                className={cn("shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                  selectedChain === c.id ? "bg-primary text-primary-foreground font-semibold" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                <span>{c.icon}</span><span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex"><ChainSidebar selected={selectedChain} onSelect={setSelectedChain} /></div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Stats bar */}
          <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 border-b border-border bg-card text-xs overflow-x-auto scrollbar-hide">
            <span className="text-muted-foreground shrink-0">VOL 24H <strong className="text-foreground">{formatCompact(totalVolume)}</strong></span>
            <span className="text-muted-foreground shrink-0 hidden sm:inline">TXNS <strong className="text-foreground">{(totalTxns ?? 0).toLocaleString()}</strong></span>
            <span className="text-muted-foreground shrink-0">TOKENS <strong className="text-foreground">{allTokens.length}</strong></span>
            <span className="text-success shrink-0">▲ {gainers}</span>
            <span className="text-danger shrink-0">▼ {losers}</span>
            <span className="text-muted-foreground shrink-0 hidden md:inline">{chainData.icon} {chainData.name}</span>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" /><span className="text-[10px] text-success">Live</span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border bg-card">
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
              {timeFilters.map(tf => (
                <button key={tf} onClick={() => setTimeFilter(tf)}
                  className={cn("px-2 py-1 rounded text-[11px] font-medium transition-colors", timeFilter === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === tab.id ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                {tab.icon}{tab.label}
              </button>
            ))}
            <div className="flex-1 min-w-[200px] ml-auto max-w-md relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search token name, symbol, or address..." className="h-8 text-xs pl-8 pr-8 bg-muted/50 border-border" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
              {searchLoading && <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary" />}
            </div>
          </div>

          {/* ─── DESKTOP TABLE ─── */}
          <div className="hidden lg:block flex-1 overflow-auto">
            <table className="w-full text-xs min-w-[1200px]">
              <thead className="sticky top-0 z-10 bg-card border-b border-border">
                <tr>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-left w-8">#</th>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-left min-w-[200px]">TOKEN</th>
                  <SortHeader col="price" label="PRICE" />
                  <SortHeader col="ageHours" label="AGE" />
                  <SortHeader col="txns24h" label="TXNS" />
                  <SortHeader col="volume24h" label="VOLUME" />
                  <SortHeader col="makers" label="MAKERS" />
                  <SortHeader col="change5m" label="5M" />
                  <SortHeader col="change1h" label="1H" />
                  <SortHeader col="change6h" label="6H" />
                  <SortHeader col="change24h" label="24H" />
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right">BUYS</th>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right">SELLS</th>
                  <SortHeader col="liquidity" label="LIQUIDITY" />
                  <SortHeader col="marketCap" label="MCAP" />
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right">FDV</th>
                  <th className="px-2 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && sortedTokens.length === 0 ? (
                  Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50"><td colSpan={17} className="px-2 py-3"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td></tr>
                  ))
                ) : sortedTokens.length === 0 ? (
                  <tr><td colSpan={17} className="text-center py-16 text-muted-foreground">No tokens found. Try searching or selecting a different chain.</td></tr>
                ) : (
                  sortedTokens.map((token, idx) => (
                    <tr key={`${token.symbol}-${idx}`} className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group" onClick={() => openToken(token)}>
                      <td className="px-2 py-2.5 text-muted-foreground font-mono">{idx + 1}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <CoinImage symbol={token.symbol} image={token.logo} size={28} className="shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">{token.symbol}</span>
                              <span className="text-[10px] text-muted-foreground">/{chainData.symbol}</span>
                              {token.name && <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden xl:inline">{token.name}</span>}
                            </div>
                            {token.contractAddress && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground/60 font-mono">{token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}</span>
                                <button onClick={e => { e.stopPropagation(); copyAddress(token.contractAddress!); }} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-2.5 h-2.5 text-muted-foreground hover:text-foreground" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 font-mono font-medium text-foreground whitespace-nowrap">{formatPrice(token.price)}</td>
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap">{formatAge(token.ageHours)}</td>
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap">{(token.txns24h || 0).toLocaleString()}</td>
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap">{formatCompact(token.volume24h)}</td>
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap">{(token.makers || 0).toLocaleString()}</td>
                      <td className={cn("px-2 py-2.5 font-mono whitespace-nowrap", changeClass(token.change5m))}>{formatChange(token.change5m)}</td>
                      <td className={cn("px-2 py-2.5 font-mono whitespace-nowrap", changeClass(token.change1h))}>{formatChange(token.change1h)}</td>
                      <td className={cn("px-2 py-2.5 font-mono whitespace-nowrap", changeClass(token.change6h))}>{formatChange(token.change6h)}</td>
                      <td className={cn("px-2 py-2.5 font-mono font-medium whitespace-nowrap", changeClass(token.change24h))}>{formatChange(token.change24h)}</td>
                      <td className="px-2 py-2.5 text-right"><span className="text-[11px] font-mono text-success">{(token.buys24h || 0).toLocaleString()}</span></td>
                      <td className="px-2 py-2.5 text-right"><span className="text-[11px] font-mono text-danger">{(token.sells24h || 0).toLocaleString()}</span></td>
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap">{formatCompact(token.liquidity)}</td>
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap">{formatCompact(token.marketCap)}</td>
                      <td className="px-2 py-2.5 font-mono text-muted-foreground whitespace-nowrap text-right">{formatCompact(token.fdv)}</td>
                      <td className="px-2 py-2.5"><button onClick={e => { e.stopPropagation(); window.open(getDexScreenerUrl(token), '_blank'); }} className="opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ─── MOBILE CARDS ─── */}
          <div className="lg:hidden flex-1 px-2 py-2 space-y-2">
            {isLoading && sortedTokens.length === 0 ? (
              Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />)
            ) : sortedTokens.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">No tokens found. Try searching or selecting a different chain.</div>
            ) : (
              sortedTokens.map((token, idx) => (
                <button key={`${token.symbol}-${idx}`} onClick={() => openToken(token)} className="w-full text-left border-b border-border/20 hover:bg-muted/20 transition-colors py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-muted-foreground font-mono w-5 shrink-0">{idx + 1}</span>
                    <CoinImage symbol={token.symbol} image={token.logo} size={32} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{token.symbol}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{token.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{formatAge(token.ageHours)} old · {(token.txns24h || 0).toLocaleString()} txns</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-semibold text-sm">{formatPrice(token.price)}</p>
                      <p className={cn("text-xs font-mono font-medium", changeClass(token.change24h))}>{formatChange(token.change24h)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2.5 border-t border-border/40 text-center">
                    {[
                      { l: '5M', v: formatChange(token.change5m), c: changeClass(token.change5m) },
                      { l: '1H', v: formatChange(token.change1h), c: changeClass(token.change1h) },
                      { l: 'VOL', v: formatCompact(token.volume24h), c: 'text-foreground' },
                      { l: 'LIQ', v: formatCompact(token.liquidity), c: 'text-foreground' },
                    ].map(s => (
                      <div key={s.l}><p className="text-[9px] text-muted-foreground uppercase">{s.l}</p><p className={cn("text-[11px] font-mono", s.c)}>{s.v}</p></div>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Infinite scroll */}
          {hasNextPage && !searchQuery && (
            <div ref={loadMoreRef} className="py-6 flex justify-center items-center">
              {isFetchingNextPage ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <span className="text-sm text-muted-foreground">Scroll for more</span>}
            </div>
          )}


          {/* SEO Footer */}
          <div className="border-t border-border bg-card px-4 py-6">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Explore every token, on every chain</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The Oracle Bull Token Explorer aggregates live market data from DexScreener, CoinGecko and on-chain sources into one
                fast, searchable view. Track real-time price, 5-minute to 24-hour momentum, trading volume, liquidity, transaction
                counts, buy/sell pressure, market cap and FDV for any token across 30+ blockchains — from Ethereum, Solana and BNB Chain
                to Base, Arbitrum, Polygon and beyond. Search by name, symbol or paste a contract address to open a full token page
                with charts, AI analysis, holder and security insights.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/scanner" className="text-xs px-3 py-1.5 rounded-lg bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors">Token Scanner</Link>
                <Link to="/predictions" className="text-xs px-3 py-1.5 rounded-lg bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors">AI Predictions</Link>
                <Link to="/sentiment" className="text-xs px-3 py-1.5 rounded-lg bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors">Market Sentiment</Link>
                <Link to="/dashboard" className="text-xs px-3 py-1.5 rounded-lg bg-primary/5 border border-border hover:border-primary/40 hover:text-primary transition-colors">Dashboard</Link>
              </div>
              <div className="mt-6"><ExplorerSEOContent /></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExplorerPage;
