import { Layout } from "@/components/layout/Layout";
import { Mail, MessageCircle, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import cosmicOracle from "@/assets/cosmic-oracle-hero.jpg";

const ContactPage = () => {
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

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
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

          {/* Contact Form & Links */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Social Links */}
            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-xl mb-6">FOLLOW THE ORACLE</h2>
              <div className="grid grid-cols-3 gap-4">
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <Twitter className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">Twitter/X</span>
                </a>
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <MessageCircle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">Telegram</span>
                </a>
                <a
                  href="#"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-primary/10 hover:border-primary border border-transparent transition-all group"
                >
                  <Mail className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">Email</span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="holo-card p-6">
              <h2 className="font-display font-bold text-xl mb-6">SEND A MESSAGE</h2>
              <form className="space-y-4">
                <div>
                  <Input
                    placeholder="Your Name"
                    className="bg-muted/50 border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    className="bg-muted/50 border-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message..."
                    rows={4}
                    className="bg-muted/50 border-primary/30 focus:border-primary resize-none"
                  />
                </div>
                <Button variant="cosmic" className="w-full">
                  <Send className="w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* About Note */}
            <div className="text-center text-muted-foreground text-sm">
              <p>
                Cosmic Crypto Forecasts is a free platform built to make crypto data 
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
