import { Activity, Twitter, MessageCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-card/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold glow-text">
                ORACLE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Your AI guide through the crypto universe. Beautiful predictions, 
              real-time charts, and market insights — all free and open access.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground/60">
              Not financial advice. Data presented for informational purposes only.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">EXPLORE</h4>
            <div className="space-y-2">
              <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/chain/ethereum" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Blockchain Analytics
              </Link>
              <Link to="/sentiment" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Sentiment Scanner
              </Link>
              <Link to="/explorer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Token Explorer
              </Link>
              <Link to="/learn" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Learning Zone
              </Link>
            </div>
          </div>
          
          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">CONNECT</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Telegram"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 md:mt-12 pt-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 Oracle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
