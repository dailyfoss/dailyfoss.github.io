import { CheckCircle } from "lucide-react";
import type { Script } from "@/lib/types";
import { iconMap } from "@/config/feature-icon-map";
import { suggestIconFromKeywords } from "@/config/feature-keyword-map";

type Feature = {
  icon?: string; // Optional - will auto-detect from title if not provided
  title: string;
  description: string;
} | string;

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

  // New card-based format
  const features = item.features as Feature[];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Key Features</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          if (typeof feature === 'string') return null;
          
          // Auto-detect icon from title (or use provided icon)
          const smartIcon = suggestIconFromKeywords(feature.title, feature.icon);
          const IconComponent = iconMap[smartIcon] || CheckCircle;
          
          return (
            <div
              key={index}
              className="group relative rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-border/80 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
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
        })}
      </div>
    </div>
  );
}
