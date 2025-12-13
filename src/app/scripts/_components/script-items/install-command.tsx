import { Box, Boxes, FileText, Grid3x3, Hexagon, Info } from "lucide-react";
import { useEffect, useState } from "react";

import type { Script } from "@/lib/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeCopyButton from "@/components/ui/code-copy-button";

// Tab metadata with icons and descriptions
const TAB_CONFIG = {
  script: {
    icon: FileText,
    label: "Script",
    description: "Quick installation script for automated setup",
  },
  docker_compose: {
    icon: Box,
    label: "Docker Compose",
    description: "Container-based deployment with docker-compose.yml",
  },
  helm: {
    icon: Hexagon,
    label: "Helm",
    description: "Deploy to Kubernetes using Helm charts",
  },
  kubernetes: {
    icon: Grid3x3,
    label: "Kubernetes",
    description: "Native Kubernetes manifest files",
  },
  terraform: {
    icon: Boxes,
    label: "Terraform",
    description: "Infrastructure as code with Terraform",
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

export default function InstallCommand({ item }: { item: Script }) {
  const manifest = item.manifests ?? {};

  const [scriptContent, setScriptContent] = useState<string | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const [dockerComposeContent, setDockerComposeContent] = useState<
    string | null
  >(null);
  const [dockerComposeLoading, setDockerComposeLoading] = useState(false);
  const [dockerComposeError, setDockerComposeError] = useState<string | null>(
    null,
  );

  const [k8sContent, setK8sContent] = useState<string | null>(null);
  const [k8sLoading, setK8sLoading] = useState(false);
  const [k8sError, setK8sError] = useState<string | null>(null);

  const [helmContent, setHelmContent] = useState<string | null>(null);
  const [helmLoading, setHelmLoading] = useState(false);
  const [helmError, setHelmError] = useState<string | null>(null);

  const [tfContent, setTfContent] = useState<string | null>(null);
  const [tfLoading, setTfLoading] = useState(false);
  const [tfError, setTfError] = useState<string | null>(null);

  const hasScript = !!manifest.script;
  const hasDockerCompose = !!manifest.docker_compose;
  const hasKubernetes = !!manifest.kubernetes;
  const hasHelm = !!manifest.helm;
  const hasTerraform = !!manifest.terraform;

  const defaultTab
    = (hasScript && "script")
      || (hasDockerCompose && "docker_compose")
      || (hasHelm && "helm")
      || (hasKubernetes && "kubernetes")
      || (hasTerraform && "terraform")
      || "script";

  function loadTextFile(
    path: string | null | undefined,
    setContent: (v: string | null) => void,
    setLoading: (v: boolean) => void,
    setError: (v: string | null) => void,
  ) {
    if (!path) {
      setContent(null);
      setError(null);
      setLoading(false);
      return;
    }

    const url = buildStaticUrl(path);
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
        setError("Failed to load manifest.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTextFile(
      manifest.script,
      setScriptContent,
      setScriptLoading,
      setScriptError,
    );
  }, [manifest.script]);

  useEffect(() => {
    loadTextFile(
      manifest.docker_compose,
      setDockerComposeContent,
      setDockerComposeLoading,
      setDockerComposeError,
    );
  }, [manifest.docker_compose]);

  useEffect(() => {
    loadTextFile(
      manifest.kubernetes,
      setK8sContent,
      setK8sLoading,
      setK8sError,
    );
  }, [manifest.kubernetes]);

  useEffect(() => {
    loadTextFile(
      manifest.helm,
      setHelmContent,
      setHelmLoading,
      setHelmError,
    );
  }, [manifest.helm]);

  useEffect(() => {
    loadTextFile(
      manifest.terraform,
      setTfContent,
      setTfLoading,
      setTfError,
    );
  }, [manifest.terraform]);

  return (
    <div className="px-4 py-3">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-3">
          {hasScript && (
            <TabsTrigger value="script" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.script.label}</span>
            </TabsTrigger>
          )}
          {hasDockerCompose && (
            <TabsTrigger value="docker_compose" className="gap-1.5">
              <Box className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.docker_compose.label}</span>
            </TabsTrigger>
          )}
          {hasHelm && (
            <TabsTrigger value="helm" className="gap-1.5">
              <Hexagon className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.helm.label}</span>
            </TabsTrigger>
          )}
          {hasKubernetes && (
            <TabsTrigger value="kubernetes" className="gap-1.5">
              <Grid3x3 className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.kubernetes.label}</span>
            </TabsTrigger>
          )}
          {hasTerraform && (
            <TabsTrigger value="terraform" className="gap-1.5">
              <Boxes className="h-3.5 w-3.5" />
              <span>{TAB_CONFIG.terraform.label}</span>
            </TabsTrigger>
          )}
        </TabsList>

        {hasScript && (
          <TabsContent value="script" className="mt-0 space-y-3 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.script.description}
            </p>
            {manifest.script && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
                <Info className="h-3 w-3 inline mr-1.5" />
                Loaded from
                {" "}
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{manifest.script}</code>
              </div>
            )}
            {scriptLoading && (
              <p className="text-sm">Loading script manifest...</p>
            )}
            {scriptError && (
              <p className="text-sm text-red-500">{scriptError}</p>
            )}
            {scriptContent && <CodeCopyButton>{scriptContent}</CodeCopyButton>}
          </TabsContent>
        )}

        {hasDockerCompose && (
          <TabsContent value="docker_compose" className="mt-0 space-y-3 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.docker_compose.description}
            </p>
            {manifest.docker_compose && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
                <Info className="h-3 w-3 inline mr-1.5" />
                Loaded from
                {" "}
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{manifest.docker_compose}</code>
              </div>
            )}
            {dockerComposeLoading && <p className="text-sm">Loading Docker Compose manifest...</p>}
            {dockerComposeError && <p className="text-sm text-red-500">{dockerComposeError}</p>}
            {dockerComposeContent && <CodeCopyButton>{dockerComposeContent}</CodeCopyButton>}
          </TabsContent>
        )}

        {hasHelm && (
          <TabsContent value="helm" className="mt-0 space-y-3 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.helm.description}
            </p>
            {manifest.helm && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
                <Info className="h-3 w-3 inline mr-1.5" />
                Loaded from
                {" "}
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{manifest.helm}</code>
              </div>
            )}
            {helmLoading && <p className="text-sm">Loading Helm manifest...</p>}
            {helmError && <p className="text-sm text-red-500">{helmError}</p>}
            {helmContent && <CodeCopyButton>{helmContent}</CodeCopyButton>}
          </TabsContent>
        )}

        {hasKubernetes && (
          <TabsContent value="kubernetes" className="mt-0 space-y-3 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.kubernetes.description}
            </p>
            {manifest.kubernetes && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
                <Info className="h-3 w-3 inline mr-1.5" />
                Loaded from
                {" "}
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{manifest.kubernetes}</code>
              </div>
            )}
            {k8sLoading && <p className="text-sm">Loading Kubernetes manifest...</p>}
            {k8sError && <p className="text-sm text-red-500">{k8sError}</p>}
            {k8sContent && <CodeCopyButton>{k8sContent}</CodeCopyButton>}
          </TabsContent>
        )}

        {hasTerraform && (
          <TabsContent value="terraform" className="mt-0 space-y-3 min-h-[400px]">
            <p className="text-xs text-muted-foreground italic">
              {TAB_CONFIG.terraform.description}
            </p>
            {manifest.terraform && (
              <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground border border-border/40">
                <Info className="h-3 w-3 inline mr-1.5" />
                Loaded from
                {" "}
                <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{manifest.terraform}</code>
              </div>
            )}
            {tfLoading && <p className="text-sm">Loading Terraform manifest...</p>}
            {tfError && <p className="text-sm text-red-500">{tfError}</p>}
            {tfContent && <CodeCopyButton>{tfContent}</CodeCopyButton>}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
