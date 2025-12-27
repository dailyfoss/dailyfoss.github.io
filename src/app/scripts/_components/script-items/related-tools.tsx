"use client";

import { Layers, LayoutGrid, Star, CircleCheck, RefreshCcw, Clock3, Moon, Archive } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRepositoryStatus } from "@/hooks/use-repository-status";

type RelatedToolsProps = {
  currentScript: Script;
  allCategories: Category[];
};

// Simple icon loader with fallback and theme support
function AppIcon({ src, src_light, name, size = 48 }: { src?: string | null; src_light?: string | null; name: string; size?: number }) {
  const [showFallback, setShowFallback] = useState(!src || src.trim() === "");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const currentSrc = (theme === 'dark' && src_light) ? src_light : src;

  useEffect(() => {
    setShowFallback(!currentSrc || currentSrc.trim() === "");
  }, [currentSrc]);

  const imgClass = "h-10 w-10 object-contain rounded-md p-0.5";
  const fallbackClass = "h-10 w-10";
  const iconSize = "h-7 w-7";

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
      loading="lazy"
      className={imgClass}
      onError={() => setShowFallback(true)}
    />
  );
}

// Helper to format star count
function formatStarCount(stars?: number | null): string | null {
  if (!stars) return null;
  
  if (stars >= 1000000) return `${(stars / 1000000).toFixed(1)}m`;
  if (stars >= 1000) return `${(stars / 1000).toFixed(1)}k`;
  return stars.toString();
}

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

// Get status icon based on repository status
function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CircleCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    case 'regular':
      return <RefreshCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
    case 'occasional':
      return <Clock3 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />;
    case 'dormant':
      return <Moon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    case 'archived':
      return <Archive className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />;
    default:
      return null;
  }
}

// Script metadata component
function ScriptMetadata({ script }: { script: Script }) {
  const { repositoryInfo, loading } = useRepositoryStatus(script);
  
  // Determine which date to show
  let displayDate: Date | null = null;
  let displayLabel = '';
  
  if (!loading && repositoryInfo) {
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    
    // If release exists and is within 2 weeks, show release
    if (repositoryInfo.lastRelease && repositoryInfo.lastRelease.getTime() > twoWeeksAgo) {
      displayDate = repositoryInfo.lastRelease;
      displayLabel = 'Last released';
    }
    // Otherwise, show commit if available
    else if (repositoryInfo.lastCommit) {
      displayDate = repositoryInfo.lastCommit;
      displayLabel = 'Last commit';
    }
    // Fallback to old release if no commit
    else if (repositoryInfo.lastRelease) {
      displayDate = repositoryInfo.lastRelease;
      displayLabel = 'Last released';
    }
  }
  
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-2">
      {/* Repository Status Icon */}
      {!loading && repositoryInfo && repositoryInfo.status !== 'unknown' && (
        <span className="flex items-center">
          {getStatusIcon(repositoryInfo.status)}
        </span>
      )}
      
      {/* GitHub Stars */}
      {script.metadata?.github_stars && (
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          {formatStarCount(script.metadata.github_stars)}
        </span>
      )}
      
      {/* Last Update */}
      {displayDate && (
        <>
          <span className="text-muted-foreground/50">•</span>
          <span>
            {displayLabel} {formatRelativeTime(displayDate)}
          </span>
        </>
      )}
    </div>
  );
}

export default function RelatedTools({ currentScript, allCategories }: RelatedToolsProps) {
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

      // +2 points for same deployment methods
      if (script.deployment_methods?.docker === currentScript.deployment_methods?.docker && script.deployment_methods?.docker) score += 2;
      if (script.deployment_methods?.docker_compose === currentScript.deployment_methods?.docker_compose && script.deployment_methods?.docker_compose) score += 2;
      if (script.deployment_methods?.kubernetes === currentScript.deployment_methods?.kubernetes && script.deployment_methods?.kubernetes) score += 2;
      if (script.deployment_methods?.helm === currentScript.deployment_methods?.helm && script.deployment_methods?.helm) score += 2;
      if (script.deployment_methods?.terraform === currentScript.deployment_methods?.terraform && script.deployment_methods?.terraform) score += 2;
      if (script.deployment_methods?.script === currentScript.deployment_methods?.script && script.deployment_methods?.script) score += 2;

      // +1 point for similar platforms
      if (script.platform_support?.desktop?.linux === currentScript.platform_support?.desktop?.linux && script.platform_support?.desktop?.linux) score += 1;
      if (script.platform_support?.desktop?.windows === currentScript.platform_support?.desktop?.windows && script.platform_support?.desktop?.windows) score += 1;
      if (script.platform_support?.desktop?.macos === currentScript.platform_support?.desktop?.macos && script.platform_support?.desktop?.macos) score += 1;
      if (script.platform_support?.mobile?.android === currentScript.platform_support?.mobile?.android && script.platform_support?.mobile?.android) score += 1;
      if (script.platform_support?.mobile?.ios === currentScript.platform_support?.mobile?.ios && script.platform_support?.mobile?.ios) score += 1;
      if (script.platform_support?.web_app === currentScript.platform_support?.web_app && script.platform_support?.web_app) score += 1;
      if (script.platform_support?.browser_extension === currentScript.platform_support?.browser_extension && script.platform_support?.browser_extension) score += 1;

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
        <h2 className="text-lg font-semibold">Similar Tools</h2>
        <Badge variant="outline" className="text-xs">
          {relatedScripts.length} {relatedScripts.length === 1 ? 'tool' : 'tools'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {relatedScripts.map(script => (
          <Link
            key={script.slug}
            href={{
              pathname: "/scripts",
              query: { id: script.slug },
            }}
            className="block group"
          >
            <Card className="h-full bg-accent/20 border hover:border-primary/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start gap-3">
                  <div className="flex h-12 w-12 min-w-12 items-center justify-center rounded-lg bg-gradient-to-br from-accent/40 to-accent/60 p-1 shadow-sm">
                    <AppIcon 
                      src={script.resources?.logo} 
                      src_light={script.resources?.logo_light}
                      name={script.name || script.slug} 
                      size={48} 
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                      {script.name}
                    </h3>
                    <ScriptMetadata script={script} />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 pb-3">
                <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                  {script.tagline || script.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
