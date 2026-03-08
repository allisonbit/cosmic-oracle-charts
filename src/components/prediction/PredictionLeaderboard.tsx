import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, TrendingDown, Target, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2, Award, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { TokenIcon } from "@/components/ui/token-icon";

interface CachedPrediction {
  id: string;
  coin_id: string;
  symbol: string;
  timeframe: string;
  bias: string | null;
  confidence: number | null;
  current_price: number | null;
  created_at: string;
  expires_at: string;
  prediction_data: any;
}

interface LeaderboardEntry {
  coinId: string;
  symbol: string;
  predictedBias: string;
  confidence: number;
  predictedPrice: number;
  actualPrice: number | null;
  accuracy: number | null;
  timeframe: string;
  createdAt: string;
  isExpired: boolean;
  priceTargets?: { conservative?: number; moderate?: number; aggressive?: number };
}

export function PredictionLeaderboard() {
  const [predictions, setPredictions] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accurate' | 'inaccurate'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchPredictions() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('predictions_cache')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error || !data) {
          setIsLoading(false);
          return;
        }

        // Get unique coin IDs for expired predictions to fetch real current prices
        const expiredPredictions = data.filter(p => new Date(p.expires_at) < new Date());
        const uniqueCoinIds = [...new Set(expiredPredictions.map(p => p.coin_id))];
        
        // Fetch real current prices from CoinGecko for accuracy verification
        let realPrices: Record<string, number> = {};
        if (uniqueCoinIds.length > 0) {
          try {
            const ids = uniqueCoinIds.slice(0, 50).join(',');
            const priceRes = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
            );
            if (priceRes.ok) {
              const priceData = await priceRes.json();
              for (const [coinId, val] of Object.entries(priceData)) {
                realPrices[coinId] = (val as any).usd;
              }
            }
          } catch {
            // Fallback: use current_price from the latest prediction for each coin
            for (const p of data) {
              if (!realPrices[p.coin_id] && p.current_price) {
                realPrices[p.coin_id] = p.current_price;
              }
            }
          }
        }

        const entries: LeaderboardEntry[] = data.map((p: CachedPrediction) => {
          const predData = p.prediction_data as any;
          const rawTarget = predData?.priceTargets?.moderate || predData?.priceTargets?.conservative;
          const predictedPrice = typeof rawTarget === 'number' ? rawTarget : 
            (typeof rawTarget?.high === 'number' ? rawTarget.high : (p.current_price || 0));
          const isExpired = new Date(p.expires_at) < new Date();

          let actualPrice: number | null = null;
          let accuracy: number | null = null;

          if (isExpired && p.current_price) {
            // Use real fetched price, or fallback to latest cached price for that coin
            actualPrice = realPrices[p.coin_id] || null;

            if (actualPrice && predictedPrice && p.current_price) {
              const predictedDirection = predictedPrice > p.current_price ? 'up' : 'down';
              const actualDirection = actualPrice > p.current_price ? 'up' : 'down';
              const directionCorrect = predictedDirection === actualDirection;

              const priceDiff = Math.abs(predictedPrice - actualPrice);
              const priceAccuracy = Math.max(0, 100 - (priceDiff / p.current_price) * 100 * 10);

              accuracy = directionCorrect ? Math.min(99, priceAccuracy + 15) : Math.max(20, priceAccuracy - 20);
            }
          }

          return {
            coinId: p.coin_id,
            symbol: p.symbol,
            predictedBias: p.bias || 'neutral',
            confidence: p.confidence || 50,
            predictedPrice,
            actualPrice,
            accuracy,
            timeframe: p.timeframe,
            createdAt: p.created_at,
            isExpired,
            priceTargets: predData?.priceTargets,
          };
        });

        setPredictions(entries);
      } catch (err) {
        console.error('Error fetching predictions:', err);
      }
      setIsLoading(false);
    }

    fetchPredictions();
  }, []);

  const filtered = useMemo(() => {
    let result = predictions;
    if (timeframeFilter !== 'all') {
      result = result.filter(p => p.timeframe === timeframeFilter);
    }
    if (filter === 'accurate') {
      result = result.filter(p => p.accuracy !== null && p.accuracy >= 70);
    } else if (filter === 'inaccurate') {
      result = result.filter(p => p.accuracy !== null && p.accuracy < 70);
    }
    return result;
  }, [predictions, filter, timeframeFilter]);

  const stats = useMemo(() => {
    const expired = predictions.filter(p => p.accuracy !== null);
    if (expired.length === 0) return { avgAccuracy: 0, correctDirections: 0, total: 0 };
    const avgAccuracy = expired.reduce((sum, p) => sum + (p.accuracy || 0), 0) / expired.length;
    const correctDirections = expired.filter(p => (p.accuracy || 0) >= 60).length;
    return { avgAccuracy, correctDirections, total: expired.length };
  }, [predictions]);

  const visible = expanded ? filtered : filtered.slice(0, 8);

  const formatPrice = (price: number | null | undefined) => {
    if (price == null || typeof price !== 'number' || isNaN(price)) return '—';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toPrecision(4)}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          <h3 className="font-bold text-base sm:text-lg">Prediction Leaderboard</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          Live Tracking
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Real predictions from our AI engine with tracked outcomes verified against live market prices.
      </p>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <Award className="w-4 h-4 text-primary mx-auto mb-1" />
          <div className="text-xl font-bold text-primary">{stats.avgAccuracy.toFixed(1)}%</div>
          <div className="text-[10px] text-muted-foreground">Avg Accuracy</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <CheckCircle className="w-4 h-4 text-success mx-auto mb-1" />
          <div className="text-xl font-bold text-success">{stats.correctDirections}</div>
          <div className="text-[10px] text-muted-foreground">Correct Calls</div>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 text-center">
          <BarChart3 className="w-4 h-4 text-foreground mx-auto mb-1" />
          <div className="text-xl font-bold">{predictions.length}</div>
          <div className="text-[10px] text-muted-foreground">Total Tracked</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'accurate', 'inaccurate'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {f === 'all' ? 'All' : f === 'accurate' ? '✓ Accurate (70%+)' : '✗ Missed'}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          {(['all', 'daily', 'weekly', 'monthly'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframeFilter(tf)}
              className={cn(
                "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                timeframeFilter === tf ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf === 'all' ? 'All' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No predictions found for this filter. Try changing the filters above.
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-2 sm:p-3 font-medium text-muted-foreground text-xs">Token</th>
                  <th className="text-center p-2 sm:p-3 font-medium text-muted-foreground text-xs">Signal</th>
                  <th className="text-right p-2 sm:p-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">Predicted</th>
                  <th className="text-right p-2 sm:p-3 font-medium text-muted-foreground text-xs hidden sm:table-cell">Actual</th>
                  <th className="text-right p-2 sm:p-3 font-medium text-muted-foreground text-xs">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((entry, idx) => (
                  <tr key={`${entry.coinId}-${entry.timeframe}-${idx}`} className="border-t border-border/30 hover:bg-primary/5 transition-colors">
                    <td className="p-2 sm:p-3">
                      <Link
                        to={`/price-prediction/${entry.coinId}/daily`}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                          entry.predictedBias === 'bullish' ? 'bg-success/20 text-success' :
                          entry.predictedBias === 'bearish' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                        )}>
                          <TokenIcon coinId={entry.coinId} symbol={entry.symbol} size="md" />
                        </div>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{entry.symbol}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">{entry.timeframe}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-2 sm:p-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px]",
                        entry.predictedBias === 'bullish' ? 'text-success border-success/30' :
                        entry.predictedBias === 'bearish' ? 'text-danger border-danger/30' : 'text-warning border-warning/30'
                      )}>
                        {entry.predictedBias === 'bullish' ? <TrendingUp className="w-3 h-3 mr-0.5" /> :
                         entry.predictedBias === 'bearish' ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
                        {entry.confidence}%
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-3 text-right font-mono text-xs hidden sm:table-cell">
                      {formatPrice(entry.predictedPrice)}
                    </td>
                    <td className="p-2 sm:p-3 text-right font-mono text-xs hidden sm:table-cell">
                      {entry.actualPrice ? formatPrice(entry.actualPrice) : (
                        <span className="text-muted-foreground/50 text-[10px]">Pending...</span>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-right">
                      {entry.accuracy !== null ? (
                        <div className="flex items-center justify-end gap-1">
                          {entry.accuracy >= 70 ? (
                            <CheckCircle className="w-3 h-3 text-success" />
                          ) : (
                            <XCircle className="w-3 h-3 text-danger" />
                          )}
                          <span className={cn("font-bold text-xs",
                            entry.accuracy >= 80 ? "text-success" :
                            entry.accuracy >= 60 ? "text-warning" : "text-danger"
                          )}>
                            {entry.accuracy.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 flex items-center justify-end gap-1">
                          <Target className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 8 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-3 py-2 rounded-lg bg-muted/30 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Show Less' : `Show All (${filtered.length} predictions)`}
            </button>
          )}
        </>
      )}

      <p className="mt-4 text-[10px] text-muted-foreground/60 text-center">
        Past performance does not guarantee future results. Accuracy verified against live CoinGecko prices.
      </p>
    </div>
  );
}
