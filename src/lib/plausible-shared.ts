// Plausible Client-side API (Real-time)
// Supports both shared link and Cloudflare Worker proxy

const PLAUSIBLE_API_URL = "https://plausible.mvl.biz.id/api/v1";
const PLAUSIBLE_SITE_ID = "dailyfoss.github.io";

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
 * Fetch top pages using Cloudflare Worker proxy or shared link
 * @param sharedLinkAuth - Shared link auth token (optional if using proxy)
 * @param period - Time period (day, month)
 * @param limit - Number of results
 */
export async function getTopPagesShared(
  sharedLinkAuth: string,
  period: string = "month",
  limit: number = 30,
): Promise<PlausibleSharedPageStats[]> {
  try {
    // Use Cloudflare Worker proxy if configured (most secure)
    const proxyUrl = getProxyUrl();
    if (proxyUrl) {
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

    // Fallback to shared link
    if (!sharedLinkAuth) {
      console.warn("Neither proxy nor shared link auth configured");
      return [];
    }

    const url = new URL(`${PLAUSIBLE_API_URL}/stats/breakdown`);
    url.searchParams.append("site_id", PLAUSIBLE_SITE_ID);
    url.searchParams.append("period", period);
    url.searchParams.append("property", "event:page");
    url.searchParams.append("metrics", "visitors");
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${sharedLinkAuth}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch from Plausible shared link:", response.statusText);
      return [];
    }

    const data = await response.json();
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
 * Get trending scripts using shared link (real-time, client-side)
 * @param sharedLinkAuth - Shared link auth token
 * @param period - Time period
 */
export async function getTrendingScriptsShared(
  sharedLinkAuth: string,
  period: string = "month",
): Promise<Record<string, number>> {
  try {
    const topPages = await getTopPagesShared(sharedLinkAuth, period, 60);

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
