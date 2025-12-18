"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { StepProps } from "./types";

export function BasicInfoStep({ data, onChange }: StepProps) {
  const [categories, setCategories] = useState<Array<{ id: number; name: string; group: string }>>([]);

  useEffect(() => {
    // Fetch categories from metadata
    fetch("/json/metadata.json")
      .then(res => res.json())
      .then(metadata => {
        setCategories(metadata.categories);
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const handleNameChange = (name: string) => {
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    onChange({ name, slug });
  };

  const toggleCategory = (categoryId: number) => {
    const newCategories = data.categories.includes(categoryId)
      ? data.categories.filter(id => id !== categoryId)
      : [...data.categories, categoryId];
    onChange({ categories: newCategories });
  };

  // Group categories
  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  return (
    <div className="space-y-6">
      {/* App Name */}
      <div className="space-y-2">
        <Label htmlFor="name">App Name *</Label>
        <Input
          id="name"
          placeholder="e.g., PostgreSQL"
          value={data.name}
          onChange={e => handleNameChange(e.target.value)}
          required
        />
      </div>

      {/* Slug (auto-generated) */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL-safe identifier) *</Label>
        <Input
          id="slug"
          placeholder="e.g., postgresql"
          value={data.slug}
          onChange={e => onChange({ slug: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Auto-generated from name. This will be the filename (slug.json)
        </p>
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline (optional)</Label>
        <Input
          id="tagline"
          placeholder="Short one-liner description"
          value={data.tagline}
          onChange={e => onChange({ tagline: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of what your app does..."
          value={data.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={4}
          required
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categories * (Select at least one)</Label>
        <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
          {Object.entries(groupedCategories).map(([group, cats]) => (
            <div key={group}>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">{group}</h4>
              <div className="flex flex-wrap gap-2">
                {cats.map(cat => (
                  <Badge
                    key={cat.id}
                    variant={data.categories.includes(cat.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      data.categories.includes(cat.id)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected: {data.categories.length} categor{data.categories.length === 1 ? "y" : "ies"}
        </p>
      </div>
    </div>
  );
}
