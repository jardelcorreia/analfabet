import { useState, useEffect, useCallback } from 'react';
import { Match } from '../types';
// dbHelpers will no longer be directly used here for fetching matches.
// import { dbHelpers } from '../lib/database';

export const useMatches = (round?: number | 'all') => { // round prop is the user-selected round, or undefined for default
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // displayedRound will hold the round number the server actually returned data for
  const [displayedRound, setDisplayedRound] = useState<number | undefined>(round);

  const fetchMatchesFromServer = useCallback(async (fetchForRound?: number) => {
    setLoading(true);
    setError(null);
    // When fetching, if fetchForRound is undefined, it means we want the server's default.
    // If fetchForRound has a value, we are requesting a specific round.
    console.log(`[useMatches] Initiating fetch. Requested round: ${fetchForRound}, Current displayedRound state: ${displayedRound}`);
    try {
      let url = '/.netlify/functions/fetch-matches';
      if (fetchForRound) { // Changed currentRound to fetchForRound
        url += `?round=${fetchForRound}`; // Changed currentRound to fetchForRound
      }
      // You could add other parameters like leagueId here if needed:
      // url += `&leagueId=BSA`;

      console.log(`[useMatches] Fetching from: ${url}`); // url uses fetchForRound
      const response = await fetch(url);
      const responseData = await response.json();

      if (!response.ok) {
        console.error('[useMatches] Failed to fetch matches from server function:', responseData?.error || response.statusText);
        throw new Error(responseData?.error || 'Failed to fetch matches.');
      }

      console.log('[useMatches] Matches fetched successfully from server:', responseData);
      // Server now returns an object: { matches: Match[], determinedRound: number }
      setMatches(responseData.matches || []); // Ensure matches is always an array
      setDisplayedRound(responseData.determinedRound); // Update displayedRound with what server determined/returned
      console.log(`[useMatches] State updated. Matches count: ${responseData.matches?.length || 0}, Displayed round: ${responseData.determinedRound}`);

    } catch (err: any) {
      console.error('[useMatches] Error in fetchMatchesFromServer:', err);
      setError(err.message || 'An unknown error occurred while fetching matches.');
      setMatches([]); // Clear matches on error
      // setDisplayedRound(undefined); // Optionally reset displayedRound or keep last known good
    } finally {
      setLoading(false);
    }
  }, [displayedRound]);

  useEffect(() => {
    // Initial fetch and when the 'round' prop (user selection) changes.
    // The dependency on `round` ensures that we re-fetch if the user selects a new round.
    fetchMatchesFromServer(round);
  }, [round, fetchMatchesFromServer]);

  return {
    matches,
    loading,
    error,
    displayedRound, // Return the actual round being displayed
    refreshMatches: () => fetchMatchesFromServer(round) // Refresh based on current user-selected round prop
  };
};