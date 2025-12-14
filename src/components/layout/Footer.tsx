import { Twitter, MessageCircle, Copy, Check } from "lucide-react";
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
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3" aria-label="Oracle - Home">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-primary/30">
                <img src={oracleLogo} alt="Oracle logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-lg font-bold glow-text">
                ORACLE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md text-sm md:text-base">
              Your AI guide through the crypto universe. Beautiful predictions, 
              real-time charts, and market insights — all free and open access.
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
          
          {/* Quick Links */}
          <nav className="space-y-4" aria-label="Footer navigation">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">EXPLORE</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Wallet Scanner
                </Link>
              </li>
              <li>
                <Link to="/chain/ethereum" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blockchain Analytics
                </Link>
              </li>
              <li>
                <Link to="/sentiment" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sentiment Scanner
                </Link>
              </li>
              <li>
                <Link to="/explorer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Token Explorer
                </Link>
              </li>
              <li>
                <Link to="/learn" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Learning Zone
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-foreground text-sm md:text-base">CONNECT</h4>
            <div className="flex gap-3">
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
            <p className="text-xs text-muted-foreground/60">
              Not financial advice. Data for informational purposes only.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 md:mt-12 pt-6 text-center text-xs md:text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Oracle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}