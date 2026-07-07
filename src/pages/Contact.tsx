import { Layout } from "@/components/layout/Layout";
import { Mail, MessageCircle, Twitter, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/MainSEO";
import { ContactSEOContent } from "@/components/seo/index";

const ContactPage = () => {
  return (
    <Layout>
      <SEO
        title="Contact Oracle Bull | Oracle Bull"
        description="Get in touch with the Oracle Bull team. Reach out for support, feedback, partnership inquiries, or general questions about our AI-powered market analytics platform."
      />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Contact <span className="text-gradient-cosmic">Oracle Bull</span> Support
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you.
            Reach out through any of the channels below.
          </p>
        </header>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto mb-16">
          {/* Email */}
          <div className="holo-card p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg">Email Us</h2>
            <p className="text-sm text-muted-foreground">
              For general inquiries, support questions, or partnership proposals.
            </p>
            <a
              href="mailto:contact@oraclebull.com"
              className="inline-block text-primary hover:underline font-medium"
            >
              contact@oraclebull.com
            </a>
          </div>

          {/* Twitter / X */}
          <div className="holo-card p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Twitter className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg">X (Twitter)</h2>
            <p className="text-sm text-muted-foreground">
              Follow us for real-time updates, market highlights, and community discussions.
            </p>
            <a
              href="https://x.com/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-primary hover:underline font-medium"
            >
              @oracle_bulls
            </a>
          </div>

          {/* Telegram */}
          <div className="holo-card p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display font-bold text-lg">Telegram</h2>
            <p className="text-sm text-muted-foreground">
              Join our Telegram community for discussions, feature requests, and support.
            </p>
            <a
              href="https://t.me/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-primary hover:underline font-medium"
            >
              t.me/oracle_bulls
            </a>
          </div>
        </div>

        {/* FAQ / Common Questions */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">Is Oracle Bull free to use?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! All of our analytics tools, predictions, and educational content are 100% free 
                with no signup required. We believe market intelligence should be accessible to everyone.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">Do you provide financial advice?</h3>
              <p className="text-sm text-muted-foreground">
                No. Oracle Bull is a market intelligence and analytics platform that provides educational 
                insights and data-driven analysis. Nothing on our platform constitutes financial advice. 
                Always do your own research and consult a qualified financial advisor.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">How can I report an issue or bug?</h3>
              <p className="text-sm text-muted-foreground">
                Please email us at contact@oraclebull.com with a description of the issue, the page URL, 
                and any screenshots if possible. We typically respond within 24-48 hours.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">Are you open to partnerships?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! We welcome partnerships with data providers, educational platforms, and crypto
                projects. Reach out via email with your proposal and we'll get back to you promptly.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">What tools does Oracle Bull offer?</h3>
              <p className="text-sm text-muted-foreground">
                Oracle Bull provides AI-powered price predictions across daily, weekly, and monthly timeframes, a real-time
                Fear &amp; Greed Index, whale activity tracking, a crypto strength meter, a token explorer, portfolio
                scanner, and educational content. All tools are accessible from the{" "}
                <Link to="/tools" className="text-primary hover:underline">Tools page</Link>.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">Is Oracle Bull free to use?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, every feature on Oracle Bull is completely free with no registration required. There are no premium
                tiers, no paywalled content, and no hidden fees. The platform is ad-supported so that all users get
                full access to every tool, including{" "}
                <Link to="/predictions" className="text-primary hover:underline">AI predictions</Link> and{" "}
                <Link to="/sentiment" className="text-primary hover:underline">sentiment analysis</Link>.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">How do I report a bug?</h3>
              <p className="text-sm text-muted-foreground">
                Send an email to contact@oraclebull.com with a clear description of the issue, the page URL where
                the bug occurs, what you expected to happen, and what actually happened. Screenshots or screen recordings
                are very helpful. You can also report issues through our Telegram community for faster triage.
              </p>
            </div>
            <div className="holo-card p-6">
              <h3 className="font-bold text-foreground mb-2">Can I suggest a new feature?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! We love hearing from our users. Send your feature ideas to contact@oraclebull.com
                or post them in our Telegram group. Many of the tools on Oracle Bull — like the{" "}
                <Link to="/crypto-strength-meter" className="text-primary hover:underline">Strength Meter</Link> and{" "}
                <Link to="/explorer" className="text-primary hover:underline">Token Explorer</Link> — were built based on
                community requests.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="max-w-3xl mx-auto mb-16 border-t border-border/30 pt-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/dashboard" className="holo-card p-4 text-center hover:border-primary/50 transition-colors group">
              <span className="font-bold text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                Market Dashboard <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
            <Link to="/predictions" className="holo-card p-4 text-center hover:border-primary/50 transition-colors group">
              <span className="font-bold text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                AI Predictions <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
            <Link to="/learn" className="holo-card p-4 text-center hover:border-primary/50 transition-colors group">
              <span className="font-bold text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                Learn Hub <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
            <Link to="/tools" className="holo-card p-4 text-center hover:border-primary/50 transition-colors group">
              <span className="font-bold text-sm group-hover:text-primary transition-colors flex items-center justify-center gap-2">
                All Tools <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          </div>
        </section>

        {/* Response Time */}
        <section className="text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Typical response time: 24-48 hours</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We read every message and do our best to respond as quickly as possible. 
            For urgent matters, reach out on Telegram for faster communication.
          </p>
        </section>

        <ContactSEOContent />
      </div>
    </Layout>
  );
};

export default ContactPage;
