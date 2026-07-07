import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { Download, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareablePredictionCardProps {
  coinName: string;
  ticker: string;
  currentPrice: string;
  bias: "bullish" | "bearish" | "neutral";
  confidence: number;
  bullTarget: string;
  bearTarget: string;
  keyFactor?: string;
  pageUrl: string;
}

export function ShareablePredictionCard({
  coinName,
  ticker,
  currentPrice,
  bias,
  confidence,
  bullTarget,
  bearTarget,
  keyFactor,
  pageUrl,
}: ShareablePredictionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#06080F",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${ticker.toLowerCase()}-prediction-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Card downloaded!");
    } catch {
      toast.error("Failed to generate image");
    }
  }, [ticker]);

  const handleTweet = useCallback(() => {
    const text = `${coinName} (${ticker}) is ${bias} today — ${confidence}% confidence via @oracle_bulls`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [coinName, ticker, bias, confidence, pageUrl]);

  const biasColor =
    bias === "bullish" ? "#22c55e" : bias === "bearish" ? "#ef4444" : "#94a3b8";
  const biasGlow =
    bias === "bullish" ? "rgba(34,197,94,0.15)" : bias === "bearish" ? "rgba(239,68,68,0.15)" : "rgba(148,163,184,0.1)";

  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div className="space-y-3">
      {/* The card (rendered to image) */}
      <div
        ref={cardRef}
        style={{
          width: 480,
          padding: 32,
          background: "linear-gradient(145deg, #06080F 0%, #0c1220 100%)",
          borderRadius: 16,
          border: `1px solid ${biasColor}33`,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          color: "#E8EDF5",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.5px" }}>Oracle Bull</div>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{todayStr}</div>
        </div>

        {/* Coin + Price */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 4 }}>
            {coinName} ({ticker})
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {currentPrice}
          </div>
        </div>

        {/* Bias Badge */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              background: biasGlow,
              border: `1px solid ${biasColor}44`,
              color: biasColor,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {bias === "bullish" ? "▲" : bias === "bearish" ? "▼" : "◆"}{" "}
            {confidence}% {bias.charAt(0).toUpperCase() + bias.slice(1)}
          </div>
        </div>

        {/* Targets */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: 12, background: "rgba(34,197,94,0.08)", borderRadius: 8, border: "1px solid rgba(34,197,94,0.15)" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Bull Target</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace" }}>
              {bullTarget}
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, background: "rgba(239,68,68,0.08)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>Bear Target</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
              {bearTarget}
            </div>
          </div>
        </div>

        {/* Key Factor */}
        {keyFactor && (
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, fontStyle: "italic" }}>
            "{keyFactor}"
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(148,163,184,0.15)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>oraclebull.com</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>AI-Powered Prediction</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Download Card
        </Button>
        <Button variant="outline" size="sm" onClick={handleTweet} className="flex items-center gap-2">
          <Twitter className="w-4 h-4" /> Share on X
        </Button>
      </div>
    </div>
  );
}
