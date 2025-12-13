"use client";

import { 
  Star, 
  ExternalLink, 
  FileText, 
  Globe, 
  Activity, 
  RefreshCcw, 
  Clock3, 
  Moon, 
  Archive,
  GitMerge 
} from "lucide-react";
import Link from "next/link";
import type { Script } from "@/lib/types";
import { useRepositoryStatus } from "@/hooks/use-repository-status";
import { formatVersion, formatRelativeTime, formatDate } from "@/lib/repository-status";
import { extractDate } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EnhancedVersionDisplayProps {
  script: Script;
  showDeploymentMethods?: boolean;
}

// Format star count (e.g., 3663 -> "5.6k")
function formatStarCount(stars?: string | number): string | null {
  if (!stars) return null;

  const num = typeof stars === "string" ? parseInt(stars, 10) : stars;
  if (isNaN(num) || num === 0) return null;

  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}m`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// Get deployment method badges
function getDeploymentMethods(script: Script): string[] {
  const methods: string[] = [];
  
  if (script.deployment_methods) {
    if (script.deployment_methods.docker) methods.push("Docker");
    if (script.deployment_methods.docker_compose) methods.push("Docker Compose");
    if (script.deployment_methods.kubernetes) methods.push("Kubernetes");
    if (script.deployment_methods.helm) methods.push("Helm");
    if (script.deployment_methods.script) methods.push("Script");
    if (script.deployment_methods.terraform) methods.push("Terraform");
  }
  
  return methods;
}

// Get compact status message for badge
function getCompactStatusMessage(status: string, relativeTime: string): string {
  const statusLabels: Record<string, string> = {
    active: 'Active',
    regular: 'Regular',
    occasional: 'Occasional',
    dormant: 'Dormant',
    archived: 'Archived'
  };
  
  const label = statusLabels[status] || 'Unknown';
  
  if (status === 'archived') {
    return `${label} • Not maintained`;
  }
  
  return `${label} • Last commit ${relativeTime}`;
}

// Get status icon component
function getStatusIcon(status: string) {
  const iconProps = { className: "h-3.5 w-3.5" };
  
  switch (status) {
    case 'active':
      return <Activity {...iconProps} />;
    case 'regular':
      return <RefreshCcw {...iconProps} />;
    case 'occasional':
      return <Clock3 {...iconProps} />;
    case 'dormant':
      return <Moon {...iconProps} />;
    case 'archived':
      return <Archive {...iconProps} />;
    default:
      return <Activity {...iconProps} />;
  }
}

// Get status tooltip text
function getStatusTooltip(status: string): string {
  switch (status) {
    case 'active':
      return 'Active: Actively Updated within 30 days';
    case 'regular':
      return 'Regular: Regularly Updated within 6 months';
    case 'occasional':
      return 'Occasional: Occasionally Updated within 1 year';
    case 'dormant':
      return 'Dormant: No Updates in the last 1 year';
    case 'archived':
      return 'Archived: Read Only, no longer maintained';
    default:
      return 'Status Unknown';
  }
}

export function EnhancedVersionDisplay({ script, showDeploymentMethods = true }: EnhancedVersionDisplayProps) {
  const { repositoryInfo, loading } = useRepositoryStatus(script);
  const deploymentMethods = getDeploymentMethods(script);
  const starCount = formatStarCount((script as any).github_stars);

  return (
    <div className="space-y-4">
      {/* Header with logo, name and version */}
      <div className="flex items-center gap-3">
        {(script.resources?.logo) ? (
          <img
            src={script.resources?.logo}
            alt={`${script.name} icon`}
            className="h-12 w-12 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="h-12 w-12 bg-accent/20 rounded-md flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
        
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold">{script.name}</h1>
          {repositoryInfo?.version && (
            <Badge variant="outline" className="text-sm font-mono">
              {formatVersion(repositoryInfo.version)}
            </Badge>
          )}
        </div>
      </div>

      {/* Metadata row - single line with separators and tooltips */}
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-2 text-sm text-foreground/80">
          <span className="flex items-center gap-1">
            📅 Added {script.metadata?.date_app_added ? extractDate(script.metadata.date_app_added) : 'Unknown'}
          </span>
          
          {repositoryInfo?.lastRelease && (
            <>
              <span className="text-muted-foreground">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help">
                    🧾 Released {formatRelativeTime(repositoryInfo.lastRelease)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDate(repositoryInfo.lastRelease)}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          
          {repositoryInfo?.lastCommit && (
            <>
              <span className="text-muted-foreground">•</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help">
                    <GitMerge className="h-3.5 w-3.5" />
                    Last commit {formatRelativeTime(repositoryInfo.lastCommit)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDate(repositoryInfo.lastCommit)}</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>

      {/* Repository Status Badge - Compact with pill design */}
      {repositoryInfo && !loading && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground/70">Repository Status:</span>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <Badge 
                variant={repositoryInfo.statusBadgeVariant} 
                className="rounded-full px-3 py-1 shadow-sm border flex items-center gap-1.5 cursor-help"
              >
                {getStatusIcon(repositoryInfo.status)}
                <span className="text-xs font-medium">
                  {getCompactStatusMessage(
                    repositoryInfo.status, 
                    formatRelativeTime(repositoryInfo.lastCommit)
                  )}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              <p>{getStatusTooltip(repositoryInfo.status)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Links row - Website, Docs, Source, Stars */}
      <div className="flex flex-wrap items-center gap-2">
        {script.website && (
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="hover:bg-accent/50 transition-colors"
          >
            <Link href={script.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-1.5" />
              Website
            </Link>
          </Button>
        )}
        
        {script.documentation && (
          <>
            <span className="text-muted-foreground">•</span>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="hover:bg-accent/50 transition-colors"
            >
              <Link href={script.documentation} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1.5" />
                Docs
              </Link>
            </Button>
          </>
        )}
        
        {script.source_code && (
          <>
            <span className="text-muted-foreground">•</span>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="hover:bg-accent/50 transition-colors"
            >
              <Link href={script.source_code} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Source
              </Link>
            </Button>
          </>
        )}
        
        {starCount && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/30 rounded-md border border-accent/50">
              <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
              <span className="text-sm font-medium">{starCount}</span>
            </div>
          </>
        )}
      </div>

      {/* Deployment Methods */}
      {showDeploymentMethods && deploymentMethods.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold mb-2.5 text-foreground/80">Platform & Deployment</h3>
          <div className="flex flex-wrap gap-2">
            {deploymentMethods.map((method) => (
              <Badge key={method} variant="secondary" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}