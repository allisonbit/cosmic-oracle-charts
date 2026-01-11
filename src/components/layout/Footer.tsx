import { Twitter, MessageCircle, Copy, Check, Shield, FileText, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import oracleLogo from "@/assets/oracle-bull-logo.jpg";

const CONTRACT_ADDRESS = "0x08ae73a4c4881ac59087d752831ca7677a33e5ba";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-primary/20 bg-card/50 backdrop-blur-xl" role="contentinfo">
      {/* Global Disclaimer Banner */}
      <div className="bg-warning/5 border-b border-warning/20">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-xs md:text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 inline-block mr-2 text-warning" />
            <span className="font-medium text-warning">Disclaimer:</span>{" "}
            OracleBull provides market analysis and educational insights only. This is not financial advice.
            <Link to="/risk-disclaimer" className="text-primary hover:underline ml-2">
              Read full disclaimer →
            </Link>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3" aria-label="OracleBull - Home">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30">
                <img src={oracleLogo} alt="OracleBull logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-lg font-bold glow-text">
                ORACLEBULL
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              AI-Powered Market Intelligence & Analytics Platform. 
              Comprehensive crypto and forex market analysis, sentiment tracking, and educational insights.
            </p>
            
            {/* Contract Address */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">CA:</span>
              <code className="text-xs font-mono text-primary bg-muted/50 px-2 py-1 rounded border border-primary/20">
                {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
              </code>
              <button
                onClick={copyCA}
                className="p-1 hover:bg-primary/10 rounded transition-colors"
                aria-label="Copy contract address"
                type="button"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" aria-hidden="true" /> : <Copy className="w-3 h-3 text-muted-foreground" aria-hidden="true" />}
              </button>
            </div>
          </div>
          
          {/* Analysis & Insights */}
          <nav className="space-y-4" aria-label="Footer navigation - Analysis">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">ANALYSIS</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/predictions" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Market Analysis
                </Link>
              </li>
              <li>
                <Link to="/sentiment" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sentiment Analysis
                </Link>
              </li>
              <li>
                <Link to="/strength" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Market Strength Meter
                </Link>
              </li>
              <li>
                <Link to="/factory" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Market Intelligence
                </Link>
              </li>
              <li>
                <Link to="/insights" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Market Insights
                </Link>
              </li>
            </ul>
          </nav>

          {/* Tools */}
          <nav className="space-y-4" aria-label="Footer navigation - Tools">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">TOOLS</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Market Dashboard
                </Link>
              </li>
              <li>
                <Link to="/explorer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Token Explorer
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Wallet Scanner
                </Link>
              </li>
              <li>
                <Link to="/chain/ethereum" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Chain Analytics
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Learn */}
          <nav className="space-y-4" aria-label="Footer navigation - Learn">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">LEARN</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/learn" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Educational Articles
                </Link>
              </li>
              <li>
                <Link to="/insights" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Crypto Insights
                </Link>
              </li>
              <li>
                <Link to="/market/best-crypto-to-buy-today" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Market Trends
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company & Legal */}
          <nav className="space-y-4" aria-label="Footer navigation - Company">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">COMPANY</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Info className="w-3 h-3" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Shield className="w-3 h-3" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="w-3 h-3" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/risk-disclaimer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <AlertTriangle className="w-3 h-3" /> Risk Disclaimer
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Social Links & Bottom */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a 
              href="https://x.com/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              aria-label="Follow us on X (Twitter)"
            >
              <Twitter className="w-5 h-5" aria-hidden="true" />
            </a>
            <a 
              href="https://t.me/oracle_bulls"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              aria-label="Join our Telegram community"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
          
          <div className="text-center text-xs md:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} OracleBull. All rights reserved.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Market analysis for educational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}