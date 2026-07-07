import { Layout } from "@/components/layout/Layout";
import { 
  Brain, Shield, Zap, BarChart3, Users, Globe, Target, 
  TrendingUp, Activity, Lock, Award, CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/MainSEO";
import { FAQSchema, HowToSchema } from "@/components/seo/FAQHowToSchema";

const ABOUT_FAQS = [
  {
    question: "Is Oracle Bull really free to use?",
    answer:
      "Yes. Every tool on Oracle Bull — AI price predictions, sentiment analysis, whale tracking, the strength meter, the token explorer and educational content — is 100% free and works without an account. The platform is ad-supported, so there are no premium tiers or paywalled features.",
  },
  {
    question: "How accurate are Oracle Bull's AI price predictions?",
    answer:
      "Forecast accuracy varies by token, timeframe and market conditions. We publish a public Accuracy Leaderboard at oraclebull.com/accuracy that resolves every expired prediction against live CoinGecko prices and shows per-coin hit rates, so users can judge performance themselves. Predictions are research signals, not financial advice.",
  },
  {
    question: "Does Oracle Bull provide financial or investment advice?",
    answer:
      "No. Oracle Bull is a market intelligence and analytics platform. All content, predictions and signals are for informational and educational purposes only and should not be treated as financial, investment, legal or tax advice. Always do your own research and consult a licensed professional before making investment decisions.",
  },
  {
    question: "Which cryptocurrencies and blockchains does Oracle Bull cover?",
    answer:
      "We cover 1,000+ tokens across Bitcoin, Ethereum, Solana, BNB Chain, Base, Arbitrum, Optimism, Polygon and Avalanche, with real-time price data, on-chain metrics, whale movements and AI forecasts on multiple horizons (daily, weekly, monthly and yearly).",
  },
  {
    question: "Do I need to connect a wallet or sign up?",
    answer:
      "No signup is required to use Oracle Bull's tools. Wallet connection is optional and only unlocks personal features such as watchlists, alerts, the portfolio tracker and the wallet scanner — none of which require email, password or KYC.",
  },
];

const ABOUT_HOWTO_STEPS = [
  { name: "Open the Market Dashboard", text: "Visit oraclebull.com/dashboard to see live prices, the global market cap, the Fear & Greed index and the top movers in one view.", url: "https://oraclebull.com/dashboard" },
  { name: "Check the AI prediction for a coin", text: "Search for a token or open oraclebull.com/predictions to read the AI bias, confidence, entry zone, stop loss and take-profit targets across daily, weekly and monthly horizons.", url: "https://oraclebull.com/predictions" },
  { name: "Confirm with sentiment and whale flows", text: "Cross-check the signal with oraclebull.com/sentiment for social sentiment and the whale tracker for 24-hour exchange netflows before making a decision.", url: "https://oraclebull.com/sentiment" },
  { name: "Review the Accuracy Leaderboard", text: "Open oraclebull.com/accuracy to see how Oracle Bull's recent predictions for that coin have actually resolved against live prices.", url: "https://oraclebull.com/accuracy" },
];

const About = () => {
  return (
    <Layout>
      <SEO
        title="About Oracle Bull | Oracle Bull"
        description="Learn about Oracle Bull, a free AI-powered crypto analytics platform providing AI-driven market analysis, sentiment tracking, whale monitoring and educational insights."
      />
      <FAQSchema items={ABOUT_FAQS} url="https://oraclebull.com/about" />
      <HowToSchema
        name="How to research a crypto with Oracle Bull"
        description="A four-step workflow that combines AI price predictions, market sentiment, whale flows and the public Accuracy Leaderboard before making any trading decision."
        steps={ABOUT_HOWTO_STEPS}
        url="https://oraclebull.com/about"
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            About <span className="text-gradient-cosmic">Oracle Bull</span> — AI Crypto Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oracle Bull is a Market Intelligence & Analytics Platform that combines advanced AI algorithms
            with real-time data to deliver comprehensive market analysis and educational insights.
          </p>
        </header>

        {/* Mission Statement */}
        <section className="mb-16">
          <div className="holo-card p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              We democratize access to institutional-grade market intelligence. Our platform provides 
              the same quality of analysis previously available only to professional traders and 
              financial institutions—completely free and without requiring any registration.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            What We Provide
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">AI-Driven Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Our proprietary AI models analyze historical patterns, market cycles, sentiment data,
                and on-chain metrics to provide comprehensive market analysis and trend identification. Explore our live{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI price predictions</Link> and track their{" "}
                <Link to="/accuracy" className="text-primary hover:underline">historical accuracy</Link>.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Sentiment Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Real-time monitoring of market sentiment across social media, news sources, and
                community discussions to gauge market psychology and potential trend shifts. See the latest readings on our{" "}
                <Link to="/sentiment" className="text-primary hover:underline">Fear &amp; Greed Index</Link> page.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Multi-Chain Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive blockchain analytics across Ethereum, Solana, Base, Arbitrum, and more.
                Track DeFi metrics, transaction volumes, and ecosystem health indicators. Dive deeper with our{" "}
                <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link> and{" "}
                <Link to="/crypto-strength-meter" className="text-primary hover:underline">Crypto Strength Meter</Link>.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Market Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                Curated market insights, trend analysis, and educational content to help you
                understand market dynamics and make informed decisions. Browse all analytics on the{" "}
                <Link to="/tools" className="text-primary hover:underline">Tools page</Link>.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Whale Activity Monitoring</h3>
              <p className="text-muted-foreground text-sm">
                Track large wallet movements and smart money flows. Understand how institutional
                players are positioning themselves in various markets. The whale tracker is available on our{" "}
                <Link to="/sentiment" className="text-primary hover:underline">Sentiment page</Link>.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Educational Resources</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive learning materials covering market analysis techniques, risk management
                principles, and understanding market indicators. Start with our{" "}
                <Link to="/learn" className="text-primary hover:underline">Learn hub</Link>.
              </p>
            </article>
          </div>
        </section>

        {/* Key Principles */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-10">
            Our Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Free Access</h3>
              <p className="text-muted-foreground">
                All our <Link to="/tools" className="text-primary hover:underline">tools</Link> and analysis are completely free. No registration, no hidden fees,
                no premium tiers. Quality market intelligence for everyone.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Education First</h3>
              <p className="text-muted-foreground">
                We focus on education and analysis, not financial advice. Our goal is to help you 
                understand markets better, not to tell you what to buy or sell.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">Data Transparency</h3>
              <p className="text-muted-foreground">
                We clearly explain our methodologies and data sources. Understand exactly how
                our analysis is generated and what it represents. See our{" "}
                <Link to="/accuracy" className="text-primary hover:underline">Accuracy Leaderboard</Link> for verifiable results.
              </p>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-16">
          <div className="holo-card p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">
              Who Uses Oracle Bull?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Retail Investors</h4>
                  <p className="text-sm text-muted-foreground">
                    Individual investors seeking to understand market trends and make informed decisions using our{" "}
                    <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link> and{" "}
                    <Link to="/sentiment" className="text-primary hover:underline">sentiment tools</Link>.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Researchers</h4>
                  <p className="text-sm text-muted-foreground">
                    Academic and market researchers analyzing crypto and forex market dynamics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Developers</h4>
                  <p className="text-sm text-muted-foreground">
                    Blockchain developers monitoring ecosystem health and activity metrics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Learners</h4>
                  <p className="text-sm text-muted-foreground">
                    Anyone wanting to <Link to="/learn" className="text-primary hover:underline">learn about crypto</Link>, forex, and market analysis techniques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">
            Start Exploring
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Dive into our market intelligence tools and educational resources. 
            No signup required—just start exploring.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="cosmic" size="lg">
              <Link to="/dashboard">Market Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/insights">Market Insights</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/learn">Learn</Link>
            </Button>
          </div>
        </section>

        {/* ─── HowTo: visible copy that matches the HowTo JSON-LD above ─── */}
        <section className="mt-20 max-w-3xl mx-auto" aria-labelledby="howto-heading">
          <h2 id="howto-heading" className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">
            How to research a crypto with Oracle Bull
          </h2>
          <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
            {ABOUT_HOWTO_STEPS.map((s) => (
              <li key={s.name}>
                <span className="font-semibold text-foreground">{s.name}.</span> {s.text}
              </li>
            ))}
          </ol>
        </section>

        {/* ─── FAQ: visible copy that matches the FAQPage JSON-LD above ─── */}
        <section className="mt-16 max-w-3xl mx-auto" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl md:text-3xl font-display font-bold mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {ABOUT_FAQS.map((f) => (
              <article key={f.question} className="holo-card p-6">
                <h3 className="font-semibold text-lg mb-2">{f.question}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
