import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronUp, ChevronDown, ArrowUpDown, Activity, Flame, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDashboardNumber } from "./utils";

type SortKey = 'rank' | 'price' | 'change24h' | 'volume' | 'marketCap';
type SortDir = 'asc' | 'desc';

export function SortableCryptoTable({ coins }: { coins: any[] }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [visibleCount, setVisibleCount] = useState(20);

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  }, [sortKey]);

  const sorted = useMemo(() => {
    const filtered = coins.filter((c: any) => c.price > 0 && !['BUIDL', 'USYC', 'FIGR_HELOC'].includes(c.symbol));
    return [...filtered].sort((a: any, b: any) => {
      let av: number, bv: number;
      switch (sortKey) {
        case 'rank': av = a.rank; bv = b.rank; break;
        case 'price': av = a.price; bv = b.price; break;
        case 'change24h': av = a.change24h; bv = b.change24h; break;
        case 'volume': av = a.volume; bv = b.volume; break;
        case 'marketCap': av = a.marketCap; bv = b.marketCap; break;
        default: av = a.rank; bv = b.rank;
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [coins, sortKey, sortDir]);

  const visible = sorted.slice(0, visibleCount);

  const SortHeader = ({ label, k, className = '' }: { label: string; k: SortKey; className?: string }) => (
    <th
      className={cn("py-2 sm:py-3 px-1.5 sm:px-3 cursor-pointer select-none hover:text-primary transition-colors group", className)}
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        )}
      </span>
    </th>
  );

  if (coins.length === 0) return null;

  return (
    <div className="holo-card p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
      <h2 className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        ALL CRYPTOCURRENCIES
        <span className="ml-auto text-[10px] sm:text-xs text-muted-foreground font-normal">{sorted.length} coins • Click headers to sort</span>
      </h2>
      <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-muted-foreground text-[10px] sm:text-xs font-display border-b border-border uppercase">
              <SortHeader label="#" k="rank" className="text-left w-10" />
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 text-left">Coin</th>
              <SortHeader label="Price" k="price" className="text-right" />
              <SortHeader label="24h %" k="change24h" className="text-right" />
              <SortHeader label="Volume" k="volume" className="text-right hidden sm:table-cell" />
              <SortHeader label="Market Cap" k="marketCap" className="text-right hidden md:table-cell" />
            </tr>
          </thead>
          <tbody>
            {visible.map((coin: any) => (
              <tr
                key={coin.symbol}
                onClick={() => navigate(`/price-prediction/${coin.name?.toLowerCase() || coin.symbol?.toLowerCase()}/daily`)}
                className="border-b border-border/30 hover:bg-primary/5 cursor-pointer transition-colors"
              >
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-muted-foreground text-xs sm:text-sm">{coin.rank}</td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">{coin.symbol[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-display font-bold text-xs sm:text-sm text-primary">{coin.symbol}</span>
                      <span className="text-muted-foreground text-[10px] sm:text-xs ml-1.5 hidden sm:inline">{coin.name}</span>
                    </div>
                    {Math.abs(coin.change24h) > 5 && <Flame className="w-3 h-3 text-warning flex-shrink-0" />}
                  </div>
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right font-medium text-xs sm:text-sm">
                  ${coin.price >= 1
                    ? (coin.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : (coin.price ?? 0).toLocaleString(undefined, { maximumSignificantDigits: 4 })}
                </td>
                <td className={cn(
                  "py-2.5 sm:py-3 px-1.5 sm:px-3 text-right font-medium text-xs sm:text-sm",
                  coin.change24h >= 0 ? "text-success" : "text-danger"
                )}>
                  <span className="inline-flex items-center gap-0.5">
                    {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {coin.change24h >= 0 ? "+" : ""}{(coin.change24h ?? 0).toFixed(2)}%
                  </span>
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">
                  {formatDashboardNumber(coin.volume)}
                </td>
                <td className="py-2.5 sm:py-3 px-1.5 sm:px-3 text-right text-muted-foreground text-xs sm:text-sm hidden md:table-cell">
                  {formatDashboardNumber(coin.marketCap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleCount < sorted.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount(v => Math.min(v + 20, sorted.length))}
            className="px-6 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs sm:text-sm font-display hover:bg-primary/20 transition-colors"
          >
            Show More ({sorted.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
