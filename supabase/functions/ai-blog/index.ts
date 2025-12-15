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

    console.log('Generating daily AI blog posts...');

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
      trending = data.coins?.slice(0, 7) || [];
    }

    if (globalRes.ok) {
      const data = await globalRes.json();
      globalData = data.data || {};
    }

    if (newsRes.ok) {
      const data = await newsRes.json();
      news = data.Data?.slice(0, 5) || [];
    }

    // Create context for AI
    const marketContext = {
      totalMarketCap: globalData.total_market_cap?.usd || 0,
      btcDominance: globalData.market_cap_percentage?.btc || 0,
      marketChange24h: globalData.market_cap_change_percentage_24h_usd || 0,
      trending: trending.map((t: any) => ({
        name: t.item?.name,
        symbol: t.item?.symbol,
        change: t.item?.data?.price_change_percentage_24h?.usd,
      })),
      headlines: news.map((n: any) => n.title).slice(0, 5),
    };

    // Generate 10 blog posts with AI
    const blogTopics = [
      { category: 'Market Analysis', prompt: 'current crypto market conditions and outlook' },
      { category: 'Trending', prompt: 'top trending cryptocurrencies and why they are gaining attention' },
      { category: 'DeFi', prompt: 'latest developments in decentralized finance' },
      { category: 'Bitcoin', prompt: 'Bitcoin price analysis and market sentiment' },
      { category: 'Ethereum', prompt: 'Ethereum ecosystem updates and ETH outlook' },
      { category: 'Altcoins', prompt: 'promising altcoin opportunities and analysis' },
      { category: 'NFTs & Gaming', prompt: 'NFT market trends and blockchain gaming news' },
      { category: 'Regulation', prompt: 'latest crypto regulations and their market impact' },
      { category: 'Technology', prompt: 'blockchain technology innovations and upgrades' },
      { category: 'Education', prompt: 'beginner-friendly crypto concepts explained' },
    ];

    const posts = [];

    for (let i = 0; i < 10; i++) {
      const topic = blogTopics[i];
      const post = await generateBlogPost(topic, marketContext, i);
      posts.push(post);
    }

    const result = {
      posts,
      date: today,
      timestamp: Date.now(),
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
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateBlogPost(topic: { category: string; prompt: string }, context: any, index: number) {
  try {
    if (!LOVABLE_API_KEY) {
      return createFallbackPost(topic, context, index);
    }

    const systemPrompt = `You are a crypto journalist writing for Oracle, a cryptocurrency analytics platform. Write engaging, informative content that is:
- Factual and based on current market data
- Educational but not overly technical
- Engaging with clear insights
- Under 300 words
- Include 2-3 key takeaways

Current market data:
- Total Market Cap: $${(context.totalMarketCap / 1e12).toFixed(2)} Trillion
- BTC Dominance: ${context.btcDominance?.toFixed(1)}%
- 24h Market Change: ${context.marketChange24h?.toFixed(2)}%
- Trending coins: ${context.trending?.map((t: any) => t.symbol).join(', ')}`;

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
          { role: 'user', content: `Write a blog post about: ${topic.prompt}. Include a compelling title, the main content, and key takeaways. Format as JSON with fields: title, content, takeaways (array of strings).` },
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return createFallbackPost(topic, context, index);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from AI response
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `post-${index}`,
          title: parsed.title || `${topic.category} Update`,
          content: parsed.content || aiContent,
          takeaways: parsed.takeaways || [],
          category: topic.category,
          readTime: `${Math.ceil((parsed.content || aiContent).split(' ').length / 200)} min`,
          publishedAt: new Date().toISOString(),
          imageUrl: getTopicImage(topic.category),
        };
      }
    } catch (e) {
      // If JSON parsing fails, use the raw content
    }

    return {
      id: `post-${index}`,
      title: `${topic.category}: Today's Insights`,
      content: aiContent.replace(/```json|```/g, '').trim(),
      takeaways: extractTakeaways(aiContent),
      category: topic.category,
      readTime: `${Math.ceil(aiContent.split(' ').length / 200)} min`,
      publishedAt: new Date().toISOString(),
      imageUrl: getTopicImage(topic.category),
    };
  } catch (error) {
    console.error('Error generating post:', error);
    return createFallbackPost(topic, context, index);
  }
}

