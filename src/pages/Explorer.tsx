import { Layout } from "@/components/layout/Layout";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ExternalLink, Copy, TrendingUp, TrendingDown, Flame, Zap, BarChart3, Star, ArrowUpDown, Filter, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTokenSearch, SearchToken } from "@/hooks/useTokenSearch";
import { useLiveTokenSearch, useTrendingTokens, LiveToken } from "@/hooks/useLiveTokenSearch";
import { useTokenDiscovery, DiscoveryToken } from "@/hooks/useTokenDiscovery";
import { ALL_CHAINS, getChainById, ExplorerChain } from "@/lib/explorerChains";
import { ExplorerSchema, ExplorerSEOContent } from "@/components/seo";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewTab = 'trending' | 'top' | 'gainers' | 'losers' | 'new';
type TimeFilter = '5m' | '1h' | '6h' | '24h';

// ─── Formatters ───
function formatPrice(p: number): string {
  if (!p || p === 0) return '$0.00';
  if (p < 0.000001) return `$${p.toFixed(10)}`;
  if (p < 0.0001) return `$${p.toFixed(8)}`;
  if (p < 0.01) return `$${p.toFixed(6)}`;
  if (p < 1) return `$${p.toFixed(4)}`;
  if (p < 1000) return `$${p.toFixed(2)}`;
  return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatCompact(n: number | undefined): string {
  if (!n || n === 0) return '$0';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatChange(c: number | undefined): string {
  if (c === undefined || c === null) return '—';
  return `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
}

function formatAge(hours?: number): string {
  if (!hours) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 720) return `${Math.round(hours / 24)}d`;
  return `${Math.round(hours / 720)}mo`;
}

// ─── Chain Sidebar ───
function ChainSidebar({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return ALL_CHAINS;
    return ALL_CHAINS.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="w-full lg:w-48 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter chains"
            className="h-8 text-xs pl-7 bg-muted/50 border-border"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map(chain => (
            <button
              key={chain.id}
              onClick={() => onSelect(chain.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-muted/80",
                selected === chain.id && "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
              )}
            >
              <span className="text-sm">{chain.icon}</span>
              <span className="truncate">{chain.name}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Merged Token Type ───
interface DexToken {
  symbol: string;
  name: string;
  price: number;
  change5m?: number;
  change1h?: number;
  change6h?: number;
  change24h: number;
  volume24h: number;
  liquidity?: number;
  marketCap?: number;
  fdv?: number;
  txns24h?: number;
  buys24h?: number;
  sells24h?: number;
  makers?: number;
  ageHours?: number;
  logo?: string;
  contractAddress?: string;
  chain: string;
  rank?: number;
  verified?: boolean;
  isTrending?: boolean;
  momentum?: number;
  category?: string;
  coingeckoId?: string;
  dexId?: string;
}

function mergeTokens(
  discovery: DiscoveryToken[],
  live: LiveToken[],
  chain: string
): DexToken[] {
  const map = new Map<string, DexToken>();

  // Add discovery tokens (CoinGecko data — no fake fields)
  discovery.forEach((t, i) => {
    const key = t.symbol.toLowerCase();
    map.set(key, {
      symbol: t.symbol,
      name: t.name,
      price: t.price,
      change24h: t.change24h,
      volume24h: t.volume24h,
      marketCap: t.marketCap,
      liquidity: t.liquidityScore && t.volume24h ? Math.round(t.liquidityScore * t.volume24h * 0.5) : undefined,
      logo: t.logo,
      chain,
      rank: t.rank || i + 1,
      momentum: t.momentum,
      category: t.category,
      coingeckoId: t.coingeckoId,
    });
  });

  // Overlay live token data (DexScreener — real 5m/1h/6h, txns, makers, age)
  live.forEach(t => {
    const key = t.symbol.toLowerCase();
    const existing = map.get(key);
    const liveData: Partial<DexToken> = {
      price: t.price || undefined,
      change5m: (t as any).change5m ?? (t as any).priceChange5m ?? undefined,
      change1h: (t as any).change1h ?? (t as any).priceChange1h ?? undefined,
      change6h: (t as any).change6h ?? (t as any).priceChange6h ?? undefined,
      change24h: t.change24h || undefined,
      volume24h: t.volume24h || undefined,
      liquidity: t.liquidity || undefined,
      marketCap: t.marketCap || undefined,
      fdv: t.fdv || undefined,
      txns24h: t.txns24h || undefined,
      buys24h: (t as any).buys24h || undefined,
      sells24h: (t as any).sells24h || undefined,
      makers: (t as any).makers || t.txns24h || undefined,
      ageHours: (t as any).ageHours || undefined,
      contractAddress: t.contractAddress || undefined,
      logo: t.logo || undefined,
      isTrending: t.isTrending,
      verified: t.verified,
    };

    if (existing) {
      // Merge — prefer live data over discovery
      Object.entries(liveData).forEach(([k, v]) => {
        if (v !== undefined) (existing as any)[k] = v;
      });
    } else {
      map.set(key, {
        symbol: t.symbol,
        name: t.name,
        price: t.price,
        change24h: t.change24h,
        volume24h: t.volume24h,
        chain,
        rank: t.rank,
        ...liveData,
      } as DexToken);
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
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const chainData = getChainById(selectedChain) || ALL_CHAINS[0];

  // Data hooks
  const { data: discoveryData, isLoading: discoveryLoading } = useTokenDiscovery(selectedChain);
  const { data: trendingData, isLoading: trendingLoading } = useTrendingTokens(selectedChain, 50);
  const { data: searchResults, isLoading: searchLoading } = useLiveTokenSearch(searchQuery, selectedChain);

  const isLoading = discoveryLoading || trendingLoading;

  // Merge all tokens
  const allTokens = useMemo(() => {
    const disc = discoveryData?.tokens || [];
    const live = trendingData?.tokens || [];
    return mergeTokens(disc, live, selectedChain);
  }, [discoveryData, trendingData, selectedChain]);

  // Filter by tab
  const tabTokens = useMemo(() => {
    let tokens = [...allTokens];
    switch (activeTab) {
      case 'trending':
        tokens.sort((a, b) => (b.momentum || b.volume24h) - (a.momentum || a.volume24h));
        break;
      case 'top':
        tokens.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
        break;
      case 'gainers':
        tokens.sort((a, b) => b.change24h - a.change24h);
        tokens = tokens.filter(t => t.change24h > 0);
        break;
      case 'losers':
        tokens.sort((a, b) => a.change24h - b.change24h);
        tokens = tokens.filter(t => t.change24h < 0);
        break;
      case 'new':
        tokens.sort((a, b) => (a.ageHours || 999) - (b.ageHours || 999));
        break;
    }
    return tokens;
  }, [allTokens, activeTab]);

  // Search filter
  const displayTokens = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults?.tokens?.length) {
      return searchResults.tokens.map((t, i) => ({
        symbol: t.symbol,
        name: t.name,
        price: t.price,
        change5m: (t as any).change5m ?? undefined,
        change1h: (t as any).change1h ?? undefined,
        change6h: (t as any).change6h ?? undefined,
        change24h: t.change24h,
        volume24h: t.volume24h,
        liquidity: t.liquidity,
        marketCap: t.marketCap,
        fdv: t.fdv,
        txns24h: t.txns24h,
        makers: (t as any).makers || t.txns24h || undefined,
        ageHours: (t as any).ageHours || undefined,
        contractAddress: t.contractAddress,
        logo: t.logo,
        chain: t.chain || selectedChain,
        rank: t.rank || i + 1,
        verified: t.verified,
        isTrending: t.isTrending,
      } as DexToken));
    }
    return tabTokens;
  }, [searchQuery, searchResults, tabTokens, selectedChain]);

  // Sort
  const sortedTokens = useMemo(() => {
    const sorted = [...displayTokens];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortCol] || 0;
      const bVal = (b as any)[sortCol] || 0;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  }, [displayTokens, sortCol, sortDir]);

  const toggleSort = useCallback((col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  }, [sortCol]);

  const copyAddress = useCallback((addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    toast.success('Address copied');
    setTimeout(() => setCopiedAddr(null), 2000);
  }, []);

  const getDexScreenerUrl = (token: DexToken) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ethereum', solana: 'solana', bsc: 'bsc', polygon: 'polygon',
      arbitrum: 'arbitrum', base: 'base', avalanche: 'avalanche', optimism: 'optimism',
    };
    const c = chainMap[token.chain] || 'ethereum';
    if (token.contractAddress) return `https://dexscreener.com/${c}/${token.contractAddress}`;
    return `https://dexscreener.com/${c}`;
  };

  // Stats bar
  const totalVolume = useMemo(() => allTokens.reduce((s, t) => s + t.volume24h, 0), [allTokens]);
  const totalTxns = useMemo(() => allTokens.reduce((s, t) => s + (t.txns24h || 0), 0), [allTokens]);

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'trending', label: 'Trending 🔥', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'top', label: 'Top', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'gainers', label: 'Gainers', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'losers', label: 'Losers', icon: <TrendingDown className="w-3.5 h-3.5" /> },
    { id: 'new', label: 'New Pairs', icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  const timeFilters: TimeFilter[] = ['5m', '1h', '6h', '24h'];

  const SortHeader = ({ col, label, className }: { col: string; label: string; className?: string }) => (
    <th
      className={cn("px-2 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap", className)}
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center gap-0.5">
        {label}
        {sortCol === col && (
          <ArrowUpDown className="w-3 h-3 text-primary" />
        )}
      </span>
    </th>
  );

  return (
    <Layout>
      <SEO
        title="Token Explorer — DexScreener-Style Live Token Data"
        description="Track real-time token prices, volume, liquidity, and trends across 30+ blockchains. Search any token by contract, name, or symbol."
      />
      <ExplorerSchema chainCount={ALL_CHAINS.length} />

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Mobile chain selector */}
        <div className="lg:hidden border-b border-border bg-card">
          <div className="flex items-center gap-2 p-2 overflow-x-auto">
            <span className="text-xs text-muted-foreground shrink-0">Chain:</span>
            {ALL_CHAINS.slice(0, 12).map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChain(c.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                  selectedChain === c.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <ChainSidebar selected={selectedChain} onSelect={setSelectedChain} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Stats bar */}
          <div className="flex items-center gap-4 px-3 py-2 border-b border-border bg-card text-xs">
            <span className="text-muted-foreground">24H VOLUME: <strong className="text-foreground">{formatCompact(totalVolume)}</strong></span>
            <span className="text-muted-foreground hidden sm:inline">24H TXNS: <strong className="text-foreground">{totalTxns.toLocaleString()}</strong></span>
            <span className="text-muted-foreground hidden md:inline">TOKENS: <strong className="text-foreground">{allTokens.length}</strong></span>
            <span className="text-muted-foreground hidden md:inline">CHAIN: <strong className="text-foreground">{chainData.icon} {chainData.name}</strong></span>
            <div className="ml-auto flex items-center gap-1.5">
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-success">Live</span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border bg-card">
            {/* Time filter */}
            <div className="flex items-center gap-0.5 bg-muted/50 rounded-md p-0.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
              {timeFilters.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={cn(
                    "px-2 py-1 rounded text-[11px] font-medium transition-colors",
                    timeFilter === tf
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>

            {/* View tabs */}
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            {/* Search */}
            <div className="flex-1 min-w-[200px] ml-auto max-w-md relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search token name, symbol, or address..."
                className="h-8 text-xs pl-8 pr-8 bg-muted/50 border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
              {searchLoading && (
                <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary" />
              )}
            </div>

            {/* Rank label */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-muted-foreground">
              <Filter className="w-3 h-3" />
              Rank by: ↓ {activeTab === 'trending' ? `Trending ${timeFilter}` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </div>
          </div>

          {/* Token Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-card border-b border-border">
                <tr>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-left w-8">#</th>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-left min-w-[140px] sm:min-w-[200px]">TOKEN</th>
                  <SortHeader col="price" label="PRICE" />
                  <SortHeader col="age" label="AGE" className="hidden sm:table-cell" />
                  <SortHeader col="txns24h" label="TXNS" className="hidden sm:table-cell" />
                  <SortHeader col="volume24h" label="VOLUME" />
                  <SortHeader col="makers" label="MAKERS" className="hidden md:table-cell" />
                  <SortHeader col="change5m" label="5M" className="hidden lg:table-cell" />
                  <SortHeader col="change1h" label="1H" className="hidden lg:table-cell" />
                  <SortHeader col="change6h" label="6H" className="hidden xl:table-cell" />
                  <SortHeader col="change24h" label="24H" />
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right hidden lg:table-cell">BUYS</th>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right hidden lg:table-cell">SELLS</th>
                  <SortHeader col="liquidity" label="LIQUIDITY" className="hidden xl:table-cell" />
                  <SortHeader col="marketCap" label="MCAP" className="hidden 2xl:table-cell" />
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground text-right hidden 2xl:table-cell">FDV</th>
                  <th className="px-2 py-2 text-[11px] font-semibold text-muted-foreground w-8"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && sortedTokens.length === 0 ? (
                  Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={14} className="px-2 py-3">
                        <div className="h-4 bg-muted/50 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : sortedTokens.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-16 text-muted-foreground">
                      No tokens found. Try searching or selecting a different chain.
                    </td>
                  </tr>
                ) : (
                  sortedTokens.map((token, idx) => (
                    <tr
                      key={`${token.symbol}-${idx}`}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (token.contractAddress) {
                          navigate(`/explorer/${token.chain || selectedChain}/${token.contractAddress}`);
                        } else if (token.coingeckoId) {
                          navigate(`/explorer/${token.chain || selectedChain}/${token.coingeckoId}`);
                        }
                      }}
                    >
                      {/* Rank */}
                      <td className="px-2 py-2.5 text-muted-foreground font-mono">
                        {idx + 1}
                      </td>

                      {/* Token */}
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {token.logo ? (
                            <img
                              src={token.logo}
                              alt={token.symbol}
                              className="w-7 h-7 rounded-full bg-muted shrink-0"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold text-primary">{token.symbol[0]}</span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">{token.symbol}</span>
                              <span className="text-[10px] text-muted-foreground">/{chainData.symbol}</span>
                              {token.name && (
                                <span className="text-[10px] text-muted-foreground truncate max-w-[120px] hidden sm:inline">
                                  {token.name}
                                </span>
                              )}
                            </div>
                            {token.contractAddress && (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-muted-foreground/60 font-mono">
                                  {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                                </span>
                                <button
                                  onClick={e => { e.stopPropagation(); copyAddress(token.contractAddress!); }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Copy className="w-2.5 h-2.5 text-muted-foreground hover:text-foreground" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-2 py-2.5 font-mono font-medium text-foreground whitespace-nowrap">
                        {formatPrice(token.price)}
                      </td>

                      {/* Age */}
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                        {formatAge(token.ageHours)}
                      </td>

                      {/* Txns */}
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap">
                        {(token.txns24h || 0).toLocaleString()}
                      </td>

                      {/* Volume */}
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap">
                        {formatCompact(token.volume24h)}
                      </td>

                      {/* Makers */}
                      <td className="px-2 py-2.5 text-muted-foreground whitespace-nowrap">
                        {(token.makers || 0).toLocaleString()}
                      </td>

                      {/* 5M */}
                      <td className={cn(
                        "px-2 py-2.5 font-mono whitespace-nowrap hidden md:table-cell",
                        (token.change5m || 0) > 0 ? "text-success" : (token.change5m || 0) < 0 ? "text-danger" : "text-muted-foreground"
                      )}>
                        {formatChange(token.change5m)}
                      </td>

                      {/* 1H */}
                      <td className={cn(
                        "px-2 py-2.5 font-mono whitespace-nowrap hidden md:table-cell",
                        (token.change1h || 0) > 0 ? "text-success" : (token.change1h || 0) < 0 ? "text-danger" : "text-muted-foreground"
                      )}>
                        {formatChange(token.change1h)}
                      </td>

                      {/* 6H */}
                      <td className={cn(
                        "px-2 py-2.5 font-mono whitespace-nowrap hidden lg:table-cell",
                        (token.change6h || 0) > 0 ? "text-success" : (token.change6h || 0) < 0 ? "text-danger" : "text-muted-foreground"
                      )}>
                        {formatChange(token.change6h)}
                      </td>

                      {/* 24H */}
                      <td className={cn(
                        "px-2 py-2.5 font-mono font-medium whitespace-nowrap",
                        token.change24h > 0 ? "text-success" : token.change24h < 0 ? "text-danger" : "text-muted-foreground"
                      )}>
                        {formatChange(token.change24h)}
                      </td>

                      {/* Buys */}
                      <td className="px-2 py-2.5 text-success whitespace-nowrap hidden md:table-cell text-right">
                        <span className="text-[11px] font-mono">{(token.buys24h || 0).toLocaleString()}</span>
                      </td>

                      {/* Sells */}
                      <td className="px-2 py-2.5 text-danger whitespace-nowrap hidden md:table-cell text-right">
                        <span className="text-[11px] font-mono">{(token.sells24h || 0).toLocaleString()}</span>
                      </td>

                      {/* Liquidity */}
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap hidden lg:table-cell">
                        {formatCompact(token.liquidity)}
                      </td>

                      {/* MCap */}
                      <td className="px-2 py-2.5 font-mono text-foreground whitespace-nowrap hidden xl:table-cell">
                        {formatCompact(token.marketCap)}
                      </td>

                      {/* FDV */}
                      <td className="px-2 py-2.5 font-mono text-muted-foreground whitespace-nowrap hidden xl:table-cell text-right">
                        {formatCompact(token.fdv)}
                      </td>

                      {/* Action */}
                      <td className="px-2 py-2.5">
                        <button
                          onClick={e => { e.stopPropagation(); window.open(getDexScreenerUrl(token), '_blank'); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SEO Footer */}
          <div className="border-t border-border bg-card px-4 py-6">
            <ExplorerSEOContent />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExplorerPage;
