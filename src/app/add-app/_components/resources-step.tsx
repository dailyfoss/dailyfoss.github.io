"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Github, Globe, BookOpen, Image, Info, Eye, RefreshCw } from "lucide-react";
import type { StepProps } from "./types";

export function ResourcesStep({ data, onChange }: StepProps) {
  const [logoPreview, setLogoPreview] = useState(data.resources.logo);
  const [logoLightPreview, setLogoLightPreview] = useState(data.resources.logo_light);
  const [logoError, setLogoError] = useState(false);
  const [logoLightError, setLogoLightError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoLightLoading, setLogoLightLoading] = useState(false);

  const loadLogoPreview = () => {
    setLogoError(false);
    setLogoLoading(true);
    setLogoPreview(data.resources.logo);
    // Force reload by adding timestamp
    setTimeout(() => setLogoLoading(false), 500);
  };

  const loadLogoLightPreview = () => {
    setLogoLightError(false);
    setLogoLightLoading(true);
    setLogoLightPreview(data.resources.logo_light);
    // Force reload by adding timestamp
    setTimeout(() => setLogoLightLoading(false), 500);
  };
  return (
    <div className="space-y-6">
      {/* GitHub Repository */}
      <div className="space-y-2">
        <Label htmlFor="source_code" className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          GitHub Repository *
        </Label>
        <Input
          id="source_code"
          type="url"
          placeholder="https://github.com/username/repo"
          value={data.resources.source_code}
          onChange={e => onChange({ resources: { ...data.resources, source_code: e.target.value } })}
          required
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Required for automatic metadata updates (stars, version, commits, etc.)
        </p>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Website
        </Label>
        <Input
          id="website"
          type="url"
          placeholder="https://example.com"
          value={data.resources.website}
          onChange={e => onChange({ resources: { ...data.resources, website: e.target.value } })}
        />
      </div>

      {/* Documentation */}
      <div className="space-y-2">
        <Label htmlFor="documentation" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Documentation
        </Label>
        <Input
          id="documentation"
          type="url"
          placeholder="https://docs.example.com"
          value={data.resources.documentation}
          onChange={e => onChange({ resources: { ...data.resources, documentation: e.target.value } })}
        />
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logo" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logo URL (Dark Mode)
        </Label>
        <div className="flex gap-2">
          <Input
            id="logo"
            type="url"
            placeholder="https://example.com/logo.png or /icons/my-app.webp"
            value={data.resources.logo}
            onChange={e => onChange({ resources: { ...data.resources, logo: e.target.value } })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={loadLogoPreview}
            disabled={!data.resources.logo || logoLoading}
            title="Preview logo"
          >
            {logoLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {logoPreview && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview (Dark Mode):</p>
            <div className="flex items-center justify-center bg-slate-900 rounded p-4 min-h-[120px]">
              {!logoError ? (
                <img
                  key={logoPreview + Date.now()}
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 object-contain"
                  onError={() => setLogoError(true)}
                  onLoad={() => setLogoError(false)}
                />
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Failed to load image</p>
                  <p className="text-xs">Check URL or try again</p>
                </div>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Use a direct URL or path. Click the eye icon to preview. Recommended: 512x512 PNG/WebP with transparent background
        </p>
      </div>

      {/* Logo Light (optional) */}
      <div className="space-y-2">
        <Label htmlFor="logo_light" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Logo URL Light Theme (optional)
        </Label>
        <div className="flex gap-2">
          <Input
            id="logo_light"
            type="url"
            placeholder="https://example.com/logo-light.png or /icons/my-app-light.webp"
            value={data.resources.logo_light}
            onChange={e => onChange({ resources: { ...data.resources, logo_light: e.target.value } })}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={loadLogoLightPreview}
            disabled={!data.resources.logo_light || logoLightLoading}
            title="Preview logo"
          >
            {logoLightLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {logoLightPreview && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview (Light Mode):</p>
            <div className="flex items-center justify-center bg-white rounded p-4 border min-h-[120px]">
              {!logoLightError ? (
                <img
                  key={logoLightPreview + Date.now()}
                  src={logoLightPreview}
                  alt="Logo light preview"
                  className="h-20 w-20 object-contain"
                  onError={() => setLogoLightError(true)}
                  onLoad={() => setLogoLightError(false)}
                />
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Failed to load image</p>
                  <p className="text-xs">Check URL or try again</p>
                </div>
              )}
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Optional: Different logo for light theme. Click the eye icon to preview. If not provided, dark logo will be used.
        </p>
      </div>
    </div>
  );
}
