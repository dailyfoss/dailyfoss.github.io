"use client";

import { Filter, Search, X } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { Category, Script } from "@/lib/types";

import { ScriptItem } from "@/app/scripts/_components/script-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchCategories } from "@/lib/data";
import { usePlausiblePageview } from "@/hooks/use-plausible-pageview";
import { ScrollArea } from "@/components/ui/scroll-area";

import { LatestScripts, PopularScripts, TrendingScripts } from "./scripts/_components/script-info-blocks";
import { UnifiedScriptsSection } from "./scripts/_components/unified-scripts-section";
import { SponsoredSidebar } from "./scripts/_components/sponsored-sidebar";
import Sidebar from "./scripts/_components/sidebar";
import { DynamicMetaTags } from "@/components/dynamic-meta-tags";

export const dynamic = "force-static";

function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col p-4 rounded-xl border bg-card h-full">
      <div className="flex gap-3 mb-3">
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="pt-2 border-t border-border/50">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// Filter Column Component
function FilterColumn({ 
  title, 
  searchPlaceholder,
  items, 
  selectedItems, 
  onToggle,
  searchValue,
  onSearchChange 
}: { 
  title: string;
  searchPlaceholder: string;
  items: { id: string; label: string; count: number }[];
  selectedItems: Set<string>;
  onToggle: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="flex flex-col border rounded-lg bg-card min-w-[180px] flex-1">
      <div className="p-2 border-b bg-muted/30">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
      </div>
      <div className="p-2 border-b">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <ScrollArea className="h-[240px]">
        <div className="p-2 space-y-1">
          {filteredItems.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-sm"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                  className="h-4 w-4"
                />
                <span className="truncate max-w-[120px]">{item.label}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-2">{item.count}</span>
            </label>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No results</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}


function ScriptContent() {
  const searchParams = useSearchParams();
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [links, setLinks] = useState<Category[]>([]);
  const [item, setItem] = useState<Script>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states - new filters
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [selectedDeployments, setSelectedDeployments] = useState<Set<string>>(new Set());
  const [selectedHosting, setSelectedHosting] = useState<Set<string>>(new Set());
  const [selectedUI, setSelectedUI] = useState<Set<string>>(new Set());
  const [selectedCommunity, setSelectedCommunity] = useState<Set<string>>(new Set());
  const [selectedActivity, setSelectedActivity] = useState<Set<string>>(new Set());
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>("latest");
  
  // Search states for each column
  const [platformSearch, setPlatformSearch] = useState("");
  const [deploymentSearch, setDeploymentSearch] = useState("");
  const [hostingSearch, setHostingSearch] = useState("");
  const [uiSearch, setUiSearch] = useState("");
  const [communitySearch, setCommunitySearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");

  usePlausiblePageview();

  useEffect(() => {
    const scriptId = searchParams.get("id");
    const category = searchParams.get("category");
    if (scriptId) setSelectedScript(scriptId);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedScript && links.length > 0) {
      const script = links
        .flatMap(category => category.apps)
        .find(script => script.slug === selectedScript);
      if (script) {
        setItem(script);
      }

      if (script && typeof window !== "undefined" && (window as any).plausible) {
        const utmSource = searchParams.get("utm_source");
        const customUrl = utmSource 
          ? `${window.location.origin}/${selectedScript}?utm_source=${utmSource}`
          : `${window.location.origin}/${selectedScript}`;
        (window as any).plausible("pageview", {
          u: customUrl,
          props: { script_name: script.name, script_slug: selectedScript },
        });
      }
    }
  }, [selectedScript, links, searchParams]);

  useEffect(() => {
    fetchCategories()
      .then((categories) => {
        const filtered = categories.filter(category => category.apps?.length > 0);
        setLinks(filtered);
      })
      .catch(error => console.error(error));
  }, []);

  // Get all unique scripts
  const allScripts = useMemo(() => {
    const scriptsMap = new Map<string, Script>();
    links.forEach(cat => cat.apps.forEach(s => scriptsMap.set(s.slug, s)));
    return Array.from(scriptsMap.values());
  }, [links]);

  // Helper to get activity status
  const getActivityStatus = (script: Script): string => {
    if (!script.metadata?.date_last_commit) return 'unknown';
    const lastCommitDate = new Date(script.metadata.date_last_commit);
    const now = new Date();
    const daysSinceLastCommit = Math.floor((now.getTime() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastCommit <= 30) return 'Active';
    if (daysSinceLastCommit <= 180) return 'Regular';
    if (daysSinceLastCommit <= 365) return 'Occasional';
    return 'Dormant';
  };

  // Build filter options with counts
  const filterOptions = useMemo(() => {
    const platforms: Map<string, number> = new Map();
    const deployments: Map<string, number> = new Map();
    const hosting: Map<string, number> = new Map();
    const ui: Map<string, number> = new Map();
    const community: Map<string, number> = new Map();
    const activity: Map<string, number> = new Map();

    allScripts.forEach(script => {
      // Platforms - use new simplified structure
      const platformsList = script.platforms || [];
      if (platformsList.includes('linux')) platforms.set("Linux", (platforms.get("Linux") || 0) + 1);
      if (platformsList.includes('windows')) platforms.set("Windows", (platforms.get("Windows") || 0) + 1);
      if (platformsList.includes('macos')) platforms.set("macOS", (platforms.get("macOS") || 0) + 1);
      if (platformsList.includes('android')) platforms.set("Android", (platforms.get("Android") || 0) + 1);
      if (platformsList.includes('ios')) platforms.set("iOS", (platforms.get("iOS") || 0) + 1);
      if (platformsList.includes('web')) platforms.set("Web App", (platforms.get("Web App") || 0) + 1);
      if (platformsList.includes('browser_extension')) platforms.set("Browser Extension", (platforms.get("Browser Extension") || 0) + 1);
      
      // Deployments - use new install array
      const installList = script.install || [];
      if (installList.includes('docker')) deployments.set("Docker", (deployments.get("Docker") || 0) + 1);
      if (installList.includes('docker_compose')) deployments.set("Docker Compose", (deployments.get("Docker Compose") || 0) + 1);
      if (installList.includes('kubernetes')) deployments.set("Kubernetes", (deployments.get("Kubernetes") || 0) + 1);
      if (installList.includes('helm')) deployments.set("Helm", (deployments.get("Helm") || 0) + 1);
      if (installList.includes('script')) deployments.set("Script", (deployments.get("Script") || 0) + 1);
      
      // Hosting - use new hosting array
      const hostingList = script.hosting || [];
      if (hostingList.includes('self_hosted')) hosting.set("Self-hosted", (hosting.get("Self-hosted") || 0) + 1);
      if (hostingList.includes('managed_cloud')) hosting.set("Managed Cloud", (hosting.get("Managed Cloud") || 0) + 1);
      if (hostingList.includes('saas')) hosting.set("SaaS", (hosting.get("SaaS") || 0) + 1);
      
      // UI/Interface - use new interface array
      const interfaceList = script.interface || [];
      if (interfaceList.includes('cli')) ui.set("CLI", (ui.get("CLI") || 0) + 1);
      if (interfaceList.includes('gui')) ui.set("GUI", (ui.get("GUI") || 0) + 1);
      if (interfaceList.includes('web_ui')) ui.set("Web UI", (ui.get("Web UI") || 0) + 1);
      if (interfaceList.includes('api')) ui.set("API", (ui.get("API") || 0) + 1);
      if (interfaceList.includes('tui')) ui.set("TUI", (ui.get("TUI") || 0) + 1);
      
      // Community
      if (script.community_integrations?.proxmox_ve?.supported) community.set("Proxmox VE", (community.get("Proxmox VE") || 0) + 1);
      if (script.community_integrations?.yunohost?.supported) community.set("YunoHost", (community.get("YunoHost") || 0) + 1);
      if (script.community_integrations?.truenas?.supported) community.set("TrueNAS", (community.get("TrueNAS") || 0) + 1);
      
      // Activity
      const status = getActivityStatus(script);
      if (status !== 'unknown') {
        activity.set(status, (activity.get(status) || 0) + 1);
      }
    });

    return {
      platforms: Array.from(platforms.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => b.count - a.count),
      deployments: Array.from(deployments.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => b.count - a.count),
      hosting: Array.from(hosting.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => b.count - a.count),
      ui: Array.from(ui.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => b.count - a.count),
      community: Array.from(community.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => b.count - a.count),
      activity: Array.from(activity.entries())
        .map(([name, count]) => ({ id: name, label: name, count }))
        .sort((a, b) => {
          const order = ['Active', 'Regular', 'Occasional', 'Dormant'];
          return order.indexOf(a.id) - order.indexOf(b.id);
        }),
    };
  }, [allScripts]);


  // Filter and sort scripts
  const filteredAndSortedScripts = useMemo(() => {
    let scripts = allScripts.filter(script => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          script.name.toLowerCase().includes(query) ||
          script.description?.toLowerCase().includes(query) ||
          script.tagline?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Platform filter
      if (selectedPlatforms.size > 0) {
        const platformsList = script.platforms || [];
        const hasPlatform = 
          (selectedPlatforms.has("Linux") && platformsList.includes('linux')) ||
          (selectedPlatforms.has("Windows") && platformsList.includes('windows')) ||
          (selectedPlatforms.has("macOS") && platformsList.includes('macos')) ||
          (selectedPlatforms.has("Android") && platformsList.includes('android')) ||
          (selectedPlatforms.has("iOS") && platformsList.includes('ios')) ||
          (selectedPlatforms.has("Web App") && platformsList.includes('web')) ||
          (selectedPlatforms.has("Browser Extension") && platformsList.includes('browser_extension'));
        if (!hasPlatform) return false;
      }

      // Deployment filter
      if (selectedDeployments.size > 0) {
        const installList = script.install || [];
        const hasDeployment = 
          (selectedDeployments.has("Docker") && installList.includes('docker')) ||
          (selectedDeployments.has("Docker Compose") && installList.includes('docker_compose')) ||
          (selectedDeployments.has("Kubernetes") && installList.includes('kubernetes')) ||
          (selectedDeployments.has("Helm") && installList.includes('helm')) ||
          (selectedDeployments.has("Script") && installList.includes('script'));
        if (!hasDeployment) return false;
      }

      // Hosting filter
      if (selectedHosting.size > 0) {
        const hostingList = script.hosting || [];
        const hasHosting = 
          (selectedHosting.has("Self-hosted") && hostingList.includes('self_hosted')) ||
          (selectedHosting.has("Managed Cloud") && hostingList.includes('managed_cloud')) ||
          (selectedHosting.has("SaaS") && hostingList.includes('saas'));
        if (!hasHosting) return false;
      }

      // UI filter
      if (selectedUI.size > 0) {
        const interfaceList = script.interface || [];
        const hasUI = 
          (selectedUI.has("CLI") && interfaceList.includes('cli')) ||
          (selectedUI.has("GUI") && interfaceList.includes('gui')) ||
          (selectedUI.has("Web UI") && interfaceList.includes('web_ui')) ||
          (selectedUI.has("API") && interfaceList.includes('api')) ||
          (selectedUI.has("TUI") && interfaceList.includes('tui'));
        if (!hasUI) return false;
      }

      // Community filter
      if (selectedCommunity.size > 0) {
        const hasCommunity = 
          (selectedCommunity.has("Proxmox VE") && script.community_integrations?.proxmox_ve?.supported) ||
          (selectedCommunity.has("YunoHost") && script.community_integrations?.yunohost?.supported) ||
          (selectedCommunity.has("TrueNAS") && script.community_integrations?.truenas?.supported);
        if (!hasCommunity) return false;
      }

      // Activity filter
      if (selectedActivity.size > 0) {
        const status = getActivityStatus(script);
        if (!selectedActivity.has(status)) return false;
      }

      return true;
    });

    // Sort
    scripts.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          const dateA = a.metadata?.date_app_added ? new Date(a.metadata.date_app_added).getTime() : 0;
          const dateB = b.metadata?.date_app_added ? new Date(b.metadata.date_app_added).getTime() : 0;
          return dateB - dateA;
        case "popular":
          return (b.metadata?.github_stars || 0) - (a.metadata?.github_stars || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "stars":
          return (b.metadata?.github_stars || 0) - (a.metadata?.github_stars || 0);
        case "last-commit":
          const commitA = a.metadata?.date_last_commit ? new Date(a.metadata.date_last_commit).getTime() : 0;
          const commitB = b.metadata?.date_last_commit ? new Date(b.metadata.date_last_commit).getTime() : 0;
          return commitB - commitA;
        case "age":
          const ageA = a.metadata?.date_app_added ? new Date(a.metadata.date_app_added).getTime() : 0;
          const ageB = b.metadata?.date_app_added ? new Date(b.metadata.date_app_added).getTime() : 0;
          return ageA - ageB;
        default:
          return 0;
      }
    });

    return scripts;
  }, [allScripts, searchQuery, selectedPlatforms, selectedDeployments, selectedHosting, selectedUI, selectedCommunity, selectedActivity, sortBy]);

  // Create filtered links for sidebar and content
  const filteredLinks = useMemo(() => {
    const filteredScriptSlugs = new Set(filteredAndSortedScripts.map(s => s.slug));
    return links.map(category => ({
      ...category,
      scripts: category.apps.filter(script => filteredScriptSlugs.has(script.slug)),
    })).filter(category => category.apps.length > 0);
  }, [links, filteredAndSortedScripts]);

  const uniqueScripts = allScripts.length;
  const filteredScriptsCount = filteredAndSortedScripts.length;
  
  const totalActiveFilters = selectedPlatforms.size + selectedDeployments.size + selectedHosting.size + selectedUI.size + selectedCommunity.size + selectedActivity.size;
  const hasActiveFilters = totalActiveFilters > 0 || searchQuery !== "";

  const clearAllFilters = () => {
    setSelectedPlatforms(new Set());
    setSelectedDeployments(new Set());
    setSelectedHosting(new Set());
    setSelectedUI(new Set());
    setSelectedCommunity(new Set());
    setSelectedActivity(new Set());
    setSearchQuery("");
    setPlatformSearch("");
    setDeploymentSearch("");
    setHostingSearch("");
    setUiSearch("");
    setCommunitySearch("");
    setActivitySearch("");
  };

  const togglePlatform = (id: string) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPlatforms(newSet);
  };

  const toggleDeployment = (id: string) => {
    const newSet = new Set(selectedDeployments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDeployments(newSet);
  };

  const toggleHosting = (id: string) => {
    const newSet = new Set(selectedHosting);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedHosting(newSet);
  };

  const toggleUI = (id: string) => {
    const newSet = new Set(selectedUI);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUI(newSet);
  };

  const toggleCommunity = (id: string) => {
    const newSet = new Set(selectedCommunity);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCommunity(newSet);
  };

  const toggleActivity = (id: string) => {
    const newSet = new Set(selectedActivity);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedActivity(newSet);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background pt-20">
      <DynamicMetaTags script={item} />
      
      {/* Search and Filter Bar */}
      {!selectedScript && (
        <div className="sticky top-20 z-20 border-b bg-background">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {/* Main Search Row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-12 h-10 bg-background"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
                  /
                </kbd>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {totalActiveFilters > 0 && (
                    <span className="ml-2 bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                      {totalActiveFilters}
                    </span>
                  )}
                </Button>
                
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Columns */}
            <div 
              className={`grid transition-all duration-300 ease-in-out ${
                showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-4 pb-2">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    <FilterColumn
                      title="Platform"
                      searchPlaceholder="Search platform"
                      items={filterOptions.platforms}
                      selectedItems={selectedPlatforms}
                      onToggle={togglePlatform}
                      searchValue={platformSearch}
                      onSearchChange={setPlatformSearch}
                    />
                    <FilterColumn
                      title="Deployment"
                      searchPlaceholder="Search deployment"
                      items={filterOptions.deployments}
                      selectedItems={selectedDeployments}
                      onToggle={toggleDeployment}
                      searchValue={deploymentSearch}
                      onSearchChange={setDeploymentSearch}
                    />
                    <FilterColumn
                      title="Hosting"
                      searchPlaceholder="Search hosting"
                      items={filterOptions.hosting}
                      selectedItems={selectedHosting}
                      onToggle={toggleHosting}
                      searchValue={hostingSearch}
                      onSearchChange={setHostingSearch}
                    />
                    <FilterColumn
                      title="Interface (UI)"
                      searchPlaceholder="Search interface"
                      items={filterOptions.ui}
                      selectedItems={selectedUI}
                      onToggle={toggleUI}
                      searchValue={uiSearch}
                      onSearchChange={setUiSearch}
                    />
                    <FilterColumn
                      title="Community"
                      searchPlaceholder="Search community"
                      items={filterOptions.community}
                      selectedItems={selectedCommunity}
                      onToggle={toggleCommunity}
                      searchValue={communitySearch}
                      onSearchChange={setCommunitySearch}
                    />
                    <FilterColumn
                      title="Activity"
                      searchPlaceholder="Search activity"
                      items={filterOptions.activity}
                      selectedItems={selectedActivity}
                      onToggle={toggleActivity}
                      searchValue={activitySearch}
                      onSearchChange={setActivitySearch}
                    />
                  </div>
                  
                  {/* Results count and clear */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {filteredScriptsCount === uniqueScripts 
                        ? `${uniqueScripts} tools` 
                        : `${filteredScriptsCount} of ${uniqueScripts} tools`}
                    </span>
                    {hasActiveFilters && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block flex-shrink-0">
            <Sidebar
              items={filteredLinks}
              selectedScript={selectedScript}
              setSelectedScript={setSelectedScript}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {selectedScript && item ? (
              <ScriptItem key={item.slug} item={item} setSelectedScript={setSelectedScript} allCategories={links} />
            ) : (
              <UnifiedScriptsSection items={filteredLinks} />
            )}
          </div>

          {/* Right Sidebar - Sponsored */}
          <div className="hidden xl:block flex-shrink-0">
            <SponsoredSidebar items={links} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-accent/10 to-background pt-20">
          {/* Search Bar Skeleton */}
          <div className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 flex-1 max-w-xl" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-6">
              {/* Left Sidebar Skeleton */}
              <div className="hidden lg:block w-[280px] flex-shrink-0">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1 min-w-0">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <ScriptCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Right Sidebar Skeleton */}
              <div className="hidden xl:block w-[260px] flex-shrink-0">
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ScriptContent />
    </Suspense>
  );
}
