import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";

const TERMLY_POLICY_ID = "420ca159-8920-4a82-bbb7-26884795507e";

const CookiePolicy = () => {
  useEffect(() => {
    const existing = document.querySelector('script[src*="embed-policy.min.js"]');
    if (existing) {
      existing.remove();
    }
    const script = document.createElement("script");
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Cookie Policy | Oracle Bull</title>
        <meta name="description" content="Oracle Bull cookie policy — how we use cookies and similar technologies." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">Cookie Policy</h1>
        <div
          data-id={TERMLY_POLICY_ID}
          data-type="iframe"
          // @ts-expect-error Termly uses a non-standard `name` attribute
          name="termly-embed"
          className="min-h-[600px]"
        />
      </div>
    </Layout>
  );
};

export default CookiePolicy;
