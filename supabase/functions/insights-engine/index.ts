import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Cache for daily posts
let cachedPosts: any = null;
let cacheDate: string = '';

// Comprehensive crypto blog categories - 20 articles daily covering EVERYTHING
const blogCategories = [
  // Breaking News & Market Updates (4)
  { category: 'Breaking News', topics: [
    'Latest cryptocurrency market developments',
    'Major exchange announcements today',
    'Regulatory updates affecting crypto',
    'Institutional crypto adoption news'
  ]},
  
  // Bitcoin & Ethereum (4)
  { category: 'Bitcoin & Ethereum', topics: [
    'Bitcoin price movements and whale activity',
    'Ethereum network updates and upgrades',
    'BTC and ETH market analysis',
    'Layer 2 solutions and scaling news'
  ]},
  
  // Altcoins & New Projects (3)
  { category: 'Altcoins & Projects', topics: [
    'Trending altcoins and meme coins',
    'New token launches and IDOs',
    'Promising crypto projects to watch'
  ]},
  
  // DeFi & Yield (3)
  { category: 'DeFi & Yield', topics: [
    'DeFi protocol updates and TVL changes',
    'Best yield farming opportunities',
    'DEX trading volume and liquidity'
  ]},
  
  // NFTs & Gaming (2)
  { category: 'NFTs & Gaming', topics: [
    'NFT market trends and top collections',
    'Web3 gaming and metaverse updates'
  ]},
  
  // Airdrops & Opportunities (2)
  { category: 'Airdrops & Opportunities', topics: [
    'Upcoming crypto airdrops and how to qualify',
    'Staking rewards and passive income strategies'
  ]},
  
  // Technical & Security (2)
  { category: 'Security & Tech', topics: [
    'Blockchain security alerts and hacks',
    'Smart contract audits and safety tips'
  ]},
];

