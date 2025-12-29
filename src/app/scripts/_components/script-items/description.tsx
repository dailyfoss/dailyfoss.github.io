"use client";

import { useState } from "react";
import type { Script } from "@/lib/types";

import TextCopyBlock from "@/components/text-copy-block";
import Features from "./features";

// Screenshot Preview with Lightbox
function ScreenshotPreview({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full max-w-[860px] rounded-xl overflow-hidden border bg-muted/30 cursor-zoom-in hover:border-primary/50 transition-colors"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-contain"
          />
        </button>
      </div>

      {/* Lightbox - Click anywhere to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </>
  );
}

export default function Description({ item }: { item: Script }) {
  // Extract first sentence as summary if features exist
  const summary = item.features
    ? `${item.description.split(/[.!?]/)[0]}.`
    : item.description;

  return (
    <div className="p-2 space-y-5">
      {/* Tagline with blue tint highlight */}
      {item.tagline && (
        <div className="rounded-lg bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40 p-4 border border-blue-200/60 dark:border-blue-800/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">At a Glance</h3>
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

      {/* Screenshot - above features */}
      {item.resources?.screenshot && (
        <ScreenshotPreview 
          src={item.resources.screenshot} 
          alt={`${item.name} screenshot`} 
        />
      )}

      {/* Key Features - New card-based component */}
      <Features item={item} />
    </div>
  );
}
