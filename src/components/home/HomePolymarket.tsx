import { Link } from "react-router-dom";
import { usePolymarketMarkets, analyzeMarket } from "@/hooks/usePolymarket";
import { ArrowRight } from "lucide-react";

const POS = "hsl(142 71% 45%)";
const NEG = "hsl(0 84% 60%)";

export function HomePolymarket() {
  const { data, isLoading } = usePolymarketMarkets("");
  const markets = (data?.markets ?? []).slice(0, 5);
  if (!isLoading && markets.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="section-header mb-2">
        <span className="section-label">Prediction Markets</span>
        <Link to="/polymarket" className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline shrink-0">
          All markets <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <h2 className="text-xl md:text-2xl font-display font-bold mb-5">What the Market's Betting On</h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/20 animate-pulse border-b border-border/20" />
          ))}
        </div>
      ) : (
        <div>
          {markets.map((m) => {
            const sig = analyzeMarket(m);
            const top = sig.probabilities.slice(0, 2);
            return (
              <Link
                key={m.id}
                to="/polymarket"
                className="editorial-row group items-start"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{m.category}</span>
                    <span className="text-xs font-semibold leading-snug line-clamp-1 group-hover:text-primary transition-colors">{m.question}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {top.map((p, i) => (
                      <div key={p.outcome} className="flex items-center gap-1.5 min-w-0">
                        <div className="h-1 w-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          <div className="h-full rounded-full" style={{ width: `${p.prob}%`, background: i === 0 ? POS : NEG }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold" style={{ color: i === 0 ? POS : NEG }}>{p.prob.toFixed(0)}%</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{p.outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
