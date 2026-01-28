// Central site configuration - single source of truth for all URLs
// IMPORTANT: This is the canonical domain for SEO - all URLs should use this
export const SITE_URL = "https://oraclebull.com";
export const SITE_NAME = "Oracle Bull";
export const TWITTER_HANDLE = "@oracle_bulls";

// Helper function to create full URLs
export function getFullUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
