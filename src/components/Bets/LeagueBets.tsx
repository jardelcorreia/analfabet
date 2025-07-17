import React, { useState, useMemo } from 'react';
import { useLeagueBets } from '../../hooks/useLeagueBets';
import { RoundSelector } from '../Ranking/RoundSelector';
import { Bet, League } from '../../types';
import { timesInfo } from '../../lib/teams';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, Trophy, Target } from 'lucide-react';

interface LeagueBetsProps {
  league: League;
}

export const LeagueBets: React.FC<LeagueBetsProps> = ({ league }) => {
  const [selectedRound, setSelectedRound] = useState<number | undefined>(1);
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

  const getResultColor = (bet: Bet) => {
    if (bet.match.status !== 'finished') return 'text-gray-500';
    if (bet.is_exact) return 'text-green-600';
    if (bet.points && bet.points > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  const getResultText = (bet: Bet) => {
    if (bet.match.status !== 'finished') return 'Pendente';
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
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Apostas da Liga</h1>
            <p className="text-green-100 text-lg">{league?.name}</p>
          </div>
          <div className="w-full lg:w-auto">
            <RoundSelector
              selectedRound={selectedRound}
              onRoundChange={setSelectedRound}
              totalRounds={38}
              variant="onGradient"
            />
          </div>
        </div>

        {/* Mobile round indicator */}
        <div className="mt-4 lg:hidden">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
            <span className="text-sm text-green-100">
              {selectedRound ? `Visualizando rodada ${selectedRound}` : 'Visualizando todas as rodadas'}
            </span>
          </div>
        </div>
      </div>

      {/* Players and Bets */}
      <div className="space-y-6">
        {Object.values(betsByPlayer).map(({ player, bets }) => (
          <div key={player.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Player Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{player.name}</h2>
                    <p className="text-sm text-gray-600">{bets.length} aposta{bets.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Player Bets */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bets.map(bet => (
                  <div key={bet.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    {/* Match Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(bet.match.match_date), 'dd/MM - HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        bet.match.status === 'finished'
                          ? bet.is_exact
                            ? 'bg-green-100 text-green-800'
                            : bet.points && bet.points > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getResultText(bet)}
                      </span>
                    </div>

                    {/* Match Details */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="text-center flex-1">
                        <div className="text-sm font-medium text-gray-800 truncate mb-1">
                          {timesInfo[bet.match.home_team]?.nome || bet.match.home_team}
                        </div>
                        <div className="text-lg font-bold text-gray-700">{bet.home_score}</div>
                      </div>

                      <div className="text-center px-2">
                        <div className="text-xs text-gray-500 mb-1">VS</div>
                        <div className="text-xs text-gray-500 font-medium">
                          {bet.match.status === 'finished' && bet.match.home_score !== null
                            ? `${bet.match.home_score}-${bet.match.away_score}`
                            : 'Aguardando'
                          }
                        </div>
                      </div>

                      <div className="text-center flex-1">
                        <div className="text-sm font-medium text-gray-800 truncate mb-1">
                          {timesInfo[bet.match.away_team]?.nome || bet.match.away_team}
                        </div>
                        <div className="text-lg font-bold text-gray-700">{bet.away_score}</div>
                      </div>
                    </div>

                    {/* Points Footer */}
                    {bet.match.status === 'finished' && bet.points !== null && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{bet.points}pts</span>
                        </div>
                        {bet.is_exact && (
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">Exato!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(betsByPlayer).length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhuma aposta para exibir
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
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
