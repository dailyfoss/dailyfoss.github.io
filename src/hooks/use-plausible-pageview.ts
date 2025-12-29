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
    if (typeof window === "undefined" || !window.plausible) return;

    // Skip tracking on homepage - it's handled manually in the page component
    if (pathname === "/") {
      return;
    }
    
    // Track normal pageview
    window.plausible("pageview");
  }, [pathname, searchParams]);
}
