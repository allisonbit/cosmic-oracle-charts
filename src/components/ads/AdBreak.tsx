import { AdUnit } from "./AdUnit";
import { LazyAd } from "./LazyAd";

interface AdBreakProps {
  variant?: "full" | "compact";
  className?: string;
}

export function AdBreak({ variant = "compact", className = "" }: AdBreakProps) {
  if (variant === "full") {
    return (
      <LazyAd className={`py-1 space-y-1 ${className}`}>
        <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
      </LazyAd>
    );
  }

  return (
    <LazyAd className={`py-1 space-y-1 ${className}`}>
      <AdUnit format="horizontal" className="max-w-5xl mx-auto px-4" />
    </LazyAd>
  );
}
