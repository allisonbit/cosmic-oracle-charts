import { Star, Brain, Coins, CheckCircle2, ArrowRight, Zap, Shield } from "lucide-react";
import { AIRDROPS_DATA } from "./AirdropList";
import { AirdropCountdown } from "./AirdropCountdown";
import { cn } from "@/lib/utils";

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold text-foreground">{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50">
        <div className={cn("h-1.5 rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function FeaturedAirdrop() {
  const featured = AIRDROPS_DATA.find(a => a.isFeatured);
  if (!featured) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background mb-6 p-5 sm:p-6">
      {/* Background orbs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Label */}
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wider">
          <Star className="w-3 h-3" /> AIRDROP OF THE WEEK
        </div>
        <div className="flex items-center gap-1 text-[10px] text-success font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> LIVE NOW
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 relative z-10">
        {/* Left */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border p-2 flex items-center justify-center">
             <img src={featured.logo} alt={featured.name} width={64} height={64} loading="lazy" decoding="async" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                {featured.name}
                {featured.isVerified && <CheckCircle2 className="w-4 h-4 text-success" />}
              </h2>
              <p className="text-sm text-primary font-medium">{featured.category} · {featured.funding}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{featured.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background/60 border border-border rounded-xl p-3">
              <div className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                <Brain className="w-2.5 h-2.5 text-primary" /> AI SCORE
              </div>
              <div className="font-display font-bold text-2xl text-foreground">{featured.aiScore}<span className="text-sm text-muted-foreground">/100</span></div>
            </div>
            <div className="bg-background/60 border border-border rounded-xl p-3">
              <div className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                <Coins className="w-2.5 h-2.5 text-success" /> EST. VALUE
              </div>
              <div className="font-bold text-sm text-foreground mt-1">{featured.estValue}</div>
            </div>
            <div className="bg-background/60 border border-border rounded-xl p-3">
              <div className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                <Zap className="w-2.5 h-2.5 text-warning" /> EFFORT:REWARD
              </div>
              <div className="font-bold text-success text-base">{featured.rewardRatio}x</div>
            </div>
            <div className="bg-background/60 border border-border rounded-xl p-3">
              <div className="text-[9px] text-muted-foreground flex items-center gap-1 mb-1">
                <Shield className="w-2.5 h-2.5 text-success" /> RISK LEVEL
              </div>
              <div className={cn(
                "font-bold text-sm",
                featured.riskLevel === "Low" ? "text-success" : featured.riskLevel === "Medium" ? "text-warning" : "text-danger"
              )}>{featured.riskLevel}</div>
            </div>
          </div>

          {featured.snapshotDate && (
            <AirdropCountdown targetDate={featured.snapshotDate} label="Snapshot" />
          )}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Score bars */}
          <div className="bg-background/40 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">AI Deep Score Breakdown</span>
            </div>
            <ScoreBar label="Overall AI Score" value={featured.aiScore} color="bg-primary" />
            <ScoreBar label="Legitimacy Score" value={featured.legitimacyScore} color="bg-success" />
            <ScoreBar label="Confidence" value={featured.aiConfidence === "Very High" ? 95 : featured.aiConfidence === "High" ? 80 : featured.aiConfidence === "Medium" ? 60 : 40} color="bg-warning" />
          </div>

          {/* AI Analysis */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-foreground">Oracle AI Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{featured.aiAnalysis}</p>
            <div className="flex flex-wrap gap-1.5">
              {featured.tasks.map((task, i) => (
                <span key={i} className="text-[10px] bg-background/80 border border-border px-2 py-0.5 rounded-md text-foreground/80">{task}</span>
              ))}
            </div>
          </div>

          <a
            href={`#${featured.id}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
          >
            View Full Details <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
