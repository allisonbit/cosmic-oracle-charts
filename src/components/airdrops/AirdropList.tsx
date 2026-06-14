import { useState, useMemo } from "react";
import { AirdropCard } from "./AirdropCard";
import { ArrowUpDown, Flame, Clock, CheckCircle2, AlertTriangle, Radio, TrendingUp } from "lucide-react";
import { type AirdropProject, AIRDROPS_DATA } from "./airdropData";

// Re-export types so existing imports from this file still work
export type { FullGuide, AirdropProject } from "./airdropData";
export { AIRDROPS_DATA } from "./airdropData";


const FILTER_TABS = [
  { id: "All", label: "All Airdrops", icon: <Radio className="w-3.5 h-3.5" /> },
  { id: "Live", label: "Live Now", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "Upcoming", label: "Upcoming", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "Verified", label: "Verified Only", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "High Risk", label: "High Risk", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
];

type SortKey = "aiScore" | "rewardRatio" | "estValue";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "aiScore", label: "AI Score" },
  { key: "rewardRatio", label: "Effort:Reward" },
  { key: "estValue", label: "Est. Value" },
];

export function AirdropList() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<SortKey>("aiScore");

  const filtered = useMemo(() => {
    let list = [...AIRDROPS_DATA];
    if (filter === "Live") list = list.filter(a => a.liveStatus === "Live");
    else if (filter === "Upcoming") list = list.filter(a => a.liveStatus === "Upcoming");
    else if (filter === "Ended") list = list.filter(a => a.liveStatus === "Ended");
    else if (filter === "Verified") list = list.filter(a => a.isVerified);
    else if (filter === "High Risk") list = list.filter(a => a.riskLevel === "High");

    list.sort((a, b) => {
      if (sort === "aiScore") return b.aiScore - a.aiScore;
      if (sort === "rewardRatio") return b.rewardRatio - a.rewardRatio;
      if (sort === "estValue") {
        const getMin = (s: string) => parseInt(s.replace(/[^0-9]/g, "").slice(0, 5) || "0");
        return getMin(b.estValue) - getMin(a.estValue);
      }
      return 0;
    });
    return list;
  }, [filter, sort]);

  return (
    <>
      <div>
        {/* Filters + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  filter === tab.id
                    ? tab.id === "High Risk" ? "bg-danger/10 text-danger border-danger/30"
                      : tab.id === "Verified" ? "bg-success/10 text-success border-success/30"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-background/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {tab.icon} {tab.label}
                <span className="ml-1 opacity-60 text-[10px]">
                  {tab.id === "All" ? AIRDROPS_DATA.length
                    : tab.id === "Live" ? AIRDROPS_DATA.filter(a => a.liveStatus === "Live").length
                    : tab.id === "Upcoming" ? AIRDROPS_DATA.filter(a => a.liveStatus === "Upcoming").length
                    : tab.id === "Verified" ? AIRDROPS_DATA.filter(a => a.isVerified).length
                    : AIRDROPS_DATA.filter(a => a.riskLevel === "High").length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => setSort(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    sort === opt.key ? "bg-primary/10 text-primary border-primary/30" : "bg-muted/30 text-muted-foreground border-border hover:text-foreground"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">{filtered.length} opportunities</span>
          <span className="text-xs text-muted-foreground">· ranked by {sort === "aiScore" ? "Oracle AI Score" : sort === "rewardRatio" ? "Effort:Reward ratio" : "estimated value"}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No airdrops match this filter.</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.map((project, idx) => (
              <AirdropCard key={project.id} project={project} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}