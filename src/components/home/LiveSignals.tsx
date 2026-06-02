import { TrendingUp, TrendingDown, Target, ShieldAlert, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const signals = [
  {
    coin: "SOL",
    name: "Solana",
    type: "LONG",
    entry: "142.50",
    tp: "158.00",
    sl: "135.20",
    confidence: 88,
    timeframe: "4H",
    status: "Active",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30"
  },
  {
    coin: "ETH",
    name: "Ethereum",
    type: "LONG",
    entry: "3,120.00",
    tp: "3,450.00",
    sl: "2,980.00",
    confidence: 82,
    timeframe: "1D",
    status: "Active",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30"
  },
  {
    coin: "ARB",
    name: "Arbitrum",
    type: "SHORT",
    entry: "1.15",
    tp: "0.95",
    sl: "1.25",
    confidence: 76,
    timeframe: "1H",
    status: "Pending",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/30"
  },
  {
    coin: "LINK",
    name: "Chainlink",
    type: "LONG",
    entry: "14.80",
    tp: "17.20",
    sl: "13.50",
    confidence: 91,
    timeframe: "4H",
    status: "Active",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30"
  }
];

export function LiveSignals() {
  return (
    <section className="py-12 relative overflow-hidden" aria-labelledby="live-signals-heading">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="text-primary font-bold text-sm tracking-widest uppercase">Live AI Signals</span>
            </div>
            <h2 id="live-signals-heading" className="text-2xl md:text-3xl font-display font-bold">
              High-Conviction <span className="text-gradient-cosmic">Trade Setups</span>
            </h2>
          </div>
          <Link to="/predictions" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
            View All Signals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signals.map((signal, idx) => (
            <div 
              key={signal.coin}
              className={cn(
                "relative p-5 rounded-2xl border bg-card/40 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group animate-fade-in",
                "hover:border-primary/50",
                "border-border/50"
              )}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Header: Coin + Type */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl">{signal.coin}</h3>
                  <p className="text-xs text-muted-foreground">{signal.name} • {signal.timeframe}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                  signal.bgColor, signal.color, signal.borderColor, "border"
                )}>
                  {signal.type === "LONG" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {signal.type}
                </div>
              </div>

              {/* Confidence Score */}
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-warning" /> AI Confidence</span>
                  <span className="font-bold text-foreground">{signal.confidence}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", signal.confidence > 85 ? "bg-success" : "bg-warning")}
                    style={{ width: `${signal.confidence}%` }}
                  />
                </div>
              </div>

              {/* Trade Levels (Entry, TP, SL) */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-background/50 border border-border/30">
                  <span className="text-muted-foreground text-xs font-medium">Entry</span>
                  <span className="font-mono font-semibold">${signal.entry}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 p-2 rounded-lg bg-success/5 border border-success/10">
                    <span className="text-[10px] text-success flex items-center gap-1 uppercase font-bold tracking-wider">
                      <Target className="w-3 h-3" /> TP
                    </span>
                    <span className="font-mono font-semibold text-sm">${signal.tp}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                    <span className="text-[10px] text-destructive flex items-center gap-1 uppercase font-bold tracking-wider">
                      <ShieldAlert className="w-3 h-3" /> SL
                    </span>
                    <span className="font-mono font-semibold text-sm">${signal.sl}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  signal.status === 'Active' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                )}>
                  {signal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
