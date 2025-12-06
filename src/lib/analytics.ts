// Analytics event tracking (Plausible only)
declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { 
        u?: string;
        props?: Record<string, string | number | boolean>;
      }
    ) => void;
  }
}

/**
 * Track a script view in Plausible Analytics
 * @param slug - Script slug identifier
 * @param scriptName - Optional script display name
 */
export function trackScriptView(slug: string, scriptName?: string): void {
  if (typeof window === "undefined")
    return;

  try {
    // Track in Plausible
    if (window.plausible) {
      window.plausible("Script View", {
        props: {
          slug,
          name: scriptName || slug,
        },
      });
    }
  }
  catch (error) {
    console.error("Failed to track script view:", error);
  }
}
