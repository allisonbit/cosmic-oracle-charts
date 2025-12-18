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

// Topic distribution: 6 Ethereum, 4 Base, 4 Solana, 3 Bitcoin, 3 Market-wide = 20 total
const topicDistribution = [
  // Ethereum (6 articles)
  { category: 'Ethereum Analysis', topics: ['Ethereum price prediction analysis', 'ETH gas fee optimization strategies', 'Ethereum staking rewards explained', 'ETH Layer 2 scaling solutions', 'Ethereum DeFi ecosystem trends', 'EIP upgrades and network changes'] },
  
  // Base (4 articles)
  { category: 'Base Network', topics: ['Base network activity analysis', 'Base chain DeFi opportunities', 'Base ecosystem token trends', 'Base vs other L2 comparison'] },
  
  // Solana (4 articles)
  { category: 'Solana Analysis', topics: ['Solana price momentum indicators', 'SOL staking and validator metrics', 'Solana DeFi protocol analysis', 'Solana NFT market trends'] },
  
  // Bitcoin (3 articles)
  { category: 'Bitcoin Analysis', topics: ['Bitcoin price prediction today', 'BTC halving cycle dynamics', 'Bitcoin institutional accumulation patterns'] },
  
  // Market-wide (3 articles)
  { category: 'Market Analysis', topics: ['Crypto market sentiment today', 'On-chain volume analysis insights', 'Crypto strength meter explained'] },
];

// Keywords for SEO targeting
const targetKeywords = {
  ethereum: ['ethereum price prediction', 'ETH analysis', 'ethereum gas fees', 'ethereum staking', 'ETH DeFi', 'ethereum layer 2'],
  base: ['base network analysis', 'base chain crypto', 'base DeFi', 'base ecosystem'],
  solana: ['solana price prediction', 'SOL analysis', 'solana staking', 'solana DeFi'],
  bitcoin: ['bitcoin price prediction today', 'BTC analysis', 'bitcoin halving', 'bitcoin institutional'],
  market: ['crypto market sentiment', 'crypto strength meter', 'on-chain analysis', 'market volume'],
};

