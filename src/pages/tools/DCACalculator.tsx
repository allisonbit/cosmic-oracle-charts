import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { DollarSign, ArrowRight, TrendingUp, Calendar, Wallet, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TokenSearchInput, type SelectedToken } from "@/components/tools/TokenSearchInput";

export default function DCACalculator() {
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [amount, setAmount] = useState(50);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [months, setMonths] = useState(12);
  const [expectedReturn, setExpectedReturn] = useState(8);

  const calc = useMemo(() => {
    const periodsPerMonth = frequency === "daily" ? 30 : frequency === "weekly" ? 4.33 : 1;
    const totalPeriods = Math.round(months * periodsPerMonth);
    const periodReturn = (expectedReturn / 100) / 12 / periodsPerMonth;

    let totalInvested = 0;
    let portfolio = 0;
    const data: { period: number; invested: number; value: number; label: string }[] = [];

    for (let i = 1; i <= totalPeriods; i++) {
      totalInvested += amount;
      portfolio = (portfolio + amount) * (1 + periodReturn);

      const monthNum = Math.ceil(i / periodsPerMonth);
      if (i === 1 || i === totalPeriods || i % Math.max(1, Math.floor(totalPeriods / 12)) === 0) {
        data.push({
          period: i,
          invested: Math.round(totalInvested),
          value: Math.round(portfolio),
          label: `M${monthNum}`,
        });
      }
    }

    const profit = portfolio - totalInvested;
    const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    const avgCostPerPeriod = amount;
    const totalPurchases = totalPeriods;

    return { data, totalInvested, portfolio, profit, roi, totalPurchases, avgCostPerPeriod };
  }, [amount, frequency, months, expectedReturn]);

  const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const freqOptions: { id: "daily" | "weekly" | "monthly"; label: string }[] = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
  ];

  const timeOptions = [
    { months: 3, label: "3 months" },
    { months: 6, label: "6 months" },
    { months: 12, label: "1 year" },
    { months: 24, label: "2 years" },
    { months: 36, label: "3 years" },
    { months: 60, label: "5 years" },
  ];

  return (
    <Layout>
      <Helmet>
        <title>DCA Calculator – Any Crypto Token | Oracle Bull</title>
        <meta name="description" content="Dollar-cost averaging calculator for any cryptocurrency. Search by name or symbol, set your schedule, and project returns over time." />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="border-b-2 border-foreground pb-4 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Calculator</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">· DCA Strategy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tighter leading-none">
            DCA Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Model a dollar-cost-averaging strategy for any token. Set your amount, frequency, and expected growth to project returns.
          </p>
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-8 lg:gap-12">
          {/* Inputs */}
          <div className="space-y-5">
            <TokenSearchInput
              label="Token"
              selected={token}
              onSelect={setToken}
              placeholder="Bitcoin, SOL, DOGE..."
            />

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Amount per purchase
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-9 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
              </div>
              <div className="flex gap-2 mt-1">
                {[25, 50, 100, 250, 500].map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={`text-[10px] font-mono border px-1.5 py-0.5 transition-all ${
                      amount === a ? "border-primary text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}>${a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Frequency
              </label>
              <div className="flex gap-0 border border-border">
                {freqOptions.map(f => (
                  <button key={f.id} onClick={() => setFrequency(f.id)}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all ${
                      frequency === f.id ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                    }`}>{f.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Time period
              </label>
              <div className="grid grid-cols-3 gap-1">
                {timeOptions.map(t => (
                  <button key={t.months} onClick={() => setMonths(t.months)}
                    className={`py-2 text-xs font-bold transition-all border ${
                      months === t.months ? "border-primary text-primary" : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}>{t.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Expected annual return
              </label>
              <div className="relative">
                <input type="number" value={expectedReturn} step="1"
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full bg-background border border-border pl-4 pr-8 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <div className="flex gap-2 mt-1">
                {[
                  { label: "Conservative", r: 5 },
                  { label: "Moderate", r: 15 },
                  { label: "Aggressive", r: 30 },
                  { label: "Moon", r: 100 },
                ].map(p => (
                  <button key={p.label} onClick={() => setExpectedReturn(p.r)}
                    className="text-[10px] text-muted-foreground hover:text-primary font-medium border border-border/50 px-1.5 py-0.5 hover:border-primary/50 transition-all">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pb-6 border-b border-border">
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Invested
                </div>
                <div className="text-xl sm:text-2xl font-display font-bold">${fmt(calc.totalInvested)}</div>
                <div className="text-[10px] text-muted-foreground">{calc.totalPurchases} purchases</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Portfolio
                </div>
                <div className="text-xl sm:text-2xl font-display font-bold text-primary">${fmt(calc.portfolio)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <LineChart className="w-3 h-3" /> Profit
                </div>
                <div className={`text-xl sm:text-2xl font-display font-bold ${calc.profit >= 0 ? "text-success" : "text-danger"}`}>
                  {calc.profit >= 0 ? "+" : ""}${fmt(calc.profit)}
                </div>
                <div className={`text-[10px] font-bold ${calc.roi >= 0 ? "text-success" : "text-danger"}`}>
                  {calc.roi >= 0 ? "+" : ""}{calc.roi.toFixed(1)}% ROI
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calc.data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dcaValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dcaInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))", fontSize: 12 }}
                    formatter={(value: number) => [`$${fmt(value)}`, ""]}
                  />
                  <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#dcaValue)" strokeWidth={2} />
                  <Area type="monotone" dataKey="invested" name="Total Invested" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#dcaInvested)" strokeWidth={1} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="space-y-0 border-t border-border pt-4">
              {[
                { label: `Buying $${amount} ${frequency}`, value: `${calc.totalPurchases} total purchases` },
                { label: "Over", value: `${months} months` },
                { label: "At expected annual return", value: `${expectedReturn}% per year` },
                { label: "Total invested", value: `$${fmt(calc.totalInvested)}` },
                { label: "Projected value", value: `$${fmt(calc.portfolio)}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2.5 border-b border-border/30 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono font-bold">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Cross-sell */}
            <div className="border-t border-border pt-6">
              <h3 className="font-bold font-display text-sm mb-2">Automate your DCA</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Track your actual DCA purchases over time with the DCA Planner in your dashboard.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/my/dca"
                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 transition-all">
                  Open DCA Planner <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                {token && (
                  <Link to={`/price-prediction/${token.id}`}
                    className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs font-medium hover:border-primary/50 hover:text-primary transition-all">
                    <TrendingUp className="w-3.5 h-3.5" /> {token.name} Prediction
                  </Link>
                )}
              </div>
            </div>

            {/* SEO */}
            <div className="border-t border-border/30 pt-6">
              <h2 className="font-bold font-display text-base mb-3">What is Dollar-Cost Averaging?</h2>
              <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Dollar-cost averaging (DCA) is an investment strategy where you invest a fixed amount at regular intervals regardless of price. This automatically lowers your average entry price over time — you buy more tokens when the price is low and fewer when it's high.
                </p>
                <p>
                  DCA removes the pressure of timing the market. Instead of trying to buy the bottom, you spread your risk across many entry points. This calculator lets you model any DCA strategy for any token and see projected returns at different growth rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
