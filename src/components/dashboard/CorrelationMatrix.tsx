import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_ASSETS = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA"];

export function CorrelationMatrix() {
  const { data } = useQuery({
    queryKey: ["correlation-matrix"],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("correlation-matrix");
      return data as { matrix: Record<string, Record<string, number>>; symbols: string[] };
    },
    refetchInterval: 10 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 5 * 60 * 1000,
  });

  const ASSETS = data?.symbols?.length ? data.symbols : FALLBACK_ASSETS;
  const correlations = data?.matrix ?? {};
  const getVal = (a: string, b: string) => correlations[a]?.[b] ?? (a === b ? 1 : 0);

  const getCorrelationColor = (value: number) => {
    if (value === 1) return "bg-primary/20 text-primary";
    if (value >= 0.7) return "bg-success/20 text-success";
    if (value >= 0.3) return "bg-warning/20 text-warning";
    return "bg-danger/20 text-danger";
  };

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm sm:text-base font-bold flex items-center gap-2">
          <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          24H CORRELATION MATRIX
        </h3>
        <span className="text-[10px] sm:text-xs text-muted-foreground">How assets move together</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '2px' }}>
          <thead>
            <tr>
              <th className="text-[10px] sm:text-xs font-semibold text-muted-foreground p-1"></th>
              {ASSETS.map(asset => (
                <th key={asset} className="text-[10px] sm:text-xs font-semibold text-muted-foreground p-1">
                  {asset}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(asset1 => (
              <tr key={asset1}>
                <td className="text-[10px] sm:text-xs font-medium text-muted-foreground p-1">{asset1}</td>
                {ASSETS.map(asset2 => (
                  <td 
                    key={asset2}
                    className={cn(
                      "text-center p-1.5 sm:p-2 rounded text-[10px] sm:text-xs font-mono font-semibold",
                      getCorrelationColor(correlations[asset1][asset2])
                    )}
                  >
                    {getVal(asset1, asset2).toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-success/30" />
          <span>High (&gt;0.7)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-warning/30" />
          <span>Medium (0.3-0.7)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-danger/30" />
          <span>Low (&lt;0.3)</span>
        </div>
      </div>
    </div>
  );
}
