"use client";

import { CheckIcon, ClipboardIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Card } from "./card";
import handleCopy from "../handle-copy";

type CodeCopyButtonProps = {
  children: React.ReactNode;
  label?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
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

  // Split content into lines for line numbering
  const contentString = typeof children === "string"
    ? children
    : Array.isArray(children)
      ? children.join("")
      : String(children ?? "");
  
  const lines = contentString.split('\n');

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

        {/* Area kode/YAML with line numbers */}
        <div className={cn(
          "overflow-x-auto text-sm transition-all",
          isCollapsed && "max-h-32 overflow-hidden"
        )}>
          {!isMobile && children ? (
            <div className="flex">
              {/* Line numbers column - not selectable */}
              <div className="select-none py-4 pl-4 pr-3 text-muted-foreground/50 text-right border-r border-border/30 bg-muted/20 font-mono text-xs leading-relaxed">
                {lines.map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              {/* Code content column - selectable */}
              <div className="flex-1 py-4 pl-4 pr-24 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                {children}
              </div>
            </div>
          ) : (
            <div className="p-4 pr-24">Copy Config File Path</div>
          )}
        </div>

        {/* Gradient overlay when collapsed */}
        {isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary-foreground to-transparent pointer-events-none" />
        )}
      </Card>
    </div>
  );
}
