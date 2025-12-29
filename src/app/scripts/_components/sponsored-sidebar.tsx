"use client";

import { Crown, LayoutGrid, Mail, Star, CircleCheck, RefreshCcw, Clock3, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import type { Category, Script } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SponsoredSidebarProps = {
  items: Category[];
  className?: string;
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

// Compact Sponsored Card (same style as main page)
function SponsoredCard({ script }: { script: Script }) {
  const daysSinceCommit = script.metadata?.date_last_commit 
    ? Math.floor((Date.now() - new Date(script.metadata.date_last_commit).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Link
      href={`/${script.slug}`}
      className="group block"
    >
      <div className="flex flex-col p-4 rounded-xl border bg-card hover:bg-accent/30 hover:border-primary/40 hover:shadow-md transition-all duration-200 relative min-h-[120px]">
        {/* Sponsored Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
        >
          Sponsored
        </Badge>

        {/* Header: Icon + Name */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-accent/50 overflow-hidden">
            <AppIcon src={script.resources?.logo} src_light={script.resources?.logo_light} name={script.name} />
          </div>
          <div className="flex items-center gap-1.5 pr-16">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
              {script.name}
            </h3>
            {daysSinceCommit !== null && getStatusIcon(daysSinceCommit)}
          </div>
        </div>

        {/* Tagline - Full width below header */}
        <p className="text-[11px] text-muted-foreground line-clamp-3 mt-2">
          {script.tagline}
        </p>

        {/* Footer with stats */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-2 border-t border-border/50">
          {formatStarCount(script.metadata?.github_stars) && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3" />
              {formatStarCount(script.metadata?.github_stars)}
            </span>
          )}
          <div className="flex items-center gap-1">
            {script.community_integrations?.proxmox_ve?.supported && (
              <span className="px-1.5 py-0.5 rounded bg-accent/60 text-[9px] font-medium">PVE</span>
            )}
            {script.community_integrations?.yunohost?.supported && (
              <span className="px-1.5 py-0.5 rounded bg-accent/60 text-[9px] font-medium">Yuno</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SponsoredSidebar({ items, className }: SponsoredSidebarProps) {
  const [sponsoredScripts, setSponsoredScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cloudflare Worker API endpoint
  const WORKER_URL = process.env.NEXT_PUBLIC_SPONSORED_API;

  // Fetch sponsored slugs from Cloudflare Worker and resolve to full scripts
  const fetchSponsored = async () => {
    // If no worker URL is configured, don't show sponsored tools
    if (!WORKER_URL) {
      console.log('Cloudflare Worker not configured, sponsored tools disabled');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(WORKER_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Worker API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data: { success: boolean; slugs?: string[] } = await response.json();
      
      if (data.success && data.slugs && Array.isArray(data.slugs)) {
        // Convert slugs to full script objects by looking them up in categories
        const allScripts = items.flatMap((category: Category) => category.scripts || []);
        const resolvedScripts = data.slugs
          .map((slug: string) => allScripts.find((script: Script) => script.slug === slug))
          .filter((script): script is Script => script !== undefined);
        
        setSponsoredScripts(resolvedScripts);
      } else {
        console.error('Invalid response format from worker:', data);
      }
    } catch (error) {
      // Silently fail - sponsored tools are optional
      console.log('Sponsored tools unavailable:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount and auto-refresh every minute
  useEffect(() => {
    fetchSponsored();

    const interval = setInterval(() => {
      fetchSponsored();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WORKER_URL, items]);

  const MAX_SPOTS = 5;
  const availableSpots = MAX_SPOTS - sponsoredScripts.length;
  const isFull = sponsoredScripts.length >= MAX_SPOTS;

  if (!items)
    return null;

  return (
    <aside className={className || "hidden lg:block lg:min-w-[260px] lg:max-w-[260px]"}>
      <div className="sticky top-28 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Crown className="h-5 w-5 text-blue-500" />
          <h2 className="text-sm font-bold">Sponsored Tools</h2>
          {sponsoredScripts.length > 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {isFull ? "Full" : `${availableSpots} spot${availableSpots !== 1 ? "s" : ""} available`}
            </span>
          )}
        </div>

        {/* Sponsored Scripts */}
        {sponsoredScripts.length > 0 ? (
          <div className="space-y-2">
            {sponsoredScripts.map(script => (
              <SponsoredCard key={script.slug} script={script} />
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 text-center">
            <Crown className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">5 Spots Available</p>
            <p className="text-xs text-muted-foreground">Be the first to sponsor!</p>
          </div>
        )}

        {/* Advertise Here Card */}
        <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10 hover:border-primary/50 transition-all">
          <div className="text-center space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold">Advertise Here</h3>
            <p className="text-[10px] text-muted-foreground">
              🎯 Reach 10,000+ monthly visitors
            </p>
            <ul className="text-[10px] space-y-1 text-muted-foreground">
              <li className="flex items-center justify-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Highly engaged audience
              </li>
              <li className="flex items-center justify-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Premium visibility
              </li>
            </ul>
            <Button asChild variant="default" size="sm" className="w-full h-8 text-xs">
              <a href="mailto:dailyfoss@gmail.com" className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" />
                Get Started
              </a>
            </Button>
            <p className="text-[9px] text-muted-foreground">From $25/month</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
