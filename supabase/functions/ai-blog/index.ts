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

// 20 rotating content themes
const contentThemes = [
  { category: 'Market Structure', topics: ['order flow analysis', 'market microstructure', 'liquidity dynamics', 'price discovery mechanisms'] },
  { category: 'On-Chain Analytics', topics: ['whale tracking patterns', 'exchange flow analysis', 'UTXO analysis', 'address clustering'] },
  { category: 'DeFi Deep Dive', topics: ['yield farming strategies', 'liquidity pool mechanics', 'protocol tokenomics', 'DEX aggregation'] },
  { category: 'Bitcoin Analysis', topics: ['halving cycle dynamics', 'miner behavior patterns', 'institutional accumulation', 'network health metrics'] },
  { category: 'Ethereum Ecosystem', topics: ['gas optimization strategies', 'L2 scaling solutions', 'EIP implementations', 'staking economics'] },
  { category: 'Altcoin Research', topics: ['fundamental analysis frameworks', 'tokenomics evaluation', 'team assessment', 'market positioning'] },
  { category: 'Risk Management', topics: ['position sizing strategies', 'portfolio diversification', 'volatility management', 'drawdown protection'] },
  { category: 'Market Sentiment', topics: ['fear and greed indicators', 'social sentiment analysis', 'funding rate signals', 'open interest patterns'] },
  { category: 'Technical Analysis', topics: ['support and resistance levels', 'trend identification methods', 'volume profile analysis', 'indicator confluence'] },
  { category: 'Macro Economics', topics: ['inflation impact on crypto', 'interest rate correlations', 'global liquidity cycles', 'currency devaluation hedging'] },
  { category: 'Blockchain Technology', topics: ['consensus mechanisms', 'scalability solutions', 'interoperability protocols', 'zero-knowledge proofs'] },
  { category: 'Layer 2 Solutions', topics: ['rollup technology', 'bridge security analysis', 'fee optimization', 'ecosystem development'] },
  { category: 'Stablecoin Analysis', topics: ['backing mechanisms', 'depegging risk assessment', 'regulatory considerations', 'yield opportunities'] },
  { category: 'NFT & Digital Assets', topics: ['market cycle analysis', 'utility token frameworks', 'creator economy', 'marketplace comparison'] },
  { category: 'Trading Psychology', topics: ['emotional discipline', 'cognitive bias management', 'decision frameworks', 'risk tolerance'] },
  { category: 'Regulatory Landscape', topics: ['global regulatory comparison', 'compliance frameworks', 'institutional barriers', 'policy impact'] },
  { category: 'Capital Rotation', topics: ['sector rotation patterns', 'narrative-driven flows', 'cross-chain migration', 'smart money tracking'] },
  { category: 'Derivatives Analysis', topics: ['futures basis trading', 'options strategies', 'perpetual funding', 'liquidation cascades'] },
  { category: 'Network Fundamentals', topics: ['active address metrics', 'transaction volume', 'network value indicators', 'developer activity'] },
  { category: 'Investment Strategies', topics: ['dollar cost averaging', 'value averaging methods', 'momentum strategies', 'mean reversion'] },
];

