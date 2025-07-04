import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Clock } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

export function MatchesPage() {
  const { matches, loading, error, syncMatches } = useMatches();

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSyncMatches = async () => {
    try {
      await syncMatches();
    } catch (error) {
      console.error('Error syncing matches:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-800">Jogos do Brasileirão</h1>
        </div>
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-green-800">Jogos do Brasileirão</h1>
          <Button onClick={handleSyncMatches} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sincronizar
          </Button>
        </div>
        <Card className="border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Erro ao carregar jogos: {error}</p>
            <Button onClick={handleSyncMatches} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-800">Jogos do Brasileirão</h1>
        <Button onClick={handleSyncMatches} className="bg-green-600 hover:bg-green-700">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sincronizar
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Nenhum jogo encontrado</p>
            <Button onClick={handleSyncMatches} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar Jogos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <Card key={match.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {match.home_team} vs {match.away_team}
                  </CardTitle>
                  <Badge className={getStatusColor(match.status)}>
                    {getStatusText(match.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(match.match_date)}</span>
                  <span className="text-sm">• Rodada {match.round_number}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {match.status === 'FINISHED' && match.home_score !== null && match.away_score !== null ? (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {match.home_score} x {match.away_score}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Resultado Final</div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    {match.status === 'LIVE' ? 'Jogo em andamento' : 'Aguardando início'}
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
