import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

let todayGenerated = '';
let responseCache: { data: any; ts: number } | null = null;
const CACHE_TTL = 120_000; // 2 min cache for responses

const blogTopics = [
  { category: 'Breaking News', topic: 'Latest cryptocurrency market developments and price action' },
  { category: 'Breaking News', topic: 'Major exchange and regulatory announcements' },
  { category: 'Breaking News', topic: 'Institutional crypto adoption and ETF updates' },
  { category: 'Bitcoin & Ethereum', topic: 'Bitcoin price analysis and whale accumulation' },
  { category: 'Bitcoin & Ethereum', topic: 'Ethereum network upgrades and Layer 2 growth' },
  { category: 'Bitcoin & Ethereum', topic: 'BTC vs ETH performance comparison' },
  { category: 'Altcoins & Projects', topic: 'Trending altcoins and meme coins analysis' },
  { category: 'Altcoins & Projects', topic: 'New token launches and promising projects' },
  { category: 'Altcoins & Projects', topic: 'AI and RWA crypto sector analysis' },
  { category: 'DeFi & Yield', topic: 'DeFi protocol updates and yield opportunities' },
  { category: 'DeFi & Yield', topic: 'Best staking and liquidity farming strategies' },
  { category: 'DeFi & Yield', topic: 'DEX trading volume and liquidity analysis' },
  { category: 'NFTs & Gaming', topic: 'NFT market trends and Web3 gaming updates' },
  { category: 'NFTs & Gaming', topic: 'Metaverse projects and digital collectibles' },
  { category: 'Airdrops & Opportunities', topic: 'Upcoming crypto airdrops and how to qualify' },
  { category: 'Airdrops & Opportunities', topic: 'Passive income strategies in crypto' },
  { category: 'Security & Tech', topic: 'Blockchain security alerts and best practices' },
  { category: 'Security & Tech', topic: 'Smart contract technology and audit updates' },
  { category: 'Market Analysis', topic: 'Technical analysis and key support resistance levels' },
  { category: 'Market Analysis', topic: 'Market sentiment and fear greed index analysis' },
];

const internalLinks = [
  { text: 'real-time market dashboard', url: '/dashboard' },
  { text: 'blockchain analytics', url: '/chain/ethereum' },
  { text: 'crypto strength meter', url: '/strength' },
  { text: 'market intelligence hub', url: '/factory' },
  { text: 'sentiment analysis tools', url: '/sentiment' },
  { text: 'token explorer', url: '/explorer' },
  { text: 'AI price predictions', url: '/predictions' },
  { text: 'token scanner', url: '/scanner' },
];

const categoryImages: Record<string, string> = {
  'Breaking News': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
  'Bitcoin & Ethereum': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80',
  'Altcoins & Projects': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
  'DeFi & Yield': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
  'NFTs & Gaming': 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?w=800&q=80',
  'Airdrops & Opportunities': 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80',
  'Security & Tech': 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=80',
  'Market Analysis': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
};

// Fetch live market data from CoinGecko
async function fetchMarketData() {
  const defaults = { btcPrice: 67000, ethPrice: 1936, solPrice: 81, totalMarketCap: 2.4e12, btcDominance: 54, marketChange: -1.2, trending: '' };
  try {
    const [pricesRes, globalRes, trendingRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=usd&include_24hr_change=true'),
      fetch('https://api.coingecko.com/api/v3/global'),
      fetch('https://api.coingecko.com/api/v3/search/trending'),
    ]);

    if (pricesRes.ok) {
      const p = await pricesRes.json();
      defaults.btcPrice = p.bitcoin?.usd || defaults.btcPrice;
      defaults.ethPrice = p.ethereum?.usd || defaults.ethPrice;
      defaults.solPrice = p.solana?.usd || defaults.solPrice;
    }
    if (globalRes.ok) {
      const g = await globalRes.json();
      defaults.totalMarketCap = g.data?.total_market_cap?.usd || defaults.totalMarketCap;
      defaults.btcDominance = g.data?.market_cap_percentage?.btc || defaults.btcDominance;
      defaults.marketChange = g.data?.market_cap_change_percentage_24h_usd || defaults.marketChange;
    }
    if (trendingRes.ok) {
      const t = await trendingRes.json();
      defaults.trending = (t.coins?.slice(0, 5) || []).map((c: any) => `${c.item?.name} (${c.item?.symbol})`).join(', ');
    }
  } catch (e) {
    console.log('Using fallback market data');
  }
  return defaults;
}

