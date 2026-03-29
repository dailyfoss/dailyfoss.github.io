/**
 * Asset URL utilities for handling CDN and fallback URLs
 */

const ASSETS_CDN = process.env.NEXT_PUBLIC_ASSETS_CDN || 'https://raw.githubusercontent.com/dailyfoss/assets/main';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/dailyfoss/assets/main';

/**
 * Convert a GitHub raw URL to use the configured CDN
 * @param url - The original URL (can be GitHub raw or relative path)
 * @returns CDN URL
 */
export function getAssetUrl(url: string): string {
  if (!url) return url;
  
  // If it's already a full GitHub raw URL, replace the base
  if (url.startsWith(GITHUB_RAW_BASE)) {
    return url.replace(GITHUB_RAW_BASE, ASSETS_CDN);
  }
  
  // If it's a relative path, prepend the CDN base
  if (url.startsWith('/')) {
    return `${ASSETS_CDN}${url}`;
  }
  
  // If it's already a full URL (not GitHub raw), return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise, treat as relative path
  return `${ASSETS_CDN}/${url}`;
}

/**
 * Get screenshot URLs with CDN support
 * @param screenshots - Array of screenshot URLs
 * @returns Array of CDN URLs
 */
export function getScreenshotUrls(screenshots: string[] | undefined): string[] {
  if (!screenshots || !Array.isArray(screenshots)) return [];
  return screenshots.map(getAssetUrl);
}

/**
 * Get logo URL with CDN support
 * @param logo - Logo URL
 * @returns CDN URL
 */
export function getLogoUrl(logo: string | undefined): string {
  if (!logo) return '';
  return getAssetUrl(logo);
}
