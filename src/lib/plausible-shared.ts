// Plausible Client-side API via Cloudflare Worker Proxy
// The proxy keeps the API key secure on the server

// Domain must be set via NEXT_PUBLIC_SITE_URL environment variable
const PLAUSIBLE_SITE_ID = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || "";

// Get proxy URL at runtime (not module load time) to work with SSR
function getProxyUrl(): string | null {
  if (typeof window === "undefined") return null;
  return process.env.NEXT_PUBLIC_PLAUSIBLE_PROXY_URL || null;
}

export interface PlausibleSharedPageStats {
  page: string;
  visitors: number;
  pageviews?: number;
}

/**
 * Fetch top pages using Cloudflare Worker proxy
 * The proxy keeps the API key secure on the server
 * @param period - Time period (day, month)
 * @param limit - Number of results
 */
export async function getTopPagesShared(
  period: string = "month",
  limit: number = 30,
): Promise<PlausibleSharedPageStats[]> {
  try {
    const proxyUrl = getProxyUrl();
    
    if (!proxyUrl) {
      console.error("Plausible proxy URL not configured. Set NEXT_PUBLIC_PLAUSIBLE_PROXY_URL");
      return [];
    }

    const url = new URL(proxyUrl);
    url.searchParams.append("period", period);
    url.searchParams.append("limit", limit.toString());

    console.log("Fetching from proxy:", url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch from proxy:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log("Proxy response:", data);
    return data.results || [];
  }
  catch (error) {
    console.error("Failed to fetch stats:", error);
    return [];
  }
}

// Reserved routes that are not script pages
const RESERVED_ROUTES = new Set([
  'add-app', 'admin', 'api', 'auth', 'category-view', 'dashboard',
  'data', 'favorites', 'json-editor', 'likes', 'og-test', 'scripts',
]);

/**
 * Get trending scripts using Cloudflare Worker proxy
 * @param period - Time period
 */
export async function getTrendingScriptsShared(
  period: string = "month",
): Promise<Record<string, number>> {
  try {
    const topPages = await getTopPagesShared(period, 60);

    // Extract view counts for script pages
    // Supports both old format (/scripts/slug) and new format (/slug)
    const counts: Record<string, number> = {};
    topPages.forEach((page) => {
      if (!page.page) return;
      
      let slug: string | null = null;
      
      // Old format: /scripts/slug
      if (page.page.startsWith("/scripts/")) {
        slug = page.page.replace("/scripts/", "");
      }
      // New format: /slug (single segment, not a reserved route)
      else if (page.page.startsWith("/") && !page.page.includes("/", 1)) {
        const potentialSlug = page.page.slice(1);
        if (potentialSlug && !RESERVED_ROUTES.has(potentialSlug)) {
          slug = potentialSlug;
        }
      }
      
      if (slug) {
        // Merge counts if same slug appears in both formats
        counts[slug] = (counts[slug] || 0) + (page.visitors || 0);
      }
    });

    return counts;
  }
  catch (error) {
    console.error("Failed to get trending scripts:", error);
    return {};
  }
}
