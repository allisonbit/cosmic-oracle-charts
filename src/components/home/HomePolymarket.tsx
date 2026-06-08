import { Link } from "react-router-dom";
import { usePolymarketMarkets, analyzeMarket } from "@/hooks/usePolymarket";
import { Gauge, ArrowRight } from "lucide-react";

const POS = "hsl(142 71% 45%)";
const NEG = "hsl(0 84% 60%)";

export function HomePolymarket() {
  const { data, isLoading } = usePolymarketMarkets("");
  const markets = (data?.markets ?? []).slice(0, 5);
  // Hide entirely until the Polymarket function is live / returns data.
  if (!isLoading && markets.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-2 rounded-xl bg-primary/15 shrink-0"><Gauge className="w-5 h-5 text-primary" /></span>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-display font-bold">What the Market's Betting On</h2>
            <p className="text-xs text-muted-foreground truncate">Live Polymarket odds with an AI signal on each</p>
          </div>
        </div>
        <Link to="/polymarket" className="text-sm text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">All markets <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {markets.map((m) => {
            const sig = analyzeMarket(m);
            const top = sig.probabilities.slice(0, 2);
            return (
              <Link key={m.id} to="/polymarket" className="group rounded-xl border border-border/50 bg-card/40 p-3 hover:border-primary/40 transition-all flex flex-col">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary self-start mb-2">{m.category}</span>
                <h3 className="text-xs font-semibold leading-snug line-clamp-3 mb-2.5 group-hover:text-primary transition-colors flex-1">{m.question}</h3>
                <div className="space-y-1.5">
                  {top.map((p, i) => (
                    <div key={p.outcome}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="truncate max-w-[64%]">{p.outcome}</span>
                        <span className="font-mono font-bold" style={{ color: i === 0 ? POS : NEG }}>{p.prob.toFixed(0)}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${p.prob}%`, background: i === 0 ? POS : NEG }} /></div>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
