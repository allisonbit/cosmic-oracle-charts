export function formatPrice(p: number | undefined): string {
  if (!p) return '$0.00';
  if (p < 0.000001) return `$${(p ?? 0).toFixed(10)}`;
  if (p < 0.0001) return `$${(p ?? 0).toFixed(8)}`;
  if (p < 0.01) return `$${(p ?? 0).toFixed(6)}`;
  if (p < 1) return `$${(p ?? 0).toFixed(4)}`;
  return `$${(p ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatCompact(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${(n ?? 0).toFixed(2)}`;
}

export function formatNumber(n: number | undefined): string {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return (n ?? 0).toLocaleString();
}

export function formatChange(c: number | undefined): string {
  if (c === undefined || c === null) return '—';
  return `${c >= 0 ? '+' : ''}${(c ?? 0).toFixed(2)}%`;
}
