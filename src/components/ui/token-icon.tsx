import { useState } from "react";
import { cn } from "@/lib/utils";
import { getTokenImageUrl } from "@/lib/tokenImages";

interface TokenIconProps {
  coinId: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-6 h-6 text-[9px]",
  md: "w-7 h-7 text-[10px]",
  lg: "w-10 h-10 text-sm",
};

export function TokenIcon({ coinId, symbol, size = "md", className }: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = getTokenImageUrl(coinId);
  const sizeClass = sizeMap[size];

  if (imgError) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center font-bold bg-muted text-muted-foreground shrink-0",
        sizeClass,
        className
      )}>
        {symbol.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${symbol} logo`}
      className={cn("rounded-full shrink-0 object-cover", sizeClass, className)}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}
