import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { AlertTriangle, TrendingDown, Shield, Brain, DollarSign, Scale } from "lucide-react";

const RiskDisclaimer = () => {
  return (
    <Layout>
      <SEO 
        title="Risk Disclaimer | OracleBull Market Intelligence"
        description="Important risk disclaimer for OracleBull users. Understand the risks associated with cryptocurrency and forex markets before using our analytics platform."
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Risk Disclaimer</h1>
          <p className="text-muted-foreground">Please read carefully before using OracleBull</p>
        </header>

        {/* Important Warning Banner */}
        <div className="bg-danger/10 border-2 border-danger/30 rounded-xl p-6 md:p-8 mb-12">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-danger flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-display font-bold text-danger mb-3">Important Warning</h2>
              <p className="text-foreground mb-4">
                OracleBull provides market analysis and educational insights only. 
                <strong className="text-danger"> This is not financial advice.</strong>
              </p>
              <p className="text-muted-foreground">
                Cryptocurrency and forex markets are highly volatile and speculative. You can lose 
                some or all of your invested capital. Only invest money you can afford to lose completely.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-6 h-6 text-danger" />
              <h2 className="text-xl font-display font-bold">Market Volatility Risk</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Cryptocurrency and forex markets are characterized by extreme volatility:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Prices can change dramatically within minutes or hours</li>
              <li>Historical patterns do not guarantee future performance</li>
              <li>Market manipulation and sudden crashes can occur</li>
              <li>Liquidity can evaporate during high-volatility periods</li>
              <li>Flash crashes can result in significant losses</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold">AI Analysis Limitations</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Our AI-powered analysis has inherent limitations:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>AI models are based on historical data and patterns</li>
              <li>Predictions are probabilistic, not guaranteed outcomes</li>
              <li>Black swan events cannot be predicted by any model</li>
              <li>Market conditions can change faster than models adapt</li>
              <li>AI analysis should be one input among many in your research</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-display font-bold">Financial Risk</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              You acknowledge and accept the following financial risks:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Total Loss:</strong> You can lose 100% of your invested capital</li>
              <li><strong>No Guarantees:</strong> No returns are promised or implied</li>
              <li><strong>Market Risk:</strong> All investments are subject to market forces</li>
              <li><strong>Leverage Risk:</strong> Leveraged positions amplify both gains and losses</li>
              <li><strong>Regulatory Risk:</strong> Regulatory changes can impact asset values</li>
              <li><strong>Counterparty Risk:</strong> Exchanges and platforms can fail</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-success" />
              <h2 className="text-xl font-display font-bold">Our Platform's Role</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              OracleBull is designed to be:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Educational:</strong> We provide learning resources about markets</li>
              <li><strong>Analytical:</strong> We offer data analysis and visualization tools</li>
              <li><strong>Informational:</strong> We aggregate and present market data</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">We are NOT:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>A financial advisor or investment manager</li>
              <li>A broker or trading platform</li>
              <li>A source of personalized investment recommendations</li>
              <li>Responsible for your investment decisions or outcomes</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-display font-bold">Your Responsibilities</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              By using OracleBull, you acknowledge that you are responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Conducting your own research (DYOR - Do Your Own Research)</li>
              <li>Consulting licensed financial advisors for investment decisions</li>
              <li>Understanding your local laws regarding cryptocurrency and forex</li>
              <li>Assessing your personal risk tolerance and financial situation</li>
              <li>Never investing more than you can afford to lose</li>
              <li>Understanding the tax implications in your jurisdiction</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Professional Advice Recommendation</h2>
            <p className="text-muted-foreground mb-4">
              Before making any investment decisions, we strongly recommend consulting with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>A licensed financial advisor</li>
              <li>A tax professional familiar with cryptocurrency</li>
              <li>A legal professional if dealing with complex assets</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Our platform should never be your only source of information when making financial decisions.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Acknowledgment</h2>
            <p className="text-muted-foreground">
              By using OracleBull, you acknowledge that you have read, understood, and agree to this 
              Risk Disclaimer. You understand that cryptocurrency and forex trading involves substantial 
              risk and that you are solely responsible for any decisions you make based on information 
              found on this platform.
            </p>
          </section>

          {/* Final Warning */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 text-center">
            <p className="text-lg font-display font-bold text-warning mb-2">
              Never Invest More Than You Can Afford to Lose
            </p>
            <p className="text-muted-foreground">
              If you are unsure about any investment, seek professional financial advice.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RiskDisclaimer;
