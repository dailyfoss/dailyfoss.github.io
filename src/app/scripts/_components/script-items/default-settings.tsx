import { Boxes, Cloud, Monitor, MousePointerClick, Smartphone, Terminal } from "lucide-react";

import type { Script } from "@/lib/types";

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
  const platform = item.platform_support;
  const hosting = item.hosting_options;
  const deployment = item.deployment_methods;
  const ui = item.interfaces;

  if (!platform && !hosting && !deployment && !ui)
    return null;

  const desktop = [
    platform?.desktop?.macos && "macOS",
    platform?.desktop?.linux && "Linux",
    platform?.desktop?.windows && "Windows",
  ].filter(Boolean) as string[];

  const mobile = [
    platform?.mobile?.android && "Android",
    platform?.mobile?.ios && "iOS",
  ].filter(Boolean) as string[];

  const hostingItems = [
    hosting?.self_hosted && "Self-hosted",
    hosting?.saas && "SaaS",
    hosting?.managed_cloud && "Managed cloud",
  ].filter(Boolean) as string[];

  const deploymentItems = [
    deployment?.script && "Script",
    deployment?.docker && "Docker",
    deployment?.docker_compose && "Docker Compose",
    deployment?.helm && "Helm",
    deployment?.kubernetes && "Kubernetes",
    deployment?.terraform && "Terraform",
  ].filter(Boolean) as string[];

  const uiItems = [
    ui?.cli && "CLI",
    ui?.tui && "TUI",
    ui?.gui && "GUI",
    ui?.web_ui && "Web UI",
    ui?.api && "API",
  ].filter(Boolean) as string[];

  const interfaceIcon = <MousePointerClick className="h-3 w-3 shrink-0" />;

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        Platform
      </div>

      <PlatformRow
        label="Desktop"
        items={desktop}
        icon={<Monitor className="h-3 w-3 shrink-0" />}
      />

      <PlatformRow
        label="Mobile"
        items={mobile}
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
