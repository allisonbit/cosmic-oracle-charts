import { SignalsLayout } from "@/components/signals/SignalsLayout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, X as XIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const overallStats = [
  { label: "Total Signals Sent", value: "1,247" },
  { label: "Overall Win Rate", value: "85.4%" },
  { label: "Avg Profit Per Signal", value: "+6.8%" },
  { label: "Total Return (2024-2025)", value: "+847%" },
];

const monthly = [
  { month: "Jun 2025", return: 47.3, winRate: 88, signals: 24, avg: 6.2 },
  { month: "May 2025", return: 38.9, winRate: 84, signals: 21, avg: 5.1 },
  { month: "Apr 2025", return: 52.1, winRate: 91, signals: 28, avg: 7.3 },
  { month: "Mar 2025", return: 29.4, winRate: 79, signals: 18, avg: 4.8 },
  { month: "Feb 2025", return: 41.7, winRate: 86, signals: 22, avg: 5.9 },
  { month: "Jan 2025", return: 35.2, winRate: 82, signals: 20, avg: 5.5 },
  { month: "Dec 2024", return: 44.8, winRate: 87, signals: 25, avg: 6.4 },
  { month: "Nov 2024", return: 31.6, winRate: 81, signals: 19, avg: 5.2 },
  { month: "Oct 2024", return: 39.3, winRate: 85, signals: 22, avg: 5.7 },
  { month: "Sep 2024", return: 28.7, winRate: 78, signals: 17, avg: 4.6 },
  { month: "Aug 2024", return: 46.2, winRate: 89, signals: 26, avg: 6.8 },
  { month: "Jul 2024", return: 33.1, winRate: 83, signals: 20, avg: 5.3 },
];

const trades = [
  { id: 1, date: "Jun 12", pair: "BTC/USDT", side: "Long", entry: "$67,420", exit: "$71,890", result: "+6.6%", status: "won" },
  { id: 2, date: "Jun 11", pair: "ETH/USDT", side: "Short", entry: "$3,812", exit: "$3,590", result: "+5.8%", status: "won" },
  { id: 3, date: "Jun 10", pair: "SOL/USDT", side: "Long", entry: "$148.20", exit: "$144.90", result: "-2.2%", status: "lost" },
  { id: 4, date: "Jun 9", pair: "DOGE/USDT", side: "Long", entry: "$0.162", exit: "$0.189", result: "+16.7%", status: "won" },
  { id: 5, date: "Jun 8", pair: "AVAX/USDT", side: "Short", entry: "$38.40", exit: "$35.20", result: "+8.3%", status: "won" },
  { id: 6, date: "Jun 7", pair: "LINK/USDT", side: "Long", entry: "$18.50", exit: "$20.30", result: "+9.7%", status: "won" },
  { id: 7, date: "Jun 6", pair: "ADA/USDT", side: "Long", entry: "$0.485", exit: "$0.460", result: "-5.2%", status: "lost" },
  { id: 8, date: "Jun 5", pair: "BNB/USDT", side: "Short", entry: "$612", exit: "$580", result: "+5.2%", status: "won" },
  { id: 9, date: "Jun 4", pair: "XRP/USDT", side: "Long", entry: "$0.52", exit: "$0.58", result: "+11.5%", status: "won" },
  { id: 10, date: "Jun 3", pair: "BTC/USDT", side: "Long", entry: "$65,200", exit: "$68,400", result: "+4.9%", status: "won" },
  { id: 11, date: "Jun 2", pair: "ETH/USDT", side: "Long", entry: "$3,650", exit: "$3,890", result: "+6.6%", status: "won" },
  { id: 12, date: "Jun 1", pair: "SOL/USDT", side: "Short", entry: "$155", exit: "$142", result: "+8.4%", status: "won" },
  { id: 13, date: "May 31", pair: "DOT/USDT", side: "Long", entry: "$7.80", exit: "$7.40", result: "-5.1%", status: "lost" },
  { id: 14, date: "May 30", pair: "ATOM/USDT", side: "Long", entry: "$9.20", exit: "$10.10", result: "+9.8%", status: "won" },
  { id: 15, date: "May 29", pair: "UNI/USDT", side: "Short", entry: "$11.40", exit: "$10.50", result: "+7.9%", status: "won" },
  { id: 16, date: "May 28", pair: "BTC/USDT", side: "Short", entry: "$69,800", exit: "$66,200", result: "+5.2%", status: "won" },
  { id: 17, date: "May 27", pair: "DOGE/USDT", side: "Long", entry: "$0.155", exit: "$0.178", result: "+14.8%", status: "won" },
  { id: 18, date: "May 26", pair: "AVAX/USDT", side: "Long", entry: "$36.50", exit: "$39.80", result: "+9.0%", status: "won" },
  { id: 19, date: "May 25", pair: "ETH/USDT", side: "Long", entry: "$3,550", exit: "$3,480", result: "-2.0%", status: "lost" },
  { id: 20, date: "May 24", pair: "SOL/USDT", side: "Long", entry: "$142", exit: "$158", result: "+11.3%", status: "won" },
];

