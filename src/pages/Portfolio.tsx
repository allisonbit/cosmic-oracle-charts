import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wallet, Plus, Trash2, TrendingUp, TrendingDown, 
  RefreshCw, PieChart, DollarSign, Percent, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { toast } from "sonner";

interface PortfolioHolding {
  id: string;
  symbol: string;
  amount: number;
  addedAt: number;
}

const STORAGE_KEY = "oracle-portfolio";

export default function Portfolio() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const { data: prices, isLoading, refetch } = useCryptoPrices();

  // Load holdings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHoldings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      }
    }
  }, []);

  // Save holdings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings]);

  // Calculate portfolio values
  const portfolioData = useMemo(() => {
    const pricesList = prices?.prices || [];
    if (!pricesList || pricesList.length === 0) return null;

    let totalValue = 0;
    let total24hChange = 0;
    let previousTotalValue = 0;

    const enrichedHoldings = holdings.map((holding) => {
      const priceData = pricesList.find(
        (p) => p.symbol.toLowerCase() === holding.symbol.toLowerCase()
      );
      
      if (priceData) {
        const value = holding.amount * priceData.price;
        const previousValue = value / (1 + priceData.change24h / 100);
        totalValue += value;
        previousTotalValue += previousValue;
        
        return {
          ...holding,
          price: priceData.price,
          value,
          change24h: priceData.change24h,
          name: priceData.name,
          found: true,
        };
      }
      
      return {
        ...holding,
        price: 0,
        value: 0,
        change24h: 0,
        name: holding.symbol,
        found: false,
      };
    });

    if (previousTotalValue > 0) {
      total24hChange = ((totalValue - previousTotalValue) / previousTotalValue) * 100;
    }

    // Calculate allocation percentages
    const holdingsWithAllocation = enrichedHoldings.map((h) => ({
      ...h,
      allocation: totalValue > 0 ? (h.value / totalValue) * 100 : 0,
    }));

    return {
      holdings: holdingsWithAllocation,
      totalValue,
      total24hChange,
      totalChange24hValue: totalValue - previousTotalValue,
    };
  }, [holdings, prices]);

  const addHolding = () => {
    if (!newSymbol.trim() || !newAmount.trim()) {
      toast.error("Please enter symbol and amount");
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if symbol already exists
    const existing = holdings.find(
      (h) => h.symbol.toLowerCase() === newSymbol.toLowerCase().trim()
    );

    if (existing) {
      // Update existing holding
      setHoldings((prev) =>
        prev.map((h) =>
          h.id === existing.id ? { ...h, amount: h.amount + amount } : h
        )
      );
      toast.success(`Added ${amount} to ${newSymbol.toUpperCase()}`);
    } else {
      // Add new holding
      setHoldings((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          symbol: newSymbol.toUpperCase().trim(),
          amount,
          addedAt: Date.now(),
        },
      ]);
      toast.success(`Added ${newSymbol.toUpperCase()} to portfolio`);
    }

    setNewSymbol("");
    setNewAmount("");
  };

  const removeHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
    toast.success("Removed from portfolio");
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-12 cosmic-bg">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
                <Wallet className="w-8 h-8 text-primary" />
                <span className="glow-text">PORTFOLIO</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your crypto holdings with real-time value updates
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Refresh Prices
            </Button>
          </div>

          {/* Portfolio Stats */}
          {portfolioData && holdings.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="holo-card p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  Total Value
                </div>
                <div className="text-2xl md:text-3xl font-display font-bold">
                  {formatCurrency(portfolioData.totalValue)}
                </div>
              </div>

              <div className="holo-card p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  {portfolioData.total24hChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger" />
                  )}
                  24h Change
                </div>
                <div
                  className={cn(
                    "text-2xl md:text-3xl font-display font-bold",
                    portfolioData.total24hChange >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {portfolioData.total24hChange >= 0 ? "+" : ""}
                  {portfolioData.total24hChange.toFixed(2)}%
                </div>
              </div>

              <div className="holo-card p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <DollarSign className="w-4 h-4" />
                  24h P&L
                </div>
                <div
                  className={cn(
                    "text-2xl md:text-3xl font-display font-bold",
                    portfolioData.totalChange24hValue >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {portfolioData.totalChange24hValue >= 0 ? "+" : ""}
                  {formatCurrency(Math.abs(portfolioData.totalChange24hValue))}
                </div>
              </div>

              <div className="holo-card p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <PieChart className="w-4 h-4" />
                  Assets
                </div>
                <div className="text-2xl md:text-3xl font-display font-bold">
                  {holdings.length}
                </div>
              </div>
            </div>
          )}

          {/* Add Holding Form */}
          <div className="holo-card p-6 mb-8">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add Token
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Symbol (e.g., BTC, ETH)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && addHolding()}
              />
              <Input
                placeholder="Amount"
                type="number"
                step="any"
                min="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && addHolding()}
              />
              <Button onClick={addHolding} className="gap-2">
                <Plus className="w-4 h-4" />
                Add to Portfolio
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Supported: BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX, DOT, MATIC, SHIB, LTC, TRX, LINK, UNI
            </p>
          </div>

          {/* Holdings Table */}
          {holdings.length === 0 ? (
            <div className="holo-card p-12 text-center">
              <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No Holdings Yet</h3>
              <p className="text-muted-foreground">
                Add your first token above to start tracking your portfolio
              </p>
            </div>
          ) : (
            <div className="holo-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-display text-sm text-muted-foreground">
                        TOKEN
                      </th>
                      <th className="text-right p-4 font-display text-sm text-muted-foreground">
                        AMOUNT
                      </th>
                      <th className="text-right p-4 font-display text-sm text-muted-foreground">
                        PRICE
                      </th>
                      <th className="text-right p-4 font-display text-sm text-muted-foreground">
                        VALUE
                      </th>
                      <th className="text-right p-4 font-display text-sm text-muted-foreground">
                        24H
                      </th>
                      <th className="text-right p-4 font-display text-sm text-muted-foreground hidden sm:table-cell">
                        <Percent className="w-4 h-4 inline" />
                      </th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData?.holdings.map((holding) => (
                      <tr
                        key={holding.id}
                        className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-primary">
                              {holding.symbol}
                            </span>
                            {!holding.found && (
                              <AlertCircle className="w-4 h-4 text-warning" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {holding.name}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                        </td>
                        <td className="p-4 text-right">
                          {holding.found ? `$${holding.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="p-4 text-right font-bold">
                          {holding.found ? formatCurrency(holding.value) : "-"}
                        </td>
                        <td
                          className={cn(
                            "p-4 text-right font-medium",
                            holding.change24h >= 0 ? "text-success" : "text-danger"
                          )}
                        >
                          {holding.found ? (
                            <div className="flex items-center justify-end gap-1">
                              {holding.change24h >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {holding.change24h >= 0 ? "+" : ""}
                              {holding.change24h.toFixed(2)}%
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                          {holding.allocation.toFixed(1)}%
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHolding(holding.id)}
                            className="text-muted-foreground hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Allocation Chart */}
          {portfolioData && portfolioData.holdings.length > 1 && (
            <div className="holo-card p-6 mt-8">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Allocation
              </h2>
              <div className="flex flex-wrap gap-4">
                {portfolioData.holdings
                  .filter((h) => h.found && h.allocation > 0)
                  .sort((a, b) => b.allocation - a.allocation)
                  .map((holding, i) => (
                    <div key={holding.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          background: `hsl(${(i * 60) % 360}, 70%, 50%)`,
                        }}
                      />
                      <span className="font-display text-sm">
                        {holding.symbol}: {holding.allocation.toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
              <div className="mt-4 h-4 rounded-full overflow-hidden bg-muted flex">
                {portfolioData.holdings
                  .filter((h) => h.found && h.allocation > 0)
                  .sort((a, b) => b.allocation - a.allocation)
                  .map((holding, i) => (
                    <div
                      key={holding.id}
                      className="h-full transition-all"
                      style={{
                        width: `${holding.allocation}%`,
                        background: `hsl(${(i * 60) % 360}, 70%, 50%)`,
                      }}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
