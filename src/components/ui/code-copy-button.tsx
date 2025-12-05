"use client";

import { CheckIcon, ClipboardIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Card } from "./card";
import handleCopy from "../handle-copy";

type CodeCopyButtonProps = {
  children: React.ReactNode;  // YAML / command
  label?: string;             // teks untuk toast, default "code"
  collapsible?: boolean;      // enable collapse functionality
  defaultCollapsed?: boolean; // start collapsed
};

export default function CodeCopyButton({
  children,
  label = "code",
  collapsible = true,
  defaultCollapsed = false,
}: CodeCopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [ripple, setRipple] = useState(false);

  // deteksi mobile di client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 640);
    }
  }, []);

  // reset icon setelah 2 detik
  useEffect(() => {
    if (!hasCopied) return;
    const timer = setTimeout(() => setHasCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [hasCopied]);

  const onCopyClick = async () => {
    const value =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children.join("")
          : String(children ?? "");

    // Trigger ripple effect
    setRipple(true);
    setTimeout(() => setRipple(false), 600);

    await handleCopy(label, value);
    setHasCopied(true);
  };

  return (
    <div className="mt-4">
      <Card className="relative w-full bg-primary-foreground border-border/50">
        {/* Button container */}
        <div className="absolute right-2 top-2 flex items-center gap-1.5 z-10">
          {/* Collapse button */}
          {collapsible && (
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-1",
                "cursor-pointer rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80 transition-colors"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
              <span className="text-[10px]">{isCollapsed ? "Show" : "Hide"}</span>
            </button>
          )}

          {/* Copy button */}
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-1 relative overflow-hidden",
              "cursor-pointer rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80 transition-all active:scale-95",
              hasCopied && "bg-green-500/20 hover:bg-green-500/30"
            )}
            onClick={onCopyClick}
          >
            {ripple && (
              <span className="absolute inset-0 animate-ping bg-primary/30 rounded-md" />
            )}
            {hasCopied ? (
              <CheckIcon className="h-3 w-3 text-green-600 dark:text-green-400 animate-in zoom-in-50 duration-200" />
            ) : (
              <ClipboardIcon className="h-3 w-3" />
            )}
            <span className="text-[10px]">Copy</span>
          </button>
        </div>

        {/* Area kode/YAML */}
        <div className={cn(
          "overflow-x-auto whitespace-pre-wrap break-all text-sm p-4 pr-24 transition-all",
          isCollapsed && "max-h-32 overflow-hidden"
        )}>
          {!isMobile && children ? children : "Copy Config File Path"}
        </div>

        {/* Gradient overlay when collapsed */}
        {isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-foreground to-transparent pointer-events-none" />
        )}
      </Card>
    </div>
  );
}