// Generate article using AI
async function generateAIArticle(topic: string, category: string, market: any, index: number): Promise<any> {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const link = internalLinks[index % internalLinks.length];
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Try AI generation first
  if (LOVABLE_API_KEY) {
    try {
      const prompt = `Write a professional crypto blog article about: "${topic}"

Current market data (${today}):
- Bitcoin: $${market.btcPrice.toLocaleString()}
- Ethereum: $${market.ethPrice.toLocaleString()} 
- Solana: $${market.solPrice.toLocaleString()}
- Total Market Cap: $${(market.totalMarketCap / 1e12).toFixed(2)} trillion
- BTC Dominance: ${market.btcDominance.toFixed(1)}%
- 24h Change: ${market.marketChange > 0 ? '+' : ''}${market.marketChange.toFixed(2)}%
- Trending: ${market.trending || 'Bitcoin, Ethereum, Solana'}

Requirements:
1. Write 800-1200 words of unique, expert-level content
2. Use markdown with ## for main headings and ### for subheadings
3. Include specific data points and numbers
4. Add actionable insights for traders
5. Include a natural mention of Oracle Bull's [${link.text}](${link.url})
6. End with a brief disclaimer
7. Be factual and analytical, not hype-driven

Return ONLY valid JSON with this exact structure:
{
  "title": "compelling article title under 60 chars",
  "metaDescription": "SEO meta description under 155 chars",
  "content": "full markdown article content",
  "takeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4"],
  "faqs": [
    {"question": "relevant question?", "answer": "detailed answer"},
    {"question": "relevant question?", "answer": "detailed answer"},
    {"question": "relevant question?", "answer": "detailed answer"}
  ],
  "primaryKeyword": "main SEO keyword"
}`;

      const res = await fetch('https://api.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const wordCount = (parsed.content || '').split(/\s+/).length;
          
          return {
            id: `ai-${dayOfYear}-${index}`,
            title: (parsed.title || topic).substring(0, 60),
            slug: generateSlug(parsed.title || topic),
            metaTitle: `${(parsed.title || topic).substring(0, 50)} | Oracle Bull`,
            metaDescription: (parsed.metaDescription || `${topic} - Latest analysis and insights.`).substring(0, 160),
            content: parsed.content || '',
            takeaways: parsed.takeaways || [],
            faqs: parsed.faqs || [],
            category,
            readTime: `${Math.max(3, Math.ceil(wordCount / 200))} min`,
            wordCount,
            publishedAt: new Date().toISOString(),
            imageUrl: categoryImages[category] || categoryImages['Market Analysis'],
            primaryKeyword: parsed.primaryKeyword || topic.toLowerCase(),
            secondaryKeywords: getKeywords(category),
            internalLink: link,
            aiGenerated: true,
          };
        }
      }
    } catch (e) {
      console.error('AI generation failed for topic:', topic, e);
    }
  }

  // Fallback to template
  return createTemplateArticle(topic, category, market, index, dayOfYear);
}

