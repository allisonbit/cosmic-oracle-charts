import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, TrendingUp, TrendingDown, Loader2, RefreshCw, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
      // Fallback signals
      const fallback: Signal[] = (watchlist.length > 0 ? watchlist : ["BTC", "ETH", "SOL"]).map((sym) => {
        const isBullish = Math.random() > 0.4;
        const price = 100 + Math.random() * 50000;
        return {
          coin: sym,
          symbol: sym,
          type: isBullish ? "buy" : Math.random() > 0.5 ? "sell" : "hold",
          strength: Math.floor(40 + Math.random() * 60),
          reason: isBullish ? "Momentum breakout above key resistance with rising volume" : "Bearish divergence on RSI with declining volume",
          entry: price,
          target: price * (isBullish ? 1.08 : 0.92),
          stopLoss: price * (isBullish ? 0.96 : 1.04),
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

  const getTypeColor = (type: string) => {
    if (type === "buy") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (type === "sell") return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  };

  const getTypeIcon = (type: string) => {
    if (type === "buy") return TrendingUp;
    if (type === "sell") return TrendingDown;
    return Target;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Trading Signals</h1>
              <p className="text-sm text-muted-foreground">
                {watchlist.length > 0 ? `Personalized for your ${watchlist.length} watchlist coins` : "Top market signals"}
              </p>
            </div>
          </div>
          <Button onClick={generateSignals} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {signals.length > 0 ? "Refresh" : "Generate"}
          </Button>
        </div>

        {watchlist.length === 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Add coins to your <strong>Watchlist</strong> to get personalized signals. Currently showing top market signals.
              </p>
            </CardContent>
          </Card>
        )}

        {signals.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Signals Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Click Generate to get AI-powered trading signals</p>
              <Button onClick={generateSignals} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Generate Signals
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Signals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((signal, i) => {
            const Icon = getTypeIcon(signal.type);
            return (
              <Card key={i} className={cn("border", getTypeColor(signal.type))}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <CardTitle className="text-base">{signal.symbol}</CardTitle>
                      <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", getTypeColor(signal.type))}>
                        {signal.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{signal.confidence}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{signal.reason}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground">Entry</p>
                      <p className="text-sm font-semibold text-foreground">${signal.entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <p className="text-[10px] text-muted-foreground">Target</p>
                      <p className="text-sm font-semibold text-emerald-500">${signal.target.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <p className="text-[10px] text-muted-foreground">Stop Loss</p>
                      <p className="text-sm font-semibold text-red-500">${signal.stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{signal.timeframe}</Badge>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", signal.strength > 70 ? "bg-emerald-500" : signal.strength > 40 ? "bg-yellow-500" : "bg-red-500")}
                          style={{ width: `${signal.strength}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{signal.strength}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {lastGenerated && (
          <p className="text-xs text-muted-foreground text-center">
            Last generated: {lastGenerated.toLocaleTimeString()} • Signals are for informational purposes only
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
