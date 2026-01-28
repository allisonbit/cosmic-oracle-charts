import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const seoMonitorRequestSchema = z.object({
  routes: z.array(z.string().max(200)).max(50).optional(),
  fullCheck: z.boolean().optional().default(true),
}).optional();

// Max request body size (8KB)
const MAX_BODY_SIZE = 8 * 1024;

const SITE_URL = 'https://oraclebull.com';

// All routes to monitor - comprehensive list
const ALL_ROUTES = [
  '/',
  '/dashboard',
  '/strength',
  '/strength-meter',
  '/factory',
  '/portfolio',
  '/sentiment',
  '/explorer',
  '/learn',
  '/contact',
  '/sitemap',
  '/insights',
  '/chain/ethereum',
  '/chain/solana',
  '/chain/base',
  '/chain/arbitrum',
  '/chain/polygon',
  '/chain/optimism',
  '/chain/avalanche',
  '/chain/bnb',
];

interface HealthCheckResult {
  url: string;
  status: number;
  responseTime: number;
  hasTitle: boolean;
  hasDescription: boolean;
  hasH1: boolean;
  hasCanonical: boolean;
  hasSchema: boolean;
  hasOgTags: boolean;
  hasTwitterCards: boolean;
  hasViewport: boolean;
  hasRobotsMeta: boolean;
  hasAltText: boolean;
  mobileFriendly: boolean;
  contentLength: number;
  issues: string[];
  warnings: string[];
}

interface SEOReport {
  timestamp: string;
  siteUrl: string;
  totalPages: number;
  healthyPages: number;
  pagesWithIssues: number;
  pagesWithWarnings: number;
  brokenLinks: string[];
  missingMeta: string[];
  slowPages: string[];
  missingOgTags: string[];
  missingTwitterCards: string[];
  missingSchema: string[];
  results: HealthCheckResult[];
  recommendations: string[];
  seoScore: number;
  coreWebVitals: {
    averageResponseTime: number;
    fastPages: number;
    slowPages: number;
  };
}

