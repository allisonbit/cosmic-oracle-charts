import { useEffect } from "react";
import { X, Brain, CheckCircle2, AlertTriangle, ExternalLink, ChevronRight, Shield, Coins, TrendingUp, Users, Zap, BarChart3, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AirdropProject } from "./AirdropList";
import { AirdropCountdown } from "./AirdropCountdown";

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
        <div className="text-primary">{icon}</div>
        <h3 className="font-display font-bold text-base text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ScoreBar({ label, value, color, desc }: { label: string; value: number; color: string; desc: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="flex-1 h-2 rounded-full bg-muted/50">
        <div className={cn("h-2 rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
      <div className="w-8 text-right text-xs font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground hidden md:block max-w-[180px]">{desc}</div>
    </div>
  );
}

export function AirdropDetailModal({ project, onClose }: { project: AirdropProject; onClose: () => void }) {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const guide = project.fullGuide;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">

        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border p-1.5 flex items-center justify-center shrink-0">
              <img src={project.logo} alt={project.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
                {project.name}
                {project.isVerified && <CheckCircle2 className="w-4 h-4 text-success" />}
              </h2>
              <p className="text-xs text-muted-foreground">{project.category} · {project.ticker}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Hero Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "AI Score", value: `${project.aiScore}/100`, color: project.aiScore >= 85 ? "text-success" : project.aiScore >= 70 ? "text-warning" : "text-danger", icon: <Brain className="w-3.5 h-3.5" /> },
              { label: "Est. Value", value: project.estValue, color: "text-foreground", icon: <Coins className="w-3.5 h-3.5 text-success" /> },
              { label: "Effort:Reward", value: `${project.rewardRatio.toFixed(1)}x`, color: "text-success", icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { label: "Funding", value: project.funding, color: "text-foreground", icon: <BarChart3 className="w-3.5 h-3.5 text-primary" /> },
            ].map((m, i) => (
              <div key={i} className="bg-background/60 border border-border rounded-xl p-3">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-1 uppercase tracking-wide">
                  {m.icon} {m.label}
                </div>
                <div className={cn("font-display font-bold text-sm", m.color)}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {project.snapshotDate && (
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-warning/5 border border-warning/20">
              <Clock className="w-4 h-4 text-warning shrink-0" />
              <AirdropCountdown targetDate={project.snapshotDate} label="Snapshot" />
            </div>
          )}

          {/* AI Score Breakdown */}
          <Section title="Oracle Bull AI Score Breakdown" icon={<Brain className="w-4 h-4" />}>
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
              <ScoreBar label="Overall AI Score" value={project.aiScore} color="bg-primary" desc="Composite signal across all metrics" />
              <ScoreBar label="Legitimacy" value={project.legitimacyScore} color="bg-success" desc="On-chain + VC + team credibility" />
              <ScoreBar label="Confidence" value={project.aiConfidence === "Very High" ? 95 : project.aiConfidence === "High" ? 80 : project.aiConfidence === "Medium" ? 60 : 40} color="bg-warning" desc={`${project.aiConfidence} confidence in TGE timing`} />
              <ScoreBar label="Effort Score" value={100 - (project.effortScore - 1) * 20} color="bg-blue-500" desc={`${project.difficulty} effort required`} />
            </div>
          </Section>

          {/* Overview */}
          {guide?.overview && (
            <Section title="Project Overview" icon={<Star className="w-4 h-4" />}>
              <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {guide.overview}
              </div>
            </Section>
          )}

          {/* Why It Matters */}
          {guide?.whyItMatters && (
            <Section title="Why This Airdrop Matters" icon={<Zap className="w-4 h-4" />}>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-primary/5 border border-primary/15 rounded-xl p-4">
                {guide.whyItMatters}
              </div>
            </Section>
          )}

          {/* Step by Step Guide */}
          {guide?.stepByStep && guide.stepByStep.length > 0 && (
            <Section title="Step-by-Step Farming Guide" icon={<ChevronRight className="w-4 h-4" />}>
              <div className="space-y-3">
                {guide.stepByStep.map((step, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-background/50 border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Tokenomics */}
          {guide?.tokenomics && (
            <Section title="Tokenomics & Allocation" icon={<Coins className="w-4 h-4" />}>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {guide.tokenomics}
              </div>
            </Section>
          )}

          {/* VC Backers */}
          {guide?.vcBackers && guide.vcBackers.length > 0 && (
            <Section title="Venture Capital Backers" icon={<TrendingUp className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {guide.vcBackers.map((vc, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-semibold text-foreground">
                    {vc}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Timeline */}
          {guide?.timeline && guide.timeline.length > 0 && (
            <Section title="Key Milestones & Timeline" icon={<Clock className="w-4 h-4" />}>
              <div className="relative pl-5 border-l border-border/50 space-y-4">
                {guide.timeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary border-2 border-background" />
                    <div className="text-[10px] text-muted-foreground mb-0.5">{item.date}</div>
                    <div className="text-sm text-foreground font-medium">{item.event}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Risk Analysis */}
          {guide?.riskAnalysis && (
            <Section title="Risk Analysis" icon={<Shield className="w-4 h-4" />}>
              <div className={cn(
                "text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl border",
                project.riskLevel === "Low" ? "bg-success/5 border-success/20 text-muted-foreground"
                  : project.riskLevel === "Medium" ? "bg-warning/5 border-warning/20 text-muted-foreground"
                  : "bg-danger/5 border-danger/20 text-muted-foreground"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {project.riskLevel === "High"
                    ? <AlertTriangle className="w-4 h-4 text-danger" />
                    : <CheckCircle2 className="w-4 h-4 text-success" />}
                  <span className="font-bold text-foreground text-xs uppercase">{project.riskLevel} Risk Airdrop</span>
                </div>
                {guide.riskAnalysis}
              </div>
            </Section>
          )}

          {/* Pro Tips */}
          {guide?.proTips && guide.proTips.length > 0 && (
            <Section title="Oracle Bull Pro Tips" icon={<Star className="w-4 h-4" />}>
              <div className="space-y-2">
                {guide.proTips.map((tip, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
                    <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Community */}
          {guide?.communityLinks && guide.communityLinks.length > 0 && (
            <Section title="Official Links" icon={<Users className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {guide.communityLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors">
                    {link.name} <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Disclaimer */}
          <div className="text-[10px] text-muted-foreground p-3 rounded-xl bg-muted/20 border border-border/30 leading-relaxed">
            ⚠️ <strong className="text-foreground">Disclaimer:</strong> This guide is for informational purposes only and does not constitute financial advice. Crypto airdrops carry significant risk including loss of gas fees and time. Always verify information on official project websites before interacting with any smart contracts. Never share your seed phrase or private keys with anyone.
          </div>
        </div>
      </div>
    </div>
  );
}
