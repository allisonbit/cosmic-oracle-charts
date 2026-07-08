import { useMarketData } from "@/hooks/useMarketData";
import { EmbedLayout } from "./EmbedLayout";

function getLabel(score: number): string {
  if (score <= 20) return "Extreme Fear";
  if (score <= 40) return "Fear";
  if (score <= 60) return "Neutral";
  if (score <= 80) return "Greed";
  return "Extreme Greed";
}

function getColor(score: number): string {
  if (score <= 20) return "#ef4444";
  if (score <= 40) return "#f97316";
  if (score <= 60) return "#eab308";
  if (score <= 80) return "#22c55e";
  return "#16a34a";
}

function FearGreedWidget() {
  const { data, isLoading } = useMarketData();
  const score = data?.fearGreedIndex ?? 50;
  const label = getLabel(score);
  const color = getColor(score);
  const rotation = -90 + (score / 100) * 180;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <div style={{ width: 24, height: 24, border: "3px solid rgba(96,165,250,0.3)", borderTopColor: "#60a5fa", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
        Fear & Greed Index
      </div>
      <svg viewBox="0 0 200 120" width="100%" style={{ maxWidth: 220 }}>
        <defs>
          <linearGradient id="fg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#fg-grad)" strokeWidth="14" strokeLinecap="round" />
        <line
          x1="100" y1="100"
          x2={100 + 60 * Math.cos((rotation * Math.PI) / 180)}
          y2={100 + 60 * Math.sin((rotation * Math.PI) / 180)}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill={color} />
      </svg>
      <div style={{ fontSize: 36, fontWeight: 800, color, marginTop: -8 }}>{score}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function EmbedFearGreed() {
  return (
    <EmbedLayout>
      <FearGreedWidget />
    </EmbedLayout>
  );
}
