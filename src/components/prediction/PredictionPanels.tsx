import { PredictionData } from "@/hooks/usePricePrediction";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Editorial panel primitives — no card chrome, just a thin top rule + label ──
function PanelShell({ icon: Icon, title, children }: { icon?: any; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/30 pt-5">
      <div className="section-label mb-4 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        {title}
      </div>
      {children}
    </section>
  );
}

interface TechnicalIndicatorsPanelProps {
  data: PredictionData;
}

export function TechnicalIndicatorsPanel({ data }: TechnicalIndicatorsPanelProps) {
  const ti = data?.technicalIndicators;

  if (!ti) {
    return (
      <PanelShell icon={Activity} title="Technical Indicators">
        <p className="text-muted-foreground text-sm">Loading technical data...</p>
      </PanelShell>
    );
  }

  return (
    <PanelShell icon={Activity} title="Technical Indicators">
      <div className="space-y-4">
        {/* RSI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">RSI (14)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{ti.rsi ?? 50}</span>
              <Badge variant={ti.rsiSignal === 'oversold' ? 'default' : ti.rsiSignal === 'overbought' ? 'destructive' : 'secondary'} className="text-xs">
                {ti.rsiSignal ?? 'neutral'}
              </Badge>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                (ti.rsi ?? 50) < 30 ? "bg-green-500" : (ti.rsi ?? 50) > 70 ? "bg-red-500" : "bg-yellow-500"
              )}
              style={{ width: `${ti.rsi ?? 50}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Oversold (30)</span>
            <span>Overbought (70)</span>
          </div>
        </div>

        {/* MACD */}
        {ti.macd && (
          <div className="border-t border-border/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">MACD</span>
              <Badge variant={ti.macd.trend === 'bullish' ? 'default' : 'destructive'}>
                {ti.macd.trend === 'bullish' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {ti.macd.trend ?? 'neutral'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Value</span>
                <p className="font-mono">{ti.macd.value ?? 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Signal</span>
                <p className="font-mono">{ti.macd.signal ?? 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Histogram</span>
                <p className={cn("font-mono", (ti.macd.histogram ?? 0) > 0 ? "text-green-500" : "text-red-500")}>
                  {ti.macd.histogram ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Moving Averages */}
        {ti.movingAverages && (
          <div className="border-t border-border/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Moving Averages</span>
              <Badge variant={ti.movingAverages.trend === 'bullish' ? 'default' : ti.movingAverages.trend === 'bearish' ? 'destructive' : 'secondary'}>
                {ti.movingAverages.trend ?? 'neutral'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">MA 20</span>
                <p className="font-mono">${(ti.movingAverages.ma20 ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">MA 50</span>
                <p className="font-mono">${(ti.movingAverages.ma50 ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">MA 200</span>
                <p className="font-mono">${(ti.movingAverages.ma200 ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands */}
        {ti.bollingerBands && (
          <div className="border-t border-border/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Bollinger Bands</span>
              <Badge variant="outline" className="text-xs">
                {ti.bollingerBands.position ?? 'middle'} band
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Upper</span>
                <p className="font-mono text-red-400">${(ti.bollingerBands.upper ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Middle</span>
                <p className="font-mono">${(ti.bollingerBands.middle ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lower</span>
                <p className="font-mono text-green-400">${(ti.bollingerBands.lower ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Volume Analysis */}
        {ti.volumeAnalysis && (
          <div className="flex items-center justify-between border-t border-border/20 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Volume</span>
              <Badge variant="outline" className="text-xs">
                {ti.volumeAnalysis.trend ?? 'neutral'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${ti.volumeAnalysis.strength ?? 50}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{ti.volumeAnalysis.strength ?? 50}%</span>
            </div>
          </div>
        )}

        {/* Stochastic Oscillator */}
        {(ti as any).stochastic && (
          <div className="border-t border-border/20 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Stochastic</span>
              <Badge variant={(ti as any).stochastic.signal === 'oversold' ? 'default' : (ti as any).stochastic.signal === 'overbought' ? 'destructive' : 'secondary'} className="text-xs">
                {(ti as any).stochastic.signal}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">%K</span>
                <p className="font-mono">{(ti as any).stochastic.k}</p>
              </div>
              <div>
                <span className="text-muted-foreground">%D</span>
                <p className="font-mono">{(ti as any).stochastic.d}</p>
              </div>
            </div>
          </div>
        )}

        {/* ATR & VWAP & OBV — inline stat strip */}
        {((ti as any).atr != null || (ti as any).vwap != null || (ti as any).obv != null) && (
          <div className="flex items-stretch divide-x divide-border/30 border-t border-border/20 pt-3">
            {(ti as any).atr != null && (
              <div className="flex-1 text-center px-2">
                <span className="section-label block mb-1">ATR</span>
                <p className="font-mono text-sm">${((ti as any).atr ?? 0).toLocaleString()}</p>
              </div>
            )}
            {(ti as any).vwap != null && (
              <div className="flex-1 text-center px-2">
                <span className="section-label block mb-1">VWAP</span>
                <p className="font-mono text-sm">${((ti as any).vwap ?? 0).toLocaleString()}</p>
              </div>
            )}
            {(ti as any).obv != null && (
              <div className="flex-1 text-center px-2">
                <span className="section-label block mb-1">OBV</span>
                <p className={cn("text-sm font-medium", (ti as any).obv === 'accumulation' ? 'text-green-500' : 'text-red-500')}>
                  {(ti as any).obv === 'accumulation' ? '↑ Acc' : '↓ Dist'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

interface PriceTargetsPanelProps {
  data: PredictionData;
  timeframe: string;
}

export function PriceTargetsPanel({ data, timeframe }: PriceTargetsPanelProps) {
  const timeframeText = timeframe === 'daily' ? 'Today' : timeframe === 'weekly' ? 'This Week' : 'This Month';

  const targets = [
    { label: "Conservative", risk: "Low Risk", accent: "border-green-500", badge: "border-green-500/50", text: "text-green-400", data: data.priceTargets.conservative },
    { label: "Moderate", risk: "Medium Risk", accent: "border-yellow-500", badge: "border-yellow-500/50", text: "text-yellow-400", data: data.priceTargets.moderate },
    { label: "Aggressive", risk: "High Risk", accent: "border-red-500", badge: "border-red-500/50", text: "text-red-400", data: data.priceTargets.aggressive },
  ];

  return (
    <PanelShell icon={Target} title={`Price Targets ${timeframeText}`}>
      <div className="space-y-4">
        {/* Current Price */}
        <div className="text-center border-b border-border/30 pb-3">
          <span className="section-label">Current Price</span>
          <p className="text-2xl font-bold text-primary mt-1">${(data.currentPrice ?? 0).toLocaleString()}</p>
        </div>

        {/* Target Ranges — colored left-accent rows */}
        <div className="space-y-3">
          {targets.map((t) => (
            <div key={t.label} className={cn("border-l-2 pl-3", t.accent)}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-sm font-medium", t.text)}>{t.label}</span>
                <Badge variant="outline" className={cn("text-xs", t.badge, t.text)}>{t.risk}</Badge>
              </div>
              <div className="flex justify-between text-sm font-mono">
                <span>${(t.data.low ?? 0).toLocaleString()}</span>
                <span className="text-muted-foreground">—</span>
                <span>${(t.data.high ?? 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Support & Resistance */}
        <div className="grid grid-cols-2 gap-4 border-t border-border/20 pt-3">
          <div>
            <span className="section-label">Support Levels</span>
            <div className="mt-2 space-y-1">
              {(data.supportLevels ?? []).length > 0 ? (
                data.supportLevels.map((level, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-mono">${(level ?? 0).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Calculating...</span>
              )}
            </div>
          </div>
          <div>
            <span className="section-label">Resistance Levels</span>
            <div className="mt-2 space-y-1">
              {(data.resistanceLevels ?? []).length > 0 ? (
                data.resistanceLevels.map((level, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm font-mono">${(level ?? 0).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Calculating...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

interface TradingZonesPanelProps {
  data: PredictionData;
}

export function TradingZonesPanel({ data }: TradingZonesPanelProps) {
  const zones = data?.tradingZones;
  const entryZone = zones?.entryZone;
  const currentPrice = data?.currentPrice ?? 0;

  const entryMin = entryZone?.min ?? (entryZone as any)?.low ?? currentPrice * 0.98;
  const entryMax = entryZone?.max ?? (entryZone as any)?.high ?? currentPrice * 1.01;
  const stopLoss = zones?.stopLoss ?? currentPrice * 0.95;
  const tp1 = zones?.takeProfit1 ?? currentPrice * 1.05;
  const tp2 = zones?.takeProfit2 ?? currentPrice * 1.10;
  const tp3 = zones?.takeProfit3 ?? currentPrice * 1.15;

  return (
    <PanelShell icon={Shield} title="Trading Zones">
      <div className="space-y-4">
        {/* Entry Zone */}
        <div className="border-l-2 border-blue-500 pl-3">
          <span className="text-sm font-medium text-blue-400">Entry Zone</span>
          <div className="flex justify-between mt-1 text-lg font-mono">
            <span>${(entryMin ?? 0).toLocaleString()}</span>
            <span className="text-muted-foreground">—</span>
            <span>${(entryMax ?? 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Stop Loss */}
        <div className="border-l-2 border-red-500 pl-3">
          <span className="text-sm font-medium text-red-400">Stop Loss</span>
          <p className="text-lg font-mono mt-1">${(stopLoss ?? 0).toLocaleString()}</p>
        </div>

        {/* Take Profits */}
        <div className="border-l-2 border-green-500 pl-3">
          <span className="text-sm font-medium text-green-400">Take Profit Levels</span>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {[["TP1", tp1], ["TP2", tp2], ["TP3", tp3]].map(([label, val]) => (
              <div key={label as string} className="text-center">
                <span className="section-label block mb-0.5">{label}</span>
                <p className="font-mono text-sm">${((val as number) ?? 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

interface ScenariosPanelProps {
  data: PredictionData;
}

export function ScenariosPanel({ data }: ScenariosPanelProps) {
  const bullScenario = data?.bullScenario;
  const bearScenario = data?.bearScenario;
  const currentPrice = data?.currentPrice ?? 0;

  const bullTarget = bullScenario?.target ?? currentPrice * 1.10;
  const bullProbability = bullScenario?.probability ?? 50;
  const bullTriggers = bullScenario?.triggers ?? ['Price breaks above resistance', 'Volume increases'];

  const bearTarget = bearScenario?.target ?? currentPrice * 0.90;
  const bearProbability = bearScenario?.probability ?? 50;
  const bearTriggers = bearScenario?.triggers ?? ['Price breaks below support', 'Negative market sentiment'];

  return (
    <PanelShell title="Market Scenarios">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bull Scenario */}
        <div className="border-l-2 border-green-500 pl-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-400">Bullish Scenario</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              {bullProbability}%
            </Badge>
          </div>
          <p className="text-lg font-mono text-green-400 mb-3">
            Target: ${(bullTarget ?? 0).toLocaleString()}
          </p>
          <div className="space-y-1">
            <span className="section-label">Triggers</span>
            <ul className="text-sm space-y-1 mt-1">
              {bullTriggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-muted-foreground">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bear Scenario */}
        <div className="border-l-2 border-red-500 pl-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-400">Bearish Scenario</span>
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
              {bearProbability}%
            </Badge>
          </div>
          <p className="text-lg font-mono text-red-400 mb-3">
            Target: ${(bearTarget ?? 0).toLocaleString()}
          </p>
          <div className="space-y-1">
            <span className="section-label">Triggers</span>
            <ul className="text-sm space-y-1 mt-1">
              {bearTriggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-muted-foreground">{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

interface RiskAssessmentPanelProps {
  data: PredictionData;
}

export function RiskAssessmentPanel({ data }: RiskAssessmentPanelProps) {
  const riskColors: Record<string, string> = {
    low: 'text-green-500 bg-green-500/20 border-green-500/50',
    medium: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50',
    high: 'text-orange-500 bg-orange-500/20 border-orange-500/50',
    extreme: 'text-red-500 bg-red-500/20 border-red-500/50'
  };

  const riskLevel = data?.riskLevel ?? 'medium';
  const volatilityIndex = data?.volatilityIndex ?? 10;
  const keyFactors = data?.keyFactors ?? ['Market volatility', 'Trading volume'];

  return (
    <PanelShell icon={AlertTriangle} title="Risk Assessment">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Level</span>
          <Badge className={riskColors[riskLevel] ?? riskColors.medium}>
            {riskLevel.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Volatility Index</span>
            <span className="font-mono">{volatilityIndex}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                volatilityIndex < 5 ? "bg-green-500" :
                volatilityIndex < 10 ? "bg-yellow-500" :
                volatilityIndex < 20 ? "bg-orange-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(100, volatilityIndex * 5)}%` }}
            />
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-2 border-t border-border/20 pt-3">
          <span className="section-label">Key Factors</span>
          <ul className="space-y-2 mt-1">
            {keyFactors.map((factor, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">→</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PanelShell>
  );
}
