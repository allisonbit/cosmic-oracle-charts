import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Link } from "react-router-dom";
import { 
  Home, LayoutDashboard, TrendingUp, Factory, Wallet, 
  Activity, Search, BookOpen, Mail, Globe, ChevronRight,
  Zap, BarChart3, Shield, Bot
} from "lucide-react";

const sitemapSections = [
  {
    title: "Main Pages",
    icon: Home,
    links: [
      { path: "/", label: "Home", description: "AI-powered crypto forecasts and market overview" },
      { path: "/dashboard", label: "Dashboard", description: "Real-time market data, top performers, and AI insights" },
      { path: "/predictions", label: "Price Predictions", description: "AI-powered daily, weekly, monthly crypto forecasts" },
      { path: "/strength", label: "Strength Meter", description: "Crypto strength rankings and momentum analysis" },
      { path: "/factory", label: "Crypto Factory", description: "Market events calendar and on-chain intelligence" },
    ]
  },
  {
    title: "Analytics Tools",
    icon: BarChart3,
    links: [
      { path: "/price-prediction/bitcoin", label: "Bitcoin Prediction", description: "BTC price forecast with trading zones" },
      { path: "/price-prediction/ethereum", label: "Ethereum Prediction", description: "ETH price forecast with technical analysis" },
      { path: "/price-prediction/solana", label: "Solana Prediction", description: "SOL price forecast with AI insights" },
      { path: "/portfolio", label: "Wallet Scanner", description: "AI-powered wallet analysis for EVM and Solana" },
      { path: "/sentiment", label: "Sentiment Analysis", description: "Social sentiment, whale tracking, and market signals" },
      { path: "/explorer", label: "Token Explorer", description: "Search any cryptocurrency by name or contract" },
    ]
  },
  {
    title: "Blockchain Analytics",
    icon: Globe,
    links: [
      { path: "/chain/ethereum", label: "Ethereum Analytics", description: "ETH price, DeFi TVL, whale activity, and token discovery" },
      { path: "/chain/solana", label: "Solana Analytics", description: "SOL metrics, TPS, validator health, and ecosystem tokens" },
      { path: "/chain/base", label: "Base Analytics", description: "Base chain metrics, L2 analytics, and native tokens" },
      { path: "/chain/arbitrum", label: "Arbitrum Analytics", description: "ARB network stats, DeFi data, and token heat maps" },
      { path: "/chain/polygon", label: "Polygon Analytics", description: "MATIC chain health, gas fees, and ecosystem overview" },
      { path: "/chain/optimism", label: "Optimism Analytics", description: "OP network metrics, L2 performance, and token analysis" },
      { path: "/chain/avalanche", label: "Avalanche Analytics", description: "AVAX subnet data, validator stats, and DeFi metrics" },
      { path: "/chain/bnb", label: "BNB Chain Analytics", description: "BNB network data, BSC tokens, and whale tracking" },
    ]
  },
  {
    title: "Resources",
    icon: BookOpen,
    links: [
      { path: "/learn", label: "Learn Crypto", description: "Daily AI-generated crypto education and market insights" },
      { path: "/contact", label: "Contact & Token Info", description: "Community links and Oracle token information" },
    ]
  }
];

const features = [
  { icon: Zap, title: "Real-Time Data", description: "Live prices, volume, and market metrics updated every 10-30 seconds" },
  { icon: Bot, title: "AI Predictions", description: "Machine learning models for price forecasts and risk analysis" },
  { icon: Activity, title: "Whale Tracking", description: "Monitor large transactions and smart money movements" },
  { icon: Shield, title: "Risk Analysis", description: "AI-powered token risk scoring and security checks" },
];

export default function Sitemap() {
  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <header>
        <Navbar />
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="glow-text">Site Map</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Navigate to all Oracle Bull features, blockchain dashboards, analytics tools, and educational resources. 
              Every page is designed for fast, comprehensive crypto intelligence.
            </p>
          </div>

          {/* Quick Features */}
          <section className="mb-12" aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">Platform Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="holo-card p-4 text-center">
                  <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h3 className="font-display text-sm font-bold mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Sitemap Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {sitemapSections.map((section) => (
              <section key={section.title} className="holo-card p-6" aria-labelledby={`section-${section.title}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 id={`section-${section.title}`} className="font-display text-lg font-bold">{section.title}</h2>
                </div>
                
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <Link 
                        to={link.path}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                      >
                        <ChevronRight className="w-4 h-4 text-primary mt-0.5 group-hover:translate-x-1 transition-transform" />
                        <div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {link.label}
                          </span>
                          <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* External Resources */}
          <section className="mt-12 holo-card p-6" aria-labelledby="external-heading">
            <h2 id="external-heading" className="font-display text-lg font-bold mb-4">External Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a 
                href="https://x.com/oracle_bulls" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <span className="text-lg">𝕏</span>
                </div>
                <div>
                  <span className="font-medium">Twitter / X</span>
                  <p className="text-sm text-muted-foreground">@oracle_bulls - Latest updates and alerts</p>
                </div>
              </a>
              <a 
                href="https://t.me/oracle_bulls" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  <span className="text-lg">✈️</span>
                </div>
                <div>
                  <span className="font-medium">Telegram</span>
                  <p className="text-sm text-muted-foreground">Join the Oracle community</p>
                </div>
              </a>
            </div>
          </section>

          {/* SEO Text */}
          <section className="mt-12 text-center" aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-display text-xl font-bold mb-4">About Oracle Bull</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-sm leading-relaxed">
              Oracle Bull is a free, AI-powered cryptocurrency forecasting platform providing real-time analytics 
              for Bitcoin, Ethereum, Solana, and 1000+ tokens. Our tools include live price charts, market predictions, 
              whale tracking, sentiment analysis, wallet scanning, and comprehensive blockchain dashboards. 
              No signup required — access institutional-grade crypto intelligence instantly.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
