"use client";

import { Layers, LayoutGrid, Star, Eye, CircleCheck, RefreshCcw, Clock3, Moon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Badge } from "@/components/ui/badge";

type RelatedToolsProps = {
  currentScript: Script;
  allCategories: Category[];
};

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

function getStatusIcon(daysSinceLastCommit: number): React.ReactNode {
  if (daysSinceLastCommit <= 30) 
    return <CircleCheck className="h-3 w-3 text-green-500" />;
  if (daysSinceLastCommit <= 180) 
    return <RefreshCcw className="h-3 w-3 text-amber-500" />;
  if (daysSinceLastCommit <= 365) 
    return <Clock3 className="h-3 w-3 text-orange-500" />;
  return <Moon className="h-3 w-3 text-red-500" />;
}

// Compact App Icon
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

// Compact Script Card Component (same style as main page)
function CompactScriptCard({ script, categoryName }: { 
  script: Script; 
  categoryName?: string;
}) {
  const daysSinceCommit = script.metadata?.date_last_commit 
    ? Math.floor((Date.now() - new Date(script.metadata.date_last_commit).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const daysOld = script.metadata?.date_app_added 
    ? Math.floor((Date.now() - new Date(script.metadata.date_app_added).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isNew = daysOld !== null && daysOld <= 7;

  // Build URL with query parameters
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
            {/* Row 1: Name + badges */}
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

export default function RelatedTools({ currentScript, allCategories }: RelatedToolsProps) {
  // Get the primary category name
  const primaryCategoryId = currentScript.categories?.[0];
  const primaryCategory = allCategories.find(cat => cat.id === primaryCategoryId);
  const categoryName = primaryCategory?.name || "Same Category";

  const relatedScripts = useMemo(() => {
    if (!allCategories || !currentScript) return [];

    // Get all scripts from categories
    const allScripts = allCategories.flatMap(category => category.scripts || []);
    
    // Filter out current script and duplicates
    const uniqueScriptsMap = new Map<string, Script>();
    allScripts.forEach((script) => {
      if (script.slug !== currentScript.slug && !uniqueScriptsMap.has(script.slug)) {
        uniqueScriptsMap.set(script.slug, script);
      }
    });

    const otherScripts = Array.from(uniqueScriptsMap.values());

    // Calculate similarity score for each script
    const scoredScripts = otherScripts.map(script => {
      let score = 0;

      // Only consider scripts from the same categories
      const sharedCategories = script.categories?.filter(cat => 
        currentScript.categories?.includes(cat)
      ).length || 0;
      
      // Skip if no shared categories
      if (sharedCategories === 0) {
        return { script, score: 0 };
      }

      // Base score for shared categories
      score += sharedCategories * 5;

      // +2 points for same deployment methods
      if (script.deployment_methods?.docker === currentScript.deployment_methods?.docker && script.deployment_methods?.docker) score += 2;
      if (script.deployment_methods?.docker_compose === currentScript.deployment_methods?.docker_compose && script.deployment_methods?.docker_compose) score += 2;
      if (script.deployment_methods?.kubernetes === currentScript.deployment_methods?.kubernetes && script.deployment_methods?.kubernetes) score += 2;

      // +3 bonus points if actively maintained (last updated < 30 days)
      if (script.metadata?.date_last_commit) {
        const lastCommit = new Date(script.metadata.date_last_commit);
        const daysSinceCommit = Math.floor((Date.now() - lastCommit.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCommit < 30) {
          score += 3;
        }
      }

      // +2 * log(stars) bonus for GitHub popularity
      if (script.metadata?.github_stars && script.metadata.github_stars > 0) {
        const starsBonus = 2 * Math.log10(script.metadata.github_stars);
        score += starsBonus;
      }

      return { script, score };
    });

    // Sort by score and return top 6
    return scoredScripts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.script);
  }, [currentScript, allCategories]);

  if (relatedScripts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Similar Tools in {categoryName}</h2>
        <Badge variant="outline" className="text-xs">
          {relatedScripts.length} {relatedScripts.length === 1 ? 'tool' : 'tools'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {relatedScripts.map(script => (
          <CompactScriptCard 
            key={script.slug} 
            script={script}
            categoryName={categoryName}
          />
        ))}
      </div>
    </div>
  );
}
