import { Star, TrendingUp, BookOpen, ShieldCheck, Flame } from "lucide-react";
import { AIRDROPS_DATA } from "./AirdropList";

// All four cards are computed from the editorial dataset — nothing here is a
// live feed or an AI output. Labels say exactly what the numbers are.
export function AirdropStats() {
  const live = AIRDROPS_DATA.filter(a => a.liveStatus === "Live").length;
  const upcoming = AIRDROPS_DATA.filter(a => a.liveStatus === "Upcoming").length;
  const lowRisk = AIRDROPS_DATA.filter(a => a.riskLevel === "Low").length;
  const withGuide = AIRDROPS_DATA.filter(a => a.fullGuide).length;
  const avgScore = Math.round(AIRDROPS_DATA.reduce((acc, a) => acc + a.aiScore, 0) / AIRDROPS_DATA.length);

  const stats = [
    { icon: <Flame className="w-5 h-5 text-danger" />, color: "bg-danger/10", value: `${live} Live`, label: "Live Now", sub: `+${upcoming} upcoming` },
    { icon: <BookOpen className="w-5 h-5 text-primary" />, color: "bg-primary/10", value: `${withGuide}`, label: "In-Depth Guides", sub: `across ${AIRDROPS_DATA.length} tracked projects` },
    { icon: <ShieldCheck className="w-5 h-5 text-success" />, color: "bg-success/10", value: `${lowRisk}`, label: "Flagged Lower-Risk", sub: "editorial assessment, not advice" },
    { icon: <Star className="w-5 h-5 text-purple-400" />, color: "bg-purple-500/10", value: `${avgScore}/100`, label: "Avg. Editorial Score", sub: "our ranking — not an AI model" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => (
        <div key={i} className="holo-card p-4 flex flex-col gap-3">
          <div className={`p-2 rounded-xl w-fit ${s.color}`}>{s.icon}</div>
          <div>
            <div className="text-xl font-display font-bold text-foreground">{s.value}</div>
            <div className="text-xs font-semibold text-foreground/80 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
