import React, { useState, useMemo } from 'react';
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
  const [selectedRound, setSelectedRound] = useState<number | undefined>(1);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const { bets, loading } = useLeagueBets(league.id, selectedRound);

  const betsByPlayer = useMemo(() => {
    const now = new Date();
    return bets
      .filter(bet => new Date(bet.match.match_date) <= now)
      .reduce((acc, bet) => {
        const player = bet.user;
        if (!acc[player.id]) {
          acc[player.id] = {
            player,
            bets: [],
          };
        }
        acc[player.id].bets.push(bet);
        return acc;
      }, {} as Record<string, { player: any; bets: Bet[] }>);
  }, [bets]);

  const togglePlayerExpansion = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const getResultColor = (bet: Bet) => {
    if (bet.match.status !== 'finished') return 'text-gray-500';
    if (bet.is_exact) return 'text-green-600';
    if (bet.points && bet.points > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const getResultBadge = (bet: Bet) => {
    if (bet.match.status !== 'finished') return { text: 'P', color: 'bg-gray-100 text-gray-600' };
    if (bet.is_exact) return { text: 'E', color: 'bg-green-100 text-green-700' };
    if (bet.points && bet.points > 0) return { text: 'C', color: 'bg-blue-100 text-blue-700' };
    return { text: 'X', color: 'bg-red-100 text-red-700' };
  };

  const getPlayerStats = (bets: Bet[]) => {
    const finished = bets.filter(bet => bet.match.status === 'finished');
    const exact = finished.filter(bet => bet.is_exact).length;
    const correct = finished.filter(bet => bet.points && bet.points > 0 && !bet.is_exact).length;
    const total = finished.length;
    const points = finished.reduce((sum, bet) => sum + (bet.points || 0), 0);

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

      {/* Lista Compacta de Jogadores */}
      <div className="space-y-2">
        {Object.values(betsByPlayer).map(({ player, bets }) => {
          const isExpanded = expandedPlayers.has(player.id);
          const stats = getPlayerStats(bets);

          return (
            <div key={player.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header do Jogador - Sempre Visível */}
              <div
                className="px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => togglePlayerExpansion(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 truncate">{player.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 overflow-hidden">
                        <span className="flex-shrink-0">{bets.length} apostas</span>
                        {stats.total > 0 && (
                          <div className="flex items-center space-x-1 sm:space-x-2 overflow-hidden">
                            <span className="hidden sm:inline">•</span>
                            <span className="text-green-600 flex-shrink-0">{stats.exact}E</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-blue-600 flex-shrink-0">{stats.correct}C</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="font-medium flex-shrink-0">{stats.points}pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      {stats.total > 0 ? `${Math.round(((stats.exact + stats.correct) / stats.total) * 100)}%` : '-'}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Apostas do Jogador - Expansível */}
              {isExpanded && (
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                    {bets.map(bet => {
                      const badge = getResultBadge(bet);
                      return (
                        <div key={bet.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                          {/* Cabeçalho da Aposta - Mobile Otimizado */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1 min-w-0 flex-1">
                              <Calendar className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">
                                {format(new Date(bet.match.match_date), 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badge.color} flex-shrink-0 ml-2`}>
                              {badge.text}
                            </span>
                          </div>

                          {/* Detalhes da Partida - Layout Mobile Otimizado */}
                          <div className="space-y-1">
                            {/* Casa */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-800 truncate flex-1 pr-2 font-medium">
                                {timesInfo[bet.match.home_team]?.nome || bet.match.home_team}
                              </span>
                              <span className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 min-w-[24px] text-center">
                                {bet.home_score}
                              </span>
                            </div>

                            {/* Visitante */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-800 truncate flex-1 pr-2 font-medium">
                                {timesInfo[bet.match.away_team]?.nome || bet.match.away_team}
                              </span>
                              <span className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 min-w-[24px] text-center">
                                {bet.away_score}
                              </span>
                            </div>

                            {/* Resultado Real - Mobile Otimizado */}
                            {bet.match.status === 'finished' && bet.match.home_score !== null && (
                              <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span>Real: {bet.match.home_score}-{bet.match.away_score}</span>
                                  {bet.points !== null && (
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">{bet.points}pts</span>
                                      {bet.is_exact && <Target className="w-3 h-3 text-green-500" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {Object.keys(betsByPlayer).length === 0 && (
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
