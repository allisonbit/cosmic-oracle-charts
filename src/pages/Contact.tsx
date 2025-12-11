import { Layout } from "@/components/layout/Layout";
import { MessageCircle, Twitter, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import cosmicOracle from "@/assets/cosmic-oracle-hero.jpg";
import { useState } from "react";
import { toast } from "sonner";

const CONTRACT_ADDRESS = "0x08ae73a4c4881ac59087d752831ca7677a33e5ba";

const ContactPage = () => {
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast.success("Contract address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-3xl md:text-5xl font-display font-bold">
            <span className="text-gradient-cosmic">CONNECT</span> WITH US
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our cosmic community and stay updated with the latest forecasts
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Oracle Image */}
          <div className="relative flex justify-center order-2 lg:order-1">
            <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border border-primary/30 pulse-glow" />
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden float">
              <img
                src={cosmicOracle}
                alt="Cosmic Oracle"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>

          {/* Social Links & CA */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Social Links */}
            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-xl mb-6">FOLLOW THE ORACLE</h2>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="https://x.com/oracle_bulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-6 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <Twitter className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">X (Twitter)</span>
                </a>
                <a
                  href="https://t.me/oracle_bulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-6 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <MessageCircle className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">Telegram</span>
                </a>
              </div>
            </div>

            {/* Contract Address */}
            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-xl mb-4">CONTRACT ADDRESS</h2>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted/50 p-3 rounded-lg text-xs md:text-sm font-mono text-primary break-all border border-primary/20">
                  {CONTRACT_ADDRESS}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCA}
                  className="shrink-0 border-primary/30 hover:bg-primary/10"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* About Note */}
            <div className="text-center text-muted-foreground text-sm">
              <p>
                Oracle is a free platform built to make crypto data 
                beautiful and accessible to everyone. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;