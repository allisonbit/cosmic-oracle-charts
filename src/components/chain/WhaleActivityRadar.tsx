import { useMemo } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { WhaleActivity } from "@/hooks/useChainData";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (!whaleActivity) return { buys: 0, sells: 0, transfers: 0, totalVolume: 0 };
    return whaleActivity.reduce((acc, a) => {
      if (a.type === "buy") acc.buys += a.value;
      if (a.type === "sell") acc.sells += a.value;
      if (a.type === "transfer") acc.transfers += a.value;
      acc.totalVolume += a.value;
      return acc;
    }, { buys: 0, sells: 0, transfers: 0, totalVolume: 0 });
  }, [whaleActivity]);

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Whale Activity Radar</h3>
          <p className="text-sm text-muted-foreground">Large transaction tracking on {chain.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Visualization */}
        <div className="relative aspect-square max-w-[300px] mx-auto">
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
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-success/10 border border-success/30">
              <ArrowUpRight className="h-4 w-4 text-success mb-1" />
              <p className="text-xs text-muted-foreground">Buys</p>
              <p className="text-sm font-display text-success">{formatValue(stats.buys)}</p>
            </div>
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
              <ArrowDownRight className="h-4 w-4 text-danger mb-1" />
              <p className="text-xs text-muted-foreground">Sells</p>
              <p className="text-sm font-display text-danger">{formatValue(stats.sells)}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <ArrowRight className="h-4 w-4 text-warning mb-1" />
              <p className="text-xs text-muted-foreground">Transfers</p>
              <p className="text-sm font-display text-warning">{formatValue(stats.transfers)}</p>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {whaleActivity?.slice(0, 8).map((activity, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg transition-all",
                  activity.type === "buy" && "bg-success/5 border border-success/20",
                  activity.type === "sell" && "bg-danger/5 border border-danger/20",
                  activity.type === "transfer" && "bg-warning/5 border border-warning/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {activity.type === "buy" && <ArrowUpRight className="h-4 w-4 text-success" />}
                  {activity.type === "sell" && <ArrowDownRight className="h-4 w-4 text-danger" />}
                  {activity.type === "transfer" && <ArrowRight className="h-4 w-4 text-warning" />}
                  <div>
                    <p className="text-sm text-foreground">
                      {activity.amount.toLocaleString()} {activity.token}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{formatValue(activity.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
