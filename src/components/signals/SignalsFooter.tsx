import { Link } from "react-router-dom";
import { useState } from "react";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Track Record", path: "/track-record" },
  { label: "Blog", path: "/blog" },
];

const supportLinks = [
  { label: "FAQ", path: "/faq" },
  { label: "Contact", path: "/contact" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Earnings Disclaimer", path: "/disclaimer" },
];

export function SignalsFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#080910] border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐂</span>
              <span className="text-xl font-bold text-foreground">Oracle<span className="text-secondary">Bull</span></span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">Trade Smarter. Not Harder.</p>
            <div className="flex gap-3">
              {["𝕏", "✈️", "🎮", "▶️", "📷"].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Join Free Community</h4>
            <p className="text-sm text-muted-foreground mb-3">Get free signals & market updates weekly</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 OracleBull. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Trading involves risk. Past performance ≠ future results. Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
