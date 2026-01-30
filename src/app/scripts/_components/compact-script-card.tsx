"use client";

import { CircleCheck, RefreshCcw, Clock3, Moon, LayoutGrid, Star, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

function getStatusIcon(daysSinceLastCommit: number) {
  if (daysSinceLastCommit <= 30) 
    return <CircleCheck className="h-3 w-3 text-green-500" />;
  if (daysSinceLastCommit <= 180) 
    return <RefreshCcw className="h-3 w-3 text-amber-500" />;
  if (daysSinceLastCommit <= 365) 
    return <Clock3 className="h-3 w-3 text-orange-500" />;
  return <Moon className="h-3 w-3 text-red-500" />;
}

function formatStarCount(stars?: string | number | null): string | null {
  if (!stars) return null;
  const num = typeof stars === "string" ? Number.parseInt(stars, 10) : stars;
  if (isNaN(num) || num === 0) return null;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

function getRelativeTimeFromDays(days: number | null): string {
  if (days === null) return 'unknown';
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function AppIcon({ src, src_light, name }: { src?: string | null; src_light?: string | null; name: string }) {
  const [showFallback, setShowFallback] = useState(!src || src.trim() === "");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const checkTheme = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const currentSrc = (theme === 'dark' && src_light) ? src_light : src;

  useEffect(() => {
    setShowFallback(!currentSrc || currentSrc.trim() === "");
  }, [currentSrc]);

  if (showFallback) {
    return (
      <div className="flex items-center justify-center bg-accent/30 rounded-lg w-full h-full">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc || ''}
      alt={name}
      className="w-full h-full object-contain p-1"
      onError={() => setShowFallback(true)}
    />
  );
}

export function CompactScriptCard({ 
  script, 
  allCategories, 
  showViews, 
  viewCount 
}: { 
  script: Script; 
  allCategories: Category[];
  showViews?: boolean;
  viewCount?: number;
}) {
  const daysSinceCommit = script.metadata?.date_last_commit 
    ? Math.floor((Date.now() - new Date(script.metadata.date_last_commit).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const daysOld = script.metadata?.date_app_added 
    ? Math.floor((Date.now() - new Date(script.metadata.date_app_added).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isNew = daysOld !== null && daysOld <= 7;

  // Get first category name
  const categoryId = script.categories && script.categories.length > 0 ? script.categories[0] : null;
  const categoryName = categoryId
    ? allCategories.find(cat => cat.id === categoryId)?.name
    : null;

  // Build URL with id and category params (using category name, not id)
  const href = categoryName 
    ? `/?id=${script.slug}&category=${encodeURIComponent(categoryName)}`
    : `/?id=${script.slug}`;

  return (
    <Link
      href={href}
      className="group block h-full"
    >
      <div className="flex flex-col h-full p-4 rounded-xl border bg-card hover:bg-accent/30 hover:border-primary/40 hover:shadow-md transition-all duration-200">
        {/* Header: Icon on left, content on right */}
        <div className="flex gap-3 mb-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-accent/50 overflow-hidden">
            <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Row 1: Name + badges ←→ Category */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {script.name}
                </h3>
                {daysSinceCommit !== null && getStatusIcon(daysSinceCommit)}
                {isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-600 dark:text-green-400">
                    NEW
                  </span>
                )}
              </div>
              {categoryName && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium flex-shrink-0">
                  {categoryName}
                </span>
              )}
            </div>
            {/* Row 2: Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {script.tagline || script.description}
            </p>
          </div>
        </div>

        {/* Footer with stats and badges */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {formatStarCount(script.metadata?.github_stars) && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3" />
                {formatStarCount(script.metadata?.github_stars)}
              </span>
            )}
            {showViews && viewCount && (
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {viewCount}
              </span>
            )}
            {script.metadata?.date_app_added && (
              <span>Added {getRelativeTimeFromDays(daysOld)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {script.community_integrations?.proxmox_ve?.supported && (
              <span className="px-1.5 py-0.5 rounded bg-accent/60 text-[10px] font-medium">PVE</span>
            )}
            {script.community_integrations?.yunohost?.supported && (
              <span className="px-1.5 py-0.5 rounded bg-accent/60 text-[10px] font-medium">Yuno</span>
            )}
            {script.community_integrations?.truenas?.supported && (
              <span className="px-1.5 py-0.5 rounded bg-accent/60 text-[10px] font-medium">TrueNAS</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
