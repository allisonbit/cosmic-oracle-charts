import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HolderDistribution } from "@/components/features/token-detail/TokenComponents";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Wallet, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";
import { useParams } from "react-router-dom";

interface TokenHoldersTabProps {
  derivedMetrics: any;
}

const DIST_COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"];

function shortAddr(a: string) {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function TokenHoldersTab({ derivedMetrics }: TokenHoldersTabProps) {
  const { chain = "ethereum", address = "" } = useParams<{ chain: string; address: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["token-holders", chain, address],
    queryFn: async () => {
      const { data, error } = await invokeFunction("token-holders", {
        body: { chain, address },
      });
      if (error) throw error;
      return data as {
        holders: Array<{ address: string; balance: number; pct: number }>;
        distribution: Array<{ label: string; pct: number }>;
        totalHolders: number | null;
        supported: boolean;
      };
    },
    enabled: !!address,
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: true,
    staleTime: 4 * 60_000,
  });

  const distribution = (data?.distribution ?? []).map((d, i) => ({ ...d, color: DIST_COLORS[i] ?? DIST_COLORS[3] }));
  const topHolders = data?.holders ?? [];
  const totalHolders = data?.totalHolders ?? derivedMetrics?.holders ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> Holder Distribution</CardTitle></CardHeader>
        <CardContent>
          {isLoading && <div className="h-32 rounded bg-muted/30 animate-pulse" />}
          {!isLoading && distribution.length > 0 && <HolderDistribution topHolders={distribution} />}
          {!isLoading && distribution.length === 0 && (
            <p className="text-xs text-muted-foreground">Holder distribution unavailable for this token.</p>
          )}
          <div className="mt-4 flex justify-between text-xs">
            <span className="text-muted-foreground">Indexed Holders</span>
            <span className="font-mono font-bold">{totalHolders ? formatNumber(totalHolders) : "—"}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-warning" /> Top Holders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 rounded bg-muted/30 animate-pulse" />
          ))}
          {!isLoading && topHolders.length > 0 && topHolders.map((h, i) => (
            <div key={`${h.address}-${i}`} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
              <span className="font-mono text-muted-foreground">#{i + 1} {shortAddr(h.address)}</span>
              <span className="font-mono font-medium">{h.pct.toFixed(2)}%</span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                h.pct > 5 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
              )}>
                {h.pct > 5 ? "Whale" : "Holder"}
              </span>
            </div>
          ))}
          {!isLoading && topHolders.length === 0 && (
            <p className="text-xs text-muted-foreground">On-chain holder data unavailable for this chain.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
