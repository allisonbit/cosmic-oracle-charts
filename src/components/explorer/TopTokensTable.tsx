import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronDown, ChevronUp, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain } from "@/lib/explorerChains";
import { TradeButtons } from "@/components/trading/TradeButtons";

interface TopTokensTableProps {
  chain: ExplorerChain;
  onTokenSelect: (token: SearchToken) => void;
}

interface TokenRow {
  rank: number;
  id: string;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  contractAddress: string | null;
}

function formatPrice(price: number): string {
  if (!price || price === 0) return 'N/A';
  if (price < 0.0001) return `$${(price ?? 0).toFixed(8)}`;
  if (price < 0.01) return `$${(price ?? 0).toFixed(6)}`;
  if (price < 1) return `$${(price ?? 0).toFixed(4)}`;
  return `$${(price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '—';
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${(num ?? 0).toFixed(0)}`;
}

export function TopTokensTable({ chain, onTokenSelect }: TopTokensTableProps) {
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["top-tokens", chain.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("top-tokens", {
        body: { chain: chain.id, limit: 25 },
      });
      if (error) throw error;
      return (data?.tokens ?? []) as TokenRow[];
    },
    refetchInterval: 120_000,
    refetchIntervalInBackground: true,
    staleTime: 60_000,
  });

  const [sortBy, setSortBy] = useState<keyof TokenRow>('volume24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedTokens = [...tokens].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    }
    return 0;
  });

  const handleSort = (column: keyof TokenRow) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  const handleViewDetails = (token: TokenRow) => {
    onTokenSelect({
      symbol: token.symbol,
      name: token.name,
      contractAddress: token.contractAddress ?? '',
      decimals: 18,
      chain: chain.id,
      price: token.price,
      change24h: token.change24h,
      verified: true,
    });
  };

  const SortIcon = ({ column }: { column: keyof TokenRow }) => {
    if (sortBy !== column) return null;
    return sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
  };

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          TOP TOKENS ON {chain.name.toUpperCase()}
        </h3>
        <Button variant="ghost" size="sm" className="gap-1">
          <Filter className="w-3 h-3" /> Filter
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs font-display border-b border-border">
              <th className="text-left py-2 px-2">#</th>
              <th className="text-left py-2 px-2">Token</th>
              <th className="text-right py-2 px-2">Price</th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary" onClick={() => handleSort('change1h')}>
                <span className="flex items-center justify-end gap-1">1h <SortIcon column="change1h" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary" onClick={() => handleSort('change24h')}>
                <span className="flex items-center justify-end gap-1">24h <SortIcon column="change24h" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden lg:table-cell" onClick={() => handleSort('change7d')}>
                <span className="flex items-center justify-end gap-1">7d <SortIcon column="change7d" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden sm:table-cell" onClick={() => handleSort('volume24h')}>
                <span className="flex items-center justify-end gap-1">Volume <SortIcon column="volume24h" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden md:table-cell" onClick={() => handleSort('marketCap')}>
                <span className="flex items-center justify-end gap-1">Market Cap <SortIcon column="marketCap" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden lg:table-cell" onClick={() => handleSort('fdv')}>
                <span className="flex items-center justify-end gap-1">FDV <SortIcon column="fdv" /></span>
              </th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && tokens.length === 0 && Array.from({ length: 10 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-border/50">
                <td colSpan={10} className="py-3 px-2"><div className="h-6 rounded bg-muted/30 animate-pulse" /></td>
              </tr>
            ))}
            {sortedTokens.map((token) => (
              <tr 
                key={token.id}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleViewDetails(token)}
              >
                <td className="py-3 px-2 text-muted-foreground">{token.rank}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    {token.image ? (
                      <img src={token.image} alt={token.symbol} width={28} height={28} className="rounded-full" loading="lazy" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="font-display font-bold text-primary text-xs">{token.symbol[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]">{token.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right font-medium">{formatPrice(token.price)}</td>
                <td className={cn("py-3 px-2 text-right font-bold", token.change1h >= 0 ? "text-success" : "text-danger")}>
                  {(token.change1h ?? 0) >= 0 ? "+" : ""}{(token.change1h ?? 0).toFixed(2)}%
                </td>
                <td className={cn("py-3 px-2 text-right font-bold", token.change24h >= 0 ? "text-success" : "text-danger")}>
                  {(token.change24h ?? 0) >= 0 ? "+" : ""}{(token.change24h ?? 0).toFixed(2)}%
                </td>
                <td className={cn("py-3 px-2 text-right font-bold hidden lg:table-cell", token.change7d >= 0 ? "text-success" : "text-danger")}>
                  {(token.change7d ?? 0) >= 0 ? "+" : ""}{(token.change7d ?? 0).toFixed(2)}%
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell text-muted-foreground">{formatNumber(token.volume24h)}</td>
                <td className="py-3 px-2 text-right hidden md:table-cell text-muted-foreground">{formatNumber(token.marketCap)}</td>
                <td className="py-3 px-2 text-right hidden lg:table-cell text-muted-foreground">{formatNumber(token.fdv)}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <TradeButtons symbol={token.symbol} name={token.name} contractAddress={token.contractAddress ?? ''} chain={chain.id} price={token.price} variant="inline" />
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && tokens.length === 0 && (
              <tr><td colSpan={10} className="py-6 text-center text-muted-foreground text-xs">No tokens listed for {chain.name} yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
