import { 
  BarChart3, TrendingUp, TrendingDown, ArrowRight, Eye, 
  ExternalLink, Copy, Activity, Zap, RefreshCw, Clock,
  Globe, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface VolumeLeader {
  symbol: string;
  name: string;
  volume: number;
  price: number;
  change24h: number;
  marketCap: number;
  volumeToMcap: number;
  rank: number;
}

export function EnhancedVolumeLeaders() {
  const { data, refetch, isLoading } = useMarketData();
  const [selectedCoin, setSelectedCoin] = useState<VolumeLeader | null>(null);
  const [showAll, setShowAll] = useState(false);

  const volumeLeaders = useMemo(() => {
    const coins = data?.topCoins || [];
    return [...coins]
      .map((coin, index) => ({
        ...coin,
        volumeToMcap: (coin.volume / coin.marketCap) * 100,
        rank: index + 1
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, showAll ? 12 : 6);
  }, [data, showAll]);

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`;
    return `$${vol.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const maxVolume = volumeLeaders[0]?.volume || 1;
  const totalVolume = volumeLeaders.reduce((acc, c) => acc + c.volume, 0);

  return (
    <>
      <div className="holo-card p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            VOLUME LEADERS
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isLoading ? "bg-warning" : "bg-success")} />
            Live
          </div>
        </div>

        {/* Total Volume Summary */}
        <div className="bg-muted/30 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Combined 24h Volume</div>
            <div className="text-lg font-bold text-primary">{formatVolume(totalVolume)}</div>
          </div>
          <Activity className="w-6 h-6 text-primary/50" />
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {volumeLeaders.map((coin, i) => (
            <button
              key={coin.symbol}
              onClick={() => setSelectedCoin(coin)}
              className="w-full space-y-1.5 sm:space-y-2 text-left hover:bg-muted/20 p-2 -mx-2 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground w-4 sm:w-5">{i + 1}</span>
                  <span className="font-display font-bold text-sm sm:text-base">{coin.symbol}</span>
                  <span className={cn(
                    "text-[10px] sm:text-xs flex items-center gap-0.5",
                    coin.change24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {coin.change24h.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">{formatVolume(coin.volume)}</span>
                  <Eye className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="h-1.5 sm:h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                  style={{ width: `${(coin.volume / maxVolume) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Vol/MCap: {coin.volumeToMcap.toFixed(1)}%</span>
                <span className={cn(
                  coin.volumeToMcap > 10 ? "text-success" : coin.volumeToMcap > 5 ? "text-warning" : "text-muted-foreground"
                )}>
                  {coin.volumeToMcap > 10 ? "High Activity" : coin.volumeToMcap > 5 ? "Active" : "Normal"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 pt-3 border-t border-border/30 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1"
        >
          {showAll ? "Show Less" : "Show More"} <ArrowRight className={cn("w-4 h-4 transition-transform", showAll && "rotate-90")} />
        </button>
      </div>

      {/* Volume Detail Modal */}
      <Dialog open={!!selectedCoin} onOpenChange={(open) => !open && setSelectedCoin(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedCoin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-display font-bold text-primary">{selectedCoin.symbol[0]}</span>
                  </div>
                  <div>
                    <span className="font-display text-xl">{selectedCoin.symbol}</span>
                    <span className="text-muted-foreground ml-2 text-sm">{selectedCoin.name}</span>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Volume Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                    <div className="text-xl font-bold text-primary">{formatVolume(selectedCoin.volume)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Rank #{volumeLeaders.findIndex(c => c.symbol === selectedCoin.symbol) + 1}
                    </div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Vol/MCap Ratio</div>
                    <div className={cn("text-xl font-bold",
                      selectedCoin.volumeToMcap > 10 ? "text-success" : 
                      selectedCoin.volumeToMcap > 5 ? "text-warning" : "text-muted-foreground"
                    )}>
                      {selectedCoin.volumeToMcap.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedCoin.volumeToMcap > 10 ? "Very High" : selectedCoin.volumeToMcap > 5 ? "Above Avg" : "Normal"}
                    </div>
                  </div>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="text-lg font-bold">${selectedCoin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className="holo-card p-3">
                    <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                    <div className={cn("text-lg font-bold flex items-center gap-1", 
                      selectedCoin.change24h >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedCoin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Market Cap */}
                <div className="holo-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                      <div className="text-lg font-bold">{formatNumber(selectedCoin.marketCap)}</div>
                    </div>
                    <Zap className="w-6 h-6 text-primary/50" />
                  </div>
                </div>

                {/* Volume Analysis */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    VOLUME ANALYSIS
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedCoin.volumeToMcap > 15 && (
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-success mt-0.5" />
                        <span>Extremely high trading activity - possible breakout or major event</span>
                      </div>
                    )}
                    {selectedCoin.volumeToMcap > 10 && selectedCoin.volumeToMcap <= 15 && (
                      <div className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-warning mt-0.5" />
                        <span>Very active trading - increased interest and volatility expected</span>
                      </div>
                    )}
                    {selectedCoin.volumeToMcap <= 10 && selectedCoin.volumeToMcap > 5 && (
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-primary mt-0.5" />
                        <span>Above average volume - healthy market interest</span>
                      </div>
                    )}
                    {selectedCoin.volumeToMcap <= 5 && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span>Normal trading activity - stable market conditions</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* External Links */}
                <div className="holo-card p-4">
                  <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    RESEARCH LINKS
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "CoinGecko", url: `https://www.coingecko.com/en/coins/${selectedCoin.name?.toLowerCase().replace(/\s+/g, '-')}` },
                      { label: "DexScreener", url: `https://dexscreener.com/ethereum/${selectedCoin.symbol.toLowerCase()}` },
                      { label: "TradingView", url: `https://www.tradingview.com/chart/?symbol=${selectedCoin.symbol}USD` },
                      { label: "CoinMarketCap", url: `https://coinmarketcap.com/currencies/${selectedCoin.name?.toLowerCase().replace(/\s+/g, '-')}` },
                    ].map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-auto text-primary" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedCoin.symbol);
                      toast.success(`${selectedCoin.symbol} copied to clipboard`);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Symbol
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/explorer">
                      Explore <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
