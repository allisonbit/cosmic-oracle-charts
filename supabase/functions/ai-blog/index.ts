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

// 20 rotating content themes for daily variety
const contentThemes = [
  { category: 'Market Structure', topics: ['order flow analysis', 'market microstructure', 'liquidity dynamics', 'price discovery mechanisms'] },
  { category: 'On-Chain Analytics', topics: ['whale tracking patterns', 'exchange flow analysis', 'UTXO analysis', 'address clustering'] },
  { category: 'DeFi Deep Dive', topics: ['yield farming strategies', 'liquidity pool mechanics', 'protocol tokenomics', 'DEX aggregation'] },
  { category: 'Bitcoin Analysis', topics: ['halving cycle dynamics', 'miner behavior patterns', 'institutional accumulation', 'network health metrics'] },
  { category: 'Ethereum Ecosystem', topics: ['gas optimization strategies', 'L2 scaling solutions', 'EIP implementations', 'staking economics'] },
  { category: 'Altcoin Research', topics: ['fundamental analysis frameworks', 'tokenomics evaluation', 'team and development assessment', 'market positioning'] },
  { category: 'Risk Management', topics: ['position sizing strategies', 'portfolio diversification', 'volatility management', 'drawdown protection'] },
  { category: 'Market Sentiment', topics: ['fear and greed indicators', 'social sentiment analysis', 'funding rate signals', 'open interest patterns'] },
  { category: 'Technical Analysis', topics: ['support and resistance levels', 'trend identification methods', 'volume profile analysis', 'indicator confluence'] },
  { category: 'Macro Economics', topics: ['inflation impact on crypto', 'interest rate correlations', 'global liquidity cycles', 'currency devaluation hedging'] },
  { category: 'Blockchain Technology', topics: ['consensus mechanism comparison', 'scalability solutions', 'interoperability protocols', 'zero-knowledge applications'] },
  { category: 'Layer 2 Solutions', topics: ['rollup technology comparison', 'bridge security analysis', 'fee optimization strategies', 'ecosystem development'] },
  { category: 'Stablecoin Analysis', topics: ['backing mechanism comparison', 'depegging risk assessment', 'regulatory considerations', 'yield opportunities'] },
  { category: 'NFT & Digital Assets', topics: ['market cycle analysis', 'utility token frameworks', 'creator economy dynamics', 'marketplace comparison'] },
  { category: 'Trading Psychology', topics: ['emotional discipline strategies', 'cognitive bias management', 'decision-making frameworks', 'risk tolerance assessment'] },
  { category: 'Regulatory Landscape', topics: ['global regulatory comparison', 'compliance frameworks', 'institutional adoption barriers', 'policy impact analysis'] },
  { category: 'Capital Rotation', topics: ['sector rotation patterns', 'narrative-driven flows', 'cross-chain migration', 'smart money tracking'] },
  { category: 'Derivatives Analysis', topics: ['futures basis trading', 'options strategies', 'perpetual funding dynamics', 'liquidation cascade analysis'] },
  { category: 'Network Fundamentals', topics: ['active address metrics', 'transaction volume analysis', 'network value indicators', 'developer activity tracking'] },
  { category: 'Investment Strategies', topics: ['dollar cost averaging optimization', 'value averaging methods', 'momentum strategies', 'mean reversion approaches'] },
];

