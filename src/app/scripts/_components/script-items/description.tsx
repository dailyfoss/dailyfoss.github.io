import { Sparkles } from "lucide-react";

import type { Script } from "@/lib/types";

import TextCopyBlock from "@/components/text-copy-block";
import Features from "./features";

export default function Description({ item }: { item: Script }) {
  // Extract first sentence as summary if features exist
  const summary = item.features
    ? `${item.description.split(/[.!?]/)[0]}.`
    : item.description;

  return (
    <div className="p-2 space-y-5">
      {/* Why Use It? - Tagline with blue tint highlight */}
      {item.tagline && (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40 p-4 border border-blue-200/60 dark:border-blue-800/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Why Use It?</h3>
          </div>
          <p className="text-sm text-blue-800/90 dark:text-blue-200/90 leading-relaxed italic">
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

      {/* Key Features - New card-based component */}
      <Features item={item} />
    </div>
  );
}
