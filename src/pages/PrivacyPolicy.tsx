import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import policyHtml from "@/content/privacy-policy.html?raw";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | Oracle Bull</title>
        <meta name="description" content="Oracle Bull privacy policy — how we collect, use, and protect your data." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          className="termly-policy prose-invert"
          dangerouslySetInnerHTML={{ __html: policyHtml }}
        />
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
