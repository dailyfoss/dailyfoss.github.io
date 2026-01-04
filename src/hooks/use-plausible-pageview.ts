import { useEffect, useRef } from "react";
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
    __INITIAL_URL_WITH_UTM__?: string;
  }
}

// UTM parameters to preserve for Plausible tracking
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

// Capture initial URL synchronously (runs immediately when module loads)
// This happens before React hydration can strip UTM params
const getInitialUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  
  // Only capture once, and only if URL has UTM params
  if (!window.__INITIAL_URL_WITH_UTM__ && window.location.href.includes("utm_")) {
    window.__INITIAL_URL_WITH_UTM__ = window.location.href;
  }
  return window.__INITIAL_URL_WITH_UTM__ || null;
};

export function usePlausiblePageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialUrlRef = useRef<string | null>(getInitialUrl());
  const hasTrackedInitialRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.plausible) return;

    // Skip tracking on homepage - it's handled manually in the page component
    if (pathname === "/") {
      return;
    }

    // Check if we have UTM params in searchParams or in the initial URL
    const hasUtmInSearchParams = UTM_PARAMS.some(param => searchParams.get(param));
    const hasUtmInInitialUrl = initialUrlRef.current?.includes("utm_");

    if (hasUtmInSearchParams) {
      // UTM params still in URL, build full URL and track
      const fullUrl = `${window.location.origin}${pathname}?${searchParams.toString()}`;
      window.plausible("pageview", { u: fullUrl });
    } else if (hasUtmInInitialUrl && initialUrlRef.current && !hasTrackedInitialRef.current) {
      // UTM params were in initial URL but got stripped by router - use captured URL
      window.plausible("pageview", { u: initialUrlRef.current });
      // Mark as tracked to prevent duplicate tracking
      hasTrackedInitialRef.current = true;
      // Clear global after use
      delete window.__INITIAL_URL_WITH_UTM__;
    } else {
      // No UTM params, track normal pageview
      window.plausible("pageview");
    }
  }, [pathname, searchParams]);
}
