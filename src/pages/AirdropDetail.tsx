import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { AIRDROPS_DATA } from "@/components/airdrops/AirdropList";
import { AirdropCountdown } from "@/components/airdrops/AirdropCountdown";
import NotFound from "@/pages/NotFound";
import {
  ArrowLeft, Brain, CheckCircle2, AlertTriangle, Coins, TrendingUp,
  Shield, Zap, Star, Clock, Users, ExternalLink, ChevronRight, BarChart3, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

function ScoreBar({ label, value, color, desc }: { label: string; value: number; color: string; desc?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground font-medium truncate">{label}</span>
        <span className="text-sm font-bold text-foreground shrink-0">{value}/100</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-muted/50">
        <div className={cn("h-2.5 rounded-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
  );
}

function Section({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-8 sm:mb-10">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">{icon}</div>
        <h2 className="font-display font-bold text-lg sm:text-xl text-foreground leading-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

const AirdropDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = AIRDROPS_DATA.find(a => a.id === id);

  if (!project) return <NotFound />;

  const guide = project.fullGuide;
  const canonicalUrl = `https://oraclebull.com/airdrops/${project.id}`;
  const seoTitle = `${project.name} (${project.ticker}) Airdrop Guide 2026 — How to Farm & Maximize Allocation | Oracle Bull`;
  const seoDesc = `Complete ${project.name} airdrop farming guide 2026. AI Score: ${project.aiScore}/100. Estimated value: ${project.estValue}. Step-by-step guide, tokenomics, risk analysis, VC backers, and Oracle Bull pro tips.`;

  return (
    <Layout>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta name="keywords" content={`${project.name} airdrop 2026, ${project.ticker} airdrop, ${project.name} farming guide, ${project.name} tokenomics, ${project.category} airdrop 2026, crypto airdrop guide`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": seoTitle,
          "description": seoDesc,
          "url": canonicalUrl,
          "author": { "@type": "Organization", "name": "Oracle Bull" },
          "publisher": { "@type": "Organization", "name": "Oracle Bull", "url": "https://oraclebull.com" },
          "dateModified": new Date().toISOString(),
          "mainEntityOfPage": canonicalUrl,
        })}</script>
      </Helmet>

      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8 overflow-x-hidden">

        {/* Breadcrumb — scrollable on small screens */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 overflow-x-auto whitespace-nowrap pb-1 scrollbar-none">
          <Link to="/" className="hover:text-foreground transition-colors shrink-0">Home</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link to="/airdrops" className="hover:text-foreground transition-colors shrink-0">Airdrops</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[140px]">{project.name}</span>
        </nav>

        {/* Back button */}
        <Link to="/airdrops" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
          <span>Back to all airdrops</span>
        </Link>

        {/* ── Hero Card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-40 sm:w-56 h-40 sm:h-56 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Status badges — wrap on mobile */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn(
                "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border",
                project.liveStatus === "Live" ? "bg-success/10 border-success/30 text-success"
                  : project.liveStatus === "Upcoming" ? "bg-warning/10 border-warning/30 text-warning"
                  : "bg-muted/50 border-border text-muted-foreground"
              )}>
                {project.liveStatus === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />}
                {project.liveStatus}
              </span>
              {project.isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Verified
                </span>
              )}
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full border",
                project.riskLevel === "Low" ? "bg-success/8 border-success/20 text-success"
                  : project.riskLevel === "Medium" ? "bg-warning/8 border-warning/20 text-warning"
                  : "bg-danger/8 border-danger/20 text-danger"
              )}>{project.riskLevel} Risk</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-muted/50 border border-border text-muted-foreground">{project.category}</span>
            </div>

            {/* Title row */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-muted/50 border border-border p-2 flex items-center justify-center shrink-0">
                <img src={project.logo} alt={project.name} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-foreground glow-text leading-tight">
                  {project.name}{" "}
                  <span className="text-muted-foreground text-base sm:text-xl font-normal">({project.ticker})</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Airdrop Farming Guide — Oracle Bull AI Analysis</p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground mb-5 leading-relaxed">{project.description}</p>

            {/* Metrics grid — 2 cols on mobile, 4 on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {[
                { label: "AI Score", value: `${project.aiScore}/100`, color: project.aiScore >= 85 ? "text-success" : "text-warning", icon: <Brain className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
                { label: "Est. Value", value: project.estValue, color: "text-foreground", icon: <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" /> },
                { label: "Effort:Reward", value: `${project.rewardRatio.toFixed(1)}x`, color: "text-success", icon: <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> },
                { label: "Funding", value: project.funding, color: "text-foreground", icon: <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" /> },
              ].map((m, i) => (
                <div key={i} className="bg-background/60 border border-border/60 rounded-xl p-2.5 sm:p-3 min-w-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">{m.icon} <span className="truncate">{m.label}</span></div>
                  <div className={cn("font-display font-bold text-xs sm:text-sm truncate", m.color)}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Countdown */}
            {project.snapshotDate && (
              <div className="inline-flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-warning/5 border border-warning/20">
                <Clock className="w-4 h-4 text-warning shrink-0" />
                <AirdropCountdown targetDate={project.snapshotDate} label={project.liveStatus === "Live" ? "Snapshot" : "Launch"} />
              </div>
            )}
          </div>
        </div>

        {/* Table of Contents */}
        {guide && (
          <div className="holo-card p-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-foreground">Table of Contents</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {[
                guide.overview && { href: "#overview", label: "Project Overview" },
                guide.whyItMatters && { href: "#why", label: "Why This Airdrop Matters" },
                guide.stepByStep?.length && { href: "#guide", label: "Step-by-Step Farming Guide" },
                guide.tokenomics && { href: "#tokenomics", label: "Tokenomics & Allocation" },
                guide.vcBackers?.length && { href: "#backers", label: "Venture Capital Backers" },
                guide.timeline?.length && { href: "#timeline", label: "Key Milestones & Timeline" },
                guide.riskAnalysis && { href: "#risk", label: "Risk Analysis" },
                guide.proTips?.length && { href: "#tips", label: "Oracle Bull Pro Tips" },
                guide.communityLinks?.length && { href: "#links", label: "Official Links" },
              ].filter(Boolean).map((item: any, i) => (
                <a key={i} href={item.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1 px-1 rounded-lg hover:bg-primary/5">
                  <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* AI Score Breakdown */}
        <Section title="Oracle Bull AI Score Breakdown" icon={<Brain className="w-4 h-4" />}>
          <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/15">
            <ScoreBar label="Overall AI Score" value={project.aiScore} color="bg-primary" desc="Composite signal across all metrics" />
            <ScoreBar label="Legitimacy" value={project.legitimacyScore} color="bg-success" desc="On-chain + VC + team credibility" />
            <ScoreBar label="AI Confidence" value={project.aiConfidence === "Very High" ? 95 : project.aiConfidence === "High" ? 80 : project.aiConfidence === "Medium" ? 60 : 40} color="bg-warning" desc={`${project.aiConfidence} confidence in TGE timing`} />
            <ScoreBar label="Ease of Farming" value={100 - (project.effortScore - 1) * 20} color="bg-blue-500" desc={`${project.difficulty} effort required`} />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/40">
            <p className="text-sm text-muted-foreground leading-relaxed italic">{project.aiAnalysis}</p>
          </div>
        </Section>

        {/* Overview */}
        {guide?.overview && (
          <Section title="Project Overview" icon={<Star className="w-4 h-4" />} id="overview">
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{guide.overview}</div>
          </Section>
        )}

        {/* Why it matters */}
        {guide?.whyItMatters && (
          <Section title="Why This Airdrop Matters" icon={<Zap className="w-4 h-4" />} id="why">
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/15">{guide.whyItMatters}</div>
          </Section>
        )}

        {/* Step by step */}
        {guide?.stepByStep && guide.stepByStep.length > 0 && (
          <Section title="Step-by-Step Farming Guide" icon={<ChevronRight className="w-4 h-4" />} id="guide">
            <div className="space-y-3">
              {guide.stepByStep.map((step, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-background/60 border border-border/60 hover:border-primary/20 transition-colors">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Tokenomics */}
        {guide?.tokenomics && (
          <Section title="Tokenomics & Allocation" icon={<Coins className="w-4 h-4" />} id="tokenomics">
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{guide.tokenomics}</div>
          </Section>
        )}

        {/* VC Backers */}
        {guide?.vcBackers && guide.vcBackers.length > 0 && (
          <Section title="Venture Capital Backers" icon={<TrendingUp className="w-4 h-4" />} id="backers">
            <div className="flex flex-wrap gap-2">
              {guide.vcBackers.map((vc, i) => (
                <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-muted/50 border border-border text-xs sm:text-sm font-semibold text-foreground hover:border-primary/30 transition-colors">{vc}</span>
              ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        {guide?.timeline && guide.timeline.length > 0 && (
          <Section title="Key Milestones & Timeline" icon={<Clock className="w-4 h-4" />} id="timeline">
            <div className="relative pl-5 sm:pl-6 border-l-2 border-primary/20 space-y-5 sm:space-y-6">
              {guide.timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[22px] sm:-left-[25px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-primary border-2 border-background shadow-lg shadow-primary/20" />
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">{item.date}</div>
                  <div className="text-sm sm:text-base text-foreground font-medium">{item.event}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Risk Analysis */}
        {guide?.riskAnalysis && (
          <Section title="Risk Analysis" icon={<Shield className="w-4 h-4" />} id="risk">
            <div className={cn(
              "text-sm sm:text-base leading-relaxed whitespace-pre-line p-4 sm:p-5 rounded-2xl border",
              project.riskLevel === "Low" ? "bg-success/5 border-success/20 text-muted-foreground"
                : project.riskLevel === "Medium" ? "bg-warning/5 border-warning/20 text-muted-foreground"
                : "bg-danger/5 border-danger/20 text-muted-foreground"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {project.riskLevel === "High"
                  ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-danger shrink-0" />
                  : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />}
                <span className={cn("font-bold text-sm uppercase tracking-wide",
                  project.riskLevel === "Low" ? "text-success" : project.riskLevel === "Medium" ? "text-warning" : "text-danger"
                )}>{project.riskLevel} Risk Airdrop</span>
              </div>
              {guide.riskAnalysis}
            </div>
          </Section>
        )}

        {/* Pro Tips */}
        {guide?.proTips && guide.proTips.length > 0 && (
          <Section title="Oracle Bull Pro Tips" icon={<Star className="w-4 h-4" />} id="tips">
            <div className="space-y-3">
              {guide.proTips.map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/15 hover:border-primary/30 transition-colors">
                  <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Official Links */}
        {guide?.communityLinks && guide.communityLinks.length > 0 && (
          <Section title="Official Links" icon={<Users className="w-4 h-4" />} id="links">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {guide.communityLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-primary/8 hover:border-primary/30 transition-all">
                  {link.name} <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground p-3 sm:p-4 rounded-xl bg-muted/20 border border-border/30 leading-relaxed mb-6 sm:mb-8">
          ⚠️ <strong className="text-foreground">Disclaimer:</strong> This guide is for informational purposes only and does not constitute financial advice. Crypto airdrops carry risk including loss of gas fees and time. Always verify on official project websites before interacting with any smart contracts. Never share your seed phrase or private keys.
        </div>

        {/* Related airdrops */}
        <div className="border-t border-border/50 pt-6 sm:pt-8">
          <h3 className="font-display font-bold text-base sm:text-lg text-foreground mb-4">More Airdrop Guides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {AIRDROPS_DATA.filter(a => a.id !== project.id).slice(0, 4).map(a => (
              <Link key={a.id} to={`/airdrops/${a.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/30 hover:bg-primary/5 transition-all group min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border p-1 flex items-center justify-center shrink-0">
                  <img src={a.logo} alt={a.name} className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground truncate">AI Score: {a.aiScore}/100 · {a.estValue}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom nav buttons — always visible */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-6 border-t border-border/50">
          <Link to="/airdrops"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-muted/30 text-sm font-bold text-foreground hover:bg-muted/60 transition-all">
            <ArrowLeft className="w-4 h-4 shrink-0" />
            All Airdrops
          </Link>
          <Link to="/my/scanner"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Check Wallet Eligibility
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AirdropDetail;
