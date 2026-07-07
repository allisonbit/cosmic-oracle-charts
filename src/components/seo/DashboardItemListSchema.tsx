import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/siteConfig";

interface CoinLike {
  symbol: string;
  name?: string;
  price?: number;
  rank?: number;
}

interface DashboardItemListSchemaProps {
  coins: CoinLike[];
  limit?: number;
}

export function DashboardItemListSchema({ coins, limit = 20 }: DashboardItemListSchemaProps) {
  if (!coins.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Top Cryptocurrencies by Market Cap",
    "url": `${SITE_URL}/dashboard`,
    "numberOfItems": Math.min(coins.length, limit),
    "itemListElement": coins.slice(0, limit).map((coin, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": coin.name ? `${coin.name} (${coin.symbol.toUpperCase()})` : coin.symbol.toUpperCase(),
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
