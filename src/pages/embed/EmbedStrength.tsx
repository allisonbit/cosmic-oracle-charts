import { useParams } from "react-router-dom";
import { useStrengthMeter } from "@/hooks/useStrengthMeter";
import { getCryptoById } from "@/lib/extendedCryptos";
import { EmbedLayout } from "./EmbedLayout";

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#60a5fa";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Very Strong";
  if (score >= 55) return "Strong";
  if (score >= 40) return "Neutral";
  if (score >= 25) return "Weak";
  return "Very Weak";
}

function StrengthWidget() {
  const { coin } = useParams<{ coin: string }>();
  const crypto = coin ? getCryptoById(coin) : null;
  const { data, isLoading } = useStrengthMeter("24h");

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

  const asset = data?.assets.find(a =>
    a.symbol?.toLowerCase() === crypto.symbol?.toLowerCase() ||
    a.id === crypto.id
  );

  if (!asset) {
    return <div style={{ textAlign: "center", padding: 20, color: "#94a3b8" }}>No data for {crypto.name}</div>;
  }

  const score = asset.strengthScore;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const rotation = -90 + (score / 100) * 180;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{crypto.name} Strength</div>

      <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 200 }}>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251.2} 251.2`}
        />
        <line
          x1="100" y1="100"
          x2={100 + 55 * Math.cos((rotation * Math.PI) / 180)}
          y2={100 + 55 * Math.sin((rotation * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" fill={color} />
      </svg>

      <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: -6 }}>{score}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color }}>{label}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
        <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 6, padding: "6px 4px" }}>
          <div style={{ fontSize: 9, color: "#94a3b8" }}>Momentum</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: asset.momentum >= 0 ? "#22c55e" : "#ef4444" }}>
            {asset.momentum >= 0 ? "+" : ""}{asset.momentum.toFixed(1)}
          </div>
        </div>
        <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 6, padding: "6px 4px" }}>
          <div style={{ fontSize: 9, color: "#94a3b8" }}>vs BTC</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: asset.relativeStrengthVsBTC >= 0 ? "#22c55e" : "#ef4444" }}>
            {asset.relativeStrengthVsBTC >= 0 ? "+" : ""}{asset.relativeStrengthVsBTC.toFixed(1)}
          </div>
        </div>
        <div style={{ background: "rgba(148,163,184,0.08)", borderRadius: 6, padding: "6px 4px" }}>
          <div style={{ fontSize: 9, color: "#94a3b8" }}>vs ETH</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: asset.relativeStrengthVsETH >= 0 ? "#22c55e" : "#ef4444" }}>
            {asset.relativeStrengthVsETH >= 0 ? "+" : ""}{asset.relativeStrengthVsETH.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmbedStrength() {
  return (
    <EmbedLayout>
      <StrengthWidget />
    </EmbedLayout>
  );
}
