// Hand-authored /learn articles to fill the educational corpus. Each entry is a
// distinct, substantive explainer (not templated) for a high-search-volume topic
// that the /learn hub and sitemap already link to. Run with:
//   node scripts/add-learn-articles.mjs
// It merges NEW slugs into public/data/educational-articles.json (idempotent —
// existing slugs are never overwritten) and reports the final count.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, '..', 'public', 'data', 'educational-articles.json');

const L = (text, url) => ({ text, url });

// Each article: slug, title, metaTitle, metaDescription, category, readTime,
// primaryKeyword, secondaryKeywords[], content (markdown), faqs[], relatedLinks[].
const ARTICLES = [
  {
    slug: 'what-is-bitcoin-halving-and-why-does-it-matter',
    title: 'What Is the Bitcoin Halving — and Why Does It Matter?',
    metaTitle: 'Bitcoin Halving Explained: What It Is & Why It Matters',
    metaDescription: 'The Bitcoin halving cuts new supply in half every ~4 years. What it is, why it has historically preceded bull markets, and what to watch next.',
    category: 'Bitcoin',
    readTime: '6 min',
    primaryKeyword: 'bitcoin halving',
    secondaryKeywords: ['bitcoin halving explained', 'btc supply', 'bitcoin mining reward', 'next bitcoin halving'],
    content: `## What the halving actually is

Bitcoin pays miners a block reward for adding each new block to the chain. Roughly every four years — precisely, every 210,000 blocks — that reward is cut in half. This event is the **halving** (sometimes "halvening"). It is written into Bitcoin's code and is not optional or discretionary; it happens automatically.

The block reward started at 50 BTC in 2009. It dropped to 25 in 2012, 12.5 in 2016, 6.25 in 2020, and 3.125 in 2024. The next halving, around 2028, takes it to 1.5625 BTC.

## Why it matters: programmed scarcity

The halving is the mechanism that enforces Bitcoin's fixed supply of 21 million coins. Each halving slows the rate at which new bitcoin enters circulation, so all else equal, the same or rising demand meets a shrinking flow of new supply.

This is the heart of the **stock-to-flow** argument: as new issuance falls, Bitcoin's scarcity (existing stock relative to annual new flow) rises sharply. By the 2024 halving, Bitcoin's annual issuance rate fell below 1% — lower than gold's.

## The historical pattern — and its limits

Each of the first three halvings was followed within 12–18 months by a major bull market and a new all-time high. That track record is why the halving gets so much attention.

But three data points is not a law. Several caveats matter:

- **Markets price in known events.** Everyone knows the halving date years ahead, so the supply shock is partly anticipated.
- **Macro dominates.** Liquidity conditions, interest rates and risk appetite have moved Bitcoin far more than issuance in any given month.
- **Diminishing relative impact.** Each halving changes a smaller percentage of total supply than the last.

## What to watch

Rather than treating the halving as a guaranteed price trigger, track the things it influences: miner revenue and hash rate, exchange supply, and how spot demand (ETF flows, accumulation) compares to the now-smaller new issuance. The halving sets the supply backdrop; demand decides the price.`,
    faqs: [
      { question: 'When is the next Bitcoin halving?', answer: 'The next halving is expected around 2028, at block 1,050,000, when the block reward drops from 3.125 BTC to 1.5625 BTC. The exact date depends on how fast blocks are mined, which averages about 10 minutes each.' },
      { question: 'Does the Bitcoin halving always cause the price to go up?', answer: 'Historically each halving was followed by a bull market, but that is only three examples and correlation is not causation. Macro liquidity, demand and market cycle position matter at least as much as the supply cut.' },
      { question: 'How does the halving affect miners?', answer: 'It instantly cuts miners’ block-reward revenue in half. Less efficient miners can become unprofitable and shut down, which lowers hash rate until difficulty adjusts and the network rebalances.' },
    ],
    relatedLinks: [L('Bitcoin Price Prediction', '/price-prediction/bitcoin'), L('How to Buy Bitcoin', '/how-to-buy/bitcoin'), L('Crypto Market Cycles', '/learn/bitcoin-market-cycles-explained')],
  },
  {
    slug: 'how-to-read-crypto-candlestick-charts',
    title: 'How to Read Crypto Candlestick Charts (Beginner’s Guide)',
    metaTitle: 'How to Read Crypto Candlestick Charts: Beginner Guide',
    metaDescription: 'Learn to read candlestick charts: body, wicks, bullish vs bearish candles, and the key patterns traders watch. A clear beginner walkthrough.',
    category: 'Technical Analysis',
    readTime: '7 min',
    primaryKeyword: 'crypto candlestick charts',
    secondaryKeywords: ['how to read candlesticks', 'candlestick patterns', 'bullish engulfing', 'doji candle'],
    content: `## What a single candle tells you

Each candlestick summarizes price action over a fixed period — one minute, one hour, one day, depending on your chart. A candle encodes four numbers: the **open**, **close**, **high** and **low**.

- The thick **body** spans the open and close.
- The thin lines above and below — the **wicks** (or shadows) — reach the high and low.
- If the close is above the open, the candle is **bullish** (usually green). If the close is below the open, it is **bearish** (usually red).

A long body means strong directional pressure; a small body means indecision. Long wicks show that price tried to go somewhere and got rejected.

## Reading momentum from bodies and wicks

A green candle with a long body and tiny wicks says buyers were in control the whole period. A red candle with a long upper wick says buyers pushed price up but sellers slammed it back down — a sign of rejection at that level.

Context is everything: the same candle means different things at the top of a long rally versus the bottom of a sell-off.

## Patterns worth knowing

A few high-signal patterns:

- **Doji** — open and close almost equal, leaving a cross shape. Indecision; often appears near turning points.
- **Hammer** — small body with a long lower wick after a downtrend. Buyers rejected lower prices; potential reversal.
- **Shooting star** — small body with a long upper wick after an uptrend. Sellers rejected higher prices.
- **Bullish/bearish engulfing** — a candle whose body fully engulfs the previous one in the opposite direction. A common momentum-shift signal.

## How to use them without overtrading

Candlestick patterns are probabilities, not guarantees. They work best when they line up with other evidence: a hammer at a known support level with rising volume is far more reliable than a hammer in the middle of nowhere.

Start on higher timeframes (4-hour and daily), where patterns are more meaningful and you trade less. Combine candles with support/resistance and volume, and always define your invalidation level before you act.`,
    faqs: [
      { question: 'What do the wicks on a candlestick mean?', answer: 'Wicks (shadows) show the highest and lowest prices reached during the period. A long wick means price moved there but was rejected, closing back toward the body — a sign of buying or selling pressure at that extreme.' },
      { question: 'What is the best timeframe for candlestick charts?', answer: 'For beginners, the daily and 4-hour timeframes are most reliable because they filter out short-term noise. Lower timeframes like 1-minute produce many false signals and require more experience.' },
      { question: 'Are candlestick patterns reliable in crypto?', answer: 'They are useful but not foolproof. Patterns work best as confirmation alongside support/resistance, volume and trend context, rather than as standalone buy or sell triggers.' },
    ],
    relatedLinks: [L('Technical vs Sentiment Analysis', '/learn/technical-analysis-vs-sentiment-analysis'), L('Crypto Strength Meter', '/strength-meter'), L('AI Price Predictions', '/predictions')],
  },
  {
    slug: 'what-is-defi-decentralized-finance-explained',
    title: 'What Is DeFi? Decentralized Finance Explained',
    metaTitle: 'What Is DeFi? Decentralized Finance Explained Simply',
    metaDescription: 'DeFi rebuilds lending, trading and earning without banks, using smart contracts. How it works, the main building blocks, and the real risks.',
    category: 'DeFi',
    readTime: '7 min',
    primaryKeyword: 'what is defi',
    secondaryKeywords: ['decentralized finance', 'defi explained', 'liquidity pools', 'yield farming'],
    content: `## The one-sentence definition

DeFi — decentralized finance — is a set of financial services (lending, borrowing, trading, earning yield) that run on public blockchains through **smart contracts** instead of through banks or brokers. The code holds the funds and enforces the rules; no company sits in the middle.

## Why it exists

Traditional finance relies on trusted intermediaries who custody your money, gatekeep access and can freeze or reverse transactions. DeFi replaces those intermediaries with open-source programs anyone can use, audit and build on. The pitch: permissionless access, transparency, and composability — protocols snap together like Lego.

## The core building blocks

- **Decentralized exchanges (DEXs)** like Uniswap let you swap tokens directly from your wallet. Instead of an order book, most use **automated market makers (AMMs)** where prices come from token ratios in a pool.
- **Liquidity pools** are funds that users deposit so others can trade against them, earning a share of the fees.
- **Lending protocols** like Aave let you deposit assets to earn interest or borrow against collateral, with rates set algorithmically by supply and demand.
- **Stablecoins** provide a non-volatile unit of account so people can transact and earn without constant price swings.
- **Yield farming** is moving capital between protocols to chase the best returns, often boosted by token incentives.

## The real risks

DeFi removes intermediary risk but adds new ones, and they are not small:

- **Smart-contract bugs.** A flaw in the code can drain a protocol. Audits help but do not guarantee safety.
- **Impermanent loss.** Providing liquidity can leave you worse off than just holding when prices move apart.
- **Liquidation.** Borrow against volatile collateral and a price drop can wipe out your position automatically.
- **Scams and rug pulls.** Anyone can launch a protocol; many are predatory.

## How to start safely

Use established, audited protocols with long track records and large total value locked. Start small, understand exactly what a transaction does before signing, and never deposit more than you can afford to lose. Self-custody means you are your own bank — including your own security team.`,
    faqs: [
      { question: 'Is DeFi safe?', answer: 'DeFi removes the risk of a bank freezing your funds but introduces smart-contract risk, liquidation risk and scams. Established, audited protocols are safer, but no DeFi protocol is risk-free. Start small and only use funds you can afford to lose.' },
      { question: 'How do you make money in DeFi?', answer: 'Common methods include lending assets for interest, providing liquidity to earn trading fees, and staking. Higher advertised yields almost always carry higher risk, including impermanent loss and protocol failure.' },
      { question: 'Do I need permission to use DeFi?', answer: 'No. DeFi is permissionless — anyone with a crypto wallet and an internet connection can interact with most protocols without signing up or passing identity checks. That openness is a feature but also why you must self-manage risk.' },
    ],
    relatedLinks: [L('What Are Stablecoins?', '/learn/what-are-stablecoins-and-how-do-they-work'), L('Impermanent Loss Calculator', '/tools/impermanent-loss-calculator'), L('What Are Layer-2 Blockchains?', '/learn/what-are-layer-2-blockchains')],
  },
  {
    slug: 'what-is-a-crypto-wallet-and-how-to-use-it',
    title: 'What Is a Crypto Wallet — and How Do You Use One?',
    metaTitle: 'What Is a Crypto Wallet? Types, Setup & Safety Guide',
    metaDescription: 'A crypto wallet stores the keys that control your coins. Hot vs cold wallets, custodial vs self-custody, seed phrases, and how to stay safe.',
    category: 'Fundamentals',
    readTime: '6 min',
    primaryKeyword: 'crypto wallet',
    secondaryKeywords: ['what is a crypto wallet', 'hot vs cold wallet', 'seed phrase', 'self custody'],
    content: `## A wallet stores keys, not coins

Your coins live on the blockchain. A wallet stores the **private keys** that prove you own them and let you authorize transactions. Lose the keys and you lose access; let someone else get them and they can take everything. "Not your keys, not your coins" comes from exactly this.

Each wallet has a public address (safe to share, like an account number) and a private key or **seed phrase** (secret, like the master password to everything).

## Hot vs cold

- **Hot wallets** are connected to the internet — mobile apps, browser extensions like MetaMask, exchange wallets. Convenient for active use, but the constant connection is an attack surface.
- **Cold wallets** keep keys offline — hardware devices like Ledger or Trezor, or paper backups. Far safer for long-term storage because the keys never touch an internet-connected device.

A common setup: a small amount in a hot wallet for daily use, the bulk in cold storage.

## Custodial vs self-custody

- **Custodial** — an exchange holds your keys for you. Easy and recoverable if you forget a password, but you are trusting the company, and funds can be frozen or lost if it fails.
- **Self-custody** — you hold your own keys. Full control and censorship resistance, but full responsibility: there is no "forgot password" button.

## The seed phrase is everything

When you create a self-custody wallet you get a 12- or 24-word **seed phrase**. Anyone with those words can recreate your wallet on any device. Therefore:

- Write it on paper (or steel), never in a photo, cloud note or email.
- Store backups in separate secure locations.
- Never type it into a website or share it — no legitimate service ever asks for it.

## Using a wallet

To receive crypto, share your public address. To send, paste the recipient address, confirm the amount and network fee, and approve. Always double-check the address (malware can swap it) and confirm you are using the correct network — sending on the wrong chain can lose funds permanently.`,
    faqs: [
      { question: 'What is the safest type of crypto wallet?', answer: 'A hardware (cold) wallet is the safest for meaningful amounts because the private keys stay offline and never touch an internet-connected device. Pair it with a securely stored seed-phrase backup.' },
      { question: 'What happens if I lose my seed phrase?', answer: 'If you lose the seed phrase for a self-custody wallet and have no other backup, your funds are unrecoverable — no one can reset it. This is why multiple secure, offline backups are essential.' },
      { question: 'Is a crypto exchange account the same as a wallet?', answer: 'An exchange account is a custodial wallet — the exchange controls the keys. It is convenient, but you are trusting the platform. For full control, withdraw to a self-custody wallet where you hold the keys.' },
    ],
    relatedLinks: [L('How to Buy Bitcoin', '/how-to-buy/bitcoin'), L('How to Identify Crypto Scams', '/learn/how-to-identify-crypto-scams'), L('Wallet Scanner', '/scanner')],
  },
  {
    slug: 'proof-of-work-vs-proof-of-stake',
    title: 'Proof of Work vs Proof of Stake: What’s the Difference?',
    metaTitle: 'Proof of Work vs Proof of Stake Explained',
    metaDescription: 'PoW vs PoS: how each secures a blockchain, their energy and security trade-offs, and why Ethereum switched. A clear side-by-side explanation.',
    category: 'Fundamentals',
    readTime: '6 min',
    primaryKeyword: 'proof of work vs proof of stake',
    secondaryKeywords: ['pow vs pos', 'consensus mechanism', 'crypto mining', 'crypto staking'],
    content: `## The problem both solve

A blockchain has no central authority, so it needs a way for thousands of strangers to agree on which transactions are valid and in what order — without trusting each other. That mechanism is called **consensus**. Proof of Work and Proof of Stake are the two dominant approaches, and they secure the network in very different ways.

## Proof of Work

In PoW, **miners** compete to solve a hard mathematical puzzle. The first to solve it gets to add the next block and earn the reward. Solving requires enormous computing power and electricity, so attacking the network would mean out-spending every honest miner combined — economically irrational.

- **Used by:** Bitcoin, Litecoin, Dogecoin.
- **Strengths:** battle-tested security, the most decentralized track record, hard to attack.
- **Weaknesses:** high energy use, specialized hardware, slower and less scalable.

## Proof of Stake

In PoS, there is no mining race. Instead, **validators** lock up (stake) the network's own coins as collateral. The protocol selects validators to propose and confirm blocks, roughly in proportion to how much they have staked. Act dishonestly and your stake can be **slashed** — destroyed. The security comes from capital at risk rather than electricity burned.

- **Used by:** Ethereum (since 2022), Solana, Cardano, Avalanche.
- **Strengths:** ~99% less energy, faster, easier to scale, lets ordinary holders earn staking yield.
- **Weaknesses:** newer, and critics argue it can favor large holders ("rich get richer").

## Why Ethereum switched

In 2022's "Merge," Ethereum moved from PoW to PoS, cutting its energy use by over 99% overnight. The goals were sustainability and a foundation for future scaling. It remains the largest real-world test of PoS at scale.

## Which is better?

There is no universal winner. PoW prioritizes maximal, time-tested security and decentralization at the cost of energy. PoS prioritizes efficiency, scalability and accessibility, accepting a younger security model. Bitcoin's role as "digital gold" suits PoW's conservatism; smart-contract platforms that need throughput tend to favor PoS.`,
    faqs: [
      { question: 'Is Proof of Stake more secure than Proof of Work?', answer: 'Both are secure but in different ways. PoW has the longest real-world track record and is extremely costly to attack. PoS secures the chain through staked capital that can be slashed. Each has trade-offs rather than one being strictly safer.' },
      { question: 'Why did Ethereum move to Proof of Stake?', answer: 'Ethereum switched in the 2022 Merge to cut energy use by over 99% and to lay the groundwork for greater scalability, while letting holders earn yield by staking instead of relying on energy-intensive mining.' },
      { question: 'Can you earn money with Proof of Stake?', answer: 'Yes. By staking a PoS coin — directly or through a staking service — you can earn rewards for helping secure the network. Returns vary by network, and staked funds may be locked or subject to slashing if a validator misbehaves.' },
    ],
    relatedLinks: [L('What Is Ethereum Staking?', '/learn/what-is-ethereum-staking-explained'), L('Ethereum Price Prediction', '/price-prediction/ethereum'), L('What Is a Blockchain?', '/learn/what-is-a-blockchain-explained-simply')],
  },
  {
    slug: 'what-are-layer-2-blockchains',
    title: 'What Are Layer-2 Blockchains? Scaling Explained',
    metaTitle: 'What Are Layer-2 Blockchains? Crypto Scaling Explained',
    metaDescription: 'Layer-2s make blockchains faster and cheaper by moving transactions off the main chain. Rollups, optimistic vs ZK, and why they matter.',
    category: 'Fundamentals',
    readTime: '6 min',
    primaryKeyword: 'layer 2 blockchains',
    secondaryKeywords: ['what are layer 2', 'rollups explained', 'optimistic rollup', 'zk rollup', 'ethereum scaling'],
    content: `## The problem: blockchains are slow and expensive

A base blockchain like Ethereum (Layer-1) is secure and decentralized, but every node must process every transaction. That caps throughput and, when demand spikes, sends fees soaring. You cannot simply crank up capacity without sacrificing decentralization — this tension is the **blockchain trilemma** (security, decentralization, scalability — pick two, roughly).

**Layer-2 (L2)** networks are the leading answer: they handle transactions off the main chain, then post compressed proofs back to Layer-1, inheriting its security while being far faster and cheaper.

## How rollups work

The dominant L2 design is the **rollup**. It executes many transactions off-chain, "rolls" them up into a single batch, and submits that batch to Layer-1. Instead of the main chain processing 500 transactions individually, it verifies one batch — slashing cost per transaction while still anchoring to L1 security.

Two main types differ in how they prove the batch is valid:

- **Optimistic rollups** (Arbitrum, Optimism, Base) assume batches are valid by default and allow a challenge window during which anyone can submit fraud proofs. Simple and EVM-compatible, but withdrawals back to L1 carry a delay.
- **ZK rollups** (zkSync, Starknet, Linea) post a cryptographic **validity proof** (a zero-knowledge proof) with each batch, mathematically guaranteeing correctness. Faster finality and withdrawals, but more complex technology.

## Why they matter

L2s are where most of Ethereum's everyday activity now happens. They cut fees from dollars to cents, enable use cases that were uneconomical on L1, and let Ethereum scale without compromising the base layer's security. Coinbase's **Base**, an optimistic rollup, brought millions of new users on-chain.

## What to watch

L2s vary in how decentralized they really are — some still rely on a single "sequencer" that orders transactions, a centralization point being actively worked on. When evaluating an L2, look at its security model, who runs the sequencer, total value locked, and whether it is a genuine rollup or a less-secure sidechain.`,
    faqs: [
      { question: 'What is the difference between Layer-1 and Layer-2?', answer: 'Layer-1 is the base blockchain (like Ethereum or Bitcoin) that provides security and settlement. Layer-2 is built on top to process transactions faster and cheaper, then settles back to Layer-1, inheriting its security.' },
      { question: 'What is the difference between optimistic and ZK rollups?', answer: 'Optimistic rollups assume transactions are valid and allow a challenge period to catch fraud, which delays withdrawals. ZK rollups attach a cryptographic validity proof to each batch, enabling faster finality but with more complex technology.' },
      { question: 'Are Layer-2 transactions safe?', answer: 'Genuine rollups inherit security from their Layer-1 by posting data and proofs back to it. Risks remain around centralized sequencers and bridge contracts, so security varies by network — check whether a project is a true rollup or a sidechain.' },
    ],
    relatedLinks: [L('Arbitrum Analytics', '/chain/arbitrum'), L('Best Layer-2 Crypto', '/market/best-layer-2-crypto'), L('What Is Ethereum Staking?', '/learn/what-is-ethereum-staking-explained')],
  },
];

// ── merge ───────────────────────────────────────────────────────────────────
const existing = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const have = new Set(existing.map((a) => a.slug));
let added = 0;
for (const art of ARTICLES) {
  if (have.has(art.slug)) { console.log(`skip (exists): ${art.slug}`); continue; }
  // id mirrors the existing corpus convention
  existing.push({ id: art.slug, ...art });
  have.add(art.slug);
  added++;
}
fs.writeFileSync(JSON_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf8');
console.log(`\nAdded ${added} new articles. Corpus now has ${existing.length} entries.`);