async function checkPageHealth(path: string): Promise<HealthCheckResult> {
  const url = `${SITE_URL}${path}`;
  const issues: string[] = [];
  const warnings: string[] = [];
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OracleBull-SEO-Monitor/2.0; +https://oraclebull.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    
    const responseTime = Date.now() - startTime;
    const html = await response.text();
    const contentLength = html.length;
    
    // Essential SEO elements
    const hasTitle = /<title[^>]*>.+<\/title>/i.test(html);
    const hasDescription = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i.test(html);
    const hasH1 = /<h1[^>]*>.+<\/h1>/is.test(html);
    const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
    const hasSchema = /application\/ld\+json/i.test(html);
    
    // Open Graph tags
    const hasOgTitle = /<meta[^>]*property=["']og:title["'][^>]*>/i.test(html);
    const hasOgDescription = /<meta[^>]*property=["']og:description["'][^>]*>/i.test(html);
    const hasOgImage = /<meta[^>]*property=["']og:image["'][^>]*>/i.test(html);
    const hasOgTags = hasOgTitle && hasOgDescription && hasOgImage;
    
    // Twitter Cards
    const hasTwitterCard = /<meta[^>]*name=["']twitter:card["'][^>]*>/i.test(html);
    const hasTwitterTitle = /<meta[^>]*name=["']twitter:title["'][^>]*>/i.test(html);
    const hasTwitterCards = hasTwitterCard && hasTwitterTitle;
    
    // Technical SEO
    const hasViewport = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
    const hasRobotsMeta = /<meta[^>]*name=["']robots["'][^>]*>/i.test(html);
    
    // Image alt text check
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgWithAlt = imgTags.filter(img => /alt=["'][^"']*["']/i.test(img));
    const hasAltText = imgTags.length === 0 || imgWithAlt.length >= imgTags.length * 0.8;
    
    // Mobile friendly
    const mobileFriendly = hasViewport && 
      (/<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["'][^>]*>/i.test(html));
    
    // Collect issues (critical)
    if (!hasTitle) issues.push('Missing title tag');
    if (!hasDescription) issues.push('Missing meta description');
    if (!hasH1) issues.push('Missing H1 heading');
    if (!hasCanonical) issues.push('Missing canonical URL');
    if (response.status !== 200) issues.push(`HTTP status: ${response.status}`);
    if (responseTime > 5000) issues.push(`Very slow response time: ${responseTime}ms`);
    
    // Collect warnings (important but not critical)
    if (!hasSchema) warnings.push('Missing structured data (JSON-LD)');
    if (!hasOgTags) warnings.push('Missing or incomplete Open Graph tags');
    if (!hasTwitterCards) warnings.push('Missing Twitter Card meta tags');
    if (!hasViewport) warnings.push('Missing viewport meta tag');
    if (!hasRobotsMeta) warnings.push('Missing robots meta tag');
    if (!hasAltText) warnings.push('Some images missing alt text');
    if (!mobileFriendly) warnings.push('May not be fully mobile-friendly');
    if (responseTime > 3000 && responseTime <= 5000) warnings.push(`Slow response time: ${responseTime}ms`);
    if (contentLength < 5000) warnings.push('Low content length - may be thin content');
    
    return {
      url,
      status: response.status,
      responseTime,
      hasTitle,
      hasDescription,
      hasH1,
      hasCanonical,
      hasSchema,
      hasOgTags,
      hasTwitterCards,
      hasViewport,
      hasRobotsMeta,
      hasAltText,
      mobileFriendly,
      contentLength,
      issues,
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      url,
      status: 0,
      responseTime: Date.now() - startTime,
      hasTitle: false,
      hasDescription: false,
      hasH1: false,
      hasCanonical: false,
      hasSchema: false,
      hasOgTags: false,
      hasTwitterCards: false,
      hasViewport: false,
      hasRobotsMeta: false,
      hasAltText: false,
      mobileFriendly: false,
      contentLength: 0,
      issues: [`Failed to fetch: ${errorMessage}`],
      warnings: [],
    };
  }
}

async function checkInternalLinks(html: string, baseUrl: string): Promise<string[]> {
  const brokenLinks: string[] = [];
  const linkRegex = /href=["']([^"']+)["']/g;
  const links = new Set<string>();
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('/') && !href.startsWith('//') && !href.includes('#')) {
      links.add(href.split('?')[0]); // Remove query params
    }
  }
  
  // Check a sample of internal links (max 15 to avoid timeout)
  const linksToCheck = Array.from(links).slice(0, 15);
  
  const checkPromises = linksToCheck.map(async (link) => {
    try {
      const response = await fetch(`${SITE_URL}${link}`, { method: 'HEAD' });
      if (response.status === 404) {
        return link;
      }
    } catch {
      // Skip errors for individual link checks
    }
    return null;
  });
  
  const results = await Promise.all(checkPromises);
  return results.filter((link): link is string => link !== null);
}

async function checkSitemap(): Promise<{ exists: boolean; urlCount: number }> {
  try {
    const response = await fetch(`${SITE_URL}/sitemap.xml`);
    if (response.ok) {
      const xml = await response.text();
      const urlMatches = xml.match(/<loc>/g) || [];
      return { exists: true, urlCount: urlMatches.length };
    }
    return { exists: false, urlCount: 0 };
  } catch {
    return { exists: false, urlCount: 0 };
  }
}

async function checkRobotsTxt(): Promise<{ exists: boolean; allowsAll: boolean }> {
  try {
    const response = await fetch(`${SITE_URL}/robots.txt`);
    if (response.ok) {
      const txt = await response.text();
      const allowsAll = txt.includes('Allow: /') && !txt.includes('Disallow: /');
      return { exists: true, allowsAll };
    }
    return { exists: false, allowsAll: false };
  } catch {
    return { exists: false, allowsAll: false };
  }
}

function calculateSEOScore(results: HealthCheckResult[]): number {
  if (results.length === 0) return 0;
  
  let score = 100;
  const totalPages = results.length;
  
  // Critical issues (heavy penalties)
  const pagesWithIssues = results.filter(r => r.issues.length > 0).length;
  score -= (pagesWithIssues / totalPages) * 30;
  
  // Missing essential SEO elements
  const missingTitle = results.filter(r => !r.hasTitle).length;
  const missingDesc = results.filter(r => !r.hasDescription).length;
  const missingH1 = results.filter(r => !r.hasH1).length;
  const missingCanonical = results.filter(r => !r.hasCanonical).length;
  
  score -= (missingTitle / totalPages) * 15;
  score -= (missingDesc / totalPages) * 10;
  score -= (missingH1 / totalPages) * 10;
  score -= (missingCanonical / totalPages) * 5;
  
  // Schema and social (medium penalties)
  const missingSchema = results.filter(r => !r.hasSchema).length;
  const missingOg = results.filter(r => !r.hasOgTags).length;
  
  score -= (missingSchema / totalPages) * 5;
  score -= (missingOg / totalPages) * 5;
  
  // Performance
  const slowPages = results.filter(r => r.responseTime > 3000).length;
  score -= Math.min(slowPages * 2, 10);
  
  // Errors
  const errorPages = results.filter(r => r.status !== 200).length;
  score -= errorPages * 5;
  
  return Math.max(0, Math.round(score));
}

function generateRecommendations(results: HealthCheckResult[], sitemapInfo: { exists: boolean; urlCount: number }, robotsInfo: { exists: boolean; allowsAll: boolean }): string[] {
  const recommendations: string[] = [];
  
  const missingTitle = results.filter(r => !r.hasTitle).length;
  const missingDesc = results.filter(r => !r.hasDescription).length;
  const missingH1 = results.filter(r => !r.hasH1).length;
  const missingCanonical = results.filter(r => !r.hasCanonical).length;
  const missingSchema = results.filter(r => !r.hasSchema).length;
  const missingOg = results.filter(r => !r.hasOgTags).length;
  const missingTwitter = results.filter(r => !r.hasTwitterCards).length;
  const slowPages = results.filter(r => r.responseTime > 3000).length;
  const errorPages = results.filter(r => r.status !== 200).length;
  const thinContent = results.filter(r => r.contentLength < 5000).length;
  
  // Critical recommendations
  if (missingTitle > 0) {
    recommendations.push(`🔴 CRITICAL: Add title tags to ${missingTitle} page(s) - essential for search rankings`);
  }
  if (missingDesc > 0) {
    recommendations.push(`🔴 CRITICAL: Add meta descriptions to ${missingDesc} page(s) - improves click-through rates`);
  }
  if (missingH1 > 0) {
    recommendations.push(`🔴 CRITICAL: Add H1 headings to ${missingH1} page(s) - defines page content for search engines`);
  }
  if (errorPages > 0) {
    recommendations.push(`🔴 CRITICAL: Fix ${errorPages} page(s) with HTTP errors - broken pages harm SEO`);
  }
  
  // Important recommendations
  if (missingCanonical > 0) {
    recommendations.push(`🟠 Add canonical URLs to ${missingCanonical} page(s) to prevent duplicate content issues`);
  }
  if (missingSchema > 0) {
    recommendations.push(`🟠 Add structured data (JSON-LD) to ${missingSchema} page(s) for rich snippets in search results`);
  }
  if (missingOg > 0) {
    recommendations.push(`🟠 Add Open Graph tags to ${missingOg} page(s) for better social media sharing`);
  }
  if (missingTwitter > 0) {
    recommendations.push(`🟠 Add Twitter Card meta tags to ${missingTwitter} page(s) for better Twitter previews`);
  }
  
  // Performance recommendations
  if (slowPages > 0) {
    recommendations.push(`🟡 Optimize performance for ${slowPages} slow page(s) - page speed affects rankings`);
  }
  if (thinContent > 0) {
    recommendations.push(`🟡 Consider adding more content to ${thinContent} page(s) with low content length`);
  }
  
  // Technical recommendations
  if (!sitemapInfo.exists) {
    recommendations.push(`🔴 CRITICAL: Create and submit a sitemap.xml file`);
  } else if (sitemapInfo.urlCount < results.length) {
    recommendations.push(`🟠 Sitemap has ${sitemapInfo.urlCount} URLs but ${results.length} pages were checked - ensure all pages are in sitemap`);
  }
  
  if (!robotsInfo.exists) {
    recommendations.push(`🔴 CRITICAL: Create a robots.txt file`);
  } else if (!robotsInfo.allowsAll) {
    recommendations.push(`🟡 Review robots.txt - ensure important pages are not blocked`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Excellent! All pages pass SEO health checks. Continue monitoring regularly.');
  }
  
  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body size
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Request body too large', maxSize: MAX_BODY_SIZE }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    let params = { routes: undefined as string[] | undefined, fullCheck: true };
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        const validated = seoMonitorRequestSchema.parse(body);
        if (validated) {
          params = { ...params, ...validated };
        }
      } catch (parseError) {
        if (parseError instanceof z.ZodError) {
          return new Response(
            JSON.stringify({ error: 'Invalid request parameters', details: parseError.errors }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // If JSON parsing fails, continue with defaults
      }
    }

    // Use custom routes if provided, otherwise use default ALL_ROUTES
    const routesToCheck = params.routes || ALL_ROUTES;

    console.log('Starting comprehensive SEO health check...');
    
    const results: HealthCheckResult[] = [];
    
    // Check all routes in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < routesToCheck.length; i += batchSize) {
      const batch = routesToCheck.slice(i, i + batchSize);
      console.log(`Checking batch: ${batch.join(', ')}`);
      
      const batchResults = await Promise.all(batch.map(route => checkPageHealth(route)));
      results.push(...batchResults);
    }
    
    // Check sitemap and robots.txt in parallel
    const [sitemapInfo, robotsInfo, homepageResponse] = await Promise.all([
      checkSitemap(),
      checkRobotsTxt(),
      fetch(SITE_URL),
    ]);
    
    // Check for broken internal links on homepage
    const homepageHtml = await homepageResponse.text();
    const brokenLinks = await checkInternalLinks(homepageHtml, SITE_URL);
    
    const healthyPages = results.filter(r => r.issues.length === 0).length;
    const pagesWithIssues = results.filter(r => r.issues.length > 0).length;
    const pagesWithWarnings = results.filter(r => r.warnings.length > 0).length;
    
    // Calculate average response time
    const totalResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0);
    const averageResponseTime = Math.round(totalResponseTime / results.length);
    const fastPages = results.filter(r => r.responseTime < 2000).length;
    const slowPagesList = results.filter(r => r.responseTime > 3000);
    
    const seoScore = calculateSEOScore(results);
    
    const report: SEOReport = {
      timestamp: new Date().toISOString(),
      siteUrl: SITE_URL,
      totalPages: results.length,
      healthyPages,
      pagesWithIssues,
      pagesWithWarnings,
      brokenLinks,
      missingMeta: results.filter(r => !r.hasDescription).map(r => r.url),
      slowPages: slowPagesList.map(r => r.url),
      missingOgTags: results.filter(r => !r.hasOgTags).map(r => r.url),
      missingTwitterCards: results.filter(r => !r.hasTwitterCards).map(r => r.url),
      missingSchema: results.filter(r => !r.hasSchema).map(r => r.url),
      results,
      recommendations: generateRecommendations(results, sitemapInfo, robotsInfo),
      seoScore,
      coreWebVitals: {
        averageResponseTime,
        fastPages,
        slowPages: slowPagesList.length,
      },
    };
    
    console.log(`SEO check complete: Score ${seoScore}/100 | ${healthyPages}/${results.length} healthy pages`);
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('SEO monitor error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
