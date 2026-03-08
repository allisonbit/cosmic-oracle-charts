const signals = [
  { pair: "BTC/USDT", side: "Long", result: "+14.2%", status: "won", time: "3 hours ago" },
  { pair: "ETH/USDT", side: "Short", result: "+8.7%", status: "won", time: "6 hours ago" },
  { pair: "SOL/USDT", side: "Long", result: "Active", status: "active", time: "2 hours ago", entry: "$148.20" },
  { pair: "DOGE/USDT", side: "Long", result: "+22.1%", status: "won", time: "Yesterday" },
  { pair: "AVAX/USDT", side: "Short", result: "-3.2%", status: "lost", time: "Yesterday" },
  { pair: "LINK/USDT", side: "Long", result: "+11.4%", status: "won", time: "2 days ago" },
];

export function LiveResultsTicker() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">📊 Recent Signals</h2>
          <p className="text-muted-foreground">Updated in real-time</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Pair</th>
                  <th className="text-left px-4 py-3 font-medium">Side</th>
                  <th className="text-left px-4 py-3 font-medium">Result</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 ${
                      s.status === "won" ? "bg-success/5" : s.status === "lost" ? "bg-destructive/5" : "bg-secondary/5"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {s.status === "won" ? "🟢" : s.status === "lost" ? "🔴" : "🟡"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{s.pair}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.side}</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${
                      s.status === "won" ? "text-success" : s.status === "lost" ? "text-destructive" : "text-secondary"
                    }`}>
                      {s.result}{s.entry ? ` | Entry: ${s.entry}` : ""} {s.status === "won" ? "✅" : s.status === "lost" ? "❌" : ""}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-success font-semibold mb-2">Overall Win Rate This Month: 87.3%</p>
          <a href="/track-record" className="text-primary hover:underline text-sm">View Complete Track Record →</a>
        </div>
      </div>
    </section>
  );
}
