import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { FileText, AlertTriangle, Scale, Shield, Globe, Ban } from "lucide-react";

const Terms = () => {
  return (
    <Layout>
      <SEO 
        title="Terms of Service | OracleBull Market Intelligence"
        description="OracleBull terms of service. Understand the terms and conditions for using our market intelligence and analytics platform."
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </header>

        <div className="prose max-w-none space-y-8">
          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using OracleBull ("the Platform," "we," "our"), you agree to be bound by 
              these Terms of Service and all applicable laws and regulations. If you do not agree with 
              any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              OracleBull is a Market Intelligence & Analytics Platform that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Market analysis and trend identification</li>
              <li>Sentiment tracking and monitoring</li>
              <li>Educational content and market insights</li>
              <li>Blockchain analytics and metrics</li>
              <li>AI-driven market intelligence</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All services are provided for informational and educational purposes only.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8 border-warning/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-display font-bold m-0">3. Important Disclaimer</h2>
            </div>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
              <p className="text-warning font-bold mb-2">THIS IS NOT FINANCIAL ADVICE</p>
              <p className="text-muted-foreground text-sm">
                The information provided on OracleBull is for general informational and educational 
                purposes only. It should not be considered as financial, investment, trading, or any 
                other type of professional advice.
              </p>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>We do not provide personalized financial advice</li>
              <li>Past performance does not guarantee future results</li>
              <li>All investment decisions are made at your own risk</li>
              <li>Market predictions are speculative and not guaranteed</li>
              <li>You should consult a licensed financial advisor before making investment decisions</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">4. User Responsibilities</h2>
            </div>
            <p className="text-muted-foreground">By using our platform, you agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Use the platform for lawful purposes only</li>
              <li>Not attempt to manipulate or disrupt our services</li>
              <li>Not scrape, copy, or redistribute content without permission</li>
              <li>Conduct your own research before making financial decisions</li>
              <li>Understand that all investments carry risk of loss</li>
              <li>Not rely solely on our analysis for investment decisions</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-success" />
              <h2 className="text-xl font-display font-bold m-0">5. Intellectual Property</h2>
            </div>
            <p className="text-muted-foreground">
              All content on OracleBull, including but not limited to text, graphics, logos, icons, 
              images, audio clips, digital downloads, data compilations, and software, is the property 
              of OracleBull or its content suppliers and protected by international copyright laws.
            </p>
            <p className="text-muted-foreground mt-4">
              You may not reproduce, distribute, modify, create derivative works from, or commercially 
              exploit any content without our express written permission.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">6. Third-Party Content and Links</h2>
            <p className="text-muted-foreground">
              Our platform may include links to third-party websites, content, or services. We do not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Control or endorse third-party content</li>
              <li>Guarantee the accuracy of third-party information</li>
              <li>Accept responsibility for third-party services</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Market data is sourced from various third-party providers. While we strive for accuracy, 
              we cannot guarantee that all data is correct, complete, or current.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, OracleBull shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Any direct, indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, revenue, data, or use</li>
              <li>Investment losses or financial decisions made based on our content</li>
              <li>Service interruptions or data inaccuracies</li>
              <li>Third-party actions or content</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">8. Warranty Disclaimer</h2>
            <p className="text-muted-foreground">
              The platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, 
              whether express or implied, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy or completeness of information</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-display font-bold m-0">9. Jurisdiction</h2>
            </div>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law principles. You agree to submit to the exclusive 
              jurisdiction of the courts in the applicable jurisdiction.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">10. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. Changes will be effective 
              immediately upon posting on this page. Your continued use of the platform after any 
              changes indicates acceptance of the modified Terms.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Ban className="w-6 h-6 text-danger" />
              <h2 className="text-xl font-display font-bold m-0">11. Termination</h2>
            </div>
            <p className="text-muted-foreground">
              We reserve the right to terminate or suspend access to our platform immediately, 
              without prior notice, for any reason whatsoever, including without limitation if 
              you breach the Terms.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mt-4">
              <li><strong>Twitter:</strong> <a href="https://x.com/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@oracle_bulls</a></li>
              <li><strong>Telegram:</strong> <a href="https://t.me/oracle_bulls" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">t.me/oracle_bulls</a></li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
