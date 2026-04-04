import { useState, useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { Search, ExternalLink, Copy, TrendingUp, TrendingDown, Coins, Tag, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EcosystemToken {
  symbol: string;
  name: string;
  address: string;
  category: string;
  price?: number;
  change24h?: number;
}

interface EcosystemTokenSearchProps {
  chain: ChainConfig;
  ecosystemTokens?: EcosystemToken[];
}

export function EcosystemTokenSearch({ chain, ecosystemTokens = [] }: EcosystemTokenSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Generate mock prices for tokens
  const tokensWithPrices = useMemo(() => {
    return ecosystemTokens.map(token => ({
      ...token,
      price: token.price || Math.random() * (token.symbol === chain.symbol ? 500 : 50),
      change24h: token.change24h || (Math.random() - 0.5) * 20,
    }));
  }, [ecosystemTokens, chain.symbol]);

  // Filter tokens by search query (name, symbol, or address)
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokensWithPrices;
    
    const query = searchQuery.toLowerCase();
    return tokensWithPrices.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    );
  }, [tokensWithPrices, searchQuery]);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Contract address copied!", {
      description: address.slice(0, 20) + "...",
    });
    setTimeout(() => setCopiedAddress(null), 2000);
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
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ background: `hsl(${chain.color} / 0.1)` }}>
            <Coins className="h-5 w-5" style={{ color: `hsl(${chain.color})` }} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-display text-foreground">{chain.name} Ecosystem</h3>
            <p className="text-xs text-muted-foreground">Search tokens by name, symbol, or contract address</p>
          </div>
        </div>
        <span className="text-xs bg-muted/30 px-2 py-1 rounded">{ecosystemTokens.length} tokens</span>
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

      {/* Token List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredTokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tokens found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredTokens.map((token, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-sm text-primary">{token.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-foreground">{token.symbol}</span>
                      <span className="text-xs text-muted-foreground truncate">{token.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" />
                        {token.category}
                      </span>
                      {token.address !== "Native" && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {token.address.slice(0, 8)}...{token.address.slice(-6)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-display text-foreground">
                      ${token.price.toFixed(token.price > 10 ? 2 : 4)}
                    </p>
                    <p className={cn(
                      "text-xs flex items-center justify-end gap-0.5",
                      token.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {token.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {token.address !== "Native" && (
                      <button
                        onClick={() => copyAddress(token.address)}
                        className="p-1.5 rounded hover:bg-muted/40 transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === token.address ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                    )}
                    <a
                      href={getExplorerUrl(token.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-muted/40 transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </a>
                    <a
                      href={getDexScreenerUrl(token.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Chart
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/30">
        <a
          href="/trade"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-xs"
        >
          Trade Tokens
          <ArrowDownUp className="h-3 w-3" />
        </a>
        <a
          href={`${chain.explorerUrl}/tokens`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-xs"
        >
          Block Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