function createTemplateArticle(topic: string, category: string, market: any, index: number, dayOfYear: number) {
  const link = internalLinks[index % internalLinks.length];
  const content = generateTemplateContent(category, topic, market, link);
  const wordCount = content.split(/\s+/).length;

  return {
    id: `blog-${dayOfYear}-${index}`,
    title: `${topic} - ${new Date().getFullYear()} Update`.substring(0, 60),
    slug: generateSlug(topic),
    metaTitle: `${topic} | Oracle Bull Crypto Blog`.substring(0, 60),
    metaDescription: `${topic}. Get the latest updates, news, and insights on cryptocurrency markets.`.substring(0, 160),
    content,
    takeaways: [
      `Stay updated on ${category.toLowerCase()} developments`,
      `Use proper security practices with crypto protocols`,
      `Diversify and never invest more than you can afford to lose`,
      `Track market conditions using reliable analytics tools`,
    ],
    faqs: [
      { question: `What does ${topic} mean for crypto investors?`, answer: `${topic} represents important developments in the ${category.toLowerCase()} space. Staying informed helps investors make better decisions in this fast-moving market.` },
      { question: `How can I track ${category.toLowerCase()} updates?`, answer: `Use analytics platforms like Oracle Bull for real-time data, follow reliable crypto news sources, and monitor on-chain metrics for the most accurate information.` },
      { question: `Is now a good time to invest in crypto?`, answer: `Cryptocurrency investments carry significant risk. While the market offers opportunities, always do thorough research, understand the risks, and never invest more than you can afford to lose.` },
    ],
    category,
    readTime: `${Math.ceil(wordCount / 200)} min`,
    wordCount,
    publishedAt: new Date().toISOString(),
    imageUrl: categoryImages[category] || categoryImages['Market Analysis'],
    primaryKeyword: topic.toLowerCase(),
    secondaryKeywords: getKeywords(category),
    internalLink: link,
    aiGenerated: false,
  };
}

