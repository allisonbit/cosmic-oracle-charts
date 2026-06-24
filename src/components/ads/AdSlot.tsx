import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LargeBannerAd } from "./LargeBannerAd";
import { SmallBannerAd } from "./SmallBannerAd";
import { MediumRectangleAd } from "./MediumRectangleAd";
import { NativeBannerAd } from "./NativeBannerAd";
import { SmartlinkAd } from "./SmartlinkAd";

// ─────────────────────────────────────────────────────────────────────────────
// Ad coordinator.
//
// Adsterra has two hard constraints that make naive "render an ad here" break:
//   1. HighPerformanceFormat banners (Large/Medium/Small) read a GLOBAL
//      `var atOptions`, so only ONE HPF unit can run per page — a second one
//      overwrites the first's config and both render wrong/blank.
//   2. The Native banner targets a fixed container id (#container-<key>), so it
//      also cannot be duplicated on one page.
// Only SmartlinkAd (a styled <a>, no script/global) is safe to repeat.
//
// So slots can't each just pick a network. This coordinator assigns, per page:
//   slot #0  -> HPF banner   (Large on desktop / Small on mobile, or a 300x250
//                             rectangle when variant="rectangle")
//   slot #1  -> Native banner
//   slot #2+ -> Smartlink    (always works, repeatable)
// The counter resets on every route change so each page view starts fresh.
//
// WHY this file exists: BannerAd/InArticleAd/SidebarAd previously rendered
// AdSense (<ins class="adsbygoogle">), but the AdSense account was rejected and
// its loader was removed from index.html — so every one of those slots showed
// nothing. Routing them through this coordinator makes them serve live Adsterra
// inventory instead.
// ─────────────────────────────────────────────────────────────────────────────

type SlotKind = "hpf" | "native" | "smartlink";
type Variant = "banner" | "rectangle";

// Module-level claim registry, reset per pathname.
const registry: { path: string; count: number } = { path: "", count: 0 };

function claimSlot(path: string): number {
  if (registry.path !== path) {
    registry.path = path;
    registry.count = 0;
  }
  return registry.count++;
}

function kindForIndex(index: number): SlotKind {
  if (index === 0) return "hpf";
  if (index === 1) return "native";
  return "smartlink";
}

interface AdSlotProps {
  className?: string;
  /** "banner" (728x90 / 320x50) or "rectangle" (300x250). */
  variant?: Variant;
}

export function AdSlot({ className, variant = "banner" }: AdSlotProps) {
  const { pathname } = useLocation();
  // Claim an index once per mount, tied to the current path.
  const kindRef = useRef<SlotKind | null>(null);
  const [kind, setKind] = useState<SlotKind | null>(null);

  useEffect(() => {
    const index = claimSlot(pathname);
    let k = kindForIndex(index);
    // Safety net: if this slot would be HPF but another HPF unit already claimed
    // the page (e.g. the global AdsterraStickyFooter, or a hand-placed
    // LargeBannerAd), downgrade to native so the two don't fight over the global
    // `atOptions`. Rectangles and the sticky footer all flip __hpfMounted.
    if (k === "hpf" && typeof window !== "undefined" && (window as { __hpfMounted?: boolean }).__hpfMounted) {
      k = "native";
    }
    kindRef.current = k;
    setKind(k);
    // Re-claim when the route changes so a long-lived component (rare for ads)
    // still participates in the next page's allocation.
  }, [pathname]);

  if (!kind) {
    // Reserve space to avoid layout shift before the slot kind is decided.
    return (
      <div
        className={cn(
          "w-full",
          variant === "rectangle" ? "min-h-[250px]" : "min-h-[90px]",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  if (kind === "hpf") {
    if (variant === "rectangle") return <MediumRectangleAd className={className} />;
    // Banner: Large is desktop-only, Small is mobile-only — render both, CSS
    // shows exactly one per viewport.
    return (
      <div className={cn("w-full flex justify-center", className)}>
        <LargeBannerAd />
        <SmallBannerAd />
      </div>
    );
  }

  if (kind === "native") {
    return <NativeBannerAd className={className} />;
  }

  // Repeatable fallback — always renders, never collides.
  return (
    <div className={cn("w-full flex justify-center py-2", className)}>
      <SmartlinkAd />
    </div>
  );
}

export default AdSlot;