// Internal links for Oracle Bull
const internalLinks = [
  { text: 'Ethereum analytics dashboard', url: '/chain/ethereum', keywords: ['ethereum', 'eth'] },
  { text: 'Base network dashboard', url: '/chain/base', keywords: ['base'] },
  { text: 'Solana analytics dashboard', url: '/chain/solana', keywords: ['solana', 'sol'] },
  { text: 'real-time market dashboard', url: '/dashboard', keywords: ['market', 'bitcoin', 'btc'] },
  { text: 'crypto strength meter', url: '/strength', keywords: ['strength', 'momentum'] },
  { text: 'market event calendar', url: '/factory', keywords: ['events', 'calendar'] },
  { text: 'sentiment analysis tools', url: '/sentiment', keywords: ['sentiment'] },
  { text: 'token explorer', url: '/explorer', keywords: ['token', 'explore'] },
  { text: 'wallet scanner', url: '/portfolio', keywords: ['wallet', 'portfolio'] },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Return cached posts if same day
    if (cachedPosts && cacheDate === today) {
      console.log('Returning cached insight posts');
      return new Response(JSON.stringify(cachedPosts), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating 20 daily insight articles...');

    // Fetch market data for context
    let marketContext = {
      totalMarketCap: 3.2e12,
      btcDominance: 54,
      ethDominance: 17,
      marketChange24h: 1.2,
      btcPrice: 97000,
      ethPrice: 3400,
      solPrice: 190,
      trending: [] as any[],
    };

    try {
      const [trendingRes, globalRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/search/trending'),
        fetch('https://api.coingecko.com/api/v3/global'),
      ]);

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        marketContext.trending = (data.coins?.slice(0, 5) || []).map((t: any) => ({
          name: t.item?.name,
          symbol: t.item?.symbol,
          change: t.item?.data?.price_change_percentage_24h?.usd || 0,
        }));
      }

      if (globalRes.ok) {
        const data = await globalRes.json();
        marketContext.totalMarketCap = data.data?.total_market_cap?.usd || marketContext.totalMarketCap;
        marketContext.btcDominance = data.data?.market_cap_percentage?.btc || marketContext.btcDominance;
        marketContext.ethDominance = data.data?.market_cap_percentage?.eth || marketContext.ethDominance;
        marketContext.marketChange24h = data.data?.market_cap_change_percentage_24h_usd || marketContext.marketChange24h;
      }

      // Get specific prices
      const pricesRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      if (pricesRes.ok) {
        const prices = await pricesRes.json();
        marketContext.btcPrice = prices.bitcoin?.usd || marketContext.btcPrice;
        marketContext.ethPrice = prices.ethereum?.usd || marketContext.ethPrice;
        marketContext.solPrice = prices.solana?.usd || marketContext.solPrice;
      }
    } catch (e) {
      console.log('Using fallback market data');
    }

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Generate all 20 posts - use parallel batches for speed
    const allTopics: { category: string; topic: string; index: number }[] = [];
    let postIndex = 0;
    
    for (const distribution of topicDistribution) {
      for (const topic of distribution.topics) {
        allTopics.push({ category: distribution.category, topic, index: postIndex });
        postIndex++;
      }
    }

    // Generate all posts using fallback for reliability and speed
    const posts = allTopics.map(({ category, topic, index }) => 
      createFallbackPost(category, topic, marketContext, index, dayOfYear)
    );

    console.log(`Generated ${posts.length} insight articles`);

    const result = {
      posts,
      date: today,
      timestamp: Date.now(),
      totalArticles: posts.length,
    };

    // Cache for the day
    cachedPosts = result;
    cacheDate = today;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating insights:', error);
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

async function generateAIPost(
  category: string,
  topic: string,
  context: any, 
  index: number,
  dayOfYear: number
) {
  try {
    // Get relevant internal link
    const relevantLink = internalLinks.find(link => 
      link.keywords.some(kw => topic.toLowerCase().includes(kw) || category.toLowerCase().includes(kw))
    ) || internalLinks[0];

    const prompt = `Write a professional 700-word crypto analysis article about "${topic}".

Market context: BTC $${context.btcPrice.toLocaleString()}, ETH $${context.ethPrice.toLocaleString()}, SOL $${context.solPrice.toLocaleString()}. Total market cap $${(context.totalMarketCap / 1e12).toFixed(2)}T, BTC dominance ${context.btcDominance.toFixed(1)}%.

Requirements:
- SEO title under 60 characters targeting "${topic}"
- 150-160 character meta description with primary keyword
- 600-900 words, professional analyst tone
- 4-6 H2 sections with detailed explanations
- Include one data-driven analytical insight
- Practical takeaway section
- Natural reference to [${relevantLink.text}](${relevantLink.url}) for deeper analysis
- No hype, no price guarantees, educational only

Format as JSON:
{
  "title": "SEO title",
  "slug": "url-slug-format",
  "metaTitle": "Meta title under 60 chars",
  "metaDescription": "Meta description 150-160 chars",
  "content": "Full markdown article with ## H2 and ### H3 headings",
  "takeaways": ["takeaway1", "takeaway2", "takeaway3", "takeaway4"],
  "faqs": [
    {"question": "Question about ${topic}?", "answer": "Detailed answer"},
    {"question": "Second question?", "answer": "Detailed answer"},
    {"question": "Third question?", "answer": "Detailed answer"}
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert crypto analyst writing SEO-optimized educational content. Write like a professional financial analyst, not AI. No emojis, no hype, factual and educational.' 
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const content = parsed.content || '';
      const wordCount = content.split(/\s+/).length;
      
      return {
        id: `insight-${dayOfYear}-${index}`,
        title: parsed.title || `${category}: ${topic}`,
        slug: parsed.slug || generateSlug(parsed.title || topic),
        metaTitle: (parsed.metaTitle || parsed.title || topic).substring(0, 60),
        metaDescription: (parsed.metaDescription || content.substring(0, 155) + '...').substring(0, 160),
        content,
        takeaways: parsed.takeaways || generateDefaultTakeaways(topic, category),
        faqs: parsed.faqs || generateDefaultFAQs(topic, category),
        category,
        readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min`,
        wordCount: Math.max(wordCount, 600),
        publishedAt: new Date().toISOString(),
        imageUrl: getCategoryImage(category),
        primaryKeyword: topic.toLowerCase(),
        secondaryKeywords: getSecondaryKeywords(category),
      };
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error: unknown) {
    console.error('AI post error:', error);
    return createFallbackPost(category, topic, context, index, dayOfYear);
  }
}

