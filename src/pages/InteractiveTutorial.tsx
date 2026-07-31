import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, TrendingUp, Activity, BarChart3, Gauge, MessageCircle, Target } from "lucide-react";
import { SITE_URL } from "@/lib/siteConfig";

type Step = {
  id: string;
  title: string;
  icon: JSX.Element;
  body: string;
  highlight: "price" | "forecast" | "band" | "sentiment" | "rsi" | "macd";
};

const STEPS: Step[] = [
  { id: "price", highlight: "price", icon: <TrendingUp className="w-4 h-4" />, title: "1. The Price Line",
    body: "The solid blue line is actual historical price. Everything to the left of the vertical marker is what already happened — your ground truth." },
  { id: "forecast", highlight: "forecast", icon: <Activity className="w-4 h-4" />, title: "2. The AI Forecast Line",
    body: "The dashed line is the model's projected path. It's a most-likely trajectory, not a promise. Slope matters more than the exact number." },
  { id: "band", highlight: "band", icon: <Target className="w-4 h-4" />, title: "3. Confidence Band",
    body: "The shaded area around the forecast is the confidence range (target_low → target_high). A wide band means volatility; a narrow band means high conviction." },
  { id: "sentiment", highlight: "sentiment", icon: <MessageCircle className="w-4 h-4" />, title: "4. Social Sentiment Ribbon",
    body: "Green ticks below the chart = bullish social chatter; red = bearish. Watch for sentiment diverging from price — that often precedes reversals." },
  { id: "rsi", highlight: "rsi", icon: <Gauge className="w-4 h-4" />, title: "5. RSI (0–100)",
    body: "Above 70 = overbought (fuel exhausted). Below 30 = oversold (potential bounce). RSI + a bearish forecast is a stronger sell signal than either alone." },
  { id: "macd", highlight: "macd", icon: <BarChart3 className="w-4 h-4" />, title: "6. MACD Histogram",
    body: "Bars flipping from red to green = momentum turning up. Combined with a bullish AI bias, this is a classic entry trigger." },
];

function Chart({ step }: { step: Step["highlight"] }) {
  const on = (s: Step["highlight"]) => step === s;
  return (
    <div className="rounded-xl border bg-white p-4">
      <svg viewBox="0 0 600 340" className="w-full h-auto">
        {/* grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={0} x2={600} y1={40 + i * 40} y2={40 + i * 40} stroke="#eef2f7" />
        ))}
        {/* confidence band */}
        <path d="M320,140 Q380,110 440,105 Q500,102 560,80 L560,180 Q500,190 440,185 Q380,185 320,180 Z"
          fill={on("band") ? "rgba(59,130,246,0.28)" : "rgba(59,130,246,0.12)"}
          stroke={on("band") ? "#3b82f6" : "none"} strokeDasharray="4 4" />
        {/* historical price */}
        <polyline
          points="20,180 60,170 100,190 140,160 180,175 220,150 260,155 300,140 320,145"
          fill="none" stroke={on("price") ? "#0ea5e9" : "#64748b"} strokeWidth={on("price") ? 4 : 2.5} />
        {/* forecast */}
        <polyline
          points="320,145 360,130 400,120 440,110 480,100 520,95 560,88"
          fill="none" stroke={on("forecast") ? "#3b82f6" : "#93c5fd"} strokeWidth={on("forecast") ? 4 : 2.5}
          strokeDasharray="6 4" />
        {/* now-line */}
        <line x1={320} x2={320} y1={30} y2={230} stroke="#cbd5e1" strokeDasharray="2 3" />
        <text x={324} y={40} fontSize="10" fill="#64748b">now</text>

        {/* sentiment ribbon */}
        <g opacity={on("sentiment") ? 1 : 0.55}>
          {Array.from({ length: 30 }).map((_, i) => {
            const bullish = [3,4,5,8,9,12,13,14,17,18,20,21,22,25,26,27,28].includes(i);
            return <rect key={i} x={20 + i * 19} y={240} width={14} height={12}
              fill={bullish ? "#22c55e" : "#ef4444"} opacity={on("sentiment") ? 1 : 0.5} rx={2} />;
          })}
          <text x={20} y={236} fontSize="10" fill="#64748b">social sentiment</text>
        </g>

        {/* RSI */}
        <g opacity={on("rsi") ? 1 : 0.5}>
          <text x={20} y={272} fontSize="10" fill="#64748b">RSI</text>
          <line x1={60} x2={580} y1={280} y2={280} stroke="#e2e8f0" />
          <polyline points="60,285 120,270 180,258 240,272 300,265 360,255 420,248 480,262 540,270"
            fill="none" stroke={on("rsi") ? "#f59e0b" : "#fbbf24"} strokeWidth={on("rsi") ? 3 : 2} />
          <line x1={60} x2={580} y1={260} y2={260} stroke="#fca5a5" strokeDasharray="3 3" />
          <line x1={60} x2={580} y1={295} y2={295} stroke="#86efac" strokeDasharray="3 3" />
        </g>

        {/* MACD */}
        <g opacity={on("macd") ? 1 : 0.5}>
          <text x={20} y={318} fontSize="10" fill="#64748b">MACD</text>
          {[-6,-5,-4,-2,-1,1,2,4,5,6,7,8,7,6].map((v, i) => (
            <rect key={i} x={60 + i * 34} y={v < 0 ? 320 : 320 + v} width={22} height={Math.abs(v * 2)}
              fill={v < 0 ? "#ef4444" : "#22c55e"} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function InteractiveTutorial() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const canonical = `${SITE_URL}/tutorial/interactive`;

  return (
    <Layout>
      <Helmet>
        <title>Interactive Chart Tutorial — Learn Oracle Bull Predictions</title>
        <meta name="description" content="Click through a live chart and see exactly what the forecast line, confidence band, sentiment, RSI, and MACD tell you before you trade." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Badge variant="outline" className="mb-3">Interactive</Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Learn the chart in 6 clicks</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
          Every element highlighted below is on every prediction page. Step through to see what each one means.
        </p>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <Chart step={step.highlight} />

          <Card className="p-6 flex flex-col">
            <div className="flex items-center gap-2 text-primary mb-2">{step.icon}<span className="text-xs uppercase tracking-wide">Step {i + 1} of {STEPS.length}</span></div>
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground flex-1">{step.body}</p>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div className="flex gap-1">
                {STEPS.map((s, idx) => (
                  <button key={s.id} onClick={() => setI(idx)} aria-label={s.title}
                    className={`w-2.5 h-2.5 rounded-full ${idx === i ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
              {i < STEPS.length - 1 ? (
                <Button onClick={() => setI(i + 1)}>Next <ArrowRight className="w-4 h-4 ml-1" /></Button>
              ) : (
                <Button asChild><Link to="/predictions">Try it live <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          Prefer to read it? See the full <Link className="text-primary underline" to="/how-to-read-predictions">written tutorial</Link>.
        </div>
      </div>
    </Layout>
  );
}