"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Globe, Package, Server, Terminal } from "lucide-react";
import type { StepProps } from "./types";

export function PlatformStep({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Platform Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-5 w-5" />
            Platform Support
          </CardTitle>
          <CardDescription>Which platforms does your app support?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Desktop</Label>
            <div className="space-y-2 ml-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linux"
                  checked={data.platform_support.desktop.linux}
                  onCheckedChange={checked =>
                    onChange({
                      platform_support: {
                        ...data.platform_support,
                        desktop: { ...data.platform_support.desktop, linux: checked as boolean },
                      },
                    })}
                />
                <Label htmlFor="linux" className="font-normal cursor-pointer">Linux</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="windows"
                  checked={data.platform_support.desktop.windows}
                  onCheckedChange={checked =>
                    onChange({
                      platform_support: {
                        ...data.platform_support,
                        desktop: { ...data.platform_support.desktop, windows: checked as boolean },
                      },
                    })}
                />
                <Label htmlFor="windows" className="font-normal cursor-pointer">Windows</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="macos"
                  checked={data.platform_support.desktop.macos}
                  onCheckedChange={checked =>
                    onChange({
                      platform_support: {
                        ...data.platform_support,
                        desktop: { ...data.platform_support.desktop, macos: checked as boolean },
                      },
                    })}
                />
                <Label htmlFor="macos" className="font-normal cursor-pointer">macOS</Label>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Mobile</Label>
            <div className="space-y-2 ml-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="android"
                  checked={data.platform_support.mobile.android}
                  onCheckedChange={checked =>
                    onChange({
                      platform_support: {
                        ...data.platform_support,
                        mobile: { ...data.platform_support.mobile, android: checked as boolean },
                      },
                    })}
                />
                <Label htmlFor="android" className="font-normal cursor-pointer">Android</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ios"
                  checked={data.platform_support.mobile.ios}
                  onCheckedChange={checked =>
                    onChange({
                      platform_support: {
                        ...data.platform_support,
                        mobile: { ...data.platform_support.mobile, ios: checked as boolean },
                      },
                    })}
                />
                <Label htmlFor="ios" className="font-normal cursor-pointer">iOS</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="web_app"
                checked={data.platform_support.web_app}
                onCheckedChange={checked =>
                  onChange({
                    platform_support: { ...data.platform_support, web_app: checked as boolean },
                  })}
              />
              <Label htmlFor="web_app" className="font-normal cursor-pointer">Web App</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="browser_extension"
                checked={data.platform_support.browser_extension}
                onCheckedChange={checked =>
                  onChange({
                    platform_support: { ...data.platform_support, browser_extension: checked as boolean },
                  })}
              />
              <Label htmlFor="browser_extension" className="font-normal cursor-pointer">Browser Extension</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cli_only"
                checked={data.platform_support.cli_only}
                onCheckedChange={checked =>
                  onChange({
                    platform_support: { ...data.platform_support, cli_only: checked as boolean },
                  })}
              />
              <Label htmlFor="cli_only" className="font-normal cursor-pointer">CLI Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hosting Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-5 w-5" />
            Hosting Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="self_hosted"
              checked={data.hosting_options.self_hosted}
              onCheckedChange={checked =>
                onChange({
                  hosting_options: { ...data.hosting_options, self_hosted: checked as boolean },
                })}
            />
            <Label htmlFor="self_hosted" className="font-normal cursor-pointer">Self-hosted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="managed_cloud"
              checked={data.hosting_options.managed_cloud}
              onCheckedChange={checked =>
                onChange({
                  hosting_options: { ...data.hosting_options, managed_cloud: checked as boolean },
                })}
            />
            <Label htmlFor="managed_cloud" className="font-normal cursor-pointer">Managed Cloud</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saas"
              checked={data.hosting_options.saas}
              onCheckedChange={checked =>
                onChange({
                  hosting_options: { ...data.hosting_options, saas: checked as boolean },
                })}
            />
            <Label htmlFor="saas" className="font-normal cursor-pointer">SaaS</Label>
          </div>
        </CardContent>
      </Card>

      {/* Interfaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="h-5 w-5" />
            Interfaces
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cli"
              checked={data.interfaces.cli}
              onCheckedChange={checked =>
                onChange({
                  interfaces: { ...data.interfaces, cli: checked as boolean },
                })}
            />
            <Label htmlFor="cli" className="font-normal cursor-pointer">CLI (Command Line)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="gui"
              checked={data.interfaces.gui}
              onCheckedChange={checked =>
                onChange({
                  interfaces: { ...data.interfaces, gui: checked as boolean },
                })}
            />
            <Label htmlFor="gui" className="font-normal cursor-pointer">GUI (Desktop App)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="web_ui"
              checked={data.interfaces.web_ui}
              onCheckedChange={checked =>
                onChange({
                  interfaces: { ...data.interfaces, web_ui: checked as boolean },
                })}
            />
            <Label htmlFor="web_ui" className="font-normal cursor-pointer">Web UI</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="api"
              checked={data.interfaces.api}
              onCheckedChange={checked =>
                onChange({
                  interfaces: { ...data.interfaces, api: checked as boolean },
                })}
            />
            <Label htmlFor="api" className="font-normal cursor-pointer">API</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tui"
              checked={data.interfaces.tui}
              onCheckedChange={checked =>
                onChange({
                  interfaces: { ...data.interfaces, tui: checked as boolean },
                })}
            />
            <Label htmlFor="tui" className="font-normal cursor-pointer">TUI (Terminal UI)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Deployment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="docker"
              checked={data.deployment_methods.docker}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, docker: checked as boolean },
                })}
            />
            <Label htmlFor="docker" className="font-normal cursor-pointer">Docker</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="docker_compose"
              checked={data.deployment_methods.docker_compose}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, docker_compose: checked as boolean },
                })}
            />
            <Label htmlFor="docker_compose" className="font-normal cursor-pointer">Docker Compose</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="kubernetes"
              checked={data.deployment_methods.kubernetes}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, kubernetes: checked as boolean },
                })}
            />
            <Label htmlFor="kubernetes" className="font-normal cursor-pointer">Kubernetes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="helm"
              checked={data.deployment_methods.helm}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, helm: checked as boolean },
                })}
            />
            <Label htmlFor="helm" className="font-normal cursor-pointer">Helm</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terraform"
              checked={data.deployment_methods.terraform}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, terraform: checked as boolean },
                })}
            />
            <Label htmlFor="terraform" className="font-normal cursor-pointer">Terraform</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="script"
              checked={data.deployment_methods.script}
              onCheckedChange={checked =>
                onChange({
                  deployment_methods: { ...data.deployment_methods, script: checked as boolean },
                })}
            />
            <Label htmlFor="script" className="font-normal cursor-pointer">Script</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
