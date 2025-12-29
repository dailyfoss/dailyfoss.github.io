"use client";

import { ExternalLink } from "lucide-react";
import type { Script } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
type CommunityIntegrationsProps = {
  item: Script;
};

// Real logos for community integrations using external CDN
const ProxmoxIcon = () => (
  <img
    src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/proxmox-helper-scripts.svg"
    alt="Proxmox VE"
    width={24}
    height={24}
    className="h-6 w-6"
  />
);

const YunoHostIcon = () => (
  <>
    <img
      src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/yunohost.svg"
      alt="YunoHost"
      width={24}
      height={24}
      className="h-6 w-6 dark:hidden"
    />
    <img
      src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/yunohost-light.svg"
      alt="YunoHost"
      width={24}
      height={24}
      className="h-6 w-6 hidden dark:block"
    />
  </>
);

const TrueNASIcon = () => (
  <img
    src="https://cdn.jsdelivr.net/gh/selfhst/icons@main/svg/truenas-core.svg"
    alt="TrueNAS"
    width={24}
    height={24}
    className="h-6 w-6"
  />
);

export default function CommunityIntegrations({ item }: CommunityIntegrationsProps) {
  if (!item.community_integrations) {
    return null;
  }

  const integrations: any[] = [];

  // Proxmox VE Integration
  if (item.community_integrations.proxmox_ve?.supported && item.community_integrations.proxmox_ve?.url) {
    integrations.push({
      id: 'proxmox_ve',
      name: 'Proxmox VE Helper Scripts',
      badge: 'App Script · Community',
      description: 'Community scripts compatible with Proxmox VE environments',
      tooltip: 'Community build provided by the Proxmox VE community',
      url: item.community_integrations.proxmox_ve.url,
      icon: <ProxmoxIcon />
    });
  }

  // TrueNAS Integration
  if (item.community_integrations.truenas?.supported && item.community_integrations.truenas?.url) {
    integrations.push({
      id: 'truenas',
      name: 'TrueNAS',
      badge: 'App Catalog · Community',
      description: 'Compatible with TrueNAS environments',
      tooltip: 'Community build provided by the TrueNAS community',
      url: item.community_integrations.truenas.url,
      icon: <TrueNASIcon />
    });
  }

  // YunoHost Integration
  if (item.community_integrations.yunohost?.supported && item.community_integrations.yunohost?.url) {
    integrations.push({
      id: 'yunohost',
      name: 'YunoHost',
      badge: 'App Catalog · Community',
      description: 'Runs on the YunoHost platform',
      tooltip: 'Community build provided by the YunoHost community',
      url: item.community_integrations.yunohost.url,
      icon: <YunoHostIcon />
    });
  }

  // Return null if no integrations
  if (integrations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">
          Community Integrations
        </h3>
        <p className="text-sm text-muted-foreground">
          Community-maintained platform and deployment options
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {integrations.map((integration) => (
          <TooltipProvider key={integration.id}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <a
                  href={integration.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border/80 hover:shadow-sm block"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-md bg-muted/50 p-2 transition-colors group-hover:bg-muted/80">
                      {integration.icon}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-sm leading-tight">
                          {integration.name}
                        </h4>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[10px] text-muted-foreground/70 font-medium">
                        {integration.badge}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                <p>{integration.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
