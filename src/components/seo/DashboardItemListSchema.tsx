// JSON-LD ItemList schema removed — no crawler markup shipped.
// Kept as a no-op component so existing imports/call sites keep working.

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

export function DashboardItemListSchema(_props: DashboardItemListSchemaProps) {
  return null;
}
