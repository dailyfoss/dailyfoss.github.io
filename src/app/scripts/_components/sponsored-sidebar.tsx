"use client";

import { Crown, LayoutGrid, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SponsoredSidebarProps = {
  items: Category[];
};

// Simple icon loader with fallback and theme support
function AppIcon({ src, src_light, name, size = 48 }: { src?: string | null; src_light?: string | null; name: string; size?: number }) {
  const [showFallback, setShowFallback] = useState(!src || src.trim() === "");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Get the appropriate logo based on theme
  // In dark mode, use light variant if available (for visibility)
  const currentSrc = (theme === 'dark' && src_light) ? src_light : src;

  // Reset fallback state when src changes
  useEffect(() => {
    setShowFallback(!currentSrc || currentSrc.trim() === "");
  }, [currentSrc]);

  const imgClass = size <= 48 ? "h-8 w-8 object-contain rounded-md p-0.5" : "h-11 w-11 object-contain rounded-md p-1";
  const fallbackClass = size <= 48 ? "h-8 w-8" : "h-11 w-11";
  const iconSize = size <= 48 ? "h-6 w-6" : "h-8 w-8";

  if (showFallback) {
    return (
      <div className={`${fallbackClass} flex items-center justify-center bg-accent/20 rounded-md`}>
        <LayoutGrid className={`${iconSize} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <img
      src={currentSrc || ''}
      width={size}
      height={size}
      alt={`${name} icon`}
      loading="eager"
      className={imgClass}
      onError={() => setShowFallback(true)}
    />
  );
}

export function SponsoredSidebar({ items }: SponsoredSidebarProps) {
  const [sponsoredScripts, setSponsoredScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cloudflare Worker API endpoint
  const WORKER_URL = process.env.NEXT_PUBLIC_SPONSORED_API;

  // Fetch sponsored slugs from Cloudflare Worker and resolve to full scripts
  const fetchSponsored = async () => {
    // If no worker URL is configured, don't show sponsored tools
    if (!WORKER_URL) {
      console.log('Cloudflare Worker not configured, sponsored tools disabled');
      setIsLoading(false);
      return;
    }

    console.log('Fetching sponsored tools from:', WORKER_URL);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Worker API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data: { success: boolean; slugs?: string[] } = await response.json();
      
      if (data.success && data.slugs && Array.isArray(data.slugs)) {
        // Convert slugs to full script objects by looking them up in categories
        const allScripts = items.flatMap((category: Category) => category.scripts || []);
        const resolvedScripts = data.slugs
          .map((slug: string) => allScripts.find((script: Script) => script.slug === slug))
          .filter((script): script is Script => script !== undefined);
        
        setSponsoredScripts(resolvedScripts);
      } else {
        console.error('Invalid response format from worker:', data);
      }
    } catch (error) {
      // Silently fail - sponsored tools are optional
      console.log('Sponsored tools unavailable:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount and auto-refresh every minute
  useEffect(() => {
    fetchSponsored();

    const interval = setInterval(() => {
      fetchSponsored();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WORKER_URL, items]);

  const MAX_SPOTS = 5;
  const availableSpots = MAX_SPOTS - sponsoredScripts.length;
  const isFull = sponsoredScripts.length >= MAX_SPOTS;

  if (!items)
    return null;

  return (
    <aside className="hidden lg:block lg:min-w-[260px] lg:max-w-[260px]">
      <div className="sticky top-24 space-y-4">
        {/* Header - Aligned with Trending This Month */}
        <div className="px-1">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b-2 border-primary/20">
            <Crown className="h-5 w-5 text-blue-500/80" />
            <h2 className="text-base font-bold text-foreground/90">Sponsored Tools</h2>
          </div>
          {sponsoredScripts.length > 0 && (
            <p className="text-[10px] text-muted-foreground/80 -mt-4 mb-4">
              {isFull
                ? (
                  "All spots taken"
                )
                : (
                  `${availableSpots} spot${availableSpots !== 1 ? "s" : ""} available`
                )}
            </p>
          )}
        </div>

        {/* Sponsored Scripts */}
        {sponsoredScripts.length > 0 ? (
          <div className="space-y-3">
            {sponsoredScripts.map(script => (
              <Card
                key={script.slug}
                className="bg-gradient-to-br from-background via-background to-accent/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] flex flex-col relative overflow-hidden group"
              >
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-blue-600/50 to-blue-500/50" />

                {/* Sponsored Badge - Natural and subtle */}
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-[9px] px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                    Sponsored
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="flex items-start gap-2">
                    <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-sm">
                      <AppIcon 
                        src={script.resources?.logo} 
                        src_light={script.resources?.logo_light}
                        name={script.name || script.slug} 
                        size={48} 
                      />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{script.name}</h3>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-grow py-2">
                  <CardDescription className="line-clamp-2 text-xs leading-snug">
                    {script.description}
                  </CardDescription>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button asChild variant="outline" className="w-full h-8 text-xs group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                    <Link
                      href={{
                        pathname: "/scripts",
                        query: { id: script.slug },
                      }}
                    >
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-dashed border-blue-500/30 bg-gradient-to-br from-background to-blue-500/5">
            <CardContent className="text-center py-6 space-y-2">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Crown className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-sm font-bold">5 Spots Available</CardTitle>
              <CardDescription className="text-xs">
                Be the first to sponsor!
              </CardDescription>
            </CardContent>
          </Card>
        )}

        {/* Advertise Here Card - Enhanced */}
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10 hover:border-primary/50 transition-all duration-200 hover:shadow-md">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 shadow-sm">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-base font-bold">Advertise Here</CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              🎯 Reach 10,000+ monthly visitors
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <CardDescription className="text-xs font-medium">
              Reach Developers
            </CardDescription>
            <ul className="text-[10px] space-y-1.5 text-muted-foreground">
              <li className="flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Highly engaged audience
              </li>
              <li className="flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Premium visibility
              </li>
              <li className="flex items-center justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Flexible terms
              </li>
            </ul>
            <Button asChild variant="default" className="w-full h-9 bg-primary hover:bg-primary/90 shadow-sm" size="sm">
              <a href="mailto:dailyfoss@gmail.com" className="flex items-center gap-1.5 text-xs font-semibold">
                <Mail className="h-3.5 w-3.5" />
                Get Started
              </a>
            </Button>
            <p className="text-[9px] text-muted-foreground/80 pt-1 font-medium">
              From $25/month
            </p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