const chartData = [...monthly].reverse();

export default function TrackRecord() {
  return (
    <SignalsLayout>
      <Helmet>
        <title>Track Record — OracleBull Verified Performance</title>
        <meta name="description" content="OracleBull's complete transparent track record. 85.4% win rate, 1,247+ signals. Every win and loss documented publicly." />
      </Helmet>

      <section className="py-20 text-center">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Our Track Record — Complete Transparency</h1>
          <p className="text-lg text-muted-foreground">Every signal we've ever sent. Every win. Every loss. Nothing hidden.</p>
        </div>
      </section>

      {/* Overall Stats */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {overallStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-gradient-primary font-mono">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Performance */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Monthly Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Month</th>
                  <th className="px-4 py-3 font-medium">Total Return</th>
                  <th className="px-4 py-3 font-medium">Win Rate</th>
                  <th className="px-4 py-3 font-medium">Signals</th>
                  <th className="px-4 py-3 font-medium">Avg Profit/Signal</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 text-foreground font-medium">{m.month}</td>
                    <td className="px-4 py-3 font-mono text-success font-semibold">+{m.return}%</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${m.winRate >= 85 ? "text-success" : "text-secondary"}`}>{m.winRate}%</td>
                    <td className="px-4 py-3 text-foreground">{m.signals}</td>
                    <td className="px-4 py-3 font-mono text-success">+{m.avg}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Monthly Returns</h2>
          <div className="h-[400px] bg-card border border-border rounded-xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 62%)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 62%)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: "hsl(230 18% 9%)", border: "1px solid hsl(215 25% 15%)", borderRadius: "8px", color: "hsl(214 32% 95%)" }}
                  formatter={(value: number) => [`+${value}%`, "Return"]}
                />
                <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="hsl(142 71% 45%)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Trades */}
      <section className="py-20 bg-card/30">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Recent Individual Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Pair</th>
                  <th className="px-3 py-3 font-medium">Side</th>
                  <th className="px-3 py-3 font-medium">Entry</th>
                  <th className="px-3 py-3 font-medium">Exit</th>
                  <th className="px-3 py-3 font-medium">Result</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="px-3 py-3 text-muted-foreground">{t.id}</td>
                    <td className="px-3 py-3 text-foreground">{t.date}</td>
                    <td className="px-3 py-3 font-semibold text-foreground">{t.pair}</td>
                    <td className="px-3 py-3 text-muted-foreground">{t.side}</td>
                    <td className="px-3 py-3 font-mono text-foreground">{t.entry}</td>
                    <td className="px-3 py-3 font-mono text-foreground">{t.exit}</td>
                    <td className={`px-3 py-3 font-mono font-semibold ${t.status === "won" ? "text-success" : "text-destructive"}`}>{t.result}</td>
                    <td className="px-3 py-3">{t.status === "won" ? <Check size={16} className="text-success" /> : <XIcon size={16} className="text-destructive" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-3">🔐 How We Verify Our Results</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All signals are posted in our Telegram group with timestamps BEFORE trades are executed. Entry prices are recorded at signal time. Our complete history is available for audit. We believe transparency is non-negotiable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Convinced? Start getting these signals yourself.</h2>
        <Link to="/pricing" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-lg">
          Start Free Trial →
        </Link>
      </section>
    </SignalsLayout>
  );
}
