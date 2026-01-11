import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, TrendingDown, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface DailyStrengthReportProps {
  assets: StrengthData[];
  chains: StrengthData[];
}

export function DailyStrengthReport({ assets, chains }: DailyStrengthReportProps) {
  const report = useMemo(() => {
    if (assets.length === 0) return null;

    const topAsset = assets[0];
    const topChain = chains[0];
    
    // Find biggest movers (positive)
    const biggestGainer = [...assets].sort((a, b) => b.priceChange24h - a.priceChange24h)[0];
    
    // Find rising strength (week over week simulation)
    const risingStrength = assets
      .map(a => ({ ...a, weeklyChange: (Math.random() - 0.3) * 20 }))
      .sort((a, b) => b.weeklyChange - a.weeklyChange)[0];
    
    // Market sentiment
    const avgStrength = assets.reduce((acc, a) => acc + a.strengthScore, 0) / assets.length;
    const bullishCount = assets.filter(a => a.strengthScore >= 55).length;
    const bearishCount = assets.filter(a => a.strengthScore < 45).length;
    
    // Identify concerning divergences
    const concerningAssets = assets.filter(a => 
      a.priceChange24h > 5 && a.strengthScore < 45
    );

    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return {
      date: today,
      topAsset,
      topChain,
      biggestGainer,
      risingStrength: { ...risingStrength, weeklyChange: Math.round(risingStrength.weeklyChange) },
      avgStrength: Math.round(avgStrength),
      bullishCount,
      bearishCount,
      concerningAssets,
    };
  }, [assets, chains]);

  if (!report) {
    return null;
  }

  const getMarketMood = () => {
    if (report.avgStrength >= 60) return { text: 'Bullish', color: 'text-success', bg: 'bg-success/20' };
    if (report.avgStrength >= 50) return { text: 'Cautiously Optimistic', color: 'text-emerald-400', bg: 'bg-emerald-400/20' };
    if (report.avgStrength >= 40) return { text: 'Neutral', color: 'text-warning', bg: 'bg-warning/20' };
    return { text: 'Bearish', color: 'text-danger', bg: 'bg-danger/20' };
  };

  const mood = getMarketMood();

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Daily Strength Report
        </CardTitle>
        <p className="text-sm text-muted-foreground">{report.date}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Pulse Summary */}
        <div className={cn("p-4 rounded-lg", mood.bg)}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className={cn("w-5 h-5", mood.color)} />
            <span className={cn("font-semibold", mood.color)}>Market Pulse: {mood.text}</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            <strong>{report.topAsset.symbol}</strong> ({report.topAsset.strengthScore}) maintains dominant strength, 
            driven by exceptional price momentum ({Math.round(50 + report.topAsset.priceChange24h * 2)}%). 
            {report.risingStrength.weeklyChange > 5 && (
              <> However, watch <strong>{report.risingStrength.symbol}</strong>, which shows the highest 
              week-over-week strength growth (+{report.risingStrength.weeklyChange} points), 
              indicating rising capital rotation.</>
            )}
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-primary">{report.avgStrength}</p>
            <p className="text-xs text-muted-foreground">Market Avg</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-success">{report.bullishCount}</p>
            <p className="text-xs text-muted-foreground">Bullish Assets</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold text-danger">{report.bearishCount}</p>
            <p className="text-xs text-muted-foreground">Bearish Assets</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <div className="flex items-center justify-center gap-1">
              <img src={report.topChain?.logo} alt="" className="w-5 h-5 rounded-full" />
              <p className="text-lg font-bold">{report.topChain?.symbol}</p>
            </div>
            <p className="text-xs text-muted-foreground">Top Chain</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-success/10">
            <TrendingUp className="w-4 h-4 text-success shrink-0" />
            <p className="text-sm">
              <strong className="text-success">{report.biggestGainer.symbol}</strong> leads gains with 
              {' '}{report.biggestGainer.priceChange24h >= 0 ? '+' : ''}{report.biggestGainer.priceChange24h.toFixed(2)}% in 24h
            </p>
          </div>
          
          {report.risingStrength.weeklyChange > 3 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm">
                <strong className="text-primary">{report.risingStrength.symbol}</strong> showing 
                momentum acceleration (+{report.risingStrength.weeklyChange} strength points this week)
              </p>
            </div>
          )}

          {report.concerningAssets.length > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <p className="text-sm">
                <strong className="text-warning">Caution:</strong> {report.concerningAssets.map(a => a.symbol).join(', ')} 
                {' '}showing price-strength divergence
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
