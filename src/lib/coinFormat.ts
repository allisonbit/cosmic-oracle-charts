// ── Shared number formatters for coin values ──────────────────────────────────
// Consolidates the compact-USD and price formatters that were duplicated inline
// across RecentTradesPanel, WhaleActivityPanel, LiveSignals, etc.

/** Compact USD: $1.2M / $850K / $420. Handles null/undefined/NaN safely. */
export function formatCompactUsd(num: number | null | undefined): string {
  const n = Number(num) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

/** Price with sensible precision by magnitude (high-value vs sub-cent tokens). */
export function formatPrice(price: number | null | undefined): string {
  const n = Number(price) || 0;
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n > 0) return `$${n.toPrecision(4)}`;
  return "$0";
}

/** Compact token amount: 1.2K ETH style (no currency symbol). */
export function formatCompactAmount(num: number | null | undefined): string {
  const n = Number(num) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (abs >= 1) return n.toFixed(2);
  return n.toPrecision(2);
}
