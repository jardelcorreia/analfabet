import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Clock } from 'lucide-react';
import { useBets } from '@/hooks/useBets';
import { BetForm } from '@/components/BetForm';

export function BetsPage() {
  const { bets, loading, error } = useBets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'LIVE': return 'bg-green-100 text-green-800';
      case 'FINISHED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Agendado';
      case 'LIVE': return 'Ao Vivo';
      case 'FINISHED': return 'Finalizado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Minhas Apostas</h1>
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
        <h1 className="text-3xl font-bold text-green-800">Minhas Apostas</h1>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Erro ao carregar apostas: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Minhas Apostas</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Target className="h-4 w-4" />
          <span>{bets.length} apostas realizadas</span>
        </div>
      </div>

      <BetForm />

      {bets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma aposta realizada ainda</p>
            <p className="text-sm text-gray-500">Faça sua primeira aposta usando o formulário acima!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bets.map((bet) => (
            <Card key={bet.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {bet.home_team} vs {bet.away_team}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(bet.status)}>
                      {getStatusText(bet.status)}
                    </Badge>
                    {bet.points > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        <Trophy className="h-3 w-3 mr-1" />
                        {bet.points} pts
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(bet.match_date)}</span>
                  <span className="text-sm">• Rodada {bet.round_number}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Minha Aposta</div>
                    <div className="text-xl font-bold text-blue-700">
                      {bet.home_score_bet} x {bet.away_score_bet}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Resultado</div>
                    {bet.status === 'FINISHED' && bet.home_score !== null && bet.away_score !== null ? (
                      <div className="text-xl font-bold text-green-700">
                        {bet.home_score} x {bet.away_score}
                      </div>
                    ) : (
                      <div className="text-gray-400">-</div>
                    )}
                  </div>
                </div>
                
                {bet.status === 'FINISHED' && bet.points > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-sm font-medium text-green-800">
                      {bet.is_exact_score ? (
                        <>🎯 Placar Exato! +{bet.points} pontos</>
                      ) : (
                        <>✅ Resultado Correto! +{bet.points} ponto</>
                      )}
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
