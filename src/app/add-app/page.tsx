"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Download, Copy, CheckCircle2, Github, Info, Globe, BookOpen, Image, Eye, RefreshCw, Plus, Trash2, Monitor, Server, Terminal, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

import type { AppFormData } from "./_components/types";

const initialFormData: AppFormData = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  categories: [],
  resources: {
    website: "",
    documentation: "",
    source_code: "",
    logo: "",
    logo_light: "",
    screenshot: "",
  },
  features: [],
  platform_support: {
    desktop: { linux: false, windows: false, macos: false },
    mobile: { android: false, ios: false },
    web_app: false,
    browser_extension: false,
    cli_only: false,
  },
  hosting_options: {
    self_hosted: false,
    managed_cloud: false,
    saas: false,
  },
  interfaces: {
    cli: false,
    gui: false,
    web_ui: false,
    api: false,
    tui: false,
  },
  deployment_methods: {
    script: false,
    docker: false,
    docker_compose: false,
    helm: false,
    kubernetes: false,
    terraform: false,
  },
  community_integrations: {
    proxmox_ve: { supported: false, script_id: "", url: "" },
    yunohost: { supported: false, repo_name: "", url: "" },
    truenas: { supported: false, url: "" },
  },
};

export default function AddAppPage() {
  const [formData, setFormData] = useState<AppFormData>(initialFormData);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; group: string }>>([]);
  const [copied, setCopied] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    fetch("/json/metadata.json")
      .then(res => res.json())
      .then(metadata => setCategories(metadata.categories))
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const updateFormData = (data: Partial<AppFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    updateFormData({ name, slug });
  };

  const toggleCategory = (categoryId: number) => {
    const newCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId];
    updateFormData({ categories: newCategories });
  };

  const addFeature = () => {
    updateFormData({ features: [...formData.features, { title: "", description: "" }] });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateFormData({ features: newFeatures });
  };

  const removeFeature = (index: number) => {
    updateFormData({ features: formData.features.filter((_, i) => i !== index) });
  };

  const groupedCategories = categories.reduce((acc, cat) => {
    const group = cat.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<string, typeof categories>);

  const generateJSON = () => {
    const today = new Date().toISOString().split("T")[0];
    
    return {
      name: formData.name,
      slug: formData.slug,
      tagline: formData.tagline || null,
      description: formData.description,
      categories: formData.categories,
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
        website: formData.resources.website || null,
        documentation: formData.resources.documentation || null,
        source_code: formData.resources.source_code,
        logo: formData.resources.logo || null,
        logo_light: formData.resources.logo_light || null,
        screenshot: formData.resources.screenshot || null,
        issues: formData.resources.source_code ? `${formData.resources.source_code}/issues` : null,
        releases: formData.resources.source_code ? `${formData.resources.source_code}/releases` : null,
      },
      features: formData.features.filter(f => f.title && f.description),
      platform_support: formData.platform_support,
      hosting_options: formData.hosting_options,
      interfaces: formData.interfaces,
      deployment_methods: formData.deployment_methods,
      manifests: {},
      default_credentials: { username: null, password: null },
      notes: [],
      repository_status: null,
      community_integrations: {
        proxmox_ve: formData.community_integrations.proxmox_ve.supported ? {
          supported: true,
          script_id: formData.community_integrations.proxmox_ve.script_id || formData.slug,
          url: formData.community_integrations.proxmox_ve.url || `https://community-scripts.github.io/ProxmoxVE/scripts?id=${formData.slug}`,
        } : { supported: false },
        yunohost: formData.community_integrations.yunohost.supported ? {
          supported: true,
          repo_name: formData.community_integrations.yunohost.repo_name || `${formData.name}_ynh`,
          url: formData.community_integrations.yunohost.url || `https://github.com/YunoHost-Apps/${formData.name}_ynh`,
        } : { supported: false },
        truenas: formData.community_integrations.truenas.supported ? {
          supported: true,
          url: formData.community_integrations.truenas.url,
        } : { supported: false },
      },
    };
  };

  const jsonContent = JSON.stringify(generateJSON(), null, 2);
  const isValid = formData.name && formData.slug && formData.description && formData.categories.length > 0 && formData.resources.source_code;

  const downloadJSON = () => {
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.slug}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Apps
          </Link>
          <h1 className="text-3xl font-bold mb-2">Add Your App to DailyFOSS</h1>
          <p className="text-muted-foreground">Fill in the details below to generate a JSON file for your app</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Name, description, and category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">App Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., PostgreSQL"
                      value={formData.name}
                      onChange={e => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="e.g., postgresql"
                      value={formData.slug}
                      onChange={e => updateFormData({ slug: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Filename: {formData.slug || "app"}.json</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    placeholder="Short one-liner description"
                    value={formData.tagline}
                    onChange={e => updateFormData({ tagline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of what your app does..."
                    value={formData.description}
                    onChange={e => updateFormData({ description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categories * (Select at least one)</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-3">
                    {Object.entries(groupedCategories).map(([group, cats]) => (
                      <div key={group}>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1.5">{group}</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cats.map(cat => (
                            <Badge
                              key={cat.id}
                              variant={formData.categories.includes(cat.id) ? "default" : "outline"}
                              className="cursor-pointer text-xs"
                              onClick={() => toggleCategory(cat.id)}
                            >
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Resources & Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="source_code" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Repository *
                  </Label>
                  <Input
                    id="source_code"
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={formData.resources.source_code}
                    onChange={e => updateFormData({ resources: { ...formData.resources, source_code: e.target.value } })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.resources.website}
                      onChange={e => updateFormData({ resources: { ...formData.resources, website: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentation">Documentation</Label>
                    <Input
                      id="documentation"
                      type="url"
                      placeholder="https://docs.example.com"
                      value={formData.resources.documentation}
                      onChange={e => updateFormData({ resources: { ...formData.resources, documentation: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL (Dark Mode)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo"
                        placeholder="/icons/my-app.webp"
                        value={formData.resources.logo}
                        onChange={e => updateFormData({ resources: { ...formData.resources, logo: e.target.value } })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => { setLogoPreview(formData.resources.logo); setLogoError(false); }}
                        disabled={!formData.resources.logo}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo_light">Logo URL (Light Mode)</Label>
                    <Input
                      id="logo_light"
                      placeholder="/icons/my-app-light.webp"
                      value={formData.resources.logo_light}
                      onChange={e => updateFormData({ resources: { ...formData.resources, logo_light: e.target.value } })}
                    />
                  </div>
                </div>

                {logoPreview && (
                  <div className="flex gap-4 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">Dark Mode</p>
                      <div className="bg-slate-900 rounded p-4 flex items-center justify-center h-20">
                        {!logoError ? (
                          <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain" onError={() => setLogoError(true)} />
                        ) : (
                          <span className="text-xs text-muted-foreground">Failed to load</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Screenshot URL</Label>
                  <Input
                    id="screenshot"
                    placeholder="/uploads/my-app.png"
                    value={formData.resources.screenshot}
                    onChange={e => updateFormData({ resources: { ...formData.resources, screenshot: e.target.value } })}
                  />
                </div>
              </CardContent>
            </Card>


            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
                <CardDescription>Key features of your app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/20">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Feature title"
                        value={feature.title}
                        onChange={e => updateFeature(index, "title", e.target.value)}
                      />
                      <Input
                        placeholder="Feature description"
                        value={feature.description}
                        onChange={e => updateFeature(index, "description", e.target.value)}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={addFeature} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>

            {/* Platform & Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Platform & Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Platform Support */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Platform Support</Label>
                    <div className="space-y-2 text-sm">
                      <p className="text-xs text-muted-foreground font-medium">Desktop</p>
                      {["linux", "windows", "macos"].map(platform => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={formData.platform_support.desktop[platform as keyof typeof formData.platform_support.desktop]}
                            onCheckedChange={checked => updateFormData({
                              platform_support: {
                                ...formData.platform_support,
                                desktop: { ...formData.platform_support.desktop, [platform]: checked as boolean },
                              },
                            })}
                          />
                          <Label htmlFor={platform} className="font-normal cursor-pointer capitalize">{platform}</Label>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground font-medium pt-2">Mobile</p>
                      {["android", "ios"].map(platform => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform}
                            checked={formData.platform_support.mobile[platform as keyof typeof formData.platform_support.mobile]}
                            onCheckedChange={checked => updateFormData({
                              platform_support: {
                                ...formData.platform_support,
                                mobile: { ...formData.platform_support.mobile, [platform]: checked as boolean },
                              },
                            })}
                          />
                          <Label htmlFor={platform} className="font-normal cursor-pointer capitalize">{platform}</Label>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground font-medium pt-2">Other</p>
                      {[
                        { id: "web_app", label: "Web App" },
                        { id: "browser_extension", label: "Browser Extension" },
                        { id: "cli_only", label: "CLI Only" },
                      ].map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={formData.platform_support[item.id as keyof typeof formData.platform_support] as boolean}
                            onCheckedChange={checked => updateFormData({
                              platform_support: { ...formData.platform_support, [item.id]: checked as boolean },
                            })}
                          />
                          <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hosting & Interfaces */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Hosting Options</Label>
                    <div className="space-y-2 text-sm">
                      {[
                        { id: "self_hosted", label: "Self-hosted" },
                        { id: "managed_cloud", label: "Managed Cloud" },
                        { id: "saas", label: "SaaS" },
                      ].map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={formData.hosting_options[item.id as keyof typeof formData.hosting_options]}
                            onCheckedChange={checked => updateFormData({
                              hosting_options: { ...formData.hosting_options, [item.id]: checked as boolean },
                            })}
                          />
                          <Label htmlFor={item.id} className="font-normal cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>

                    <Label className="font-semibold pt-3 block">Interfaces</Label>
                    <div className="space-y-2 text-sm">
                      {[
                        { id: "cli", label: "CLI" },
                        { id: "gui", label: "GUI" },
                        { id: "web_ui", label: "Web UI" },
                        { id: "api", label: "API" },
                        { id: "tui", label: "TUI" },
                      ].map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`interface_${item.id}`}
                            checked={formData.interfaces[item.id as keyof typeof formData.interfaces]}
                            onCheckedChange={checked => updateFormData({
                              interfaces: { ...formData.interfaces, [item.id]: checked as boolean },
                            })}
                          />
                          <Label htmlFor={`interface_${item.id}`} className="font-normal cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deployment Methods */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Deployment Methods</Label>
                    <div className="space-y-2 text-sm">
                      {[
                        { id: "docker", label: "Docker" },
                        { id: "docker_compose", label: "Docker Compose" },
                        { id: "kubernetes", label: "Kubernetes" },
                        { id: "helm", label: "Helm" },
                        { id: "terraform", label: "Terraform" },
                        { id: "script", label: "Script" },
                      ].map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`deploy_${item.id}`}
                            checked={formData.deployment_methods[item.id as keyof typeof formData.deployment_methods]}
                            onCheckedChange={checked => updateFormData({
                              deployment_methods: { ...formData.deployment_methods, [item.id]: checked as boolean },
                            })}
                          />
                          <Label htmlFor={`deploy_${item.id}`} className="font-normal cursor-pointer">{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Community Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Integrations
                </CardTitle>
                <CardDescription>Third-party platform support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proxmox VE */}
                <div className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="proxmox"
                      checked={formData.community_integrations.proxmox_ve.supported}
                      onCheckedChange={checked => updateFormData({
                        community_integrations: {
                          ...formData.community_integrations,
                          proxmox_ve: { ...formData.community_integrations.proxmox_ve, supported: checked as boolean },
                        },
                      })}
                    />
                    <Label htmlFor="proxmox" className="font-medium cursor-pointer">Proxmox VE Helper Scripts</Label>
                  </div>
                  {formData.community_integrations.proxmox_ve.supported && (
                    <div className="grid grid-cols-2 gap-3 ml-6">
                      <Input
                        placeholder="Script ID (e.g., app-name)"
                        value={formData.community_integrations.proxmox_ve.script_id}
                        onChange={e => updateFormData({
                          community_integrations: {
                            ...formData.community_integrations,
                            proxmox_ve: { ...formData.community_integrations.proxmox_ve, script_id: e.target.value },
                          },
                        })}
                      />
                      <Input
                        placeholder="URL (optional)"
                        value={formData.community_integrations.proxmox_ve.url}
                        onChange={e => updateFormData({
                          community_integrations: {
                            ...formData.community_integrations,
                            proxmox_ve: { ...formData.community_integrations.proxmox_ve, url: e.target.value },
                          },
                        })}
                      />
                    </div>
                  )}
                </div>

                {/* YunoHost */}
                <div className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="yunohost"
                      checked={formData.community_integrations.yunohost.supported}
                      onCheckedChange={checked => updateFormData({
                        community_integrations: {
                          ...formData.community_integrations,
                          yunohost: { ...formData.community_integrations.yunohost, supported: checked as boolean },
                        },
                      })}
                    />
                    <Label htmlFor="yunohost" className="font-medium cursor-pointer">YunoHost</Label>
                  </div>
                  {formData.community_integrations.yunohost.supported && (
                    <div className="grid grid-cols-2 gap-3 ml-6">
                      <Input
                        placeholder="Repo name (e.g., AppName_ynh)"
                        value={formData.community_integrations.yunohost.repo_name}
                        onChange={e => updateFormData({
                          community_integrations: {
                            ...formData.community_integrations,
                            yunohost: { ...formData.community_integrations.yunohost, repo_name: e.target.value },
                          },
                        })}
                      />
                      <Input
                        placeholder="URL (optional)"
                        value={formData.community_integrations.yunohost.url}
                        onChange={e => updateFormData({
                          community_integrations: {
                            ...formData.community_integrations,
                            yunohost: { ...formData.community_integrations.yunohost, url: e.target.value },
                          },
                        })}
                      />
                    </div>
                  )}
                </div>

                {/* TrueNAS */}
                <div className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="truenas"
                      checked={formData.community_integrations.truenas.supported}
                      onCheckedChange={checked => updateFormData({
                        community_integrations: {
                          ...formData.community_integrations,
                          truenas: { ...formData.community_integrations.truenas, supported: checked as boolean },
                        },
                      })}
                    />
                    <Label htmlFor="truenas" className="font-medium cursor-pointer">TrueNAS</Label>
                  </div>
                  {formData.community_integrations.truenas.supported && (
                    <div className="ml-6">
                      <Input
                        placeholder="TrueNAS app URL"
                        value={formData.community_integrations.truenas.url}
                        onChange={e => updateFormData({
                          community_integrations: {
                            ...formData.community_integrations,
                            truenas: { ...formData.community_integrations.truenas, url: e.target.value },
                          },
                        })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - JSON Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Generated JSON
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!isValid}>
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" onClick={downloadJSON} disabled={!isValid}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isValid && (
                    <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                      Missing: {!formData.name && "name, "}{!formData.slug && "slug, "}{!formData.description && "description, "}{formData.categories.length === 0 && "category, "}{!formData.resources.source_code && "GitHub URL"}
                    </div>
                  )}
                  <pre className="bg-muted p-3 rounded-lg overflow-auto text-[10px] max-h-[60vh] font-mono">
                    <code>{jsonContent}</code>
                  </pre>
                </CardContent>
              </Card>

              {isValid && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1.5">
                    <p>1. Download JSON → <code className="bg-muted px-1 rounded">{formData.slug}.json</code></p>
                    <p>2. Place in <code className="bg-muted px-1 rounded">public/json/</code></p>
                    <p>3. Add logo to <code className="bg-muted px-1 rounded">public/icons/</code></p>
                    <p>4. Run <code className="bg-muted px-1 rounded">npm run validate-apps</code></p>
                    <p>5. Commit and push</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
