import { useState, useEffect, useCallback } from 'react';
import { Bet } from '../types';

export const useBets = (leagueId: string, userId: string, round?: number) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = useCallback(async () => {
    if (!leagueId || !userId) {
      setBets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = `/.netlify/functions/fetch-bets?leagueId=${leagueId}&userId=${userId}`;
      if (round) {
        url += `&round=${round}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch bets');
      }
      const data = await response.json();
      setBets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [leagueId, userId, round]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  return { bets, loading, error, refreshBets: fetchBets };
};
