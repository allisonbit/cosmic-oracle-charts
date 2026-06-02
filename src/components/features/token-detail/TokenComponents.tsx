import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatChange } from "@/lib/formatters";

// ─── Mini Stat Card ───
export function StatCard({ label, value, icon: Icon, change, accent }: {
  label: string; value: string; icon: any; change?: number; accent?: string;
}) {
  return (
    <Card className={cn("bg-card border-border", accent)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-sm md:text-lg font-bold font-mono text-foreground">{value}</p>
        {change !== undefined && (
          <p className={cn("text-xs font-medium mt-0.5", change >= 0 ? "text-success" : "text-danger")}>
            {formatChange(change)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Risk Score Gauge ───
export function RiskGauge({ score }: { score: number }) {
  const color = score <= 30 ? 'text-success' : score <= 60 ? 'text-warning' : 'text-danger';
  const label = score <= 30 ? 'Low Risk' : score <= 60 ? 'Medium Risk' : 'High Risk';
  const bg = score <= 30 ? 'bg-success/10 border-success/20' : score <= 60 ? 'bg-warning/10 border-warning/20' : 'bg-danger/10 border-danger/20';
  return (
    <div className={cn("p-4 rounded-xl border flex items-center gap-4", bg)}>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" strokeWidth="3" strokeDasharray={`${score}, 100`}
            className={cn("transition-all duration-1000", score <= 30 ? "stroke-success" : score <= 60 ? "stroke-warning" : "stroke-danger")} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-sm font-bold", color)}>{score}</span>
        </div>
      </div>
      <div>
        <p className={cn("text-sm font-bold", color)}>{label}</p>
        <p className="text-xs text-muted-foreground">Based on liquidity, volume, age & holder distribution</p>
      </div>
    </div>
  );
}

// ─── Holder Distribution Bar ───
export function HolderDistribution({ topHolders }: { topHolders: { label: string; pct: number; color: string }[] }) {
  return (
    <div className="space-y-2">
      {topHolders.map((h, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{h.label}</span>
            <span className="font-mono font-medium">{(h.pct ?? 0).toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h.pct}%`, backgroundColor: h.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}
