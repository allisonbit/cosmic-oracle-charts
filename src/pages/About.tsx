import { Layout } from "@/components/layout/Layout";
import { 
  Brain, Shield, Zap, BarChart3, Users, Globe, Target, 
  TrendingUp, Activity, Lock, Award, CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/MainSEO";

const About = () => {
  return (
    <Layout>
      <SEO 
        title="About OracleBull | AI-Powered Market Intelligence Platform"
        description="Learn about OracleBull, the leading market intelligence and analytics platform providing AI-driven crypto and forex market analysis, sentiment tracking, and educational insights."
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            About <span className="text-gradient-cosmic">OracleBull</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            OracleBull is a Market Intelligence & Analytics Platform that combines advanced AI algorithms 
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
                and on-chain metrics to provide comprehensive market analysis and trend identification.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Sentiment Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Real-time monitoring of market sentiment across social media, news sources, and 
                community discussions to gauge market psychology and potential trend shifts.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Multi-Chain Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive blockchain analytics across Ethereum, Solana, Base, Arbitrum, and more. 
                Track DeFi metrics, transaction volumes, and ecosystem health indicators.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Market Intelligence</h3>
              <p className="text-muted-foreground text-sm">
                Curated market insights, trend analysis, and educational content to help you 
                understand market dynamics and make informed decisions.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Whale Activity Monitoring</h3>
              <p className="text-muted-foreground text-sm">
                Track large wallet movements and smart money flows. Understand how institutional 
                players are positioning themselves in various markets.
              </p>
            </article>

            <article className="holo-card p-6">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-3">Educational Resources</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive learning materials covering market analysis techniques, risk management 
                principles, and understanding market indicators.
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
                All our tools and analysis are completely free. No registration, no hidden fees, 
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
                our analysis is generated and what it represents.
              </p>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-16">
          <div className="holo-card p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">
              Who Uses OracleBull?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">Retail Investors</h4>
                  <p className="text-sm text-muted-foreground">
                    Individual investors seeking to understand market trends and make informed decisions.
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
                    Anyone wanting to learn about crypto, forex, and market analysis techniques.
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
      </div>
    </Layout>
  );
};

export default About;
