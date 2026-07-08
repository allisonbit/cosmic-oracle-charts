import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invokeFunction } from "@/integrations/supabase/functions";
import { EmbedLayout } from "./EmbedLayout";
import { getCryptoById } from "@/lib/extendedCryptos";

function formatPrice(price: number): string {
  if (price >= 1) return price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  if (price >= 0.01) return "$" + price.toFixed(4);
  return "$" + price.toFixed(8);
}

function PriceWidget() {
  const { coin } = useParams<{ coin: string }>();
  const crypto = coin ? getCryptoById(coin) : null;

  const { data, isLoading } = useQuery({
    queryKey: ["embed-price", coin],
    queryFn: async () => {
      const { data, error } = await invokeFunction("crypto-prices");
      if (error) throw error;
      const prices = data?.prices || [];
      return prices.find((p: any) =>
        p.symbol?.toLowerCase() === crypto?.symbol?.toLowerCase() ||
        p.name?.toLowerCase() === crypto?.name?.toLowerCase()
      );
    },
    enabled: !!crypto,
    refetchInterval: 20000,
    staleTime: 15000,
  });

  if (!crypto) {
    return <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>Coin not found</div>;
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ width: 24, height: 24, border: "3px solid rgba(96,165,250,0.3)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  const price = data?.price ?? 0;
  const change = data?.change24h ?? 0;
  const isUp = change >= 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {data?.image && <img src={data.image} alt="" width={32} height={32} style={{ borderRadius: "50%" }} />}
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{crypto.name}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>{crypto.symbol}</div>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
        {formatPrice(price)}
      </div>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        background: isUp ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
        color: isUp ? "#22c55e" : "#ef4444",
      }}>
        {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
        <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8", marginLeft: 4 }}>24h</span>
      </div>
    </div>
  );
}

export default function EmbedPrice() {
  return (
    <EmbedLayout>
      <PriceWidget />
    </EmbedLayout>
  );
}
