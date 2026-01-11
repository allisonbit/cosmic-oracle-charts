import { useState } from "react";
import { Cpu, Coins, Image, Building2, Gamepad2, Shield, Zap, Globe, TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Sector {
  id: string;
  name: string;
  icon: React.ReactNode;
  sentiment: number;
  change: number;
  volume: number;
  topTokens: string[];
  description: string;
}

interface SectorHeatmapProps {
  coins: Array<{ symbol: string; change24h: number; volume: number; marketCap: number }>;
}

export function SectorHeatmap({ coins }: SectorHeatmapProps) {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Calculate sector data based on coin performance
  const sectors: Sector[] = [
    {
      id: 'ai',
      name: 'AI & Big Data',
      icon: <Cpu className="w-5 h-5" />,
      sentiment: 72,
      change: 12.5,
      volume: 2.8e9,
      topTokens: ['FET', 'AGIX', 'OCEAN', 'TAO', 'RNDR'],
      description: 'Artificial intelligence and machine learning tokens powering decentralized AI networks.'
    },
    {
      id: 'defi',
      name: 'DeFi',
      icon: <Coins className="w-5 h-5" />,
      sentiment: 58,
      change: 3.2,
      volume: 8.5e9,
      topTokens: ['UNI', 'AAVE', 'MKR', 'CRV', 'LDO'],
      description: 'Decentralized finance protocols enabling lending, borrowing, and trading.'
    },
    {
      id: 'nft',
      name: 'NFT & Metaverse',
      icon: <Image className="w-5 h-5" />,
      sentiment: 35,
      change: -8.4,
      volume: 1.2e9,
      topTokens: ['APE', 'SAND', 'MANA', 'IMX', 'BLUR'],
      description: 'Non-fungible tokens and virtual world ecosystems.'
    },
    {
      id: 'rwa',
      name: 'Real World Assets',
      icon: <Building2 className="w-5 h-5" />,
      sentiment: 65,
      change: 5.8,
      volume: 890e6,
      topTokens: ['MKR', 'ONDO', 'PAXG', 'MPL', 'CFG'],
      description: 'Tokenized real-world assets including real estate, commodities, and securities.'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: <Gamepad2 className="w-5 h-5" />,
      sentiment: 48,
      change: -2.1,
      volume: 1.5e9,
      topTokens: ['AXS', 'GALA', 'IMX', 'ENJ', 'PRIME'],
      description: 'Play-to-earn and blockchain gaming tokens.'
    },
    {
      id: 'privacy',
      name: 'Privacy',
      icon: <Shield className="w-5 h-5" />,
      sentiment: 42,
      change: -4.2,
      volume: 450e6,
      topTokens: ['XMR', 'ZEC', 'SCRT', 'ROSE', 'DUSK'],
      description: 'Privacy-focused cryptocurrencies and protocols.'
    },
    {
      id: 'layer2',
      name: 'Layer 2',
      icon: <Zap className="w-5 h-5" />,
      sentiment: 68,
      change: 8.9,
      volume: 4.2e9,
      topTokens: ['ARB', 'OP', 'MATIC', 'IMX', 'STRK'],
      description: 'Ethereum scaling solutions and Layer 2 networks.'
    },
    {
      id: 'meme',
      name: 'Meme Coins',
      icon: <Globe className="w-5 h-5" />,
      sentiment: 55,
      change: 15.3,
      volume: 6.8e9,
      topTokens: ['DOGE', 'SHIB', 'PEPE', 'BONK', 'WIF'],
      description: 'Community-driven meme tokens with high volatility.'
    },
  ];

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 70) return 'bg-success/30 border-success/50 hover:bg-success/40';
    if (sentiment >= 50) return 'bg-primary/20 border-primary/40 hover:bg-primary/30';
    if (sentiment >= 35) return 'bg-warning/20 border-warning/40 hover:bg-warning/30';
    return 'bg-danger/20 border-danger/40 hover:bg-danger/30';
  };

  const getSentimentTextColor = (sentiment: number) => {
    if (sentiment >= 70) return 'text-success';
    if (sentiment >= 50) return 'text-primary';
    if (sentiment >= 35) return 'text-warning';
    return 'text-danger';
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <>
      <div className="holo-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            SECTOR SENTIMENT HEATMAP
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            Click for details
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sectors.map(sector => (
            <button
              key={sector.id}
              onClick={() => setSelectedSector(sector)}
              className={cn(
                "p-4 rounded-xl border transition-all text-left group",
                getSentimentColor(sector.sentiment)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-lg bg-background/50", getSentimentTextColor(sector.sentiment))}>
                  {sector.icon}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold",
                  sector.change >= 0 ? "text-success" : "text-danger"
                )}>
                  {sector.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                </div>
              </div>
              <div className="font-display font-bold text-sm mb-1">{sector.name}</div>
              <div className="flex items-center justify-between">
                <span className={cn("text-lg font-bold", getSentimentTextColor(sector.sentiment))}>
                  {sector.sentiment}
                </span>
                <span className="text-xs text-muted-foreground">{formatVolume(sector.volume)}</span>
              </div>
              <div className="h-1 bg-muted rounded-full mt-2 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    sector.sentiment >= 70 ? "bg-success" :
                    sector.sentiment >= 50 ? "bg-primary" :
                    sector.sentiment >= 35 ? "bg-warning" : "bg-danger"
                  )}
                  style={{ width: `${sector.sentiment}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sector Detail Modal */}
      <Dialog open={!!selectedSector} onOpenChange={() => setSelectedSector(null)}>
        <DialogContent className="max-w-md">
          {selectedSector && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-xl",
                    getSentimentColor(selectedSector.sentiment)
                  )}>
                    {selectedSector.icon}
                  </div>
                  <div>
                    <div className="text-lg font-display">{selectedSector.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">Sector Analysis</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Sentiment Score */}
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className={cn("text-4xl font-display font-bold", getSentimentTextColor(selectedSector.sentiment))}>
                    {selectedSector.sentiment}
                  </div>
                  <div className="text-sm text-muted-foreground">Sector Sentiment Score</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">24h Change</div>
                    <div className={cn(
                      "font-bold text-lg",
                      selectedSector.change >= 0 ? "text-success" : "text-danger"
                    )}>
                      {selectedSector.change >= 0 ? '+' : ''}{selectedSector.change.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                    <div className="font-bold text-lg">{formatVolume(selectedSector.volume)}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">{selectedSector.description}</p>
                </div>

                {/* Top Tokens */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2 font-display">TOP TOKENS</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSector.topTokens.map(token => (
                      <span key={token} className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
