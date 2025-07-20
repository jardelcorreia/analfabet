import { useState, useEffect, useCallback } from 'react';
import { Match } from '../types';

export const useMatches = (round?: number | 'all') => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedRound, setDisplayedRound] = useState<number | undefined>();
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const fetchMatches = useCallback(async (fetchForRound?: number | 'all') => {
    setLoading(true);
    setError(null);
    try {
      let url = '/.netlify/functions/fetch-matches';
      if (fetchForRound) {
        url += `?round=${fetchForRound}`;
      }
      const response = await fetch(url);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to fetch matches.');
      }
      setMatches(responseData.matches || []);
      setDisplayedRound(responseData.determinedRound);
      setLastUpdate(Date.now());
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching matches.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(round);
    
    // Set up real-time updates for live matches
    const interval = setInterval(() => {
      const hasLiveMatches = matches.some(match => match.status === 'live');
      if (hasLiveMatches) {
        console.log('[useMatches] Refreshing live matches for real-time updates');
        fetchMatches(round);
      }
    }, 30000); // Update every 30 seconds for live matches
    
    return () => clearInterval(interval);
  }, [round, fetchMatches]);

  // Auto-refresh when there are live matches
  useEffect(() => {
    const hasLiveMatches = matches.some(match => match.status === 'live');
    if (hasLiveMatches) {
      const interval = setInterval(() => {
        fetchMatches(round);
      }, 15000); // More frequent updates for live matches (15 seconds)
      
      return () => clearInterval(interval);
    }
  }, [matches, round, fetchMatches]);
  return {
    matches,
    loading,
    error,
    displayedRound, // Return the actual round being displayed
    refreshMatches: () => fetchMatches(round), // Refresh based on current user-selected round prop
    lastUpdate // Expose last update time for debugging
  };
};