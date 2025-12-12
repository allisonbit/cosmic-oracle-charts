import { useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { WhaleActivity } from "@/hooks/useChainData";
import { ArrowUpRight, ArrowDownRight, ArrowRight, ExternalLink, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WhaleActivityRadarProps {
  chain: ChainConfig;
  whaleActivity: WhaleActivity[] | undefined;
  isLoading: boolean;
}

export function WhaleActivityRadar({ chain, whaleActivity, isLoading }: WhaleActivityRadarProps) {
  const formatValue = (num: number) => {
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const copyWallet = (wallet: string | undefined) => {
    if (wallet) {
      navigator.clipboard.writeText(wallet);
      toast.success("Wallet address copied!");
    }
  };

  // Calculate radar positions for visualization
  const radarDots = useMemo(() => {
    if (!whaleActivity) return [];
    return whaleActivity.slice(0, 20).map((activity, i) => {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 30 + (activity.value / 1e6) * 10;
      return {
        ...activity,
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
        size: Math.min(20, 6 + (activity.value / 1e6) * 2),
      };
    });
  }, [whaleActivity]);

  const stats = useMemo(() => {
    if (!whaleActivity) return { buys: 0, sells: 0, transfers: 0, totalVolume: 0, count: 0 };
    return whaleActivity.reduce((acc, a) => {
      if (a.type === "buy") acc.buys += a.value;
      if (a.type === "sell") acc.sells += a.value;
      if (a.type === "transfer") acc.transfers += a.value;
      acc.totalVolume += a.value;
      acc.count++;
      return acc;
    }, { buys: 0, sells: 0, transfers: 0, totalVolume: 0, count: 0 });
  }, [whaleActivity]);

  return (
    <div className="holo-card p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-display text-foreground">Whale Activity Radar</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Large transactions on {chain.name}</p>
        </div>
        <a
          href={`${chain.explorerUrl}/txs`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          View All
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Radar Visualization */}
        <div className="relative aspect-square max-w-[200px] sm:max-w-[300px] mx-auto">
          {/* Radar circles */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circles */}
            {[20, 35, 50].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            ))}

            {/* Cross lines */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="hsl(var(--border))" strokeWidth="0.5" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="hsl(var(--border))" strokeWidth="0.5" />

            {/* Center icon */}
            <text
              x="50"
              y="52"
              textAnchor="middle"
              fontSize="16"
              fill={`hsl(${chain.color})`}
            >
              {chain.icon}
            </text>

            {/* Activity dots */}
            {radarDots.map((dot, i) => (
              <g key={i}>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.size / 4}
                  fill={
                    dot.type === "buy"
                      ? "hsl(160 84% 39%)"
                      : dot.type === "sell"
                      ? "hsl(0 84% 60%)"
                      : "hsl(38 92% 50%)"
                  }
                  className="animate-pulse"
                >
                  <animate
                    attributeName="opacity"
                    values="0.4;1;0.4"
                    dur={`${2 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={dot.size / 2}
                  fill="none"
                  stroke={
                    dot.type === "buy"
                      ? "hsl(160 84% 39% / 0.3)"
                      : dot.type === "sell"
                      ? "hsl(0 84% 60% / 0.3)"
                      : "hsl(38 92% 50% / 0.3)"
                  }
                  strokeWidth="1"
                />
              </g>
            ))}
          </svg>

          {/* Scanning line animation */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(${chain.color} / 0.1) 30deg, transparent 60deg)`,
              animation: "spin 4s linear infinite",
            }}
          />
        </div>

        {/* Activity Stats & List */}
        <div className="space-y-3 sm:space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="p-2 sm:p-3 rounded-lg bg-success/10 border border-success/30">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-success mb-0.5 sm:mb-1" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Buys</p>
              <p className="text-xs sm:text-sm font-display text-success">{formatValue(stats.buys)}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-danger/10 border border-danger/30">
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-danger mb-0.5 sm:mb-1" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Sells</p>
              <p className="text-xs sm:text-sm font-display text-danger">{formatValue(stats.sells)}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-lg bg-warning/10 border border-warning/30">
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-warning mb-0.5 sm:mb-1" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Transfers</p>
              <p className="text-xs sm:text-sm font-display text-warning">{formatValue(stats.transfers)}</p>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="space-y-1.5 sm:space-y-2 max-h-[160px] sm:max-h-[200px] overflow-y-auto">
            {whaleActivity?.slice(0, 8).map((activity, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-1.5 sm:p-2 rounded-lg transition-all group",
                  activity.type === "buy" && "bg-success/5 border border-success/20",
                  activity.type === "sell" && "bg-danger/5 border border-danger/20",
                  activity.type === "transfer" && "bg-warning/5 border border-warning/20"
                )}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  {activity.type === "buy" && <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />}
                  {activity.type === "sell" && <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-danger flex-shrink-0" />}
                  {activity.type === "transfer" && <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-foreground truncate">
                      {activity.amount.toLocaleString()} {activity.token}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                      {activity.wallet && (
                        <button
                          onClick={() => copyWallet(activity.wallet)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-xs sm:text-sm font-medium text-foreground">{formatValue(activity.value)}</span>
                  {activity.wallet && (
                    <a
                      href={`${chain.explorerUrl}/address/${activity.wallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
