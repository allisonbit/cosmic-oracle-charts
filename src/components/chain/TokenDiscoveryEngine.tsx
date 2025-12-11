import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { useTokenDiscovery, DiscoveryToken } from "@/hooks/useTokenDiscovery";
import { TrendingUp, TrendingDown, Sparkles, AlertTriangle, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { TokenDetailModal, TokenModalData } from "./TokenDetailModal";

interface TokenDiscoveryEngineProps {
  chain: ChainConfig;
}

export function TokenDiscoveryEngine({ chain }: TokenDiscoveryEngineProps) {
  const { data, isLoading, dataUpdatedAt } = useTokenDiscovery(chain.id);
  const [selectedToken, setSelectedToken] = useState<TokenModalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTokenClick = (token: DiscoveryToken) => {
    setSelectedToken({
      symbol: token.symbol,
      name: token.name,
      price: token.price,
      change24h: token.change24h,
      change7d: token.change7d,
      volume24h: token.volume24h,
      marketCap: token.marketCap,
      rank: token.rank,
      logo: token.logo,
      momentum: token.momentum,
      volumeSpike: token.volumeSpike,
      volatility: token.volatility,
      liquidityScore: token.liquidityScore,
      sparkline: token.sparkline,
      coingeckoId: token.coingeckoId,
    });
    setModalOpen(true);
  };

  const rising = data?.tokens.filter(t => t.category === 'rising') || [];
  const crashing = data?.tokens.filter(t => t.category === 'crashing') || [];
  const newLaunches = data?.tokens.filter(t => t.category === 'new') || [];
  const unusual = data?.tokens.filter(t => t.category === 'unusual') || [];

  const categories = [
    {
      id: "rising",
      label: "Rising Stars",
      icon: TrendingUp,
      color: "success",
      description: "Trending coins with strong momentum",
      tokens: rising,
    },
    {
      id: "crashing",
      label: "Under Pressure",
      icon: TrendingDown,
      color: "danger",
      description: "Biggest losers in 24h",
      tokens: crashing,
    },
    {
      id: "new",
      label: "High Activity",
      icon: Sparkles,
      color: "secondary",
      description: "Abnormal volume & activity",
      tokens: newLaunches,
    },
    {
      id: "unusual",
      label: "Unusual Moves",
      icon: AlertTriangle,
      color: "warning",
      description: "High volatility detected",
      tokens: unusual,
    },
  ];

  const formatPrice = (price: number | string | undefined) => {
    const p = Number(price) || 0;
    if (p >= 1000) return `$${(p / 1000).toFixed(1)}K`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    if (p >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toFixed(6)}`;
  };

  const formatVolume = (vol: number | string | undefined) => {
    const v = Number(vol) || 0;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
    return `$${v.toFixed(0)}`;
  };

  const formatMarketCap = (mc: number | string | undefined) => {
    const m = Number(mc) || 0;
    if (m >= 1e12) return `$${(m / 1e12).toFixed(2)}T`;
    if (m >= 1e9) return `$${(m / 1e9).toFixed(2)}B`;
    if (m >= 1e6) return `$${(m / 1e6).toFixed(1)}M`;
    return `$${(m / 1e3).toFixed(1)}K`;
  };

  const renderSparkline = (sparkline: number[] | undefined) => {
    if (!sparkline || sparkline.length < 2) return null;
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const height = 24;
    const width = 60;
    const points = sparkline.map((val, i) => {
      const x = (i / (sparkline.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    const isUp = sparkline[sparkline.length - 1] > sparkline[0];
    
    return (
      <svg width={width} height={height} className="opacity-60">
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const TokenCard = ({ token }: { token: DiscoveryToken }) => (
    <button
      onClick={() => handleTokenClick(token)}
      className="w-full text-left group p-3 rounded-xl bg-background/60 border border-border/40 hover:border-primary/30 hover:bg-background/80 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {token.logo && (
          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">{token.symbol}</span>
              {token.rank && token.rank <= 100 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">#{token.rank}</span>
              )}
            </div>
            <span className={cn(
              "text-xs font-bold",
              token.change24h >= 0 ? "text-success" : "text-danger"
            )}>
              {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{token.name}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-foreground">{formatPrice(token.price)}</span>
            {renderSparkline(token.sparkline)}
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-border/30">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">Volume</p>
              <p className="text-xs font-medium text-foreground">{formatVolume(token.volume24h)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">MCap</p>
              <p className="text-xs font-medium text-foreground">{formatMarketCap(token.marketCap)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">7D</p>
              <p className={cn(
                "text-xs font-medium",
                token.change7d >= 0 ? "text-success" : "text-danger"
              )}>
                {token.change7d >= 0 ? "+" : ""}{token.change7d.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden" title={`Momentum: ${token.momentum.toFixed(0)}%`}>
              <div 
                className="h-full bg-primary rounded-full transition-all" 
                style={{ width: `${Math.min(100, token.momentum)}%` }} 
              />
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden" title={`Volume Spike: ${token.volumeSpike.toFixed(0)}%`}>
              <div 
                className="h-full bg-secondary rounded-full transition-all" 
                style={{ width: `${Math.min(100, token.volumeSpike)}%` }} 
              />
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden" title={`Volatility: ${token.volatility.toFixed(0)}%`}>
              <div 
                className="h-full bg-warning rounded-full transition-all" 
                style={{ width: `${Math.min(100, token.volatility)}%` }} 
              />
            </div>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
            <span>Mom</span>
            <span>Vol</span>
            <span>Risk</span>
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Token Discovery Engine</h3>
          <p className="text-sm text-muted-foreground">Live market scanner • Real-time data</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Loading...'}</span>
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            isLoading ? "bg-warning" : "bg-success"
          )} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={cn(
              "p-4 rounded-xl border transition-all",
              cat.color === "success" && "border-success/30 bg-success/5",
              cat.color === "danger" && "border-danger/30 bg-danger/5",
              cat.color === "secondary" && "border-secondary/30 bg-secondary/5",
              cat.color === "warning" && "border-warning/30 bg-warning/5"
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center",
                cat.color === "success" && "bg-success/20",
                cat.color === "danger" && "bg-danger/20",
                cat.color === "secondary" && "bg-secondary/20",
                cat.color === "warning" && "bg-warning/20"
              )}>
                <cat.icon className={cn(
                  "h-5 w-5",
                  cat.color === "success" && "text-success",
                  cat.color === "danger" && "text-danger",
                  cat.color === "secondary" && "text-secondary",
                  cat.color === "warning" && "text-warning"
                )} />
              </div>
              <div>
                <h4 className="text-sm font-display text-foreground">{cat.label}</h4>
                <p className="text-[10px] text-muted-foreground">{cat.description}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
                ))
              ) : cat.tokens.length > 0 ? (
                cat.tokens.slice(0, 4).map((token) => (
                  <TokenCard key={token.coingeckoId || token.symbol} token={token} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">No tokens detected</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TokenDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        token={selectedToken}
      />
    </div>
  );
}
