"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenshotCarouselProps {
  screenshots: string[];
  appName: string;
}

export function ScreenshotCarousel({ screenshots, appName }: ScreenshotCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset image loaded state when index changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  // Filter out failed images
  const validScreenshots = screenshots.filter((_, index) => !failedImages.has(index));

  if (validScreenshots.length === 0) {
    return null;
  }

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? validScreenshots.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === validScreenshots.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    } else if (e.key === "Escape") {
      setIsLightboxOpen(false);
    }
  };

  return (
    <>
      {/* Carousel Container */}
      <div className="relative w-full max-w-[860px] mx-auto group">
        {/* Fixed aspect ratio container (16:9) */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden border bg-muted/30 cursor-zoom-in hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            onClick={() => setIsLightboxOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={validScreenshots[currentIndex]}
              alt={`${appName} screenshot ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={() => handleImageError(currentIndex)}
              onLoad={() => setImageLoaded(true)}
            />

            {/* Loading state */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
              </div>
            )}

            {/* Image Counter */}
            {validScreenshots.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium shadow-md">
                {currentIndex + 1} / {validScreenshots.length}
              </div>
            )}
          </div>

          {/* Navigation Arrows - Fixed position relative to aspect ratio container */}
          {validScreenshots.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-md z-10"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full shadow-md z-10"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation - Only show if multiple images */}
        {validScreenshots.length > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {validScreenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex
                      ? "border-primary scale-105"
                      : "border-border/50 hover:border-primary/50 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View screenshot ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshot}
                    alt={`${appName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer backdrop-blur-xl bg-black/80 dark:bg-black/90"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Close hint */}
          <div className="absolute top-4 right-4 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
            Press ESC or click to close
          </div>

          {/* Main Lightbox Image */}
          <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={validScreenshots[currentIndex]}
              alt={`${appName} screenshot ${currentIndex + 1}`}
              className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Lightbox Navigation - Only show if multiple images */}
            {validScreenshots.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full shadow-lg"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full shadow-lg"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Lightbox Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentIndex + 1} / {validScreenshots.length}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
