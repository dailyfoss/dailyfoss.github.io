// Umami API integration for fetching analytics data
import { analytics } from "@/config/site-config";

const UMAMI_API_URL = `https://${analytics.url}/api`;

export interface UmamiPageStats {
  x: string; // URL path
  y: number; // View count
}

export interface UmamiEventStats {
  x: string; // Event name or property value
  y: number; // Event count
}

export interface UmamiMetrics {
  pageviews: { value: number; change: number };
  visitors: { value: number; change: number };
  visits: { value: number; change: number };
  bounces: { value: number; change: number };
  totaltime: { value: number; change: number };
}

/**
 * Get authentication token from Umami
 * Note: For production, you should store this securely on the server side
 */
async function getAuthToken(username: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${UMAMI_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok)
      return null;

    const data = await response.json();
    return data.token;
  }
  catch (error) {
    console.error("Failed to authenticate with Umami:", error);
    return null;
  }
}

/**
 * Fetch website statistics from Umami
 * @param startAt - Start timestamp (milliseconds)
 * @param endAt - End timestamp (milliseconds)
 * @param token - Authentication token (optional for public endpoints)
 */
export async function getWebsiteStats(
  startAt: number,
  endAt: number,
  token?: string,
): Promise<UmamiMetrics | null> {
  try {
    const url = new URL(`${UMAMI_API_URL}/websites/${analytics.token}/stats`);
    url.searchParams.append("startAt", startAt.toString());
    url.searchParams.append("endAt", endAt.toString());

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok)
      return null;

    return await response.json();
  }
  catch (error) {
    console.error("Failed to fetch website stats:", error);
    return null;
  }
}

/**
 * Fetch page views from Umami
 * @param startAt - Start timestamp (milliseconds)
 * @param endAt - End timestamp (milliseconds)
 * @param token - Authentication token (optional for public endpoints)
 */
export async function getPageViews(
  startAt: number,
  endAt: number,
  token?: string,
): Promise<UmamiPageStats[] | null> {
  try {
    const url = new URL(`${UMAMI_API_URL}/websites/${analytics.token}/metrics`);
    url.searchParams.append("startAt", startAt.toString());
    url.searchParams.append("endAt", endAt.toString());
    url.searchParams.append("type", "url");

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok)
      return null;

    const data = await response.json();
    return data;
  }
  catch (error) {
    console.error("Failed to fetch page views:", error);
    return null;
  }
}

/**
 * Fetch custom event data from Umami
 * @param eventName - Name of the event (e.g., "script-view")
 * @param startAt - Start timestamp (milliseconds)
 * @param endAt - End timestamp (milliseconds)
 * @param token - Authentication token (optional for public endpoints)
 */
export async function getEventData(
  eventName: string,
  startAt: number,
  endAt: number,
  token?: string,
): Promise<UmamiEventStats[] | null> {
  try {
    const url = new URL(`${UMAMI_API_URL}/websites/${analytics.token}/events`);
    url.searchParams.append("startAt", startAt.toString());
    url.searchParams.append("endAt", endAt.toString());

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok)
      return null;

    const data = await response.json();

    // Filter for specific event
    return data.filter((event: any) => event.x === eventName);
  }
  catch (error) {
    console.error("Failed to fetch event data:", error);
    return null;
  }
}

/**
 * Get most viewed scripts from Umami analytics
 * Returns script slugs sorted by view count
 */
export async function getMostViewedScripts(
  days: number = 30,
  token?: string,
): Promise<Array<{ slug: string; views: number }>> {
  try {
    const endAt = Date.now();
    const startAt = endAt - (days * 24 * 60 * 60 * 1000);

    const url = new URL(`${UMAMI_API_URL}/websites/${analytics.token}/metrics`);
    url.searchParams.append("startAt", startAt.toString());
    url.searchParams.append("endAt", endAt.toString());
    url.searchParams.append("type", "url");

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      console.error("Failed to fetch page views:", response.statusText);
      return [];
    }

    const data: UmamiPageStats[] = await response.json();

    // Filter for script pages and extract slugs
    const scriptViews = data
      .filter(page => page.x.includes("/scripts?id="))
      .map((page) => {
        // Extract slug from URL like "/scripts?id=docker"
        const match = page.x.match(/id=([^&]+)/);
        const slug = match ? match[1] : "";
        return {
          slug,
          views: page.y,
        };
      })
      .filter(item => item.slug !== "")
      .sort((a, b) => b.views - a.views);

    return scriptViews;
  }
  catch (error) {
    console.error("Failed to get most viewed scripts:", error);
    return [];
  }
}

/**
 * Get trending scripts based on Umami event data
 * Uses the custom "script-view" events we're tracking
 */
export async function getTrendingScriptsFromEvents(
  days: number = 30,
  token?: string,
): Promise<Array<{ slug: string; views: number }>> {
  try {
    const endAt = Date.now();
    const startAt = endAt - (days * 24 * 60 * 60 * 1000);

    const url = new URL(`${UMAMI_API_URL}/websites/${analytics.token}/events`);
    url.searchParams.append("startAt", startAt.toString());
    url.searchParams.append("endAt", endAt.toString());

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      console.error("Failed to fetch events:", response.statusText);
      return [];
    }

    const data = await response.json();

    // Group by slug and count views
    const viewCounts: Record<string, number> = {};

    data.forEach((event: any) => {
      if (event.x === "script-view" && event.slug) {
        viewCounts[event.slug] = (viewCounts[event.slug] || 0) + event.y;
      }
    });

    return Object.entries(viewCounts)
      .map(([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views);
  }
  catch (error) {
    console.error("Failed to get trending scripts from events:", error);
    return [];
  }
}

/**
 * Helper to get time range for common periods
 */
export function getTimeRange(period: "today" | "week" | "month" | "year"): { startAt: number; endAt: number } {
  const endAt = Date.now();
  let startAt: number;

  switch (period) {
    case "today":
      startAt = new Date().setHours(0, 0, 0, 0);
      break;
    case "week":
      startAt = endAt - (7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startAt = endAt - (30 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startAt = endAt - (365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startAt = endAt - (30 * 24 * 60 * 60 * 1000);
  }

  return { startAt, endAt };
}
