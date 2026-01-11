import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const MAX_BODY_SIZE = 10 * 1024; // 10KB

// Input validation schema
const contentRefreshSchema = z.object({
  count: z.number().int().min(1).max(10).optional().default(3)
});

interface RefreshedArticle {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  takeaways: string[];
  faqs: { question: string; answer: string }[];
  category: string;
  readTime: string;
  wordCount: number;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  internalLinks: { text: string; url: string }[];
}

const CONTENT_THEMES = [
  { topic: 'Bitcoin price analysis and market cycles', category: 'Market Analysis', keyword: 'bitcoin price' },
  { topic: 'Ethereum network upgrades and ecosystem growth', category: 'Blockchain', keyword: 'ethereum network' },
  { topic: 'DeFi protocols and yield strategies', category: 'DeFi', keyword: 'defi protocols' },
  { topic: 'Layer 2 scaling solutions comparison', category: 'Technology', keyword: 'layer 2 scaling' },
  { topic: 'Crypto market sentiment indicators', category: 'Sentiment', keyword: 'crypto sentiment' },
  { topic: 'Whale wallet tracking and analysis', category: 'On-Chain', keyword: 'whale tracking' },
  { topic: 'NFT market trends and valuations', category: 'NFTs', keyword: 'nft market' },
  { topic: 'Stablecoin mechanics and risks', category: 'Stablecoins', keyword: 'stablecoin risks' },
  { topic: 'Crypto regulatory developments', category: 'Regulation', keyword: 'crypto regulation' },
  { topic: 'Technical analysis patterns in crypto', category: 'Trading', keyword: 'crypto technical analysis' },
];

