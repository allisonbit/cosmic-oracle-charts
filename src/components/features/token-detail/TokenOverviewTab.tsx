import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskGauge } from "@/components/features/token-detail/TokenComponents";
import { formatPrice, formatCompact, formatNumber, formatChange } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Gauge, Radar, PieChart, Unlock, Lock, Percent } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, PieChart as RechartsPie, Pie, Cell } from "recharts";

interface TokenOverviewTabProps {
  token: any;
  derivedMetrics: any;
  radarData: any[];
  supplyPie: any[];
  PIE_COLORS: string[];
  chainData: any;
}

export function TokenOverviewTab({ token, derivedMetrics, radarData, supplyPie, PIE_COLORS, chainData }: TokenOverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Score */}
        <Card className="border-border lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4" /> Risk Score</CardTitle></CardHeader>
          <CardContent>
            {derivedMetrics && <RiskGauge score={derivedMetrics.riskScore} />}
          </CardContent>
        </Card>

        {/* Token Health Radar */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Radar className="w-4 h-4" /> Token Health</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <RechartsRadar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price History & Supply */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATH/ATL */}
        {derivedMetrics && (
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Price History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-[10px] text-success uppercase">All-Time High</p>
                  <p className="text-lg font-bold font-mono">{formatPrice(derivedMetrics.ath)}</p>
                  <p className="text-xs text-muted-foreground">{derivedMetrics.athDate}</p>
                  <p className="text-xs text-danger font-medium">{formatChange(derivedMetrics.fromAth)}</p>
                </div>
                <div className="p-3 rounded-lg bg-danger/5 border border-danger/20">
                  <p className="text-[10px] text-danger uppercase">All-Time Low</p>
                  <p className="text-lg font-bold font-mono">{formatPrice(derivedMetrics.atl)}</p>
                  <p className="text-xs text-muted-foreground">{derivedMetrics.atlDate}</p>
                  <p className="text-xs text-success font-medium">{formatChange(derivedMetrics.fromAtl)}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">24h Volatility</span>
                <span className="font-mono font-medium">{(derivedMetrics.volatility24h ?? 0).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avg Tx Size</span>
                <span className="font-mono font-medium">{formatCompact(derivedMetrics.avgTxSize)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supply */}
        <Card className="border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart className="w-4 h-4" /> Supply Info</CardTitle></CardHeader>
          <CardContent>
            {derivedMetrics?.circulatingSupply ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie data={supplyPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={25}>
                          {supplyPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-3 h-3 text-primary" />
                      <span className="text-muted-foreground">Circulating:</span>
                      <span className="font-mono font-medium">{formatNumber(derivedMetrics.circulatingSupply)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-mono font-medium">{formatNumber(derivedMetrics.totalSupply)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Percent className="w-3 h-3 text-success" />
                      <span className="text-muted-foreground">Ratio:</span>
                      <span className="font-mono font-medium text-success">{derivedMetrics.supplyRatio?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Supply data not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vol/Liq & Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Vol / Liq Ratio</p>
          <p className="text-lg font-bold font-mono">{derivedMetrics ? (derivedMetrics.volLiqRatio * 100).toFixed(1) + '%' : '—'}</p>
          <p className="text-[10px] text-muted-foreground">{derivedMetrics && derivedMetrics.volLiqRatio > 1 ? '⚠️ High turnover' : '✅ Healthy'}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Buy Pressure</p>
          <p className="text-lg font-bold font-mono">{derivedMetrics ? (derivedMetrics.buyPressure ?? 0).toFixed(1) + '%' : '—'}</p>
          <p className={cn("text-[10px]", derivedMetrics && derivedMetrics.buyPressure > 55 ? "text-success" : "text-muted-foreground")}>
            {derivedMetrics && derivedMetrics.buyPressure > 55 ? '🟢 Bullish' : '⚪ Neutral'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">DEX</p>
          <p className="text-sm font-bold capitalize">{token.dexId || 'Unknown'}</p>
          <p className="text-[10px] text-muted-foreground">Trading venue</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-[10px] text-muted-foreground uppercase">Chain</p>
          <p className="text-sm font-bold">{chainData.icon} {chainData.name}</p>
          <p className="text-[10px] text-muted-foreground">Network</p>
        </div>
      </div>
    </div>
  );
}
