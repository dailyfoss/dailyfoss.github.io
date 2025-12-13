import type { AlertColors } from "@/config/site-config";

export type Script = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categories: number[];
  metadata: {
    sponsored: boolean;
    license: string | null;
    version: string | null;
    date_app_added: string | null;
    date_last_released: string | null;
    date_last_commit: string | null;
    github_stars: number | null;
  };
  resources: {
    website: string | null;
    documentation: string | null;
    source_code: string | null;
    logo: string | null;
    logo_light?: string | null;
    issues: string | null;
    releases: string | null;
  };
  features: string[];
  platform_support: {
    desktop: {
      linux: boolean;
      windows: boolean;
      macos: boolean;
    };
    mobile: {
      android: boolean;
      ios: boolean;
    };
    web_app: boolean;
    browser_extension: boolean;
    cli_only: boolean;
  };
  hosting_options: {
    self_hosted: boolean;
    managed_cloud: boolean;
    saas: boolean;
  };
  interfaces: {
    cli: boolean;
    gui: boolean;
    web_ui: boolean;
    api: boolean;
    tui: boolean;
  };
  deployment_methods: {
    script: boolean;
    docker: boolean;
    docker_compose: boolean;
    helm: boolean;
    kubernetes: boolean;
    terraform: boolean;
  };
  manifests: {
    script?: string;
    docker_compose?: string;
    helm?: string;
    kubernetes?: string;
    terraform?: string;
  };
  default_credentials: {
    username: string | null;
    password: string | null;
  };
  notes: Array<{
    text: string;
    type: keyof typeof AlertColors;
  }>;
  
  // Legacy fields for backward compatibility (optional)
  install_methods?: any[];
  manifest_path?: any;
  config_path?: string;
  website?: string;
  documentation?: string;
  source_code?: string;
  logo?: string;
  github_stars?: string;
  date_app_added?: string;
  sponsored?: boolean;
  type?: "vm" | "ct" | "pve" | "addon" | "dc" | "helm";
  updateable?: boolean;
  privileged?: boolean;
  interface_port?: number | null;
};

export type Category = {
  name: string;
  id: number;
  sort_order: number;
  description: string;
  icon: string;
  group?: string;
  scripts: Script[];
};

export type Metadata = {
  categories: Category[];
};

export type Version = {
  name: string;
  slug: string;
};

export type OperatingSystem = {
  name: string;
  versions: Version[];
};

export type AppVersion = {
  name: string;
  version: string;
  date: Date;
};

// Enhanced repository information
export type RepositoryStatus = 
  | 'active'        // ≤ 30 days
  | 'regular'       // 31-180 days  
  | 'occasional'    // 181-365 days
  | 'dormant'       // > 365 days
  | 'archived'      // Repository is archived
  | 'unknown';      // No data available

export interface EnhancedRepositoryInfo {
  status: RepositoryStatus;
  lastCommit: Date | null;
  lastRelease: Date | null;
  version: string | null;
  isArchived: boolean;
  statusMessage: string;
  statusIcon: string;
  statusColor: string;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  daysSinceLastCommit: number | null;
  daysSinceLastRelease: number | null;
}
