"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, CheckCircle2, Github, AlertCircle, CheckCircle, Edit3 } from "lucide-react";
import { useState } from "react";
import { iconMap } from "@/config/feature-icon-map";
import { suggestIconFromKeywords } from "@/config/feature-keyword-map";
import type { AppFormData } from "./types";

interface ReviewStepProps {
  data: AppFormData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const [copied, setCopied] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [editedJson, setEditedJson] = useState("");

  const generateJSON = () => {
    const today = new Date().toISOString().split("T")[0];
    
    return {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline || null,
      description: data.description,
      categories: data.categories,
      metadata: {
        sponsored: false,
        license: null,
        version: null,
        date_app_added: today,
        date_last_released: null,
        date_last_commit: null,
        github_stars: null,
        github_contributors: null,
        github_commits_this_year: null,
        github_issues_open: null,
        github_issues_closed_this_year: null,
        github_releases_this_year: null,
      },
      resources: {
        website: data.resources.website || null,
        documentation: data.resources.documentation || null,
        source_code: data.resources.source_code,
        logo: data.resources.logo || null,
        logo_light: data.resources.logo_light || null,
        issues: data.resources.source_code ? `${data.resources.source_code}/issues` : null,
        releases: data.resources.source_code ? `${data.resources.source_code}/releases` : null,
      },
      features: data.features,
      platform_support: data.platform_support,
      hosting_options: data.hosting_options,
      interfaces: data.interfaces,
      deployment_methods: data.deployment_methods,
      manifests: {},
      default_credentials: {
        username: null,
        password: null,
      },
      notes: [],
    };
  };

  const jsonContent = JSON.stringify(generateJSON(), null, 2);

  const getActiveJson = () => {
    return showJsonEditor && editedJson ? editedJson : jsonContent;
  };

  const downloadJSON = () => {
    const content = getActiveJson();
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const content = getActiveJson();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isValid = data.name && data.slug && data.description && data.categories.length > 0 && data.resources.source_code;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">App Summary</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Name:</span>
            <p className="font-medium">{data.name || "Not set"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Slug:</span>
            <p className="font-mono text-sm">{data.slug || "Not set"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Description:</span>
            <p className="text-sm">{data.description || "Not set"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Categories:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.categories.length > 0
                ? data.categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)
                : <span className="text-sm text-muted-foreground">None selected</span>}
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Features ({data.features.length}):</span>
            {data.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {data.features.map((feature, index) => {
                  const smartIcon = suggestIconFromKeywords(feature.title, feature.icon);
                  const IconComponent = iconMap[smartIcon] || CheckCircle;
                  
                  return (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border bg-muted/30">
                      <div className="flex-shrink-0 rounded bg-primary/10 p-1.5 text-primary">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm">{feature.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                        {feature.icon && (
                          <p className="text-xs text-muted-foreground/70 mt-1">Icon: {feature.icon}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No features added</p>
            )}
          </div>
          <div>
            <span className="text-sm text-muted-foreground">GitHub:</span>
            <p className="text-sm font-mono break-all">{data.resources.source_code || "Not set"}</p>
          </div>
        </div>
      </Card>

      {/* Validation */}
      {!isValid && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive mb-1">Missing Required Fields</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {!data.name && <li>• App name is required</li>}
                {!data.slug && <li>• Slug is required</li>}
                {!data.description && <li>• Description is required</li>}
                {data.categories.length === 0 && <li>• At least one category is required</li>}
                {!data.resources.source_code && <li>• GitHub repository URL is required</li>}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* JSON Preview/Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generated JSON</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowJsonEditor(!showJsonEditor);
                if (!showJsonEditor) {
                  setEditedJson(jsonContent);
                }
              }}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {showJsonEditor ? "Preview" : "Edit"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!isValid}
            >
              {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              size="sm"
              onClick={downloadJSON}
              disabled={!isValid}
            >
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </div>
        
        {showJsonEditor ? (
          <div className="space-y-2">
            <Textarea
              value={editedJson}
              onChange={(e) => setEditedJson(e.target.value)}
              className="font-mono text-xs min-h-96 max-h-[600px]"
              placeholder="Edit JSON here..."
            />
            <p className="text-xs text-muted-foreground">
              ⚠️ Manual edits will be used for download. Make sure JSON is valid!
            </p>
          </div>
        ) : (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto">
            <code>{jsonContent}</code>
          </pre>
        )}
      </div>

      {/* Next Steps */}
      {isValid && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Github className="h-5 w-5" />
            Next Steps
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <span>Download the JSON file and save it as <code className="bg-muted px-1 py-0.5 rounded">{data.slug}.json</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <span>Place it in the <code className="bg-muted px-1 py-0.5 rounded">public/json/</code> folder</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <span>Add your app logo (512x512 PNG/WebP) to <code className="bg-muted px-1 py-0.5 rounded">public/icons/</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <span>Run validation: <code className="bg-muted px-1 py-0.5 rounded">npm run validate-apps</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">5.</span>
              <span>Update metadata: <code className="bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN=xxx node tools/update-repo-metadata.js {data.slug}</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">6.</span>
              <span>Test locally: <code className="bg-muted px-1 py-0.5 rounded">npm run dev</code></span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">7.</span>
              <span>Commit and push to GitHub</span>
            </li>
          </ol>
        </Card>
      )}
    </div>
  );
}
