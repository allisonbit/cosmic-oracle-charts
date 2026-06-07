import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

// ── DashboardItemListSchema ───────────────────────────────────────────────────
// Emits an ItemList JSON-LD for the live top-coins table so search engines can
// understand the ranked set of assets surfaced on the dashboard. Does NOT re-emit
// Organization/WebSite (those are static in index.html) — only the ItemList.

interface CoinLike {
  symbol: string;
  name?: string;
  price?: number;
  rank?: number;
}

interface DashboardItemListSchemaProps {
  coins: CoinLike[];
  /** Max items to include in the schema (keep it lean for crawlers). */
  limit?: number;
}

export function DashboardItemListSchema({ coins, limit = 20 }: DashboardItemListSchemaProps) {
  if (!coins || coins.length === 0) return null;

  const items = coins.slice(0, limit).map((c, i) => ({
    "@type": "ListItem",
    position: c.rank ?? i + 1,
    name: `${c.name || c.symbol} (${c.symbol?.toUpperCase()})`,
    url: `${SITE_URL}/price-prediction/${(c.name || c.symbol).toLowerCase()}/daily`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Cryptocurrencies by Market Cap",
    description:
      "Live ranked list of leading cryptocurrencies tracked on the Oracle Bull dashboard with real-time prices and AI analysis.",
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items,
  };

  return (
    <Helmet>
      {/* data-schema attribute makes this easy to find / dedupe in tests */}
      <script type="application/ld+json" data-schema="dashboard-itemlist">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
