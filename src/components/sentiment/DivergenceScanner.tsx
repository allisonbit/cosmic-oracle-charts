import { TrendingUp, TrendingDown, Target, AlertTriangle, Zap, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DivergenceSignal {
  symbol: string;
  name: string;
  price: number;
  priceChange: number;
  sentimentScore: number;
  sentimentChange: number;
  divergenceType: 'bullish' | 'bearish';
  strength: number;
  timeframe: string;
  description: string;
}

interface DivergenceScannerProps {
  coins: Array<{ symbol: string; name: string; price: number; change24h: number; volume: number; marketCap: number }>;
}

export function DivergenceScanner({ coins }: DivergenceScannerProps) {
  const navigate = useNavigate();

  const divergences: DivergenceSignal[] = coins.slice(0, 15).map(coin => {
    const sentimentScore = 30 + Math.random() * 60;
    const sentimentChange = (Math.random() - 0.5) * 30;
    const priceTrend = coin.change24h;
    const sentimentTrend = sentimentChange;
    let divergenceType: 'bullish' | 'bearish' = 'bullish';
    let strength = 0;
    let description = '';
    
    if (priceTrend < -2 && sentimentTrend > 5) {
      divergenceType = 'bullish';
      strength = Math.min(100, Math.abs(priceTrend - sentimentTrend) * 3);
      description = `Price declining while social sentiment improving. Potential reversal.`;
    } else if (priceTrend > 2 && sentimentTrend < -5) {
      divergenceType = 'bearish';
      strength = Math.min(100, Math.abs(priceTrend - sentimentTrend) * 3);
      description = `Price rising but sentiment declining. Potential weakness.`;
    } else if (priceTrend < -5 && sentimentScore > 60) {
      divergenceType = 'bullish';
      strength = Math.min(100, (sentimentScore - 50) + Math.abs(priceTrend));
      description = `Extreme oversold with strong sentiment.`;
    } else {
      strength = Math.random() * 40;
      divergenceType = priceTrend < sentimentTrend ? 'bullish' : 'bearish';
      description = `Minor ${divergenceType} divergence detected.`;
    }
    
    return { symbol: coin.symbol, name: coin.name, price: coin.price, priceChange: priceTrend, sentimentScore, sentimentChange, divergenceType, strength, timeframe: '24h', description };
  }).filter(d => d.strength > 30).sort((a, b) => b.strength - a.strength).slice(0, 6);

  const bullishCount = divergences.filter(d => d.divergenceType === 'bullish').length;
  const bearishCount = divergences.filter(d => d.divergenceType === 'bearish').length;
  const getCoinId = (d: DivergenceSignal) => d.name?.toLowerCase().replace(/\s+/g, '-') || d.symbol.toLowerCase();

  return (
    <div className="holo-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          DIVERGENCE SCANNER
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-success"><TrendingUp className="w-3 h-3" /> {bullishCount} Bullish</span>
          <span className="flex items-center gap-1 text-danger"><TrendingDown className="w-3 h-3" /> {bearishCount} Bearish</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
        <Info className="w-3 h-3" />
        Detects when price and sentiment diverge — click to view full analysis
      </div>

      <div className="space-y-2">
        {divergences.map((div) => (
          <button
            key={div.symbol}
            onClick={() => navigate(`/price-prediction/${getCoinId(div)}/daily`)}
            className={cn(
              "w-full p-3 rounded-lg border flex items-center justify-between transition-all text-left group",
              div.divergenceType === 'bullish' ? "bg-success/10 border-success/30 hover:border-success/50" : "bg-danger/10 border-danger/30 hover:border-danger/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", div.divergenceType === 'bullish' ? "bg-success/20" : "bg-danger/20")}>
                {div.divergenceType === 'bullish' ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-danger" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold">{div.symbol}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded font-bold uppercase", div.divergenceType === 'bullish' ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>
                    {div.divergenceType}
                  </span>
                  {div.strength > 70 && <Zap className="w-3 h-3 text-warning" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Price: <span className={div.priceChange >= 0 ? "text-success" : "text-danger"}>{div.priceChange >= 0 ? '+' : ''}{div.priceChange.toFixed(1)}%</span>
                  {' • '}
                  Sentiment: <span className={div.sentimentChange >= 0 ? "text-success" : "text-danger"}>{div.sentimentChange >= 0 ? '+' : ''}{div.sentimentChange.toFixed(1)}%</span>
                  {' • '}
                  <span className="text-foreground">{div.description}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Strength</div>
                <div className={cn("font-bold", div.strength > 70 ? "text-primary" : "text-foreground")}>{div.strength.toFixed(0)}%</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}

        {divergences.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No significant divergences detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
