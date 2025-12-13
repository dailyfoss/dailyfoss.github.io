import { useEffect, useState } from 'react';
import type { Script } from '@/lib/types';
import { getLastReleaseDate } from '@/lib/version-utils';

export function useLastUpdated(script: Script) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchLastUpdated() {
      try {
        const date = await getLastReleaseDate(script);
        if (isMounted) {
          setLastUpdated(date);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching last updated date:', error);
        if (isMounted) {
          setLastUpdated(null);
          setLoading(false);
        }
      }
    }

    fetchLastUpdated();

    return () => {
      isMounted = false;
    };
  }, [script.source_code]);

  return { lastUpdated, loading };
}