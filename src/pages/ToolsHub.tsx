import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Calculator, TrendingUp, DollarSign, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ToolsHub() {
  return (
    <Layout>
      <Helmet>
        <title>Crypto Calculators & Tools | Oracle Bull</title>
        <meta name="description" content="Professional crypto calculators. Calculate your DCA returns, impermanent loss, and exact trading profits with our suite of AI-powered financial tools." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider mb-4">
              <Calculator className="w-4 h-4" />
              <span>PRO TOOLS</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 glow-text">
              Crypto Calculators Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop guessing. Calculate your exact returns, optimize your entry prices, and understand your DeFi risks before deploying capital.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Profit Calculator */}
            <Link to="/tools/profit-calculator" className="holo-card p-6 group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <h2 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                Profit & ROI Calculator
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Calculate exactly how much profit you'll make if a coin hits your target price. Factors in trading fees and specific entry points.
              </p>
              <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Most Popular</div>
            </Link>

            {/* DCA Calculator */}
            <Link to="/tools/dca-calculator" className="holo-card p-6 group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                DCA Return Simulator
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                What if you bought $50 of Bitcoin every week since 2020? Simulate historical Dollar Cost Averaging strategies to plan your future.
              </p>
              <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Historical Data</div>
            </Link>

            {/* IL Calculator */}
            <Link to="/tools/impermanent-loss-calculator" className="holo-card p-6 group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-warning" />
              </div>
              <h2 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                Impermanent Loss Calculator
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Providing liquidity on Uniswap? Calculate exactly how much impermanent loss you'll suffer if prices diverge.
              </p>
              <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">For DeFi Farmers</div>
            </Link>

          </div>
          
        </div>
      </div>
    </Layout>
  );
}
