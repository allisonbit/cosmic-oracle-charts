import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { DollarSign, Shield, Target, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { TokenSearchInput, type SelectedToken } from "@/components/tools/TokenSearchInput";

export default function PositionSizeCalculator() {
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [direction, setDirection] = useState<"long" | "short">("long");

  const handleTokenSelect = (t: SelectedToken) => {
    setToken(t);
    setEntryPrice(t.price);
    if (direction === "long") {
      setStopLoss(+(t.price * 0.95).toPrecision(6));
    } else {
      setStopLoss(+(t.price * 1.05).toPrecision(6));
    }
  };

  const calc = useMemo(() => {
    if (!entryPrice || !stopLoss || !accountSize || !riskPercent) return null;

    const riskAmount = accountSize * (riskPercent / 100);
    const priceDiff = Math.abs(entryPrice - stopLoss);
    if (priceDiff === 0) return null;

    const riskPerUnit = priceDiff;
    const positionUnits = riskAmount / riskPerUnit;
    const positionValue = positionUnits * entryPrice;
    const leverage = positionValue / accountSize;

    const rr1 = direction === "long"
      ? entryPrice + priceDiff
      : entryPrice - priceDiff;
    const rr2 = direction === "long"
      ? entryPrice + priceDiff * 2
      : entryPrice - priceDiff * 2;
    const rr3 = direction === "long"
      ? entryPrice + priceDiff * 3
      : entryPrice - priceDiff * 3;

    const stopLossPct = (priceDiff / entryPrice) * 100;

    return {
      riskAmount,
      positionUnits,
      positionValue,
      leverage,
      stopLossPct,
      targets: [
        { rr: "1:1", price: rr1, profit: riskAmount },
        { rr: "2:1", price: rr2, profit: riskAmount * 2 },
        { rr: "3:1", price: rr3, profit: riskAmount * 3 },
      ],
    };
  }, [accountSize, riskPercent, entryPrice, stopLoss, direction]);

  const fmtPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toPrecision(4)}`;
  };
  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  return (
    <Layout>
      <Helmet>
        <title>Position Size Calculator – Risk Management | Oracle Bull</title>
        <meta name="description" content="Calculate exact position size based on your account, risk percentage, and stop loss. See reward targets at 1:1, 2:1, and 3:1 risk-reward ratios for any crypto token." />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Risk Management</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">· Position Sizing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tighter leading-none">
            Position Size Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Enter your account size, risk tolerance, and stop loss — get the exact position size and take-profit targets.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12">
          {/* Inputs */}
          <div className="space-y-5">
            <TokenSearchInput
              label="Token"
              selected={token}
              onSelect={handleTokenSelect}
              placeholder="Bitcoin, ETH, SOL..."
            />

            {/* Direction */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Direction
              </label>
              <div className="flex gap-0 border border-border">
                <button onClick={() => setDirection("long")}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                    direction === "long" ? "bg-success text-white" : "hover:bg-muted/50"
                  }`}>Long</button>
                <button onClick={() => setDirection("short")}
                  className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                    direction === "short" ? "bg-danger text-white" : "hover:bg-muted/50"
                  }`}>Short</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Account Size
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              <div className="flex gap-2 mt-1">
                {[1000, 5000, 10000, 25000, 50000].map(a => (
                  <button key={a} onClick={() => setAccountSize(a)}
                    className={`text-[10px] font-mono border px-1.5 py-0.5 transition-all ${
                      accountSize === a ? "border-primary text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"
                    }`}>${a >= 1000 ? `${a / 1000}k` : a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Risk per trade
              </label>
              <div className="relative">
                <input type="number" value={riskPercent} step="0.5"
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-4 pr-8 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <div className="flex gap-2 mt-1">
                {[
                  { label: "Conservative", r: 1 },
                  { label: "Standard", r: 2 },
                  { label: "Aggressive", r: 5 },
                ].map(p => (
                  <button key={p.label} onClick={() => setRiskPercent(p.r)}
                    className={`text-[10px] font-medium border px-1.5 py-0.5 transition-all ${
                      riskPercent === p.r ? "border-primary text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"
                    }`}>{p.label} ({p.r}%)</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Entry Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={entryPrice} step="any"
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              {token && (
                <button onClick={() => setEntryPrice(token.price)}
                  className="text-[10px] text-primary font-bold mt-1 hover:underline">
                  Use live price: {fmtPrice(token.price)}
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Stop Loss Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={stopLoss} step="any"
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              {entryPrice > 0 && (
                <div className="flex gap-2 mt-1">
                  {[2, 3, 5, 8, 10].map(pct => {
                    const sl = direction === "long"
                      ? +(entryPrice * (1 - pct / 100)).toPrecision(6)
                      : +(entryPrice * (1 + pct / 100)).toPrecision(6);
                    return (
                      <button key={pct} onClick={() => setStopLoss(sl)}
                        className="text-[10px] text-muted-foreground hover:text-primary font-mono border border-border/50 px-1.5 py-0.5 hover:border-primary/50 transition-all">
                        -{pct}%
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div>
            {calc ? (
              <div className="space-y-6">
                {/* Position size */}
                <div className="pb-6 border-b border-border">
                  <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Position Size</div>
                  <div className="text-3xl sm:text-4xl font-display font-bold text-primary">
                    ${fmt(calc.positionValue, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {calc.positionUnits < 1 ? calc.positionUnits.toPrecision(6) : fmt(calc.positionUnits, 4)} {token?.symbol ?? "units"} @ {fmtPrice(entryPrice)}
                  </div>
                </div>

                {/* Risk details */}
                <div className="grid sm:grid-cols-3 gap-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Risk Amount
                    </div>
                    <div className="text-xl font-display font-bold text-danger">${fmt(calc.riskAmount)}</div>
                    <div className="text-[10px] text-muted-foreground">{riskPercent}% of ${fmt(accountSize, 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Stop Loss
                    </div>
                    <div className="text-xl font-display font-bold">{fmtPrice(stopLoss)}</div>
                    <div className="text-[10px] text-danger font-bold">-{calc.stopLossPct.toFixed(1)}% from entry</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Effective Leverage</div>
                    <div className="text-xl font-display font-bold">{calc.leverage.toFixed(1)}x</div>
                    <div className="text-[10px] text-muted-foreground">position / account</div>
                  </div>
                </div>

                {/* Take profit targets */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Take Profit Targets
                  </h3>
                  <div className="space-y-0">
                    {calc.targets.map(t => (
                      <div key={t.rr} className="flex items-center justify-between py-3 border-b border-border/30">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-primary w-8">{t.rr}</span>
                          <span className="font-mono text-sm font-bold">{fmtPrice(t.price)}</span>
                        </div>
                        <span className="text-success font-bold text-sm">+${fmt(t.profit)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual risk bar */}
                <div className="pt-4">
                  <div className="text-xs text-muted-foreground mb-2">Account risk usage</div>
                  <div className="h-2 bg-muted overflow-hidden flex">
                    <div className="bg-danger transition-all duration-500" style={{ width: `${Math.min(riskPercent, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>0%</span>
                    <span className={riskPercent > 5 ? "text-danger font-bold" : ""}>{riskPercent}% risked</span>
                    <span>100%</span>
                  </div>
                  {riskPercent > 5 && (
                    <p className="text-[10px] text-danger mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Risking more than 5% per trade is aggressive. Most professionals risk 1-2%.
                    </p>
                  )}
                </div>

                {/* Cross-sell */}
                {token && (
                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold font-display text-sm mb-2">Validate your levels</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Check AI-generated support, resistance, and price targets for {token.name} before entering.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/price-prediction/${token.id}`}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all">
                        <TrendingUp className="w-3.5 h-3.5" /> {token.name} Prediction
                      </Link>
                      <Link to="/crypto-strength-meter"
                        className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-medium hover:border-primary/50 hover:text-primary transition-all">
                        Strength Meter
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Select a token and set your entry/stop loss to see position sizing.
              </div>
            )}

            {/* SEO */}
            <div className="mt-12 border-t border-border/30 pt-8 space-y-3">
              <h2 className="font-bold font-display text-base">How Position Sizing Works</h2>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  <strong>The 1-2% rule:</strong> Professional traders never risk more than 1-2% of their account on a single trade. This calculator enforces that discipline — enter your account size, pick your risk percentage, and it tells you exactly how many tokens to buy.
                </p>
                <p>
                  <strong>Risk-reward targets:</strong> For every dollar you risk (distance to stop loss), the calculator shows where price needs to go for 1:1, 2:1, and 3:1 reward. Most winning strategies target at least 2:1.
                </p>
                <p>
                  Use our <Link to="/predictions" className="text-primary hover:underline">AI price predictions</Link> and{" "}
                  <Link to="/crypto-strength-meter" className="text-primary hover:underline">strength meter</Link> to validate your entry and target levels before placing the trade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
