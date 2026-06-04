import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { FileCheck, BookOpen, Users, RefreshCw, Mail, ShieldCheck, Scale, Eye } from "lucide-react";

const EditorialPolicy = () => {
  return (
    <Layout>
      <SEO
        title="Editorial Policy | OracleBull Market Intelligence"
        description="OracleBull's editorial policy outlines how we create, review, and publish cryptocurrency market analysis, price predictions, and educational content. Our standards for accuracy, transparency, and independence."
      />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Editorial Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            OracleBull is committed to providing accurate, transparent, and independent market analysis. 
            This policy outlines the standards and processes that govern all content published on our platform.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">Last updated: June 2025</p>
        </header>

        <div className="space-y-8">

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">Our Mission & Independence</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              OracleBull is an independent market intelligence platform. Our core mission is to provide 
              cryptocurrency market data, analysis, and educational resources to help people better understand 
              digital asset markets.
            </p>
            <p className="text-muted-foreground">
              We operate independently. Advertising revenue, affiliate commissions, and partnerships never 
              influence our editorial content, data presentation, or market analysis. Our rankings, scores, 
              and predictions are generated algorithmically from public market data.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-display font-bold m-0">Content Standards</h2>
            </div>
            <p className="text-muted-foreground mb-4">All content published on OracleBull must meet the following standards:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-3 ml-4">
              <li><strong>Accuracy:</strong> Market data is sourced from reputable public APIs (CoinGecko, on-chain data providers). We display data as-is and note when data may be delayed or estimated.</li>
              <li><strong>Transparency:</strong> We clearly distinguish between factual market data and analytical interpretations or AI-generated predictions.</li>
              <li><strong>Disclaimers:</strong> All content that could be construed as market commentary includes a clear disclaimer that it is for informational and educational purposes only, and does not constitute financial advice.</li>
              <li><strong>No Guarantees:</strong> We never guarantee or imply guaranteed returns from any asset. AI predictions are probabilistic estimates, not investment recommendations.</li>
              <li><strong>No Paid Rankings:</strong> Coin listings, rankings, and market scores are determined by data and algorithms, not by payment from any project.</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-success" />
              <h2 className="text-xl font-display font-bold m-0">Advertiser Disclosure</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              OracleBull is supported by advertising and may receive compensation from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Display advertising networks (including Bitmedia.io, Google AdSense)</li>
              <li>Affiliate partnerships with cryptocurrency exchanges (e.g., Binance, Coinbase, Bybit)</li>
              <li>Sponsored content, clearly labeled as "Sponsored" or "Advertisement"</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Compensation from advertisers and affiliate partners does not influence our editorial content, 
              data rankings, or market analysis. We only recommend exchanges and services we consider 
              reputable based on publicly available information.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-display font-bold m-0">Content Updates & Corrections</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              We are committed to keeping our content accurate and current:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Market data is updated in real-time or near-real-time via API integrations.</li>
              <li>Educational articles are reviewed periodically and updated when market conditions or regulations change significantly.</li>
              <li>If we discover a factual error in any published content, we will correct it promptly and note the correction where appropriate.</li>
              <li>AI-generated predictions are refreshed daily based on the latest available market data.</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">Prohibited Content</h2>
            </div>
            <p className="text-muted-foreground mb-4">OracleBull will never publish:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Content that constitutes personalized financial or investment advice</li>
              <li>False or misleading market data or claims</li>
              <li>Pump-and-dump schemes or promotional content designed to manipulate asset prices</li>
              <li>Content promoting unlicensed financial services</li>
              <li>Content targeting minors or vulnerable individuals</li>
              <li>Hate speech, discriminatory content, or illegal material</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-display font-bold m-0">User-Generated Content</h2>
            </div>
            <p className="text-muted-foreground">
              OracleBull does not currently host user-generated content (comments, forums, or posts). 
              All content on the platform is produced by the OracleBull team or generated algorithmically 
              from verified public data sources. This policy may be updated if community features are 
              introduced in the future.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">Contact Our Editorial Team</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              If you have concerns about our content accuracy, wish to report an error, or have questions 
              about our editorial standards, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2">
              <li><strong>Email:</strong> <a href="mailto:contact@oraclebull.com" className="text-primary hover:underline">contact@oraclebull.com</a></li>
              <li><strong>Twitter:</strong> <a href="https://x.com/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@oracle_bulls</a></li>
              <li><strong>Telegram:</strong> <a href="https://t.me/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">t.me/oracle_bulls</a></li>
            </ul>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default EditorialPolicy;