function generateTemplateContent(category: string, topic: string, market: any, link: any): string {
  const btcPrice = market.btcPrice?.toLocaleString() || '67,000';
  const ethPrice = market.ethPrice?.toLocaleString() || '1,936';
  const solPrice = market.solPrice?.toLocaleString() || '81';
  const marketCap = ((market.totalMarketCap || 2.4e12) / 1e12).toFixed(2);
  const btcDom = (market.btcDominance || 54).toFixed(1);
  const change = market.marketChange > 0 ? `+${market.marketChange.toFixed(2)}%` : `${market.marketChange.toFixed(2)}%`;
  const trending = market.trending || 'Bitcoin, Ethereum, Solana';

  return `## ${topic}

The cryptocurrency market continues evolving in ${new Date().getFullYear()}, with Bitcoin at $${btcPrice}, Ethereum at $${ethPrice}, and Solana at $${solPrice}. The total market cap stands at $${marketCap} trillion (${change} 24h), with BTC dominance at ${btcDom}%.

### Current Market Overview

Today's crypto landscape shows significant activity across the ${category.toLowerCase()} sector. Trending coins include ${trending}. Major exchanges report elevated trading volumes as participants respond to the latest developments.

### Key Developments

Several important factors are shaping this sector:

- **Market Dynamics**: Price action across major assets reflects shifting sentiment and institutional positioning
- **Technical Indicators**: Key support and resistance levels are being tested across multiple timeframes
- **On-Chain Activity**: Network metrics show evolving participation patterns from both retail and institutional players
- **Regulatory Landscape**: Policy developments continue to influence market direction and sentiment

### Analysis and Insights

For active market participants, understanding these dynamics is crucial. The [${link.text}](${link.url}) provides real-time data to help track these movements and make informed decisions.

### What to Watch Next

- Monitor key price levels for Bitcoin and Ethereum
- Track institutional flow data for early trend signals
- Stay informed about upcoming protocol upgrades and launches
- Follow regulatory developments across major jurisdictions

### Risk Considerations

All cryptocurrency investments carry significant risk. Market volatility can lead to substantial losses. Always conduct thorough research, use proper risk management, and never invest more than you can afford to lose.

*This content is for informational purposes only and should not be considered financial advice.*`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check response cache
    if (responseCache && Date.now() - responseCache.ts < CACHE_TTL) {
      return new Response(JSON.stringify(responseCache.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split('T')[0];

    // Check if today's articles exist
    const { data: todayArticles } = await supabase
      .from('blog_articles')
      .select('id')
      .eq('source', 'insights')
      .gte('published_at', `${today}T00:00:00Z`)
      .limit(1);

    const needsGeneration = (!todayArticles || todayArticles.length === 0) && todayGenerated !== today;

    if (needsGeneration) {
      console.log('Generating daily articles with AI...');
      todayGenerated = today;

      const market = await fetchMarketData();

      // Generate articles in small batches to avoid timeout
      const batchSize = 5;
      const allPosts: any[] = [];

      for (let i = 0; i < blogTopics.length; i += batchSize) {
        const batch = blogTopics.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((t, j) => generateAIArticle(t.topic, t.category, market, i + j))
        );
        allPosts.push(...batchResults);
      }

      // Save to database
      const articlesToInsert = allPosts.map(post => ({
        article_id: post.id,
        title: post.title,
        slug: post.slug,
        meta_title: post.metaTitle,
        meta_description: post.metaDescription,
        content: post.content,
        takeaways: post.takeaways,
        faqs: post.faqs,
        category: post.category,
        read_time: post.readTime,
        word_count: post.wordCount,
        published_at: post.publishedAt,
        image_url: post.imageUrl,
        primary_keyword: post.primaryKeyword,
        secondary_keywords: post.secondaryKeywords,
        internal_link: post.internalLink,
        source: 'insights',
      }));

      const { error: insertError } = await supabase
        .from('blog_articles')
        .upsert(articlesToInsert, { onConflict: 'article_id' });

      if (insertError) console.error('Error saving articles:', insertError);
      else console.log(`Saved ${allPosts.length} AI-generated articles`);
    }

    // Fetch all articles
    const { data: allArticles, error: fetchError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('source', 'insights')
      .order('published_at', { ascending: false });

    if (fetchError) throw fetchError;

    const posts = (allArticles || []).map(article => ({
      id: article.article_id,
      title: article.title,
      slug: article.slug,
      metaTitle: article.meta_title,
      metaDescription: article.meta_description,
      content: article.content,
      takeaways: article.takeaways || [],
      faqs: article.faqs || [],
      category: article.category,
      readTime: article.read_time,
      wordCount: article.word_count,
      publishedAt: article.published_at,
      imageUrl: article.image_url,
      primaryKeyword: article.primary_keyword,
      secondaryKeywords: article.secondary_keywords || [],
      internalLink: article.internal_link,
    }));

    const todayCount = posts.filter(p => p.publishedAt?.startsWith(today)).length;

    const result = {
      posts,
      date: today,
      timestamp: Date.now(),
      totalArticles: posts.length,
      todayArticles: todayCount,
    };

    responseCache = { data: result, ts: Date.now() };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('insights-engine error:', error);
    const fallback = generateFallbackPosts();
    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackPosts() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const market = { btcPrice: 67000, ethPrice: 1936, solPrice: 81, totalMarketCap: 2.4e12, btcDominance: 54, marketChange: -1.2, trending: '' };
  const posts = blogTopics.map((t, i) => createTemplateArticle(t.topic, t.category, market, i, dayOfYear));
  return { posts, date: new Date().toISOString().split('T')[0], timestamp: Date.now(), totalArticles: posts.length, todayArticles: posts.length };
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 60).replace(/-$/, '');
}

function getKeywords(category: string): string[] {
  const kw: Record<string, string[]> = {
    'Breaking News': ['crypto news', 'cryptocurrency updates', 'market news'],
    'Bitcoin & Ethereum': ['bitcoin', 'ethereum', 'BTC', 'ETH', 'crypto prices'],
    'Altcoins & Projects': ['altcoins', 'new crypto', 'token launches'],
    'DeFi & Yield': ['DeFi', 'yield farming', 'staking'],
    'NFTs & Gaming': ['NFTs', 'Web3 gaming', 'metaverse'],
    'Airdrops & Opportunities': ['crypto airdrops', 'free crypto', 'staking rewards'],
    'Security & Tech': ['crypto security', 'blockchain', 'smart contracts'],
    'Market Analysis': ['technical analysis', 'crypto trading', 'market sentiment'],
  };
  return kw[category] || ['cryptocurrency', 'blockchain'];
}
