import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Calculator, ArrowRight, TrendingUp, DollarSign, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfitCalculator() {
  const [investment, setInvestment] = useState<number>(1000);
  const [buyPrice, setBuyPrice] = useState<number>(50000);
  const [sellPrice, setSellPrice] = useState<number>(100000);
  const [feePercentage, setFeePercentage] = useState<number>(0.1);

  // Math logic — fees are charged on both the entry (buy) and the exit (sell).
  const buyFeeAmount = investment * (feePercentage / 100);
  const netInvestment = investment - buyFeeAmount;
  const actualCoinsBought = netInvestment / buyPrice;
  
  const grossReturn = actualCoinsBought * sellPrice;
  const sellFeeAmount = grossReturn * (feePercentage / 100);
  const netReturn = grossReturn - sellFeeAmount;
  
  const totalProfit = netReturn - investment;
  const roiPercentage = (totalProfit / investment) * 100;

  return (
    <Layout>
      <Helmet>
        <title>Crypto Profit & ROI Calculator | Oracle Bull</title>
        <meta name="description" content="Calculate your exact crypto trading profits and ROI. Account for exchange fees and cross-reference your targets with our AI price predictions." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 glow-text">Crypto Profit Calculator</h1>
            <p className="text-muted-foreground">Calculate exact returns, factor in exchange fees, and optimize your exit strategy.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-6 bg-background/50 border border-border p-6 rounded-2xl">
              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Investment Amount ($)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={investment} 
                    onChange={(e) => setInvestment(Number(e.target.value))}
                    className="pl-9 text-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Buy Price ($)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={buyPrice} 
                    onChange={(e) => setBuyPrice(Number(e.target.value))}
                    className="pl-9 text-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Target Sell Price ($)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={sellPrice} 
                    onChange={(e) => setSellPrice(Number(e.target.value))}
                    className="pl-9 text-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Exchange Fee (%)</Label>
                <div className="relative mt-1">
                  <Input 
                    type="number" 
                    step="0.01"
                    value={feePercentage} 
                    onChange={(e) => setFeePercentage(Number(e.target.value))}
                    className="text-lg pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="holo-card p-8">
                <h2 className="text-sm text-muted-foreground font-bold tracking-widest uppercase mb-6">Calculation Results</h2>
                
                <div className="grid sm:grid-cols-2 gap-8 mb-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Profit / Loss</div>
                    <div className={`text-4xl font-display font-bold ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Return on Investment (ROI)</div>
                    <div className={`text-4xl font-display font-bold ${roiPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                      {roiPercentage >= 0 ? '+' : ''}{roiPercentage.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                    <div className="font-bold text-lg">${netReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Fees Paid</div>
                    <div className="font-bold text-lg">${(buyFeeAmount + sellFeeAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>

              {/* Cross-Promotion Hook */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-lg text-foreground mb-2">Is your Target Sell Price realistic?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Don't guess your exit strategy. Our AI analyzes historical patterns, volume, and sentiment to predict exactly where prices will peak.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/predictions" className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Check AI Predictions <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link to="/sentiment" className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
                        View Market Sentiment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Write-up Section */}
          <div className="mt-16 prose prose-neutral dark:prose-invert max-w-none">
            <h2>How to Use the Crypto Profit Calculator</h2>
            <p>
              Calculating your exact crypto profit is essential for proper risk management. While it might seem as simple as subtracting your buy price from your sell price, hidden exchange fees can eat significantly into your actual ROI.
            </p>
            <h3>Understanding the Metrics</h3>
            <ul>
              <li><strong>Investment Amount:</strong> The total fiat value you are allocating to the trade.</li>
              <li><strong>Buy Price & Sell Price:</strong> The prices at which your orders are filled. Slippage is not accounted for here, so always use limit orders when trading large sizes.</li>
              <li><strong>Exchange Fee:</strong> Most major exchanges (like Binance, Coinbase Advanced, or Kraken) charge a maker/taker fee ranging from 0.1% to 0.6%. Our calculator automatically deducts this from both the entry and the exit.</li>
            </ul>
            <p>
              <strong>Pro Tip:</strong> Setting a realistic sell price is the hardest part of trading. We recommend using our <Link to="/strength-meter" className="text-primary hover:underline">Market Strength Meter</Link> and checking our <Link to="/predictions" className="text-primary hover:underline">AI Price Predictions</Link> to ensure your target is statistically probable before entering the trade.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
