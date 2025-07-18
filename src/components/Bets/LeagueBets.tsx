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
                className="px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => togglePlayerExpansion(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{player.name}</h3>
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <span>{bets.length} apostas</span>
                        {stats.total > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">{stats.exact} exatas</span>
                            <span>•</span>
                            <span className="text-blue-600">{stats.correct} certas</span>
                            <span>•</span>
                            <span className="font-medium">{stats.points}pts</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {stats.total > 0 ? `${Math.round(((stats.exact + stats.correct) / stats.total) * 100)}%` : '-'}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Apostas do Jogador - Expansível */}
              {isExpanded && (
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {bets.map(bet => {
                      const badge = getResultBadge(bet);
                      return (
                        <div key={bet.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          {/* Cabeçalho da Aposta */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {format(new Date(bet.match.match_date), 'dd/MM HH:mm', { locale: ptBR })}
                              </span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                              {badge.text}
                            </span>
                          </div>

                          {/* Detalhes da Partida */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="truncate flex-1 pr-2">
                                {timesInfo[bet.match.home_team]?.nome || bet.match.home_team}
                              </span>
                              <span className="font-bold text-gray-700">{bet.home_score}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="truncate flex-1 pr-2">
                                {timesInfo[bet.match.away_team]?.nome || bet.match.away_team}
                              </span>
                              <span className="font-bold text-gray-700">{bet.away_score}</span>
                            </div>

                            {/* Resultado Real */}
                            {bet.match.status === 'finished' && bet.match.home_score !== null && (
                              <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-200">
                                Real: {bet.match.home_score}-{bet.match.away_score}
                                {bet.points !== null && (
                                  <span className="ml-2 font-medium">
                                    {bet.points}pts
                                    {bet.is_exact && <Target className="w-3 h-3 inline ml-1 text-green-500" />}
                                  </span>
                                )}
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
