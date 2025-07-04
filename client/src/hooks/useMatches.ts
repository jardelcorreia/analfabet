import * as React from 'react';

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  round_number: number;
  created_at: string;
}

export function useMatches() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches...');
      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Matches fetched:', data.length);
      setMatches(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const syncMatches = async () => {
    try {
      console.log('Syncing matches...');
      const response = await fetch('/api/matches/sync', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Matches synced:', data);
      
      // Refresh matches after sync
      await fetchMatches();
    } catch (err) {
      console.error('Error syncing matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync matches');
    }
  };

  React.useEffect(() => {
    fetchMatches();
  }, []);

  return {
    matches,
    loading,
    error,
    syncMatches,
    refetch: fetchMatches,
  };
}
