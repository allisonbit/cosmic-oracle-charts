import { Brain, CheckCircle2, AlertTriangle, Coins, Shield, Zap, Star, TrendingUp, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { type AirdropProject } from "./AirdropList";
import { AirdropCountdown } from "./AirdropCountdown";
import { cn } from "@/lib/utils";

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="-rotate-90">
      <circle cx="24" cy="24" r={r} strokeWidth="5" fill="none" stroke="hsl(var(--muted))" />
      <circle
        cx="24" cy="24" r={r} strokeWidth="5" fill="none"
        stroke={color}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

function RiskBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const map = {
    Low: "text-success border-success/30 bg-success/8",
    Medium: "text-warning border-warning/30 bg-warning/8",
    High: "text-danger border-danger/30 bg-danger/8",
  };
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md border", map[level])}>
      {level} Risk
    </span>
  );
}

function StatusDot({ status }: { status: "Live" | "Upcoming" | "Ended" }) {
  if (status === "Live") return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> LIVE
    </span>
  );
  if (status === "Upcoming") return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-warning">
      <Clock className="w-3 h-3" /> UPCOMING
    </span>
  );
  return (
    <span className="text-[10px] font-bold text-muted-foreground">ENDED</span>
  );
}

export function AirdropCard({ project, rank }: { project: AirdropProject; rank?: number }) {
  const effortLabel = project.effortScore <= 1 ? "Very Easy" : project.effortScore <= 2 ? "Easy" : project.effortScore <= 3 ? "Medium" : project.effortScore <= 4 ? "Hard" : "Very Hard";
  const effortColor = project.effortScore <= 2 ? "text-success" : project.effortScore <= 3 ? "text-warning" : "text-danger";

  return (
    <div className={cn(
      "holo-card p-5 md:p-6 group flex flex-col h-full relative overflow-hidden",
      project.isFeatured && "ring-1 ring-primary/30"
    )}>
      {/* Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/8 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors pointer-events-none" />

      {/* Rank badge */}
      {rank && (
        <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-muted/60 border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
          {rank}
        </div>
      )}

      {/* Featured ribbon */}
      {project.isFeatured && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
            <Star className="w-2.5 h-2.5" /> FEATURED
          </div>
        </div>
      )}

      {/* Header */}
      <div className={cn("flex justify-between items-start mb-4 relative z-10", rank ? "pl-8" : "")}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-muted/50 p-1.5 flex items-center justify-center border border-border shrink-0">
            <img src={project.logo} alt={project.name} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2 flex-wrap">
              {project.name}
              <span className="text-xs font-normal px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">{project.ticker}</span>
              {project.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-success" aria-label="Verified" />}
            </h3>
            <p className="text-xs text-primary font-medium">{project.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusDot status={project.liveStatus} />
          <RiskBadge level={project.riskLevel} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 relative z-10">{project.description}</p>

      {/* ── AI Score Row ── */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/15 relative z-10">
        {/* Oracle Bull Score */}
        <div className="relative flex items-center justify-center shrink-0">
          <ScoreRing score={project.aiScore} size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-display font-bold text-foreground">{project.aiScore}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <Brain className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Oracle Bull AI Score</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <div className="text-[9px] text-muted-foreground">Legitimacy</div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 rounded-full bg-muted/50">
                  <div className="h-1 rounded-full bg-success transition-all" style={{ width: `${project.legitimacyScore}%` }} />
                </div>
                <span className="text-[10px] font-bold text-foreground">{project.legitimacyScore}</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground">Effort:Reward</div>
              <div className="text-[10px] font-bold text-success">{project.rewardRatio.toFixed(1)}x</div>
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground">Effort</div>
              <div className={cn("text-[10px] font-bold", effortColor)}>{effortLabel}</div>
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground">Confidence</div>
              <div className="text-[10px] font-bold text-foreground">{project.aiConfidence}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        <div className="bg-background/50 border border-border rounded-lg p-2.5">
          <div className="text-[9px] text-muted-foreground mb-0.5 flex items-center gap-1"><Coins className="w-2.5 h-2.5 text-success" /> EST. VALUE</div>
          <div className="font-bold text-xs text-foreground">{project.estValue}</div>
        </div>
        <div className="bg-background/50 border border-border rounded-lg p-2.5">
          <div className="text-[9px] text-muted-foreground mb-0.5 flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5 text-primary" /> FUNDING</div>
          <div className="font-bold text-xs text-foreground">{project.funding}</div>
        </div>
      </div>

      {/* Countdown */}
      {project.snapshotDate && (
        <div className="mb-4 relative z-10">
          <AirdropCountdown targetDate={project.snapshotDate} label={project.liveStatus === "Live" ? "Snapshot" : "Launch"} />
        </div>
      )}

      {/* AI Analysis */}
      <div className="mt-auto bg-primary/5 border border-primary/20 rounded-xl p-4 relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-primary fill-primary/20" />
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Oracle AI Analysis</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{project.aiAnalysis}</p>

        <div className="mt-3 pt-3 border-t border-primary/10">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Required Actions:</div>
          <div className="flex flex-wrap gap-1.5">
            {project.tasks.map((task, idx) => (
              <span key={idx} className="text-[10px] bg-background/80 border border-border px-2 py-0.5 rounded-md text-foreground/80">{task}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Read Full Guide button */}
      {project.fullGuide && (
        <Link
          to={`/airdrops/${project.id}`}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/25 text-primary text-xs font-bold hover:bg-primary/8 transition-all relative z-10"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Read Full Guide · 2,000+ words
        </Link>
      )}
    </div>
  );
}