// Oracle Bull internal links for contextual linking
const internalLinks = [
  { text: 'Oracle Bull analytics dashboard', url: '/dashboard' },
  { text: 'real-time sentiment analysis', url: '/sentiment' },
  { text: 'blockchain-specific metrics', url: '/chain/ethereum' },
  { text: 'crypto strength meter', url: '/strength-meter' },
  { text: 'market event calendar', url: '/crypto-factory' },
  { text: 'token explorer', url: '/explorer' },
  { text: 'whale activity tracker', url: '/sentiment' },
  { text: 'market momentum indicators', url: '/dashboard' },
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

    // Fetch current market data for context
    const [trendingRes, globalRes, newsRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/search/trending'),
      fetch('https://api.coingecko.com/api/v3/global'),
      fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular'),
    ]);

    let trending: any[] = [];
    let globalData: any = {};
    let news: any[] = [];

    if (trendingRes.ok) {
      const data = await trendingRes.json();
      trending = data.coins?.slice(0, 10) || [];
    }

    if (globalRes.ok) {
      const data = await globalRes.json();
      globalData = data.data || {};
    }

    if (newsRes.ok) {
      const data = await newsRes.json();
      news = data.Data?.slice(0, 10) || [];
    }

    // Create rich market context
    const marketContext = {
      totalMarketCap: globalData.total_market_cap?.usd || 0,
      btcDominance: globalData.market_cap_percentage?.btc || 0,
      ethDominance: globalData.market_cap_percentage?.eth || 0,
      marketChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
      activeCoins: globalData.active_cryptocurrencies || 0,
      totalVolume24h: globalData.total_volume?.usd || 0,
      trending: trending.map((t: any) => ({
        name: t.item?.name,
        symbol: t.item?.symbol,
        change: t.item?.data?.price_change_percentage_24h?.usd,
        rank: t.item?.market_cap_rank,
      })),
      headlines: news.map((n: any) => n.title).slice(0, 10),
    };

    // Generate 20 blog posts - batch in groups of 5 for efficiency
    const posts = [];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    
    for (let i = 0; i < 20; i++) {
      // Rotate themes based on day to ensure variety
      const themeIndex = (dayOfYear + i) % contentThemes.length;
      const theme = contentThemes[themeIndex];
      const topicIndex = i % theme.topics.length;
      
      const post = await generateLongFormPost(theme, theme.topics[topicIndex], marketContext, i, dayOfYear);
      posts.push(post);
      
      // Small delay between posts to avoid rate limiting
      if (i > 0 && i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
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
    return new Response(JSON.stringify({ 
      error: 'Failed to generate blog posts',
      posts: generateFallbackPosts(),
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      totalArticles: 20,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateLongFormPost(
  theme: { category: string; topics: string[] }, 
  specificTopic: string,
  context: any, 
  index: number,
  dayOfYear: number
) {
  try {
    if (!LOVABLE_API_KEY) {
      return createFallbackPost(theme.category, specificTopic, context, index);
    }

    // Determine if this post should reference Oracle Bull (30% of posts)
    const shouldReferenceOracle = index % 3 === 0;
    const oracleReference = shouldReferenceOracle 
      ? `\n\nNaturally reference how traders can use analytical tools like real-time dashboards, sentiment trackers, or strength meters to apply these concepts - without promotional language.`
      : '';

    const systemPrompt = `You are an expert crypto analyst and financial writer for Oracle Bull, a cryptocurrency intelligence platform. Your writing must be:
- Professional, authoritative, and data-driven
- 600-800 words minimum (CRITICAL: never below 500 words)
- Educational and analytical, not promotional or hypey
- Written in clear, accessible language for both beginners and experienced traders
- Factually accurate based on provided market data
- Structured with proper headings (H2, H3) and sections

Current Market Context:
- Total Market Cap: $${(context.totalMarketCap / 1e12).toFixed(2)} Trillion
- BTC Dominance: ${context.btcDominance?.toFixed(1)}%
- ETH Dominance: ${context.ethDominance?.toFixed(1)}%
- 24h Market Change: ${context.marketChange24h?.toFixed(2)}%
- Active Cryptocurrencies: ${context.activeCoins?.toLocaleString()}
- 24h Trading Volume: $${(context.totalVolume24h / 1e9).toFixed(1)}B
- Trending: ${context.trending?.map((t: any) => `${t.symbol} (${t.change?.toFixed(1)}%)`).join(', ')}

STRICT RULES:
- NO price predictions or financial advice
- NO clickbait or sensationalized claims
- NO AI disclosure language
- NO generic filler content
- Write as a real crypto analyst would
- Include practical, actionable insights
- Use bullet points where appropriate
- Natural keyword placement for SEO`;

    const userPrompt = `Write a comprehensive long-form article about "${specificTopic}" within the context of ${theme.category}.

REQUIRED STRUCTURE:
1. SEO-Optimized Title (clear, specific, keyword-rich - under 60 characters)
2. Introduction (2-3 paragraphs explaining why this matters to crypto participants)
3. Main Content with H2/H3 sections (detailed analysis, examples, data points)
4. Practical Applications (how readers can use this information)
5. Market Context (current relevance given market conditions)
6. Conclusion (clear summary of key takeaways)
${oracleReference}

Target primary keyword: "${specificTopic}"
Secondary keywords: ${theme.category.toLowerCase()}, crypto analysis, blockchain, market intelligence

Format your response as JSON with these exact fields:
{
  "title": "SEO-optimized title under 60 chars",
  "slug": "url-friendly-slug",
  "metaTitle": "Meta title for SEO (50-60 chars)",
  "metaDescription": "Compelling meta description under 160 chars with primary keyword",
  "content": "Full article content with markdown formatting (## for H2, ### for H3, bullet points, etc.)",
  "takeaways": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3", "Key takeaway 4"]
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return createFallbackPost(theme.category, specificTopic, context, index);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from AI response
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Add internal links naturally to content
        let enrichedContent = parsed.content || aiContent;
        if (shouldReferenceOracle && enrichedContent.length > 200) {
          const link = internalLinks[index % internalLinks.length];
          enrichedContent = enrichedContent.replace(
            /\n\n(?=##)/,
            `\n\nFor deeper insights, traders often leverage [${link.text}](${link.url}) to track these patterns in real-time.\n\n`
          );
        }
        
        const wordCount = enrichedContent.split(/\s+/).length;
        
        return {
          id: `post-${dayOfYear}-${index}`,
          title: parsed.title || `${theme.category}: ${specificTopic}`,
          slug: parsed.slug || generateSlug(parsed.title || specificTopic),
          metaTitle: parsed.metaTitle || parsed.title?.substring(0, 60),
          metaDescription: parsed.metaDescription || enrichedContent.substring(0, 155) + '...',
          content: enrichedContent,
          takeaways: parsed.takeaways || extractTakeaways(enrichedContent),
          category: theme.category,
          readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min`,
          wordCount,
          publishedAt: new Date().toISOString(),
          imageUrl: getCategoryImage(theme.category),
          primaryKeyword: specificTopic,
          secondaryKeywords: [theme.category.toLowerCase(), 'crypto', 'blockchain'],
        };
      }
    } catch (e) {
      console.error('JSON parsing error:', e);
    }

    // Fallback parsing if JSON fails
    const wordCount = aiContent.split(/\s+/).length;
    return {
      id: `post-${dayOfYear}-${index}`,
      title: `${theme.category}: Understanding ${specificTopic}`,
      slug: generateSlug(specificTopic),
      metaTitle: `${specificTopic} Analysis | Oracle Bull`,
      metaDescription: `Deep dive into ${specificTopic} within ${theme.category}. Expert analysis and insights for crypto traders.`,
      content: aiContent.replace(/```json|```/g, '').trim(),
      takeaways: extractTakeaways(aiContent),
      category: theme.category,
      readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min`,
      wordCount,
      publishedAt: new Date().toISOString(),
      imageUrl: getCategoryImage(theme.category),
      primaryKeyword: specificTopic,
      secondaryKeywords: [theme.category.toLowerCase(), 'crypto', 'blockchain'],
    };
  } catch (error) {
    console.error('Error generating post:', error);
    return createFallbackPost(theme.category, specificTopic, context, index);
  }
}

function createFallbackPost(category: string, topic: string, context: any, index: number) {
  const marketCap = ((context.totalMarketCap || 2.5e12) / 1e12).toFixed(2);
  const btcDom = (context.btcDominance || 52).toFixed(1);
  const change = (context.marketChange24h || 0).toFixed(2);
  
  const content = generateDetailedFallbackContent(category, topic, marketCap, btcDom, change);
  const wordCount = content.split(/\s+/).length;
  
  return {
    id: `post-fallback-${index}`,
    title: `${category}: A Comprehensive Guide to ${topic}`,
    slug: generateSlug(`${category}-${topic}`),
    metaTitle: `${topic} Guide | ${category} | Oracle Bull`,
    metaDescription: `Expert analysis of ${topic} in ${category}. Learn key concepts, market implications, and practical applications for crypto traders.`,
    content,
    takeaways: [
      `Understanding ${topic} is essential for informed trading decisions`,
      `Current market conditions with $${marketCap}T market cap influence ${category.toLowerCase()} dynamics`,
      `Apply analytical frameworks to evaluate ${topic} in your trading strategy`,
      `Monitor relevant metrics and indicators for ${category.toLowerCase()} insights`,
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

function generateDetailedFallbackContent(category: string, topic: string, marketCap: string, btcDom: string, change: string): string {
  return `## Introduction to ${topic}

In the dynamic world of cryptocurrency markets, understanding ${topic} has become increasingly important for both retail and institutional participants. With the total crypto market capitalization at $${marketCap} trillion and Bitcoin dominance at ${btcDom}%, the landscape for ${category.toLowerCase()} continues to evolve rapidly.

This comprehensive analysis explores the key aspects of ${topic}, providing practical insights that traders and investors can apply to their decision-making process.

## Understanding the Fundamentals

${topic} represents a critical component of ${category.toLowerCase()} in cryptocurrency markets. At its core, this concept helps market participants understand price movements, identify opportunities, and manage risk effectively.

The current market environment, characterized by a ${parseFloat(change) > 0 ? 'positive' : 'negative'} 24-hour change of ${change}%, provides an interesting backdrop for examining how ${topic} manifests in real trading conditions.

### Key Components

When analyzing ${topic}, several factors deserve attention:

- **Market Structure**: How price levels form and break down over time
- **Volume Dynamics**: The relationship between trading activity and price movements
- **Participant Behavior**: How different market actors influence outcomes
- **Technical Indicators**: Quantitative tools for measuring ${topic.toLowerCase()}

## Practical Applications

For traders looking to incorporate ${topic} into their analysis, consider the following approaches:

### Framework for Analysis

1. **Identify Key Levels**: Establish reference points based on historical data
2. **Monitor Volume**: Validate movements with corresponding trading activity
3. **Track Sentiment**: Gauge market participant positioning and expectations
4. **Set Clear Parameters**: Define entry, exit, and risk management rules

### Common Patterns

Market participants frequently observe certain patterns related to ${topic}:

- Accumulation phases where large players build positions
- Distribution phases preceding significant price movements
- Consolidation periods that resolve into trending moves
- Reversal signals that indicate potential direction changes

## Market Context and Current Relevance

Given the current market conditions with Bitcoin dominance at ${btcDom}% and overall market capitalization of $${marketCap} trillion, ${topic} takes on particular significance.

The relationship between ${category.toLowerCase()} and broader market trends creates opportunities for informed participants who understand these dynamics. By monitoring relevant metrics and maintaining disciplined analysis, traders can better navigate market conditions.

### Risk Considerations

As with any market analysis approach, understanding ${topic} requires acknowledgment of inherent risks:

- Markets can behave unexpectedly despite thorough analysis
- Past patterns may not repeat in future conditions
- Liquidity variations can impact execution quality
- External factors can override technical considerations

## Conclusion

${topic} remains a valuable analytical framework within ${category.toLowerCase()} for cryptocurrency market participants. By understanding the fundamental concepts, applying practical frameworks, and maintaining awareness of current market conditions, traders can enhance their decision-making process.

The key to successful application lies in consistent methodology, proper risk management, and continuous learning as market conditions evolve. Whether you're a beginner or experienced trader, incorporating these concepts into your analysis can provide valuable perspective on market dynamics.`;
}

function generateFallbackPosts() {
  return contentThemes.map((theme, index) => 
    createFallbackPost(theme.category, theme.topics[0], {
      totalMarketCap: 2.5e12,
      btcDominance: 52,
      marketChange24h: 0.5,
    }, index)
  );
}

function extractTakeaways(content: string): string[] {
  const lines = content.split('\n').filter(l => 
    (l.trim().startsWith('-') || l.trim().startsWith('•') || l.trim().startsWith('*')) &&
    l.length > 20 && l.length < 200
  );
  if (lines.length >= 3) {
    return lines.slice(0, 4).map(l => l.replace(/^[-•*]\s*/, '').trim());
  }
  // Extract from numbered lists
  const numbered = content.match(/\d+\.\s+\*\*[^*]+\*\*[^.]+\./g) || [];
  if (numbered.length >= 3) {
    return numbered.slice(0, 4).map(l => l.replace(/^\d+\.\s*\*\*/, '').replace(/\*\*.*/, '').trim());
  }
  return [
    'Understand the fundamental concepts for informed decision-making',
    'Apply analytical frameworks to current market conditions',
    'Monitor relevant metrics and indicators for insights',
    'Maintain disciplined risk management practices',
  ];
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)
    .replace(/-$/, '');
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
