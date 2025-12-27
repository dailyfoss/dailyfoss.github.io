"use client";
import { Filter, Globe, Laptop, Search, Smartphone, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Category, Script } from "@/lib/types";

import { ScriptItem } from "@/app/scripts/_components/script-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/lib/data";
import { usePlausiblePageview } from "@/hooks/use-plausible-pageview";

import type { FilterState } from "./_components/script-filters";

import { LatestScripts, PopularScripts, TrendingScripts } from "./_components/script-info-blocks";
import { SponsoredSidebar } from "./_components/sponsored-sidebar";
import { ScriptFilters } from "./_components/script-filters";
import Sidebar from "./_components/sidebar";
import { DynamicMetaTags } from "@/components/dynamic-meta-tags";

export const dynamic = "force-static";

function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col p-4 rounded-xl border bg-card h-full">
      <div className="flex gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="pt-2 border-t border-border/50">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    platforms: new Set(),
    deployments: new Set(),
    hosting: new Set(),
    ui: new Set(),
    community: new Set(),
    activity: new Set(),
  });

  usePlausiblePageview();

  useEffect(() => {
    const scriptId = searchParams.get("id");
    const category = searchParams.get("category");
    if (scriptId) setSelectedScript(scriptId);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
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

      if (script && typeof window !== "undefined" && (window as any).plausible) {
        const customUrl = `${window.location.origin}/scripts/${selectedScript}`;
        (window as any).plausible("pageview", {
          u: customUrl,
          props: { script_name: script.name, script_slug: selectedScript },
        });
      }
    }
  }, [selectedScript, links]);

  useEffect(() => {
    fetchCategories()
      .then((categories) => {
        const filtered = categories.filter(category => category.scripts?.length > 0);
        setLinks(filtered);
      })
      .catch(error => console.error(error));
  }, []);

  const matchesFilters = (script: Script): boolean => {
    const platform = script.platform_support;
    const hosting = script.hosting_options;
    const deployment = script.deployment_methods;
    const ui = script.interfaces;

    if (!platform && !hosting && !deployment && !ui) {
      return filters.platforms.size === 0 && filters.deployments.size === 0 && 
             filters.hosting.size === 0 && filters.ui.size === 0 && 
             filters.community.size === 0 && filters.activity.size === 0;
    }

    if (filters.platforms.size > 0) {
      const platformMatches = Array.from(filters.platforms).some((filter) => {
        if (filter === "desktop-linux") return platform?.desktop?.linux;
        if (filter === "desktop-windows") return platform?.desktop?.windows;
        if (filter === "desktop-macos") return platform?.desktop?.macos;
        if (filter === "mobile-android") return platform?.mobile?.android;
        if (filter === "mobile-ios") return platform?.mobile?.ios;
        if (filter === "web_app") return platform?.web_app;
        if (filter === "browser_extension") return platform?.browser_extension;
        return false;
      });
      if (!platformMatches) return false;
    }

    if (filters.deployments.size > 0) {
      const deploymentMatches = Array.from(filters.deployments).some((filter) => {
        return deployment?.[filter as keyof typeof deployment];
      });
      if (!deploymentMatches) return false;
    }

    if (filters.hosting.size > 0) {
      const hostingMatches = Array.from(filters.hosting).some((filter) => {
        return hosting?.[filter as keyof typeof hosting];
      });
      if (!hostingMatches) return false;
    }

    if (filters.ui.size > 0) {
      const uiMatches = Array.from(filters.ui).some((filter) => {
        return ui?.[filter as keyof typeof ui];
      });
      if (!uiMatches) return false;
    }

    if (filters.community.size > 0) {
      const communityMatches = Array.from(filters.community).every((filter) => {
        return script.community_integrations?.[filter as keyof typeof script.community_integrations]?.supported;
      });
      if (!communityMatches) return false;
    }

    if (filters.activity.size > 0) {
      const getRepositoryStatus = (script: Script): string => {
        if (!script.metadata?.date_last_commit) return 'unknown';
        const lastCommitDate = new Date(script.metadata.date_last_commit);
        const now = new Date();
        const daysSinceLastCommit = Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastCommit <= 30) return 'active';
        if (daysSinceLastCommit <= 180) return 'regular';
        if (daysSinceLastCommit <= 365) return 'occasional';
        return 'dormant';
      };
      const status = getRepositoryStatus(script);
      if (!filters.activity.has(status)) return false;
    }

    return true;
  };

  const filteredLinks = links.map(category => ({
    ...category,
    scripts: category.scripts.filter((script) => {
      const matchesSearch = searchQuery === "" ||
        script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = matchesFilters(script);

      let matchesQuickFilter = true;
      if (quickFilter) {
        const platform = script.platform_support;
        switch (quickFilter) {
          case "desktop":
            matchesQuickFilter = !!(platform?.desktop?.linux || platform?.desktop?.windows || platform?.desktop?.macos);
            break;
          case "mobile":
            matchesQuickFilter = !!(platform?.mobile?.android || platform?.mobile?.ios);
            break;
          case "web_app":
            matchesQuickFilter = platform?.web_app || false;
            break;
        }
      }

      return matchesSearch && matchesFilter && matchesQuickFilter;
    }),
  })).filter(category => category.scripts.length > 0);

  const uniqueScripts = new Set(links.flatMap(cat => cat.scripts.map(s => s.slug))).size;
  const filteredScriptsCount = new Set(filteredLinks.flatMap(cat => cat.scripts.map(s => s.slug))).size;
  
  const hasActiveFilters = filters.platforms.size > 0 || filters.deployments.size > 0 || 
                           filters.hosting.size > 0 || filters.ui.size > 0 || 
                           filters.community.size > 0 || filters.activity.size > 0 || 
                           quickFilter !== null || searchQuery !== "";

  const clearAllFilters = () => {
    setFilters({
      platforms: new Set(),
      deployments: new Set(),
      hosting: new Set(),
      ui: new Set(),
      community: new Set(),
      activity: new Set(),
    });
    setQuickFilter(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background">
      <DynamicMetaTags script={item} />
      
      {/* Hero Section */}
      {!selectedScript && (
        <div className="border-b">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <div className="text-center space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Discover <span className="text-primary">Open Source</span> Tools
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Browse {uniqueScripts}+ curated self-hosted apps and deployment scripts
              </p>

              {/* Search */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-input"
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-12 h-11 bg-background"
                  />
                  <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
                    /
                  </kbd>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <QuickFilterButton
                  active={quickFilter === "desktop"}
                  onClick={() => setQuickFilter(quickFilter === "desktop" ? null : "desktop")}
                  icon={<Laptop className="h-3.5 w-3.5" />}
                  label="Desktop"
                />
                <QuickFilterButton
                  active={quickFilter === "mobile"}
                  onClick={() => setQuickFilter(quickFilter === "mobile" ? null : "mobile")}
                  icon={<Smartphone className="h-3.5 w-3.5" />}
                  label="Mobile"
                />
                <QuickFilterButton
                  active={quickFilter === "web_app"}
                  onClick={() => setQuickFilter(quickFilter === "web_app" ? null : "web_app")}
                  icon={<Globe className="h-3.5 w-3.5" />}
                  label="Web App"
                />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{uniqueScripts}</div>
                  <div className="text-xs text-muted-foreground">Tools</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{links.length}</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">Daily</div>
                  <div className="text-xs text-muted-foreground">Updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {!selectedScript && (
        <div className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {filteredScriptsCount === uniqueScripts 
                    ? `${uniqueScripts} tools` 
                    : `${filteredScriptsCount} of ${uniqueScripts}`}
                </span>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filters
                {(filters.platforms.size + filters.deployments.size + filters.hosting.size + 
                  filters.ui.size + filters.community.size + filters.activity.size) > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                    {filters.platforms.size + filters.deployments.size + filters.hosting.size + 
                     filters.ui.size + filters.community.size + filters.activity.size}
                  </Badge>
                )}
              </Button>
            </div>
            
            {showFilters && (
              <div className="pt-4 pb-2">
                <ScriptFilters filters={filters} onFilterChange={setFilters} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar
              items={filteredLinks}
              selectedScript={selectedScript}
              setSelectedScript={setSelectedScript}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {selectedScript && item ? (
              <ScriptItem item={item} setSelectedScript={setSelectedScript} allCategories={links} />
            ) : (
              <div className="space-y-10">
                <TrendingScripts items={filteredLinks} />
                <LatestScripts items={filteredLinks} />
                <PopularScripts items={filteredLinks} />
              </div>
            )}
          </div>

          {/* Right Sidebar - Sponsored */}
          <div className="hidden xl:block flex-shrink-0">
            <SponsoredSidebar items={links} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickFilterButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200 border
        ${active 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-background hover:bg-accent border-border hover:border-primary/50"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background">
          {/* Hero Skeleton */}
          <div className="border-b">
            <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
              <div className="text-center space-y-6">
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-5 w-48 mx-auto" />
                <Skeleton className="h-11 w-full max-w-md mx-auto" />
                <div className="flex justify-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
              {/* Left Sidebar Skeleton */}
              <div className="hidden lg:block w-[280px] flex-shrink-0">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <ScriptCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Right Sidebar Skeleton */}
              <div className="hidden xl:block w-[260px] flex-shrink-0">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ScriptContent />
    </Suspense>
  );
}
