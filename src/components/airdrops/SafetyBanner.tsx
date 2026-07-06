import { useState, useEffect } from "react";
import { Shield, X, ExternalLink, AlertTriangle, Lock, Eye, CheckCircle2 } from "lucide-react";

const TIPS = [
  { icon: <Lock className="w-4 h-4 text-success" />, text: "Legitimate airdrops NEVER ask for your seed phrase or private key." },
  { icon: <Eye className="w-4 h-4 text-warning" />, text: "Always verify contract addresses on the official project website before interacting." },
  { icon: <Shield className="w-4 h-4 text-primary" />, text: "Use a dedicated farming wallet — never your main wallet with large holdings." },
  { icon: <CheckCircle2 className="w-4 h-4 text-success" />, text: "All airdrops on Oracle Bull are manually reviewed. Still DYOR before interacting." },
];

export function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("airdrop_safety_dismissed")) setDismissed(true);
    } catch { /* noop */ }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem("airdrop_safety_dismissed", "1"); } catch { /* noop */ }
  };

  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-warning/15 shrink-0">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Stay Safe — Airdrop Scam Protection Active
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-warning hover:underline font-medium"
          >
            {expanded ? "Hide tips" : "View tips"}
          </button>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3 border-t border-warning/20 pt-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">{tip.icon}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
          <a
            href="https://metamask.io/news/latest/10-ways-to-avoid-crypto-scams/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline sm:col-span-2"
          >
            Full security guide <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
