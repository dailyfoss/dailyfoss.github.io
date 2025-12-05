"use client";

import { BookOpenText, CalendarDays, CloudUpload, Code, Globe, Layers, LayoutGrid, Monitor, Stars, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import type { AppVersion, Script } from "@/lib/types";

import { cleanSlug } from "@/lib/utils/resource-utils";
import { Separator } from "@/components/ui/separator";
import { useVersions } from "@/hooks/use-versions";
import { extractDate } from "@/lib/time";

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

type InstallMethodWithPlatform = Script["install_methods"][0];

function SecondaryMeta({ item }: { item: Script }) {
  // Helper function to ensure URL has proper protocol
  const ensureHttps = (url: string): string => {
    if (!url)
      return url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `https://${url}`;
  };

  const parts: { label: string; href?: string; icon: React.ReactNode }[] = [];

  // 🗓 Added
  if (item.date_created) {
    parts.push({
      label: `Added ${extractDate(item.date_created)}`,
      icon: <CalendarDays className="h-5 w-5 text-foreground/60" />,
    });
  }

  // 🌐 Website
  if (item.website) {
    parts.push({
      label: "Website",
      href: ensureHttps(item.website),
      icon: <Globe className="h-5 w-5 text-foreground/60" />,
    });
  }

  // 📖 Docs
  if (item.documentation) {
    parts.push({
      label: "Docs",
      href: ensureHttps(item.documentation),
      icon: <BookOpenText className="h-5 w-5 text-foreground/60" />,
    });
  }

  // 💻 Source code
  const sourceCode = (item as any).source_code;
  if (sourceCode) {
    parts.push({
      label: "Source code",
      href: ensureHttps(sourceCode),
      icon: <Code className="h-5 w-5 text-foreground/60" />,
    });
  }

  // ⭐ Github stars
  const githubStars = (item as any).github_stars;
  if (githubStars) {
    // Format star count (e.g., 3663 -> "3.7k")
    const formatStars = (stars: string | number): string => {
      const num = typeof stars === "string" ? Number.parseInt(stars, 10) : stars;
      if (isNaN(num))
        return stars.toString();
      if (num >= 1000000)
        return `${(num / 1000000).toFixed(1)}m`;
      if (num >= 1000)
        return `${(num / 1000).toFixed(1)}k`;
      return num.toString();
    };

    parts.push({
      label: formatStars(githubStars),
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
          key={p.label}
          className="flex items-center gap-1.5 group transition-colors"
        >
          {i > 0 && <span className="mx-1 text-muted-foreground/60">•</span>}
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

function PlatformSummary({ method }: { method?: InstallMethodWithPlatform }) {
  if (!method)
    return null;

  const platform = method.platform;
  const hosting = method.hosting;
  const deployment = method.deployment;
  const ui = method.ui;

  // Combine Desktop + Mobile into "Platforms"
  const platforms = [
    platform?.desktop?.macos && "macOS",
    platform?.desktop?.linux && "Linux",
    platform?.desktop?.windows && "Windows",
    platform?.mobile?.android && "Android",
    platform?.mobile?.ios && "iOS",
    platform?.web_app && "Web App",
    platform?.browser_extension && "Browser Extension",
    platform?.cli_only && "CLI Only",
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
    <div className="mt-4 flex flex-col space-y-3 rounded-lg bg-accent/5 p-4 border border-border/30">
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
          icon={<CloudUpload className="h-4 w-4" />}
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

function ScriptHeader({ item }: { item: Script }) {
  const [showFallback, setShowFallback] = useState(!item.logo || item.logo.trim() === "");
  const defaultInstallMethod = item.install_methods?.[0] as InstallMethodWithPlatform | undefined;

  // Reset fallback state when item changes
  useEffect(() => {
    setShowFallback(!item.logo || item.logo.trim() === "");
  }, [item.logo, item.slug]);

  return (
    <div className="-m-8 mb-0 p-8 rounded-t-xl bg-gradient-to-br from-card/50 to-accent/10 border-b">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex flex-col md:flex-row gap-6 flex-grow">
          <div className="flex-shrink-0 self-start relative h-28 w-28 rounded-xl bg-gradient-to-br from-accent/40 to-accent/60 shadow-lg transition-transform hover:scale-105 overflow-hidden p-3">
            {showFallback ? (
              <div className="flex items-center justify-center bg-accent/20 rounded-md w-full h-full">
                <LayoutGrid className="h-14 w-14 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={item.logo!}
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
                  <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                    {item.name}
                    <VersionInfo item={item} />
                    {/* <span className="inline-flex items-center rounded-md bg-accent/30 px-2 py-1 text-sm">
                    {getDisplayValueFromType(item.type)}
                  </span> */}
                  </h1>

                  <SecondaryMeta item={item} />
                  <Separator className="my-4" />
                </div>
              </div>

              <PlatformSummary method={defaultInstallMethod} />
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

function VersionInfo({ item }: { item: Script }) {
  const { data: versions = [], isLoading } = useVersions();

  if (isLoading || versions.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading versions...</p>;
  }

  const matchedVersion = versions.find((v: AppVersion) => {
    const cleanName = v.name.replace(/[^a-z0-9]/gi, "").toLowerCase();
    return cleanName === cleanSlug(item.slug) || cleanName.includes(cleanSlug(item.slug));
  });

  if (!matchedVersion)
    return null;

  return <span className="font-medium text-sm">{matchedVersion.version}</span>;
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

            <Separator />

            <Description item={item} />
            <Alerts item={item} />

            <Separator />

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
