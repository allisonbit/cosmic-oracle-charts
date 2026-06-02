import { DollarSign, BarChart3, Droplets, Globe, Activity, ArrowUpRight, ArrowDownRight, Zap, Clock, Users } from "lucide-react";
import { formatCompact, formatChange, formatNumber } from "@/lib/formatters";
import { StatCard } from "@/components/features/token-detail/TokenComponents";

interface TokenQuickStatsProps {
  token: any;
  derivedMetrics: any;
}

export function TokenQuickStats({ token, derivedMetrics }: TokenQuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <StatCard label="Market Cap" value={formatCompact(token.marketCap)} icon={DollarSign} />
      <StatCard label="24h Volume" value={formatCompact(token.volume24h)} icon={BarChart3} />
      <StatCard label="Liquidity" value={formatCompact(token.liquidity)} icon={Droplets} />
      <StatCard label="FDV" value={formatCompact(token.fdv)} icon={Globe} />
      <StatCard label="24h Txns" value={(token.txns24h || 0).toLocaleString()} icon={Activity} />
      <StatCard label="Buys" value={(token.buys24h || 0).toLocaleString()} icon={ArrowUpRight} change={token.buys24h ? undefined : undefined} accent="border-success/20" />
      <StatCard label="Sells" value={(token.sells24h || 0).toLocaleString()} icon={ArrowDownRight} accent="border-danger/20" />
      <StatCard label="5m Change" value={formatChange(token.change5m)} icon={Zap} change={token.change5m} />
      <StatCard label="1h Change" value={formatChange(token.change1h)} icon={Clock} change={token.change1h} />
      {derivedMetrics && (
        <StatCard label="Holders" value={formatNumber(derivedMetrics.holders)} icon={Users} />
      )}
    </div>
  );
}
