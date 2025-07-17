import { useState, useEffect } from 'react';
import { Bet } from '../types';
import { useAuth } from './useAuth';

export const useLeagueBets = (leagueId: string, round?: number) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeagueBets = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const url = round
          ? `/.netlify/functions/fetch-league-bets?leagueId=${leagueId}&round=${round}`
          : `/.netlify/functions/fetch-league-bets?leagueId=${leagueId}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch league bets');
        }
        const data = await response.json();
        setBets(data);
      } catch (error) {
        console.error('Error fetching league bets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueBets();
  }, [leagueId, round, user]);

  return { bets, loading };
};
