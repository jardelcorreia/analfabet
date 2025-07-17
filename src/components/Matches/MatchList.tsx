import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { League, Match, Bet } from '../../types';
import { MatchCard } from './MatchCard';
import { useMatches } from '../../hooks/useMatches';
import { dbHelpers } from '../../lib/database';

interface MatchListProps {
  league: League;
  userId: string;
}

export const MatchList: React.FC<MatchListProps> = ({ league, userId }) => {
  // selectedRound is what the user picks, or undefined for the server's default.
  // It's passed as the `round` prop to useMatches.
  const [selectedRound, setSelectedRound] = useState<number | undefined>();
  const [userBets, setUserBets] = useState<Bet[]>([]);

  // useMatches now returns `displayedRound` which is the actual round data is for.
  const { matches, loading, error, displayedRound, refreshMatches } = useMatches(selectedRound);

  // Effect to sync the dropdown's selectedRound with the displayedRound from the hook,
  // especially when the server determines the default round.
  React.useEffect(() => {
    // If displayedRound is defined (meaning data has loaded for a specific round,
    // either user-selected or server-default) and it's different from what the
    // user might have selected (or if selectedRound is undefined meaning we want default),
    // update selectedRound to match.
    // This ensures the dropdown accurately reflects the data being shown.
    // Only update if selectedRound is not already matching displayedRound to avoid loops if user selects.
    if (displayedRound !== undefined && selectedRound !== displayedRound) {
        // However, if selectedRound was intentionally set to `undefined` by the user
        // (e.g. choosing "Todas as rodadas"), and the server returns a specific default round,
        // we DO want to update selectedRound to that default.
        // This logic needs to be careful to not override user's explicit selection of "Todas as rodadas"
        // if that's a desired state that means "let server decide" vs "show nothing specific".
        // For now, let's assume if `selectedRound` is undefined, we want it to take server's default.
        // If `selectedRound` has a value, it means user picked it, so `useMatches` used it.
        // The `displayedRound` from server should match `selectedRound` if `selectedRound` was provided.
        // The main case this handles is initial load where `selectedRound` is undefined.
        if (selectedRound === undefined) {
             setSelectedRound(displayedRound);
        }
    }
  }, [displayedRound, selectedRound]);

  React.useEffect(() => {
    const fetchUserBets = async () => {
      if (!league.id) return;

      try {
        const data = await dbHelpers.getUserBets(userId, league.id);
        setUserBets(data);
      } catch (error) {
        console.error('Error fetching user bets:', error);
      }
    };

    fetchUserBets();
  }, [league.id, userId]);

  const placeBet = async (match: Match, homeScore: number, awayScore: number) => {
    const existingBet = userBets.find(bet => bet.match_id === match.id);

    try {
      // Use server-side betting endpoint for validation
      const token = localStorage.getItem('analfa_bet_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/.netlify/functions/place-bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId: match.id,
          leagueId: league.id,
          homeScore,
          awayScore,
          betId: existingBet?.id
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 403 && responseData.error === 'Betting deadline exceeded') {
          throw new Error(`Prazo para apostas encerrado: ${responseData.reason}`);
        }
        throw new Error(responseData.error || 'Erro ao processar aposta');
      }

      // Update local state with the returned bet
      if (existingBet) {
        setUserBets(prev => prev.map(bet => 
          bet.id === existingBet.id 
            ? { ...bet, home_score: homeScore, away_score: awayScore }
            : bet
        ));
      } else {
        setUserBets(prev => [...prev, responseData.bet]);
      }
      
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  };

  const rounds = Array.from({ length: 38 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 text-sm sm:text-base">Erro ao carregar jogos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with improved mobile layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Jogos</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
          <select
            value={selectedRound || ''}
            onChange={(e) => setSelectedRound(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 min-w-0 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas as rodadas</option>
            {rounds.map(round => (
              <option key={round} value={round}>
                {round}ª Rodada
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive grid with improved mobile layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {matches.map((match) => {
          const userBet = userBets.find(bet => bet.match_id === match.id);
          
          return (
            <MatchCard
              key={match.id}
              match={match}
              userBet={userBet}
              onPlaceBet={(homeScore, awayScore) => placeBet(match, homeScore, awayScore)}
              canBet={true}
            />
          );
        })}
      </div>

      {/* Empty state with responsive design */}
      {matches.length === 0 && (
        <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg mx-4 sm:mx-0">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
            Nenhum jogo encontrado
          </h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">
            {selectedRound ? `Não há jogos para a ${selectedRound}ª rodada` : 'Não há jogos disponíveis'}
          </p>
        </div>
      )}
    </div>
  );
};