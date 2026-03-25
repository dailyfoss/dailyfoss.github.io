"use client";

import { CalendarPlus, Crown, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { CompactScriptCard } from "./compact-script-card";

const ITEMS_PER_PAGE = 6;


// Section Header Component
function SectionHeader({ 
  icon, 
  title, 
  badge, 
  page, 
  totalItems, 
  onPrev, 
  onNext,
  viewAllHref
}: { 
  icon?: React.ReactNode;
  title: string; 
  badge?: string;
  page: number;
  totalItems: number;
  onPrev: () => void;
  onNext: () => void;
  viewAllHref?: string;
}) {
  const hasMore = page * ITEMS_PER_PAGE < totalItems;
  const hasPrev = page > 1;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold">{title}</h2>
        {badge && (
          <Badge variant="outline" className="text-[10px] h-5">
            {badge}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        {hasPrev && (
          <button 
            onClick={onPrev}
            className="px-3 py-1 text-xs font-medium rounded hover:bg-accent transition-colors"
          >
            Prev
          </button>
        )}
        {hasMore && (
          <button 
            onClick={onNext}
            className="px-3 py-1 text-xs font-medium rounded hover:bg-accent transition-colors"
          >
            More
          </button>
        )}
        {viewAllHref && (
          <Link href={viewAllHref}>
            <button className="px-3 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              View All
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export function TrendingScripts({ items }: { items: Category[] }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);

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
    fetchTrendingData();
  }, []);

  const trendingScripts = useMemo(() => {
    if (!items) return [];
    const scripts = items.flatMap(category => category.apps || []);
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    return Array.from(uniqueScriptsMap.values())
      .sort((a, b) => {
        const visitorsA = viewCounts[a.slug] || 0;
        const visitorsB = viewCounts[b.slug] || 0;
        if (visitorsB !== visitorsA) return visitorsB - visitorsA;
        return new Date(b.metadata?.date_app_added || 0).getTime() - new Date(a.metadata?.date_app_added || 0).getTime();
      })
      .slice(0, 30);
  }, [items, viewCounts]);

  if (!items || trendingScripts.length === 0) return null;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  return (
    <div>
      <SectionHeader
        icon={<TrendingUp className="h-5 w-5 text-primary" />}
        title="Trending"
        badge="Last 30 Days"
        page={page}
        totalItems={trendingScripts.length}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        viewAllHref="/trending"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {trendingScripts.slice(startIndex, endIndex).map(script => (
          <CompactScriptCard 
            key={script.slug} 
            script={script} 
            allCategories={items}
            showViews
            viewCount={viewCounts[script.slug]}
          />
        ))}
      </div>
    </div>
  );
}

export function LatestScripts({ items }: { items: Category[] }) {
  const [page, setPage] = useState(1);

  const latestScripts = useMemo(() => {
    if (!items) return [];
    const scripts = items.flatMap(category => category.apps || []);
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

  if (!items || latestScripts.length === 0) return null;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  return (
    <div>
      <SectionHeader
        icon={<CalendarPlus className="h-5 w-5 text-primary" />}
        title="Newest"
        badge="Latest Additions"
        page={page}
        totalItems={latestScripts.length}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        viewAllHref="/newest"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {latestScripts.slice(startIndex, endIndex).map(script => (
          <CompactScriptCard key={script.slug} script={script} allCategories={items} />
        ))}
      </div>
    </div>
  );
}

export function PopularScripts({ items }: { items: Category[] }) {
  const [page, setPage] = useState(1);

  const popularScripts = useMemo(() => {
    if (!items) return [];
    const scripts = items.flatMap(category => category.apps || []);
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    return Array.from(uniqueScriptsMap.values())
      .sort((a, b) => {
        const starsA = a.metadata?.github_stars || 0;
        const starsB = b.metadata?.github_stars || 0;
        return starsB - starsA;
      });
  }, [items]);

  if (!items || popularScripts.length === 0) return null;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  return (
    <div>
      <SectionHeader
        icon={<Star className="h-5 w-5 text-primary fill-primary" />}
        title="Popular"
        badge="Most Stars"
        page={page}
        totalItems={popularScripts.length}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        viewAllHref="/popular"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {popularScripts.slice(startIndex, endIndex).map(script => (
          <CompactScriptCard key={script.slug} script={script} allCategories={items} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedScripts({ items }: { items: Category[] }) {
  const featuredScripts = useMemo(() => {
    if (!items) return [];
    const scripts = items.flatMap(category => category.apps || []);
    const uniqueScriptsMap = new Map<string, Script>();
    scripts.forEach((script) => {
      if (!uniqueScriptsMap.has(script.slug) && script.sponsored) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });
    return Array.from(uniqueScriptsMap.values()).slice(0, 6);
  }, [items]);

  if (!items || featuredScripts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold">Sponsored</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {featuredScripts.map(script => (
          <CompactScriptCard key={script.slug} script={script} allCategories={items} />
        ))}
      </div>
    </div>
  );
}


