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

    // Get the script ID from query params
    const scriptId = searchParams.get("id");
    
    // If we're on /scripts with an ID, create a custom URL
    if (pathname === "/scripts" && scriptId) {
      const customUrl = `${window.location.origin}/scripts/${scriptId}`;
      
      // Track custom pageview with custom URL
      window.plausible("pageview", { 
        u: customUrl,
        props: {
          script_id: scriptId,
        },
      });
    } else {
      console.log("[Plausible] Tracking normal pageview:", pathname);
      
      // Track normal pageview
      window.plausible("pageview");
    }
  }, [pathname, searchParams]);
}
