"use client";

import { ExternalLink, Server, Package } from "lucide-react";
import type { Script } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type CommunityIntegrationsProps = {
  item: Script;
};

export default function CommunityIntegrations({ item }: CommunityIntegrationsProps) {
  if (!item.community_integrations) {
    return null;
  }

  const integrations: any[] = [];

  // Proxmox VE Integration
  if (item.community_integrations.proxmox_ve?.supported && item.community_integrations.proxmox_ve?.url) {
    integrations.push({
      id: 'proxmox_ve',
      name: 'Proxmox VE',
      description: 'Community Scripts',
      tooltip: 'This project is maintained by the Proxmox VE community',
      url: item.community_integrations.proxmox_ve.url,
      icon: <Server className="h-4 w-4" />
    });
  }

  // YunoHost Integration
  if (item.community_integrations.yunohost?.supported && item.community_integrations.yunohost?.url) {
    integrations.push({
      id: 'yunohost',
      name: 'YunoHost',
      description: 'App Package',
      tooltip: 'This project is maintained by the YunoHost community',
      url: item.community_integrations.yunohost.url,
      icon: <Package className="h-4 w-4" />
    });
  }

  // Return null if no integrations
  if (integrations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-3 rounded-lg bg-accent/5 p-4 border border-border/50 w-full">
      <div className="text-[13px] font-bold text-foreground/90 mb-1">
        Community Integrations
      </div>
      
      {integrations.map((integration) => (
        <div key={integration.id} className="flex items-start gap-3">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 min-w-[110px] pt-0.5 cursor-help">
                  <div className="flex items-center justify-center w-5 h-5 text-muted-foreground/70">
                    {integration.icon}
                  </div>
                  <span className="text-[12px] font-semibold text-foreground/80 capitalize">
                    {integration.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                <p>{integration.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex flex-wrap gap-1.5 flex-1 items-center">
            <a
              href={integration.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] leading-none text-foreground/80 transition-colors hover:bg-accent/50"
            >
              <span>{integration.description}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
