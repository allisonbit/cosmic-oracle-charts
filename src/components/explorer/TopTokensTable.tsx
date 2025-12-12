import { useState } from "react";
import { 
  TrendingUp, TrendingDown, ExternalLink, Eye, Star, 
  Copy, CheckCircle, ChevronDown, ChevronUp, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain } from "@/lib/explorerChains";

interface TopTokensTableProps {
  chain: ExplorerChain;
  onTokenSelect: (token: SearchToken) => void;
}

interface TokenRow {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  volume24h: number;
  liquidity: number;
  fdv: number;
  txns24h: number;
  buys: number;
  sells: number;
  contractAddress: string;
}

function formatPrice(price: number): string {
  if (price === 0) return 'N/A';
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(0)}`;
}

// Generate mock tokens
const generateTokens = (count: number): TokenRow[] => {
  const tokenList = [
    { symbol: 'WETH', name: 'Wrapped Ether' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
    { symbol: 'DAI', name: 'Dai Stablecoin' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'AAVE', name: 'Aave' },
    { symbol: 'MKR', name: 'Maker' },
    { symbol: 'SNX', name: 'Synthetix' },
    { symbol: 'CRV', name: 'Curve DAO' },
    { symbol: 'COMP', name: 'Compound' },
    { symbol: 'LDO', name: 'Lido DAO' },
    { symbol: 'APE', name: 'ApeCoin' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'ARB', name: 'Arbitrum' },
    { symbol: 'OP', name: 'Optimism' },
    { symbol: 'BLUR', name: 'Blur' },
    { symbol: 'GMX', name: 'GMX' },
  ];

  return tokenList.slice(0, count).map((t, i) => ({
    rank: i + 1,
    symbol: t.symbol,
    name: t.name,
    price: Math.random() * 2000 + 0.0001,
    change1h: (Math.random() - 0.5) * 10,
    change24h: (Math.random() - 0.5) * 30,
    change7d: (Math.random() - 0.5) * 50,
    volume24h: Math.random() * 100000000 + 100000,
    liquidity: Math.random() * 50000000 + 100000,
    fdv: Math.random() * 10000000000 + 1000000,
    txns24h: Math.floor(Math.random() * 50000) + 100,
    buys: Math.floor(Math.random() * 25000) + 50,
    sells: Math.floor(Math.random() * 25000) + 50,
    contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
  }));
};

export function TopTokensTable({ chain, onTokenSelect }: TopTokensTableProps) {
  const [tokens] = useState(() => generateTokens(20));
  const [sortBy, setSortBy] = useState<keyof TokenRow>('volume24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedToken, setSelectedToken] = useState<TokenRow | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

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

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleViewDetails = (token: TokenRow) => {
    onTokenSelect({
      symbol: token.symbol,
      name: token.name,
      contractAddress: token.contractAddress,
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
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden md:table-cell" onClick={() => handleSort('liquidity')}>
                <span className="flex items-center justify-end gap-1">Liquidity <SortIcon column="liquidity" /></span>
              </th>
              <th className="text-right py-2 px-2 cursor-pointer hover:text-primary hidden lg:table-cell" onClick={() => handleSort('txns24h')}>
                <span className="flex items-center justify-end gap-1">Txns <SortIcon column="txns24h" /></span>
              </th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token) => (
              <tr 
                key={token.symbol}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => setSelectedToken(token)}
              >
                <td className="py-3 px-2 text-muted-foreground">{token.rank}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-primary text-xs">{token.symbol[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]">{token.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right font-medium">{formatPrice(token.price)}</td>
                <td className={cn("py-3 px-2 text-right font-bold", token.change1h >= 0 ? "text-success" : "text-danger")}>
                  {token.change1h >= 0 ? "+" : ""}{token.change1h.toFixed(2)}%
                </td>
                <td className={cn("py-3 px-2 text-right font-bold", token.change24h >= 0 ? "text-success" : "text-danger")}>
                  {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                </td>
                <td className={cn("py-3 px-2 text-right font-bold hidden lg:table-cell", token.change7d >= 0 ? "text-success" : "text-danger")}>
                  {token.change7d >= 0 ? "+" : ""}{token.change7d.toFixed(2)}%
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell text-muted-foreground">{formatNumber(token.volume24h)}</td>
                <td className="py-3 px-2 text-right hidden md:table-cell text-muted-foreground">{formatNumber(token.liquidity)}</td>
                <td className="py-3 px-2 text-right hidden lg:table-cell text-muted-foreground">{token.txns24h.toLocaleString()}</td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); copyAddress(token.contractAddress); }}
                    >
                      {copiedAddress === token.contractAddress ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0"
                      onClick={(e) => { e.stopPropagation(); window.open(`https://dexscreener.com/${chain.id}/${token.contractAddress}`, '_blank'); }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              {selectedToken?.symbol} Quick View
            </DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <div className="text-2xl font-bold">{formatPrice(selectedToken.price)}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn("text-xs", selectedToken.change1h >= 0 ? "text-success" : "text-danger")}>
                      1h: {selectedToken.change1h >= 0 ? "+" : ""}{selectedToken.change1h.toFixed(2)}%
                    </span>
                    <span className={cn("text-xs", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                      24h: {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}%
                    </span>
                    <span className={cn("text-xs", selectedToken.change7d >= 0 ? "text-success" : "text-danger")}>
                      7d: {selectedToken.change7d >= 0 ? "+" : ""}{selectedToken.change7d.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Star className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                  <div className="font-bold">{formatNumber(selectedToken.volume24h)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">Liquidity</div>
                  <div className="font-bold">{formatNumber(selectedToken.liquidity)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">FDV</div>
                  <div className="font-bold">{formatNumber(selectedToken.fdv)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground">24h Txns</div>
                  <div className="font-bold">{selectedToken.txns24h.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Buy/Sell Ratio</span>
                  <span className="text-xs">{selectedToken.buys} / {selectedToken.sells}</span>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                  <div className="bg-success" style={{ width: `${(selectedToken.buys / (selectedToken.buys + selectedToken.sells)) * 100}%` }} />
                  <div className="bg-danger" style={{ width: `${(selectedToken.sells / (selectedToken.buys + selectedToken.sells)) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Contract</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-primary flex-1 truncate">{selectedToken.contractAddress}</code>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyAddress(selectedToken.contractAddress)}>
                    {copiedAddress === selectedToken.contractAddress ? <CheckCircle className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-1" onClick={() => window.open(`https://dexscreener.com/${chain.id}/${selectedToken.contractAddress}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" /> DexScreener
                </Button>
                <Button className="gap-1" onClick={() => { handleViewDetails(selectedToken); setSelectedToken(null); }}>
                  <Eye className="w-4 h-4" /> Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
