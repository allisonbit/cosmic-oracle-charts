import { cn } from "@/lib/utils";

// ── DataBadge — honesty label for data provenance ─────────────────────────────
// The platform mixes exchange-verified data with derived/modeled estimates.
// This badge standardizes how we disclose that to users (and keeps us honest).

type DataBadgeVariant = "live" | "estimated" | "modeled" | "delayed";

const VARIANTS: Record<DataBadgeVariant, { label: string; title: string; cls: string }> = {
  live: {
    label: "LIVE",
    title: "Sourced live from exchange APIs",
    cls: "bg-success/10 text-success border-success/20",
  },
  estimated: {
    label: "EST.",
    title: "Estimated value — derived, not exchange-verified",
    cls: "bg-warning/10 text-warning border-warning/20",
  },
  modeled: {
    label: "MODELED",
    title: "Modeled / simulated for illustration — not exchange-verified",
    cls: "bg-secondary/10 text-secondary border-secondary/20",
  },
  delayed: {
    label: "DELAYED",
    title: "Data may be delayed",
    cls: "bg-muted text-muted-foreground border-border",
  },
};

interface DataBadgeProps {
  variant?: DataBadgeVariant;
  /** Override the default short label (tooltip still explains it). */
  label?: string;
  className?: string;
  /** Show a small pulsing dot (used for the "live" variant). */
  dot?: boolean;
}

export function DataBadge({ variant = "live", label, className, dot }: DataBadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span
      title={v.title}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide leading-none whitespace-nowrap",
        v.cls,
        className,
      )}
    >
      {dot && variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
      )}
      {label ?? v.label}
    </span>
  );
}
