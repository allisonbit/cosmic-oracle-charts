import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, formatChange } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CoinImage } from "@/components/ui/CoinImage";

interface TokenHeaderProps {
  token: any;
  chainData: any;
  address: string;
  isPositive: boolean;
  derivedMetrics: any;
  navigate: (path: string) => void;
  copyAddress: () => void;
  copiedAddr: boolean;
}

export function TokenHeader({ token, chainData, address, isPositive, derivedMetrics, navigate, copyAddress, copiedAddr }: TokenHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/explorer')} className="shrink-0">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <CoinImage symbol={token.symbol} image={token.logo} size={56} className="ring-2 ring-primary/20" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{token.name}</h1>
            <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">{token.symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{chainData.name}</span>
            {token.verified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">✓ Verified</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              {address.slice(0, 10)}...{address.slice(-8)}
            </span>
            <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
              {copiedAddr ? <span className="text-success text-xs">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a href={`${chainData.explorer}/token/${address}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-2xl md:text-3xl font-bold font-mono text-foreground">{formatPrice(token.price)}</p>
        <div className={cn("text-sm font-semibold flex items-center justify-end gap-1",
          isPositive ? "text-success" : "text-danger"
        )}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {formatChange(token.change24h)} (24h)
        </div>
        {derivedMetrics && (
          <p className="text-xs text-muted-foreground mt-1">
            ATH: {formatPrice(derivedMetrics.ath)} ({formatChange(derivedMetrics.fromAth)})
          </p>
        )}
      </div>
    </div>
  );
}
