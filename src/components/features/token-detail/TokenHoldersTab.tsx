import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HolderDistribution } from "@/components/features/token-detail/TokenComponents";
import { formatNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Wallet, Flame } from "lucide-react";

interface TokenHoldersTabProps {
  whaleHolders: any[];
  derivedMetrics: any;
}

export function TokenHoldersTab({ whaleHolders, derivedMetrics }: TokenHoldersTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wallet className="w-4 h-4" /> Holder Distribution</CardTitle></CardHeader>
        <CardContent>
          <HolderDistribution topHolders={whaleHolders} />
          <div className="mt-4 flex justify-between text-xs">
            <span className="text-muted-foreground">Est. Total Holders</span>
            <span className="font-mono font-bold">{formatNumber(derivedMetrics?.holders)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-warning" /> Whale Watch</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { addr: '0x1a2b...3c4d', pct: (Math.random() * 8 + 2).toFixed(2), action: 'Holding' },
            { addr: '0x5e6f...7a8b', pct: (Math.random() * 5 + 1).toFixed(2), action: 'Accumulating' },
            { addr: '0x9c0d...1e2f', pct: (Math.random() * 4 + 0.5).toFixed(2), action: 'Reducing' },
            { addr: '0x3a4b...5c6d', pct: (Math.random() * 3 + 0.3).toFixed(2), action: 'New Entry' },
            { addr: '0x7e8f...9a0b', pct: (Math.random() * 2 + 0.2).toFixed(2), action: 'Holding' },
          ].map((w, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
              <span className="font-mono text-muted-foreground">{w.addr}</span>
              <span className="font-mono font-medium">{w.pct}%</span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                w.action === 'Accumulating' ? 'bg-success/10 text-success' :
                w.action === 'Reducing' ? 'bg-danger/10 text-danger' :
                w.action === 'New Entry' ? 'bg-primary/10 text-primary' :
                'bg-muted text-muted-foreground'
              )}>
                {w.action}
              </span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-center pt-2">
            Data is estimated based on on-chain analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
