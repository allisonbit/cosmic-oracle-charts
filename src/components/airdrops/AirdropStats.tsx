import { Brain, TrendingUp, DollarSign, CheckCircle2, Flame } from "lucide-react";
import { AIRDROPS_DATA } from "./AirdropList";

export function AirdropStats() {
  const live = AIRDROPS_DATA.filter(a => a.liveStatus === "Live").length;
  const verified = AIRDROPS_DATA.filter(a => a.isVerified).length;
  const weeklyValue = "$312M";
  const avgScore = Math.round(AIRDROPS_DATA.reduce((acc, a) => acc + a.aiScore, 0) / AIRDROPS_DATA.length);

  const stats = [
    { icon: <Flame className="w-5 h-5 text-danger" />, color: "bg-danger/10", value: `${live} Live`, label: "Active Airdrops Now", sub: `+${AIRDROPS_DATA.filter(a => a.liveStatus === "Upcoming").length} upcoming` },
    { icon: <DollarSign className="w-5 h-5 text-success" />, color: "bg-success/10", value: weeklyValue, label: "Total Value This Week", sub: "across all tracked drops" },
    { icon: <CheckCircle2 className="w-5 h-5 text-primary" />, color: "bg-primary/10", value: `${verified}/${AIRDROPS_DATA.length}`, label: "Verified Opportunities", sub: "manually reviewed" },
    { icon: <Brain className="w-5 h-5 text-purple-400" />, color: "bg-purple-500/10", value: `${avgScore}/100`, label: "Avg. AI Score", sub: "across all ranked drops" },
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
