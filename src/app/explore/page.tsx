"use client";

import { CalendarPlus, Star, TrendingUp, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import type { Category, Script } from "@/lib/types";
import { fetchCategories } from "@/lib/data";
import { usePlausiblePageview } from "@/hooks/use-plausible-pageview";
import { CompactScriptCard } from "@/app/scripts/_components/compact-script-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 15;

type SortOption = "newest" | "popular" | "trending";

const SORT_OPTIONS = [
  {
    value: "newest" as SortOption,
    label: "Newest",
    icon: CalendarPlus,
    description: "Latest additions to the platform",
  },
  {
    value: "popular" as SortOption,
    label: "Popular",
    icon: Star,
    description: "Most starred on GitHub",
  },
  {
    value: "trending" as SortOption,
    label: "Trending",
    icon: TrendingUp,
    description: "Most viewed in the last 30 days",
  },
];

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "newest"
  );

  usePlausiblePageview();

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        const filtered = cats.filter((category) => category.apps?.length > 0);
        setCategories(filtered);
      })
      .catch((error) => console.error(error));
  }, []);

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

  // Update URL when sort changes
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setPage(1);
    router.push(`/explore?sort=${newSort}`, { scroll: false });
  };

  const sortedScripts = useMemo(() => {
    if (!categories.length) return [];
    const scripts = categories.flatMap((category) => category.apps || []);
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
  }, [categories, sortBy, viewCounts]);

  const totalPages = Math.ceil(sortedScripts.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;
  const currentScripts = sortedScripts.slice(startIndex, endIndex);

  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  const SortIcon = currentSortOption?.icon || ArrowUpDown;

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <SortIcon className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Explore Apps</h1>
              </div>
              <p className="text-muted-foreground">
                {currentSortOption?.description || "Browse all open-source tools"}
              </p>
            </div>

            {/* Sort Selector - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(option.value)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sort Selector - Mobile */}
          <div className="sm:hidden mb-4">
            <Select value={sortBy} onValueChange={(value) => handleSortChange(value as SortOption)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{sortedScripts.length} total apps</span>
            <span>•</span>
            <span>
              Page {page} of {totalPages}
            </span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Grid */}
        {currentScripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {currentScripts.map((script) => (
              <CompactScriptCard
                key={script.slug}
                script={script}
                allCategories={categories}
                showViews={sortBy === "trending"}
                viewCount={viewCounts[script.slug]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No apps found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-accent/10 to-background pt-20"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><p className="text-center">Loading...</p></div></div>}>
      <ExplorePageContent />
    </Suspense>
  );
}