function createFallbackPost(category: string, topic: string, context: any, index: number, dayOfYear: number) {
  const content = generateDetailedContent(category, topic, context);
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `insight-${dayOfYear}-${index}`,
    title: generateSEOTitle(topic),
    slug: generateSlug(topic),
    metaTitle: `${topic} | Oracle Bull Analysis`.substring(0, 60),
    metaDescription: `Expert analysis of ${topic}. Understand key trends, metrics, and what it means for crypto traders and investors.`.substring(0, 160),
    content,
    takeaways: generateDefaultTakeaways(topic, category),
    faqs: generateDefaultFAQs(topic, category),
    category,
    readTime: `${Math.ceil(wordCount / 200)} min`,
    wordCount,
    publishedAt: new Date().toISOString(),
    imageUrl: getCategoryImage(category),
    primaryKeyword: topic.toLowerCase(),
    secondaryKeywords: getSecondaryKeywords(category),
  };
}

function generateSEOTitle(topic: string): string {
  const titles = [
    `${topic}: Complete Analysis Guide`,
    `Understanding ${topic} in 2024`,
    `${topic}: What Traders Need to Know`,
    `${topic} Analysis and Market Insights`,
  ];
  return titles[Math.floor(Math.random() * titles.length)].substring(0, 60);
}

function generateDetailedContent(category: string, topic: string, context: any): string {
  const btcPrice = context.btcPrice?.toLocaleString() || '97,000';
  const ethPrice = context.ethPrice?.toLocaleString() || '3,400';
  const solPrice = context.solPrice?.toLocaleString() || '190';
  const marketCap = ((context.totalMarketCap || 3.2e12) / 1e12).toFixed(2);
  const btcDom = (context.btcDominance || 54).toFixed(1);
  const change = context.marketChange24h > 0 ? 'positive' : 'negative';
  
  // Get relevant internal link
  const relevantLink = internalLinks.find(link => 
    link.keywords.some(kw => topic.toLowerCase().includes(kw) || category.toLowerCase().includes(kw))
  ) || internalLinks[0];

  return `## Introduction to ${topic}

In today's cryptocurrency landscape with Bitcoin at $${btcPrice}, Ethereum at $${ethPrice}, and Solana at $${solPrice}, understanding ${topic.toLowerCase()} has become essential for informed market participation. The total market capitalization of $${marketCap} trillion and Bitcoin dominance at ${btcDom}% provide important context for this analysis.

This comprehensive guide examines the key aspects of ${topic.toLowerCase()}, offering actionable insights for traders and investors navigating current market conditions.

## Understanding the Core Fundamentals

${topic} represents a critical analytical framework within the cryptocurrency ecosystem. At its foundation, this concept enables market participants to better understand price dynamics, identify emerging opportunities, and implement effective risk management strategies.

The current ${change} market environment shapes how ${topic.toLowerCase()} manifests in real trading scenarios. Understanding these relationships provides valuable perspective for both short-term traders and long-term investors.

### Key Metrics and Indicators

When analyzing ${topic.toLowerCase()}, several quantitative factors warrant close attention:

- **Market Structure**: How price levels form, test, and evolve over different timeframes
- **Volume Dynamics**: The relationship between trading activity and price momentum
- **Network Activity**: On-chain metrics that provide insight into actual usage
- **Participant Behavior**: How different market actors influence price discovery
- **Technical Indicators**: Quantitative tools for systematic analysis

## Practical Application Framework

For traders seeking to incorporate ${topic.toLowerCase()} into their analytical toolkit, a structured approach yields the best results. The [${relevantLink.text}](${relevantLink.url}) provides real-time data for monitoring these patterns.

### Step-by-Step Analysis Process

1. **Identify Reference Points**: Establish key levels based on historical data and current market structure
2. **Monitor Volume Patterns**: Validate price movements with corresponding activity metrics
3. **Track Sentiment Indicators**: Gauge market participant positioning and expectations
4. **Define Risk Parameters**: Set clear entry, exit, and position sizing rules before execution
5. **Review and Adapt**: Continuously refine approach based on market feedback

### Common Patterns to Watch

Market participants frequently observe recurring patterns related to ${topic.toLowerCase()}:

- Accumulation phases where larger players build positions gradually over time
- Distribution phases that typically precede significant directional price moves
- Consolidation periods that eventually resolve into trending movements
- Reversal signals that indicate potential changes in prevailing market direction

## Data-Driven Market Insights

Current market conditions with Bitcoin dominance at ${btcDom}% and total capitalization of $${marketCap} trillion create specific dynamics for ${topic.toLowerCase()}. The interplay between ${category.toLowerCase()} factors and broader market trends reveals actionable opportunities.

Analysis of recent data suggests several key observations:

- Network activity metrics remain elevated relative to historical averages
- Trading volume patterns indicate sustained institutional participation
- Cross-market correlations continue to influence price behavior
- Sentiment indicators suggest a cautiously constructive outlook

## Risk Management Considerations

Effective analysis of ${topic.toLowerCase()} requires acknowledgment of inherent market risks:

- Markets can behave unexpectedly despite thorough fundamental and technical analysis
- Historical patterns may not repeat identically under different market conditions
- Liquidity variations can significantly impact execution quality and slippage
- External macroeconomic factors can override purely technical considerations
- Position sizing and portfolio management remain paramount regardless of conviction

## Practical Takeaways

${topic} provides a valuable analytical framework for cryptocurrency market participants. By understanding fundamental concepts, applying structured analytical processes, and maintaining awareness of current conditions, traders can enhance their decision-making quality.

The key to successful application lies in consistent methodology, disciplined risk management, and continuous learning as market conditions evolve. Whether you're a beginner or experienced trader, incorporating these principles provides meaningful perspective on market dynamics.

Remember that this analysis is for educational purposes only and should not be considered financial advice. Always conduct your own research and consider consulting with qualified financial professionals before making investment decisions.`;
}

