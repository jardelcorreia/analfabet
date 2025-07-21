import React, { useState, useMemo, useEffect } from 'react';
import { useLeagueBets } from '../../hooks/useLeagueBets';
import { RoundSelector } from '../Ranking/RoundSelector';
import { Bet, League, Match } from '../../types';
import { timesInfo } from '../../lib/teams';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, Trophy, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface LeagueBetsProps {
  league: League;
}

interface BetsByMatch {
  match: Match;
  bets: Bet[];
}

export const LeagueBets: React.FC<LeagueBetsProps> = ({ league }) => {
  const [selectedRound, setSelectedRound] = useState<number | 'all' | undefined>();
  const { bets, loading, displayedRound } = useLeagueBets(league.id, selectedRound);

  useEffect(() => {
    if (displayedRound !== undefined && selectedRound !== displayedRound && selectedRound !== 'all') {
      if (selectedRound === undefined) {
        setSelectedRound(displayedRound);
      }
    }
  }, [displayedRound, selectedRound]);

  const betsByMatch = useMemo(() => {
    const now = new Date();
    const grouped = bets
      .filter(bet => new Date(bet.match.match_date) <= now)
      .reduce((acc, bet) => {
        const matchId = bet.match.id;
        if (!acc[matchId]) {
          acc[matchId] = {
            match: bet.match,
            bets: [],
          };
        }
        acc[matchId].bets.push(bet);
        return acc;
      }, {} as Record<string, BetsByMatch>);

    return Object.values(grouped).sort((a, b) =>
      new Date(b.match.match_date).getTime() - new Date(a.match.match_date).getTime()
    );
  }, [bets]);

  const getResultColor = (bet: Bet) => {
    if (bet.match.status !== 'finished' && bet.match.status !== 'live') return 'text-gray-500';
    if (bet.is_exact) return 'text-green-600';
    if (bet.points && bet.points > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const getResultBadge = (bet: Bet) => {
    if (bet.match.status !== 'finished' && bet.match.status !== 'live') return { text: 'P', color: 'bg-gray-100 text-gray-600' };
    if (bet.is_exact) return { text: 'E', color: 'bg-green-100 text-green-700' };
    if (bet.points && bet.points > 0) return { text: 'C', color: 'bg-blue-100 text-blue-700' };
    return { text: 'X', color: 'bg-red-100 text-red-700' };
  };

  const getPlayerStats = (bets: Bet[]) => {
    const processed = bets.filter(bet => bet.match.status === 'finished' || bet.match.status === 'live');
    const exact = processed.filter(bet => bet.is_exact).length;
    const correct = processed.filter(bet => bet.points && bet.points > 0 && !bet.is_exact).length;
    const total = processed.length;
    const points = processed.reduce((sum, bet) => sum + (bet.points || 0), 0);

    return { exact, correct, total, points };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header Compacto */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 mb-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{league?.name}</h1>
            <p className="text-green-100 text-sm">Apostas da Liga</p>
          </div>
          <div className="w-full sm:w-auto">
            <RoundSelector
              selectedRound={selectedRound}
              onRoundChange={setSelectedRound}
              totalRounds={38}
              variant="onGradient"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {betsByMatch.map(({ match, bets }) => (
          <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className='flex-grow'>
                  <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                    <span className="text-sm sm:text-base font-bold text-gray-800 text-right w-24 sm:w-32 truncate">
                      {timesInfo[match.home_team]?.nome || match.home_team}
                    </span>
                    <img src={timesInfo[match.home_team]?.logo} alt={match.home_team} className="h-6 w-6 sm:h-8 sm:w-8" />
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500">
                        {format(new Date(match.match_date), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                      {(match.status === 'finished' || match.status === 'live') && match.home_score !== null ? (
                        <span className="text-lg sm:text-xl font-bold text-gray-800">{match.home_score} - {match.away_score}</span>
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-gray-400">vs</span>
                      )}
                    </div>
                    <img src={timesInfo[match.away_team]?.logo} alt={match.away_team} className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="text-sm sm:text-base font-bold text-gray-800 text-left w-24 sm:w-32 truncate">
                      {timesInfo[match.away_team]?.nome || match.away_team}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {bets.sort((a,b) => a.user.name.localeCompare(b.user.name)).map(bet => {
                  const badge = getResultBadge(bet);
                  return (
                    <div key={bet.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-center hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.text}</span>
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{bet.user.name}</h4>
                      </div>
                      <p className={`text-lg font-bold ${getResultColor(bet)}`}>
                        {bet.home_score} - {bet.away_score}
                      </p>
                      {bet.points && <p className="text-xs text-gray-600">{bet.points} pts</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {betsByMatch.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhuma aposta para exibir
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {selectedRound
              ? `As apostas da rodada ${selectedRound} serão exibidas aqui após o início de cada partida.`
              : 'As apostas serão exibidas aqui após o início de cada partida.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
