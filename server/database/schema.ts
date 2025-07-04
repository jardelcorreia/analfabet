export interface Database {
  users: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
  matches: {
    id: number;
    home_team: string;
    away_team: string;
    match_date: string;
    home_score: number | null;
    away_score: number | null;
    status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
    round_number: number;
    created_at: string;
  };
  bets: {
    id: number;
    user_id: number;
    match_id: number;
    home_score_bet: number;
    away_score_bet: number;
    points: number;
    is_exact_score: boolean;
    created_at: string;
  };
}
