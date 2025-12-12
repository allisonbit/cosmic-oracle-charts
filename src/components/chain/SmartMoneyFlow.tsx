import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { SmartMoneyFlow as SmartMoneyFlowType } from "@/hooks/useChainData";
import { ArrowDownLeft, ArrowUpRight, Droplets, Repeat, ExternalLink, ChevronDown, ChevronUp, Wallet, TrendingUp, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SmartMoneyFlowProps {
  chain: ChainConfig;
  smartMoneyFlow: SmartMoneyFlowType | undefined;
  isLoading: boolean;
}

export function SmartMoneyFlow({ chain, smartMoneyFlow, isLoading }: SmartMoneyFlowProps) {
  const [swapsExpanded, setSwapsExpanded] = useState(false);
  const [liquidityExpanded, setLiquidityExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const formatValue = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const inflowPercent = smartMoneyFlow
    ? (smartMoneyFlow.inflow / (smartMoneyFlow.inflow + smartMoneyFlow.outflow)) * 100
    : 50;

  const getDexScreenerLink = (token: string) => {
    const chainSlug = chain.id === "ethereum" ? "ethereum" : chain.id === "polygon" ? "polygon" : chain.id === "arbitrum" ? "arbitrum" : chain.id === "base" ? "base" : chain.id;
    return `https://dexscreener.com/${chainSlug}/${token.toLowerCase()}`;
  };

  const getUniswapLink = () => {
    if (chain.id === "ethereum") return "https://app.uniswap.org/#/swap";
    if (chain.id === "polygon") return "https://app.uniswap.org/#/swap?chain=polygon";
    if (chain.id === "arbitrum") return "https://app.uniswap.org/#/swap?chain=arbitrum";
    if (chain.id === "base") return "https://app.uniswap.org/#/swap?chain=base";
    if (chain.id === "optimism") return "https://app.uniswap.org/#/swap?chain=optimism";
    return "https://app.uniswap.org/#/swap";
  };

  return (
    <div className="holo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display text-foreground">Smart Money Flow</h3>
          <p className="text-sm text-muted-foreground">Capital movement on {chain.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://defillama.com/chain/${chain.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            title="View on DeFi Llama"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse bg-muted/20 rounded-xl" />
      ) : smartMoneyFlow ? (
        <div className="space-y-6">
          {/* Flow Visualization */}
          <div className="relative">
            {/* Flow Bar */}
            <div className="h-10 rounded-full overflow-hidden bg-muted/30 flex shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-success/80 to-success flex items-center justify-end px-3 transition-all relative"
                style={{ width: `${inflowPercent}%` }}
              >
                <ArrowDownLeft className="h-5 w-5 text-success-foreground" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </div>
              <div
                className="h-full bg-gradient-to-r from-danger to-danger/80 flex items-center px-3 transition-all relative"
                style={{ width: `${100 - inflowPercent}%` }}
              >
                <ArrowUpRight className="h-5 w-5 text-danger-foreground" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
              </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-3">
              <div>
                <p className="text-sm text-success font-medium flex items-center gap-1">
                  <ArrowDownLeft className="h-3 w-3" /> Inflow
                </p>
                <p className="text-xl font-display text-foreground">{formatValue(smartMoneyFlow.inflow)}</p>
                <p className="text-xs text-muted-foreground">{inflowPercent.toFixed(1)}% of total</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className={cn(
                  "text-xl font-display",
                  smartMoneyFlow.netFlow >= 0 ? "text-success" : "text-danger"
                )}>
                  {smartMoneyFlow.netFlow >= 0 ? "+" : ""}{formatValue(smartMoneyFlow.netFlow)}
                </p>
                <p className={cn(
                  "text-xs",
                  smartMoneyFlow.netFlow >= 0 ? "text-success/70" : "text-danger/70"
                )}>
                  {smartMoneyFlow.netFlow >= 0 ? "Bullish Signal" : "Bearish Signal"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-danger font-medium flex items-center gap-1 justify-end">
                  Outflow <ArrowUpRight className="h-3 w-3" />
                </p>
                <p className="text-xl font-display text-foreground">{formatValue(smartMoneyFlow.outflow)}</p>
                <p className="text-xs text-muted-foreground">{(100 - inflowPercent).toFixed(1)}% of total</p>
              </div>
            </div>
          </div>

          {/* Expandable Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Swaps - Expandable */}
            <Collapsible open={swapsExpanded} onOpenChange={setSwapsExpanded}>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <CollapsibleTrigger className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">Top Swaps</h4>
                  </div>
                  {swapsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                
                <div className="space-y-2 mt-3">
                  {smartMoneyFlow.topSwaps.slice(0, swapsExpanded ? 10 : 3).map((swap, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {swap.from} → {swap.to}
                        </span>
                        <a
                          href={getDexScreenerLink(swap.to)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <span className="text-foreground font-medium">{formatValue(swap.amount)}</span>
                    </div>
                  ))}
                </div>

                <CollapsibleContent>
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <a
                      href={getUniswapLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
                    >
                      <Repeat className="h-4 w-4" />
                      Trade on Uniswap
                    </a>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Liquidity Changes - Expandable */}
            <Collapsible open={liquidityExpanded} onOpenChange={setLiquidityExpanded}>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <CollapsibleTrigger className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-secondary" />
                    <h4 className="text-sm font-medium text-foreground">Liquidity</h4>
                  </div>
                  {liquidityExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                
                <div className="space-y-3 mt-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Added</span>
                      <span className="text-xs text-success font-medium">{formatValue(smartMoneyFlow.liquidityAdded)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{
                          width: `${(smartMoneyFlow.liquidityAdded / (smartMoneyFlow.liquidityAdded + smartMoneyFlow.liquidityRemoved)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Removed</span>
                      <span className="text-xs text-danger font-medium">{formatValue(smartMoneyFlow.liquidityRemoved)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-danger rounded-full transition-all"
                        style={{
                          width: `${(smartMoneyFlow.liquidityRemoved / (smartMoneyFlow.liquidityAdded + smartMoneyFlow.liquidityRemoved)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Net Liquidity Change</span>
                      <span className={cn(
                        "font-medium",
                        smartMoneyFlow.liquidityAdded > smartMoneyFlow.liquidityRemoved ? "text-success" : "text-danger"
                      )}>
                        {smartMoneyFlow.liquidityAdded > smartMoneyFlow.liquidityRemoved ? "+" : "-"}
                        {formatValue(Math.abs(smartMoneyFlow.liquidityAdded - smartMoneyFlow.liquidityRemoved))}
                      </span>
                    </div>
                    <a
                      href={`https://defillama.com/chain/${chain.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors text-sm"
                    >
                      <Activity className="h-4 w-4" />
                      View TVL on DeFi Llama
                    </a>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          {/* Detailed Metrics - Expandable */}
          <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Advanced Metrics</span>
              </div>
              {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <Wallet className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Active Wallets</p>
                    <p className="text-lg font-display text-foreground">12.4K</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <Activity className="h-5 w-5 mx-auto text-secondary mb-1" />
                    <p className="text-xs text-muted-foreground">Tx Count (24h)</p>
                    <p className="text-lg font-display text-foreground">45.2K</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
                    <p className="text-xs text-muted-foreground">Avg Trade Size</p>
                    <p className="text-lg font-display text-foreground">$8.5K</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/10">
                    <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
                    <p className="text-xs text-muted-foreground">Peak Hour</p>
                    <p className="text-lg font-display text-foreground">14:00 UTC</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={`https://dune.com/browse/dashboards?q=${chain.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Dune Analytics
                  </a>
                  <a
                    href={`https://nansen.ai/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Nansen
                  </a>
                  <a
                    href={`https://arkham.intelligence.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Arkham Intel
                  </a>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ) : null}
    </div>
  );
}
