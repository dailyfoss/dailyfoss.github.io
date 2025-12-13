"use client";

import { BookOpenText, Tag, Code, Globe, Layers, LayoutGrid, Monitor, Stars, X, Activity, CheckCircle, RefreshCcw, Clock3, Moon, Archive, Hexagon } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import type { Script } from "@/lib/types";

import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRepositoryStatus } from "@/hooks/use-repository-status";
import { formatRelativeTime } from "@/lib/repository-status";

import DefaultPassword from "./script-items/default-password";
import InstallCommand from "./script-items/install-command";
import Description from "./script-items/description";
import ConfigFile from "./script-items/config-file";
import InterFaces from "./script-items/interfaces";
import Alerts from "./script-items/alerts";

type ScriptItemProps = {
  item: Script;
  setSelectedScript: (script: string | null) => void;
};

type InstallMethodWithPlatform = any;

function SecondaryMeta({ item }: { item: Script }) {
  const { repositoryInfo, loading } = useRepositoryStatus(item);
  
  // Helper function to ensure URL has proper protocol
  const ensureHttps = (url: string): string => {
    if (!url)
      return url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const parts: { id: string; label: string; href?: string; icon: React.ReactNode; tooltip?: string }[] = [];

  // 🏷️ Last Release
  if (!loading && repositoryInfo?.lastRelease) {
    const releaseTime = formatRelativeTime(repositoryInfo.lastRelease);
    const releaseLabel = releaseTime === 'today' ? releaseTime : releaseTime.replace(' ago', '') + ' ago';
    const releaseDate = repositoryInfo.lastRelease.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    parts.push({
      id: 'last-release',
      label: releaseLabel,
      icon: <Tag className="h-5 w-5 text-foreground/60" />,
      tooltip: `Last release: ${releaseDate}`,
    });
  }

  // 🏷️ Last Commit
  if (!loading && repositoryInfo?.lastCommit) {
    const commitTime = formatRelativeTime(repositoryInfo.lastCommit);
    const commitLabel = commitTime === 'today' ? commitTime : commitTime.replace(' ago', '') + ' ago';
    const commitDate = repositoryInfo.lastCommit.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    parts.push({
      id: 'last-commit',
      label: commitLabel,
      icon: <Hexagon className="h-5 w-5 text-foreground/60" />,
      tooltip: `Last commit: ${commitDate}`,
    });
  }

  // 🌐 Website
  if (item.resources?.website) {
    parts.push({
      id: 'website',
      label: "Website",
      href: item.resources.website,
      icon: <Globe className="h-5 w-5 text-foreground/60" />,
    });
  }

  // 📖 Docs
  if (item.resources?.documentation) {
    parts.push({
      id: 'docs',
      label: "Docs",
      href: item.resources.documentation,
      icon: <BookOpenText className="h-5 w-5 text-foreground/60" />,
    });
  }

  // 💻 Source code
  if (item.resources?.source_code) {
    parts.push({
      id: 'source-code',
      label: "Source code",
      href: item.resources.source_code,
      icon: <Code className="h-5 w-5 text-foreground/60" />,
    });
  }

  // ⭐ Github stars
  if (item.metadata?.github_stars) {
    // Format star count (e.g., 3663 -> "3.7k")
    const formatStars = (stars: number): string => {
      if (stars >= 1000000)
        return `${(stars / 1000000).toFixed(1)}m`;
      if (stars >= 1000)
        return `${(stars / 1000).toFixed(1)}k`;
      return stars.toString();
    };

    parts.push({
      id: 'github-stars',
      label: formatStars(item.metadata.github_stars),
      href: "",
      icon: <Stars className="h-5 w-5 text-foreground/60" />,
    });
  }

  if (!parts.length)
    return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mt-2 mb-2 flex flex-wrap items-center gap-4 text-base font-medium text-foreground/80"
    >
      {parts.map((p, i) => (
        <div
          key={p.id}
          className="flex items-center gap-1.5 group transition-colors"
        >
          {i > 0 && <span className="mx-1 text-muted-foreground/60">•</span>}
          {p.tooltip ? (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1.5 cursor-help">
                    {p.icon}
                    {p.href
                      ? (
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-accent/10 px-2 py-0.5 text-primary transition-all hover:bg-accent/20 hover:text-primary"
                        >
                          {p.label}
                        </a>
                      )
                      : (
                        <span>{p.label}</span>
                      )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-medium">
                  <p>{p.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="flex items-center gap-1.5">
              {p.icon}
              {p.href
                ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md bg-accent/10 px-2 py-0.5 text-primary transition-all hover:bg-accent/20 hover:text-primary"
                  >
                    {p.label}
                  </a>
                )
                : (
                  <span>{p.label}</span>
                )}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}

function PlatformRow({
  label,
  items,
  icon,
  variant = "default",
}: {
  label: string;
  items: string[];
  icon: React.ReactNode;
  variant?: "filled" | "outline" | "minimal" | "default";
}) {
  if (!items.length)
    return null;

  const chipStyles = {
    filled: "bg-primary/10 border-primary/20 text-primary font-semibold",
    outline: "border border-border/60 text-foreground/80",
    minimal: "border border-border/30 text-muted-foreground",
    default: "border border-border/50 text-foreground/70",
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-2 min-w-[110px] pt-0.5">
        <div className="flex items-center justify-center w-5 h-5 text-muted-foreground/70">
          {icon}
        </div>
        <span className="text-[12px] font-semibold text-foreground/80 capitalize">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {items.map(item => (
          <span
            key={item}
            className={`rounded-full px-2.5 py-1 text-[11px] leading-none transition-colors hover:bg-accent/50 ${chipStyles[variant]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlatformSummary({ item }: { item: Script }) {
  const platform = item.platform_support;
  const hosting = item.hosting_options;
  const deployment = item.deployment_methods;
  const ui = item.interfaces;

  if (!platform && !hosting && !deployment && !ui)
    return null;

  // Combine Desktop + Mobile into "Platforms"
  const platforms = [
    platform?.desktop?.macos && "macOS",
    platform?.desktop?.linux && "Linux",
    platform?.desktop?.windows && "Windows",
    platform?.mobile?.android && "Android",
    platform?.mobile?.ios && "iOS",
    platform?.web_app && "Web App",
    platform?.browser_extension && "Browser Extension",
  ].filter(Boolean) as string[];

  // Combine Hosting + Deploy into "Deployment"
  const deploymentItems = [
    hosting?.self_hosted && "Self-hosted",
    hosting?.saas && "SaaS",
    hosting?.managed_cloud && "Managed Cloud",
    deployment?.docker && "Docker",
    deployment?.docker_compose && "Docker Compose",
    deployment?.kubernetes && "Kubernetes",
    deployment?.helm && "Helm",
    deployment?.script && "Script",
    deployment?.terraform && "Terraform",
  ].filter(Boolean) as string[];

  const uiItems = [
    ui?.cli && "CLI",
    ui?.tui && "TUI",
    ui?.gui && "GUI",
    ui?.web_ui && "Web UI",
    ui?.api && "API",
  ].filter(Boolean) as string[];

  if (!platforms.length && !deploymentItems.length && !uiItems.length) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-3 rounded-lg bg-accent/5 p-4 border border-border/50 w-full">
      <div className="text-[13px] font-bold text-foreground/90 mb-1">
        Platform & Deployment
      </div>

      {platforms.length > 0 && (
        <PlatformRow
          label="Platforms"
          items={platforms}
          icon={<Monitor className="h-4 w-4" />}
          variant="filled"
        />
      )}

      {deploymentItems.length > 0 && (
        <PlatformRow
          label="Deployment"
          items={deploymentItems}
          icon={<Code className="h-4 w-4" />}
          variant="outline"
        />
      )}

      {uiItems.length > 0 && (
        <PlatformRow
          label="Interface"
          items={uiItems}
          icon={<Layers className="h-4 w-4" />}
          variant="minimal"
        />
      )}
    </div>
  );
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

function RepositoryActivityIndicator({ item }: { item: Script }) {
  const { repositoryInfo, loading } = useRepositoryStatus(item);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="animate-pulse h-4 w-4 bg-muted rounded-full" />
        <span>Checking repository status...</span>
      </div>
    );
  }

  if (!repositoryInfo || repositoryInfo.status === 'unknown') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
      case 'regular':
        return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800';
      case 'occasional':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800';
      case 'dormant':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
      case 'archived':
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    const iconProps = { className: "h-4 w-4" };
    
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
  };
}



function ScriptHeader({ item }: { item: Script }) {
  const [showFallback, setShowFallback] = useState(!item.resources?.logo || item.resources.logo.trim() === "");
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { repositoryInfo, loading } = useRepositoryStatus(item);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Get the appropriate logo based on theme
  // In dark mode, use light variant if available (for visibility)
  const currentLogo = (theme === 'dark' && item.resources?.logo_light) 
    ? item.resources.logo_light 
    : item.resources?.logo || '';

  // Reset fallback state when item or logo changes
  useEffect(() => {
    setShowFallback(!currentLogo || currentLogo.trim() === "");
  }, [currentLogo, item.slug]);

  return (
    <div className="-m-8 mb-0 p-8 rounded-t-xl bg-gradient-to-br from-card/50 to-accent/10">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex flex-col md:flex-row gap-6 flex-grow">
          <div className="flex-shrink-0 self-start relative h-28 w-28 rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 shadow-lg transition-transform hover:scale-105 overflow-hidden p-3">
            {showFallback ? (
              <div className="flex items-center justify-center bg-accent/20 rounded-md w-full h-full">
                <LayoutGrid className="h-14 w-14 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={currentLogo}
                width={112}
                height={112}
                alt={item.name}
                loading="eager"
                className="w-full h-full object-contain"
                onError={() => setShowFallback(true)}
              />
            )}
          </div>
          <div className="flex flex-col justify-between flex-grow space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-2">
                      {item.name}
                      {/* Status Badge - conditional based on repository status */}
                      {!loading && repositoryInfo && repositoryInfo.status !== 'unknown' && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="inline-flex items-center justify-center cursor-help"
                              >
                                {repositoryInfo.status === 'active' && (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 text-white shadow-sm">
                                    <CheckCircle className="h-4 w-4 stroke-[3]" />
                                  </div>
                                )}
                                {repositoryInfo.status === 'regular' && (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-600 text-white shadow-sm">
                                    <RefreshCcw className="h-4 w-4 stroke-[3]" />
                                  </div>
                                )}
                                {repositoryInfo.status === 'occasional' && (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 dark:bg-orange-600 text-white shadow-sm">
                                    <Clock3 className="h-4 w-4 stroke-[3]" />
                                  </div>
                                )}
                                {repositoryInfo.status === 'dormant' && (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 dark:bg-red-600 text-white shadow-sm">
                                    <Moon className="h-4 w-4 stroke-[3]" />
                                  </div>
                                )}
                                {repositoryInfo.status === 'archived' && (
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500 dark:bg-gray-600 text-white shadow-sm">
                                    <Archive className="h-4 w-4 stroke-[3]" />
                                  </div>
                                )}
                              </motion.span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-medium">
                              <p>{getStatusTooltip(repositoryInfo.status)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </h1>
                    {/* Optional version badge */}
                    {!loading && repositoryInfo?.version && (
                      <span className="text-[1.05rem] font-mono font-semibold text-foreground/90 tracking-tight">
                        {repositoryInfo.version}
                      </span>
                    )}
                  </div>

                  <SecondaryMeta item={item} />
                  <div className="mt-3">
                    <RepositoryActivityIndicator item={item} />
                  </div>
                </div>
              </div>
              
              <PlatformSummary item={item} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 justify-between">
          <InterFaces item={item} />
        </div>
      </div>
    </div>
  );
}

export function ScriptItem({ item, setSelectedScript }: ScriptItemProps) {
  const router = useRouter();

  const closeScript = () => {
    // Clear the selection and remove URL parameters
    setSelectedScript(null);
    router.push("/scripts");
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex w-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-tight text-muted-foreground uppercase">
            Selected Script
          </h2>
          <button
            onClick={closeScript}
            className="rounded-full p-2 text-muted-foreground hover:bg-card/50 transition-all duration-200 hover:rotate-90 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border bg-accent/30 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-8 space-y-8">
            <Suspense fallback={<div className="animate-pulse h-32 bg-accent/20 rounded-xl" />}>
              <ScriptHeader item={item} />
            </Suspense>

            <Separator className="my-8" />

            <Description item={item} />
            <Alerts item={item} />

            <Separator className="my-8" />

            <div className="mt-6 rounded-lg border shadow-md">
              <div className="flex gap-3 px-5 py-3 bg-accent/25">
                <h2 className="text-lg font-semibold">
                  How to Install
                </h2>
              </div>
              <Separator />
              <div className="">
                <InstallCommand item={item} />
              </div>
              {item.config_path && (
                <>
                  <Separator />
                  <div className="flex gap-3 px-5 py-3 bg-accent/25">
                    <h2 className="text-lg font-semibold">Location of config file</h2>
                  </div>
                  <Separator />
                  <div className="">
                    <ConfigFile configPath={item.config_path} />
                  </div>
                </>
              )}
            </div>

            <DefaultPassword item={item} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
