import { Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";

interface Sector {
  name: string;
  change: number;
  marketCap: number;
  volume: number;
  link: string;
}

function formatCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

export function SectorPerformancePanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["sector-performance"],
    queryFn: async () => {
      const { data, error } = await invokeFunction("sector-performance", { body: {} });
      if (error) throw error;
      return (data?.sectors ?? []) as Sector[];
    },
    refetchInterval: 120_000,
    refetchIntervalInBackground: true,
    staleTime: 60_000,
  });
  const sectors = (data ?? []).slice().sort((a, b) => b.change - a.change);

  return (
    <div className="holo-card p-4 sm:p-6">
      <h3 className="font-display font-bold text-sm sm:text-base mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        SECTOR PERFORMANCE
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal">24h change by sector</span>
      </h3>

      <div className="space-y-2">
        {isLoading && sectors.length === 0 && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted/20 animate-pulse" />
        ))}
        {sectors.map((sector) => {
          const maxChange = Math.max(...sectors.map(s => Math.abs(s.change)), 0.01);
          const barWidth = Math.min(100, (Math.abs(sector.change) / maxChange) * 100);
          
          return (
            <Link
              key={sector.name}
              to={sector.link}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
            >
              <div className="w-24 sm:w-28 text-xs sm:text-sm font-medium truncate">{sector.name}</div>
              
              <div className="flex-1 relative h-6 bg-muted/20 rounded overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 h-full rounded transition-all",
                    sector.change >= 0 ? "bg-success/30 left-1/2" : "bg-danger/30 right-1/2"
                  )}
                  style={{
                    width: `${barWidth / 2}%`,
                    ...(sector.change < 0 ? { right: '50%' } : { left: '50%' })
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "text-[10px] sm:text-xs font-bold",
                    sector.change >= 0 ? "text-success" : "text-danger"
                  )}>
                    {sector.change >= 0 ? "+" : ""}{(sector.change ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground w-24 justify-end">
                {formatCap(sector.marketCap)}
              </div>
              
              <ArrowRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
