import { UserPlus, Smartphone, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Subscribe",
    desc: "Choose your plan and join our private signals group. Setup takes less than 2 minutes. No experience required.",
  },
  {
    num: "02",
    icon: Smartphone,
    title: "Receive Signals",
    desc: "Get instant Telegram alerts with exact entry price, stop-loss, and take-profit levels. Every signal includes our reasoning.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Profit",
    desc: "Place the trade in under 60 seconds, set your levels, and let it run. Average signal profit: +6.8%. It's that simple.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-card/30">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground">Start profiting in under 3 minutes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px border-t-2 border-dashed border-border" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-card border border-border rounded-2xl p-8 text-center card-glow"
            >
              <span className="text-5xl font-bold text-gradient-primary mb-4 block">{step.num}</span>
              <step.icon className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
