import * as React from 'react';

interface Bet {
  id: number;
  user_id: number;
  match_id: number;
  home_score_bet: number;
  away_score_bet: number;
  points: number;
  is_exact_score: boolean;
  created_at: string;
  // Match details
  home_team: string;
  away_team: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  round_number: number;
  // User details
  name: string;
}

export function useBets(userId?: number) {
  const [bets, setBets] = React.useState<Bet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchBets = async () => {
    try {
      console.log('Fetching bets...');
      const url = userId ? `/api/bets?userId=${userId}` : '/api/bets';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Bets fetched:', data.length);
      setBets(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bets');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBets();
  }, [userId]);

  return {
    bets,
    loading,
    error,
    refetch: fetchBets,
  };
}
