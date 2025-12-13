"use client";

import { CalendarPlus, Crown, Eye, LayoutGrid, Star, TrendingUp, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mostPopularScripts } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractDate } from "@/lib/time";
import { useRepositoryStatus } from "@/hooks/use-repository-status";
import { getRelativeTime } from "@/lib/version-utils";

const ITEMS_PER_PAGE = 6;
const ITEMS_PER_PAGE_LARGE = 6;

// ⬇️ Helper to format star count (e.g., 3663 -> "3.7k")
function formatStarCount(stars?: string | number): string | null {
  if (!stars)
    return null;

  const num = typeof stars === "string" ? Number.parseInt(stars, 10) : stars;
  if (isNaN(num) || num === 0)
    return null;

  if (num >= 1000000)
    return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000)
    return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// Helper function to format relative time from days
function getRelativeTimeFromDays(days: number | null): string {
  if (days === null) return 'unknown time';
  
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

// ⬇️ Compact version for metadata rows with repository status
function RepositoryStatusCompact({ script }: { script: Script }) {
  const { repositoryInfo, loading } = useRepositoryStatus(script);

  if (loading || !repositoryInfo) {
    return null;
  }

  const releaseDate = repositoryInfo.lastRelease?.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const commitDate = repositoryInfo.lastCommit?.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex items-center gap-3 text-xs">
      {repositoryInfo.lastRelease && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <Tag className="h-3 w-3" />
                Released {getRelativeTimeFromDays(repositoryInfo.daysSinceLastRelease)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              <p>Last release: {releaseDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {repositoryInfo.lastCommit && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <span className="text-xs">{repositoryInfo.statusIcon}</span>
                Last commit {getRelativeTimeFromDays(repositoryInfo.daysSinceLastCommit)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              <p>Last commit: {commitDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ⬇️ Simple icon loader with fallback
function AppIcon({ src, src_light, name, size = 64 }: { src?: string | null; src_light?: string | null; name: string; size?: number }) {
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

  if (showFallback) {
    return (
      <div className="flex items-center justify-center bg-accent/20 rounded-md w-full h-full">
        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
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
      className="h-14 w-14 object-contain rounded-md p-1"
      onError={() => setShowFallback(true)}
    />
  );
}

// ⬇️ Get combined info: hosting, categories, and platform (max 3 badges)
function getScriptBadges(script: Script, allCategories: Category[]): string[] {
  const badges: string[] = [];

  // Add hosting info
  if (script.hosting_options) {
    if (script.hosting_options.self_hosted)
      badges.push("Self-hosted");
    if (script.hosting_options.managed_cloud)
      badges.push("Managed-cloud");
    if (script.hosting_options.saas)
      badges.push("SaaS");
  }

  // Add categories
  if (script.categories && script.categories.length > 0) {
    const categoryNames = script.categories
      .map(categoryId => {
        const category = allCategories.find(cat => cat.id === categoryId);
        return category?.name;
      })
      .filter((name): name is string => name !== undefined);
    badges.push(...categoryNames);
  }

  // Add platform info
  if (script.platform_support) {
    if (script.platform_support.desktop?.linux || script.platform_support.desktop?.windows || script.platform_support.desktop?.macos)
      badges.push("Desktop");
    if (script.platform_support.mobile?.android || script.platform_support.mobile?.ios)
      badges.push("Mobile");
    if (script.platform_support.web_app)
      badges.push("Web");
    if (script.platform_support.browser_extension)
      badges.push("Browser Extension");
  }

  return badges.slice(0, 3); // Limit to 3 badges
}

export function FeaturedScripts({ items }: { items: Category[] }) {
  const featuredScripts = useMemo(() => {
    if (!items)
      return [];

    const scripts = items.flatMap(category => category.scripts || []);

    // Filter out duplicates by slug and get only sponsored scripts
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug) && script.sponsored) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    return Array.from(uniqueScriptsMap.values()).slice(0, 6); // Max 6 featured scripts
  }, [items]);

  if (!items || featuredScripts.length === 0)
    return null;

  return (
    <div className="">
      <div className="flex w-full items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-amber-600 dark:text-amber-500" />
        <h2 className="text-2xl font-bold tracking-tight">Sponsored Scripts</h2>
        <Badge variant="outline" className="ml-2 border-amber-500/40 text-amber-700 dark:text-amber-400 text-xs">
          Sponsored
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredScripts.map(script => (
          <Card
            key={script.slug}
            className="bg-accent/30 border-2 border-amber-500/60 hover:border-amber-500 transition-all duration-300 hover:shadow-lg flex flex-col relative overflow-hidden"
          >
            {/* Sponsored Badge */}
            <div className="absolute top-2 right-2 z-0">
              <Badge className="bg-amber-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Sponsored
              </Badge>
            </div>

            {/* Subtle highlight bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

            <CardHeader>
              <CardTitle className="flex items-start gap-3">
                <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md ring-1 ring-amber-500/30">
                  <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name || script.slug} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1 mb-1">{script.name}</h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarPlus className="h-3 w-3" />
                      Added {extractDate(script.metadata?.date_app_added || "")}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <RepositoryStatusCompact script={script} />
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 pb-6">
              <CardDescription className="line-clamp-3 text-sm leading-[1.6rem] mb-3">{script.description}</CardDescription>
              {getScriptBadges(script, items).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {getScriptBadges(script, items).map(badge => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
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
    </div>
  );
}

export function LatestScripts({ items }: { items: Category[] }) {
  const [page, setPage] = useState(1);

  const latestScripts = useMemo(() => {
    if (!items)
      return [];

    const scripts = items.flatMap(category => category.scripts || []);

    // Filter out duplicates by slug
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    return Array.from(uniqueScriptsMap.values()).sort(
      (a, b) => new Date(b.metadata?.date_app_added || 0).getTime() - new Date(a.metadata?.date_app_added || 0).getTime(),
    );
  }, [items]);

  const goToNextPage = () => setPage(prev => prev + 1);
  const goToPreviousPage = () => setPage(prev => prev - 1);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  if (!items)
    return null;

  return (
    <div className="">
      {latestScripts.length > 0 && (
        <div className="flex w-full items-center justify-between mb-6 pb-3 border-b-2 border-primary/20">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Newest Scripts</h2>
            <Badge variant="outline" className="text-xs">
              Latest Additions
            </Badge>
          </div>
          <div className="flex items-center justify-end gap-2">
            {page > 1 && (
              <div className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors" onClick={goToPreviousPage}>
                Previous
              </div>
            )}
            {endIndex < latestScripts.length && (
              <div onClick={goToNextPage} className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors">
                {page === 1 ? "More.." : "Next"}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestScripts.slice(startIndex, endIndex).map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
          >
            <Card className="bg-accent/30 border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-[3px] flex flex-col h-full cursor-pointer overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name || script.slug} size={64} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    {/* Metadata row (compact) */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title={script.metadata?.date_app_added || ""}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.metadata?.date_app_added || "")}
                      </span>
                      {formatStarCount((script as any).github_stars) && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pb-6">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
                {getScriptBadges(script, items).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getScriptBadges(script, items).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <div className="w-full text-center text-sm font-medium text-primary hover:underline">
                  View Details →
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MostViewedScripts({ items }: { items: Category[] }) {
  const mostViewedScripts = items.reduce((acc: Script[], category) => {
    const foundScripts = (category.scripts || []).filter(script => mostPopularScripts.includes(script.slug));
    return acc.concat(foundScripts);
  }, []);

  return (
    <div className="">
      {mostViewedScripts.length > 0 && (
        <div className="flex w-full items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Most Viewed Scripts</h2>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mostViewedScripts.map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
            prefetch={false}
          >
            <Card className="bg-accent/30 border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-[3px] flex flex-col h-full cursor-pointer overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name || script.slug} size={64} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    {/* Metadata row (compact) */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title={script.metadata?.date_app_added || ""}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.metadata?.date_app_added || "")}
                      </span>
                      {formatStarCount((script as any).github_stars) && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pb-6">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
                {getScriptBadges(script, items).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getScriptBadges(script, items).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <div className="w-full text-center text-sm font-medium text-primary hover:underline">
                  View Details →
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TrendingScripts({ items }: { items: Category[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);

  // Load view counts from Plausible Analytics via Cloudflare Worker
  useEffect(() => {
    async function fetchTrendingData() {
      try {
        const proxyUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_PROXY_URL;
        
        if (!proxyUrl) {
          console.warn("Plausible proxy URL not configured");
          return;
        }

        // Fetch from Cloudflare Worker proxy
        const { getTrendingScriptsShared } = await import("@/lib/plausible-shared");
        const counts = await getTrendingScriptsShared("", "month");
        
        console.log("Trending data loaded:", counts);
        setViewCounts(counts);
      }
      catch (error) {
        console.error("Failed to load trending data:", error);
      }
    }

    fetchTrendingData();
  }, []);

  const trendingScripts = useMemo(() => {
    if (!items)
      return [];

    const scripts = items.flatMap(category => category.scripts || []);

    // Filter out duplicates by slug
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    // Get scripts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Array.from(uniqueScriptsMap.values())
      .filter(script => new Date(script.metadata?.date_app_added || 0) >= thirtyDaysAgo)
      .sort((a, b) => {
        // Sort 100% by Plausible visitor count
        const visitorsA = viewCounts[a.slug] || 0;
        const visitorsB = viewCounts[b.slug] || 0;

        // Sort by visitors first, then by date for ties
        if (visitorsB !== visitorsA)
          return visitorsB - visitorsA;
        return new Date(b.metadata?.date_app_added || 0).getTime() - new Date(a.metadata?.date_app_added || 0).getTime();
      });
  }, [items, viewCounts]);

  const goToNextPage = () => setPage(prev => prev + 1);
  const goToPreviousPage = () => setPage(prev => prev - 1);

  const startIndex = (page - 1) * ITEMS_PER_PAGE_LARGE;
  const endIndex = page * ITEMS_PER_PAGE_LARGE;

  if (!items || trendingScripts.length === 0)
    return null;

  return (
    <div className="">
      <div className="flex w-full items-center justify-between mb-6 pb-3 border-b-2 border-primary/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Trending This Month</h2>
          <Badge variant="outline" className="text-xs">
            Last 30 Days
          </Badge>
        </div>
        <div className="flex items-center justify-end gap-2">
          {page > 1 && (
            <div className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors" onClick={goToPreviousPage}>
              Previous
            </div>
          )}
          {endIndex < trendingScripts.length && (
            <div onClick={goToNextPage} className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors">
              {page === 1 ? "More.." : "Next"}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingScripts.slice(startIndex, endIndex).map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
          >
            <Card className="bg-accent/30 border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-[3px] flex flex-col h-full cursor-pointer overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name || script.slug} size={64} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    {/* Metadata row (compact) */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title={script.metadata?.date_app_added || ""}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.metadata?.date_app_added || "")}
                      </span>
                      {formatStarCount((script as any).github_stars) && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </span>
                      )}
                      {viewCounts[script.slug] && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {viewCounts[script.slug]}
                        </span>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pb-6">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
                {getScriptBadges(script, items).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getScriptBadges(script, items).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <div className="w-full text-center text-sm font-medium text-primary hover:underline">
                  View Details →
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PopularScripts({ items }: { items: Category[] }) {
  const [page, setPage] = useState(1);

  const popularScripts = useMemo(() => {
    if (!items)
      return [];

    const scripts = items.flatMap(category => category.scripts || []);

    // Filter out duplicates by slug
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    // Helper to parse GitHub stars (e.g., "3.5k" -> 3500)
    const parseStars = (stars?: string): number => {
      if (!stars)
        return 0;
      const num = Number.parseFloat(stars.replace(/[^0-9.]/g, ""));
      if (stars.toLowerCase().includes("k"))
        return num * 1000;
      if (stars.toLowerCase().includes("m"))
        return num * 1000000;
      return num;
    };

    // Helper to count deployment methods
    const countDeploymentMethods = (script: Script): number => {
      if (!script.deployment_methods)
        return 0;
      return Object.values(script.deployment_methods).filter(Boolean).length;
    };

    // Calculate popularity score: GitHub stars (80%) + deployment versatility (20%)
    const allScripts = Array.from(uniqueScriptsMap.values()).map(script => ({
      script,
      stars: parseStars((script as any).github_stars),
      deploymentCount: countDeploymentMethods(script),
    }));

    // Boost hardcoded popular scripts slightly
    return allScripts
      .sort((a, b) => {
        const boostA = mostPopularScripts.includes(a.script.slug) ? 5000 : 0;
        const boostB = mostPopularScripts.includes(b.script.slug) ? 5000 : 0;

        const scoreA = (a.stars * 0.8) + (a.deploymentCount * 200) + boostA;
        const scoreB = (b.stars * 0.8) + (b.deploymentCount * 200) + boostB;

        return scoreB - scoreA;
      })
      .map(item => item.script);
  }, [items]);

  const goToNextPage = () => setPage(prev => prev + 1);
  const goToPreviousPage = () => setPage(prev => prev - 1);

  const startIndex = (page - 1) * ITEMS_PER_PAGE_LARGE;
  const endIndex = page * ITEMS_PER_PAGE_LARGE;

  if (!items || popularScripts.length === 0)
    return null;

  return (
    <div className="">
      <div className="flex w-full items-center justify-between mb-6 pb-3 border-b-2 border-primary/20">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Popular Scripts</h2>
          <Badge variant="outline" className="text-xs">
            Community Favorites
          </Badge>
        </div>
        <div className="flex items-center justify-end gap-2">
          {page > 1 && (
            <div className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors" onClick={goToPreviousPage}>
              Previous
            </div>
          )}
          {endIndex < popularScripts.length && (
            <div onClick={goToNextPage} className="cursor-pointer select-none px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent transition-colors">
              {page === 1 ? "More.." : "Next"}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularScripts.slice(startIndex, endIndex).map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
            prefetch={false}
          >
            <Card className="bg-accent/30 border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-[3px] flex flex-col h-full cursor-pointer overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name || script.slug} size={64} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    {/* Metadata row (compact) */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title={script.metadata?.date_app_added || ""}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.metadata?.date_app_added || "")}
                      </span>
                      {formatStarCount((script as any).github_stars) && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pb-6">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
                {getScriptBadges(script, items).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {getScriptBadges(script, items).map(badge => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1">
                <div className="w-full text-center text-sm font-medium text-primary hover:underline">
                  View Details →
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
