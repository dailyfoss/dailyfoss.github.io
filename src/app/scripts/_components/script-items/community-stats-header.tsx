"use client";

import { Users, GitCommit, AlertCircle, XCircle, Tag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Script } from "@/lib/types";

interface CommunityStatsHeaderProps {
  item: Script;
}

export default function CommunityStatsHeader({ item }: CommunityStatsHeaderProps) {
  const { metadata } = item;

  // Check if we have any community stats
  const hasStats = 
    metadata?.github_contributors ||
    metadata?.github_commits_this_year ||
    metadata?.github_issues_open !== null ||
    metadata?.github_issues_closed_this_year ||
    metadata?.github_releases_this_year;

  if (!hasStats) {
    return null;
  }

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
      {/* Contributors */}
      {metadata.github_contributors && metadata.github_contributors > 0 && (
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1.5 cursor-help hover:text-foreground transition-colors">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">{formatNumber(metadata.github_contributors)}</span>
                <span className="text-xs">contributors</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{metadata.github_contributors} people have contributed to this project</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Commits This Year */}
      {metadata.github_commits_this_year && metadata.github_commits_this_year > 0 && (
        <>
          <span className="text-muted-foreground/40">•</span>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 cursor-help hover:text-foreground transition-colors">
                  <GitCommit className="h-4 w-4" />
                  <span className="text-xs font-medium">{formatNumber(metadata.github_commits_this_year)}</span>
                  <span className="text-xs">commits this year</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metadata.github_commits_this_year.toLocaleString()} commits made in {new Date().getFullYear()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* Issues (Open & Closed) */}
      {(metadata.github_issues_open !== null || metadata.github_issues_closed_this_year) && (
        <>
          <span className="text-muted-foreground/40">•</span>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-3 cursor-help hover:text-foreground transition-colors">
                  {metadata.github_issues_open !== null && metadata.github_issues_open > 0 && (
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">{metadata.github_issues_open}</span>
                      <span className="text-xs">open</span>
                    </span>
                  )}
                  {metadata.github_issues_closed_this_year && metadata.github_issues_closed_this_year > 0 && (
                    <>
                      {metadata.github_issues_open !== null && metadata.github_issues_open > 0 && (
                        <span className="text-muted-foreground/30">•</span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">{metadata.github_issues_closed_this_year}</span>
                        <span className="text-xs">closed</span>
                      </span>
                    </>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {metadata.github_issues_open || 0} issues currently open
                  {metadata.github_issues_closed_this_year && `, ${metadata.github_issues_closed_this_year} resolved in ${new Date().getFullYear()}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* Releases This Year */}
      {metadata.github_releases_this_year && metadata.github_releases_this_year > 0 && (
        <>
          <span className="text-muted-foreground/40">•</span>
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1.5 cursor-help hover:text-foreground transition-colors">
                  <Tag className="h-4 w-4" />
                  <span className="text-xs font-medium">{metadata.github_releases_this_year}</span>
                  <span className="text-xs">releases</span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metadata.github_releases_this_year} versions released in {new Date().getFullYear()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
