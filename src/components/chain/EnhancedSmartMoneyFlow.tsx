import { useState } from "react";
import { ChainConfig } from "@/lib/chainConfig";
import { SmartMoneyFlow as SmartMoneyFlowType } from "@/hooks/useChainData";
import { ArrowDownLeft, ArrowUpRight, Droplets, Repeat, ExternalLink, ChevronDown, ChevronUp, Wallet, TrendingUp, Activity, Clock, BarChart3, Users, Zap, Target, Info, X, Copy, ArrowRightLeft, ArrowDownUp, PieChart, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface EnhancedSmartMoneyFlowProps {
  chain: ChainConfig;
  smartMoneyFlow: SmartMoneyFlowType | undefined;
  isLoading: boolean;
}

interface DetailModalData {
  type: 'inflow' | 'outflow' | 'netflow' | 'swap' | 'liquidity' | 'wallet' | 'metric';
  title: string;
  data: any;
}

export function EnhancedSmartMoneyFlow({ chain, smartMoneyFlow, isLoading }: EnhancedSmartMoneyFlowProps) {
  const [swapsExpanded, setSwapsExpanded] = useState(false);
  const [liquidityExpanded, setLiquidityExpanded] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DetailModalData | null>(null);

  const formatValue = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const inflowPercent = smartMoneyFlow
    ? (smartMoneyFlow.inflow / (smartMoneyFlow.inflow + smartMoneyFlow.outflow)) * 100
    : 50;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getTradeLink = () => "/trade";

  const openDetailModal = (type: DetailModalData['type'], title: string, data: any) => {
    setModalData({ type, title, data });
    setModalOpen(true);
  };

  // Generate mock enhanced data
  const enhancedMetrics = {
    activeWallets: Math.floor(10000 + Math.random() * 5000),
    txCount24h: Math.floor(40000 + Math.random() * 20000),
    avgTradeSize: Math.floor(5000 + Math.random() * 10000),
    peakHour: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00 UTC`,
    smartMoneyWallets: Math.floor(500 + Math.random() * 300),
    profitableWallets: Math.floor(70 + Math.random() * 20),
    avgHoldTime: `${Math.floor(2 + Math.random() * 10)}d`,
    winRate: Math.floor(55 + Math.random() * 30),
  };

  const topWallets = [
    { address: '0x7a16...3b4f', balance: 2500000, pnl: 125000, trades: 45 },
    { address: '0x8b23...4c5e', balance: 1800000, pnl: 89000, trades: 32 },
    { address: '0x9c34...5d6f', balance: 1200000, pnl: -23000, trades: 28 },
    { address: '0xad45...6e7g', balance: 950000, pnl: 67000, trades: 51 },
    { address: '0xbe56...7f8h', balance: 780000, pnl: 34000, trades: 19 },
  ];

  return (
    <>
      <div className="holo-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-display text-foreground">Enhanced Smart Money Flow</h3>
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
            {/* Clickable Flow Visualization */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => openDetailModal('inflow', 'Capital Inflow Analysis', { value: smartMoneyFlow.inflow, percent: inflowPercent })}
                  className="p-4 rounded-xl border border-success/30 bg-success/5 hover:bg-success/10 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                    <span className="text-xs text-muted-foreground">Inflow</span>
                  </div>
                  <p className="text-xl font-display text-foreground">{formatValue(smartMoneyFlow.inflow)}</p>
                  <p className="text-xs text-success">{inflowPercent.toFixed(1)}% of total</p>
                </button>

                <button
                  onClick={() => openDetailModal('netflow', 'Net Flow Analysis', { value: smartMoneyFlow.netFlow, inflow: smartMoneyFlow.inflow, outflow: smartMoneyFlow.outflow })}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-center",
                    smartMoneyFlow.netFlow >= 0 
                      ? "border-success/30 bg-success/5 hover:bg-success/10" 
                      : "border-danger/30 bg-danger/5 hover:bg-danger/10"
                  )}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Net Flow</span>
                  </div>
                  <p className={cn("text-xl font-display", smartMoneyFlow.netFlow >= 0 ? "text-success" : "text-danger")}>
                    {smartMoneyFlow.netFlow >= 0 ? "+" : ""}{formatValue(smartMoneyFlow.netFlow)}
                  </p>
                  <p className={cn("text-xs", smartMoneyFlow.netFlow >= 0 ? "text-success/70" : "text-danger/70")}>
                    {smartMoneyFlow.netFlow >= 0 ? "Bullish Signal" : "Bearish Signal"}
                  </p>
                </button>

                <button
                  onClick={() => openDetailModal('outflow', 'Capital Outflow Analysis', { value: smartMoneyFlow.outflow, percent: 100 - inflowPercent })}
                  className="p-4 rounded-xl border border-danger/30 bg-danger/5 hover:bg-danger/10 transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Outflow</span>
                    <ArrowUpRight className="h-5 w-5 text-danger" />
                  </div>
                  <p className="text-xl font-display text-foreground">{formatValue(smartMoneyFlow.outflow)}</p>
                  <p className="text-xs text-danger">{(100 - inflowPercent).toFixed(1)}% of total</p>
                </button>
              </div>

              {/* Flow Bar */}
              <div className="h-4 rounded-full overflow-hidden bg-muted/30 flex shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-success/80 to-success transition-all relative"
                  style={{ width: `${inflowPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                </div>
                <div
                  className="h-full bg-gradient-to-r from-danger to-danger/80 transition-all relative"
                  style={{ width: `${100 - inflowPercent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              </div>
            </div>

            {/* Clickable Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => openDetailModal('metric', 'Active Wallets Analysis', { metric: 'activeWallets', value: enhancedMetrics.activeWallets })}
                className="p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center"
              >
                <Wallet className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Active Wallets</p>
                <p className="text-lg font-display text-foreground">{(enhancedMetrics.activeWallets / 1000).toFixed(1)}K</p>
              </button>
              <button
                onClick={() => openDetailModal('metric', 'Transaction Count', { metric: 'txCount', value: enhancedMetrics.txCount24h })}
                className="p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center"
              >
                <Activity className="h-5 w-5 mx-auto text-secondary mb-1" />
                <p className="text-xs text-muted-foreground">Tx Count (24h)</p>
                <p className="text-lg font-display text-foreground">{(enhancedMetrics.txCount24h / 1000).toFixed(1)}K</p>
              </button>
              <button
                onClick={() => openDetailModal('metric', 'Average Trade Size', { metric: 'avgTrade', value: enhancedMetrics.avgTradeSize })}
                className="p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center"
              >
                <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
                <p className="text-xs text-muted-foreground">Avg Trade Size</p>
                <p className="text-lg font-display text-foreground">{formatValue(enhancedMetrics.avgTradeSize)}</p>
              </button>
              <button
                onClick={() => openDetailModal('metric', 'Peak Trading Hour', { metric: 'peakHour', value: enhancedMetrics.peakHour })}
                className="p-3 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all text-center"
              >
                <Clock className="h-5 w-5 mx-auto text-warning mb-1" />
                <p className="text-xs text-muted-foreground">Peak Hour</p>
                <p className="text-lg font-display text-foreground">{enhancedMetrics.peakHour}</p>
              </button>
            </div>

            {/* Top Swaps - Expandable */}
            <Collapsible open={swapsExpanded} onOpenChange={setSwapsExpanded}>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <CollapsibleTrigger className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium text-foreground">Top Swaps</h4>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{smartMoneyFlow.topSwaps.length}</span>
                  </div>
                  {swapsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                
                <div className="space-y-2 mt-3">
                  {smartMoneyFlow.topSwaps.slice(0, swapsExpanded ? 10 : 3).map((swap, i) => (
                    <button
                      key={i}
                      onClick={() => openDetailModal('swap', 'Swap Details', swap)}
                      className="w-full flex items-center justify-between text-xs p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{swap.from} → {swap.to}</span>
                        <a
                          href={getTradeLink()}
                          className="text-primary hover:text-primary/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ArrowDownUp className="h-3 w-3" />
                        </a>
                      </div>
                      <span className="text-foreground font-medium">{formatValue(swap.amount)}</span>
                    </button>
                  ))}
                </div>

                <CollapsibleContent>
                  <div className="mt-3 pt-3 border-t border-border/30 flex gap-2">
                    <a
                      href="/trade"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm"
                    >
                      <Repeat className="h-4 w-4" /> Swap Tokens
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
                    <h4 className="text-sm font-medium text-foreground">Liquidity Analysis</h4>
                  </div>
                  {liquidityExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <button
                    onClick={() => openDetailModal('liquidity', 'Liquidity Added', { type: 'added', value: smartMoneyFlow.liquidityAdded })}
                    className="p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Added</span>
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-lg font-display text-success">{formatValue(smartMoneyFlow.liquidityAdded)}</p>
                  </button>
                  <button
                    onClick={() => openDetailModal('liquidity', 'Liquidity Removed', { type: 'removed', value: smartMoneyFlow.liquidityRemoved })}
                    className="p-3 rounded-lg bg-danger/10 hover:bg-danger/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Removed</span>
                      <ArrowUpRight className="h-4 w-4 text-danger" />
                    </div>
                    <p className="text-lg font-display text-danger">{formatValue(smartMoneyFlow.liquidityRemoved)}</p>
                  </button>
                </div>

                <CollapsibleContent>
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
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
                    <div className="flex gap-2">
                      <a
                        href={`https://defillama.com/chain/${chain.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors text-sm"
                      >
                        <Activity className="h-4 w-4" /> DeFi Llama
                      </a>
                      <a
                        href="/trade"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        <ArrowRightLeft className="h-4 w-4" /> Trade
                      </a>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Top Smart Money Wallets */}
            <Collapsible open={detailsExpanded} onOpenChange={setDetailsExpanded}>
              <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Top Smart Money Wallets</span>
                </div>
                {detailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 p-4 rounded-xl border border-border/30 bg-background/50 space-y-4">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">Smart Wallets</p>
                      <p className="text-lg font-display text-primary">{enhancedMetrics.smartMoneyWallets}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">Profitable</p>
                      <p className="text-lg font-display text-success">{enhancedMetrics.profitableWallets}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">Avg Hold</p>
                      <p className="text-lg font-display text-foreground">{enhancedMetrics.avgHoldTime}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-display text-success">{enhancedMetrics.winRate}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {topWallets.map((wallet, i) => (
                      <button
                        key={i}
                        onClick={() => openDetailModal('wallet', 'Wallet Analysis', wallet)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/10 hover:bg-muted/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <span className="text-sm font-mono text-foreground">{wallet.address}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(wallet.address); }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-foreground">{formatValue(wallet.balance)}</span>
                          <span className={cn("text-sm font-medium", wallet.pnl >= 0 ? "text-success" : "text-danger")}>
                            {wallet.pnl >= 0 ? "+" : ""}{formatValue(wallet.pnl)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a href="https://nansen.ai" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Nansen
                    </a>
                    <a href="https://arkham.intelligence.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Arkham
                    </a>
                    <a href={`https://dune.com/browse/dashboards?q=${chain.name}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> Dune
                    </a>
                    <a href="https://debank.com/ranking" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-muted/20 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> DeBank
                    </a>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : null}
      </div>

    </>
  );
}
