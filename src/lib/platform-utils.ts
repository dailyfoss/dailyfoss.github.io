import type { Script } from './types';

/**
 * Utility functions for working with platform/hosting data
 */

// Helper to get hosting methods
export function getHosting(script: Script): string[] {
  return script.hosting || [];
}

// Helper to get platforms
export function getPlatforms(script: Script): string[] {
  return script.platforms || [];
}

// Helper to get interface types
export function getInterface(script: Script): string[] {
  return script.interface || [];
}

// Helper to get installation methods
export function getInstall(script: Script): string[] {
  return script.install || [];
}

// Helper to check if self-hosted
export function isSelfHosted(script: Script): boolean {
  return getHosting(script).includes('self_hosted');
}

// Helper to check specific platform support
export function supportsLinux(script: Script): boolean {
  return getPlatforms(script).includes('linux');
}

export function supportsMacOS(script: Script): boolean {
  return getPlatforms(script).includes('macos');
}

export function supportsWindows(script: Script): boolean {
  return getPlatforms(script).includes('windows');
}

export function supportsAndroid(script: Script): boolean {
  return getPlatforms(script).includes('android');
}

export function supportsIOS(script: Script): boolean {
  return getPlatforms(script).includes('ios');
}

export function supportsWeb(script: Script): boolean {
  return getPlatforms(script).includes('web');
}

export function supportsBrowserExtension(script: Script): boolean {
  return getPlatforms(script).includes('browser_extension');
}

export function supportsRaspberryPi(script: Script): boolean {
  return getPlatforms(script).includes('raspberry_pi');
}

// Helper to get platform labels
export function getPlatformLabels(script: Script): string[] {
  const platforms = getPlatforms(script);
  const labelMap: Record<string, string> = {
    linux: 'Linux',
    macos: 'macOS',
    windows: 'Windows',
    android: 'Android',
    ios: 'iOS',
    web: 'Web',
    browser_extension: 'Browser Extension',
    raspberry_pi: 'Raspberry Pi',
  };
  
  return platforms.map(p => labelMap[p] || p);
}

// Helper to get deployment method labels
export function getInstallMethodLabels(script: Script): string[] {
  const methods = getInstall(script);
  const labelMap: Record<string, string> = {
    docker: 'Docker',
    docker_compose: 'Docker Compose',
    kubernetes: 'Kubernetes',
    helm: 'Helm',
    binary: 'Binary',
    package_manager: 'Package Manager',
    script: 'Script',
  };
  
  return methods.map(m => labelMap[m] || m);
}
