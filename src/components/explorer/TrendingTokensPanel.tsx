import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Flame, Zap, Rocket, 
  AlertTriangle, Clock, ExternalLink, ChevronRight, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SearchToken } from "@/hooks/useTokenSearch";
import { ExplorerChain } from "@/lib/explorerChains";

interface TrendingToken {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change1h?: number;
  volume24h: number;
  liquidity: number;
  logo?: string;
  contractAddress?: string;
  pairAge?: string;
  buys?: number;
  sells?: number;
  makers?: number;
}

interface TrendingTokensPanelProps {
  chain: ExplorerChain;
  onTokenSelect: (token: SearchToken) => void;
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

// Mock data generators
const generateTrendingTokens = (count: number): TrendingToken[] => {
  const tokens = [
    { symbol: 'PEPE', name: 'Pepe' },
    { symbol: 'SHIB', name: 'Shiba Inu' },
    { symbol: 'BONK', name: 'Bonk' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'WIF', name: 'dogwifhat' },
    { symbol: 'FLOKI', name: 'Floki Inu' },
    { symbol: 'MEME', name: 'Memecoin' },
    { symbol: 'TURBO', name: 'Turbo' },
    { symbol: 'WOJAK', name: 'Wojak' },
    { symbol: 'CHAD', name: 'Chad Coin' },
  ];
  
  return tokens.slice(0, count).map((t, i) => ({
    ...t,
    price: Math.random() * 0.01,
    change24h: (Math.random() - 0.3) * 100,
    change1h: (Math.random() - 0.4) * 20,
    volume24h: Math.random() * 10000000 + 100000,
    liquidity: Math.random() * 5000000 + 50000,
    contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
    pairAge: `${Math.floor(Math.random() * 30) + 1}d`,
    buys: Math.floor(Math.random() * 5000) + 100,
    sells: Math.floor(Math.random() * 3000) + 100,
    makers: Math.floor(Math.random() * 2000) + 50,
  }));
};

const generateGainers = (count: number): TrendingToken[] => {
  return generateTrendingTokens(count).map(t => ({
    ...t,
    change24h: Math.random() * 200 + 50,
    change1h: Math.random() * 30 + 5,
  }));
};

const generateLosers = (count: number): TrendingToken[] => {
  return generateTrendingTokens(count).map(t => ({
    ...t,
    change24h: -(Math.random() * 50 + 10),
    change1h: -(Math.random() * 15 + 2),
  }));
};

const generateNewPairs = (count: number): TrendingToken[] => {
  return generateTrendingTokens(count).map(t => ({
    ...t,
    pairAge: `${Math.floor(Math.random() * 24) + 1}h`,
  }));
};

export function TrendingTokensPanel({ chain, onTokenSelect }: TrendingTokensPanelProps) {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null);

  const trendingTokens = generateTrendingTokens(10);
  const gainers = generateGainers(10);
  const losers = generateLosers(10);
  const newPairs = generateNewPairs(10);

  const handleTokenClick = (token: TrendingToken) => {
    setSelectedToken(token);
  };

  const handleViewDetails = () => {
    if (selectedToken) {
      onTokenSelect({
        symbol: selectedToken.symbol,
        name: selectedToken.name,
        contractAddress: selectedToken.contractAddress || '',
        decimals: 18,
        chain: chain.id,
        price: selectedToken.price,
        change24h: selectedToken.change24h,
        verified: true,
        logo: selectedToken.logo,
      });
      setSelectedToken(null);
    }
  };

  const renderTokenRow = (token: TrendingToken, index: number) => (
    <button
      key={`${token.symbol}-${index}`}
      onClick={() => handleTokenClick(token)}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="font-display font-bold text-primary text-xs">{token.symbol[0]}</span>
        </div>
        <div className="text-left">
          <div className="font-medium text-sm">{token.symbol}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[100px]">{token.name}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-muted-foreground">Vol</div>
          <div className="text-xs">{formatNumber(token.volume24h)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{formatPrice(token.price)}</div>
          <div className={cn("text-xs flex items-center justify-end gap-0.5", 
            token.change24h >= 0 ? "text-success" : "text-danger"
          )}>
            {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );

  return (
    <div className="holo-card p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            {chain.name} TOKENS
          </h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <ExternalLink className="w-3 h-3" />
            View All
          </Button>
        </div>

        <TabsList className="w-full grid grid-cols-4 h-auto mb-4">
          <TabsTrigger value="trending" className="text-xs py-2 gap-1">
            <Flame className="w-3 h-3" /> Hot
          </TabsTrigger>
          <TabsTrigger value="gainers" className="text-xs py-2 gap-1">
            <Rocket className="w-3 h-3" /> Gainers
          </TabsTrigger>
          <TabsTrigger value="losers" className="text-xs py-2 gap-1">
            <AlertTriangle className="w-3 h-3" /> Losers
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs py-2 gap-1">
            <Zap className="w-3 h-3" /> New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-2 mt-0">
          {trendingTokens.map((token, i) => renderTokenRow(token, i))}
        </TabsContent>

        <TabsContent value="gainers" className="space-y-2 mt-0">
          {gainers.map((token, i) => renderTokenRow(token, i))}
        </TabsContent>

        <TabsContent value="losers" className="space-y-2 mt-0">
          {losers.map((token, i) => renderTokenRow(token, i))}
        </TabsContent>

        <TabsContent value="new" className="space-y-2 mt-0">
          {newPairs.map((token, i) => (
            <button
              key={`${token.symbol}-${i}`}
              onClick={() => handleTokenClick(token)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-warning" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{token.symbol}</div>
                  <div className="text-xs text-warning flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {token.pairAge} old
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-muted-foreground">Liq</div>
                  <div className="text-xs">{formatNumber(token.liquidity)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatPrice(token.price)}</div>
                  <div className={cn("text-xs flex items-center justify-end gap-0.5", 
                    token.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </TabsContent>
      </Tabs>

      {/* Token Quick View Modal */}
      <Dialog open={!!selectedToken} onOpenChange={() => setSelectedToken(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              {selectedToken?.symbol} - {selectedToken?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <div className="text-2xl font-bold">{formatPrice(selectedToken.price)}</div>
                  <div className={cn("flex items-center gap-1", selectedToken.change24h >= 0 ? "text-success" : "text-danger")}>
                    {selectedToken.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}% (24h)
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-xl">{selectedToken.symbol[0]}</span>
                </div>
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
                <div className="p-3 rounded-lg bg-success/10">
                  <div className="text-xs text-muted-foreground">Buys (24h)</div>
                  <div className="font-bold text-success">{selectedToken.buys?.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-danger/10">
                  <div className="text-xs text-muted-foreground">Sells (24h)</div>
                  <div className="font-bold text-danger">{selectedToken.sells?.toLocaleString()}</div>
                </div>
              </div>

              {selectedToken.contractAddress && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Contract</div>
                  <code className="text-xs font-mono text-primary break-all">{selectedToken.contractAddress}</code>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="gap-1" onClick={() => window.open(`https://dexscreener.com/${chain.id}/${selectedToken.contractAddress}`, '_blank')}>
                  <ExternalLink className="w-4 h-4" /> DexScreener
                </Button>
                <Button className="gap-1" onClick={handleViewDetails}>
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
