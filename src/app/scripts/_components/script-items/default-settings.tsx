import { Boxes, Cloud, Monitor, MousePointerClick, Smartphone, Terminal } from "lucide-react";

import type { Script } from "@/lib/types";
import { getHosting, getPlatforms, getInterface, getInstall } from "@/lib/platform-utils";

type PlatformRowProps = {
  label: string;
  items: string[];
  icon: React.ReactNode;
};

function PlatformRow({ label, items, icon }: PlatformRowProps) {
  if (!items.length)
    return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span className="w-16 shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <span
            key={item}
            className="rounded-full border px-2 py-0.5 text-[10px] leading-none font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DefaultSettings({ item }: { item: Script }) {
  // Use utility functions to support both new and legacy structure
  const hosting = getHosting(item);
  const platforms = getPlatforms(item);
  const interfaces = getInterface(item);
  const install = getInstall(item);

  if (!hosting.length && !platforms.length && !interfaces.length && !install.length)
    return null;

  // Extract desktop platforms
  const desktop = platforms.filter(p => ['linux', 'macos', 'windows'].includes(p));
  const desktopLabels: Record<string, string> = {
    linux: 'Linux',
    macos: 'macOS',
    windows: 'Windows'
  };
  const desktopItems = desktop.map(d => desktopLabels[d] || d);

  // Extract mobile platforms
  const mobile = platforms.filter(p => ['android', 'ios'].includes(p));
  const mobileLabels: Record<string, string> = {
    android: 'Android',
    ios: 'iOS'
  };
  const mobileItems = mobile.map(m => mobileLabels[m] || m);

  // Map hosting to labels
  const hostingLabels: Record<string, string> = {
    self_hosted: "Self-hosted",
    saas: "SaaS",
    managed_cloud: "Managed cloud",
    standalone: "Standalone",
  };
  const hostingItems = hosting.map(h => hostingLabels[h] || h);

  // Map install to labels
  const installLabels: Record<string, string> = {
    script: "Script",
    docker: "Docker",
    docker_compose: "Docker Compose",
    helm: "Helm",
    kubernetes: "Kubernetes",
    terraform: "Terraform",
    binary: "Binary",
    package_manager: "Package Manager",
  };
  const deploymentItems = install.map(i => installLabels[i] || i);

  // Map interface to labels
  const interfaceLabels: Record<string, string> = {
    cli: "CLI",
    tui: "TUI",
    gui: "GUI",
    web_ui: "Web UI",
    api: "API"
  };
  const uiItems = interfaces.map(i => interfaceLabels[i] || i);

  const interfaceIcon = <MousePointerClick className="h-3 w-3 shrink-0" />;

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        Platform
      </div>

      <PlatformRow
        label="Desktop"
        items={desktopItems}
        icon={<Monitor className="h-3 w-3 shrink-0" />}
      />

      <PlatformRow
        label="Mobile"
        items={mobileItems}
        icon={<Smartphone className="h-3 w-3 shrink-0" />}
      />

      <PlatformRow
        label="Hosting"
        items={hostingItems}
        icon={<Cloud className="h-3 w-3 shrink-0" />}
      />

      <PlatformRow
        label="Deploy"
        items={deploymentItems}
        icon={<Boxes className="h-3 w-3 shrink-0" />}
      />

      <PlatformRow
        label="Interface"
        items={uiItems}
        icon={interfaceIcon}
      />
    </div>
  );
}
