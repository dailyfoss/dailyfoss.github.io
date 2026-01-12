"use client";

import type { Script } from "@/lib/types";

import TextCopyBlock from "@/components/text-copy-block";
import Features from "./features";
import { ScreenshotCarousel } from "./screenshot-carousel";
import DemoCard from "./demo-card";

export default function Description({ item }: { item: Script }) {
  // Extract first sentence as summary if features exist
  const summary = item.features && item.description
    ? `${item.description.split(/[.!?]/)[0]}.`
    : item.description || "";

  // Determine which screenshots to show
  // Priority: screenshots array > single screenshot
  const screenshots = item.resources?.screenshots && item.resources.screenshots.length > 0
    ? item.resources.screenshots
    : item.resources?.screenshot
    ? [item.resources.screenshot]
    : [];

  return (
    <div className="p-2 space-y-5">
      {/* Screenshot Carousel - supports both single and multiple images */}
      {screenshots.length > 0 && (
        <ScreenshotCarousel 
          screenshots={screenshots}
          appName={item.name}
        />
      )}

      {/* Demo Card with Tagline */}
      <DemoCard item={item} />

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
