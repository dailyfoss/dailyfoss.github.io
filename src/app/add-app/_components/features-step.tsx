"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Sparkles, Info } from "lucide-react";
import type { StepProps } from "./types";

export function FeaturesStep({ data, onChange }: StepProps) {
  const [newFeature, setNewFeature] = useState<{ title: string; description: string; icon?: string }>({ 
    title: "", 
    description: "",
    icon: undefined 
  });

  const addFeature = () => {
    if (newFeature.title && newFeature.description) {
      const featureToAdd = {
        title: newFeature.title,
        description: newFeature.description,
        ...(newFeature.icon && { icon: newFeature.icon })
      };
      onChange({
        features: [...data.features, featureToAdd],
      });
      setNewFeature({ title: "", description: "", icon: undefined });
    }
  };

  const removeFeature = (index: number) => {
    onChange({
      features: data.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent/30 border border-accent rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">Icons Auto-Detect!</p>
          <p className="text-muted-foreground">
            No need to specify icons. They'll be automatically detected from feature titles using keywords like "chat", "database", "API", etc.
          </p>
        </div>
      </div>

      {/* Existing Features */}
      {data.features.length > 0 && (
        <div className="space-y-3">
          <Label>Added Features ({data.features.length})</Label>
          {data.features.map((feature, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Feature */}
      <div className="space-y-4 border-t pt-6">
        <Label className="text-base">Add New Feature</Label>
        
        <div className="space-y-2">
          <Label htmlFor="feature-title">Feature Title</Label>
          <Input
            id="feature-title"
            placeholder="e.g., Chat Interface, Database Backup, API Integration"
            value={newFeature.title}
            onChange={e => setNewFeature({ ...newFeature, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-description">Feature Description</Label>
          <Textarea
            id="feature-description"
            placeholder="Describe what this feature does..."
            value={newFeature.description}
            onChange={e => setNewFeature({ ...newFeature, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-icon" className="flex items-center gap-2">
            Icon Name (optional)
            <span className="text-xs text-muted-foreground font-normal">- Override auto-detection</span>
          </Label>
          <Input
            id="feature-icon"
            placeholder="e.g., terminal, database, code, message-square"
            value={newFeature.icon || ""}
            onChange={e => setNewFeature({ ...newFeature, icon: e.target.value || undefined })}
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for auto-detection. See available icons in feature-icon-map.ts
          </p>
        </div>

        <Button
          onClick={addFeature}
          disabled={!newFeature.title || !newFeature.description}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      {data.features.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No features added yet. Add at least 3-5 key features.</p>
        </div>
      )}
    </div>
  );
}
