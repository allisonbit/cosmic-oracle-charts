// JSON-LD schema emitters removed — the site no longer ships crawler markup.
// Kept as no-op components so existing imports/call sites keep working.

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema(_props: { items: BreadcrumbItem[] }) {
  return null;
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function HowToSchema(_props: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  return null;
}

export function CryptoProductSchema(_props: {
  name: string;
  symbol: string;
  description: string;
  price?: number;
  priceChange?: number;
}) {
  return null;
}