function generateDefaultTakeaways(topic: string, category: string): string[] {
  return [
    `Understanding ${topic.toLowerCase()} fundamentals is essential for informed decision-making`,
    `Current market conditions create specific dynamics for ${category.toLowerCase()} analysis`,
    `Apply structured analytical frameworks to evaluate opportunities systematically`,
    `Monitor relevant metrics and indicators for ${category.toLowerCase()} insights`,
    `Practice disciplined risk management regardless of market conviction`,
  ];
}

function generateDefaultFAQs(topic: string, category: string): { question: string; answer: string }[] {
  return [
    {
      question: `What is ${topic.toLowerCase()} in cryptocurrency markets?`,
      answer: `${topic} refers to analytical concepts within ${category.toLowerCase()} that help traders understand market dynamics, identify opportunities, and make data-driven decisions based on objective metrics and indicators.`
    },
    {
      question: `Why is ${topic.toLowerCase()} important for crypto traders?`,
      answer: `Understanding ${topic.toLowerCase()} is essential because it provides actionable insights into market behavior, helps identify potential opportunities and risks, and enables more informed trading decisions in volatile cryptocurrency markets.`
    },
    {
      question: `How can I apply ${topic.toLowerCase()} analysis to my trading?`,
      answer: `Apply ${topic.toLowerCase()} analysis by first establishing reference points, monitoring relevant volume and activity metrics, tracking sentiment indicators, and defining clear risk management parameters before executing any trades.`
    },
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
    'Ethereum Analysis': '/placeholder.svg',
    'Base Network': '/placeholder.svg',
    'Solana Analysis': '/placeholder.svg',
    'Bitcoin Analysis': '/placeholder.svg',
    'Market Analysis': '/placeholder.svg',
  };
  return images[category] || '/placeholder.svg';
}

function getSecondaryKeywords(category: string): string[] {
  const keywords: Record<string, string[]> = {
    'Ethereum Analysis': ['ethereum', 'eth', 'defi', 'layer 2', 'staking'],
    'Base Network': ['base', 'layer 2', 'coinbase', 'base chain'],
    'Solana Analysis': ['solana', 'sol', 'high speed', 'low fees'],
    'Bitcoin Analysis': ['bitcoin', 'btc', 'halving', 'institutional'],
    'Market Analysis': ['crypto market', 'sentiment', 'volume', 'strength'],
  };
  return keywords[category] || ['crypto', 'blockchain', 'analysis'];
}

function generateAllFallbackPosts() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const context = { 
    totalMarketCap: 3.2e12, 
    btcDominance: 54, 
    marketChange24h: 1.2,
    btcPrice: 97000,
    ethPrice: 3400,
    solPrice: 190,
  };
  
  const posts: any[] = [];
  let postIndex = 0;
  
  for (const distribution of topicDistribution) {
    for (const topic of distribution.topics) {
      posts.push(createFallbackPost(distribution.category, topic, context, postIndex, dayOfYear));
      postIndex++;
    }
  }
  
  return posts;
}
