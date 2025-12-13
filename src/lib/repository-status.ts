import type { Script } from "./types";

// Repository status levels based on last commit activity
export type RepositoryStatus = 
  | 'active'        // ≤ 30 days
  | 'regular'       // 31-180 days  
  | 'occasional'    // 181-365 days
  | 'dormant'       // > 365 days
  | 'archived'      // Repository is archived
  | 'unknown';      // No data available

export interface RepositoryInfo {
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

// Cache for repository data
let repoCache: Map<string, { data: RepositoryInfo; fetchTime: number }> = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Extract owner and repo from various URL formats
function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  const githubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/i);
  if (githubMatch) {
    return {
      owner: githubMatch[1],
      repo: githubMatch[2].replace(/\.git$/, '')
    };
  }

  const gitlabMatch = cleanUrl.match(/gitlab\.com\/([^\/]+)\/([^\/\s]+)/i);
  if (gitlabMatch) {
    return {
      owner: gitlabMatch[1], 
      repo: gitlabMatch[2].replace(/\.git$/, '')
    };
  }

  return null;
}

// Fetch repository information from GitHub API
async function fetchRepositoryInfo(owner: string, repo: string): Promise<Partial<RepositoryInfo>> {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DailyFOSS-Repository-Checker'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch repository info and latest commit in parallel
    const [repoResponse, commitsResponse, releasesResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers })
    ]);

    let lastCommit: Date | null = null;
    let lastRelease: Date | null = null;
    let version: string | null = null;
    let isArchived = false;

    // Get repository info (archived status)
    if (repoResponse.ok) {
      const repoData = await repoResponse.json();
      isArchived = repoData.archived || false;
    }

    // Get latest commit
    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      if (commits.length > 0) {
        lastCommit = new Date(commits[0].commit.committer.date);
      }
    }

    // Get latest release
    if (releasesResponse.ok) {
      const release = await releasesResponse.json();
      if (release.tag_name) {
        version = release.tag_name;
        lastRelease = new Date(release.published_at);
      }
    }

    return {
      lastCommit,
      lastRelease,
      version,
      isArchived
    };
  } catch (error) {
    console.error(`Error fetching repository info for ${owner}/${repo}:`, error);
    return {};
  }
}

// Determine repository status based on activity
function determineRepositoryStatus(
  lastCommit: Date | null,
  isArchived: boolean
): { status: RepositoryStatus; daysSinceLastCommit: number | null } {
  if (isArchived) {
    return { status: 'archived', daysSinceLastCommit: null };
  }

  if (!lastCommit) {
    return { status: 'unknown', daysSinceLastCommit: null };
  }

  const now = new Date();
  const diffInMs = now.getTime() - lastCommit.getTime();
  const daysSinceLastCommit = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (daysSinceLastCommit <= 30) {
    return { status: 'active', daysSinceLastCommit };
  } else if (daysSinceLastCommit <= 180) {
    return { status: 'regular', daysSinceLastCommit };
  } else if (daysSinceLastCommit <= 365) {
    return { status: 'occasional', daysSinceLastCommit };
  } else {
    return { status: 'dormant', daysSinceLastCommit };
  }
}

// Get status display properties
function getStatusDisplay(status: RepositoryStatus, daysSinceLastCommit: number | null): {
  statusMessage: string;
  statusIcon: string;
  statusColor: string;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'active':
      return {
        statusMessage: `Actively Updated — Last commit ${getRelativeTime(daysSinceLastCommit)} ago`,
        statusIcon: 'activity',
        statusColor: 'text-green-600 dark:text-green-400',
        statusBadgeVariant: 'default'
      };
    case 'regular':
      return {
        statusMessage: `Regularly Updated — Last commit ${getRelativeTime(daysSinceLastCommit)} ago`,
        statusIcon: 'refresh-ccw',
        statusColor: 'text-yellow-600 dark:text-yellow-400',
        statusBadgeVariant: 'secondary'
      };
    case 'occasional':
      return {
        statusMessage: `Occasionally Updated — Last commit ${getRelativeTime(daysSinceLastCommit)} ago`,
        statusIcon: 'clock-3',
        statusColor: 'text-orange-600 dark:text-orange-400',
        statusBadgeVariant: 'outline'
      };
    case 'dormant':
      return {
        statusMessage: `Dormant — Last commit ${getRelativeTime(daysSinceLastCommit)} ago`,
        statusIcon: 'moon',
        statusColor: 'text-red-600 dark:text-red-400',
        statusBadgeVariant: 'destructive'
      };
    case 'archived':
      return {
        statusMessage: 'Archived — Not maintained',
        statusIcon: 'archive',
        statusColor: 'text-gray-600 dark:text-gray-400',
        statusBadgeVariant: 'outline'
      };
    default:
      return {
        statusMessage: 'Status Unknown',
        statusIcon: 'activity',
        statusColor: 'text-gray-600 dark:text-gray-400',
        statusBadgeVariant: 'outline'
      };
  }
}