// Internal links for Oracle Bull
const internalLinks = [
  { text: 'Oracle Bull analytics dashboard', url: '/dashboard' },
  { text: 'real-time sentiment analysis', url: '/sentiment' },
  { text: 'blockchain-specific metrics', url: '/chain/ethereum' },
  { text: 'crypto strength meter', url: '/strength-meter' },
  { text: 'market event calendar', url: '/crypto-factory' },
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

    console.log('Generating 20 daily AI blog posts...');

    // Fetch market data for context
    let marketContext = {
      totalMarketCap: 2.5e12,
      btcDominance: 52,
      ethDominance: 18,
      marketChange24h: 0.5,
      activeCoins: 10000,
      totalVolume24h: 80e9,
      trending: [] as any[],
      headlines: [] as string[],
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
        marketContext.totalVolume24h = data.data?.total_volume?.usd || marketContext.totalVolume24h;
      }
    } catch (e) {
      console.log('Using fallback market data');
    }

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Generate posts - mix AI and fallback for reliability
    const posts = [];
    const aiPostCount = LOVABLE_API_KEY ? 8 : 0; // Generate 8 AI posts, rest are fallback for speed
    
    // Generate AI posts in parallel batches
    if (LOVABLE_API_KEY && aiPostCount > 0) {
      const aiPromises = [];
      for (let i = 0; i < aiPostCount; i++) {
        const themeIndex = (dayOfYear + i) % contentThemes.length;
        const theme = contentThemes[themeIndex];
        const topicIndex = i % theme.topics.length;
        aiPromises.push(generateAIPost(theme, theme.topics[topicIndex], marketContext, i, dayOfYear));
      }
      
      const aiResults = await Promise.allSettled(aiPromises);
      for (const result of aiResults) {
        if (result.status === 'fulfilled') {
          posts.push(result.value);
        }
      }
    }
    
    // Fill remaining with fallback posts
    const remaining = 20 - posts.length;
    const currentCount = posts.length;
    for (let i = 0; i < remaining; i++) {
      const idx = currentCount + i;
      const themeIdx = (dayOfYear + idx) % contentThemes.length;
      const themeData = contentThemes[themeIdx];
      const topicIdx = idx % themeData.topics.length;
      posts.push(createFallbackPost(themeData.category, themeData.topics[topicIdx], marketContext, idx, dayOfYear));
    }

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
  } catch (error) {
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

async function generateAIPost(
  theme: { category: string; topics: string[] }, 
  specificTopic: string,
  context: any, 
  index: number,
  dayOfYear: number
) {
  try {
    const shouldReferenceOracle = index % 3 === 0;
    const oracleRef = shouldReferenceOracle ? ' Reference analytical tools like dashboards or sentiment trackers naturally.' : '';

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
            content: `You are a crypto analyst. Write professional, educational content. Market: $${(context.totalMarketCap / 1e12).toFixed(2)}T cap, ${context.btcDominance?.toFixed(1)}% BTC dominance.` 
          },
          { 
            role: 'user', 
            content: `Write a 600-word article about "${specificTopic}" in ${theme.category}.${oracleRef}

Format as JSON:
{"title":"SEO title under 60 chars","slug":"url-slug","metaTitle":"Meta title","metaDescription":"Meta description under 160 chars","content":"Full article with ## H2 and ### H3 headings, bullet points","takeaways":["takeaway1","takeaway2","takeaway3"]}` 
          },
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
      let content = parsed.content || aiContent;
      
      // Add internal link
      if (shouldReferenceOracle && content.length > 200) {
        const link = internalLinks[index % internalLinks.length];
        content = content.replace(/\n\n(?=##)/, `\n\nFor deeper insights, traders leverage [${link.text}](${link.url}) to track these patterns.\n\n`);
      }
      
      const wordCount = content.split(/\s+/).length;
      
      return {
        id: `post-${dayOfYear}-${index}`,
        title: parsed.title || `${theme.category}: ${specificTopic}`,
        slug: parsed.slug || generateSlug(parsed.title || specificTopic),
        metaTitle: parsed.metaTitle || parsed.title?.substring(0, 60),
        metaDescription: parsed.metaDescription || content.substring(0, 155) + '...',
        content,
        takeaways: parsed.takeaways || ['Understand key concepts', 'Apply to your strategy', 'Monitor relevant metrics', 'Practice risk management'],
        category: theme.category,
        readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min`,
        wordCount,
        publishedAt: new Date().toISOString(),
        imageUrl: getCategoryImage(theme.category),
        primaryKeyword: specificTopic,
        secondaryKeywords: [theme.category.toLowerCase(), 'crypto', 'blockchain'],
      };
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('AI post error:', error);
    return createFallbackPost(theme.category, specificTopic, context, index, dayOfYear);
  }
}

function createFallbackPost(category: string, topic: string, context: any, index: number, dayOfYear: number) {
  const marketCap = ((context.totalMarketCap || 2.5e12) / 1e12).toFixed(2);
  const btcDom = (context.btcDominance || 52).toFixed(1);
  const change = (context.marketChange24h || 0).toFixed(2);
  
  const content = generateContent(category, topic, marketCap, btcDom, change);
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `post-${dayOfYear}-${index}`,
    title: `Understanding ${topic} in ${category}`,
    slug: generateSlug(`${category}-${topic}-guide`),
    metaTitle: `${topic} Guide | ${category} | Oracle Bull`,
    metaDescription: `Expert analysis of ${topic} in ${category}. Learn key concepts and practical applications for crypto traders and investors.`,
    content,
    takeaways: [
      `Understanding ${topic} is essential for informed decisions`,
      `Current market conditions influence ${category.toLowerCase()} dynamics`,
      `Apply analytical frameworks to evaluate ${topic}`,
      `Monitor relevant metrics for ${category.toLowerCase()} insights`,
    ],
    category,
    readTime: `${Math.ceil(wordCount / 200)} min`,
    wordCount,
    publishedAt: new Date().toISOString(),
    imageUrl: getCategoryImage(category),
    primaryKeyword: topic,
    secondaryKeywords: [category.toLowerCase(), 'crypto analysis', 'blockchain'],
  };
}

function generateContent(category: string, topic: string, marketCap: string, btcDom: string, change: string): string {
  const direction = parseFloat(change) > 0 ? 'positive' : 'negative';
  
  return `## Introduction to ${topic}

In the cryptocurrency markets, understanding ${topic} has become essential for participants at all levels. With the total market capitalization at $${marketCap} trillion and Bitcoin dominance at ${btcDom}%, the landscape for ${category.toLowerCase()} analysis continues to evolve.

This analysis explores the key aspects of ${topic}, providing actionable insights for traders and investors navigating today's market environment.

## Understanding the Fundamentals

${topic} represents a critical component within ${category.toLowerCase()}. At its core, this concept helps market participants understand price dynamics, identify opportunities, and manage risk effectively.

The current market environment, characterized by a ${direction} 24-hour change of ${change}%, provides context for examining how ${topic} manifests in real trading conditions.

### Key Components to Monitor

When analyzing ${topic}, several factors deserve attention:

- **Market Structure**: How price levels form and evolve over time
- **Volume Dynamics**: The relationship between trading activity and price movements
- **Participant Behavior**: How different market actors influence outcomes
- **Technical Indicators**: Quantitative tools for measuring ${topic.toLowerCase()} effectively

## Practical Applications

For traders looking to incorporate ${topic} into their analysis, consider these approaches:

### Framework for Analysis

1. **Identify Key Levels**: Establish reference points based on historical data and current market structure
2. **Monitor Volume**: Validate price movements with corresponding trading activity patterns
3. **Track Sentiment**: Gauge market participant positioning and expectations through available indicators
4. **Set Clear Parameters**: Define entry, exit, and risk management rules before executing any positions

### Common Patterns and Signals

Market participants frequently observe certain patterns related to ${topic}:

- Accumulation phases where institutional players build positions gradually
- Distribution phases that often precede significant directional moves
- Consolidation periods that eventually resolve into trending movements
- Reversal signals indicating potential changes in market direction

## Market Context and Relevance

Given the current conditions with Bitcoin dominance at ${btcDom}% and total market capitalization of $${marketCap} trillion, ${topic} takes on particular significance for active market participants.

The interplay between ${category.toLowerCase()} factors and broader market trends creates opportunities for informed traders who understand these dynamics thoroughly.

### Risk Considerations

As with any analytical approach, understanding ${topic} requires acknowledgment of inherent market risks:

- Markets can behave unexpectedly despite thorough analysis
- Historical patterns may not repeat in future conditions
- Liquidity variations can significantly impact execution quality
- External factors can override technical considerations

## Conclusion

${topic} remains a valuable analytical framework within ${category.toLowerCase()} for cryptocurrency market participants. By understanding fundamental concepts, applying practical frameworks, and maintaining awareness of current conditions, traders can enhance their decision-making process.

The key to successful application lies in consistent methodology, proper risk management, and continuous learning as market conditions evolve. Whether beginner or experienced, incorporating these concepts provides valuable perspective on market dynamics.`;
}

function generateAllFallbackPosts() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const context = { totalMarketCap: 2.5e12, btcDominance: 52, marketChange24h: 0.5 };
  
  return contentThemes.map((theme, index) => 
    createFallbackPost(theme.category, theme.topics[index % theme.topics.length], context, index, dayOfYear)
  );
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 60).replace(/-$/, '');
}

function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    'Market Structure': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    'On-Chain Analytics': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    'DeFi Deep Dive': 'https://images.unsplash.com/photo-1642751227050-feb02d648136?w=800&q=80',
    'Bitcoin Analysis': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
    'Ethereum Ecosystem': 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80',
    'Altcoin Research': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    'Risk Management': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    'Market Sentiment': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    'Technical Analysis': 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80',
    'Macro Economics': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
    'Blockchain Technology': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    'Layer 2 Solutions': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'Stablecoin Analysis': 'https://images.unsplash.com/photo-1621501103258-8d0d47b43f7b?w=800&q=80',
    'NFT & Digital Assets': 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80',
    'Trading Psychology': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'Regulatory Landscape': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    'Capital Rotation': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'Derivatives Analysis': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    'Network Fundamentals': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'Investment Strategies': 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&q=80',
  };
  return images[category] || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80';
}
