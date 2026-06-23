import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/MainSEO";
import { TrendingUp, Users, Globe, BarChart3, Mail, CheckCircle, Megaphone } from "lucide-react";

const Advertise = () => {
  return (
    <Layout>
      <SEO
        title="Advertise on Oracle Bull | Oracle Bull"
        description="Reach a highly engaged cryptocurrency audience. Advertise on Oracle Bull and connect with crypto traders, investors, and enthusiasts. View our ad formats and media kit."
      />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="text-center mb-14">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Advertise on <span className="text-gradient-cosmic">Oracle Bull</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Reach a highly engaged audience of cryptocurrency traders, DeFi enthusiasts, and digital asset investors who actively seek market intelligence.
          </p>
        </header>

        {/* Audience Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {[
            { label: "Monthly Pageviews", value: "Growing", icon: TrendingUp },
            { label: "Audience", value: "Crypto-Native", icon: Users },
            { label: "Coverage", value: "1,000+ Coins", icon: Globe },
            { label: "Data Points", value: "Real-Time", icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="holo-card p-5 text-center">
              <stat.icon className="w-7 h-7 text-primary mx-auto mb-2" />
              <p className="text-lg font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Who We Reach */}
        <section className="holo-card p-6 md:p-8 mb-8">
          <h2 className="text-xl font-display font-bold mb-4">Who We Reach</h2>
          <p className="text-muted-foreground mb-4">
            Oracle Bull attracts a premium crypto-native audience actively looking for market data and investment insights:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "Cryptocurrency traders (spot and derivatives)",
              "DeFi investors and yield farmers",
              "NFT collectors and Web3 enthusiasts",
              "Long-term crypto holders (HODLers)",
              "New investors researching crypto markets",
              "Blockchain developers and founders",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground text-sm">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ad Formats */}
        <section className="mb-8">
          <h2 className="text-xl font-display font-bold mb-6">Ad Formats Available</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "Display Banners",
                desc: "Standard IAB banner formats (728x90, 300x250, 160x600) served via Google AdSense and Bitmedia across all pages.",
                badge: "Network",
              },
              {
                title: "Sponsored Content",
                desc: "Educational articles or market analysis pieces featuring your project or exchange, clearly labeled as sponsored.",
                badge: "Direct",
              },
              {
                title: "Newsletter/Alerts",
                desc: "Featured placement in our market update communications. Reach our Telegram community directly.",
                badge: "Direct",
              },
            ].map((format) => (
              <div key={format.title} className="holo-card p-6">
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary/20 text-primary font-medium mb-3">
                  {format.badge}
                </span>
                <h3 className="font-display font-bold mb-2">{format.title}</h3>
                <p className="text-sm text-muted-foreground">{format.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Policies */}
        <section className="holo-card p-6 md:p-8 mb-8">
          <h2 className="text-xl font-display font-bold mb-4">Advertising Policies</h2>
          <p className="text-muted-foreground mb-4">
            To protect our audience and maintain the integrity of Oracle Bull, we do not accept advertisements for:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 text-sm">
            <li>Unregistered or unlicensed financial services</li>
            <li>Pump-and-dump or other market manipulation schemes</li>
            <li>Fraudulent ICOs or rug-pull-risk projects</li>
            <li>Adult content, gambling (outside regulated jurisdictions), or illegal activities</li>
            <li>Malware, spyware, or deceptive software</li>
          </ul>
          <p className="text-muted-foreground mt-4 text-sm">
            All direct advertising partners must comply with our <a href="/editorial-policy" className="text-primary hover:underline">Editorial Policy</a> and relevant advertising standards.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="holo-card p-8 md:p-12">
            <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-3">Get in Touch</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              For direct advertising inquiries, partnership proposals, or our full media kit, reach out to our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:contact@oraclebull.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                contact@oraclebull.com
              </a>
              <a
                href="https://t.me/oracle_bulls"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Telegram: @oracle_bulls
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Advertise;
