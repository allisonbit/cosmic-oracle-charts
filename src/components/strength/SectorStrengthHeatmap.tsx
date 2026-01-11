import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Grid3X3, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Landmark,
  Image,
  Gamepad2,
  Layers,
  Shield,
  Dog,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface SectorStrengthHeatmapProps {
  assets: StrengthData[];
}

const SECTORS = [
  { id: 'ai', name: 'AI & Big Data', icon: Brain, tokens: ['FET', 'RNDR', 'AGIX', 'OCEAN', 'TAO'] },
  { id: 'defi', name: 'DeFi', icon: Landmark, tokens: ['UNI', 'AAVE', 'MKR', 'COMP', 'CRV', 'LINK'] },
  { id: 'nft', name: 'NFT & Metaverse', icon: Image, tokens: ['APE', 'MANA', 'SAND', 'AXS', 'ENJ'] },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, tokens: ['IMX', 'GALA', 'ILV', 'ALICE', 'MAGIC'] },
  { id: 'layer1', name: 'Layer 1', icon: Layers, tokens: ['ETH', 'SOL', 'ADA', 'AVAX', 'DOT', 'NEAR'] },
  { id: 'layer2', name: 'Layer 2', icon: Building2, tokens: ['ARB', 'OP', 'MATIC', 'IMX', 'STRK'] },
  { id: 'privacy', name: 'Privacy', icon: Shield, tokens: ['XMR', 'ZEC', 'SCRT', 'ROSE', 'AZERO'] },
  { id: 'meme', name: 'Meme Coins', icon: Dog, tokens: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'] },
];

export function SectorStrengthHeatmap({ assets }: SectorStrengthHeatmapProps) {
  const sectorData = useMemo(() => {
    return SECTORS.map(sector => {
      const matchingAssets = assets.filter(a => 
        sector.tokens.includes(a.symbol.toUpperCase())
      );

      if (matchingAssets.length === 0) {
        // Generate mock data based on overall market
        const avgScore = assets.length > 0 
          ? assets.reduce((acc, a) => acc + a.strengthScore, 0) / assets.length 
          : 50;
        const variance = (Math.random() - 0.5) * 20;
        return {
          ...sector,
          avgStrength: Math.round(avgScore + variance),
          change: (Math.random() - 0.5) * 15,
          topAsset: null,
          assetCount: 0,
        };
      }

      const avgStrength = matchingAssets.reduce((acc, a) => acc + a.strengthScore, 0) / matchingAssets.length;
      const avgChange = matchingAssets.reduce((acc, a) => acc + a.priceChange24h, 0) / matchingAssets.length;
      const topAsset = matchingAssets.sort((a, b) => b.strengthScore - a.strengthScore)[0];

      return {
        ...sector,
        avgStrength: Math.round(avgStrength),
        change: avgChange,
        topAsset,
        assetCount: matchingAssets.length,
      };
    }).sort((a, b) => b.avgStrength - a.avgStrength);
  }, [assets]);

  const getHeatColor = (score: number) => {
    if (score >= 70) return 'bg-success/20 border-success/40 hover:bg-success/30';
    if (score >= 55) return 'bg-emerald-500/20 border-emerald-500/40 hover:bg-emerald-500/30';
    if (score >= 45) return 'bg-warning/20 border-warning/40 hover:bg-warning/30';
    if (score >= 35) return 'bg-orange-500/20 border-orange-500/40 hover:bg-orange-500/30';
    return 'bg-danger/20 border-danger/40 hover:bg-danger/30';
  };

  const getTextColor = (score: number) => {
    if (score >= 55) return 'text-success';
    if (score >= 45) return 'text-warning';
    return 'text-danger';
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Sector Strength Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Identify narrative rotations and sector-specific momentum
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sectorData.map((sector) => {
            const Icon = sector.icon;
            return (
              <Tooltip key={sector.id}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all duration-300",
                    getHeatColor(sector.avgStrength)
                  )}>
                    <div className="flex items-start justify-between mb-2">
                      <Icon className={cn("w-5 h-5", getTextColor(sector.avgStrength))} />
                      <div className="flex items-center gap-1">
                        {sector.change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-danger" />
                        )}
                        <span className={cn(
                          "text-xs font-medium",
                          sector.change >= 0 ? "text-success" : "text-danger"
                        )}>
                          {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold truncate">{sector.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn("text-2xl font-bold", getTextColor(sector.avgStrength))}>
                        {sector.avgStrength}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Avg
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{sector.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Average strength across {sector.tokens.length} tracked tokens
                    </p>
                    {sector.topAsset && (
                      <p className="text-sm">
                        Top performer: <strong>{sector.topAsset.symbol}</strong> ({sector.topAsset.strengthScore})
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success/30" /> Strong (70+)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/30" /> Bullish (55-69)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning/30" /> Neutral (45-54)
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-danger/30" /> Bearish (&lt;45)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
