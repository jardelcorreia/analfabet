import React, { useState, useEffect } from 'react';
import { Match, Bet } from '../../types';
import { timesInfo } from '../../lib/teams';
import { Shield } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  userBet?: Bet;
  onPlaceBet: (homeScore: number, awayScore: number) => void;
  canBet: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, userBet, onPlaceBet, canBet }) => {
  const [homeScore, setHomeScore] = useState<string>(userBet?.home_score?.toString() ?? '');
  const [awayScore, setAwayScore] = useState<string>(userBet?.away_score?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHomeScore(userBet?.home_score?.toString() ?? '');
    setAwayScore(userBet?.away_score?.toString() ?? '');
  }, [userBet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const home = parseInt(homeScore, 10);
    const away = parseInt(awayScore, 10);

    if (isNaN(home) || isNaN(away)) {
      setError('Placar inválido');
      return;
    }
    setError(null);
    onPlaceBet(home, away);
  };

  const getTeamLogo = (teamName: string) => {
    const team = timesInfo[teamName];
    return team?.escudo;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src={getTeamLogo(match.home_team)} alt={match.home_team} className="w-6 h-6" />
          <span className="font-semibold">{match.home_team}</span>
        </div>
        <span className="text-gray-500 text-sm">vs</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{match.away_team}</span>
          <img src={getTeamLogo(match.away_team)} alt={match.away_team} className="w-6 h-6" />
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-4">
        {new Date(match.match_date).toLocaleString()} - Rodada {match.round}
      </div>

      {canBet ? (
        <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
          <input
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-16 text-center border border-gray-200 rounded-xl"
            placeholder="-"
            min="0"
          />
          <span className="font-bold">x</span>
          <input
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-16 text-center border border-gray-200 rounded-xl"
            placeholder="-"
            min="0"
          />
          <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-xl font-semibold">
            Apostar
          </button>
        </form>
      ) : (
        <div className="text-center font-bold text-lg">
          {match.home_score} x {match.away_score}
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

      {userBet && (
        <div className="text-center mt-2 text-sm text-gray-600">
          Sua aposta: {userBet.home_score} x {userBet.away_score}
        </div>
      )}
    </div>
  );
};
