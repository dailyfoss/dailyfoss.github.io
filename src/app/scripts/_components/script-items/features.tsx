"use client";

import { CheckCircle } from "lucide-react";
import type { Script } from "@/lib/types";
import { iconMap } from "@/config/feature-icon-map";
import { suggestIconFromKeywords } from "@/config/feature-keyword-map";

type Feature = {
  icon?: string;
  title: string;
  description: string;
  core_feature?: boolean;
} | string;

function CoreFeatureCard({ feature }: { feature: Feature }) {
  if (typeof feature === 'string') return null;
  
  const smartIcon = suggestIconFromKeywords(feature.title, feature.icon);
  const IconComponent = iconMap[smartIcon] || CheckCircle;
  
  return (
    <div className="group relative rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-md bg-muted/50 p-2 text-foreground transition-colors group-hover:bg-muted/80">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight">
            {feature.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdditionalFeatureCard({ feature }: { feature: Feature }) {
  if (typeof feature === 'string') return null;
  
  const smartIcon = suggestIconFromKeywords(feature.title, feature.icon);
  const IconComponent = iconMap[smartIcon] || CheckCircle;
  
  return (
    <div className="group relative rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border/80 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-md bg-muted/50 p-2 text-muted-foreground transition-colors group-hover:bg-muted/80">
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm leading-tight">
            {feature.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Features({ item }: { item: Script }) {
  if (!item.features || item.features.length === 0) {
    return null;
  }

  // Check if features are in new format (objects) or old format (strings)
  const isNewFormat = typeof item.features[0] === 'object';

  if (!isNewFormat) {
    // Fallback to old list format
    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Key Features</h3>
        <ul className="space-y-2">
          {(item.features as string[]).map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const features = item.features as Feature[];
  const coreFeatures = features.filter(f => typeof f === 'object' && f.core_feature === true);
  const additionalFeatures = features.filter(f => typeof f === 'object' && f.core_feature !== true);

  return (
    <div className="space-y-6">
      {/* Core Features */}
      {coreFeatures.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Core Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreFeatures.map((feature, index) => (
              <CoreFeatureCard key={`core-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      )}

      {/* Additional Features */}
      {additionalFeatures.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-muted-foreground">Additional Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {additionalFeatures.map((feature, index) => (
              <AdditionalFeatureCard key={`additional-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
