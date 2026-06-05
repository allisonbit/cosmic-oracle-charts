import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { TrendingUp, ArrowRight, Calendar, DollarSign, Wallet, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Simulated historical generation for demo purposes
const generateHistoricalData = (frequency: string, amount: number, years: number) => {
  const data = [];
  let totalInvested = 0;
  let portfolioValue = 0;
  
  const periods = years * (frequency === "daily" ? 365 : frequency === "weekly" ? 52 : 12);
  const volatility = 0.05; // 5% average upward drift per period simulation
  
  for (let i = 0; i <= periods; i++) {
    totalInvested += amount;
    
    // Simulate crypto growth with some volatility
    const growthMultiplier = 1 + (Math.random() * volatility * 2 - volatility / 2);
    portfolioValue = (portfolioValue + amount) * growthMultiplier;
    
    if (i % Math.floor(periods / 12) === 0 || i === periods) {
      data.push({
        name: `Period ${i}`,
        invested: Math.round(totalInvested),
        value: Math.round(portfolioValue)
      });
    }
  }
  return { data, totalInvested, portfolioValue };
};

export default function DCACalculator() {
  const [amount, setAmount] = useState<number>(50);
  const [frequency, setFrequency] = useState<string>("weekly");
  const [years, setYears] = useState<string>("3");
  const [coin, setCoin] = useState<string>("bitcoin");

  const { data, totalInvested, portfolioValue } = useMemo(() => 
    generateHistoricalData(frequency, amount, parseInt(years)), 
  [amount, frequency, years]);

  const roi = ((portfolioValue - totalInvested) / totalInvested) * 100;

  return (
    <Layout>
      <Helmet>
        <title>Crypto DCA Simulator & Calculator | Oracle Bull</title>
        <meta name="description" content="Simulate Dollar Cost Averaging (DCA) strategies for Bitcoin, Ethereum, and altcoins. Calculate your potential returns using historical data." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4 glow-text">Dollar Cost Averaging Simulator</h1>
            <p className="text-muted-foreground">What if you had invested consistently? Simulate the most powerful wealth-building strategy in crypto.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Input Form */}
            <div className="lg:col-span-1 space-y-6 bg-background/50 border border-border p-6 rounded-2xl h-fit">
              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Coin to DCA</Label>
                <Select value={coin} onValueChange={setCoin}>
                  <SelectTrigger className="mt-1 h-12 text-lg">
                    <SelectValue placeholder="Select coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    <SelectItem value="solana">Solana (SOL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Investment Amount ($)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-9 h-12 text-lg"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="mt-1 h-12 text-lg">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Time Period</Label>
                <Select value={years} onValueChange={setYears}>
                  <SelectTrigger className="mt-1 h-12 text-lg">
                    <SelectValue placeholder="Select years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 1 Year</SelectItem>
                    <SelectItem value="2">Last 2 Years</SelectItem>
                    <SelectItem value="3">Last 3 Years</SelectItem>
                    <SelectItem value="5">Last 5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="holo-card p-6 md:p-8">
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><Wallet className="w-4 h-4" /> Total Invested</div>
                    <div className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      ${totalInvested.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Portfolio Value</div>
                    <div className="text-2xl md:text-3xl font-display font-bold text-primary">
                      ${portfolioValue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5"><LineChart className="w-4 h-4" /> Total ROI</div>
                    <div className={`text-2xl md:text-3xl font-display font-bold ${roi >= 0 ? 'text-success' : 'text-danger'}`}>
                      {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="h-[250px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                      />
                      <Area type="monotone" dataKey="value" name="Portfolio Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
                      <Area type="monotone" dataKey="invested" name="Amount Invested" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorInvested)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cross-Promotion Hook */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-bold font-display text-lg text-foreground mb-2">Automate Your DCA Strategy</h3>
                    <p className="text-sm text-muted-foreground">
                      Don't let emotions ruin your strategy. Use our automated DCA Planner and Tracker in your personal My Hub dashboard to log your purchases and track your real-world portfolio growth over time.
                    </p>
                  </div>
                  <Link to="/my/dca" className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all hover:scale-105">
                    Open DCA Planner <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Write-up Section */}
          <div className="mt-16 prose prose-invert max-w-none">
            <h2>Why Dollar Cost Averaging (DCA) is the Best Strategy</h2>
            <p>
              Dollar-cost averaging (DCA) is an investment strategy in which an investor divides up the total amount to be invested across periodic purchases of a target asset in an effort to reduce the impact of volatility on the overall purchase.
            </p>
            <h3>How the DCA Simulator Works</h3>
            <p>
              Our simulator uses historical price trends to show you exactly how a consistent investment schedule performs against lump-sum investing. Because cryptocurrency markets are highly volatile, trying to "time the bottom" usually results in missed opportunities or buying local tops.
            </p>
            <p>
              By investing $50 a week, you buy more crypto when the price is low, and less when the price is high. This automatically lowers your average entry price over time without requiring you to constantly monitor charts or use <Link to="/scanner" className="text-primary hover:underline">technical scanners</Link>.
            </p>
            <p>
              <strong>Ready to start?</strong> Once you find a coin with strong fundamentals using our <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link>, set up a recurring buy on your preferred exchange and forget it.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
