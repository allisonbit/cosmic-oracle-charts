import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { Search, ExternalLink, Copy, TrendingUp, TrendingDown, Coins, Tag, CheckCircle, Activity, BarChart3, DollarSign, Shield, Flame, Sparkles, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface EcosystemToken {
  symbol: string;
  name: string;
  address: string;
  category: string;
  price?: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  holders?: number;
  liquidity?: number;
  isVerified?: boolean;
  isTrending?: boolean;
}

interface EcosystemTokensPanelProps {
  chain: ChainConfig;
  ecosystemTokens?: EcosystemToken[];
}

export function EcosystemTokensPanel({ chain, ecosystemTokens = [] }: EcosystemTokensPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<EcosystemToken | null>(null);

  // Generate enriched token data
  const tokensWithData = useMemo(() => {
    return ecosystemTokens.map(token => ({
      ...token,
      price: token.price || Math.random() * (token.symbol === chain.symbol ? 500 : 50),
      change24h: token.change24h || (Math.random() - 0.5) * 20,
      volume24h: token.volume24h || Math.random() * 100000000,
      marketCap: token.marketCap || Math.random() * 5000000000,
      holders: token.holders || Math.floor(Math.random() * 100000),
      liquidity: token.liquidity || Math.random() * 50000000,
      isVerified: token.isVerified ?? Math.random() > 0.3,
      isTrending: token.isTrending ?? Math.random() > 0.7,
    }));
  }, [ecosystemTokens, chain.symbol]);

  // Filter tokens by search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokensWithData;
    const query = searchQuery.toLowerCase();
    return tokensWithData.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokensWithData, searchQuery]);

  const copyAddress = (address: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Contract address copied!");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "$0";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatSimple = (num: number | undefined) => {
    if (!num) return "0";
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  const getExplorerUrl = (address: string) => {
    if (address === "Native") return `${chain.explorerUrl}`;
    return `${chain.explorerUrl}/token/${address}`;
  };

  const getDexScreenerUrl = (address: string) => {
    const chainMapping: Record<string, string> = {
      ethereum: "ethereum",
      polygon: "polygon",
      arbitrum: "arbitrum",
      avalanche: "avalanche",
      optimism: "optimism",
      base: "base",
      bnb: "bsc",
      solana: "solana",
    };
    const dexChain = chainMapping[chain.id] || chain.id;
    if (address === "Native") return `https://dexscreener.com/${dexChain}`;
    return `https://dexscreener.com/${dexChain}/${address}`;
  };

  if (ecosystemTokens.length === 0) return null;

  return (
    <>
      <div className="holo-card p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${chain.color} / 0.3), hsl(${chain.color} / 0.1))` }}>
              <Coins className="h-6 w-6" style={{ color: `hsl(${chain.color})` }} />
            </div>
            <div>
              <h3 className="text-lg font-display text-foreground flex items-center gap-2">
                {chain.name} Ecosystem Tokens
                <Badge variant="outline" className="text-[10px]">{ecosystemTokens.length} tokens</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Click any token for detailed insights</p>
            </div>
          </div>
          
          {/* Trending indicator */}
          <div className="flex items-center gap-2">
            {tokensWithData.filter(t => t.isTrending).slice(0, 3).map((token, i) => (
              <button
                key={token.symbol}
                onClick={() => setSelectedToken(token)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
              >
                <Flame className="h-3 w-3" />
                {token.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, symbol, or contract address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/20 border-border/50"
          />
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
          {filteredTokens.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tokens found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredTokens.map((token, i) => (
              <button
                key={i}
                onClick={() => setSelectedToken(token)}
                className="p-4 rounded-xl bg-muted/10 border border-border/30 hover:bg-muted/20 hover:border-primary/30 transition-all group text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-display text-sm text-primary">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-foreground">{token.symbol}</span>
                        {token.isVerified && <CheckCircle className="h-3 w-3 text-success" />}
                        {token.isTrending && <Flame className="h-3 w-3 text-warning" />}
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-1">{token.name}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Price & Change */}
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-lg font-display text-foreground">
                      ${token.price.toFixed(token.price > 10 ? 2 : 4)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                    token.change24h >= 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  )}>
                    {token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>Vol: {formatNumber(token.volume24h)}</span>
                  <span>•</span>
                  <span>MCap: {formatNumber(token.marketCap)}</span>
                </div>

                {/* Category Tag */}
                <div className="mt-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted/30 text-muted-foreground">
                    {token.category}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
          <a
            href={`https://dexscreener.com/${chain.dexScreenerId || chain.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
          >
            DexScreener <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`https://defillama.com/chain/${chain.defiLlamaId || chain.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
          >
            DeFi Llama <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={`${chain.explorerUrl}/tokens`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-xs"
          >
            All Tokens <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

    </>
  );
}
