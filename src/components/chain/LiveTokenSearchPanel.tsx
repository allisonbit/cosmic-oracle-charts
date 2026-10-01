import { useState, useCallback, useEffect } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { CHAIN_ANCHORS } from "@/lib/dexScreener";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp, TrendingDown, Coins, CheckCircle, ChevronRight, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LiveTokenSearchPanelProps {
  chain: ChainConfig;
}

interface DexSearchPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
  txns?: { h24?: { buys?: number; sells?: number } };
  info?: { imageUrl?: string };
  labels?: string[];
}

interface Row {
  symbol: string;
  name: string;
  contractAddress: string;
  pairAddress?: string;
  price: number;
  change24h: number;
  volume24h: number;
  liquidity?: number;
  txns24h?: number;
  logo?: string;
  dexId: string;
  verified: boolean;
}

const CHAIN_SLUGS: Record<string, string> = {
  ethereum: "ethereum", solana: "solana", bnb: "bsc", avalanche: "avalanche",
  polygon: "polygon", arbitrum: "arbitrum", base: "base", optimism: "optimism",
  sui: "sui", ton: "ton",
};

export function LiveTokenSearchPanel({ chain }: LiveTokenSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<Row | null>(null);
  const [debounced, setDebounced] = useState("");

  const searching = searchQuery.trim().length >= 2;

  // Debounce 400ms.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery.trim()), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const dexChain = CHAIN_SLUGS[chain.id] ?? chain.id;

  // Multi-query DexScreener search. Key-free and CORS-open.
  const { data: rows, isLoading } = useQuery({
    queryKey: ["dex-chain-search", dexChain, searching ? debounced : ""],
    queryFn: async (): Promise<Row[]> => {
      // Search mode: query as typed. Browse mode: merge chain-anchored queries
      // ("<chain> <quote>") — a bare chain name returns token-name matches on
      // other chains, not this chain's real pairs.
      const queries = searching ? [debounced] : (CHAIN_ANCHORS[dexChain] ?? [dexChain]);
      const responses = await Promise.all(
        queries.map(q =>
          fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`, {
            headers: { accept: "application/json" },
          }).then(r => (r.ok ? r.json() as Promise<{ pairs?: DexSearchPair[] }> : { pairs: [] } as { pairs?: DexSearchPair[] })),
        ),
      );
      const byToken = new Map<string, Row>();
      for (const json of responses) {
      for (const p of json.pairs ?? []) {
        if (p.chainId?.toLowerCase() !== dexChain) continue;
        {
        const txns = p.txns?.h24 ?? {};
        const row: Row = {
          symbol: p.baseToken.symbol ?? "",
          name: p.baseToken.name ?? p.baseToken.symbol ?? "",
          contractAddress: p.baseToken.address ?? "",
          pairAddress: p.pairAddress,
          price: parseFloat(p.priceUsd ?? "0") || 0,
          change24h: p.priceChange?.h24 ?? 0,
          volume24h: p.volume?.h24 ?? 0,
          liquidity: p.liquidity?.usd,
          txns24h: (txns.buys ?? 0) + (txns.sells ?? 0),
          logo: p.info?.imageUrl,
          dexId: p.dexId ?? "",
          verified: (p.liquidity?.usd ?? 0) > 100_000,
        };
        const key = row.symbol.toUpperCase();
        const prev = byToken.get(key);
        if (!prev || (row.liquidity ?? 0) > (prev.liquidity ?? 0)) byToken.set(key, row);
        }
      }
      }
      return [...byToken.values()].sort((a, b) => b.volume24h - a.volume24h).slice(0, 40);
    },
    enabled: !searching || debounced.length >= 2,
    staleTime: 120_000,
    refetchInterval: false,
    retry: 1,
  });

  const copyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
  }, []);

  const getDexScreenerUrl = (token: Row) =>
    token.pairAddress
      ? `https://dexscreener.com/${dexChain}/${token.pairAddress}`
      : `https://dexscreener.com/${dexChain}/${token.contractAddress}`;

  const getExplorerUrl = (token: Row) =>
    token.contractAddress ? `${chain.explorerUrl}/token/${token.contractAddress}` : chain.explorerUrl;

  const tokens = rows ?? [];

  return (
    <div className="holo-card p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))` }}>
            <Coins className="h-6 w-6" style={{ color: `hsl(${chain.color})` }} />
          </div>
          <div>
            <h3 className="text-lg font-display text-foreground flex items-center gap-2">
              {chain.name} Token Explorer
            </h3>
            <p className="text-xs text-muted-foreground">Live DEX pairs — search by name or symbol</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
          Live
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or symbol…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-muted/20 border-border/50 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/40 rounded"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          {searching
            ? `${tokens.length} results for "${debounced}"`
            : `${tokens.length} busiest pairs on ${chain.name}`}
        </p>
      </div>

      {/* Token List */}
      <ScrollArea className="h-[500px]">
        {isLoading && tokens.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">
              {searching ? `No tokens found for "${debounced}" on ${chain.name}` : "Loading live pairs…"}
            </p>
            {searching && <p className="text-xs mt-1">Try a different name or symbol</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token, i) => (
              <button
                key={`${token.contractAddress}-${i}`}
                onClick={() => setSelectedToken(token)}
                className="w-full p-3 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 hover:border-primary/30 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  {/* Token Icon */}
                  <div className="relative">
                    <CoinImage symbol={token.symbol} image={token.logo} size={40} />
                    {token.verified && (
                      <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-success bg-background rounded-full" />
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-foreground">{token.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">{token.dexId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                  </div>

                  {/* Price & Change */}
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {token.price >= 1 ? `$${token.price.toFixed(2)}` : `$${token.price.toPrecision(4)}`}
                    </p>
                    <div className={cn(
                      "flex items-center justify-end gap-1 text-xs",
                      token.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="text-center">
                      <p className="text-foreground font-medium">
                        {token.volume24h >= 1e9 ? `$${(token.volume24h / 1e9).toFixed(2)}B` : token.volume24h >= 1e6 ? `$${(token.volume24h / 1e6).toFixed(2)}M` : `$${(token.volume24h / 1e3).toFixed(1)}K`}
                      </p>
                      <p>Vol</p>
                    </div>
                    {token.liquidity !== undefined && (
                      <div className="text-center">
                        <p className="text-foreground font-medium">
                          {token.liquidity >= 1e6 ? `$${(token.liquidity / 1e6).toFixed(2)}M` : `$${(token.liquidity / 1e3).toFixed(0)}K`}
                        </p>
                        <p>Liq</p>
                      </div>
                    )}
                    {token.txns24h !== undefined && (
                      <div className="text-center">
                        <p className="text-foreground font-medium">{token.txns24h.toLocaleString()}</p>
                        <p>Txns</p>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Token detail modal — real links only */}
      {selectedToken && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedToken(null)}
        >
          <div className="holo-card p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <CoinImage symbol={selectedToken.symbol} image={selectedToken.logo} size={48} />
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-display text-foreground">{selectedToken.symbol}</h4>
                <p className="text-xs text-muted-foreground truncate">{selectedToken.name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-display text-foreground">
                  {selectedToken.price >= 1 ? `$${selectedToken.price.toFixed(2)}` : `$${selectedToken.price.toPrecision(4)}`}
                </p>
                <p className={cn("text-xs font-medium", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                  {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% 24h
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">24h Volume</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedToken.volume24h >= 1e9 ? `$${(selectedToken.volume24h / 1e9).toFixed(2)}B` : `$${(selectedToken.volume24h / 1e6).toFixed(2)}M`}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">Liquidity</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedToken.liquidity ? (selectedToken.liquidity >= 1e6 ? `$${(selectedToken.liquidity / 1e6).toFixed(2)}M` : `$${(selectedToken.liquidity / 1e3).toFixed(0)}K`) : "—"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-muted/10">
                <p className="text-[10px] text-muted-foreground">DEX</p>
                <p className="text-sm font-medium text-foreground">{selectedToken.dexId || "—"}</p>
              </div>
            </div>
            <button
              onClick={() => copyAddress(selectedToken.contractAddress)}
              className="w-full p-2 rounded-lg bg-muted/10 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors text-left truncate"
              title="Click to copy"
            >
              {selectedToken.contractAddress || "—"}
            </button>
            <div className="flex gap-2">
              <a
                href={getDexScreenerUrl(selectedToken)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm hover:bg-primary/30 transition-colors"
              >
                Chart on DexScreener
              </a>
              <a
                href={getExplorerUrl(selectedToken)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 rounded-lg bg-muted/20 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Block Explorer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
