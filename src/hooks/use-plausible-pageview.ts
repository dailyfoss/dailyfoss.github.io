import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

export function usePlausiblePageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (!window.plausible) {
      console.warn("[Plausible] window.plausible not available");
      return;
    }

    // Skip tracking on /scripts page - it's handled manually in the page component
    if (pathname === "/scripts") {
      console.log("[Plausible] Skipping auto-tracking on /scripts (handled manually)");
      return;
    }
    
    console.log("[Plausible] Tracking normal pageview:", pathname);
    
    // Track normal pageview
    window.plausible("pageview");
  }, [pathname, searchParams]);
}