// Get relative time description
function getRelativeTime(days: number | null): string {
  if (days === null) return 'unknown time';
  
  if (days === 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  const years = Math.floor(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}

// Calculate days since date
function daysSince(date: Date | null): number | null {
  if (!date) return null;
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

// Main function to get repository information
export async function getRepositoryInfo(script: Script): Promise<RepositoryInfo> {
  if (!script.source_code) {
    return {
      status: 'unknown',
      lastCommit: null,
      lastRelease: null,
      version: null,
      isArchived: false,
      statusMessage: 'No repository information',
      statusIcon: 'activity',
      statusColor: 'text-gray-600 dark:text-gray-400',
      statusBadgeVariant: 'outline',
      daysSinceLastCommit: null,
      daysSinceLastRelease: null
    };
  }

  const repoInfo = parseRepoUrl(script.source_code);
  if (!repoInfo) {
    return {
      status: 'unknown',
      lastCommit: null,
      lastRelease: null,
      version: null,
      isArchived: false,
      statusMessage: 'Invalid repository URL',
      statusIcon: 'activity',
      statusColor: 'text-gray-600 dark:text-gray-400',
      statusBadgeVariant: 'outline',
      daysSinceLastCommit: null,
      daysSinceLastRelease: null
    };
  }

  const cacheKey = `${repoInfo.owner}/${repoInfo.repo}`;
  const now = Date.now();
  const cached = repoCache.get(cacheKey);

  // Return cached data if still fresh
  if (cached && (now - cached.fetchTime) < CACHE_DURATION) {
    return cached.data;
  }

  // Fetch fresh data
  const repoData = await fetchRepositoryInfo(repoInfo.owner, repoInfo.repo);
  const { status, daysSinceLastCommit } = determineRepositoryStatus(
    repoData.lastCommit || null,
    repoData.isArchived || false
  );

  const statusDisplay = getStatusDisplay(status, daysSinceLastCommit);
  const daysSinceLastRelease = daysSince(repoData.lastRelease || null);

  const repositoryInfo: RepositoryInfo = {
    status,
    lastCommit: repoData.lastCommit || null,
    lastRelease: repoData.lastRelease || null,
    version: repoData.version || null,
    isArchived: repoData.isArchived || false,
    daysSinceLastCommit,
    daysSinceLastRelease,
    statusMessage: statusDisplay.statusMessage,
    statusIcon: statusDisplay.statusIcon,
    statusColor: statusDisplay.statusColor,
    statusBadgeVariant: statusDisplay.statusBadgeVariant
  };

  // Cache the result
  repoCache.set(cacheKey, {
    data: repositoryInfo,
    fetchTime: now
  });

  return repositoryInfo;
}

// Format version display
export function formatVersion(version: string | null): string {
  if (!version) return '';
  
  // Clean up version string (remove 'v' prefix if present)
  const cleanVersion = version.replace(/^v/, '');
  
  // Add 'v' prefix for display
  return `v${cleanVersion}`;
}

// Format date for display
export function formatDate(date: Date | null): string {
  if (!date) return 'Unknown';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  
  return date.toLocaleDateString(undefined, options);
}

// Format relative time for display
export function formatRelativeTime(date: Date | null): string {
  if (!date) return 'Unknown';
  
  const days = daysSince(date);
  return getRelativeTime(days);
}