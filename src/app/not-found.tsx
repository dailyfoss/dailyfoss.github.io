"use client";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Social media mapping
const socialMediaMap: Record<string, string[]> = {
  "facebook": ["f", "fb"],
  "instagram": ["i", "ig"],
  "x": ["x", "tw", "twitter"],
  "threads": ["t", "th"],
  "linkedin": ["l", "li"],
  "youtube": ["y", "yt"],
  "tiktok": ["tt", "tk"],
  "reddit": ["r", "rd"],
  "pinterest": ["p", "pin"],
  "snapchat": ["s", "sc"]
};

export default function NotFoundPage() {
  const pathname = usePathname();
  const router = useRouter();

  // Check immediately if this is a redirect URL (before render)
  const isGoUrl = useMemo(() => {
    const goMatch = pathname.match(/^\/go\/([^\/]+)\/([^\/]+)\/?$/);
    if (!goMatch) return null;
    
    const [, socialShort, slug] = goMatch;
    
    // Find the full social media name
    for (const [platform, aliases] of Object.entries(socialMediaMap)) {
      if (aliases.includes(socialShort.toLowerCase())) {
        return { socialName: platform, slug };
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (isGoUrl) {
      // Redirect immediately
      router.replace(`/?id=${isGoUrl.slug}&utm_source=${isGoUrl.socialName}`);
    }
  }, [isGoUrl, router]);

  // Show loading state for /go/ URLs
  if (isGoUrl) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-background px-4 md:px-6">
        <div className="space-y-2 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show 404 for actual not found pages
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5 bg-background px-4 md:px-6">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          404
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Oops, the page you are looking for could not be found.
        </p>
      </div>
      <Button onClick={() => window.history.back()} variant="secondary">
        Go Back
      </Button>
    </div>
  );
}
