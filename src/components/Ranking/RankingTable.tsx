import React from 'react';
import { Trophy, Target, BarChart3, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { UserStats } from '../../types';
import { RoundSelector } from './RoundSelector';

interface RankingTableProps {
  ranking: UserStats[];
  currentUserId?: string;
  selectedRound: number | undefined;
  onRoundChange: (round: number | undefined) => void;
  totalRounds: number;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  ranking,
  currentUserId,
  selectedRound,
  onRoundChange,
  totalRounds,
}) => {
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-md">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
            <span className="text-sm font-bold text-gray-600">{position}</span>
          </div>
        );
    }
  };

  const getRowClass = (userId: string, position: number) => {
    const isCurrentUser = userId === currentUserId;
    const isTopThree = position <= 3;

    if (isCurrentUser) {
      return 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 shadow-sm';
    }

    if (isTopThree) {
      return 'bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200';
    }

    return 'bg-white hover:bg-gray-50 transition-all duration-200';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600 bg-green-100';
    if (accuracy >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
    if (position === 3) return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Ranking da Liga</h2>
              <p className="text-blue-100 text-sm">Classificação dos jogadores</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <RoundSelector
                selectedRound={selectedRound}
                onRoundChange={onRoundChange}
                totalRounds={totalRounds}
              />
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-white/80">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">{ranking.length} jogadores</span>
            </div>
          </div>
        </div>
      </div>
      <div className="sm:hidden p-4 bg-gray-100">
        <RoundSelector
          selectedRound={selectedRound}
          onRoundChange={onRoundChange}
          totalRounds={totalRounds}
        />
      </div>

      {/* Top 3 Podium - Mobile and Desktop */}
      {ranking.length >= 3 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:px-6">
          <div className="flex justify-center items-end space-x-4 sm:space-x-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="text-lg sm:text-xl font-bold text-white">
                  {ranking[1]?.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm sm:text-base text-gray-800">{ranking[1]?.user.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{ranking[1]?.total_points} pts</p>
              </div>
              <div className="w-12 h-8 sm:w-16 sm:h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-2 shadow-xl relative">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {ranking[0]?.user.name.charAt(0).toUpperCase()}
                </span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-bold text-base sm:text-lg text-gray-800">{ranking[0]?.user.name}</p>
                <p className="text-sm sm:text-base text-gray-600">{ranking[0]?.total_points} pts</p>
              </div>
              <div className="w-16 h-12 sm:w-20 sm:h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                <span className="text-lg sm:text-xl font-bold text-white">
                  {ranking[2]?.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm sm:text-base text-gray-800">{ranking[2]?.user.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{ranking[2]?.total_points} pts</p>
              </div>
              <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jogador
              </th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pontos
              </th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Placares Exatos
              </th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Apostas
              </th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Aproveitamento
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ranking.map((userStat, index) => {
              const position = index + 1;
              const accuracy = userStat.total_bets > 0 
                ? ((userStat.correct_results / userStat.total_bets) * 100)
                : 0;

              return (
                <tr
                  key={userStat.user_id}
                  className={`border transition-all duration-200 ${getRowClass(userStat.user_id, position)}`}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getMedalIcon(position)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {userStat.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {userStat.user.name}
                          </span>
                          {userStat.user_id === currentUserId && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 hidden sm:block">
                          {userStat.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1 bg-yellow-100 rounded-full px-3 py-1">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-bold text-yellow-800">
                          {userStat.total_points}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1 bg-green-100 rounded-full px-3 py-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {userStat.exact_scores}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                    <span className="text-sm font-medium text-gray-900">
                      {userStat.total_bets}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(accuracy)}`}>
                      {accuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {ranking.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum ranking disponível
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Faça suas apostas para aparecer no ranking e competir com outros jogadores!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};