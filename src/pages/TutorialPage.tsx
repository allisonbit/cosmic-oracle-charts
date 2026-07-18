import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";

const sections = [
  { id: "bias", title: "Reading the Bias Badge" },
  { id: "confidence", title: "Confidence Score" },
  { id: "zones", title: "Support & Resistance Zones" },
  { id: "indicators", title: "RSI, MACD & Moving Averages" },
  { id: "scenarios", title: "Bull vs Bear Scenarios" },
  { id: "mistakes", title: "Common Mistakes to Avoid" },
  { id: "faq", title: "FAQ" },
];

export default function TutorialPage() {
  const canonical = `${SITE_URL}/how-to-read-predictions`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does the bias badge mean?",
        acceptedAnswer: { "@type": "Answer", text: "Bias is the AI model's directional lean for the timeframe — bullish, bearish, or neutral. It is not a guarantee; it is the most probable direction given current data." },
      },
      {
        "@type": "Question",
        name: "How is confidence calculated?",
        acceptedAnswer: { "@type": "Answer", text: "Confidence blends model agreement, indicator alignment, and volatility. Above 70% is strong, 40-70% is moderate, below 40% is speculative." },
      },
      {
        "@type": "Question",
        name: "Should I trade only based on the prediction?",
        acceptedAnswer: { "@type": "Answer", text: "No. Predictions are one input. Always combine with your own risk management, position sizing, and stop-loss discipline. Nothing on Oracle Bull is financial advice." },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Read Oracle Bull AI Predictions",
    step: sections.slice(0, 6).map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      url: `${canonical}#${s.id}`,
    })),
  };

  return (
    <Layout>
      <Helmet>
        <title>How to Read AI Price Predictions & Charts — Oracle Bull Tutorial</title>
        <meta
          name="description"
          content="Step-by-step tutorial on reading Oracle Bull's AI predictions: bias badges, confidence scores, support/resistance, RSI, MACD, and bull/bear scenarios."
        />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How to Read AI Price Predictions & Charts" />
        <meta property="og:description" content="A plain-English guide to Oracle Bull's AI prediction dashboard." />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(howToSchema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-10">
          <Badge variant="outline" className="mb-3">Tutorial</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            How to Read AI Price Predictions & Charts
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Every card on Oracle Bull condenses dozens of technical signals into a simple bias, confidence score, and price zones. Here's exactly what each element means and how to use it.
          </p>
          <Link to="/tutorial/interactive" className="inline-flex items-center mt-4 text-primary font-semibold hover:underline">
            Prefer clicking through a live chart? Try the interactive tutorial <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </header>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* Sticky nav */}
          <aside className="hidden md:block">
            <nav className="sticky top-24 space-y-1">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-foreground py-1.5 border-l-2 border-transparent hover:border-primary pl-3 transition-colors">
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="space-y-10 prose-lg max-w-none">
            <section id="bias">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary" /> 1. Reading the Bias Badge</h2>
              <div className="grid sm:grid-cols-3 gap-3 my-4">
                <Card className="p-4"><Badge className="bg-green-500/15 text-green-600 border-green-500/30 mb-2"><TrendingUp className="w-3 h-3 mr-1" />Bullish</Badge><p className="text-sm text-muted-foreground">Model expects an up-move over the timeframe. Look for entries near support.</p></Card>
                <Card className="p-4"><Badge className="bg-red-500/15 text-red-600 border-red-500/30 mb-2"><TrendingDown className="w-3 h-3 mr-1" />Bearish</Badge><p className="text-sm text-muted-foreground">Model expects a down-move. Wait for confirmation before shorting; consider taking profit.</p></Card>
                <Card className="p-4"><Badge className="bg-muted mb-2"><Minus className="w-3 h-3 mr-1" />Neutral</Badge><p className="text-sm text-muted-foreground">Signals are mixed. Range-trade or stand aside.</p></Card>
              </div>
              <p>The bias is the model's directional lean, not a certainty. It updates as new price and on-chain data arrive.</p>
            </section>

            <section id="confidence">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Activity className="w-6 h-6 text-primary" /> 2. Confidence Score</h2>
              <p>Confidence (0–100%) reflects how strongly the underlying signals agree. Use it to size — a 82% bullish call deserves more attention than a 41% one.</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li><strong>70%+</strong> — Strong agreement across indicators.</li>
                <li><strong>40–70%</strong> — Moderate; combine with your own analysis.</li>
                <li><strong>&lt;40%</strong> — Speculative; treat as a low-conviction hint.</li>
              </ul>
            </section>

            <section id="zones">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> 3. Support & Resistance Zones</h2>
              <p>The green shaded band is projected support (buyers likely to defend). The red band is resistance (sellers likely to appear). Zones are bands, not exact lines — expect wicks through them.</p>
            </section>

            <section id="indicators">
              <h2 className="text-2xl font-bold mb-3">4. RSI, MACD & Moving Averages</h2>
              <p><strong>RSI</strong> above 70 = overbought, below 30 = oversold. <strong>MACD</strong> crossing above its signal line is bullish momentum, below is bearish. <strong>MAs</strong> — price above the 50/200 daily is a longer-term uptrend.</p>
            </section>

            <section id="scenarios">
              <h2 className="text-2xl font-bold mb-3">5. Bull vs Bear Scenarios</h2>
              <p>Each prediction lists a bull-case target (with the trigger that would confirm it) and a bear-case target (with its invalidation level). Use these to set your take-profit and stop-loss before entering.</p>
            </section>

            <section id="mistakes">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-primary" /> 6. Common Mistakes</h2>
              <ul className="space-y-2">
                <li><strong>Chasing a high-confidence signal without stops.</strong> High confidence ≠ zero risk.</li>
                <li><strong>Ignoring the timeframe.</strong> A bullish weekly can still see a red day.</li>
                <li><strong>Averaging down without a plan.</strong> Predictions can flip; respect invalidation levels.</li>
              </ul>
            </section>

            <section id="faq" className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">FAQ</h2>
              <div className="space-y-4">
                {(faqSchema.mainEntity as any[]).map((q) => (
                  <div key={q.name}>
                    <h3 className="font-semibold">{q.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{q.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-bold mb-2">Ready to try it?</h3>
              <p className="text-muted-foreground mb-4">Open a live prediction and use this guide side-by-side.</p>
              <Link to="/predictions" className="inline-flex items-center text-primary font-semibold hover:underline">
                Browse live predictions <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Card>
          </article>
        </div>
      </div>
    </Layout>
  );
}