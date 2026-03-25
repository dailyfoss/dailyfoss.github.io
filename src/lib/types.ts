import type { AlertColors } from "@/config/site-config";

export type App = {
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
    github_contributors: number | null;
    github_commits_this_year: number | null;
    github_issues_open: number | null;
    github_issues_closed_this_year: number | null;
    github_releases_this_year: number | null;
  };
  resources: {
    website: string | null;
    documentation: string | null;
    source_code: string | null;
    logo: string | null;
    logo_light?: string | null;
    screenshot?: string | null;
    screenshots?: string[]; // Multiple screenshots for carousel
    issues: string | null;
    releases: string | null;
  };
  features: Array<string | {
    icon?: string; // Optional - will auto-detect from title if not provided
    title: string;
    description: string;
    core_feature?: boolean; // True for core features, false/undefined for additional
  }>;
  hosting: Array<"self_hosted" | "standalone" | "saas" | "managed_cloud">;
  platforms: Array<"linux" | "macos" | "windows" | "android" | "ios" | "web" | "browser_extension" | "raspberry_pi">;
  interface: Array<"web_ui" | "gui" | "cli" | "api" | "tui">;
  install: Array<"docker" | "docker_compose" | "kubernetes" | "helm" | "binary" | "package_manager" | "script">;
  manifests?: {
    script?: {
      files: Record<string, string>;
    } | string;
    docker?: {
      files: Record<string, string>;
    } | string;
    docker_compose?: {
      files: Record<string, string>;
    } | string;
    helm?: {
      files: Record<string, string>;
    } | string;
    kubernetes?: {
      files: Record<string, string>;
    } | string;
    terraform?: {
      files: Record<string, string>;
    } | string;
    package_manager?: {
      files: Record<string, string>;
    } | string;
    binary?: {
      files: Record<string, string>;
    } | string;
  };
  default_credentials?: {
    username: string | null;
    password: string | null;
  };
  demo: {
    url: null;
    username: null;
    password: null;
  };
  notes: Array<{
    text: string;
    type: keyof typeof AlertColors;
  }>;
  community_integrations?: {
    proxmox_ve?: {
      supported: boolean;
      script_id?: string;
      url?: string;
    };
    yunohost?: {
      supported: boolean;
      repo_name?: string;
      url?: string;
    };
    truenas?: {
      supported: boolean;
      app_name?: string;
      url?: string;
    };
  };
  
  // Legacy fields for backward compatibility (optional)
  install_methods?: any[];
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
  apps: App[];
};

// Backward compatibility alias
export type Script = App;

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
