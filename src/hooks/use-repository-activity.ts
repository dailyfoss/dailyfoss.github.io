import { useEffect, useState } from 'react';
import type { Script } from '@/lib/types';
import { getRepositoryActivity, type RepositoryActivity } from '@/lib/version-utils';

export function useRepositoryActivity(script: Script) {
  const [activity, setActivity] = useState<RepositoryActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivity() {
      try {
        const activityData = await getRepositoryActivity(script);
        if (isMounted) {
          setActivity(activityData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching repository activity:', error);
        if (isMounted) {
          setActivity({
            level: 'inactive',
            lastCommit: null,
            message: 'Error fetching activity'
          });
          setLoading(false);
        }
      }
    }

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, [script.source_code]);

  return { activity, loading };
}