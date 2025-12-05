// Plausible event tracking
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
 * Track a custom event in Plausible Analytics
 * @param eventName - Name of the event
 * @param props - Optional event properties
 */
export function trackPlausibleEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;

  try {
    if (window.plausible) {
      window.plausible(eventName, { props });
    }
  } catch (error) {
    console.error("Failed to track Plausible event:", error);
  }
}

/**
 * Track a script view in Plausible Analytics
 * @param slug - Script slug identifier
 * @param scriptName - Optional script display name
 */
export function trackScriptViewPlausible(slug: string, scriptName?: string): void {
  trackPlausibleEvent("Script View", {
    slug,
    name: scriptName || slug,
  });
}
