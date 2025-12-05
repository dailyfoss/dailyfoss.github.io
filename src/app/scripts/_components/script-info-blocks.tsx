"use client";

import { CalendarPlus, Crown, LayoutGrid, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mostPopularScripts } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractDate } from "@/lib/time";

const ITEMS_PER_PAGE = 3;
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

// ⬇️ Simple icon loader with fallback
function AppIcon({ src, name, size = 64 }: { src?: string | null; name: string; size?: number }) {
  const [showFallback, setShowFallback] = useState(!src || src.trim() === "");

  // Reset fallback state when src changes
  useEffect(() => {
    setShowFallback(!src || src.trim() === "");
  }, [src]);

  if (showFallback) {
    return (
      <div className="flex items-center justify-center bg-accent/20 rounded-md w-full h-full">
        <LayoutGrid className="h-10 w-10 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={src!}
      width={size}
      height={size}
      alt={`${name} icon`}
      loading="eager"
      className="h-14 w-14 object-contain rounded-md p-1"
      onError={() => setShowFallback(true)}
    />
  );
}

// ⬇️ Get deployment methods from script
function getDeploymentMethods(script: Script): string[] {
  const methods: string[] = [];

  if (script.install_methods && script.install_methods.length > 0) {
    const deployment = script.install_methods[0]?.deployment;
    if (deployment) {
      if (deployment.docker)
        methods.push("Docker");
      if (deployment.docker_compose)
        methods.push("Compose");
      if (deployment.kubernetes)
        methods.push("K8s");
      if (deployment.helm)
        methods.push("Helm");
      if (deployment.terraform)
        methods.push("Terraform");
      if (deployment.script)
        methods.push("Script");
    }
  }

  return methods.slice(0, 3); // Limit to 3 badges
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
                  <AppIcon src={script.logo} name={script.name || script.slug} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1 mb-1">{script.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarPlus className="h-3 w-3" />
                    {extractDate(script.date_created)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
              {getDeploymentMethods(script).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {getDeploymentMethods(script).map(method => (
                    <Badge key={method} variant="secondary" className="text-xs">
                      {method}
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
      (a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime(),
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
            <Card className="bg-accent/30 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer relative overflow-hidden">
              {/* New Badge */}
              <div className="absolute top-2 left-2 z-65">
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5">
                  🆕 Recent
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-20 w-20 min-w-20 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.logo} name={script.name || script.slug} size={80} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-1 mb-1">{script.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1" title={script.date_created}>
                      <CalendarPlus className="h-3 w-3" />
                      {extractDate(script.date_created)}
                    </p>
                    {formatStarCount((script as any).github_stars) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {formatStarCount((script as any).github_stars)}
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">{script.description}</CardDescription>
                {getDeploymentMethods(script).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {getDeploymentMethods(script).map(method => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="w-full text-center text-sm font-medium text-primary group-hover:underline">
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
          <Card key={script.slug} className="bg-accent/30 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-start gap-3">
                <div className="flex h-16 w-16 min-w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                  <AppIcon src={script.logo} name={script.name || script.slug} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-base line-clamp-1 mb-1">{script.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarPlus className="h-3 w-3" />
                    {extractDate(script.date_created)}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <CardDescription className="line-clamp-3 text-sm leading-relaxed break-words">
                {script.description}
              </CardDescription>
              {getDeploymentMethods(script).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {getDeploymentMethods(script).map(method => (
                    <Badge key={method} variant="secondary" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link
                  href={{
                    pathname: "/scripts",
                    query: { id: script.slug },
                  }}
                  prefetch={false}
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

export function TrendingScripts({ items }: { items: Category[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Load view counts from Umami using share token
  useEffect(() => {
    async function fetchTrendingData() {
      try {
        // Fetch share token from Umami
        const shareResponse = await fetch("https://umami.mvl.biz.id/api/share/Zr8HcUGi7hsRQqqU");
        if (!shareResponse.ok) {
          throw new Error("Failed to fetch share token");
        }

        const shareData = await shareResponse.json();
        const token = shareData.token;

        // Fetch metrics using the share token
        const endAt = Date.now();
        const startAt = endAt - (30 * 24 * 60 * 60 * 1000); // 30 days ago

        const metricsResponse = await fetch(
          `https://umami.mvl.biz.id/api/websites/8d221a30-297c-432b-9e4e-2df217132fd6/stats?startAt=${startAt}&endAt=${endAt}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (metricsResponse.ok) {
          const data = await metricsResponse.json();
          console.log("Umami stats data:", data);

          // For now, we'll use GitHub stars as primary sorting
          // since we need to explore the Umami API structure more
          setViewCounts({});
        }
      }
      catch (error) {
        console.error("Failed to load Umami data:", error);
      }
      finally {
        setIsLoadingAnalytics(false);
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

    // Get scripts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Array.from(uniqueScriptsMap.values())
      .filter(script => new Date(script.date_created) >= thirtyDaysAgo)
      .sort((a, b) => {
        // Calculate trending score: 70% clicks + 30% GitHub stars
        const clicksA = viewCounts[a.slug] || 0;
        const clicksB = viewCounts[b.slug] || 0;
        const starsA = parseStars((a as any).github_stars);
        const starsB = parseStars((b as any).github_stars);

        const scoreA = (clicksA * 0.7) + (starsA * 0.0003); // 0.0003 to normalize stars
        const scoreB = (clicksB * 0.7) + (starsB * 0.0003);

        // Sort by trending score first, then by date
        if (scoreB !== scoreA)
          return scoreB - scoreA;
        return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
      })
      .slice(0, 6);
  }, [items, viewCounts]);

  if (!items || trendingScripts.length === 0)
    return null;

  return (
    <div className="">
      <div className="flex w-full items-center gap-2 mb-6 pb-3 border-b-2 border-primary/20">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Trending This Month</h2>
        <Badge variant="outline" className="ml-auto text-xs">
          Last 30 Days
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingScripts.map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
          >
            <Card className="bg-accent/30 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer relative overflow-hidden">
              <div className="absolute top-2 left-2 z-65">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
                  ⭐ Trending
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-20 w-20 min-w-20 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.logo} name={script.name || script.slug} size={80} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1" title={script.date_created}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.date_created)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {formatStarCount((script as any).github_stars) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </p>
                      )}
                      {viewCounts[script.slug] > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 font-medium">
                          👁️ {viewCounts[script.slug]}
                        </p>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="line-clamp-2 text-sm leading-relaxed">{script.description}</CardDescription>
                {getDeploymentMethods(script).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {getDeploymentMethods(script).map(method => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="w-full text-center text-sm font-medium text-primary group-hover:underline">
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
      const deployment = script.install_methods?.[0]?.deployment;
      if (!deployment)
        return 0;
      return Object.values(deployment).filter(Boolean).length;
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
            <Card className="bg-accent/30 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer relative overflow-hidden">
              <div className="absolute top-2 left-2 z-65">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-[10px] px-2 py-0.5">
                  ⭐ Popular
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-20 w-20 min-w-20 items-center justify-center rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-md">
                    <AppIcon src={script.logo} name={script.name || script.slug} size={80} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <h3 className="font-semibold text-base line-clamp-1">{script.name}</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-muted-foreground flex items-center gap-1" title={script.date_created}>
                        <CalendarPlus className="h-3 w-3" />
                        {extractDate(script.date_created)}
                      </p>
                    </div>
                    <div>
                      {formatStarCount((script as any).github_stars) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {formatStarCount((script as any).github_stars)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <CardDescription className="line-clamp-2 text-sm leading-relaxed break-words">
                  {script.description}
                </CardDescription>
                {getDeploymentMethods(script).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {getDeploymentMethods(script).map(method => (
                      <Badge key={method} variant="secondary" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <div className="w-full text-center text-sm font-medium text-primary group-hover:underline">
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
