import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Filter } from 'lucide-react';
import { League, Bet } from '../../types';
import { useBets } from '../../hooks/useBets';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RoundSelector } from '../Ranking/RoundSelector';
import { timesInfo } from '../../lib/teams';

interface BetHistoryProps {
  league: League;
  userId: string;
}

export const BetHistory: React.FC<BetHistoryProps> = ({ league, userId }) => {
  const [selectedRound, setSelectedRound] = useState<number | 'all' | undefined>(undefined);
  const { bets, loading, displayedRound } = useBets(league.id, userId, selectedRound);
  const [filter, setFilter] = useState<'all' | 'pending' | 'finished'>('all');

  useEffect(() => {
    if (displayedRound !== undefined && selectedRound !== displayedRound && selectedRound !== 'all') {
      if (selectedRound === undefined) {
        setSelectedRound(displayedRound);
      }
    }
  }, [displayedRound, selectedRound]);

  const filteredBets = bets.filter(bet => {
    switch (filter) {
      case 'pending':
        return bet.match.status === 'scheduled';
      case 'finished':
        return bet.match.status === 'finished' || bet.match.status === 'live';
      default:
        return true;
    }
  });

  const getResultColor = (bet: Bet) => {
    if (bet.match.status !== 'finished' && bet.match.status !== 'live') return 'text-gray-500';
    if (bet.is_exact) return 'text-green-600';
    if (bet.points && bet.points > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const getResultText = (bet: Bet) => {
    if (bet.match.status !== 'finished' && bet.match.status !== 'live') return 'Pendente';
    if (bet.is_exact) return 'Placar Exato!';
    if (bet.points && bet.points > 0) return 'Resultado Correto';
    return 'Errou';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Apostas</h2>

        {/* Filters Container */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Round Selector */}
          <div className="flex-1">
            <RoundSelector
              selectedRound={selectedRound}
              onRoundChange={setSelectedRound}
              totalRounds={38}
              variant="default"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <label htmlFor="status-filter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Status:
            </label>
            <div className="relative">
              <select
                id="status-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'finished')}
                className="
                  block w-full sm:w-auto min-w-[140px] pl-3 pr-10 py-2.5 text-sm
                  bg-white border border-gray-300 rounded-lg shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                  hover:border-gray-400 transition-all duration-200
                  appearance-none cursor-pointer
                "
              >
                <option value="all">📋 Todas</option>
                <option value="pending">⏳ Pendentes</option>
                <option value="finished">✅ Finalizadas</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile status indicator */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <span>
              {selectedRound === 'all' ? 'Todas as rodadas' : 
               selectedRound ? `Rodada ${selectedRound}` : 'Rodada atual'}
            </span>
            <span>
              {filter === 'all' ? 'Todas as apostas' :
               filter === 'pending' ? 'Apostas pendentes' : 'Apostas finalizadas'}
            </span>
          </div>
        </div>
      </div>

      {/* Bets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBets.map((bet) => (
          <div
            key={bet.id}
            className="bg-white rounded-lg shadow-sm p-4 border hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Header com data e resultado */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {format(new Date(bet.match.match_date), 'dd/MM/yyyy - HH:mm', { locale: ptBR })}
                </span>
              </div>
              <span className={`text-sm font-medium ${getResultColor(bet)}`}>
                {getResultText(bet)}
              </span>
            </div>

            {/* Conteúdo do jogo */}
            <div className="flex-grow">
              <div className="flex items-center justify-between space-x-2">
                <div className="text-center flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate mb-1">
                    {timesInfo[bet.match.home_team]?.nome || bet.match.home_team}
                  </div>
                  <div className="text-lg font-bold text-gray-700">
                    {bet.home_score}
                  </div>
                </div>

                <div className="text-center px-2">
                  <div className="text-xs text-gray-500 mb-1">VS</div>
                  <div className="text-xs text-gray-500 font-medium">
                    {(bet.match.status === 'finished' || bet.match.status === 'live') && bet.match.home_score !== null
                      ? `${bet.match.home_score}-${bet.match.away_score}`
                      : 'Aguardando'
                    }
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate mb-1">
                    {timesInfo[bet.match.away_team]?.nome || bet.match.away_team}
                  </div>
                  <div className="text-lg font-bold text-gray-700">
                    {bet.away_score}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com pontos */}
            {(bet.match.status === 'finished' || bet.match.status === 'live') && bet.points !== null && (
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {bet.points}pts
                  </span>
                </div>
                {bet.is_exact && (
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Exato!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBets.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Nenhuma aposta encontrada
          </h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Você ainda não fez nenhuma aposta'
              : `Nenhuma aposta ${filter === 'pending' ? 'pendente' : 'finalizada'}`
            }
          </p>
        </div>
      )}
    </div>
  );
};