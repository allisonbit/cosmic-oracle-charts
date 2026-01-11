import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Shield, Eye, Lock, Database, Cookie, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <SEO 
        title="Privacy Policy | OracleBull Market Intelligence"
        description="OracleBull privacy policy. Learn how we handle your data, what information we collect, and how we protect your privacy on our market intelligence platform."
      />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2025</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">Introduction</h2>
            </div>
            <p className="text-muted-foreground">
              OracleBull ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, and safeguard information when you visit our website and use our 
              market intelligence and analytics platform.
            </p>
            <p className="text-muted-foreground">
              Our platform is designed to provide market analysis and educational insights without requiring 
              user registration or personal information submission. We believe in minimal data collection 
              and maximum transparency.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-display font-bold m-0">Information We Collect</h2>
            </div>
            
            <h3 className="text-lg font-bold mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-muted-foreground">
              When you visit our website, we may automatically collect certain information including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address (anonymized)</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
              <li>Device type (desktop, mobile, tablet)</li>
            </ul>

            <h3 className="text-lg font-bold mt-6 mb-3">Information You Provide</h3>
            <p className="text-muted-foreground">
              Our platform does not require registration. However, if you choose to contact us, we may 
              collect your email address and any information you include in your message.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-success" />
              <h2 className="text-xl font-display font-bold m-0">How We Use Your Information</h2>
            </div>
            <p className="text-muted-foreground">We use the collected information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide and maintain our market intelligence services</li>
              <li>Improve user experience and website performance</li>
              <li>Analyze website usage patterns and trends</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Respond to inquiries and support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-display font-bold m-0">Cookies and Tracking</h2>
            </div>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience. These include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site (Google Analytics)</li>
              <li><strong>Advertising cookies:</strong> Used by Google AdSense to serve relevant advertisements</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookie preferences through your browser settings. Disabling cookies may 
              affect some website functionality.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the following third-party services that may collect information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li><strong>Google Analytics:</strong> Website analytics and usage tracking</li>
              <li><strong>Google AdSense:</strong> Advertising services</li>
              <li><strong>Cryptocurrency data providers:</strong> Market data APIs for real-time prices</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              These services have their own privacy policies governing data collection and use.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect information 
              against unauthorized access, alteration, disclosure, or destruction. However, no internet 
              transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground">
              Depending on your location, you may have rights regarding your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>Right to access information we hold about you</li>
              <li>Right to request correction of inaccurate information</li>
              <li>Right to request deletion of your information</li>
              <li>Right to opt-out of certain data processing</li>
              <li>Right to data portability</li>
            </ul>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our platform is not intended for children under 18 years of age. We do not knowingly 
              collect personal information from minors. If you believe a child has provided us with 
              personal information, please contact us.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. Changes will be posted on this page with 
              an updated revision date. We encourage you to review this policy regularly.
            </p>
          </section>

          <section className="holo-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold m-0">Contact Us</h2>
            </div>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
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

export default PrivacyPolicy;
