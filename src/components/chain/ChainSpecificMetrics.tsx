import { ChainConfig } from "@/lib/chainConfig";
import { ExternalLink, Layers, Zap, Users, Coins, Boxes, Activity, Smartphone, Database, Shield } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface ChainSpecificMetricsProps {
  chain: ChainConfig;
  chainSpecificData?: any;
}

export function ChainSpecificMetrics({ chain, chainSpecificData }: ChainSpecificMetricsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!chainSpecificData) return null;

  // Render Optimism-specific content
  if (chain.id === "optimism") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(0_100%_60%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(0_100%_60%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Optimism Layer 2 Metrics</h3>
                <p className="text-xs text-muted-foreground">Superchain rollup analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Rollup Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Rollup Type</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.rollupType}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Parent Chain</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.parentChain}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {/* Bridges */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Official Bridges
              </h4>
              <div className="flex flex-wrap gap-2">
                {chainSpecificData.bridges?.map((bridge: any, i: number) => (
                  <a
                    key={i}
                    href={bridge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs"
                  >
                    {bridge.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>

            {/* DEXes */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes by Volume
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* DeFi Protocols */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                Top DeFi Protocols
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {chainSpecificData.defiProtocols?.map((protocol: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{protocol.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {protocol.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TVL: ${(protocol.tvl / 1e6).toFixed(0)}M
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Sui-specific content
  if (chain.id === "sui") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(200_100%_55%/0.1)]">
                <Boxes className="h-5 w-5 text-[hsl(200_100%_55%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Sui Network Metrics</h3>
                <p className="text-xs text-muted-foreground">Move-based Layer 1 analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Network Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {/* Unique Metrics */}
            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Database className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Total Objects</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.objectsTotal / 1e9).toFixed(1)}B
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Shield className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Move Packages</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.movePackages?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Zap className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">PTB/24h</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.ptbExecutions24h / 1e6).toFixed(1)}M
                  </p>
                </div>
              </div>
            )}

            {/* DEXes */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* DeFi Protocols */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                Top DeFi Protocols
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {chainSpecificData.defiProtocols?.map((protocol: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{protocol.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {protocol.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TVL: ${(protocol.tvl / 1e6).toFixed(0)}M
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render TON-specific content
  if (chain.id === "ton") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(200_80%_50%/0.1)]">
                <Smartphone className="h-5 w-5 text-[hsl(200_80%_50%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">TON Network Metrics</h3>
                <p className="text-xs text-muted-foreground">Telegram's blockchain analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Network Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Shardchains</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.shardchains || 256}</p>
              </div>
            </div>

            {/* Unique TON Metrics */}
            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Smartphone className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Mini Apps</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.telegramMiniApps?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Users className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Active Wallets (7d)</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.activeWallets7d / 1e6).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Coins className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">Jetton Types</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.jettonTypes?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Telegram Mini Apps */}
            {chainSpecificData.telegramApps && (
              <div>
                <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Top Telegram Mini Apps
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {chainSpecificData.telegramApps?.map((app: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{app.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                          {app.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(app.users / 1e6).toFixed(0)}M users
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DEXes */}
            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Avalanche-specific content
  if (chain.id === "avalanche") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(0_84%_60%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(0_84%_60%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Avalanche Network</h3>
                <p className="text-xs text-muted-foreground">C-Chain & Subnets analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Active Subnets</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.uniqueMetrics?.activeSubnets || 45}</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                  <Shield className="h-4 w-4 text-danger mb-1" />
                  <p className="text-xs text-muted-foreground">Validators</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.validatorCount?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Zap className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Staking APR</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.stakingApr}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Activity className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">C-Chain TPS</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.c_chainTps?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {chainSpecificData.subnets && (
              <div>
                <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-danger" />
                  Active Subnets
                </h4>
                <div className="space-y-2">
                  {chainSpecificData.subnets.map((subnet: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{subnet.name}</span>
                        <span className="text-xs text-muted-foreground">
                          TVL: ${(subnet.tvl / 1e6).toFixed(0)}M
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{subnet.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Polygon-specific content
  if (chain.id === "polygon") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(280_80%_55%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(280_80%_55%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Polygon Network</h3>
                <p className="text-xs text-muted-foreground">PoS Chain & zkEVM analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Avg Block Time</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.uniqueMetrics?.avgBlockTime}s</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(280_80%_55%/0.1)] border border-[hsl(280_80%_55%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(280_80%_55%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Validators</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.validatorCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Zap className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Staking APR</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.stakingApr}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Database className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Daily Checkpoints</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.checkpointsDaily}
                  </p>
                </div>
              </div>
            )}

            {chainSpecificData.zkSolutions && (
              <div>
                <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[hsl(280_80%_55%)]" />
                  ZK Solutions
                </h4>
                <div className="space-y-2">
                  {chainSpecificData.zkSolutions.map((zk: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{zk.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          zk.status === "Mainnet" || zk.status === "Live" 
                            ? "bg-success/20 text-success" 
                            : "bg-warning/20 text-warning"
                        }`}>
                          {zk.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {zk.tps ? `${zk.tps.toLocaleString()} TPS` : zk.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                Top DeFi Protocols
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {chainSpecificData.defiProtocols?.map((protocol: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{protocol.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {protocol.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TVL: ${(protocol.tvl / 1e6).toFixed(0)}M
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Arbitrum-specific content
  if (chain.id === "arbitrum") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(210_90%_55%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(210_90%_55%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Arbitrum Network</h3>
                <p className="text-xs text-muted-foreground">Optimistic L2 & Orbit analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Rollup Type</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.rollupType}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Parent Chain</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.parentChain}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(210_90%_55%/0.1)] border border-[hsl(210_90%_55%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(210_90%_55%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.sequencerUptime}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Zap className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Batches/24h</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.batchesPosted24h?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Coins className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">L1 Data Cost</p>
                  <p className="text-sm font-display text-foreground">
                    ${chainSpecificData.uniqueMetrics.l1DataCost}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Activity className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Avg Tx Cost</p>
                  <p className="text-sm font-display text-foreground">
                    ${chainSpecificData.uniqueMetrics.avgTxCost}
                  </p>
                </div>
              </div>
            )}

            {chainSpecificData.orbitChains && (
              <div>
                <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-[hsl(210_90%_55%)]" />
                  Orbit L3 Chains
                </h4>
                <div className="space-y-2">
                  {chainSpecificData.orbitChains.map((orbit: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{orbit.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          orbit.status === "Live" 
                            ? "bg-success/20 text-success" 
                            : "bg-warning/20 text-warning"
                        }`}>
                          {orbit.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{orbit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top Protocols by Volume
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Ethereum-specific content
  if (chain.id === "ethereum") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(220_80%_55%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(220_80%_55%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Ethereum Network</h3>
                <p className="text-xs text-muted-foreground">Layer 1 DeFi Hub analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(220_80%_55%/0.1)] border border-[hsl(220_80%_55%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(220_80%_55%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Validators</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.validatorCount / 1e6).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Zap className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Staking APR</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.stakingApr}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Activity className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">Gas Used/Day</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.gasUsedDaily / 1e9).toFixed(0)}B
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                  <Coins className="h-4 w-4 text-danger mb-1" />
                  <p className="text-xs text-muted-foreground">ETH Burned/24h</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.ethBurned24h?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                Top DeFi Protocols by TVL
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {chainSpecificData.defiProtocols?.slice(0, 6).map((protocol: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{protocol.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {protocol.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TVL: ${(protocol.tvl / 1e9).toFixed(1)}B
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Solana-specific content
  if (chain.id === "solana") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(280_100%_65%/0.1)]">
                <Zap className="h-5 w-5 text-[hsl(280_100%_65%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Solana Network</h3>
                <p className="text-xs text-muted-foreground">High-performance L1 analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-[10px] sm:text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(280_100%_65%/0.1)] border border-[hsl(280_100%_65%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(280_100%_65%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Validators</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.validatorCount?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Coins className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Staking APR</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.stakingApr}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Activity className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">TPS Average</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.tpsAverage?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Zap className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Slot Time</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.slotTime}ms
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes by Volume
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(0)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render BNB Chain-specific content
  if (chain.id === "bnb") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(45_100%_50%/0.1)]">
                <Coins className="h-5 w-5 text-[hsl(45_100%_50%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">BNB Chain Network</h3>
                <p className="text-xs text-muted-foreground">BSC analytics & ecosystem</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Consensus</p>
                <p className="text-[10px] sm:text-sm font-display text-foreground">{chainSpecificData.consensus}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Language</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.language}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Block Time</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.uniqueMetrics?.blockTime}s</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(45_100%_50%/0.1)] border border-[hsl(45_100%_50%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(45_100%_50%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Validators</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.validatorCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Coins className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Staking APR</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.stakingApr}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Activity className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Daily Txns</p>
                  <p className="text-sm font-display text-foreground">
                    {(chainSpecificData.uniqueMetrics.dailyTransactions / 1e6).toFixed(1)}M
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                Top DeFi Protocols
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {chainSpecificData.defiProtocols?.map((protocol: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-muted/10 border border-border/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{protocol.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground">
                        {protocol.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      TVL: ${(protocol.tvl / 1e6).toFixed(0)}M
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  // Render Base-specific content
  if (chain.id === "base") {
    return (
      <div className="holo-card p-4 sm:p-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(220_100%_55%/0.1)]">
                <Layers className="h-5 w-5 text-[hsl(220_100%_55%)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-display text-foreground">Base Network</h3>
                <p className="text-xs text-muted-foreground">Coinbase L2 analytics</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Rollup Type</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.rollupType}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Parent Chain</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.parentChain}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Governance</p>
                <p className="text-sm font-display text-foreground">{chainSpecificData.governance}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Features</p>
                <p className="text-xs font-display text-foreground">{chainSpecificData.features?.slice(0, 2).join(", ")}</p>
              </div>
            </div>

            {chainSpecificData.uniqueMetrics && (
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[hsl(220_100%_55%/0.1)] border border-[hsl(220_100%_55%/0.3)]">
                  <Shield className="h-4 w-4 text-[hsl(220_100%_55%)] mb-1" />
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.sequencerUptime}%
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <Zap className="h-4 w-4 text-success mb-1" />
                  <p className="text-xs text-muted-foreground">Batches/24h</p>
                  <p className="text-sm font-display text-foreground">
                    {chainSpecificData.uniqueMetrics.batchesPosted24h?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <Coins className="h-4 w-4 text-warning mb-1" />
                  <p className="text-xs text-muted-foreground">L1 Data Cost</p>
                  <p className="text-sm font-display text-foreground">
                    ${chainSpecificData.uniqueMetrics.l1DataCost}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <Activity className="h-4 w-4 text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Avg Tx Cost</p>
                  <p className="text-sm font-display text-foreground">
                    ${chainSpecificData.uniqueMetrics.avgTxCost}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Official Bridges
              </h4>
              <div className="flex flex-wrap gap-2">
                {chainSpecificData.bridges?.map((bridge: any, i: number) => (
                  <a
                    key={i}
                    href={bridge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs"
                  >
                    {bridge.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-display text-foreground mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Top DEXes by Volume
              </h4>
              <div className="space-y-2">
                {chainSpecificData.dexes?.map((dex: any, i: number) => (
                  <a
                    key={i}
                    href={dex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/20 hover:bg-muted/20 transition-all group"
                  >
                    <span className="text-sm text-foreground">{dex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ${(dex.volume24h / 1e6).toFixed(1)}M/24h
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return null;
}
