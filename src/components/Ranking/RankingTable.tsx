import React, { useState, useEffect } from 'react';
import { Trophy, Search, Filter, Target, Crown, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useRanking } from '../../hooks/useRanking';
import { useAuth } from '../../hooks/useAuth';
import { Ranking } from '../../types';

interface RankingTableProps {
  leagueId: string | null;
  roundNumber: number | null;
}

export function RankingTable({ leagueId, roundNumber }: RankingTableProps) {
  // Hooks to fetch data and user information
  const { user } = useAuth();
  const { ranking: originalRanking, loading, error } = useRanking(leagueId, roundNumber);
  const currentUserId = user?.id;

  // State for UI interactions
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);

  // Effect to handle window resizing for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle expansion of a row to show more details
  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  // Helper to get a medal or a numbered icon for the rank
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">{position}</div>;
      case 2:
        return <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">{position}</div>;
      case 3:
        return <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">{position}</div>;
      default:
        return <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">{position}</div>;
    }
  };

  // Helper to style the current user's row differently
  const getRowClass = (userId: string) => {
    if (userId === currentUserId) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ring-1 ring-green-200 dark:ring-green-800';
    }
    return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';
  };

  // Helper to get a color-coded style for the accuracy percentage
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  // Filter ranking data based on search term and "Top 10" filter
  const filteredRanking = originalRanking
    ? originalRanking.filter(userStat => {
        const matchesSearch = userStat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (userStat.user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !showTopOnly || originalRanking.findIndex(u => u.user_id === userStat.user_id) < 10;
        return matchesSearch && matchesFilter;
      })
    : [];

  // Loading state UI
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 flex-col space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600 dark:text-gray-300">Carregando ranking...</span>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return <div className="text-center p-10 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">Erro ao carregar o ranking: {error}</div>;
  }
  
  // Empty state UI
  if (!originalRanking || originalRanking.length === 0) {
    return <div className="text-center p-10 text-gray-500 bg-gray-50 dark:bg-gray-800/20 rounded-lg">Nenhum dado de ranking disponível para esta rodada.</div>;
  }

  // --- SUB-COMPONENTS FOR MOBILE AND DESKTOP ROWS ---

  // Compact Row for Mobile View
  const MobileCompactRow = ({ userStat, position }: { userStat: Ranking; position: number }) => {
    const accuracy = userStat.total_bets > 0 ? ((userStat.correct_results / userStat.total_bets) * 100) : 0;

    return (
      <div className={`border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${getRowClass(userStat.user_id)}`}>
        <div className="px-4 py-3">
          {/* Main Row: Rank, Avatar, Name, Points */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getMedalIcon(position)}
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                {userStat.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{userStat.user.name}</span>
                  {userStat.user_id === currentUserId && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full flex-shrink-0">Você</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{userStat.user.email}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 rounded-full px-2 py-1 flex-shrink-0">
              <Trophy className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{userStat.total_points}</span>
            </div>
          </div>

          {/* Stats Row: Scores, Rounds Won, Accuracy, Expand Button */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1" title="Placares Exatos">
                <Target className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">{userStat.exact_scores}</span>
              </div>
              <div className="flex items-center space-x-1" title="Rodadas Vencidas">
                <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">{userStat.rounds_won || 0}</span>
              </div>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(accuracy)}`} title="Aproveitamento">
                {accuracy.toFixed(0)}%
              </div>
            </div>
            {userStat.rounds_won > 0 && (
              <button onClick={() => toggleRowExpansion(userStat.user_id)} className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors p-1">
                <span className="text-xs">Detalhes</span>
                {expandedRows.has(userStat.user_id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Expanded Details: List of rounds won */}
          {expandedRows.has(userStat.user_id) && userStat.rounds_won > 0 && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-2">Rodadas vencidas:</div>
              <div className="grid grid-cols-6 gap-1">
                {userStat.rounds_won_list?.slice(0, 12).map(round => (
                  <div key={round} className="flex items-center justify-center bg-purple-100 dark:bg-purple-800 rounded px-1 py-0.5">
                    <span className="text-xs font-medium text-purple-800 dark:text-purple-200">R{round}</span>
                  </div>
                ))}
                {userStat.rounds_won_list && userStat.rounds_won_list.length > 12 && (
                  <div className="flex items-center justify-center text-xs text-purple-600 dark:text-purple-400 col-span-2">
                    +{userStat.rounds_won_list.length - 12} mais
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Table Row for Desktop View
  const DesktopRow = ({ userStat, position }: { userStat: Ranking; position: number }) => {
    const accuracy = userStat.total_bets > 0 ? ((userStat.correct_results / userStat.total_bets) * 100) : 0;

    return (
      <React.Fragment key={userStat.user_id}>
        <tr className={`transition-all duration-200 ${getRowClass(userStat.user_id)}`}>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap"><div className="flex items-center">{getMedalIcon(position)}</div></td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                {userStat.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 sm:ml-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{userStat.user.name}</span>
                  {userStat.user_id === currentUserId && <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">Você</span>}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{userStat.user.email}</div>
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 rounded-full px-3 py-1">
                <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">{userStat.total_points}</span>
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 rounded-full px-3 py-1">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">{userStat.exact_scores}</span>
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center hidden lg:table-cell">
            <div className="flex items-center justify-center">
              <div className={`flex items-center space-x-1 bg-purple-100 dark:bg-purple-900 rounded-full px-3 py-1 transition-colors ${userStat.rounds_won > 0 ? 'cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800' : ''}`} onClick={() => userStat.rounds_won > 0 && toggleRowExpansion(userStat.user_id)}>
                <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">{userStat.rounds_won || 0}</span>
                {userStat.rounds_won > 0 && (expandedRows.has(userStat.user_id) ? <ChevronUp className="w-3 h-3 text-purple-600 dark:text-purple-400" /> : <ChevronDown className="w-3 h-3 text-purple-600 dark:text-purple-400" />)}
              </div>
            </div>
          </td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{userStat.total_bets}</span>
          </td>
          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccuracyColor(accuracy)}`}>{accuracy.toFixed(1)}%</span>
          </td>
        </tr>
        {expandedRows.has(userStat.user_id) && userStat.rounds_won > 0 && (
          <tr className="bg-purple-50/50 dark:bg-purple-900/20">
            <td colSpan={7} className="px-4 sm:px-6 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-800 dark:text-purple-200">Rodadas vencidas por {userStat.user.name}:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                  {userStat.rounds_won_list?.map(round => (
                    <div key={round} className="flex items-center justify-center bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 rounded-lg px-3 py-2 transition-colors cursor-pointer" title={`Rodada ${round}`}>
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">R{round}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                  <Info className="w-4 h-4" />
                  <span>Total: {userStat.rounds_won} rodada{userStat.rounds_won !== 1 ? 's' : ''} vencida{userStat.rounds_won !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  // --- MAIN RENDER ---

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header with Title and Controls */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6" />
              <span>Ranking de Jogadores</span>
            </h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar jogador..." className="pl-8 pr-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-40 md:w-48 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setShowTopOnly(!showTopOnly)} className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${showTopOnly ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                <Filter className="w-4 h-4" />
                <span className="hidden md:inline">Top 10</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-4 md:px-6 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {filteredRanking.length} de {originalRanking.length} jogadores
            {searchTerm && ` para "${searchTerm}"`}
            {showTopOnly && ' (Top 10)'}
          </p>
        </div>

        {/* Conditional Rendering: Mobile List or Desktop Table */}
        {isMobile ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRanking.map((userStat) => {
              const originalPosition = originalRanking.findIndex(u => u.user_id === userStat.user_id) + 1;
              return <MobileCompactRow key={userStat.user_id} userStat={userStat} position={originalPosition} />;
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Posição</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jogador</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pontos</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Placares Exatos</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">Rodadas Vencidas</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Apostas</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Aproveitamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRanking.map((userStat) => {
                  const originalPosition = originalRanking.findIndex(u => u.user_id === userStat.user_id) + 1;
                  return <DesktopRow key={userStat.user_id} userStat={userStat} position={originalPosition} />;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
