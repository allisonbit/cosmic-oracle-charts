import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskGauge } from "@/components/features/token-detail/TokenComponents";
import { cn } from "@/lib/utils";
import { Shield, Droplets, Activity, Users, PieChart, Gauge, AlertTriangle } from "lucide-react";

interface TokenSecurityTabProps {
  token: any;
  derivedMetrics: any;
  topHolderPct?: number | null;
}

export function TokenSecurityTab({ token, derivedMetrics, topHolderPct }: TokenSecurityTabProps) {
  const hasHolderInfo = typeof topHolderPct === "number" && topHolderPct > 0;
  const holderValue = !hasHolderInfo ? "—" : (topHolderPct as number) > 30 ? "High" : "Distributed";
  const holderOk = hasHolderInfo ? (topHolderPct as number) < 30 : true;
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Token Security Audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Verification', value: token.verified ? 'Verified' : 'Unverified', ok: token.verified, icon: Shield },
            { label: 'Liquidity Depth', value: (token.liquidity || 0) > 100000 ? 'Strong' : (token.liquidity || 0) > 10000 ? 'Moderate' : 'Low', ok: (token.liquidity || 0) > 10000, icon: Droplets },
            { label: 'Trading Activity', value: (token.txns24h || 0) > 1000 ? 'High' : (token.txns24h || 0) > 100 ? 'Medium' : 'Low', ok: (token.txns24h || 0) > 100, icon: Activity },
            { label: 'Buy/Sell Health', value: derivedMetrics && derivedMetrics.buyPressure > 40 && derivedMetrics.buyPressure < 70 ? 'Balanced' : 'Skewed', ok: derivedMetrics ? derivedMetrics.buyPressure > 35 : false, icon: Users },
            { label: 'Holder Concentration', value: holderValue, ok: holderOk, icon: PieChart },
            { label: 'Vol/Liq Ratio', value: derivedMetrics && derivedMetrics.volLiqRatio > 2 ? 'Risky' : 'Safe', ok: derivedMetrics ? derivedMetrics.volLiqRatio < 2 : true, icon: Gauge },
          ].map((check, i) => (
            <div key={i} className="p-3 flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                check.ok ? "bg-success/20" : "bg-warning/20"
              )}>
                {check.ok ? <check.icon className="w-4 h-4 text-success" /> : <AlertTriangle className="w-4 h-4 text-warning" />}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">{check.label}</p>
                <p className="text-sm font-medium">{check.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Risk Summary */}
        {derivedMetrics && <RiskGauge score={derivedMetrics.riskScore} />}

        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
          <p className="text-xs text-warning flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Always DYOR. Smart contract audits and on-chain analysis are recommended before trading.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
