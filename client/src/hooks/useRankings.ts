import * as React from 'react';

interface UserRanking {
  user_id: number;
  name: string;
  total_points: number;
  exact_scores: number;
  total_bets: number;
}

export function useRankings() {
  const [rankings, setRankings] = React.useState<UserRanking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      console.log('Fetching rankings...');
      const response = await fetch('/api/rankings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Rankings fetched:', data.length);
      setRankings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch rankings');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRankings();
  }, []);

  return {
    rankings,
    loading,
    error,
    refetch: fetchRankings,
  };
}
