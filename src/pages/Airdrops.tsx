import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { SITE_URL } from "@/lib/siteConfig";
import { AIRDROPS_DATA, type AirdropProject } from "@/components/airdrops/AirdropList";
import { useAirdropCandidates } from "@/hooks/useAirdrops";
import { ArrowRight, ExternalLink, ShieldCheck, Clock, Loader2, Database } from "lucide-react";

const fmtTvl = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1e3).toFixed(0)}K`;
const POTENTIAL_CLS: Record<string, string> = { High: "text-success", Notable: "text-warning", Emerging: "text-muted-foreground" };

const UPDATED = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const statusEmoji = (a: AirdropProject) =>
  a.liveStatus === "Live" ? "🟢 Active" : a.liveStatus === "Upcoming" ? "📅 Upcoming" : "🗄 Ended";

const faqs = [
  { q: "What crypto airdrops are happening in 2026?", a: "Major confirmed and expected airdrops in 2026–2027 span Ethereum Layer-2 rollups (Linea, zkSync, Scroll), new Layer-1s (Monad, Berachain, MegaETH), the Base ecosystem, and high-throughput venues like Hyperliquid. Each is tracked below with its status, estimated value range and the tasks required to qualify." },
  { q: "How do I qualify for a crypto airdrop?", a: "Qualification varies by project, but common requirements include using a protocol before its snapshot date, bridging assets to the target chain, completing a minimum number of on-chain transactions, providing liquidity, or holding for a set duration. Use genuine, varied activity — most projects now filter Sybil farmers who repeat identical minimum actions." },
  { q: "What are Base blockchain airdrops?", a: "Base is Coinbase's Ethereum Layer-2. Base itself uses ETH for gas and has no token, but the hundreds of protocols built on Base can launch tokens and reward early users. Interacting with Base DeFi, DEX and infrastructure protocols early is a common way to qualify for these airdrops." },
  { q: "What is a snapshot in a crypto airdrop?", a: "A snapshot is the specific block or timestamp at which the blockchain state is recorded to decide who qualifies. If your wallet meets the criteria at the snapshot moment you qualify — regardless of what you do afterward. Miss the snapshot and you miss the airdrop." },
  { q: "What is a Sybil attack in airdrops?", a: "A Sybil attack is when one user runs many wallets performing identical actions to claim multiple allocations. Most projects now detect this — flagging wallets funded from the same source or executing identical transactions — and disqualify them. Organic, varied usage performs far better." },
  { q: "Do I need to KYC to receive an airdrop?", a: "It depends on the project. Most DeFi protocol airdrops require no KYC. Some projects backed by regulated entities add KYC or geographic restrictions. Always check the project's official terms before farming." },
  { q: "Are crypto airdrops taxable?", a: "In most jurisdictions airdropped tokens are treated as ordinary income at fair-market value when received, with capital gains/losses on later disposal. Treatment varies by country — always consult a qualified tax professional. This is not tax advice." },
  { q: "What happens if I miss a claim deadline?", a: "Unclaimed tokens are usually returned to the project treasury after the claim window (often 90–180 days). There is generally no appeal — missing the deadline means permanently losing that allocation, so set reminders for every airdrop you qualify for." },
];

const LARGEST = [
  ["Uniswap (UNI)", "2020", "DeFi / DEX", "~400 UNI to every past user (~$1,400 at launch)"],
  ["Arbitrum (ARB)", "2023", "Layer 2", "Largest L2 airdrop; ~$1,700 avg per wallet"],
  ["Optimism (OP)", "2022", "Layer 2", "First of multiple rounds; ongoing model"],
  ["Jito (JTO)", "2023", "Solana", "Largest Solana airdrop at the time"],
  ["dYdX (DYDX)", "2021", "Perps DEX", "Largest perps-DEX airdrop"],
  ["ENS", "2021", "Identity", "Retroactive to all .eth holders"],
  ["Aptos (APT)", "2022", "Layer 1", "Testnet participant rewards"],
  ["Sui (SUI)", "2023", "Layer 1", "Early builder & user rewards"],
];

export default function Airdrops() {
  const { data: candData, isLoading: candLoading } = useAirdropCandidates();
  const [candChain, setCandChain] = useState("All");
  const candChains = useMemo(() => ["All", ...(candData?.chains ?? [])], [candData?.chains]);
  const candidates = useMemo(() => {
    let list = candData?.candidates ?? [];
    if (candChain !== "All") list = list.filter((c) => c.chains.includes(candChain));
    return list.slice(0, 60);
  }, [candData?.candidates, candChain]);

  const canonical = `${SITE_URL}/airdrops`;
  const itemListLd = {
    "@context": "https://schema.org", "@type": "ItemList", name: "Top Crypto Airdrops 2026",
    description: "The highest-value confirmed and active crypto airdrops tracked for 2026–2027.",
    url: canonical, numberOfItems: AIRDROPS_DATA.length,
    itemListElement: AIRDROPS_DATA.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: `${a.name} Airdrop`, url: `${SITE_URL}/airdrops/${a.id}` })),
  };
  const webAppLd = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Bull Airdrop Tracker", url: canonical,
    description: "Crypto airdrop tracker covering active, upcoming and confirmed airdrops for 2026–2027 across Ethereum, Base, Solana, Arbitrum and more.",
    applicationCategory: "FinanceApplication", operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Oracle Bull", url: SITE_URL },
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Airdrops", item: canonical },
  ] };

  return (
    <Layout>
      <Helmet>
        <title>Crypto Airdrops 2026–2027 — All Active, Upcoming & Confirmed Airdrops | Oracle Bull</title>
        <meta name="description" content="Track every crypto airdrop in 2026 and 2027. Active tasks, snapshot dates, eligibility, estimated values and step-by-step guides for Base, Ethereum, Solana, zkSync and more. Updated regularly." />
        <meta name="keywords" content="crypto airdrops 2026, crypto airdrops 2027, best crypto airdrops 2026, base airdrop 2026, ethereum airdrop 2026, solana airdrop 2026, zksync airdrop, how to qualify for crypto airdrops, confirmed crypto airdrops 2026, airdrop guide" />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Crypto Airdrops 2026–2027 — All Active & Upcoming | Oracle Bull" />
        <meta property="og:description" content="Track every crypto airdrop in 2026 and 2027 — eligibility, tasks, estimated values and guides for Base, Ethereum, Solana and more." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(webAppLd)}</script>
        <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <article className="prose prose-neutral dark:prose-invert max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="not-prose text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-primary">Home</Link><span>/</span><span className="text-foreground">Airdrops</span>
          </nav>

          <h1 className="mb-2">Crypto Airdrops 2026 — 2027</h1>
          <p className="not-prose text-lg text-muted-foreground mt-0 mb-3">Every active, upcoming and confirmed airdrop — with eligibility, task guides and estimated values.</p>
          <p className="not-prose text-xs text-muted-foreground flex items-center gap-1.5 mb-6"><Clock className="w-3.5 h-3.5" /> Last updated: {UPDATED}</p>

          <p>
            2026–2027 is shaping up to be one of the biggest windows for crypto airdrops since the 2020 DeFi summer.
            Hundreds of well-funded protocols launched between 2022 and 2025 without a token, and many are now approaching
            their token-generation events. Below is our tracked list of the highest-conviction airdrops, followed by a complete
            guide on how airdrops work, how to farm them safely, how values are estimated, and the tax basics — all in one place.
          </p>

          <div className="not-prose border-l-4 border-warning pl-3 py-1 text-sm text-muted-foreground flex items-start gap-2 my-6">
            <ShieldCheck className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <span>Never sign a transaction you don't understand and never connect your wallet to a site you reached from a DM or ad. Use only the official links below. Estimated values are research estimates, not guarantees.</span>
          </div>

          {/* At a glance table */}
          <h2>Tracked Airdrops at a Glance</h2>
          <div className="not-prose overflow-x-auto my-4">
            <table className="w-full text-sm border border-border/50 rounded-lg">
              <thead className="bg-muted/30 text-xs">
                <tr>
                  <th className="text-left p-2.5 font-semibold">Project</th>
                  <th className="text-left p-2.5 font-semibold">Chain</th>
                  <th className="text-left p-2.5 font-semibold">Status</th>
                  <th className="text-left p-2.5 font-semibold">Est. Value</th>
                  <th className="text-left p-2.5 font-semibold">Difficulty</th>
                  <th className="text-left p-2.5 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {AIRDROPS_DATA.map((a) => (
                  <tr key={a.id} className="border-t border-border/40">
                    <td className="p-2.5 font-medium text-foreground">{a.name} <span className="text-muted-foreground font-mono text-xs">{a.ticker}</span></td>
                    <td className="p-2.5 text-muted-foreground">{a.chains.join(", ")}</td>
                    <td className="p-2.5">{statusEmoji(a)}</td>
                    <td className="p-2.5 font-mono text-xs">{a.estValue}</td>
                    <td className="p-2.5 text-muted-foreground">{a.difficulty}</td>
                    <td className="p-2.5"><Link to={`/airdrops/${a.id}`} className="text-primary hover:underline inline-flex items-center gap-0.5 whitespace-nowrap">Guide <ArrowRight className="w-3 h-3" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-airdrop editorial */}
          {AIRDROPS_DATA.map((a) => (
            <section key={a.id}>
              <h2 className="flex items-baseline gap-2">{a.name} Airdrop <span className="text-sm font-normal text-muted-foreground">({a.ticker})</span></h2>
              <p className="not-prose text-xs text-muted-foreground mb-2">
                {statusEmoji(a)} · {a.chains.join(", ")} · {a.category} · {a.status} · Difficulty: {a.difficulty} · Est. value: <span className="font-mono">{a.estValue}</span> · Risk: {a.riskLevel}
              </p>
              <p>{a.description} {a.aiAnalysis?.split(". ").slice(0, 2).join(". ")}.</p>
              {a.tasks?.length > 0 && (
                <>
                  <p className="font-semibold mb-1">How to qualify:</p>
                  <ul>{a.tasks.slice(0, 6).map((t, i) => <li key={i}>{t}</li>)}</ul>
                </>
              )}
              <p className="not-prose"><Link to={`/airdrops/${a.id}`} className="text-primary font-medium hover:underline inline-flex items-center gap-1">Read the full {a.name} airdrop guide <ArrowRight className="w-3.5 h-3.5" /></Link></p>
            </section>
          ))}

          {/* Live airdrop candidates — tokenless protocols by TVL (DefiLlama) */}
          <h2>Live Airdrop Candidates — Tokenless Protocols by TVL</h2>
          <p>
            Beyond the guides above, the most reliable way to find <em>future</em> airdrops is to track protocols that have
            real usage but <strong>no token yet</strong>. The list below is generated live from <strong>DefiLlama</strong>:
            DeFi protocols with meaningful TVL (and, where available, VC funding) that have not launched a token — the classic
            airdrop-farming setup. "Potential" is a transparent tier from TVL and funding, not a predicted payout.
          </p>
          {candData?.candidates && candData.candidates.length > 0 && (
            <div className="not-prose flex items-center gap-1.5 flex-wrap my-3">
              {candChains.slice(0, 14).map((c) => (
                <button key={c} onClick={() => setCandChain(c)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${candChain === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>{c}</button>
              ))}
            </div>
          )}
          {candLoading ? (
            <p className="not-prose text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading live candidates from DefiLlama…</p>
          ) : candidates.length > 0 ? (
            <div className="not-prose overflow-x-auto my-4">
              <table className="w-full text-sm border border-border/50 rounded-lg">
                <thead className="bg-muted/30 text-xs">
                  <tr>
                    <th className="text-left p-2.5 font-semibold">Protocol</th>
                    <th className="text-left p-2.5 font-semibold">Category</th>
                    <th className="text-left p-2.5 font-semibold hidden sm:table-cell">Chains</th>
                    <th className="text-right p-2.5 font-semibold">TVL</th>
                    <th className="text-left p-2.5 font-semibold hidden md:table-cell">Funding</th>
                    <th className="text-left p-2.5 font-semibold">Potential</th>
                    <th className="text-left p-2.5 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.slug} className="border-t border-border/40">
                      <td className="p-2.5 font-medium text-foreground"><span className="inline-flex items-center gap-2">{c.logo && <img src={c.logo} alt="" className="w-4 h-4 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}{c.name}</span></td>
                      <td className="p-2.5 text-muted-foreground">{c.category}</td>
                      <td className="p-2.5 text-muted-foreground hidden sm:table-cell">{c.chains.slice(0, 3).join(", ")}</td>
                      <td className="p-2.5 text-right font-mono">{fmtTvl(c.tvl)}</td>
                      <td className="p-2.5 text-muted-foreground text-xs hidden md:table-cell">{c.funding ? `$${c.funding.amountM}M${c.funding.round ? ` · ${c.funding.round}` : ""}` : "—"}</td>
                      <td className={`p-2.5 font-semibold ${POTENTIAL_CLS[c.potential] || ""}`}>{c.potential}</td>
                      <td className="p-2.5"><a href={c.defillama} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5 whitespace-nowrap text-xs">Open <ExternalLink className="w-3 h-3" /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="not-prose text-sm text-muted-foreground flex items-center gap-2"><Database className="w-4 h-4" /> Live candidate data is loading or temporarily unavailable. The curated guides above are always available.</p>
          )}
          <p className="not-prose text-[11px] text-muted-foreground/70 mb-2">Source: DefiLlama. A protocol having no token and high TVL does not guarantee an airdrop — many never launch a token. Always verify on official channels.</p>

          {/* Educational long-form */}
          <h2>What Is a Crypto Airdrop?</h2>
          <p>A crypto airdrop is when a blockchain project distributes free tokens to wallet addresses that meet specific criteria. Projects use airdrops to decentralise governance, reward early users and bootstrap a community. Receiving one requires no purchase — only completing the qualifying on-chain activity before the snapshot date. A <strong>snapshot</strong> is the exact block or moment the project records who qualifies; miss it and you miss the airdrop.</p>

          <h2>Base Blockchain Airdrops — Why Base Matters in 2026</h2>
          <p>Base is Coinbase's Ethereum Layer-2, built on the OP Stack. It uses ETH for gas and has no native token, which means Base itself cannot airdrop — but the hundreds of protocols built on it can, and are expected to throughout 2026–2027. Because Base inherits exposure to Coinbase's enormous retail base, Base ecosystem tokens often launch with strong liquidity. Gas is typically under a cent, so it's cheap to interact with many protocols. Bridge ETH via the official bridge at <span className="font-mono">bridge.base.org</span>, then use a diverse set of Base DEXs, lending and infrastructure apps over time.</p>

          <h2>How to Farm Crypto Airdrops Safely</h2>
          <p>Done well, airdrop farming can produce a strong return on time; done poorly it's just gas fees and missed snapshots. The core principles:</p>
          <ul>
            <li><strong>Prioritise genuine usage over mechanical tasks.</strong> Modern programs detect wallets that do the bare minimum and disappear. Deposit, borrow and trade at varying sizes, and return multiple times.</li>
            <li><strong>Diversify across chains and categories.</strong> No single airdrop is guaranteed — spreading activity across Base, Ethereum restaking, Solana DeFi and L2 perps smooths results.</li>
            <li><strong>Avoid Sybil patterns.</strong> Reusing one funding source across many identical wallets is the fastest way to be disqualified. Genuine participants use their primary wallet.</li>
            <li><strong>Track deadlines.</strong> Claim windows are often 90 days or less. Set reminders for every project you qualify for.</li>
            <li><strong>Mind cost-to-qualify.</strong> A protocol with huge TVL and few wallets pays more per wallet than a crowded one. Calculate before farming low-conviction targets.</li>
          </ul>

          <h2>How Are Airdrop Values Estimated?</h2>
          <p>Estimates on this page blend three factors: <strong>comparable precedents</strong> (similar past airdrops and their per-wallet values), <strong>protocol metrics</strong> (TVL, active users, volume, time tokenless) and, where known, <strong>token supply &amp; allocation</strong>. All figures are ranges, not point estimates — the low end assumes minimal activity, the high end assumes early, sustained, multi-action participation. They are estimates, not guarantees.</p>
          <div className="not-prose overflow-x-auto my-4">
            <table className="w-full text-sm border border-border/50 rounded-lg">
              <thead className="bg-muted/30 text-xs"><tr><th className="text-left p-2.5 font-semibold">Difficulty</th><th className="text-left p-2.5 font-semibold">What it means</th></tr></thead>
              <tbody className="text-muted-foreground">
                {[["Easy", "1–5 quick steps, minutes of work, low/no capital"], ["Medium", "Ongoing actions over days or weeks, modest capital"], ["Hard", "Complex multi-step, sustained time and/or capital >$500"]].map(([d, m]) => (
                  <tr key={d} className="border-t border-border/40"><td className="p-2.5 font-medium text-foreground">{d}</td><td className="p-2.5">{m}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Are Crypto Airdrops Taxable?</h2>
          <p>In most jurisdictions, airdropped tokens are treated as ordinary income at fair-market value when received, with a capital gain or loss when you later sell. In the US the IRS generally treats receipt as income; the UK's HMRC treatment is more fact-specific; several EU states differ. This is general information, not tax advice — keep records of receipt dates and values and consult a qualified professional.</p>

          <h2>Largest Crypto Airdrops in History</h2>
          <p>Historical airdrop sizes help calibrate 2026 expectations — the biggest consistently came from protocols with high TVL or volume, strong backing and long tokenless periods.</p>
          <div className="not-prose overflow-x-auto my-4">
            <table className="w-full text-sm border border-border/50 rounded-lg">
              <thead className="bg-muted/30 text-xs"><tr><th className="text-left p-2.5 font-semibold">Project</th><th className="text-left p-2.5 font-semibold">Year</th><th className="text-left p-2.5 font-semibold">Type</th><th className="text-left p-2.5 font-semibold">Notable for</th></tr></thead>
              <tbody className="text-muted-foreground">
                {LARGEST.map((r) => (
                  <tr key={r[0]} className="border-t border-border/40"><td className="p-2.5 font-medium text-foreground">{r[0]}</td><td className="p-2.5">{r[1]}</td><td className="p-2.5">{r[2]}</td><td className="p-2.5">{r[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Frequently Asked Questions</h2>
          {faqs.map((f) => (
            <div key={f.q} className="mb-3">
              <h3 className="mb-1">{f.q}</h3>
              <p className="mt-0">{f.a}</p>
            </div>
          ))}

          <h2>More Free Tools</h2>
          <ul className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
            {[
              { to: "/crypto-factory", label: "Crypto Factory — live market intelligence & events" },
              { to: "/crypto-strength-meter", label: "Crypto Strength Meter — momentum rankings" },
              { to: "/sentiment", label: "Fear & Greed Index — market sentiment" },
              { to: "/compare", label: "Compare Tokens — any token, side by side" },
              { to: "/scanner", label: "Token Scanner — find new tokens" },
              { to: "/dashboard", label: "Dashboard — full analytics hub" },
            ].map((l) => (
              <li key={l.to}><Link to={l.to} className="flex items-center gap-2 text-sm p-2.5 rounded-lg border border-border hover:border-primary/40 hover:text-primary transition-colors group"><span className="truncate">{l.label}</span><ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0" /></Link></li>
            ))}
          </ul>

          <p className="text-[11px] text-muted-foreground/70 mt-6">For research and information only. Crypto airdrops carry risk, including smart-contract risk and scams. Always verify on official project channels and do your own research. Not financial or tax advice.</p>
        </article>
      </div>
    </Layout>
  );
}
