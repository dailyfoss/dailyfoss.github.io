import type { AppVersion, Script } from "./types";

// Cache for versions data
let versionsCache: AppVersion[] | null = null;
let versionsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for repository activity data
let activityCache: Map<string, { lastCommit: Date | null; fetchTime: number }> = new Map();
const ACTIVITY_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Repository activity levels
export type ActivityLevel = 'active' | 'low' | 'inactive';

export interface RepositoryActivity {
  level: ActivityLevel;
  lastCommit: Date | null;
  message: string;
}

// Extract owner and repo from various URL formats
function parseRepoUrl(url: string): string | null {
  if (!url) return null;
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  const githubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/\s]+)/i);
  if (githubMatch) {
    return `${githubMatch[1]}/${githubMatch[2].replace(/\.git$/, '')}`;
  }

  const gitlabMatch = cleanUrl.match(/gitlab\.com\/([^\/]+)\/([^\/\s]+)/i);
  if (gitlabMatch) {
    return `${gitlabMatch[1]}/${gitlabMatch[2].replace(/\.git$/, '')}`;
  }

  return null;
}

// Fetch versions data with caching
async function getVersionsData(): Promise<AppVersion[]> {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (versionsCache && (now - versionsCacheTime) < CACHE_DURATION) {
    return versionsCache;
  }

  try {
    const response = await fetch('/api/versions');
    if (!response.ok) {
      throw new Error(`Failed to fetch versions: ${response.statusText}`);
    }
    
    const versions: AppVersion[] = await response.json();
    versionsCache = versions;
    versionsCacheTime = now;
    
    return versions;
  } catch (error) {
    console.error('Error fetching versions:', error);
    // Return cached data if available, even if stale
    return versionsCache || [];
  }
}

// Fetch latest commit date from GitHub API
async function fetchLatestCommit(repoName: string): Promise<Date | null> {
  try {
    const [owner, repo] = repoName.split('/');
    const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DailyFOSS-Activity-Checker'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`${url}?per_page=1`, { headers });

    if (!response.ok) {
      return null;
    }

    const commits = await response.json();
    if (commits.length === 0) {
      return null;
    }

    return new Date(commits[0].commit.committer.date);
  } catch (error) {
    console.error('Error fetching latest commit:', error);
    return null;
  }
}

// Get repository activity level
export async function getRepositoryActivity(script: Script): Promise<RepositoryActivity> {
  if (!script.source_code) {
    return {
      level: 'inactive',
      lastCommit: null,
      message: 'No repository information'
    };
  }

  const repoName = parseRepoUrl(script.source_code);
  if (!repoName) {
    return {
      level: 'inactive',
      lastCommit: null,
      message: 'Invalid repository URL'
    };
  }

  // Check cache first
  const now = Date.now();
  const cached = activityCache.get(repoName);
  if (cached && (now - cached.fetchTime) < ACTIVITY_CACHE_DURATION) {
    return determineActivityLevel(cached.lastCommit);
  }

  // Fetch latest commit
  const lastCommit = await fetchLatestCommit(repoName);
  
  // Cache the result
  activityCache.set(repoName, {
    lastCommit,
    fetchTime: now
  });

  return determineActivityLevel(lastCommit);
}

// Determine activity level based on last commit date
function determineActivityLevel(lastCommit: Date | null): RepositoryActivity {
  if (!lastCommit) {
    return {
      level: 'inactive',
      lastCommit: null,
      message: 'No recent commits'
    };
  }

  const now = new Date();
  const diffInMs = now.getTime() - lastCommit.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 30) {
    return {
      level: 'active',
      lastCommit,
      message: `Last commit ${getRelativeTime(lastCommit)}`
    };
  } else if (diffInDays <= 180) {
    return {
      level: 'low',
      lastCommit,
      message: `Last commit ${getRelativeTime(lastCommit)}`
    };
  } else {
    return {
      level: 'inactive',
      lastCommit,
      message: `Last commit ${getRelativeTime(lastCommit)}`
    };
  }
}

// Get last release date for a script (renamed from getLastUpdatedDate)
export async function getLastReleaseDate(script: Script): Promise<Date | null> {
  if (!script.source_code) {
    return null;
  }

  const repoName = parseRepoUrl(script.source_code);
  if (!repoName) {
    return null;
  }

  try {
    const versions = await getVersionsData();
    const versionEntry = versions.find(v => v.name === repoName);
    
    if (versionEntry && versionEntry.date) {
      return new Date(versionEntry.date);
    }
  } catch (error) {
    console.error('Error getting last updated date:', error);
  }

  return null;
}

// Format date for display in browser timezone
export function formatLastUpdated(date: Date | null): string {
  if (!date) {
    return 'Unknown';
  }

  // Format date in user's local timezone
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  return date.toLocaleDateString(undefined, options);
}

// Get relative time (e.g., "2 days ago")
export function getRelativeTime(date: Date | null): string {
  if (!date) {
    return 'Unknown';
  }

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}