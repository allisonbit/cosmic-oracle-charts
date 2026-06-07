import { CoinImage } from "@/components/ui/CoinImage";

// ── TokenIcon — thin wrapper that delegates to the canonical CoinImage ─────────
// Historically this used a 70-coin hardcoded map (src/lib/tokenImages.ts) that
// fell back to a *generic Bitcoin logo* for any unknown coin — wrong logos.
// It now delegates to CoinImage, which resolves real logos across thousands of
// coins (image prop → cryptocurrency-icons CDN → LiveCoinWatch → static map →
// letter avatar) and never shows the wrong coin. Signature kept identical so the
// existing callers don't change.

interface TokenIconProps {
  coinId: string;        // kept for API compatibility (no longer needed for lookup)
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional API-provided image URL — preferred when available. */
  image?: string;
}

const sizePx = { sm: 24, md: 28, lg: 40 } as const;

export function TokenIcon({ symbol, size = "md", className, image }: TokenIconProps) {
  return <CoinImage symbol={symbol} image={image} size={sizePx[size]} className={className} />;
}
