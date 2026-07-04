import { FileText } from "lucide-react";

// ── PredictionWriteUp — the longform analyst write-up for a prediction ─────────
// Renders the multi-paragraph thesis produced by the prediction engine (AI or
// deterministic fallback). Plain prose, good for readers AND for SEO depth.

export function PredictionWriteUp({ coinName, symbol, timeframe, writeUp }: {
  coinName: string;
  symbol: string;
  timeframe: string;
  writeUp?: string;
}) {
  if (!writeUp) return null;
  const paragraphs = writeUp.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return null;

  const tfLabel = timeframe === "daily" ? "Today" : timeframe === "weekly" ? "This Week" : "This Month";

  return (
    <section className="border-t border-border/30 pt-5" aria-labelledby="writeup-heading">
      <h2 id="writeup-heading" className="font-display text-base sm:text-lg font-bold flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        {coinName} ({symbol.toUpperCase()}) Analysis — {tfLabel}
      </h2>
      <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground space-y-3">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
