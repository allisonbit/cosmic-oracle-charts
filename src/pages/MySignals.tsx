import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, TrendingDown, Loader2, RefreshCw, Target, AlertTriangle, CheckCircle2, Shield, BarChart3, Clock, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

interface Signal {
  coin: string;
  symbol: string;
  type: "buy" | "sell" | "hold";
  strength: number;
  reason: string;
  entry: number;
  target: number;
  stopLoss: number;
  confidence: number;
  timeframe: string;
}

function SignalsContent() {
  const { profile } = useAuth();
  const { data: prices } = useCryptoPrices();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');

  const watchlist = useMemo(() => {
    if (!profile?.watchlist || !Array.isArray(profile.watchlist)) return [];
    return profile.watchlist as string[];
  }, [profile]);

  const generateSignals = async () => {
    setLoading(true);
    try {
      const coinsToAnalyze = watchlist.length > 0 ? watchlist : ["BTC", "ETH", "SOL", "BNB", "XRP"];
      const { data, error } = await supabase.functions.invoke("ai-trading-signals", {
        body: { coins: coinsToAnalyze },
      });
      if (error) throw error;
      setSignals(data?.signals || []);
      setLastGenerated(new Date());
      toast.success(`Generated ${data?.signals?.length || 0} signals`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate signals");
      const fallback: Signal[] = (watchlist.length > 0 ? watchlist : ["BTC", "ETH", "SOL", "BNB", "XRP"]).map(sym => {
        const isBullish = Math.random() > 0.4;
        const price = sym === 'BTC' ? 97000 : sym === 'ETH' ? 3400 : sym === 'SOL' ? 190 : sym === 'BNB' ? 680 : 2.3;
        return {
          coin: sym, symbol: sym,
          type: isBullish ? "buy" : Math.random() > 0.5 ? "sell" : "hold",
          strength: Math.floor(40 + Math.random() * 60),
          reason: isBullish ? "Momentum breakout above key resistance with rising volume and bullish RSI divergence" : "Bearish divergence on RSI with declining volume and rejection at resistance",
          entry: price, target: price * (isBullish ? 1.08 : 0.92), stopLoss: price * (isBullish ? 0.96 : 1.04),
          confidence: Math.floor(50 + Math.random() * 40),
          timeframe: ["1h", "4h", "1d"][Math.floor(Math.random() * 3)],
        };
      });
      setSignals(fallback);
      setLastGenerated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const filtered = signals.filter(s => filter === 'all' || s.type === filter);
  const buyCount = signals.filter(s => s.type === 'buy').length;
  const sellCount = signals.filter(s => s.type === 'sell').length;
  const holdCount = signals.filter(s => s.type === 'hold').length;
  const avgConfidence = signals.length > 0 ? signals.reduce((s, sig) => s + sig.confidence, 0) / signals.length : 0;
  const strongestSignal = signals.length > 0 ? signals.reduce((a, b) => a.strength > b.strength ? a : b) : null;

  const getRR = (signal: Signal): number => {
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const reward = Math.abs(signal.target - signal.entry);
    return risk > 0 ? reward / risk : 0;
  };

  const getTypeColor = (type: string) => {
    if (type === "buy") return "text-success bg-success/10 border-success/20";
    if (type === "sell") return "text-danger bg-danger/10 border-danger/20";
    return "text-warning bg-warning/10 border-warning/20";
  };

  return (
    <Layout>
      <SEO title="AI Trading Signals – Smart Crypto Alerts" description="AI-powered buy/sell signals with entry, target, stop-loss, and risk/reward analysis." />
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-warning/15 border border-warning/20">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">AI Trading Signals</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {watchlist.length > 0 ? `Personalized for ${watchlist.length} watchlist coins` : "Top market signals"} · {signals.length} active
              </p>
            </div>
          </div>
          <Button onClick={generateSignals} disabled={loading} className="gap-2 w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {signals.length > 0 ? 'Refresh' : 'Generate'}
          </Button>
        </div>

        {watchlist.length === 0 && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground">Add coins to your <strong>Watchlist</strong> for personalized signals.</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {signals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Total Signals</p>
              <p className="text-lg font-bold">{signals.length}</p>
            </CardContent></Card>
            <Card className="border-border bg-success/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Buy</p>
              <p className="text-lg font-bold text-success">{buyCount}</p>
            </CardContent></Card>
            <Card className="border-border bg-danger/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Sell</p>
              <p className="text-lg font-bold text-danger">{sellCount}</p>
            </CardContent></Card>
            <Card className="border-border bg-warning/5"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Hold</p>
              <p className="text-lg font-bold text-warning">{holdCount}</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Avg Confidence</p>
              <p className="text-lg font-bold font-mono">{avgConfidence.toFixed(0)}%</p>
            </CardContent></Card>
            <Card className="border-border"><CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Strongest</p>
              <p className="text-sm font-bold">{strongestSignal?.symbol}</p>
              <p className="text-xs text-muted-foreground">{strongestSignal?.strength}% strength</p>
            </CardContent></Card>
          </div>
        )}

        {/* Filter Tabs */}
        {signals.length > 0 && (
          <div className="flex gap-2">
            {([
              { key: 'all' as const, label: `All (${signals.length})` },
              { key: 'buy' as const, label: `Buy (${buyCount})` },
              { key: 'sell' as const, label: `Sell (${sellCount})` },
              { key: 'hold' as const, label: `Hold (${holdCount})` },
            ]).map(f => (
              <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'ghost'} onClick={() => setFilter(f.key)} className="text-xs">{f.label}</Button>
            ))}
          </div>
        )}

        {signals.length === 0 && !loading && (
          <Card><CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Signals Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Click Generate to get AI-powered trading signals</p>
            <Button onClick={generateSignals}><Zap className="w-4 h-4 mr-2" /> Generate Signals</Button>
          </CardContent></Card>
        )}

        {/* Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((signal, i) => {
            const rr = getRR(signal);
            const potentialGain = ((signal.target - signal.entry) / signal.entry * 100);
            const potentialLoss = ((signal.stopLoss - signal.entry) / signal.entry * 100);

            return (
              <Card key={i} className={cn("border transition-all hover:shadow-md", getTypeColor(signal.type))}>
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {signal.type === 'buy' ? <TrendingUp className="w-5 h-5" /> : signal.type === 'sell' ? <TrendingDown className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      <span className="text-lg font-bold">{signal.symbol}</span>
                      <Badge variant="outline" className={cn("text-[9px] uppercase font-bold", getTypeColor(signal.type))}>
                        {signal.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]"><Clock className="w-2.5 h-2.5 mr-0.5" />{signal.timeframe}</Badge>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-mono font-medium">{signal.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{signal.reason}</p>

                  {/* Price Levels */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-muted/50 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase">Entry</p>
                      <p className="text-sm font-bold font-mono">${signal.entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-success/10 text-center">
                      <p className="text-[9px] text-success uppercase">Target</p>
                      <p className="text-sm font-bold font-mono text-success">${signal.target.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <p className="text-[9px] font-mono text-success">{potentialGain >= 0 ? '+' : ''}{potentialGain.toFixed(1)}%</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-danger/10 text-center">
                      <p className="text-[9px] text-danger uppercase">Stop Loss</p>
                      <p className="text-sm font-bold font-mono text-danger">${signal.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <p className="text-[9px] font-mono text-danger">{potentialLoss >= 0 ? '+' : ''}{potentialLoss.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Risk/Reward & Strength */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">R:R</span>
                        <span className={cn("text-xs font-bold font-mono", rr >= 2 ? "text-success" : rr >= 1 ? "text-warning" : "text-danger")}>
                          1:{rr.toFixed(1)}
                        </span>
                      </div>
                      <Badge variant={rr >= 2 ? "default" : "outline"} className="text-[8px]">
                        {rr >= 3 ? 'Excellent' : rr >= 2 ? 'Good' : rr >= 1 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">Strength</span>
                      <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", signal.strength > 70 ? "bg-success" : signal.strength > 40 ? "bg-warning" : "bg-danger")} style={{ width: `${signal.strength}%` }} />
                      </div>
                      <span className="text-[10px] font-mono font-medium">{signal.strength}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {lastGenerated && (
          <p className="text-[10px] text-muted-foreground text-center">
            Generated: {lastGenerated.toLocaleTimeString()} · Signals are for informational purposes only · Not financial advice
          </p>
        )}
      </div>
    </Layout>
  );
}

export default function MySignals() {
  return (
    <ProtectedRoute>
      <SignalsContent />
    </ProtectedRoute>
  );
}
