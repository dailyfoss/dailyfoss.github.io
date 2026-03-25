"use client";

import { CalendarPlus, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompactScriptCard } from "./compact-script-card";

const ITEMS_PER_PAGE = 12;

type SortOption = "trending" | "newest" | "popular";

const SORT_OPTIONS = [
  {
    value: "trending" as SortOption,
    label: "Trending",
    icon: TrendingUp,
    badge: "Last 30 Days",
  },
  {
    value: "newest" as SortOption,
    label: "Newest",
    icon: CalendarPlus,
    badge: "Latest Additions",
  },
  {
    value: "popular" as SortOption,
    label: "Popular",
    icon: Star,
    badge: "Most Stars",
  },
];

export function UnifiedScriptsSection({ items }: { items: Category[] }) {
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [page, setPage] = useState(1);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchTrendingData() {
      try {
        const proxyUrl = process.env.NEXT_PUBLIC_PLAUSIBLE_PROXY_URL;
        if (!proxyUrl) return;
        const { getTrendingScriptsShared } = await import("@/lib/plausible-shared");
        const counts = await getTrendingScriptsShared("month");
        setViewCounts(counts);
      } catch (error) {
        console.error("Failed to load trending data:", error);
      }
    }
    if (sortBy === "trending") {
      fetchTrendingData();
    }
  }, [sortBy]);

  const sortedScripts = useMemo(() => {
    if (!items) return [];
    const scripts = items.flatMap((category) => category.apps || []);
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    const uniqueScripts = Array.from(uniqueScriptsMap.values());

    switch (sortBy) {
      case "newest":
        return uniqueScripts.sort(
          (a, b) =>
            new Date(b.metadata?.date_app_added || 0).getTime() -
            new Date(a.metadata?.date_app_added || 0).getTime()
        );
      case "popular":
        return uniqueScripts.sort((a, b) => {
          const starsA = a.metadata?.github_stars || 0;
          const starsB = b.metadata?.github_stars || 0;
          return starsB - starsA;
        });
      case "trending":
        return uniqueScripts.sort((a, b) => {
          const visitorsA = viewCounts[a.slug] || 0;
          const visitorsB = viewCounts[b.slug] || 0;
          if (visitorsB !== visitorsA) return visitorsB - visitorsA;
          return (
            new Date(b.metadata?.date_app_added || 0).getTime() -
            new Date(a.metadata?.date_app_added || 0).getTime()
          );
        });
      default:
        return uniqueScripts;
    }
  }, [items, sortBy, viewCounts]);

  // Reset to page 1 when sort changes
  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  if (!items || sortedScripts.length === 0) return null;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;
  const currentScripts = sortedScripts.slice(startIndex, endIndex);
  const hasMore = endIndex < sortedScripts.length;
  const hasPrev = page > 1;

  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  const SortIcon = currentSortOption?.icon || TrendingUp;

  return (
    <div className="space-y-6">
      {/* Header with Sort Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SortIcon className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">{currentSortOption?.label}</h2>
          {currentSortOption?.badge && (
            <Badge variant="outline" className="text-xs">
              {currentSortOption.badge}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasPrev && (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              Prev
            </button>
          )}
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors"
            >
              More
            </button>
          )}
          <Link href={`/explore?sort=${sortBy}`}>
            <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              View All
            </button>
          </Link>
        </div>
      </div>

      {/* Sort Tabs */}
      <div className="flex items-center gap-3 border-b pb-4">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = sortBy === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentScripts.map((script) => (
          <CompactScriptCard
            key={script.slug}
            script={script}
            allCategories={items}
            showViews={sortBy === "trending"}
            viewCount={viewCounts[script.slug]}
          />
        ))}
      </div>
    </div>
  );
}