const INTERNAL_LINKS = [
  { text: 'real-time crypto dashboard', url: '/dashboard' },
  { text: 'crypto strength meter', url: '/strength' },
  { text: 'market events calendar', url: '/factory' },
  { text: 'wallet scanner tool', url: '/portfolio' },
  { text: 'sentiment analysis', url: '/sentiment' },
  { text: 'token explorer', url: '/explorer' },
  { text: 'Ethereum analytics', url: '/chain/ethereum' },
  { text: 'Solana ecosystem', url: '/chain/solana' },
  { text: 'Base chain metrics', url: '/chain/base' },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function getCategoryImage(category: string): string {
  const images: Record<string, string> = {
    'Market Analysis': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    'Blockchain': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    'DeFi': 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    'Sentiment': 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800',
    'On-Chain': 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
    'NFTs': 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800',
    'Stablecoins': 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    'Regulation': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    'Trading': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  };
  return images[category] || images['Market Analysis'];
}

function selectRandomLinks(count: number): { text: string; url: string }[] {
  const shuffled = [...INTERNAL_LINKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function generateRefreshedArticle(theme: typeof CONTENT_THEMES[0]): Promise<RefreshedArticle | null> {
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const internalLinks = selectRandomLinks(3);
  
  const prompt = `Write a comprehensive, SEO-optimized article about "${theme.topic}" for a crypto analytics platform.

Requirements:
- Title: Engaging, includes "${theme.keyword}", under 60 characters
- Length: 600-900 words minimum
- Include 3-5 FAQ questions with answers at the end
- Include practical insights and current market context
- Natural keyword placement for "${theme.keyword}"
- Professional, analytical tone like a crypto researcher
- Include 3-5 key takeaways

Structure:
1. Introduction (why this matters now)
2. Main sections with H2 headings
3. Practical insights with examples
4. Market context and implications
5. Key takeaways (bullet points)
6. FAQ section (3-5 Q&A pairs)

Internal links to naturally include:
${internalLinks.map(l => `- "${l.text}" (${l.url})`).join('\n')}

Return JSON format:
{
  "title": "...",
  "metaTitle": "... | Oracle Bull",
  "metaDescription": "... (max 155 chars)",
  "content": "... (full article in markdown)",
  "takeaways": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}, ...],
  "secondaryKeywords": ["...", "..."]
}`;

  try {
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
            content: 'You are an expert crypto analyst and SEO content writer. Generate high-quality, factual articles optimized for search engines. Always return valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    const wordCount = parsed.content.split(/\s+/).length;
    const readTime = `${Math.ceil(wordCount / 200)} min read`;

    return {
      id: `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: parsed.title,
      slug: generateSlug(parsed.title),
      metaTitle: parsed.metaTitle,
      metaDescription: parsed.metaDescription,
      content: parsed.content,
      takeaways: parsed.takeaways || [],
      faqs: parsed.faqs || [],
      category: theme.category,
      readTime,
      wordCount,
      publishedAt: today,
      updatedAt: new Date().toISOString(),
      imageUrl: getCategoryImage(theme.category),
      primaryKeyword: theme.keyword,
      secondaryKeywords: parsed.secondaryKeywords || [],
      internalLinks,
    };
  } catch (error) {
    console.error('Error generating article:', error);
    return null;
  }
}

function createFallbackArticle(theme: typeof CONTENT_THEMES[0]): RefreshedArticle {
  const today = new Date().toISOString().split('T')[0];
  const internalLinks = selectRandomLinks(3);
  
  const titles: Record<string, string> = {
    'Market Analysis': 'Understanding Crypto Market Cycles and Price Action',
    'Blockchain': 'Blockchain Technology Evolution and Network Growth',
    'DeFi': 'Navigating DeFi Protocols: Strategies and Risks',
    'Technology': 'Scaling Solutions: The Future of Blockchain Performance',
    'Sentiment': 'Market Sentiment Analysis: Reading Crypto Markets',
    'On-Chain': 'On-Chain Analytics: Tracking Smart Money Movements',
    'NFTs': 'NFT Market Dynamics and Valuation Frameworks',
    'Stablecoins': 'Stablecoin Mechanics: Understanding Digital Dollars',
    'Regulation': 'Crypto Regulation: Global Developments and Impact',
    'Trading': 'Technical Analysis in Crypto: Patterns That Work',
  };

  const content = `# ${titles[theme.category]}

The cryptocurrency market continues to evolve rapidly, presenting both opportunities and challenges for investors and analysts alike. Understanding the fundamentals of ${theme.topic.toLowerCase()} is essential for navigating this dynamic landscape.

## Current Market Context

Today's crypto markets are characterized by increasing institutional participation, evolving regulatory frameworks, and technological innovations. The intersection of these factors creates unique dynamics that savvy analysts must understand.

Market participants who leverage tools like our [${internalLinks[0]?.text}](${internalLinks[0]?.url}) gain significant advantages in identifying trends and opportunities before they become mainstream.

## Key Factors to Consider

When analyzing ${theme.topic.toLowerCase()}, several factors deserve attention:

1. **Market Structure**: Understanding how different market participants interact
2. **Technical Indicators**: Using data-driven analysis for decision support
3. **On-Chain Metrics**: Leveraging blockchain transparency for insights
4. **Sentiment Analysis**: Gauging market psychology and positioning

Our [${internalLinks[1]?.text}](${internalLinks[1]?.url}) provides real-time insights into these factors.

## Practical Applications

Implementing effective analysis strategies requires:

- Regular monitoring of key metrics and indicators
- Understanding correlations between different market factors
- Staying informed about technological and regulatory developments
- Using comprehensive analytics platforms for data aggregation

The [${internalLinks[2]?.text}](${internalLinks[2]?.url}) offers powerful capabilities for tracking these metrics.

## Looking Ahead

As the crypto market matures, analytical frameworks will continue to evolve. Staying ahead requires commitment to continuous learning and access to quality data and tools.

## Key Takeaways

- Understanding market fundamentals is essential for success
- Multiple analytical frameworks provide more complete pictures
- Technology and tools significantly enhance analysis capabilities
- Continuous learning remains crucial in this evolving space
- Risk management should always be prioritized`;

  const faqs = [
    {
      question: `What is the best way to analyze ${theme.keyword}?`,
      answer: `The most effective approach combines multiple data sources including on-chain metrics, technical analysis, and sentiment indicators. Using comprehensive platforms that aggregate this data provides the clearest picture.`
    },
    {
      question: `How often should I monitor ${theme.keyword} data?`,
      answer: `For active traders, real-time monitoring is essential. For longer-term investors, daily or weekly reviews of key metrics typically suffice. The frequency should match your investment timeframe.`
    },
    {
      question: `What tools are best for ${theme.keyword} analysis?`,
      answer: `Comprehensive analytics platforms that combine price data, on-chain metrics, and sentiment analysis offer the most complete toolkit. Look for platforms with real-time updates and historical data access.`
    }
  ];

  return {
    id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: titles[theme.category],
    slug: generateSlug(titles[theme.category]),
    metaTitle: `${titles[theme.category]} | Oracle Bull`,
    metaDescription: `Learn about ${theme.topic.toLowerCase()} with comprehensive analysis and practical insights for crypto investors and traders.`,
    content,
    takeaways: [
      'Understanding market fundamentals is essential',
      'Multiple analytical frameworks provide complete pictures',
      'Technology and tools enhance analysis capabilities',
      'Continuous learning is crucial in evolving markets'
    ],
    faqs,
    category: theme.category,
    readTime: '4 min read',
    wordCount: 450,
    publishedAt: today,
    updatedAt: new Date().toISOString(),
    imageUrl: getCategoryImage(theme.category),
    primaryKeyword: theme.keyword,
    secondaryKeywords: [theme.topic.split(' ')[0], 'crypto analysis', 'market insights'],
    internalLinks,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check body size limit
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request body too large. Maximum size is 10KB.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    let body = {};
    try {
      const text = await req.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is fine, use defaults
    }

    const validationResult = contentRefreshSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validationResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { count } = validationResult.data;
    
    console.log(`Generating ${count} refreshed articles...`);
    
    const articles: RefreshedArticle[] = [];
    const shuffledThemes = [...CONTENT_THEMES].sort(() => Math.random() - 0.5);
    const selectedThemes = shuffledThemes.slice(0, Math.min(count, CONTENT_THEMES.length));
    
    for (const theme of selectedThemes) {
      console.log(`Generating article for: ${theme.topic}`);
      
      const article = await generateRefreshedArticle(theme);
      if (article) {
        articles.push(article);
      } else {
        // Use fallback if AI generation fails
        articles.push(createFallbackArticle(theme));
      }
    }
    
    console.log(`Generated ${articles.length} articles`);
    
    return new Response(JSON.stringify({
      success: true,
      articlesGenerated: articles.length,
      articles,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Content refresh error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
