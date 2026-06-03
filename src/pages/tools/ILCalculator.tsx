import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Activity, ArrowRight, ShieldAlert, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ILCalculator() {
  const [priceChangeA, setPriceChangeA] = useState<number>(0);
  const [priceChangeB, setPriceChangeB] = useState<number>(100);

  // Impermanent Loss Math for 50/50 AMM pools (x * y = k)
  // IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
  // Where price_ratio is the relative price change between Asset A and Asset B
  
  const ratioA = 1 + (priceChangeA / 100);
  const ratioB = 1 + (priceChangeB / 100);
  const priceRatio = ratioA / ratioB;
  
  const ilDecimal = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  const ilPercentage = Math.abs(ilDecimal * 100);

  // If you held instead of LPing
  const valueIfHeld = (ratioA + ratioB) / 2 * 100; // Assuming starting value of $100 total ($50 each)
  const valueIfLP = valueIfHeld * (1 + ilDecimal);

  return (
    <Layout>
      <Helmet>
        <title>Impermanent Loss Calculator | Oracle Bull</title>
        <meta name="description" content="Calculate impermanent loss for Uniswap and other AMM liquidity pools. Understand the risks of DeFi yield farming before providing liquidity." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 glow-text">Impermanent Loss Calculator</h1>
            <p className="text-muted-foreground">Don't let DeFi yield farming drain your capital. Calculate your exact LP risks.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-6 bg-background/50 border border-border p-6 rounded-2xl h-fit">
              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4" /> Asset A Price Change (%)
                </Label>
                <div className="relative mt-2">
                  <Input 
                    type="number" 
                    value={priceChangeA} 
                    onChange={(e) => setPriceChangeA(Number(e.target.value))}
                    className="text-lg pr-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Example: 0% if it's a stablecoin like USDC</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4" /> Asset B Price Change (%)
                </Label>
                <div className="relative mt-2">
                  <Input 
                    type="number" 
                    value={priceChangeB} 
                    onChange={(e) => setPriceChangeB(Number(e.target.value))}
                    className="text-lg pr-8 h-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Example: 100% if ETH doubles in price</p>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="holo-card p-6 md:p-8">
                
                <div className="mb-8">
                  <div className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Impermanent Loss</div>
                  <div className={`text-5xl font-display font-bold ${ilPercentage > 5 ? 'text-danger' : ilPercentage > 1 ? 'text-warning' : 'text-success'}`}>
                    -{ilPercentage.toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is how much less money you have by providing liquidity compared to just holding the two assets in your wallet.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
                  <div className="bg-background/50 rounded-xl p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Value if just Held ($100 starting)</div>
                    <div className="font-bold text-xl">${valueIfHeld.toFixed(2)}</div>
                  </div>
                  <div className="bg-background/50 rounded-xl p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Value as Liquidity Provider</div>
                    <div className="font-bold text-xl">${valueIfLP.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Cross-Promotion Hook */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-lg text-foreground mb-2">Protect your yield.</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Impermanent loss happens when assets diverge in price. To minimize risk, you should only pair assets that have a high correlation. Use our Market Strength Meter and Correlation Matrix to find the safest LP pairs.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        View Correlation Matrix <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link to="/strength-meter" className="inline-flex items-center gap-2 text-sm bg-background/50 border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
                        Check Market Strength
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Write-up Section */}
          <div className="mt-16 prose prose-invert max-w-none">
            <h2>What is Impermanent Loss (IL)?</h2>
            <p>
              Impermanent loss occurs when you provide liquidity to an automated market maker (AMM) like Uniswap, SushiSwap, or PancakeSwap, and the price of your deposited assets changes compared to when you deposited them.
            </p>
            <p>
              The larger the price divergence between the two assets, the greater the impermanent loss. It is called "impermanent" because if the prices return to their original ratio, the loss disappears. However, if you withdraw your funds before the prices revert, the loss becomes permanent.
            </p>
            <h3>How to Avoid Impermanent Loss</h3>
            <ul>
              <li><strong>Provide Liquidity to Stablecoin Pairs:</strong> Pairs like USDC/USDT have virtually zero impermanent loss because their prices do not diverge.</li>
              <li><strong>Provide Liquidity to Highly Correlated Pairs:</strong> Pairs like ETH/wETH or WBTC/renBTC also suffer very little impermanent loss. You can find correlated assets using our <Link to="/dashboard" className="text-primary hover:underline">Dashboard Correlation Matrix</Link>.</li>
              <li><strong>High Trading Fees:</strong> Ensure that the pool you are providing liquidity for generates enough trading fees to offset the calculated impermanent loss.</li>
            </ul>
          </div>

        </div>
      </div>
    </Layout>
  );
}
