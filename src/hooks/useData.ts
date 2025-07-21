import { useState, useEffect, useCallback } from 'react';
import { Match, UserStats } from '../types';

export const useData = (leagueId: string, round?: number | 'all') => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedRound, setDisplayedRound] = useState<number | undefined>();

  const fetchData = useCallback(async (fetchForRound?: number | 'all') => {
    setLoading(true);
    setError(null);
    try {
      let matchesUrl = '/.netlify/functions/fetch-matches';
      if (fetchForRound) {
        matchesUrl += `?round=${fetchForRound}`;
      }
      const matchesResponse = await fetch(matchesUrl);
      const matchesData = await matchesResponse.json();

      if (!matchesResponse.ok) {
        throw new Error(matchesData?.error || 'Failed to fetch matches.');
      }
      setMatches(matchesData.matches || []);
      setDisplayedRound(matchesData.determinedRound);

      if (leagueId) {
        let rankingUrl = `/.netlify/functions/fetch-ranking?leagueId=${leagueId}`;
        if (fetchForRound) {
          rankingUrl += `&round=${fetchForRound}`;
        }
        const rankingResponse = await fetch(rankingUrl);
        if (!rankingResponse.ok) {
          throw new Error('Failed to fetch ranking');
        }
        const rankingData = await rankingResponse.json();
        setRanking(rankingData.ranking);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching data.');
      setMatches([]);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchData(round);
  }, [round, fetchData]);

  return {
    matches,
    ranking,
    loading,
    error,
    displayedRound,
    refreshData: () => fetchData(round),
  };
};