// Internal links for Oracle Bull
const internalLinks = [
  { text: 'real-time market dashboard', url: '/dashboard' },
  { text: 'blockchain analytics', url: '/chain/ethereum' },
  { text: 'crypto strength meter', url: '/strength' },
  { text: 'market event calendar', url: '/factory' },
  { text: 'sentiment analysis', url: '/sentiment' },
  { text: 'token explorer', url: '/explorer' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Return cached posts if same day
    if (cachedPosts && cacheDate === today) {
      console.log('Returning cached blog posts');
      return new Response(JSON.stringify(cachedPosts), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating 20 daily crypto blog posts...');

    // Fetch real market data and news
    let marketData = {
      btcPrice: 97000,
      ethPrice: 3400,
      solPrice: 190,
      totalMarketCap: 3.2e12,
      btcDominance: 54,
      marketChange24h: 1.5,
      trending: [] as any[],
      news: [] as any[],
    };

    try {
      const [trendingRes, globalRes, pricesRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/search/trending'),
        fetch('https://api.coingecko.com/api/v3/global'),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin,pepe&vs_currencies=usd&include_24hr_change=true'),
      ]);

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        marketData.trending = (data.coins?.slice(0, 7) || []).map((t: any) => ({
          name: t.item?.name,
          symbol: t.item?.symbol,
          price: t.item?.data?.price || 0,
          change: t.item?.data?.price_change_percentage_24h?.usd || 0,
          marketCap: t.item?.data?.market_cap || 'N/A',
        }));
      }

      if (globalRes.ok) {
        const data = await globalRes.json();
        marketData.totalMarketCap = data.data?.total_market_cap?.usd || marketData.totalMarketCap;
        marketData.btcDominance = data.data?.market_cap_percentage?.btc || marketData.btcDominance;
        marketData.marketChange24h = data.data?.market_cap_change_percentage_24h_usd || marketData.marketChange24h;
      }

      if (pricesRes.ok) {
        const prices = await pricesRes.json();
        marketData.btcPrice = prices.bitcoin?.usd || marketData.btcPrice;
        marketData.ethPrice = prices.ethereum?.usd || marketData.ethPrice;
        marketData.solPrice = prices.solana?.usd || marketData.solPrice;
      }

      // Fetch crypto news
      try {
        const newsRes = await fetch('https://api.coingecko.com/api/v3/status_updates?per_page=20');
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          marketData.news = newsData.status_updates?.slice(0, 10) || [];
        }
      } catch (e) {
        console.log('News fetch failed, using generated content');
      }
    } catch (e) {
      console.log('Using fallback market data');
    }

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const currentYear = new Date().getFullYear();
    
    // Generate all 20 posts
    const allTopics: { category: string; topic: string; index: number }[] = [];
    let postIndex = 0;
    
    for (const cat of blogCategories) {
      for (const topic of cat.topics) {
        allTopics.push({ category: cat.category, topic, index: postIndex });
        postIndex++;
      }
    }

    // Generate posts using fallback for reliability
    const posts = allTopics.map(({ category, topic, index }) => 
      createBlogPost(category, topic, marketData, index, dayOfYear, currentYear)
    );

    console.log(`Generated ${posts.length} crypto blog posts`);

    const result = {
      posts,
      date: today,
      timestamp: Date.now(),
      totalArticles: posts.length,
      marketSnapshot: {
        btcPrice: marketData.btcPrice,
        ethPrice: marketData.ethPrice,
        totalMarketCap: marketData.totalMarketCap,
        trending: marketData.trending.slice(0, 5),
      }
    };

    cachedPosts = result;
    cacheDate = today;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating blog:', error);
    const fallbackPosts = generateAllFallbackPosts();
    return new Response(JSON.stringify({ 
      posts: fallbackPosts,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      totalArticles: fallbackPosts.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createBlogPost(category: string, topic: string, market: any, index: number, dayOfYear: number, year: number) {
  const content = generateBlogContent(category, topic, market, year);
  const wordCount = content.split(/\s+/).length;
  const link = internalLinks[index % internalLinks.length];
  
  return {
    id: `blog-${dayOfYear}-${index}`,
    title: generateTitle(topic, year),
    slug: generateSlug(topic),
    metaTitle: `${topic} | Oracle Bull Crypto Blog`.substring(0, 60),
    metaDescription: `${topic}. Get the latest updates, news, and insights on cryptocurrency markets, DeFi, NFTs, and more.`.substring(0, 160),
    content,
    takeaways: generateTakeaways(category, topic),
    faqs: generateFAQs(topic, category),
    category,
    readTime: `${Math.ceil(wordCount / 200)} min`,
    wordCount,
    publishedAt: new Date().toISOString(),
    imageUrl: getCategoryImage(category),
    primaryKeyword: topic.toLowerCase(),
    secondaryKeywords: getKeywords(category),
    internalLink: link,
  };
}

function generateTitle(topic: string, year: number): string {
  const formats = [
    `${topic} - ${year} Update`,
    `${topic}: What You Need to Know`,
    `${topic} - Latest Developments`,
    `${topic} Today: Key Updates`,
  ];
  return formats[Math.floor(Math.random() * formats.length)].substring(0, 60);
}

function generateBlogContent(category: string, topic: string, market: any, year: number): string {
  const btcPrice = market.btcPrice?.toLocaleString() || '97,000';
  const ethPrice = market.ethPrice?.toLocaleString() || '3,400';
  const solPrice = market.solPrice?.toLocaleString() || '190';
  const marketCap = ((market.totalMarketCap || 3.2e12) / 1e12).toFixed(2);
  const btcDom = (market.btcDominance || 54).toFixed(1);
  const change = market.marketChange24h > 0 ? `+${market.marketChange24h.toFixed(2)}%` : `${market.marketChange24h.toFixed(2)}%`;
  const trendingList = market.trending?.slice(0, 5).map((t: any) => `${t.name} (${t.symbol})`).join(', ') || 'Bitcoin, Ethereum, Solana';
  
  const link = internalLinks[Math.floor(Math.random() * internalLinks.length)];

  // Different content styles based on category
  if (category === 'Breaking News') {
    return `## ${topic}

The cryptocurrency market continues to evolve rapidly in ${year}, with Bitcoin trading at $${btcPrice} and Ethereum at $${ethPrice}. The total market capitalization stands at $${marketCap} trillion, with a ${change} change over the last 24 hours.

### Current Market Overview

Today's crypto landscape shows significant activity across multiple sectors. Bitcoin dominance remains at ${btcDom}%, while trending coins include ${trendingList}. Major exchanges are reporting elevated trading volumes as market participants respond to the latest developments.

### Key Developments to Watch

Several important events are shaping the market today:

- **Regulatory Updates**: Government agencies continue to refine their approach to cryptocurrency oversight, with new guidelines expected to impact both retail and institutional participants
- **Exchange Activity**: Major trading platforms are seeing increased volume, with particular interest in trending altcoins and meme coins
- **Institutional Moves**: Large-scale investors continue to show interest in digital assets, with reports of significant accumulation in key tokens

### What This Means for Traders

For those actively participating in the market, these developments present both opportunities and considerations. The [${link.text}](${link.url}) provides real-time data to help track these movements.

Market volatility remains a constant factor, and participants should stay informed about the latest news and developments. Whether you're a long-term holder or an active trader, understanding these dynamics is crucial for making informed decisions.

### Looking Ahead

The crypto market in ${year} continues to mature, with increasing integration into traditional finance and growing mainstream adoption. Stay tuned for more updates as the situation develops.

*This content is for informational purposes only and should not be considered financial advice.*`;
  }

  if (category === 'Bitcoin & Ethereum') {
    return `## ${topic}

Bitcoin is currently trading at $${btcPrice}, maintaining its position as the leading cryptocurrency with ${btcDom}% market dominance. Ethereum follows at $${ethPrice}, continuing to power the majority of DeFi and NFT activity in the ecosystem.

### Bitcoin Market Analysis

BTC has shown resilience in ${year}, with institutional interest remaining strong. Key factors influencing Bitcoin's price include:

- **Whale Activity**: Large holders continue to accumulate, with on-chain data showing steady growth in wallets holding 1,000+ BTC
- **Mining Dynamics**: The network hashrate remains at all-time highs, indicating strong miner confidence
- **ETF Flows**: Bitcoin ETFs continue to see significant inflows from traditional investors

### Ethereum Network Updates

Ethereum's ecosystem continues to expand with ongoing technical improvements:

- **Layer 2 Adoption**: Solutions like Arbitrum, Optimism, and Base are seeing record transaction volumes
- **Staking Growth**: Over 30 million ETH is now staked, providing network security and attractive yields
- **DeFi Development**: New protocols continue to launch, expanding the possibilities for decentralized finance

### Market Trends

The total crypto market cap of $${marketCap} trillion reflects growing confidence in digital assets. Trending tokens today include ${trendingList}, showing diverse interest across the market.

Track live prices and analytics on the [${link.text}](${link.url}) for real-time market insights.

### Technical Outlook

Both Bitcoin and Ethereum are showing key technical levels that traders are watching closely. Support and resistance zones remain important for short-term trading decisions, while long-term holders focus on fundamental developments.

*This analysis is for educational purposes only. Always do your own research before making investment decisions.*`;
  }

  if (category === 'Altcoins & Projects') {
    return `## ${topic}

The altcoin market is showing significant activity in ${year}, with many projects seeing renewed interest. While Bitcoin dominates at ${btcDom}%, altcoins continue to offer unique opportunities and innovations.

### Trending Coins Today

The following tokens are generating the most buzz: ${trendingList}. These projects range from established layer-1 blockchains to emerging meme coins capturing community attention.

### New Project Launches

Several new projects have launched recently, offering innovative solutions:

- **DeFi Innovations**: New decentralized exchanges and lending protocols are improving capital efficiency
- **Layer 2 Projects**: Scaling solutions continue to attract developers and users seeking lower fees
- **AI x Crypto**: The intersection of artificial intelligence and blockchain is producing interesting new projects
- **Real-World Assets**: Tokenization of traditional assets is gaining momentum

### What to Watch

When evaluating new altcoin projects, consider these factors:

1. **Team and Development**: Active GitHub commits and transparent team communication
2. **Tokenomics**: Fair distribution and sustainable token economics
3. **Use Case**: Real utility beyond speculation
4. **Community**: Active and growing user base
5. **Partnerships**: Strategic relationships with established players

### Market Snapshot

With the total market cap at $${marketCap} trillion and ETH at $${ethPrice}, there's significant liquidity flowing through altcoin markets. Use the [${link.text}](${link.url}) to research tokens before investing.

### Risk Considerations

Altcoins typically carry higher risk than Bitcoin and Ethereum. Many projects fail, and volatility can be extreme. Never invest more than you can afford to lose, and always diversify your portfolio.

*This content is informational only and not financial advice.*`;
  }

  if (category === 'DeFi & Yield') {
    return `## ${topic}

Decentralized Finance continues to be one of the most active sectors in crypto, with billions of dollars locked in various protocols. In ${year}, DeFi offers numerous opportunities for yield generation and financial innovation.

### Current DeFi Landscape

The DeFi ecosystem has matured significantly:

- **Total Value Locked**: Billions remain deployed across lending, borrowing, and liquidity protocols
- **DEX Volume**: Decentralized exchanges are processing significant daily volume
- **Yield Opportunities**: Staking, liquidity provision, and lending continue to offer returns
- **Cross-Chain DeFi**: Bridge protocols enable seamless asset movement between chains

### Top Yield Strategies

Current opportunities for earning yield include:

1. **ETH Staking**: Earn approximately 3-5% APY by staking Ethereum
2. **Liquid Staking**: Protocols like Lido offer staking with maintained liquidity
3. **Stablecoin Yields**: Lending platforms offer yields on USDC, USDT, and DAI
4. **Liquidity Provision**: Provide liquidity to DEXs for trading fee rewards
5. **Yield Aggregators**: Automated protocols optimize yields across platforms

### New Protocol Updates

Several major DeFi protocols have announced updates:

- Enhanced security measures following past exploits
- Improved user interfaces for better accessibility
- New features expanding protocol capabilities
- Governance proposals shaping protocol direction

### Risk Management

DeFi carries specific risks including smart contract vulnerabilities, impermanent loss, and protocol failures. Track your positions using the [${link.text}](${link.url}) and always use audited protocols.

With BTC at $${btcPrice} and ETH at $${ethPrice}, DeFi offers alternatives to traditional yield strategies but requires careful research.

*DeFi investments carry significant risk. This is not financial advice.*`;
  }

  if (category === 'NFTs & Gaming') {
    return `## ${topic}

The NFT and Web3 gaming sectors continue to evolve in ${year}, with new collections, games, and use cases emerging regularly. Despite market fluctuations, builders remain active in these spaces.

### NFT Market Overview

The NFT landscape has shifted from pure speculation toward utility:

- **Profile Pictures**: Blue-chip collections maintain cultural significance
- **Digital Art**: Artists continue finding new audiences through blockchain
- **Music NFTs**: Musicians are exploring direct-to-fan distribution
- **Membership Tokens**: NFTs as access passes to communities and events

### Trending Collections

Top collections by volume and activity show diverse interests from digital art to gaming assets. Secondary market activity indicates ongoing collector interest in established and emerging projects.

### Web3 Gaming Updates

The blockchain gaming sector continues to develop:

- **Play-to-Earn Evolution**: Games are focusing more on fun with earning as a bonus
- **AAA Development**: Major studios are exploring blockchain integration
- **Metaverse Projects**: Virtual worlds continue building despite broader market conditions
- **Gaming Infrastructure**: Improved onboarding and reduced friction for mainstream gamers

### What's Coming

Upcoming developments to watch:

1. New game launches with improved gameplay mechanics
2. Enhanced NFT utility across platforms
3. Better integration between Web2 and Web3 gaming
4. Reduced transaction costs through Layer 2 solutions

### Market Context

With BTC at $${btcPrice} and the total crypto market at $${marketCap} trillion, NFTs and gaming represent a smaller but innovative segment. Use the [${link.text}](${link.url}) to track related tokens.

*NFTs can be highly speculative. Do your own research before purchasing.*`;
  }

  if (category === 'Airdrops & Opportunities') {
    return `## ${topic}

Crypto airdrops remain one of the most exciting ways to earn free tokens in ${year}. By participating in protocol testing, providing liquidity, or being an active community member, users can potentially qualify for valuable token distributions.

### How Airdrops Work

Airdrops reward early adopters and active participants:

- **Retroactive Rewards**: Protocols distribute tokens to past users
- **Testnet Participation**: Using beta versions before mainnet launch
- **Liquidity Provision**: Supplying liquidity to new protocols
- **Governance Participation**: Voting and engaging with DAOs
- **Social Tasks**: Following, sharing, and community engagement

### Current Opportunities

Several protocols are in stages that historically have led to airdrops:

1. **Layer 2 Networks**: Use bridges and dApps on new L2s
2. **New DEXs**: Provide liquidity and trade on emerging exchanges
3. **Cross-Chain Protocols**: Interact with bridge and messaging protocols
4. **DeFi Protocols**: Test new lending and borrowing platforms

### Passive Income Strategies

Beyond airdrops, consider these earning methods:

- **Staking**: Lock tokens to earn rewards (ETH staking yields ~4-5% APY)
- **Lending**: Supply assets to lending protocols for interest
- **Liquidity Mining**: Earn additional tokens for providing liquidity
- **Running Nodes**: Technical users can operate validator nodes

### Safety Tips

Protect yourself from airdrop scams:

- Never share your seed phrase
- Verify official links through trusted sources
- Use separate wallets for airdrop hunting
- Beware of phishing websites

Track potential opportunities using the [${link.text}](${link.url}). With BTC at $${btcPrice}, successful airdrops can significantly boost your portfolio.

*Airdrop eligibility is never guaranteed. This is not financial advice.*`;
  }

  if (category === 'Security & Tech') {
    return `## ${topic}

Security remains paramount in the crypto space in ${year}. With billions at stake across DeFi protocols and exchanges, understanding security best practices is essential for all participants.

### Recent Security Developments

The crypto security landscape continues to evolve:

- **Audit Standards**: More protocols are undergoing multiple security audits
- **Bug Bounties**: Major protocols offer significant rewards for vulnerability discoveries
- **Insurance Options**: DeFi insurance protocols are growing in adoption
- **Self-Custody Solutions**: Hardware wallet technology continues to improve

### Common Threats to Watch

Protect yourself from these common attack vectors:

1. **Phishing**: Fake websites and emails targeting crypto users
2. **Smart Contract Exploits**: Vulnerabilities in protocol code
3. **Social Engineering**: Scammers impersonating support or team members
4. **Malware**: Clipboard hijackers and wallet-draining software
5. **Rug Pulls**: Projects abandoning users after raising funds

### Security Best Practices

Essential steps for protecting your crypto:

- **Hardware Wallets**: Store significant holdings offline
- **Separate Wallets**: Use different wallets for different purposes
- **Verify Everything**: Double-check addresses and transaction details
- **Regular Audits**: Review your wallet permissions and revoke unused approvals
- **Stay Updated**: Follow security researchers and official announcements

### Technical Developments

Blockchain technology continues advancing security:

- Formal verification of smart contracts
- Multi-party computation for enhanced privacy
- Zero-knowledge proofs for verification without exposure
- Account abstraction for improved wallet security

With the total market cap at $${marketCap} trillion and BTC at $${btcPrice}, protecting your assets is crucial. Use the [${link.text}](${link.url}) to stay informed about market conditions.

*Security is your responsibility. Never share private keys or seed phrases.*`;
  }

  // Default comprehensive content
  return `## ${topic}

The cryptocurrency market in ${year} continues to offer diverse opportunities across multiple sectors. With Bitcoin at $${btcPrice}, Ethereum at $${ethPrice}, and Solana at $${solPrice}, the ecosystem remains active and dynamic.

### Current Market Conditions

Today's market shows the following characteristics:

- **Total Market Cap**: $${marketCap} trillion
- **BTC Dominance**: ${btcDom}%
- **24h Change**: ${change}
- **Trending**: ${trendingList}

### Key Developments

Several important trends are shaping the crypto landscape:

1. **Institutional Adoption**: More traditional finance entities are entering the space
2. **Regulatory Clarity**: Governments are providing clearer frameworks
3. **Technical Innovation**: New scaling and privacy solutions are launching
4. **DeFi Evolution**: Decentralized finance protocols are maturing
5. **NFT Utility**: Non-fungible tokens are finding new use cases

### What to Watch

Market participants should monitor:

- Major protocol upgrades and launches
- Regulatory announcements from key jurisdictions
- Institutional investment flows
- On-chain metrics and network activity
- Social sentiment and community developments

### Practical Insights

For those actively participating in the market, consider:

- Diversifying across multiple assets and sectors
- Staying informed through reliable news sources
- Using proper security practices for all holdings
- Understanding the risks inherent in crypto investments

Track all these developments using the [${link.text}](${link.url}) for comprehensive market data and analytics.

### Looking Forward

The crypto space continues to evolve rapidly. Staying informed and adaptable is key to navigating this dynamic market successfully.

*This content is for informational purposes only and should not be considered financial advice. Always conduct your own research.*`;
}

function generateTakeaways(category: string, topic: string): string[] {
  return [
    `Stay updated on the latest ${category.toLowerCase()} developments`,
    `Use proper security practices when interacting with crypto protocols`,
    `Diversify your approach and never invest more than you can afford to lose`,
    `Track market conditions using reliable analytics tools`,
  ];
}

function generateFAQs(topic: string, category: string): { question: string; answer: string }[] {
  return [
    {
      question: `What is ${topic}?`,
      answer: `${topic} refers to current developments and updates in the ${category.toLowerCase()} sector of the cryptocurrency market. Staying informed about these topics helps market participants make better decisions.`
    },
    {
      question: `How can I stay updated on ${category.toLowerCase()}?`,
      answer: `Follow reliable crypto news sources, use analytics platforms like Oracle Bull, join community channels, and monitor on-chain data for the most accurate and timely information.`
    },
    {
      question: `Is ${category.toLowerCase()} a good investment opportunity?`,
      answer: `All cryptocurrency investments carry significant risk. While ${category.toLowerCase()} offers opportunities, it's essential to do thorough research, understand the risks, and never invest more than you can afford to lose.`
    }
  ];
}

function generateSlug(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
}

function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    'Breaking News': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
    'Bitcoin & Ethereum': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'Altcoins & Projects': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    'DeFi & Yield': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'NFTs & Gaming': 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=800',
    'Airdrops & Opportunities': 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800',
    'Security & Tech': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800',
  };
  return images[category] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
}

function getKeywords(category: string): string[] {
  const keywords: Record<string, string[]> = {
    'Breaking News': ['crypto news', 'cryptocurrency updates', 'market news'],
    'Bitcoin & Ethereum': ['bitcoin', 'ethereum', 'BTC', 'ETH', 'crypto prices'],
    'Altcoins & Projects': ['altcoins', 'new crypto', 'token launches', 'crypto projects'],
    'DeFi & Yield': ['DeFi', 'yield farming', 'staking', 'liquidity'],
    'NFTs & Gaming': ['NFTs', 'Web3 gaming', 'metaverse', 'digital collectibles'],
    'Airdrops & Opportunities': ['crypto airdrops', 'free crypto', 'staking rewards'],
    'Security & Tech': ['crypto security', 'blockchain technology', 'smart contracts'],
  };
  return keywords[category] || ['cryptocurrency', 'blockchain', 'crypto'];
}

function generateAllFallbackPosts() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const year = new Date().getFullYear();
  const market = { btcPrice: 97000, ethPrice: 3400, solPrice: 190, totalMarketCap: 3.2e12, btcDominance: 54, marketChange24h: 1.5, trending: [] };
  
  const posts: any[] = [];
  let index = 0;
  
  for (const cat of blogCategories) {
    for (const topic of cat.topics) {
      posts.push(createBlogPost(cat.category, topic, market, index, dayOfYear, year));
      index++;
    }
  }
  
  return posts;
}
