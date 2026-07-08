import { EmbedLayout } from "./EmbedLayout";

const WIDGETS = [
  {
    title: "Live Price",
    path: "/embed/price/bitcoin",
    description: "Real-time price with 24h change",
    iframe: '<iframe src="https://oraclebull.com/embed/price/bitcoin" width="300" height="180" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>',
  },
  {
    title: "Fear & Greed Index",
    path: "/embed/fear-greed",
    description: "Crypto market sentiment gauge",
    iframe: '<iframe src="https://oraclebull.com/embed/fear-greed" width="300" height="280" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>',
  },
  {
    title: "AI Prediction",
    path: "/embed/prediction/bitcoin",
    description: "Today's AI signal with confidence & targets",
    iframe: '<iframe src="https://oraclebull.com/embed/prediction/bitcoin" width="300" height="300" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>',
  },
  {
    title: "Strength Meter",
    path: "/embed/strength/bitcoin",
    description: "Asset strength gauge with momentum",
    iframe: '<iframe src="https://oraclebull.com/embed/strength/bitcoin" width="300" height="320" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>',
  },
];

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function EmbedIndex() {
  return (
    <EmbedLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Oracle Bull Widgets</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Free embeddable crypto widgets for your site. Copy the iframe code below.
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {WIDGETS.map((w) => (
            <div key={w.path} style={{
              background: "rgba(148,163,184,0.06)",
              borderRadius: 12,
              padding: 16,
              border: "1px solid rgba(148,163,184,0.1)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{w.description}</div>
                </div>
                <a
                  href={w.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none" }}
                >
                  Preview →
                </a>
              </div>

              <div style={{
                position: "relative",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                color: "#94a3b8",
                lineHeight: 1.6,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}>
                {w.iframe}
                <button
                  onClick={() => copyToClipboard(w.iframe)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    background: "rgba(96,165,250,0.15)",
                    border: "none",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: 10,
                    color: "#60a5fa",
                    cursor: "pointer",
                  }}
                >
                  Copy
                </button>
              </div>

              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                Replace <code style={{ color: "#60a5fa" }}>bitcoin</code> with any coin ID (ethereum, solana, cardano, etc.)
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#64748b" }}>
          Supports 300+ coins. Widget data refreshes every 20 seconds.
        </div>
      </div>
    </EmbedLayout>
  );
}
