import type { InsightPost } from "@/hooks/useInsights";

// ── Curated, hand-written market-analysis library ────────────────────────────
// Every article is a distinct topic with its own title, structure and content —
// no templated repetition. These are the source for /insights and /insights/<slug>.
const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

export const INSIGHTS_ARTICLES: InsightPost[] = [
  {
    id: "ins-fear-greed-signal",
    slug: "how-to-read-the-crypto-fear-and-greed-index",
    title: "How to Read the Crypto Fear & Greed Index — and When It Lies",
    metaTitle: "Crypto Fear & Greed Index: How to Read It (and When It's Wrong)",
    metaDescription: "The Fear & Greed Index is a contrarian tool, not a crystal ball. How it's built, how to use extremes, and the situations where it misleads traders.",
    category: "Market Analysis",
    readTime: "5 min",
    wordCount: 520,
    publishedAt: "2026-06-08T09:00:00Z",
    imageUrl: IMG("1590283603385-17ffb3a7f29f"),
    primaryKeyword: "crypto fear and greed index",
    secondaryKeywords: ["market sentiment", "contrarian indicator", "bitcoin sentiment"],
    takeaways: [
      "The index is a contrarian gauge: extreme fear often marks bottoms, extreme greed marks tops.",
      "It blends volatility, momentum, volume, social data and BTC dominance into one 0–100 number.",
      "It lags during fast moves and can stay 'greedy' through a sustained bull run.",
      "Use it to size conviction, not to time exact entries.",
    ],
    content: `## What the index actually measures

The Crypto Fear & Greed Index compresses several market signals into a single 0–100 score. The biggest inputs are price **volatility** (sharp drops read as fear), **momentum and volume** relative to recent averages, **social media** activity, **Bitcoin dominance**, and search trends. A reading near 0 is "extreme fear"; near 100 is "extreme greed."

## Why it works as a contrarian tool

Markets are driven by the same crowd that the index measures. When everyone is fearful, most of the selling is already done — so extreme-fear readings have historically clustered near local bottoms. When everyone is euphoric and leveraged long, there are few buyers left to push price higher, and greed extremes often precede pullbacks.

This is the core insight: the index is most useful at its **edges**, not in the middle. A score of 52 tells you almost nothing. A score of 9 or 92 is information.

## When it lies

The index has real blind spots:

- **Strong trends override it.** In a genuine bull market, the index can sit in "greed" for months while price keeps climbing. Selling every greed reading would have taken you out of the best gains.
- **It lags fast crashes.** Because volatility is a lagging input, a violent single-day drop can spike fear *after* the worst is over.
- **It's a market-wide gauge.** It says nothing about a specific altcoin that's rallying or bleeding against the trend.

## How to use it in practice

Treat the index as a **conviction dial**, not a trigger. In extreme fear, lean toward accumulation plans you already believe in; in extreme greed, tighten risk and take partial profits. Combine it with on-chain flows and your own levels — sentiment confirms a setup, it doesn't create one.`,
    faqs: [
      { question: "Is the Fear & Greed Index a good buy signal?", answer: "Extreme fear readings have historically been better contrarian buy zones than greed readings, but the index works best as confirmation alongside price levels and on-chain data — not as a standalone trigger." },
      { question: "What does extreme greed mean?", answer: "Extreme greed (roughly 75–100) means sentiment, momentum and volume are stretched to the upside. It often precedes pullbacks, but in strong bull markets it can persist for a long time." },
      { question: "How often does the index update?", answer: "Most versions update daily. Treat the trend over several days as more meaningful than any single-day reading." },
    ],
  },
  {
    id: "ins-whale-flows",
    slug: "what-whale-movements-tell-you-about-crypto",
    title: "What Whale Movements Really Tell You — and What They Don't",
    metaTitle: "Crypto Whale Movements Explained: Reading On-Chain Flows",
    metaDescription: "Big wallet transfers move headlines, but most are noise. How to separate meaningful whale flows from exchange housekeeping and false signals.",
    category: "On-Chain",
    readTime: "5 min",
    wordCount: 500,
    publishedAt: "2026-06-07T10:00:00Z",
    imageUrl: IMG("1639762681485-074b7f938ba0"),
    primaryKeyword: "crypto whale movements",
    secondaryKeywords: ["on-chain analysis", "exchange flows", "smart money"],
    takeaways: [
      "Direction matters more than size: exchange inflows hint at selling, outflows at accumulation.",
      "Most large transfers are internal exchange or custody moves — not trades.",
      "Sustained net flows beat single transactions as a signal.",
      "Always pair flow data with price and liquidity context.",
    ],
    content: `## The signal hides in direction, not size

A "$200M moved" alert sounds dramatic, but the dollar figure is the least useful part. What matters is **where the coins are going**:

- **Into an exchange** → the holder may be preparing to sell, adding sell-side supply.
- **Out of an exchange** → coins are leaving the order book, often a sign of accumulation or long-term storage.
- **Wallet to wallet** → frequently an OTC deal, a fund rebalancing, or custody housekeeping that has no immediate market impact.

## Why most whale alerts are noise

Exchanges constantly shuffle funds between hot and cold wallets, consolidate addresses, and move client assets. A single huge transfer is usually one of these — not a trade. That's why chasing individual whale alerts is a losing game.

The useful version is **net flow over time**: are exchanges seeing more coins arrive than leave across a day or week? Sustained net outflows tighten available supply (structurally bullish); sustained net inflows do the opposite.

## Smart money vs. anonymous whales

"Smart money" labels — wallets with a strong historical track record — add context a raw whale alert can't. A tracked fund quietly accumulating a token over weeks is a different signal than an unknown address making one large move. But even here, treat it as a clue, not a command: track records can break, and you rarely know the full position or the reason behind a trade.

## Putting it to work

Use on-chain flows to **confirm** a thesis. If a coin is basing on the chart and you also see steady exchange outflows and smart-money accumulation, the picture strengthens. If price is ripping but exchange inflows are climbing, stay cautious — distribution may be underway beneath the rally.`,
    faqs: [
      { question: "Do whale movements predict price?", answer: "Not reliably on their own. Sustained net exchange flows are a useful supply signal, but single transfers are mostly noise. Combine flows with price and liquidity." },
      { question: "What is an exchange inflow?", answer: "Crypto moving from private wallets into exchange wallets. Large, sustained inflows can indicate intent to sell and added sell-side pressure." },
      { question: "What is smart money in crypto?", answer: "A curated set of wallets with a strong historical record of profitable positioning. Their accumulation can be a clue, but it's not a guarantee." },
    ],
  },
  {
    id: "ins-etf-structure",
    slug: "how-spot-bitcoin-etfs-changed-crypto-market-structure",
    title: "How Spot Bitcoin ETFs Rewired Crypto Market Structure",
    metaTitle: "Spot Bitcoin ETFs: How They Changed Crypto Market Structure",
    metaDescription: "Spot BTC ETFs brought a new class of buyer and a daily flow signal traders now watch. What changed, and why ETF flows matter for price.",
    category: "Bitcoin & ETH",
    readTime: "5 min",
    wordCount: 510,
    publishedAt: "2026-06-06T11:00:00Z",
    imageUrl: IMG("1518546305927-5a555bb7020d"),
    primaryKeyword: "spot bitcoin etf",
    secondaryKeywords: ["btc etf flows", "institutional crypto", "bitcoin market structure"],
    takeaways: [
      "ETFs opened Bitcoin to advisors and institutions who can't hold coins directly.",
      "Daily net ETF flows became a closely-watched demand signal.",
      "Authorized participants link ETF demand to real spot buying.",
      "Flows amplify trends in both directions, not just up.",
    ],
    content: `## A new buyer, a new pipe

Before spot ETFs, large pools of regulated capital — financial advisors, pensions, many institutions — had no clean way to own Bitcoin. A spot ETF wraps BTC in a familiar brokerage product, so that capital can now allocate with a single ticker. That structurally widened the buyer base.

## Why ETF flows became a daily signal

Spot ETFs publish their holdings, so the market can see **net creations and redemptions** every day. Persistent net inflows mean the funds are buying spot Bitcoin to back new shares; net outflows mean the opposite. Traders now watch these numbers the way equities traders watch fund flows — as a real-time read on institutional demand.

The mechanism matters: when an ETF sees inflows, **authorized participants** deliver Bitcoin to the fund, which usually requires buying it on the spot market. That ties paper demand to actual coin demand, removing some of the "synthetic" disconnect that derivatives created in past cycles.

## It cuts both ways

ETFs are often framed as pure tailwind, but they also add a **reflexive** force. In risk-off periods, redemptions force selling into a falling market, deepening drawdowns. The same plumbing that accelerates rallies can accelerate declines.

## What to actually track

Three things give you most of the value:

1. **Cumulative net flows** — the long-run accumulation trend.
2. **Flow acceleration** — a sudden swing from inflows to outflows can lead price.
3. **Concentration** — flows dominated by one or two funds are less broad-based than they look.

Used together, ETF flows are one of the cleaner institutional-demand signals the crypto market has ever had — but like any single input, they're context, not gospel.`,
    faqs: [
      { question: "Why do Bitcoin ETF flows matter?", answer: "Because creating ETF shares typically requires buying real spot Bitcoin, net inflows translate into actual demand. Daily flow data gives a transparent read on institutional appetite." },
      { question: "Are ETFs only bullish for Bitcoin?", answer: "No. The same mechanism that drives buying on inflows forces selling on redemptions, which can amplify downturns." },
      { question: "Where does the ETF's Bitcoin come from?", answer: "Authorized participants source it on the open market to back new shares, linking ETF demand to spot demand." },
    ],
  },
  {
    id: "ins-stablecoin-flows",
    slug: "stablecoin-flows-as-a-crypto-market-signal",
    title: "Stablecoin Flows: The Dry Powder Signal Most Traders Miss",
    metaTitle: "Stablecoin Flows as a Crypto Market Signal",
    metaDescription: "Stablecoin supply and exchange balances are a proxy for buying power. How minting, redemptions and exchange reserves hint at the next move.",
    category: "On-Chain",
    readTime: "4 min",
    wordCount: 470,
    publishedAt: "2026-06-05T09:30:00Z",
    imageUrl: IMG("1621501103258-8d0d47b43f7b"),
    primaryKeyword: "stablecoin flows",
    secondaryKeywords: ["usdt supply", "dry powder crypto", "exchange reserves"],
    takeaways: [
      "Growing stablecoin supply = more sidelined buying power entering the system.",
      "Stablecoins flowing onto exchanges often precede buying.",
      "Redemptions (shrinking supply) can signal capital leaving crypto.",
      "It's a medium-term signal, not an intraday trigger.",
    ],
    content: `## Stablecoins are the market's cash balance

Most crypto trading is priced against stablecoins like USDT and USDC. That makes the total stablecoin supply a rough proxy for the **cash available to buy crypto** — the dry powder sitting on the sidelines.

When issuers **mint** new stablecoins, fresh dollars are entering the ecosystem, usually because demand to deploy capital is rising. When they **redeem** (burn) stablecoins, dollars are leaving — often a sign of de-risking.

## Where the coins sit matters too

Beyond total supply, watch **exchange stablecoin reserves**. A build-up of stablecoins on exchanges means traders have parked buying power where they can deploy it quickly — historically a precursor to spot buying. Falling exchange stablecoin balances can mean capital is moving to cold storage or out of the market entirely.

## A real-world read

Pair the two signals:

- **Rising total supply + rising exchange reserves** → buying power is growing and getting positioned. Constructive backdrop.
- **Shrinking supply + falling reserves** → capital is exiting. A headwind for sustained rallies.

## Limitations

Stablecoin data is medium-term context, not a day-trading tool. Supply can grow for reasons unrelated to imminent buying (yield strategies, payments, off-ramping flows in other regions). And a single issuer's mint can distort the picture. Use it to understand the **tide**, then time your entries with price and on-chain confirmation.`,
    faqs: [
      { question: "Why does stablecoin supply matter?", answer: "It approximates the cash available to buy crypto. Growing supply means more sidelined buying power; shrinking supply can mean capital is leaving the market." },
      { question: "What are exchange stablecoin reserves?", answer: "The amount of stablecoins held in exchange wallets — a proxy for buying power positioned to deploy quickly." },
      { question: "Is stablecoin data a short-term signal?", answer: "No, it's better as medium-term context for the overall liquidity backdrop rather than an intraday trigger." },
    ],
  },
  {
    id: "ins-market-cycles",
    slug: "crypto-market-cycles-and-the-four-year-theory",
    title: "Crypto Market Cycles and the Four-Year Theory, Stress-Tested",
    metaTitle: "Crypto Market Cycles: The Four-Year Theory Explained",
    metaDescription: "The halving-driven four-year cycle shaped past bull runs. Why it exists, where it's weakening, and how to use cycle thinking without over-trusting it.",
    category: "Market Analysis",
    readTime: "6 min",
    wordCount: 560,
    publishedAt: "2026-06-04T08:00:00Z",
    imageUrl: IMG("1526304640581-d334cdbbf45e"),
    primaryKeyword: "crypto market cycles",
    secondaryKeywords: ["bitcoin halving", "four year cycle", "bull market"],
    takeaways: [
      "The classic cycle ties to Bitcoin's four-year halving supply shock.",
      "Each cycle has shown diminishing percentage returns.",
      "ETFs and institutions may be reshaping the old rhythm.",
      "Use cycles as a framework, not a calendar.",
    ],
    content: `## Where the four-year idea comes from

Bitcoin's issuance halves roughly every four years. Each halving cuts the new supply hitting the market in half, and historically those events preceded major bull runs 12–18 months later, followed by deep bear markets. That rhythm produced the popular "four-year cycle" model.

## The pattern that actually repeated

More reliable than precise timing is the **shape**: long accumulation → halving → expansion → euphoric blow-off → multi-quarter bear → accumulation again. Sentiment swings from disbelief to greed to capitulation each lap, which is why cycle-aware traders try to be greedy in despair and cautious in euphoria.

## Why each cycle looks smaller

A clear trend across cycles is **diminishing returns**. Bitcoin's market cap is now enormous, so the same percentage gain requires far more capital. Each bull run has delivered a smaller multiple than the last. Expecting a literal repeat of early-cycle returns is the most common cycle mistake.

## What's changing the rhythm

The four-year model assumes Bitcoin's supply shock is the dominant driver. That's getting diluted by:

- **Spot ETFs** introducing flows tied to macro and advisor allocation, not halvings.
- **Macro conditions** (rates, liquidity) increasingly steering risk assets, crypto included.
- A larger, more institutional market that's harder to move with retail-driven mania alone.

## How to use cycle thinking

Treat the cycle as a **mental map of where sentiment probably is**, not a dated schedule. Ask: are we in disbelief, optimism, euphoria, or capitulation? Position risk accordingly — scale out into euphoria, accumulate through despair — while letting price, liquidity and macro confirm. The cycle frames the odds; it doesn't set the dates.`,
    faqs: [
      { question: "Is the four-year crypto cycle still valid?", answer: "The halving still matters, but ETFs, macro liquidity and a larger market are diluting its dominance. Use the cycle as a framework, not a precise calendar." },
      { question: "Why are cycle returns shrinking?", answer: "As Bitcoin's market cap grows, each percentage gain requires far more capital, so each cycle has historically delivered a smaller multiple than the last." },
      { question: "How do I use market cycles in trading?", answer: "Gauge where sentiment likely sits — disbelief, optimism, euphoria or capitulation — and manage risk accordingly, confirming with price and macro." },
    ],
  },
  {
    id: "ins-funding-oi",
    slug: "funding-rates-and-open-interest-explained",
    title: "Funding Rates and Open Interest: Reading the Leverage Beneath Price",
    metaTitle: "Funding Rates & Open Interest: Reading Crypto Derivatives",
    metaDescription: "Perpetual funding and open interest reveal how crowded and leveraged a move is. How to spot overheated longs, squeezes and healthier trends.",
    category: "Market Analysis",
    readTime: "5 min",
    wordCount: 530,
    publishedAt: "2026-06-03T10:30:00Z",
    imageUrl: IMG("1642790106117-e829e14a795f"),
    primaryKeyword: "funding rates crypto",
    secondaryKeywords: ["open interest", "perpetual futures", "liquidation cascade"],
    takeaways: [
      "Positive funding = longs pay shorts; persistently high funding flags crowded longs.",
      "Rising open interest with rising price can confirm a trend — or set up a squeeze.",
      "OI rising while price stalls often precedes a violent move.",
      "Funding resets after liquidations, frequently near local turning points.",
    ],
    content: `## Two gauges of the leverage layer

Spot price tells you *what* happened. **Funding rates** and **open interest (OI)** tell you *how* it happened — how leveraged and crowded the move is.

**Funding** is the periodic payment between perpetual futures longs and shorts that keeps the perp tethered to spot. When funding is positive, longs pay shorts — demand to be long is high. When negative, shorts pay longs.

**Open interest** is the total value of outstanding futures contracts — a measure of how much leverage is in the system.

## Reading the combinations

The signal comes from combining them with price:

- **Price up + OI up + funding rising** → a leveraged uptrend. Healthy at first, but persistently high funding means longs are crowded and vulnerable to a long squeeze.
- **Price flat + OI rising sharply** → leverage is building without resolution. These coiled setups often break violently.
- **Price down + OI falling + funding flipping negative** → longs are being flushed; capitulation in leverage often clusters near local bottoms.

## Liquidation cascades

When too many traders crowd one side, a move against them triggers forced liquidations, which push price further, triggering more liquidations — a cascade. These are why crypto can drop 10% in minutes on no news. Extreme funding plus high OI is the fuel; a small spark sets it off.

## Practical use

Use funding and OI to judge **how much conviction to give a move**. A breakout on flat OI and neutral funding is healthier than one driven by stretched, over-leveraged longs that can unwind in seconds. After a big liquidation event resets funding toward neutral, the immediate risk of a cascade in that direction usually drops.`,
    faqs: [
      { question: "What does a high funding rate mean?", answer: "Persistently high positive funding means longs are crowded and paying to stay long — a setup that's vulnerable to a long squeeze if price turns." },
      { question: "What does rising open interest tell you?", answer: "More leverage is entering the market. With rising price it can confirm a trend; with flat price it often precedes a violent move in either direction." },
      { question: "What causes liquidation cascades?", answer: "Over-crowded leveraged positions: a move against them forces liquidations that push price further, triggering more liquidations in a chain reaction." },
    ],
  },
  {
    id: "ins-tokenomics-unlocks",
    slug: "tokenomics-supply-unlocks-and-emissions",
    title: "Tokenomics in Practice: How Supply, Unlocks and Emissions Move Price",
    metaTitle: "Tokenomics: How Supply, Unlocks & Emissions Affect Price",
    metaDescription: "FDV, circulating supply, vesting unlocks and emissions decide a token's real sell pressure. How to read tokenomics before you buy.",
    category: "Altcoins",
    readTime: "6 min",
    wordCount: 560,
    publishedAt: "2026-06-02T09:00:00Z",
    imageUrl: IMG("1621761191319-c6fb62004040"),
    primaryKeyword: "crypto tokenomics",
    secondaryKeywords: ["token unlocks", "fdv vs market cap", "emissions"],
    takeaways: [
      "Low float + high FDV often means heavy future sell pressure.",
      "Vesting unlocks add supply on a known schedule — size relative to float is what matters.",
      "Emissions can quietly dilute holders faster than demand grows.",
      "Always compare market cap to fully diluted valuation.",
    ],
    content: `## Price is supply and demand — tokenomics is the supply side

A token can have a great product and still bleed if its **supply schedule** overwhelms demand. Reading tokenomics is how you avoid buying a chart that's structurally fighting gravity.

## Market cap vs. FDV

**Market cap** values only the circulating supply. **Fully diluted valuation (FDV)** values the entire eventual supply. When FDV is many multiples of market cap, a large share of tokens is still locked and will enter circulation later. A token "cheap" by market cap can be expensive by FDV — and that gap is future sell pressure.

## Unlocks: the scheduled supply shock

Most projects allocate tokens to team and investors with **vesting** — a lock-up that releases over time. When a cliff or tranche unlocks, those tokens become sellable, often by holders with a cost basis far below market. What matters isn't the headline dollar figure but the unlock's **size relative to circulating supply**: a 2% unlock is noise, a 15% unlock is a genuine shock. Team and investor unlocks carry more sell risk than ecosystem or community unlocks.

## Emissions: the slow leak

Many DeFi and infrastructure tokens emit new supply continuously to reward liquidity providers or stakers. If emissions outpace organic demand, holders are quietly diluted even when the price chart looks flat. High advertised APYs are frequently funded by exactly this dilution.

## A checklist before buying

1. **Compare market cap to FDV** — how much supply is still to come?
2. **Map the unlock schedule** — when, how big relative to float, and to whom?
3. **Check emissions** — is new supply growing faster than usage?
4. **Ask who benefits** — are insiders the main near-term sellers?

Tokenomics won't tell you a token will go up. But it will frequently tell you when one is set up to go down.`,
    faqs: [
      { question: "What is the difference between market cap and FDV?", answer: "Market cap values only circulating tokens; FDV values the entire future supply. A large gap means lots of tokens are still locked and represent future sell pressure." },
      { question: "Why do token unlocks affect price?", answer: "Unlocks release previously locked tokens to insiders with low cost bases, adding sell-side supply. The size relative to circulating supply determines the impact." },
      { question: "Are high-APY tokens risky?", answer: "Often, yes. High yields are frequently funded by emitting new tokens, which dilutes holders faster than demand grows." },
    ],
  },
  {
    id: "ins-btc-dominance",
    slug: "bitcoin-dominance-and-what-it-signals-for-altcoins",
    title: "Bitcoin Dominance: What It Signals for Altcoins",
    metaTitle: "Bitcoin Dominance Explained: What It Means for Altcoins",
    metaDescription: "BTC dominance tracks Bitcoin's share of the crypto market. How rising and falling dominance map to altcoin seasons — and the traps in the chart.",
    category: "Market Analysis",
    readTime: "5 min",
    wordCount: 500,
    publishedAt: "2026-06-01T10:00:00Z",
    imageUrl: IMG("1460925895917-afdab827c52f"),
    primaryKeyword: "bitcoin dominance",
    secondaryKeywords: ["altcoin season", "btc dominance chart", "capital rotation"],
    takeaways: [
      "Dominance = Bitcoin's share of total crypto market cap.",
      "Falling dominance in an uptrend often means altcoins are outperforming.",
      "Rising dominance can mean a flight to safety within crypto.",
      "Stablecoins distort the simple version of the metric.",
    ],
    content: `## What dominance measures

Bitcoin dominance is Bitcoin's market cap divided by the total crypto market cap. At a high level it tells you how much of crypto's value sits in Bitcoin versus everything else.

## Mapping dominance to altcoin behavior

The metric is most useful alongside the overall market direction:

- **Total market up + dominance falling** → capital is rotating from Bitcoin into altcoins. This is the classic "altcoin season" backdrop.
- **Total market up + dominance rising** → Bitcoin is leading; altcoins lag. Common early in a bull run.
- **Total market down + dominance rising** → a flight to relative safety; traders rotate out of altcoins back into Bitcoin.
- **Total market down + dominance falling** → rare and usually unstable.

## The traps in the chart

Dominance is noisier than it looks:

- **Stablecoins** are counted in "total market cap" in the common version, so a wave of stablecoin minting can move dominance without any rotation between coins.
- **A few mega-caps** (like Ethereum) swing the "altcoin" side, so dominance can move on ETH alone rather than broad altcoin strength.
- It's a **ratio**, so it can fall simply because Bitcoin drops, not because alts are winning.

## Using it well

Read dominance **with** the total-market trend and the Altcoin Season Index, not in isolation. The combination — where is total cap going, and is Bitcoin's share rising or falling — tells you whether to favor Bitcoin or to lean into altcoins. The dominance line alone can mislead.`,
    faqs: [
      { question: "What is Bitcoin dominance?", answer: "Bitcoin's market capitalization as a percentage of the total crypto market cap — a gauge of how much value sits in BTC versus all other coins." },
      { question: "Does falling dominance mean altcoin season?", answer: "Often, when it falls during a rising total market it signals capital rotating into altcoins. But check the total-market trend, since dominance can fall simply because Bitcoin drops." },
      { question: "Do stablecoins affect dominance?", answer: "Yes. Stablecoins are usually included in total market cap, so heavy minting can shift the dominance reading without any real rotation between coins." },
    ],
  },
  {
    id: "ins-narrative-rotation",
    slug: "narrative-rotation-how-capital-moves-in-crypto",
    title: "Narrative Rotation: How Capital Moves Between Crypto Sectors",
    metaTitle: "Crypto Narrative Rotation: How Capital Moves Between Sectors",
    metaDescription: "AI, RWA, DePIN, memecoins — crypto money chases narratives in waves. How rotation works, how to spot the next one early, and how to avoid the top.",
    category: "Altcoins",
    readTime: "5 min",
    wordCount: 510,
    publishedAt: "2026-05-30T09:30:00Z",
    imageUrl: IMG("1611974789855-9c2a0a7236a3"),
    primaryKeyword: "crypto narratives",
    secondaryKeywords: ["sector rotation", "ai tokens", "depin rwa"],
    takeaways: [
      "Capital concentrates into one hot theme, then rotates to the next.",
      "Early narratives are the most profitable and most volatile.",
      "Leaders run first; laggards and lower-caps follow late.",
      "When a narrative hits mainstream headlines, the easy money is usually gone.",
    ],
    content: `## Crypto trades in stories

In any given quarter, a handful of **narratives** dominate attention and capital — the AI-token wave, real-world assets (RWA), DePIN, restaking, a memecoin supercycle, a new Layer-1. Money doesn't spread evenly; it concentrates into the current story, then rotates to the next.

## The anatomy of a rotation

A narrative typically moves through stages:

1. **Emerging** — a few early projects, low attention, the highest risk and reward.
2. **Hot** — mentions accelerate, capital floods in, the sector's leaders go vertical.
3. **Broadening** — money chases laggards and lower-quality copies of the leaders.
4. **Cooling/Fading** — attention moves on; latecomers are left holding the top.

The tell that a rotation is **late** is when the narrative reaches mainstream, non-crypto headlines. By then the leaders have already made their move and capital is hunting the next theme.

## Spotting the next one early

You don't need to predict perfectly — you need to notice **acceleration** before the crowd. Watch for: a cluster of new launches around a theme, rising cross-source mentions, on-chain capital rotating into the sector's tokens, and developer activity. A new narrative with strong momentum and few weeks of age is usually in its most profitable phase.

## Managing the risk

Rotations are violent. Position into strength early, take profits into the broadening phase rather than waiting for the obvious top, and don't marry a narrative — the same capital that lifted it will leave for the next story. Tools that track narrative momentum and on-chain rotation turn this from gut feel into something you can actually monitor.`,
    faqs: [
      { question: "What is a crypto narrative?", answer: "A dominant theme — like AI tokens, RWA or memecoins — that concentrates attention and capital for a period before money rotates to the next one." },
      { question: "How do I find the next narrative early?", answer: "Watch for acceleration: clusters of new launches, rising cross-source mentions, on-chain capital rotating into the sector, and growing developer activity — before mainstream headlines arrive." },
      { question: "When is a narrative too late to enter?", answer: "Usually once it reaches mainstream, non-crypto headlines — by then leaders have already run and capital is rotating elsewhere." },
    ],
  },
  {
    id: "ins-memecoin-mechanics",
    slug: "the-mechanics-behind-memecoin-mania",
    title: "The Mechanics Behind Memecoin Mania",
    metaTitle: "How Memecoins Work: The Mechanics Behind the Mania",
    metaDescription: "Memecoins look like pure chaos, but they follow repeatable mechanics — liquidity, attention, and reflexivity. How they pump, dump, and what to watch.",
    category: "Altcoins",
    readTime: "5 min",
    wordCount: 500,
    publishedAt: "2026-05-28T10:00:00Z",
    imageUrl: IMG("1640340434855-6084b1f4901c"),
    primaryKeyword: "memecoins explained",
    secondaryKeywords: ["solana memecoins", "liquidity", "reflexivity crypto"],
    takeaways: [
      "Memecoins price attention, not cash flows.",
      "Thin liquidity makes them move violently both ways.",
      "Reflexivity: price rises attract attention, which raises price — until it reverses.",
      "Most return to near zero; survivors are rare.",
    ],
    content: `## What you're actually buying

A memecoin has no cash flows, no protocol revenue, often no roadmap. What it has is **attention**. The token is a vehicle for a community's focus, and its price is essentially the market value of that attention at a moment in time. That's why fundamentals analysis mostly doesn't apply — and why it's so easy to lose money treating them like real projects.

## Liquidity is the whole game

Most memecoins launch with **thin liquidity**. That means small amounts of buying or selling move price enormously — great on the way up, brutal on the way down. Before touching one, traders check the liquidity pool depth, whether liquidity is locked, and how concentrated the holder base is. A token where a handful of wallets hold most of the supply is one sell order away from collapse.

## Reflexivity: the engine and the trap

Memecoins run on **reflexivity**: rising price attracts attention and new buyers, whose buying pushes price higher, attracting more attention. This loop can produce absurd gains fast. But it runs in reverse just as hard — once momentum stalls, attention fades, holders sell, and the same loop accelerates downward. There's rarely a "fair value" to catch the fall.

## The honest base rate

The vast majority of memecoins trend toward zero after their initial spike. A tiny number build durable communities and survive. Position sizing is everything: treat any memecoin as a high-variance bet, use money you can fully lose, take profits aggressively on the way up, and never assume "this one's different." The mechanics — attention, thin liquidity, reflexivity — are the same every cycle.`,
    faqs: [
      { question: "Why are memecoins so volatile?", answer: "They have thin liquidity and no fundamentals, so small trades move price sharply, and they run on reflexive attention loops that reverse violently." },
      { question: "What should I check before buying a memecoin?", answer: "Liquidity depth and whether it's locked, holder concentration, and the strength of the community/attention driving it. Then size it as a high-variance bet." },
      { question: "Do most memecoins go to zero?", answer: "The large majority trend toward zero after their initial spike. A small minority build durable communities and survive." },
    ],
  },
  {
    id: "ins-restaking",
    slug: "restaking-and-the-yield-narrative-explained",
    title: "Restaking Explained: The Yield Narrative and Its Real Risks",
    metaTitle: "Restaking & EigenLayer: The Yield Narrative Explained",
    metaDescription: "Restaking lets staked ETH secure extra services for extra yield — and extra risk. How it works, why TVL exploded, and the slashing trade-off.",
    category: "DeFi",
    readTime: "5 min",
    wordCount: 510,
    publishedAt: "2026-05-26T09:00:00Z",
    imageUrl: IMG("1622630998477-20aa696ecb05"),
    primaryKeyword: "restaking crypto",
    secondaryKeywords: ["eigenlayer", "liquid restaking", "staking yield"],
    takeaways: [
      "Restaking reuses staked ETH to secure additional services for extra yield.",
      "It drove a huge TVL and airdrop-farming wave.",
      "Extra yield comes with extra slashing and smart-contract risk.",
      "Liquid restaking tokens add another layer of dependency.",
    ],
    content: `## The core idea

When you stake ETH, you secure Ethereum and earn a base yield. **Restaking** lets that same staked ETH simultaneously secure *additional* services — oracles, bridges, data-availability layers — in exchange for additional rewards. EigenLayer popularized the model: stakers opt in to back extra "actively validated services" and get paid more for taking on more responsibility.

## Why TVL exploded

Two forces drove the wave. First, **yield**: in a market hungry for sustainable returns, stacking rewards on already-staked ETH was compelling. Second, **airdrop farming**: restaking protocols and the services built on them dangled future tokens, so users rushed to deposit early to qualify. Liquid restaking tokens (LRTs) let people keep their position liquid while farming, accelerating inflows further.

## The risk nobody should skip

Extra yield is compensation for extra risk, and restaking stacks several:

- **Slashing risk multiplies.** Your ETH now backs multiple services; a fault in any of them can put your capital at risk.
- **Smart-contract risk compounds.** You're exposed to the restaking protocol *and* every service it secures *and*, with LRTs, the wrapper on top.
- **De-peg risk for LRTs.** A liquid restaking token can trade below the value of its underlying during stress, especially with leverage in the system.

## How to think about it

Restaking is a genuine primitive, not just a farm — but the marketing often emphasizes yield and downplays correlated risk. Size positions for the worst case, understand exactly which services your stake is backing, and treat eye-catching APYs as a signal to ask *where the risk is hiding*, not just where the reward is.`,
    faqs: [
      { question: "What is restaking?", answer: "Reusing already-staked ETH to also secure additional services (via protocols like EigenLayer) in exchange for extra yield — at the cost of extra risk." },
      { question: "Why did restaking TVL grow so fast?", answer: "A mix of attractive stacked yield and aggressive airdrop farming, amplified by liquid restaking tokens that kept positions liquid while farming." },
      { question: "What are the risks of restaking?", answer: "Multiplied slashing exposure, compounded smart-contract risk across every service your stake secures, and de-peg risk for liquid restaking tokens." },
    ],
  },
  {
    id: "ins-rwa",
    slug: "real-world-assets-bringing-tradfi-on-chain",
    title: "Real-World Assets: Bringing TradFi On-Chain",
    metaTitle: "Real-World Assets (RWA): Bringing TradFi On-Chain",
    metaDescription: "Tokenized treasuries, credit and commodities are pulling traditional finance on-chain. What RWA actually means, why institutions care, and the catch.",
    category: "DeFi",
    readTime: "5 min",
    wordCount: 500,
    publishedAt: "2026-05-24T10:00:00Z",
    imageUrl: IMG("1642751227050-feb02d648136"),
    primaryKeyword: "real world assets crypto",
    secondaryKeywords: ["tokenized treasuries", "rwa tokens", "tokenization"],
    takeaways: [
      "RWA = traditional assets (treasuries, credit, real estate) tokenized on-chain.",
      "Tokenized treasuries brought real, T-bill-backed yield to DeFi.",
      "It's the clearest bridge between institutions and crypto rails.",
      "Off-chain enforcement and custody are the weak points.",
    ],
    content: `## What RWA means

Real-World Assets refers to tokenizing off-chain value — U.S. Treasuries, private credit, real estate, commodities — so it can live and move on a blockchain. A tokenized T-bill, for example, is an on-chain token that represents a claim on a real government bond held by a regulated custodian.

## Why it became a major narrative

For years, DeFi yields came from emissions and leverage — unsustainable and reflexive. **Tokenized treasuries** changed that by importing a real, external yield: the T-bill rate. Suddenly protocols and treasuries could hold an on-chain asset paying genuine, dollar-backed yield, attracting conservative capital that never wanted token-emission farms.

It's also the most credible **institutional bridge**. Asset managers can issue and settle tokenized funds on the same rails as crypto, blurring the line between TradFi and DeFi.

## The catch: on-chain token, off-chain reality

RWAs reintroduce the exact thing crypto tried to remove — **trusted intermediaries**. The token is only as good as:

- the **custodian** actually holding the underlying asset,
- the **legal structure** that lets you enforce your claim, and
- the **issuer's** solvency and compliance.

If the off-chain leg fails, the on-chain token is just a number. That's a different risk profile than a purely on-chain protocol, and it's why diligence on RWA is more legal than technical.

## How to evaluate an RWA play

Ask who holds the asset, under what jurisdiction, with what audits and redemption rights — then judge the yield against that real-world risk, not against crypto-native farms. Done well, RWA is one of the most durable narratives in the space; done carelessly, it's counterparty risk wearing a DeFi badge.`,
    faqs: [
      { question: "What are real-world assets in crypto?", answer: "Traditional off-chain assets — like Treasuries, private credit or real estate — tokenized so they can be held and traded on a blockchain." },
      { question: "Why are tokenized treasuries popular?", answer: "They bring a real, externally-funded yield (the T-bill rate) on-chain, unlike emission-based DeFi yields, attracting more conservative capital." },
      { question: "What's the main risk of RWA tokens?", answer: "They depend on off-chain custodians, legal enforceability and issuer solvency. If the real-world leg fails, the on-chain token can't enforce the claim." },
    ],
  },
  {
    id: "ins-rug-pulls",
    slug: "how-to-spot-a-crypto-rug-pull-before-you-buy",
    title: "How to Spot a Crypto Rug Pull Before You Buy",
    metaTitle: "How to Spot a Crypto Rug Pull Before You Buy",
    metaDescription: "Rug pulls follow patterns: unlocked liquidity, mintable supply, concentrated holders, anonymous teams. A practical checklist to screen tokens for scams.",
    category: "Security",
    readTime: "5 min",
    wordCount: 520,
    publishedAt: "2026-05-22T09:30:00Z",
    imageUrl: IMG("1589829545856-d10d557cf95f"),
    primaryKeyword: "crypto rug pull",
    secondaryKeywords: ["crypto scams", "liquidity lock", "honeypot token"],
    takeaways: [
      "Unlocked or removable liquidity is the biggest red flag.",
      "Mint functions and hidden owner privileges let teams print or freeze tokens.",
      "Concentrated holders can dump the entire float at once.",
      "If you can buy but can't sell, it's a honeypot.",
    ],
    content: `## A rug pull is an exit, not a failure

A rug pull is when a token's creators deliberately drain value and disappear — by pulling liquidity, dumping a hidden allocation, or coding the contract so buyers can never sell. Unlike a project that simply fails, a rug is designed to steal from the start. The good news: most leave detectable fingerprints.

## The pre-buy checklist

**1. Liquidity — is it locked?** If the team can withdraw the trading liquidity at will, they can pull it the moment buyers pile in. Look for liquidity locked in a reputable locker for a meaningful period.

**2. Contract privileges.** Check whether the contract has a **mint function** (team can print unlimited tokens), a way to **pause or blacklist** transfers, or hidden owner controls. Renounced ownership or a transparent multisig is far safer than a single anonymous deployer with god-mode.

**3. Holder concentration.** If a few wallets (excluding the locked liquidity and known burns) hold most of the supply, they can crash the token in one transaction.

**4. The honeypot test.** Some contracts let you **buy but not sell**. Token screeners and a tiny test sell can reveal this before you commit real size.

**5. Team and history.** Anonymous teams aren't automatically scams, but combined with the above flags they raise the odds. Recycled code, fake audits, and bought engagement are warning signs.

## The mindset that protects you

Scammers engineer **urgency** — limited time, guaranteed gains, "you'll miss it." Real opportunities survive a few hours of diligence. Run the checklist, use a contract scanner, and if anything fails, walk away. The token you skip because it failed the liquidity check is worth more than the one that rugs you.`,
    faqs: [
      { question: "What is a rug pull?", answer: "When a token's creators deliberately drain value and vanish — by pulling liquidity, dumping hidden allocations, or coding the contract so buyers can't sell." },
      { question: "What's the biggest rug-pull red flag?", answer: "Unlocked or removable trading liquidity, which lets the team pull it the moment buyers arrive. Locked liquidity in a reputable locker is much safer." },
      { question: "What is a honeypot token?", answer: "A contract that lets you buy but blocks selling, trapping your funds. A small test sell or a token screener can reveal it before you commit." },
    ],
  },
  {
    id: "ins-dca-vs-lump",
    slug: "dollar-cost-averaging-vs-lump-sum-in-volatile-markets",
    title: "Dollar-Cost Averaging vs Lump Sum in Volatile Markets",
    metaTitle: "DCA vs Lump Sum Investing in Crypto: Which Wins?",
    metaDescription: "Lump sum usually wins on average; DCA wins on discipline and drawdowns. How to choose between them for crypto based on volatility and behavior.",
    category: "Market Analysis",
    readTime: "5 min",
    wordCount: 500,
    publishedAt: "2026-05-20T10:00:00Z",
    imageUrl: IMG("1579532537598-459ecdaf39cc"),
    primaryKeyword: "dollar cost averaging crypto",
    secondaryKeywords: ["dca vs lump sum", "crypto investing strategy", "risk management"],
    takeaways: [
      "On average, lump sum beats DCA because markets trend up over time.",
      "DCA reduces the pain and risk of buying right before a crash.",
      "Crypto's volatility makes DCA's behavioral edge larger.",
      "The best plan is the one you'll actually stick to.",
    ],
    content: `## Two ways to deploy capital

If you have a sum to invest, you can deploy it **all at once** (lump sum) or **spread it over time** (dollar-cost averaging). The debate is older than crypto, but crypto's volatility makes the trade-offs sharper.

## What the math says

Because markets trend upward over long horizons, **time in the market** usually beats timing. Studies across asset classes find lump sum outperforms DCA the majority of the time, simply because, on average, you're invested sooner during an uptrend. DCA, by design, keeps part of your capital uninvested while you average in — a drag when prices rise.

## What the math leaves out

The average hides the **distribution of outcomes**. DCA's real value is in the bad scenarios: if you lump-sum right before a 70% crypto drawdown, you sit on a deep loss and may panic-sell at the bottom. DCA spreads your cost basis, softens that worst case, and — crucially — makes it psychologically easier to keep buying through fear. In an asset that routinely halves, that behavioral edge is not small.

## Choosing for yourself

Ask two questions:

1. **Can you stomach the worst case?** If a 60–70% drawdown right after deploying would make you sell, DCA's smoother path is worth the small expected-return cost.
2. **Is the capital already yours to invest?** Sitting in cash "waiting for the dip" is its own bet — and a frequently losing one.

A common middle path: deploy a base allocation now and DCA the rest on a fixed schedule, ignoring price. The optimal strategy on a spreadsheet is worthless if you abandon it in a panic; the best plan is the one you'll actually follow.`,
    faqs: [
      { question: "Is lump sum better than DCA for crypto?", answer: "On average lump sum wins because markets trend up, but DCA reduces the risk and emotional pain of buying right before a large drawdown — valuable given crypto's volatility." },
      { question: "When should I use DCA?", answer: "When a large drawdown right after investing would tempt you to panic-sell, or when you want a disciplined schedule that removes timing decisions." },
      { question: "Can I combine the two?", answer: "Yes — a common approach is to deploy a base allocation immediately and DCA the remainder on a fixed schedule regardless of price." },
    ],
  },
];

export const INSIGHTS_SLUGS = INSIGHTS_ARTICLES.map((a) => a.slug);
