import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://oraclebull.com';

// All routes to monitor
const ALL_ROUTES = [
  '/',
  '/dashboard',
  '/strength',
  '/factory',
  '/portfolio',
  '/sentiment',
  '/explorer',
  '/learn',
  '/contact',
  '/sitemap',
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
  issues: string[];
}

interface SEOReport {
  timestamp: string;
  totalPages: number;
  healthyPages: number;
  pagesWithIssues: number;
  brokenLinks: string[];
  missingMeta: string[];
  slowPages: string[];
  results: HealthCheckResult[];
  recommendations: string[];
}

async function checkPageHealth(path: string): Promise<HealthCheckResult> {
  const url = `${SITE_URL}${path}`;
  const issues: string[] = [];
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OracleBull-SEO-Monitor/1.0',
      },
    });
    
    const responseTime = Date.now() - startTime;
    const html = await response.text();
    
    // Check for essential SEO elements
    const hasTitle = /<title[^>]*>.*<\/title>/i.test(html);
    const hasDescription = /<meta[^>]*name=["']description["'][^>]*>/i.test(html);
    const hasH1 = /<h1[^>]*>.*<\/h1>/is.test(html);
    const hasCanonical = /<link[^>]*rel=["']canonical["'][^>]*>/i.test(html);
    const hasSchema = /application\/ld\+json/i.test(html);
    
    if (!hasTitle) issues.push('Missing title tag');
    if (!hasDescription) issues.push('Missing meta description');
    if (!hasH1) issues.push('Missing H1 heading');
    if (!hasCanonical) issues.push('Missing canonical URL');
    if (!hasSchema) issues.push('Missing structured data');
    if (responseTime > 3000) issues.push(`Slow response time: ${responseTime}ms`);
    if (response.status !== 200) issues.push(`HTTP status: ${response.status}`);
    
    return {
      url,
      status: response.status,
      responseTime,
      hasTitle,
      hasDescription,
      hasH1,
      hasCanonical,
      hasSchema,
      issues,
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
      issues: [`Failed to fetch: ${errorMessage}`],
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
    if (href.startsWith('/') && !href.startsWith('//')) {
      links.add(href);
    }
  }
  
  // Check a sample of internal links (max 10 to avoid timeout)
  const linksToCheck = Array.from(links).slice(0, 10);
  
  for (const link of linksToCheck) {
    try {
      const response = await fetch(`${SITE_URL}${link}`, { method: 'HEAD' });
      if (response.status === 404) {
        brokenLinks.push(link);
      }
    } catch {
      // Skip errors for individual link checks
    }
  }
  
  return brokenLinks;
}

function generateRecommendations(results: HealthCheckResult[]): string[] {
  const recommendations: string[] = [];
  
  const missingTitle = results.filter(r => !r.hasTitle).length;
  const missingDesc = results.filter(r => !r.hasDescription).length;
  const missingH1 = results.filter(r => !r.hasH1).length;
  const missingSchema = results.filter(r => !r.hasSchema).length;
  const slowPages = results.filter(r => r.responseTime > 3000).length;
  const errorPages = results.filter(r => r.status !== 200).length;
  
  if (missingTitle > 0) {
    recommendations.push(`Add title tags to ${missingTitle} page(s)`);
  }
  if (missingDesc > 0) {
    recommendations.push(`Add meta descriptions to ${missingDesc} page(s)`);
  }
  if (missingH1 > 0) {
    recommendations.push(`Add H1 headings to ${missingH1} page(s)`);
  }
  if (missingSchema > 0) {
    recommendations.push(`Add structured data (JSON-LD) to ${missingSchema} page(s)`);
  }
  if (slowPages > 0) {
    recommendations.push(`Optimize performance for ${slowPages} slow page(s)`);
  }
  if (errorPages > 0) {
    recommendations.push(`Fix ${errorPages} page(s) with HTTP errors`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All pages are healthy! Continue monitoring.');
  }
  
  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting SEO health check...');
    
    const results: HealthCheckResult[] = [];
    
    // Check all routes
    for (const route of ALL_ROUTES) {
      console.log(`Checking: ${route}`);
      const result = await checkPageHealth(route);
      results.push(result);
    }
    
    // Check for broken internal links on homepage
    const homepageResponse = await fetch(SITE_URL);
    const homepageHtml = await homepageResponse.text();
    const brokenLinks = await checkInternalLinks(homepageHtml, SITE_URL);
    
    const healthyPages = results.filter(r => r.issues.length === 0).length;
    const pagesWithIssues = results.filter(r => r.issues.length > 0).length;
    
    const report: SEOReport = {
      timestamp: new Date().toISOString(),
      totalPages: results.length,
      healthyPages,
      pagesWithIssues,
      brokenLinks,
      missingMeta: results.filter(r => !r.hasDescription).map(r => r.url),
      slowPages: results.filter(r => r.responseTime > 3000).map(r => r.url),
      results,
      recommendations: generateRecommendations(results),
    };
    
    console.log(`SEO check complete: ${healthyPages}/${results.length} healthy`);
    
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
