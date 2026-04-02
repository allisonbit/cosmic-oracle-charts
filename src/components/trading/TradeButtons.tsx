import { Button } from "@/components/ui/button";
import { ArrowDownUp, Globe, ShoppingCart, DollarSign } from "lucide-react";
import { useTrade } from "@/contexts/TradeContext";

interface TradeButtonsProps {
  symbol: string;
  name?: string;
  contractAddress?: string;
  chain?: string;
  chainId?: number;
  price?: number;
  logo?: string;
  size?: "sm" | "default" | "lg";
  variant?: "full" | "compact" | "inline";
}

export function TradeButtons({ symbol, name, contractAddress, chain, chainId, price, logo, size = "sm", variant = "full" }: TradeButtonsProps) {
  const { openTrade } = useTrade();

  const base = { symbol, name, contractAddress, chain, chainId, price, logo };

  if (variant === "inline") {
    return (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-success hover:text-success hover:bg-success/10" onClick={() => openTrade({ ...base, action: "buy" })}>
          Buy
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-danger hover:text-danger hover:bg-danger/10" onClick={() => openTrade({ ...base, action: "sell" })}>
          Sell
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10" onClick={() => openTrade({ ...base, action: "swap" })}>
          Swap
        </Button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-1.5">
        <Button size="sm" className="h-8 gap-1 bg-success/20 text-success hover:bg-success/30 border-0" onClick={() => openTrade({ ...base, action: "buy" })}>
          <ShoppingCart className="w-3 h-3" /> Buy
        </Button>
        <Button size="sm" className="h-8 gap-1 bg-primary/20 text-primary hover:bg-primary/30 border-0" onClick={() => openTrade({ ...base, action: "swap" })}>
          <ArrowDownUp className="w-3 h-3" /> Swap
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button size={size} className="gap-1.5 bg-success/20 text-success hover:bg-success/30 border-0" onClick={() => openTrade({ ...base, action: "buy" })}>
        <ShoppingCart className="w-4 h-4" /> Buy {symbol}
      </Button>
      <Button size={size} className="gap-1.5 bg-danger/20 text-danger hover:bg-danger/30 border-0" onClick={() => openTrade({ ...base, action: "sell" })}>
        <DollarSign className="w-4 h-4" /> Sell {symbol}
      </Button>
      <Button size={size} className="gap-1.5 bg-primary/20 text-primary hover:bg-primary/30 border-0" onClick={() => openTrade({ ...base, action: "swap" })}>
        <ArrowDownUp className="w-4 h-4" /> Swap
      </Button>
      <Button size={size} className="gap-1.5 bg-secondary/20 text-secondary hover:bg-secondary/30 border-0" onClick={() => openTrade({ ...base, action: "bridge" })}>
        <Globe className="w-4 h-4" /> Bridge
      </Button>
    </div>
  );
}
