import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '../types';

export const useRanking = (leagueId: string, round?: number) => {
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = useCallback(async () => {
    if (!leagueId) {
      setRanking([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = `/.netlify/functions/fetch-ranking?leagueId=${leagueId}`;
      if (round) {
        url += `&round=${round}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch ranking');
      }
      const data = await response.json();
      setRanking(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [leagueId, round]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return { ranking, loading, error, refreshRanking: fetchRanking };
};