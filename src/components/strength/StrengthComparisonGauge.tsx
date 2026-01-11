import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gauge, Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrengthData } from "@/hooks/useStrengthMeter";

interface StrengthComparisonGaugeProps {
  assets: StrengthData[];
  chains: StrengthData[];
}

export function StrengthComparisonGauge({ assets, chains }: StrengthComparisonGaugeProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>(['bitcoin', 'ethereum']);
  const allData = [...assets, ...chains];
  
  const addAsset = (id: string) => {
    if (selectedAssets.length < 3 && !selectedAssets.includes(id)) {
      setSelectedAssets([...selectedAssets, id]);
    }
  };

  const removeAsset = (id: string) => {
    setSelectedAssets(selectedAssets.filter(a => a !== id));
  };

  const selectedData = selectedAssets.map(id => allData.find(d => d.id === id)).filter(Boolean) as StrengthData[];
  
  const getGaugeColor = (score: number) => {
    if (score >= 70) return '#22c55e';
    if (score >= 55) return '#84cc16';
    if (score >= 45) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };

  const getGaugeGradient = (score: number) => {
    const color = getGaugeColor(score);
    return `conic-gradient(${color} ${score * 3.6}deg, hsl(var(--muted)) ${score * 3.6}deg)`;
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gauge className="w-5 h-5 text-primary" />
          Live Multi-Asset Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Asset Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedData.map(asset => (
            <Badge key={asset.id} variant="secondary" className="gap-1 px-3 py-1.5">
              <img src={asset.logo} alt={asset.symbol} className="w-4 h-4 rounded-full" />
              {asset.symbol}
              <button onClick={() => removeAsset(asset.id)} className="ml-1 hover:text-danger">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedAssets.length < 3 && (
            <Select onValueChange={addAsset}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Add asset..." />
              </SelectTrigger>
              <SelectContent>
                {allData.filter(d => !selectedAssets.includes(d.id)).slice(0, 15).map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <img src={d.logo} alt={d.symbol} className="w-4 h-4 rounded-full" />
                      {d.symbol}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Animated Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedData.map((asset, idx) => (
            <div key={asset.id} className="flex flex-col items-center">
              {/* Circular Gauge */}
              <div className="relative w-32 h-32">
                <div 
                  className="w-full h-full rounded-full transition-all duration-700 ease-out"
                  style={{ background: getGaugeGradient(asset.strengthScore) }}
                />
                <div className="absolute inset-3 bg-background rounded-full flex flex-col items-center justify-center">
                  <span className={cn(
                    "text-2xl font-bold",
                    asset.strengthScore >= 55 ? "text-success" : asset.strengthScore >= 45 ? "text-warning" : "text-danger"
                  )}>
                    {asset.strengthScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              
              {/* Asset Info */}
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <img src={asset.logo} alt={asset.symbol} className="w-5 h-5 rounded-full" />
                  <span className="font-semibold">{asset.symbol}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {asset.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-danger" />
                  )}
                  <span className={cn(
                    "text-sm",
                    asset.priceChange24h >= 0 ? "text-success" : "text-danger"
                  )}>
                    {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Summary */}
        {selectedData.length >= 2 && (
          <div className="mt-6 p-3 rounded-lg bg-muted/30 text-sm">
            <p className="text-muted-foreground">
              <strong className="text-foreground">{selectedData[0]?.symbol}</strong> shows 
              {selectedData[0]?.strengthScore > selectedData[1]?.strengthScore ? ' stronger' : ' weaker'} momentum 
              than <strong className="text-foreground">{selectedData[1]?.symbol}</strong>
              {' '}({Math.abs(selectedData[0]?.strengthScore - selectedData[1]?.strengthScore)} point difference).
              {selectedData[2] && ` ${selectedData[2].symbol} ranks ${selectedData[2].strengthScore > selectedData[0]?.strengthScore ? 'highest' : 'lowest'} of the three.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
