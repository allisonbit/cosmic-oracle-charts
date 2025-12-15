import { TrendingUp, TrendingDown, Gauge, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRealtimeStrength } from "@/hooks/useRealtimeStrength";

export function StrengthMeterWidget() {
  const { assets, chains, lastUpdate, isConnected, refresh } = useRealtimeStrength('24h');

  const topAssets = assets.slice(0, 5);
  const topChains = chains.slice(0, 4);

  const getStrengthColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const getStrengthBg = (score: number) => {
    if (score >= 70) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="holo-card p-3 sm:p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-display text-xs sm:text-sm md:text-base font-bold flex items-center gap-2">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="truncate">STRENGTH METER</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-success animate-pulse" : "bg-danger")} />
            <span className="text-[8px] sm:text-[10px] text-muted-foreground font-display">LIVE</span>
          </div>
          <button 
            onClick={refresh}
            className="p-1 hover:bg-muted/50 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
          </button>
          <Link to="/strength-meter" className="text-primary hover:text-primary/80 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Assets */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-display uppercase">Top Assets</p>
        {topAssets.map((asset, idx) => (
          <div key={asset.id} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-3">{idx + 1}</span>
            <div className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
              <img src={asset.logo} alt={asset.symbol} className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <span className="text-[10px] sm:text-xs font-medium flex-1 truncate">{asset.symbol}</span>
            <div className="flex-1 max-w-[60px] sm:max-w-[80px] h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", getStrengthBg(asset.strengthScore))}
                style={{ width: `${asset.strengthScore}%` }}
              />
            </div>
            <span className={cn("text-[10px] sm:text-xs font-bold w-8 text-right", getStrengthColor(asset.strengthScore))}>
              {asset.strengthScore}
            </span>
            {asset.priceChange24h >= 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger" />
            )}
          </div>
        ))}
      </div>

      {/* Top Chains */}
      <div className="space-y-1.5 sm:space-y-2">
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-display uppercase">Top Chains</p>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {topChains.map((chain) => (
            <Link 
              key={chain.id} 
              to={`/chain/${chain.id}`}
              className="flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden">
                <img src={chain.logo} alt={chain.symbol} className="w-3 h-3" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-medium truncate flex-1">{chain.symbol}</span>
              <span className={cn("text-[9px] sm:text-[10px] font-bold", getStrengthColor(chain.strengthScore))}>
                {chain.strengthScore}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[8px] text-muted-foreground mt-2 sm:mt-3 text-center">
        Updated {new Date(lastUpdate).toLocaleTimeString()}
      </p>
    </div>
  );
}
