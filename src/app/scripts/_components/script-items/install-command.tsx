import { Info, Terminal, FileText, Package, Download } from "lucide-react";
import { SiDocker, SiHelm, SiKubernetes, SiTerraform } from "react-icons/si";
import { useEffect, useState } from "react";

import type { Script } from "@/lib/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeCopyButton from "@/components/ui/code-copy-button";

// Tab metadata with icons and descriptions
const TAB_CONFIG = {
  script: {
    label: "Script",
    description: "Quick installation script for automated setup",
  },
  docker: {
    label: "Docker",
    description: "Run using Docker container",
  },
  docker_compose: {
    label: "Docker Compose",
    description: "Container-based deployment with docker-compose.yml",
  },
  helm: {
    label: "Helm",
    description: "Deploy to Kubernetes using Helm charts",
  },
  kubernetes: {
    label: "Kubernetes",
    description: "Native Kubernetes manifest files",
  },
  terraform: {
    label: "Terraform",
    description: "Infrastructure as code with Terraform",
  },
  package_manager: {
    label: "Package Manager",
    description: "Install using system package managers (apt, yum, brew, etc.)",
  },
  binary: {
    label: "Binary",
    description: "Download and install pre-compiled binaries",
  },
} as const;

function buildStaticUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

// Helper to get all files from manifest object
function getManifestFiles(manifestObj: any): Record<string, string> {
  if (!manifestObj) return {};
  if (typeof manifestObj === 'string') {
    // Legacy: single file path as string
    return { 'manifest': manifestObj };
  }
  if (manifestObj.files && typeof manifestObj.files === 'object') {
    return manifestObj.files;
  }
  return {};
}

// Component to display a single file
function FileDisplay({ 
  filename, 
  filepath 
}: { 
  filename: string; 
  filepath: string;
}) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = buildStaticUrl(filepath);
    console.log("[Manifest] fetching:", url);

    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res.text();
      })
      .then(text => setContent(text))
      .catch((err) => {
        console.error("Failed to load manifest from", url, err);
        setError("Failed to load file.");
      })
      .finally(() => setLoading(false));
  }, [filepath]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FileText className="h-4 w-4 text-primary" />
        <span>{filename}</span>
      </div>
      
      <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
        <Info className="h-3 w-3 inline mr-1.5" />
        Path: <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{filepath}</code>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading {filename}...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {content && <CodeCopyButton>{content}</CodeCopyButton>}
    </div>
  );
}

export default function InstallCommand({ item }: { item: Script }) {
  const manifest = item.manifests ?? {};

  // Get all files for each manifest type
  const scriptFiles = getManifestFiles(manifest.script);
  const dockerFiles = getManifestFiles(manifest.docker);
  const dockerComposeFiles = getManifestFiles(manifest.docker_compose);
  const k8sFiles = getManifestFiles(manifest.kubernetes);
  const helmFiles = getManifestFiles(manifest.helm);
  const tfFiles = getManifestFiles(manifest.terraform);
  const packageManagerFiles = getManifestFiles(manifest.package_manager);
  const binaryFiles = getManifestFiles(manifest.binary);

  const hasScript = Object.keys(scriptFiles).length > 0;
  const hasDocker = Object.keys(dockerFiles).length > 0;
  const hasDockerCompose = Object.keys(dockerComposeFiles).length > 0;
  const hasKubernetes = Object.keys(k8sFiles).length > 0;
  const hasHelm = Object.keys(helmFiles).length > 0;
  const hasTerraform = Object.keys(tfFiles).length > 0;
  const hasPackageManager = Object.keys(packageManagerFiles).length > 0;
  const hasBinary = Object.keys(binaryFiles).length > 0;

  const defaultTab
    = (hasScript && "script")
      || (hasDocker && "docker")
      || (hasDockerCompose && "docker_compose")
      || (hasPackageManager && "package_manager")
      || (hasBinary && "binary")
      || (hasHelm && "helm")
      || (hasKubernetes && "kubernetes")
      || (hasTerraform && "terraform")
      || "script";

  return (
    <div className="px-4 py-3">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-3">
          {hasScript && (
            <TabsTrigger value="script" className="gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.script.label}</span>
            </TabsTrigger>
          )}
          {hasDocker && (
            <TabsTrigger value="docker" className="gap-1.5">
              <SiDocker className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.docker.label}</span>
            </TabsTrigger>
          )}
          {hasDockerCompose && (
            <TabsTrigger value="docker_compose" className="gap-1.5">
              <SiDocker className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.docker_compose.label}</span>
            </TabsTrigger>
          )}
          {hasPackageManager && (
            <TabsTrigger value="package_manager" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.package_manager.label}</span>
            </TabsTrigger>
          )}
          {hasBinary && (
            <TabsTrigger value="binary" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.binary.label}</span>
            </TabsTrigger>
          )}
          {hasHelm && (
            <TabsTrigger value="helm" className="gap-1.5">
              <SiHelm className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.helm.label}</span>
            </TabsTrigger>
          )}
          {hasKubernetes && (
            <TabsTrigger value="kubernetes" className="gap-1.5">
              <SiKubernetes className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.kubernetes.label}</span>
            </TabsTrigger>
          )}
          {hasTerraform && (
            <TabsTrigger value="terraform" className="gap-1.5">
              <SiTerraform className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.terraform.label}</span>
            </TabsTrigger>
          )}
        </TabsList>

        {hasScript && (
          <TabsContent value="script" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.script.description}
            </p>
            {Object.entries(scriptFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasDocker && (
          <TabsContent value="docker" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.docker.description}
            </p>
            {Object.entries(dockerFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasDockerCompose && (
          <TabsContent value="docker_compose" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.docker_compose.description}
            </p>
            {Object.entries(dockerComposeFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasPackageManager && (
          <TabsContent value="package_manager" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.package_manager.description}
            </p>
            {Object.entries(packageManagerFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasBinary && (
          <TabsContent value="binary" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.binary.description}
            </p>
            {Object.entries(binaryFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasHelm && (
          <TabsContent value="helm" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.helm.description}
            </p>
            {Object.entries(helmFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasKubernetes && (
          <TabsContent value="kubernetes" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.kubernetes.description}
            </p>
            {Object.entries(k8sFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}

        {hasTerraform && (
          <TabsContent value="terraform" className="mt-0 space-y-6 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.terraform.description}
            </p>
            {Object.entries(tfFiles).map(([filename, filepath]) => (
              <FileDisplay key={filename} filename={filename} filepath={filepath} />
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
