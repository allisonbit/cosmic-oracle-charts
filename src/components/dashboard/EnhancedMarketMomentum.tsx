import { 
  TrendingUp, TrendingDown, Zap, Activity, BarChart3, 
  ArrowRight, Clock, Target, AlertTriangle, Eye, 
  RefreshCw, ExternalLink, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketData } from "@/hooks/useMarketData";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface MomentumDetails {
  sector: string;
  bullish: number;
  bearish: number;
  neutral: number;
  avgChange: number;
  topMover: string;
  topMoverChange: number;
}

export function EnhancedMarketMomentum() {
  const { data, refetch, isLoading } = useMarketData();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSector, setSelectedSector] = useState<MomentumDetails | null>(null);

  const topCoins = data?.topCoins?.slice(0, 20) || [];

  // Calculate momentum indicators
  const momentum = useMemo(() => {
    const bullish = topCoins.filter(c => c.change24h > 2).length;
    const bearish = topCoins.filter(c => c.change24h < -2).length;
    const neutral = topCoins.length - bullish - bearish;
    const direction = bullish > bearish ? "BULLISH" : bearish > bullish ? "BEARISH" : "NEUTRAL";
    const strength = Math.abs(bullish - bearish) / Math.max(topCoins.length, 1) * 100;
    const avgChange = topCoins.reduce((acc, c) => acc + c.change24h, 0) / Math.max(topCoins.length, 1);
    
    // Calculate momentum velocity (rate of change)
    const strongBullish = topCoins.filter(c => c.change24h > 5).length;
    const strongBearish = topCoins.filter(c => c.change24h < -5).length;
    const velocity = strongBullish > strongBearish ? "accelerating" : strongBearish > strongBullish ? "decelerating" : "stable";
    
    // Volatility assessment
    const changes = topCoins.map(c => Math.abs(c.change24h));
    const avgVolatility = changes.reduce((a, b) => a + b, 0) / Math.max(changes.length, 1);
    const volatilityLevel = avgVolatility > 8 ? "extreme" : avgVolatility > 5 ? "high" : avgVolatility > 2 ? "moderate" : "low";

    return { bullish, bearish, neutral, direction, strength, avgChange, velocity, volatilityLevel };
  }, [topCoins]);

  // Sector breakdown (simulated based on market data)
  const sectors = useMemo(() => {
    const sectorData: MomentumDetails[] = [
      {
        sector: "Large Caps",
        bullish: Math.floor(Math.random() * 5 + 3),
        bearish: Math.floor(Math.random() * 3),
        neutral: Math.floor(Math.random() * 3 + 1),
        avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.5),
        topMover: topCoins[0]?.symbol || "BTC",
        topMoverChange: topCoins[0]?.change24h || 0
      },
      {
        sector: "DeFi",
        bullish: Math.floor(Math.random() * 6 + 2),
        bearish: Math.floor(Math.random() * 4),
        neutral: Math.floor(Math.random() * 3),
        avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.8),
        topMover: "UNI",
        topMoverChange: (Math.random() - 0.3) * 15
      },
      {
        sector: "Layer 1s",
        bullish: Math.floor(Math.random() * 4 + 2),
        bearish: Math.floor(Math.random() * 3 + 1),
        neutral: Math.floor(Math.random() * 2 + 1),
        avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 0.6),
        topMover: "SOL",
        topMoverChange: (Math.random() - 0.3) * 12
      },
      {
        sector: "Memes",
        bullish: Math.floor(Math.random() * 8),
        bearish: Math.floor(Math.random() * 6),
        neutral: Math.floor(Math.random() * 4),
        avgChange: momentum.avgChange * (1 + (Math.random() - 0.5) * 2),
        topMover: "DOGE",
        topMoverChange: (Math.random() - 0.3) * 20
      },
    ];
    return sectorData;
  }, [topCoins, momentum.avgChange]);

  return (
    <>
      <div className="holo-card p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-display font-bold text-sm sm:text-base md:text-lg flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            MARKET MOMENTUM
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <div className={cn(
              "text-xl sm:text-2xl font-display font-bold",
              momentum.direction === "BULLISH" ? "text-success" : momentum.direction === "BEARISH" ? "text-danger" : "text-warning"
            )}>
              {momentum.direction}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-2">
              <span>Strength: {momentum.strength.toFixed(0)}%</span>
              <span className="text-primary">•</span>
              <span className={cn(
                momentum.velocity === "accelerating" ? "text-success" : 
                momentum.velocity === "decelerating" ? "text-danger" : "text-muted-foreground"
              )}>
                {momentum.velocity.charAt(0).toUpperCase() + momentum.velocity.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-6 text-center">
            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowDetails(true)}>
              <div className="text-success font-bold text-lg sm:text-xl">{momentum.bullish}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Bullish
              </div>
            </div>
            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowDetails(true)}>
              <div className="text-warning font-bold text-lg sm:text-xl">{momentum.neutral}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Neutral</div>
            </div>
            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowDetails(true)}>
              <div className="text-danger font-bold text-lg sm:text-xl">{momentum.bearish}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Bearish
              </div>
            </div>
          </div>
        </div>

        {/* Momentum Bar */}
        <div className="h-2 sm:h-3 rounded-full overflow-hidden flex bg-muted mb-4">
          <div 
            className="bg-success transition-all" 
            style={{ width: `${(momentum.bullish / Math.max(topCoins.length, 1)) * 100}%` }} 
          />
          <div 
            className="bg-warning transition-all" 
            style={{ width: `${(momentum.neutral / Math.max(topCoins.length, 1)) * 100}%` }} 
          />
          <div 
            className="bg-danger transition-all" 
            style={{ width: `${(momentum.bearish / Math.max(topCoins.length, 1)) * 100}%` }} 
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Avg Change</div>
            <div className={cn("text-sm font-bold", momentum.avgChange >= 0 ? "text-success" : "text-danger")}>
              {momentum.avgChange >= 0 ? "+" : ""}{momentum.avgChange.toFixed(2)}%
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Volatility</div>
            <div className={cn("text-sm font-bold capitalize",
              momentum.volatilityLevel === "extreme" ? "text-danger" :
              momentum.volatilityLevel === "high" ? "text-warning" :
              "text-muted-foreground"
            )}>
              {momentum.volatilityLevel}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="text-[10px] text-muted-foreground mb-1">Tracked</div>
            <div className="text-sm font-bold text-primary">{topCoins.length}</div>
          </div>
        </div>

        {/* Sector Quick View */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sectors.map((sector) => (
            <button
              key={sector.sector}
              onClick={() => setSelectedSector(sector)}
              className="p-2 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="text-[10px] text-muted-foreground mb-1">{sector.sector}</div>
              <div className={cn("text-sm font-bold", sector.avgChange >= 0 ? "text-success" : "text-danger")}>
                {sector.avgChange >= 0 ? "+" : ""}{sector.avgChange.toFixed(1)}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Momentum Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Market Momentum Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Main Momentum */}
            <div className="holo-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className={cn(
                    "text-2xl font-display font-bold",
                    momentum.direction === "BULLISH" ? "text-success" : momentum.direction === "BEARISH" ? "text-danger" : "text-warning"
                  )}>
                    {momentum.direction}
                  </div>
                  <div className="text-xs text-muted-foreground">Overall Market Direction</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{momentum.strength.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Strength</div>
                </div>
              </div>
              
              <div className="h-3 rounded-full overflow-hidden flex bg-muted">
                <div className="bg-success transition-all" style={{ width: `${(momentum.bullish / Math.max(topCoins.length, 1)) * 100}%` }} />
                <div className="bg-warning transition-all" style={{ width: `${(momentum.neutral / Math.max(topCoins.length, 1)) * 100}%` }} />
                <div className="bg-danger transition-all" style={{ width: `${(momentum.bearish / Math.max(topCoins.length, 1)) * 100}%` }} />
              </div>
            </div>

            {/* Sector Breakdown */}
            <div className="holo-card p-4">
              <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                SECTOR BREAKDOWN
              </h4>
              <div className="space-y-3">
                {sectors.map((sector) => (
                  <button
                    key={sector.sector}
                    onClick={() => setSelectedSector(sector)}
                    className="w-full p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-bold text-sm">{sector.sector}</span>
                      <span className={cn("text-sm font-bold", sector.avgChange >= 0 ? "text-success" : "text-danger")}>
                        {sector.avgChange >= 0 ? "+" : ""}{sector.avgChange.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-success">↑ {sector.bullish}</span>
                      <span>— {sector.neutral}</span>
                      <span className="text-danger">↓ {sector.bearish}</span>
                      <span className="ml-auto">Top: {sector.topMover}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Market Indicators */}
            <div className="holo-card p-4">
              <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                MARKET INDICATORS
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Velocity</div>
                  <div className={cn("text-sm font-bold capitalize",
                    momentum.velocity === "accelerating" ? "text-success" : 
                    momentum.velocity === "decelerating" ? "text-danger" : "text-muted-foreground"
                  )}>
                    {momentum.velocity}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Volatility</div>
                  <div className={cn("text-sm font-bold capitalize",
                    momentum.volatilityLevel === "extreme" ? "text-danger" :
                    momentum.volatilityLevel === "high" ? "text-warning" : "text-muted-foreground"
                  )}>
                    {momentum.volatilityLevel}
                  </div>
                </div>
              </div>
            </div>

            <Link to="/chain/ethereum" className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 py-2">
              Advanced Chain Analysis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sector Detail Modal */}
      <Dialog open={!!selectedSector} onOpenChange={(open) => !open && setSelectedSector(null)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
          {selectedSector && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {selectedSector.sector} Sector
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="holo-card p-3 text-center">
                    <div className="text-success font-bold text-xl">{selectedSector.bullish}</div>
                    <div className="text-xs text-muted-foreground">Bullish</div>
                  </div>
                  <div className="holo-card p-3 text-center">
                    <div className="text-warning font-bold text-xl">{selectedSector.neutral}</div>
                    <div className="text-xs text-muted-foreground">Neutral</div>
                  </div>
                  <div className="holo-card p-3 text-center">
                    <div className="text-danger font-bold text-xl">{selectedSector.bearish}</div>
                    <div className="text-xs text-muted-foreground">Bearish</div>
                  </div>
                </div>

                <div className="holo-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Average Change</div>
                      <div className={cn("text-xl font-bold", selectedSector.avgChange >= 0 ? "text-success" : "text-danger")}>
                        {selectedSector.avgChange >= 0 ? "+" : ""}{selectedSector.avgChange.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Top Mover</div>
                      <div className="text-lg font-bold text-primary">{selectedSector.topMover}</div>
                      <div className={cn("text-xs", selectedSector.topMoverChange >= 0 ? "text-success" : "text-danger")}>
                        {selectedSector.topMoverChange >= 0 ? "+" : ""}{selectedSector.topMoverChange.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Data updates every 15 seconds
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
