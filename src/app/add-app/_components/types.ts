export interface AppFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categories: number[];
  resources: {
    website: string;
    documentation: string;
    source_code: string;
    logo: string;
    logo_light: string;
    screenshot: string;
  };
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
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
    docker_compose: boolean;
    helm: boolean;
    kubernetes: boolean;
    terraform: boolean;
  };
  manifests?: {
    script?: string;
    docker_compose?: string;
    helm?: string;
    kubernetes?: string;
    terraform?: string;
  };
  community_integrations: {
    proxmox_ve: {
      supported: boolean;
      script_id: string;
      url: string;
    };
    yunohost: {
      supported: boolean;
      repo_name: string;
      url: string;
    };
    truenas: {
      supported: boolean;
      url: string;
    };
  };
}

export interface StepProps {
  data: AppFormData;
  onChange: (data: Partial<AppFormData>) => void;
}
