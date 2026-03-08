import { motion } from "framer-motion";

const benefits = [
  { icon: "🎯", title: "Proven Accuracy", desc: "85%+ win rate across bull AND bear markets. We don't chase moonshots — we find high-probability setups backed by data." },
  { icon: "⏰", title: "Save 4+ Hours Daily", desc: "Stop staring at charts. Our analysts do the heavy lifting so you can check your phone, place the trade, and live your life." },
  { icon: "🛡️", title: "Built-In Risk Management", desc: "Every signal includes exact stop-loss and take-profit levels. You'll always know your maximum risk before entering a trade." },
  { icon: "📱", title: "Instant Delivery", desc: "Signals arrive the SECOND an opportunity appears. Real-time Telegram alerts with zero delay. Never miss a move again." },
  { icon: "🎓", title: "Learn While You Earn", desc: "We explain the WHY behind every signal. Over time, you'll develop the skills to find your own trades. We build traders, not followers." },
  { icon: "💬", title: "Active Community", desc: "Join thousands of traders sharing ideas, celebrating wins, and supporting each other. Trading doesn't have to be lonely." },
];

export function Benefits() {
  return (
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Why 12,000+ Traders Trust OracleBull</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 card-glow"
            >
              <span className="text-3xl mb-4 block">{b.icon}</span>
              <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
