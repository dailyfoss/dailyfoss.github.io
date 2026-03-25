import type { Script } from './types';

/**
 * Utility functions for working with manifest files
 * Supports both single file (string) and bundle (object with files array) formats
 */

export type ManifestType = 'script' | 'docker_compose' | 'helm' | 'kubernetes' | 'terraform';

export interface ManifestInfo {
  type: ManifestType;
  files: string[];
  isBundle: boolean;
}

/**
 * Get manifest files for a specific type
 * Returns an array of file paths from the files object
 */
export function getManifestFiles(script: Script, type: ManifestType): string[] {
  const manifest = script.manifests?.[type];
  
  if (!manifest) {
    return [];
  }
  
  // New structure: { files: { "filename": "path" } }
  if (typeof manifest === 'object' && 'files' in manifest) {
    return Object.values(manifest.files || {});
  }
  
  return [];
}

/**
 * Get manifest file names (keys from the files object)
 */
export function getManifestFileNames(script: Script, type: ManifestType): string[] {
  const manifest = script.manifests?.[type];
  
  if (!manifest || typeof manifest !== 'object' || !('files' in manifest)) {
    return [];
  }
  
  return Object.keys(manifest.files || {});
}

/**
 * Get a specific manifest file path by name
 */
export function getManifestFile(script: Script, type: ManifestType, fileName: string): string | null {
  const manifest = script.manifests?.[type];
  
  if (!manifest || typeof manifest !== 'object' || !('files' in manifest)) {
    return null;
  }
  
  return manifest.files?.[fileName] || null;
}

/**
 * Check if a manifest is a bundle (multiple files)
 */
export function isManifestBundle(script: Script, type: ManifestType): boolean {
  const manifest = script.manifests?.[type];
  if (!manifest || typeof manifest !== 'object' || !('files' in manifest)) {
    return false;
  }
  return Object.keys(manifest.files || {}).length > 1;
}

/**
 * Get all manifest information for a script
 */
export function getAllManifests(script: Script): ManifestInfo[] {
  const types: ManifestType[] = ['script', 'docker_compose', 'helm', 'kubernetes', 'terraform'];
  const manifests: ManifestInfo[] = [];
  
  for (const type of types) {
    const files = getManifestFiles(script, type);
    if (files.length > 0) {
      manifests.push({
        type,
        files,
        isBundle: isManifestBundle(script, type)
      });
    }
  }
  
  return manifests;
}

/**
 * Get manifest type label
 */
export function getManifestTypeLabel(type: ManifestType): string {
  const labels: Record<ManifestType, string> = {
    script: 'Script',
    docker_compose: 'Docker Compose',
    helm: 'Helm',
    kubernetes: 'Kubernetes',
    terraform: 'Terraform'
  };
  
  return labels[type];
}

/**
 * Get the primary manifest file (first file in bundle or the single file)
 */
export function getPrimaryManifestFile(script: Script, type: ManifestType): string | null {
  const files = getManifestFiles(script, type);
  return files.length > 0 ? files[0] : null;
}

/**
 * Check if script has any manifests
 */
export function hasManifests(script: Script): boolean {
  return getAllManifests(script).length > 0;
}

/**
 * Get manifest file count
 */
export function getManifestFileCount(script: Script, type: ManifestType): number {
  return getManifestFiles(script, type).length;
}

/**
 * Format manifest display text
 */
export function formatManifestDisplay(script: Script, type: ManifestType): string {
  const files = getManifestFiles(script, type);
  const count = files.length;
  
  if (count === 0) return '';
  if (count === 1) return getManifestTypeLabel(type);
  
  return `${getManifestTypeLabel(type)} (${count} files)`;
}