function createFallbackPost(topic: { category: string; prompt: string }, context: any, index: number) {
  const templates: Record<string, { title: string; content: string; takeaways: string[] }> = {
    'Market Analysis': {
      title: 'Crypto Market Overview: Key Trends to Watch',
      content: `The cryptocurrency market continues to evolve with a total market capitalization of $${((context.totalMarketCap || 2.5e12) / 1e12).toFixed(2)} trillion. Bitcoin dominance stands at ${(context.btcDominance || 52).toFixed(1)}%, indicating ${context.btcDominance > 55 ? 'strong BTC preference among investors' : 'growing interest in altcoins'}. Today's market movement of ${(context.marketChange24h || 0).toFixed(2)}% reflects ${context.marketChange24h > 0 ? 'positive sentiment' : 'cautious trading'}. Traders should monitor key support and resistance levels while considering broader macroeconomic factors that continue to influence crypto markets.`,
      takeaways: ['Monitor BTC dominance for market direction', 'Track volume for trend confirmation', 'Consider macro factors in trading decisions'],
    },
    'Trending': {
      title: 'Top Trending Cryptocurrencies Today',
      content: `Several cryptocurrencies are capturing market attention today. ${context.trending?.[0]?.name || 'Top coins'} leads the trending charts with significant price movement. The surge in interest reflects growing institutional and retail participation in the crypto space. These trending assets often see increased volatility, presenting both opportunities and risks for traders. Understanding the fundamentals behind trending coins helps distinguish sustainable growth from short-term hype.`,
      takeaways: ['Trending coins have higher volatility', 'Research fundamentals before investing', 'Use proper risk management'],
    },
    'DeFi': {
      title: 'DeFi Ecosystem: Latest Developments',
      content: `Decentralized Finance continues to innovate with new protocols and yield opportunities. Total Value Locked across DeFi protocols remains strong, with lending and liquidity protocols leading adoption. New developments in cross-chain interoperability are expanding DeFi accessibility. Users should conduct thorough research on smart contract risks and consider diversifying across multiple protocols to manage risk effectively.`,
      takeaways: ['TVL indicates protocol health', 'Smart contract risks require due diligence', 'Cross-chain DeFi is growing'],
    },
    'Bitcoin': {
      title: 'Bitcoin Analysis: Price Levels and Market Sentiment',
      content: `Bitcoin continues to be the anchor of the cryptocurrency market. Current price action reflects ongoing institutional interest and retail adoption. Key technical levels provide important reference points for traders. The Bitcoin halving cycle and macroeconomic conditions continue to influence long-term price trajectory. HODLers maintain strong conviction while traders navigate short-term volatility.`,
      takeaways: ['Monitor key support/resistance levels', 'Halving cycles affect long-term trends', 'Institutional flows impact price'],
    },
    'Ethereum': {
      title: 'Ethereum Ecosystem Update',
      content: `Ethereum's ecosystem continues to expand with Layer 2 solutions driving scalability. The network's transition to proof-of-stake has improved energy efficiency and tokenomics. DeFi and NFT activity on Ethereum remains robust despite competition from alternative chains. Upcoming protocol upgrades promise further improvements to transaction throughput and user experience.`,
      takeaways: ['Layer 2 solutions reduce fees', 'PoS improves sustainability', 'Watch upcoming protocol upgrades'],
    },
    'Altcoins': {
      title: 'Altcoin Opportunities: What to Watch',
      content: `The altcoin market presents diverse opportunities across various sectors including AI, gaming, and real-world assets. Projects with strong fundamentals and active development continue to attract attention. Risk management is crucial when exploring smaller market cap tokens. Diversification across different sectors can help balance portfolio risk while capturing growth potential.`,
      takeaways: ['Research project fundamentals thoroughly', 'Smaller caps carry higher risk', 'Diversify across sectors'],
    },
    'NFTs & Gaming': {
      title: 'NFT & Gaming Crypto Trends',
      content: `The NFT and blockchain gaming sectors continue to evolve beyond speculative trading. Gaming projects focus on sustainable economics and engaging gameplay. NFT utility expands into music, real estate, and identity verification. The metaverse concept connects various digital experiences through blockchain technology. Long-term success depends on genuine user adoption and value creation.`,
      takeaways: ['Focus on utility over speculation', 'Gaming economics matter for sustainability', 'Watch for mainstream adoption signals'],
    },
    'Regulation': {
      title: 'Crypto Regulation: Global Developments',
      content: `Regulatory frameworks around the world continue to evolve for cryptocurrencies. Clear regulations can provide legitimacy and attract institutional participation. Different jurisdictions take varying approaches from embracing innovation to implementing strict controls. Staying informed about regulatory developments helps navigate compliance requirements and understand market implications.`,
      takeaways: ['Regulations vary by jurisdiction', 'Compliance is increasingly important', 'Clear rules can benefit adoption'],
    },
    'Technology': {
      title: 'Blockchain Technology: Latest Innovations',
      content: `Blockchain technology advances with new consensus mechanisms, scaling solutions, and privacy features. Zero-knowledge proofs enable enhanced privacy while maintaining verifiability. Cross-chain communication protocols improve interoperability between networks. These technological developments lay the foundation for broader blockchain adoption across industries beyond cryptocurrency trading.`,
      takeaways: ['ZK technology enhances privacy', 'Interoperability connects ecosystems', 'Innovation drives long-term value'],
    },
    'Education': {
      title: 'Crypto Basics: Essential Concepts Explained',
      content: `Understanding cryptocurrency fundamentals is essential for navigating this market. Wallets store private keys that control your assets - not your keys, not your coins. Market orders execute immediately while limit orders wait for specific prices. Dollar-cost averaging reduces timing risk for long-term investors. Security practices like two-factor authentication and hardware wallets protect against common threats.`,
      takeaways: ['Secure your private keys properly', 'Understand order types before trading', 'DCA reduces timing risk'],
    },
  };

  const template = templates[topic.category] || templates['Market Analysis'];
  
  return {
    id: `post-${index}`,
    title: template.title,
    content: template.content,
    takeaways: template.takeaways,
    category: topic.category,
    readTime: `${Math.ceil(template.content.split(' ').length / 200)} min`,
    publishedAt: new Date().toISOString(),
    imageUrl: getTopicImage(topic.category),
  };
}

function generateFallbackPosts() {
  const categories = ['Market Analysis', 'Trending', 'DeFi', 'Bitcoin', 'Ethereum', 'Altcoins', 'NFTs & Gaming', 'Regulation', 'Technology', 'Education'];
  return categories.map((category, index) => 
    createFallbackPost({ category, prompt: '' }, {}, index)
  );
}

function extractTakeaways(content: string): string[] {
  const lines = content.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'));
  return lines.slice(0, 3).map(l => l.replace(/^[-•]\s*/, '').trim());
}

function getTopicImage(category: string): string {
  const images: Record<string, string> = {
    'Market Analysis': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Trending': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    'DeFi': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'Bitcoin': 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=800',
    'Ethereum': 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
    'Altcoins': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    'NFTs & Gaming': 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800',
    'Regulation': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'Technology': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    'Education': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
  };
  return images[category] || images['Market Analysis'];
}
