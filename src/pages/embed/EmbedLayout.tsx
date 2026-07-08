import { ReactNode } from "react";

export function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
        minHeight: "100%",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#e2e8f0",
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
        padding: "16px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ flex: 1 }}>{children}</div>
        <a
          href="https://oraclebull.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "12px",
            padding: "6px 0",
            fontSize: "11px",
            color: "#94a3b8",
            textDecoration: "none",
            borderTop: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          <img src="https://oraclebull.com/oracle-bot-mascot.jpg" alt="" width={14} height={14} style={{ borderRadius: 3 }} />
          Powered by <span style={{ color: "#60a5fa", fontWeight: 600 }}>Oracle Bull</span>
        </a>
      </div>
  );
}
