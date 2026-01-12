"use client";

import type { Script } from "@/lib/types";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DemoCard({ item }: { item: Script }) {
  const { url, username, password } = item.demo || {};
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasDemo = url || username || password;

  // Don't render if no tagline and no demo
  if (!item.tagline && !hasDemo) {
    return null;
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="rounded-md border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
      {/* At a Glance Header */}
      <h3 className="text-xs font-semibold text-foreground mb-0.5">At a Glance</h3>
      
      {/* Tagline */}
      {item.tagline && (
        <p className="text-sm text-blue-600 dark:text-blue-400 italic mb-3">
          {item.tagline}
        </p>
      )}

      {/* Demo Section */}
      {hasDemo && (
        <div className="space-y-2.5">
          {/* CTA Button */}
          {url && (
            <Button asChild size="sm" className="gap-2 bg-foreground hover:bg-foreground/90 text-background">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Live Demo
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          
          {/* Credentials */}
          {(username || password) && (
            <div className="space-y-1.5">
              {username && (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground w-20">Username:</span>
                  <span className="text-sm font-medium text-foreground">{username}</span>
                  <button
                    onClick={() => copyToClipboard(username, "username")}
                    className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    aria-label="Copy username"
                  >
                    {copiedField === "username" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              )}
              
              {password && (
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground w-20">Password:</span>
                  <span className="text-sm font-medium text-foreground">{password}</span>
                  <button
                    onClick={() => copyToClipboard(password, "password")}
                    className="ml-2 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    aria-label="Copy password"
                  >
                    {copiedField === "password" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
