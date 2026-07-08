import { useParams } from "react-router-dom";
import { usePricePrediction } from "@/hooks/usePricePrediction";
import { getCryptoById } from "@/lib/extendedCryptos";
import { EmbedLayout } from "./EmbedLayout";

function formatPrice(price: number): string {
  if (price >= 1) return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 0.01) return "$" + price.toFixed(4);
  return "$" + price.toFixed(8);
}

function PredictionWidget() {
  const { coin } = useParams<{ coin: string }>();
  const crypto = coin ? getCryptoById(coin) : null;

  const { data, isLoading } = usePricePrediction(
    crypto?.id ?? "",
    crypto?.symbol ?? "",
    "daily",
    !!crypto,
  );

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

  if (!data) {
    return <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>No prediction available</div>;
  }

  const biasColor = data.bias === "bullish" ? "#22c55e" : data.bias === "bearish" ? "#ef4444" : "#eab308";
  const biasIcon = data.bias === "bullish" ? "▲" : data.bias === "bearish" ? "▼" : "◆";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{crypto.name} Signal</div>
        <div style={{
          padding: "3px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          background: data.bias === "bullish" ? "rgba(34,197,94,0.15)" : data.bias === "bearish" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)",
          color: biasColor,
          textTransform: "uppercase",
        }}>
          {biasIcon} {data.bias}
        </div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 800 }}>{formatPrice(data.currentPrice)}</div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Confidence</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: biasColor }}>{data.confidence}%</div>
        </div>
        <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>Risk</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: data.riskLevel === "low" ? "#22c55e" : data.riskLevel === "high" ? "#ef4444" : "#eab308" }}>
            {data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1)}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: "#22c55e" }}>▲ Bull Target</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(data.bullScenario.target)}</div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.08)", borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: "#ef4444" }}>▼ Bear Target</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{formatPrice(data.bearScenario.target)}</div>
        </div>
      </div>
    </div>
  );
}

export default function EmbedPrediction() {
  return (
    <EmbedLayout>
      <PredictionWidget />
    </EmbedLayout>
  );
}
