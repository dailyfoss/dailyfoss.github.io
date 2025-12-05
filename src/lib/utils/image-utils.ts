/**
 * Converts jsdelivr CDN URLs to GitHub raw URLs to avoid package size limits
 * @param url - The original image URL
 * @returns The converted URL or original if not a jsdelivr URL
 */
export function convertImageUrl(url: string | null | undefined): string | null {
    if (!url || url.trim() === "") {
        return null;
    }

    // Convert jsdelivr CDN URLs to GitHub raw URLs
    // From: https://cdn.jsdelivr.net/gh/selfhst/icons/webp/filerise.webp
    // To: https://raw.githubusercontent.com/selfhst/icons/master/webp/filerise.webp
    if (url.includes("cdn.jsdelivr.net/gh/")) {
        return url
            .replace("cdn.jsdelivr.net/gh/", "raw.githubusercontent.com/")
            .replace("/webp/", "/master/webp/");
    }

    return url;
}

/**
 * Get fallback URLs for an image
 * @param url - The original image URL
 * @returns Array of URLs to try in order
 */
export function getImageFallbacks(url: string | null | undefined): string[] {
    if (!url || url.trim() === "") {
        return [];
    }

    const urls: string[] = [];

    // Try GitHub raw URL first (no size limit)
    const githubUrl = convertImageUrl(url);
    if (githubUrl && githubUrl !== url) {
        urls.push(githubUrl);
    }

    // Then try original URL
    urls.push(url);

    return urls;
}
