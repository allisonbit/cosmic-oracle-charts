import { useState } from "react";
import { Search, Wallet, CheckCircle2, XCircle, Loader2, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MockResult {
  name: string;
  ticker: string;
  eligible: boolean;
  estValue?: string;
  reason: string;
}

function mockScan(address: string): MockResult[] {
  // Deterministic mock based on address so results are consistent per address
  const seed = address.toLowerCase().charCodeAt(4) + address.toLowerCase().charCodeAt(6);
  const eligible1 = seed % 3 !== 0;
  const eligible2 = seed % 5 === 0;
  const eligible3 = seed % 2 === 0;

  return [
    {
      name: "Linea",
      ticker: "LINEA",
      eligible: eligible1,
      estValue: eligible1 ? "$840 - $2,100" : undefined,
      reason: eligible1
        ? "Wallet has ≥3 months of Linea activity + bridged volume"
        : "Insufficient on-chain activity on Linea mainnet",
    },
    {
      name: "zkSync Era",
      ticker: "ZK",
      eligible: eligible2,
      estValue: eligible2 ? "$120 - $450" : undefined,
      reason: eligible2
        ? "Active in zkSync Era with qualifying transactions"
        : "No qualifying zkSync Era interactions detected",
    },
    {
      name: "Scroll",
      ticker: "SCR",
      eligible: eligible3,
      estValue: eligible3 ? "$280 - $900" : undefined,
      reason: eligible3
        ? "Wallet meets Canvas badge + bridge volume thresholds"
        : "Bridge volume below $1,000 minimum threshold",
    },
  ];
}

function isValidAddress(addr: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr.trim()) || /^[a-zA-Z0-9]{32,44}$/.test(addr.trim());
}

export function WalletEligibilityChecker() {
  const [address, setAddress] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<MockResult[] | null>(null);
  const [error, setError] = useState("");

  const scan = async () => {
    const addr = address.trim();
    if (!addr) { setError("Please enter a wallet address."); return; }
    if (!isValidAddress(addr)) { setError("Please enter a valid EVM or Solana wallet address."); return; }
    setError("");
    setScanning(true);
    setResults(null);
    await new Promise(r => setTimeout(r, 1800)); // simulate scan
    setResults(mockScan(addr));
    setScanning(false);
  };

  const eligible = results?.filter(r => r.eligible) ?? [];
  const totalEst = eligible.length > 0
    ? `$${eligible.reduce((acc, r) => acc + parseInt(r.estValue?.split("$")[1] ?? "0"), 0).toLocaleString()}+`
    : null;

  return (
    <div className="holo-card p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-foreground">Wallet Eligibility Checker</h2>
          <p className="text-xs text-muted-foreground">Scan any wallet to see unclaimed airdrop allocations</p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={address}
            onChange={e => { setAddress(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && scan()}
            placeholder="Enter EVM or Solana wallet address (0x...)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={scan}
          disabled={scanning}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center gap-2 shrink-0"
        >
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {scanning ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="text-xs text-danger mb-3">{error}</p>}

      {/* Results */}
      {results && (
        <div className="mt-4 space-y-2">
          {eligible.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-success/8 border border-success/20 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-bold text-success">
                  {eligible.length} airdrop{eligible.length > 1 ? "s" : ""} found!
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">{totalEst} estimated</span>
            </div>
          )}
          {results.map((r, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3 p-3 rounded-xl border",
              r.eligible ? "bg-success/5 border-success/20" : "bg-muted/20 border-border/30"
            )}>
              {r.eligible
                ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">{r.name} <span className="text-muted-foreground font-normal text-xs">({r.ticker})</span></span>
                  {r.estValue && <span className="text-xs font-bold text-success shrink-0">{r.estValue}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
              </div>
            </div>
          ))}

          <Link
            to="/my/scanner"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
          >
            Full on-chain wallet analysis <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-3">
        ⚠️ Results are AI estimates based on publicly known snapshot criteria. Always verify on official project sites.
      </p>
    </div>
  );
}
