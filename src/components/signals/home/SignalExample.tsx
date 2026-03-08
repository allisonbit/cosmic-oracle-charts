import { Link } from "react-router-dom";

export function SignalExample() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">See What a Signal Looks Like</h2>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-card border border-primary/20 rounded-2xl p-6 sm:p-8 card-glow shadow-lg shadow-primary/5">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🐂</span>
              <span className="font-bold text-foreground text-lg">ORACLEBULL SIGNAL</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pair:</span>
                <span className="font-semibold text-foreground">BTC/USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Direction:</span>
                <span className="font-semibold text-success">🟢 LONG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-mono text-foreground">$67,420 — $67,800</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop-Loss:</span>
                <span className="font-mono text-destructive">$65,900 (-2.5%)</span>
              </div>

              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take-Profit 1:</span>
                  <span className="font-mono text-success">$69,500 (+3.1%) 🎯</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take-Profit 2:</span>
                  <span className="font-mono text-success">$71,200 (+5.6%) 🎯</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Take-Profit 3:</span>
                  <span className="font-mono text-success">$73,000 (+8.3%) 🎯</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk:</span>
                  <span className="text-secondary font-medium">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leverage:</span>
                  <span className="text-foreground">5-10x recommended</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <p className="text-muted-foreground mb-1">📝 Analysis:</p>
                <p className="text-foreground text-sm leading-relaxed">
                  Breaking above 4H resistance with increasing volume. RSI showing bullish divergence. Expecting continuation to $71K resistance zone.
                </p>
              </div>

              <p className="text-xs text-muted-foreground pt-2">⏰ Posted: June 12, 2025 09:14 UTC</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Every signal. Every time. This level of detail.</p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Signals Like This →
          </Link>
        </div>
      </div>
    </section>
  );
}
