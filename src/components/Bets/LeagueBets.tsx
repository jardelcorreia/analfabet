import React, { useState, useMemo, useEffect } from 'react';
import { useLeagueBets } from '../../hooks/useLeagueBets';
import { RoundSelector } from '../Ranking/RoundSelector';
import { Bet, League } from '../../types';
import { timesInfo } from '../../lib/teams';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, Trophy, Target, ChevronDown, ChevronUp } from 'lucide-react';

interface LeagueBetsProps {
  league: League;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {bets.map(bet => {
          const badge = getResultBadge(bet);
          return (
            <div key={bet.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-xs text-gray-600">
                      {bet.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800">{bet.user.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">
                        {format(new Date(bet.match.match_date), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                  {badge.text}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-2 my-3">
                <span className="text-sm font-bold text-gray-800 text-right w-12 truncate">
                  {timesInfo[bet.match.home_team]?.abrev || bet.match.home_team}
                </span>
                <img src={timesInfo[bet.match.home_team]?.escudo} alt={bet.match.home_team} className="h-6 w-6" />
                <span className="text-lg font-bold text-gray-900">{bet.home_score}</span>
                <span className="text-sm text-gray-500">-</span>
                <span className="text-lg font-bold text-gray-900">{bet.away_score}</span>
                <img src={timesInfo[bet.match.away_team]?.escudo} alt={bet.match.away_team} className="h-6 w-6" />
                <span className="text-sm font-bold text-gray-800 text-left w-12 truncate">
                  {timesInfo[bet.match.away_team]?.abrev || bet.match.away_team}
                </span>
              </div>

              {(bet.match.status === 'finished' || bet.match.status === 'live') && bet.match.home_score !== null && (
                <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span>Resultado: {bet.match.home_score}-{bet.match.away_score}</span>
                    {bet.points !== null && (
                      <div className="flex items-center space-x-1">
                        <span className="font-bold">{bet.points}pts</span>
                        {bet.is_exact && <Target className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {bets.length === 0 && (
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
