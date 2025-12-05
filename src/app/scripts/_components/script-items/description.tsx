import { CheckCircle2, Sparkles } from "lucide-react";

import type { Script } from "@/lib/types";

import TextCopyBlock from "@/components/text-copy-block";

export default function Description({ item }: { item: Script }) {
  // Extract first sentence as summary if features exist
  const summary = item.features
    ? `${item.description.split(/[.!?]/)[0]}.`
    : item.description;

  return (
    <div className="p-2 space-y-5">
      {/* Why Use It? - Tagline */}
      {item.tagline && (
        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/10 p-4 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Why Use It?</h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed italic">
            {item.tagline}
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {TextCopyBlock(summary)}
        </p>
      </div>

      {/* Key Features */}
      {item.features && item.features.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Key Features</h3>
          <ul className="space-y-2">
            {item.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
