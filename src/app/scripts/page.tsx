"use client";
import { Clock, Container, Hexagon, Home, Search, TrendingUp } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Category, Script } from "@/lib/types";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ScriptItem } from "@/app/scripts/_components/script-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchCategories } from "@/lib/data";
import { usePlausiblePageview } from "@/hooks/use-plausible-pageview";

import type { FilterState } from "./_components/script-filters";

import { LatestScripts, PopularScripts, TrendingScripts } from "./_components/script-info-blocks";
import { SponsoredSidebar } from "./_components/sponsored-sidebar";
import { ScriptFilters } from "./_components/script-filters";
import Sidebar from "./_components/sidebar";

export const dynamic = "force-static";

// Skeleton loader for script cards
function ScriptCardSkeleton() {
  return (
    <Card className="bg-accent/30 border-2 flex flex-col h-full">
      <CardHeader className="pt-8">
        <div className="flex items-start gap-3">
          <Skeleton className="h-20 w-20 min-w-20 rounded-xl" />
          <div className="flex flex-col flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function ScriptContent() {
  const searchParams = useSearchParams();
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [links, setLinks] = useState<Category[]>([]);
  const [item, setItem] = useState<Script>();
  const [searchQuery, setSearchQuery] = useState("");
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    platforms: new Set(),
    deployments: new Set(),
    hosting: new Set(),
    ui: new Set(),
  });

  // Track pageviews with custom URL for Plausible
  usePlausiblePageview();

  // Read URL parameters and set selected script
  useEffect(() => {
    const scriptId = searchParams.get("id");
    const category = searchParams.get("category");

    if (scriptId) {
      setSelectedScript(scriptId);
    }
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedScript && links.length > 0) {
      const script = links
        .flatMap(category => category.scripts)
        .find(script => script.slug === selectedScript);
      setItem(script);

      // Track script view in both Umami and Plausible
      if (script && typeof window !== "undefined") {
        try {
          // Track in Umami
          if ((window as any).umami) {
            (window as any).umami.track("script-view", {
              slug: selectedScript,
              name: script.name,
            });
          }

          // Track in Plausible with custom page URL
          if ((window as any).plausible) {
            (window as any).plausible("pageview", {
              u: `${window.location.origin}/scripts/${selectedScript}`,
              props: {
                script_name: script.name,
                script_slug: selectedScript,
              },
            });
          }
        }
        catch (error) {
          console.error("Failed to track script view:", error);
        }
      }
    }
  }, [selectedScript, links]);

  useEffect(() => {
    fetchCategories()
      .then((categories) => {
        // ✅ Only keep categories that contain scripts
        const filtered = categories.filter(
          category => category.scripts && category.scripts.length > 0,
        );
        setLinks(filtered);
      })
      .catch(error => console.error(error));
  }, []);

  const matchesFilters = (script: Script): boolean => {
    if (!script.install_methods || script.install_methods.length === 0) {
      return filters.platforms.size === 0
        && filters.deployments.size === 0
        && filters.hosting.size === 0
        && filters.ui.size === 0;
    }

    const method = script.install_methods[0];
    const platform = method?.platform;
    const hosting = method?.hosting;
    const deployment = method?.deployment;
    const ui = method?.ui;

    if (!method) {
      return filters.platforms.size === 0
        && filters.deployments.size === 0
        && filters.hosting.size === 0
        && filters.ui.size === 0;
    }

    // Check platform filters
    if (filters.platforms.size > 0) {
      const platformMatches = Array.from(filters.platforms).some((filter) => {
        if (filter === "desktop-linux")
          return platform?.desktop?.linux;
        if (filter === "desktop-windows")
          return platform?.desktop?.windows;
        if (filter === "desktop-macos")
          return platform?.desktop?.macos;
        if (filter === "mobile-android")
          return platform?.mobile?.android;
        if (filter === "mobile-ios")
          return platform?.mobile?.ios;
        if (filter === "web_app")
          return platform?.web_app;
        if (filter === "browser_extension")
          return platform?.browser_extension;
        if (filter === "cli_only")
          return platform?.cli_only;
        return false;
      });
      if (!platformMatches)
        return false;
    }

    // Check deployment filters
    if (filters.deployments.size > 0) {
      const deploymentMatches = Array.from(filters.deployments).some((filter) => {
        return deployment?.[filter as keyof typeof deployment];
      });
      if (!deploymentMatches)
        return false;
    }

    // Check hosting filters
    if (filters.hosting.size > 0) {
      const hostingMatches = Array.from(filters.hosting).some((filter) => {
        return hosting?.[filter as keyof typeof hosting];
      });
      if (!hostingMatches)
        return false;
    }

    // Check UI filters
    if (filters.ui.size > 0) {
      const uiMatches = Array.from(filters.ui).some((filter) => {
        return ui?.[filter as keyof typeof ui];
      });
      if (!uiMatches)
        return false;
    }

    return true;
  };

  const filteredLinks = links.map(category => ({
    ...category,
    scripts: category.scripts.filter((script) => {
      // First check search query
      const matchesSearch = searchQuery === ""
        || script.name.toLowerCase().includes(searchQuery.toLowerCase())
        || script.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Then check filters
      const matchesFilter = matchesFilters(script);

      // Check quick filter
      let matchesQuickFilter = true;
      if (quickFilter) {
        const method = script.install_methods?.[0];
        const hosting = method?.hosting;
        const deployment = method?.deployment;
        switch (quickFilter) {
          case "popular":
            // This is a visual filter, we'll handle it differently
            matchesQuickFilter = true;
            break;
          case "recent":
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchesQuickFilter = new Date(script.date_created) >= thirtyDaysAgo;
            break;
          case "self-hosted":
            matchesQuickFilter = hosting?.self_hosted || false;
            break;
          case "docker":
            matchesQuickFilter = deployment?.docker || deployment?.docker_compose || false;
            break;
          case "kubernetes":
            matchesQuickFilter = deployment?.kubernetes || deployment?.helm || false;
            break;
        }
      }

      return matchesSearch && matchesFilter && matchesQuickFilter;
    }),
  })).filter(category => category.scripts.length > 0);

  const totalScripts = links.reduce((acc, category) => acc + category.scripts.length, 0);
  const uniqueScripts = new Set(links.flatMap(cat => cat.scripts.map(s => s.slug))).size;
  const filteredScriptsCount = new Set(filteredLinks.flatMap(cat => cat.scripts.map(s => s.slug))).size;

  return (
    <div className="mb-3 pt-6">
      {/* Hero Section - Only show when no script is selected */}
      {!selectedScript && (
        <div className="w-full border-b bg-gradient-to-br from-accent/20 to-accent/5">
          <div className="w-full py-8 sm:py-10">
            <div className="max-w-3xl mx-auto text-center space-y-4 px-2 sm:px-16">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter">
                Explore FOSS
                {" "}
                <span className="bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent">
                  Scripts & Tools
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                Browse our curated collection of
                {" "}
                {uniqueScripts}
                + open source deployment scripts and tools
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto pt-2 space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search scripts... (Press / to focus)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 pr-20 h-14 text-lg shadow-lg ring-2 ring-accent/20 focus-visible:ring-accent/40 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden sm:flex items-center gap-1">
                    <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border border-border">/</kbd>
                  </div>
                </div>

                {/* Quick Filter Chips - Horizontal scroll on mobile */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-visible">
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Quick filters:</span>
                  <Badge
                    variant={quickFilter === "popular" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                    onClick={() => setQuickFilter(quickFilter === "popular" ? null : "popular")}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                  <Badge
                    variant={quickFilter === "recent" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                    onClick={() => setQuickFilter(quickFilter === "recent" ? null : "recent")}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Recently Updated
                  </Badge>
                  <Badge
                    variant={quickFilter === "self-hosted" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                    onClick={() => setQuickFilter(quickFilter === "self-hosted" ? null : "self-hosted")}
                  >
                    <Home className="h-3 w-3 mr-1" />
                    Self-Hosted
                  </Badge>
                  <Badge
                    variant={quickFilter === "docker" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                    onClick={() => setQuickFilter(quickFilter === "docker" ? null : "docker")}
                  >
                    <Container className="h-3 w-3 mr-1" />
                    Docker
                  </Badge>
                  <Badge
                    variant={quickFilter === "kubernetes" ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                    onClick={() => setQuickFilter(quickFilter === "kubernetes" ? null : "kubernetes")}
                  >
                    <Hexagon className="h-3 w-3 mr-1" />
                    Kubernetes
                  </Badge>
                </div>
              </div>

              {/* Stats - Enhanced Visibility */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent drop-shadow-sm">
                    {uniqueScripts}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground/80 mt-1">Scripts</div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#9c40ff] to-[#ffaa40] bg-clip-text text-transparent drop-shadow-sm">
                    {links.length}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground/80 mt-1">Categories</div>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20">
                  <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#ffaa40] to-[#9c40ff] bg-clip-text text-transparent drop-shadow-sm">
                    Daily
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-foreground/80 mt-1">Updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section - Only show when no script is selected */}
      {!selectedScript && (
        <div className="w-full border-b bg-background/50 backdrop-blur-sm sticky top-20 z-10 shadow-sm">
          <div className="w-full py-4 px-2 sm:px-16">
            <div className="flex flex-col gap-4">
              {/* Results Count & Refine Label */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold">
                    {filteredScriptsCount === uniqueScripts
                      ? (
                        `${uniqueScripts} Scripts`
                      )
                      : (
                        `${filteredScriptsCount} of ${uniqueScripts} Scripts`
                      )}
                  </h2>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm font-medium text-muted-foreground">Refine results:</span>
                </div>
              </div>

              {/* Filter Pills */}
              <ScriptFilters filters={filters} onFilterChange={setFilters} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-8 flex w-full gap-2 px-2 sm:px-16">
        {/* Left Sidebar - Categories */}
        <div className="hidden sm:flex">
          <Sidebar
            items={filteredLinks}
            selectedScript={selectedScript}
            setSelectedScript={setSelectedScript}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Main Content */}
        <div className="w-full px-2 sm:px-0 sm:w-auto pb-8 flex-1 min-w-0">
          {selectedScript && item
            ? (
              <ScriptItem item={item} setSelectedScript={setSelectedScript} />
            )
            : (
              <div className="flex w-full flex-col gap-12">
                <TrendingScripts items={filteredLinks} />
                <div className="border-t border-border/50" />
                <LatestScripts items={filteredLinks} />
                <div className="border-t border-border/50" />
                <PopularScripts items={filteredLinks} />
              </div>
            )}
        </div>

        {/* Right Sidebar - Sponsored */}
        <SponsoredSidebar items={links} onScriptSelect={setSelectedScript} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={(
        <div className="mb-3 pt-6">
          {/* Hero Skeleton */}
          <div className="w-full border-b bg-gradient-to-br from-accent/20 to-accent/5">
            <div className="w-full py-8 sm:py-10">
              <div className="max-w-3xl mx-auto text-center space-y-4 px-2 sm:px-16">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
                <div className="max-w-2xl mx-auto pt-2">
                  <Skeleton className="h-14 w-full" />
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mt-6 sm:mt-8 flex w-full gap-2 px-2 sm:px-16">
            {/* Sidebar Skeleton */}
            <div className="hidden sm:flex">
              <div className="w-[240px] space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="w-full px-2 sm:px-0 sm:w-auto pb-8 flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScriptCardSkeleton />
                <ScriptCardSkeleton />
                <ScriptCardSkeleton />
                <ScriptCardSkeleton />
                <ScriptCardSkeleton />
                <ScriptCardSkeleton />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="hidden lg:block lg:w-[260px]">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}
    >
      <ScriptContent />
    </Suspense>
  );
}
