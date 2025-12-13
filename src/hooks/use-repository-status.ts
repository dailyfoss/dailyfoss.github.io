import { useEffect, useState } from 'react';
import type { Script, RepositoryStatus } from '@/lib/types';
import { getRepositoryInfo, type RepositoryInfo } from '@/lib/repository-status';

// Helper to get status display properties
function getStatusDisplay(status: string, daysSinceLastCommit: number | null): {
  statusMessage: string;
  statusIcon: string;
  statusColor: string;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const getRelativeTime = (days: number | null): string => {
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
  };

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

export function useRepositoryStatus(script: Script) {
  const [repositoryInfo, setRepositoryInfo] = useState<RepositoryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRepositoryInfo() {
      try {
        setLoading(true);
        setError(null);
        
        // Check if script has metadata with date information
        if (script.metadata?.date_last_commit) {
          // Calculate days since last commit
          let daysSinceLastCommit: number | null = null;
          if (script.metadata.date_last_commit) {
            const now = new Date();
            const commitDate = new Date(script.metadata.date_last_commit);
            const diffInMs = now.getTime() - commitDate.getTime();
            daysSinceLastCommit = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          }
          
          // Calculate days since last release
          let daysSinceLastRelease: number | null = null;
          if (script.metadata.date_last_released) {
            const now = new Date();
            const releaseDate = new Date(script.metadata.date_last_released);
            const diffInMs = now.getTime() - releaseDate.getTime();
            daysSinceLastRelease = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          }
          
          // Determine status based on days since last commit
          let status: RepositoryStatus = 'unknown';
          if (daysSinceLastCommit !== null) {
            if (daysSinceLastCommit <= 30) {
              status = 'active';
            } else if (daysSinceLastCommit <= 180) {
              status = 'regular';
            } else if (daysSinceLastCommit <= 365) {
              status = 'occasional';
            } else {
              status = 'dormant';
            }
          }
          
          const statusDisplay = getStatusDisplay(status, daysSinceLastCommit);
          
          if (isMounted) {
            setRepositoryInfo({
              status,
              lastCommit: script.metadata.date_last_commit ? new Date(script.metadata.date_last_commit) : null,
              lastRelease: script.metadata.date_last_released ? new Date(script.metadata.date_last_released) : null,
              version: script.metadata.version || null,
              isArchived: false,
              daysSinceLastCommit,
              daysSinceLastRelease,
              ...statusDisplay
            });
            setLoading(false);
          }
          return;
        }
        
        // Check legacy repository_status field
        const scriptData = script as any;
        if (scriptData.repository_status) {
          const repoStatus = scriptData.repository_status;
          
          let daysSinceLastCommit: number | null = null;
          if (repoStatus.last_commit) {
            const now = new Date();
            const commitDate = new Date(repoStatus.last_commit);
            const diffInMs = now.getTime() - commitDate.getTime();
            daysSinceLastCommit = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          }
          
          let daysSinceLastRelease: number | null = null;
          if (repoStatus.last_release) {
            const now = new Date();
            const releaseDate = new Date(repoStatus.last_release);
            const diffInMs = now.getTime() - releaseDate.getTime();
            daysSinceLastRelease = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          }
          
          const statusDisplay = getStatusDisplay(repoStatus.status, daysSinceLastCommit);
          
          if (isMounted) {
            setRepositoryInfo({
              status: repoStatus.status,
              lastCommit: repoStatus.last_commit ? new Date(repoStatus.last_commit) : null,
              lastRelease: repoStatus.last_release ? new Date(repoStatus.last_release) : null,
              version: repoStatus.version || null,
              isArchived: repoStatus.is_archived || false,
              daysSinceLastCommit,
              daysSinceLastRelease,
              ...statusDisplay
            });
            setLoading(false);
          }
          return;
        }
        
        // Fallback to API call if no data available
        const info = await getRepositoryInfo(script);
        
        if (isMounted) {
          setRepositoryInfo(info);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading repository info:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load repository info');
          setRepositoryInfo({
            status: 'unknown',
            lastCommit: null,
            lastRelease: null,
            version: null,
            isArchived: false,
            statusMessage: 'Error loading repository info',
            statusIcon: 'activity',
            statusColor: 'text-gray-600 dark:text-gray-400',
            statusBadgeVariant: 'outline',
            daysSinceLastCommit: null,
            daysSinceLastRelease: null
          });
          setLoading(false);
        }
      }
    }

    loadRepositoryInfo();

    return () => {
      isMounted = false;
    };
  }, [script.metadata?.date_last_commit, script.metadata?.date_last_released, script.slug]);

  return { repositoryInfo, loading, error };
}
