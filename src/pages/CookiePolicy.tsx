import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import policyHtml from "@/content/cookie-policy.html?raw";

const CookiePolicy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Cookie Policy | Oracle Bull</title>
        <meta name="description" content="Oracle Bull cookie policy — how we use cookies and similar technologies." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div
          className="policy-content prose-invert"
          dangerouslySetInnerHTML={{ __html: policyHtml }}
        />
      </div>
    </Layout>
  );
};

export default CookiePolicy;
