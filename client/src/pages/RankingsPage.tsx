import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Target } from 'lucide-react';
import { useRankings } from '@/hooks/useRankings';

export function RankingsPage() {
  const { rankings, loading, error } = useRankings();

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-gray-600 font-bold">{position}º</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'border-yellow-200 bg-yellow-50';
      case 2: return 'border-gray-200 bg-gray-50';
      case 3: return 'border-amber-200 bg-amber-50';
      default: return 'border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Ranking</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Ranking</h1>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Erro ao carregar ranking: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Ranking</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Trophy className="h-4 w-4" />
          <span>{rankings.length} participantes</span>
        </div>
      </div>

      {rankings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Nenhum participante no ranking ainda</p>
            <p className="text-sm text-gray-500">Faça sua primeira aposta para aparecer aqui!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rankings.map((user, index) => (
            <Card key={user.user_id} className={`hover:shadow-lg transition-shadow ${getRankColor(index + 1)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRankIcon(index + 1)}
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>
                        {user.total_bets} apostas realizadas
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      {user.total_points}
                    </div>
                    <div className="text-sm text-gray-600">pontos</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Placares Exatos</div>
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-700">
                        {user.exact_scores}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Taxa de Acerto</div>
                    <div className="text-lg font-semibold text-blue-700">
                      {user.total_bets > 0 
                        ? Math.round((user.total_points / (user.total_bets * 3)) * 100) 
                        : 0}%
                    </div>
                  </div>
                </div>
                
                {user.exact_scores > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-sm font-medium text-green-800">
                      🎯 {user.exact_scores} placar{user.exact_scores > 1 ? 'es' : ''} exato{user.exact_scores > 1 ? 's' : ''}!
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
