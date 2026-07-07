import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { DollarSign, ArrowRight, TrendingUp, Brain, ArrowDown, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TokenSearchInput, type SelectedToken } from "@/components/tools/TokenSearchInput";

export default function ProfitCalculator() {
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [investment, setInvestment] = useState(1000);
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0.1);

  const handleTokenSelect = (t: SelectedToken) => {
    setToken(t);
    setBuyPrice(t.price);
    setSellPrice(+(t.price * 1.5).toPrecision(6));
  };

  const calc = useMemo(() => {
    if (!buyPrice || !sellPrice || !investment) return null;
    const buyFee = investment * (feePercentage / 100);
    const net = investment - buyFee;
    const coins = net / buyPrice;
    const gross = coins * sellPrice;
    const sellFee = gross * (feePercentage / 100);
    const netReturn = gross - sellFee;
    const profit = netReturn - investment;
    const roi = (profit / investment) * 100;
    const breakEven = buyPrice * (1 + feePercentage / 100) / (1 - feePercentage / 100);
    return { profit, roi, netReturn, totalFees: buyFee + sellFee, coins, breakEven };
  }, [investment, buyPrice, sellPrice, feePercentage]);

  const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtPrice = (p: number) => {
    if (p >= 1000) return `$${fmt(p)}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toPrecision(4)}`;
  };

  return (
    <Layout>
      <Helmet>
        <title>Crypto Profit Calculator – Any Token | Oracle Bull</title>
        <meta name="description" content="Calculate exact crypto trading profit and ROI for any token. Search by name, symbol, or contract address. Auto-fills live prices from CoinGecko." />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Calculator</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">· Live prices</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tighter leading-none">
            Crypto Profit Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Search any token, auto-fill the live price, set your target — see exact profit after exchange fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12">
          {/* Inputs */}
          <div className="space-y-5">
            <TokenSearchInput
              label="Token"
              selected={token}
              onSelect={handleTokenSelect}
              placeholder="Bitcoin, ETH, 0x..."
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Investment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Buy Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={buyPrice} step="any"
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              {token && (
                <button onClick={() => setBuyPrice(token.price)}
                  className="text-[10px] text-primary font-bold mt-1 hover:underline">
                  Use live price: {fmtPrice(token.price)}
                </button>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Target Sell Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={sellPrice} step="any"
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              {token && (
                <div className="flex gap-2 mt-1">
                  {[1.5, 2, 3, 5, 10].map(m => (
                    <button key={m} onClick={() => setSellPrice(+(token.price * m).toPrecision(6))}
                      className="text-[10px] text-muted-foreground hover:text-primary font-mono border border-border/50 px-1.5 py-0.5 hover:border-primary/50 transition-all">
                      {m}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Exchange Fee
              </label>
              <div className="relative">
                <input type="number" value={feePercentage} step="0.01"
                  onChange={(e) => setFeePercentage(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-4 pr-8 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <div className="flex gap-2 mt-1">
                {[
                  { label: "Binance", fee: 0.1 },
                  { label: "Coinbase", fee: 0.6 },
                  { label: "Kraken", fee: 0.26 },
                ].map(e => (
                  <button key={e.label} onClick={() => setFeePercentage(e.fee)}
                    className="text-[10px] text-muted-foreground hover:text-primary font-medium border border-border/50 px-1.5 py-0.5 hover:border-primary/50 transition-all">
                    {e.label} ({e.fee}%)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {calc ? (
              <div className="space-y-6">
                {/* Big numbers */}
                <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Profit / Loss</div>
                    <div className={`text-3xl sm:text-4xl font-display font-bold ${calc.profit >= 0 ? "text-success" : "text-danger"}`}>
                      {calc.profit >= 0 ? "+" : ""}${fmt(calc.profit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">ROI</div>
                    <div className={`text-3xl sm:text-4xl font-display font-bold flex items-center gap-2 ${calc.roi >= 0 ? "text-success" : "text-danger"}`}>
                      {calc.roi >= 0 ? <ArrowUp className="w-6 h-6" /> : <ArrowDown className="w-6 h-6" />}
                      {calc.roi >= 0 ? "+" : ""}{fmt(calc.roi)}%
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-0">
                  {[
                    { label: "You invest", value: `$${fmt(investment)}` },
                    { label: `Tokens purchased${token ? ` (${token.symbol})` : ""}`, value: calc.coins < 1 ? calc.coins.toPrecision(6) : fmt(calc.coins, 4) },
                    { label: "Revenue at sell price", value: `$${fmt(calc.netReturn)}` },
                    { label: "Total fees (buy + sell)", value: `$${fmt(calc.totalFees)}`, muted: true },
                    { label: "Break-even sell price", value: fmtPrice(calc.breakEven), muted: true },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-3 border-b border-border/30 text-sm">
                      <span className={row.muted ? "text-muted-foreground" : "text-foreground"}>{row.label}</span>
                      <span className={`font-mono font-bold ${row.muted ? "text-muted-foreground" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Cross-sell */}
                {token && (
                  <div className="border-t border-border pt-6">
                    <h3 className="font-bold font-display text-sm mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" /> Is {fmtPrice(sellPrice)} realistic for {token.name}?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      Check our AI price prediction for {token.name} to see data-backed targets before setting your exit.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/price-prediction/${token.id}`}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all">
                        <TrendingUp className="w-3.5 h-3.5" /> {token.name} Prediction
                      </Link>
                      <Link to="/sentiment"
                        className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-medium hover:border-primary/50 hover:text-primary transition-all">
                        Market Sentiment
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Search a token and enter your trade details to see results.
              </div>
            )}

            {/* SEO */}
            <div className="mt-12 border-t border-border/30 pt-8 space-y-3">
              <h2 className="font-bold font-display text-base">How to Use</h2>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  <strong>1. Search any token</strong> — type the name, ticker symbol, or contract address to find any of the 15,000+ tokens tracked by CoinGecko. The live price auto-fills.
                </p>
                <p>
                  <strong>2. Set your trade</strong> — enter your investment amount and target sell price. Use the multiplier buttons (2x, 5x, 10x) for quick targets. Exchange fees are deducted from both buy and sell sides.
                </p>
                <p>
                  <strong>3. Read the results</strong> — see exact profit, ROI, break-even price, and token count. Then check our{" "}
                  <Link to="/predictions" className="text-primary hover:underline">AI price predictions</Link> to validate your target is realistic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
