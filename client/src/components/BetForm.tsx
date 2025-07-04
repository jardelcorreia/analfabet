import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Save } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';

export function BetForm() {
  const { matches } = useMatches();
  const [selectedMatch, setSelectedMatch] = React.useState('');
  const [homeScore, setHomeScore] = React.useState('');
  const [awayScore, setAwayScore] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const availableMatches = matches.filter(match => match.status === 'SCHEDULED');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMatch || homeScore === '' || awayScore === '') {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting bet:', {
        matchId: selectedMatch,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore)
      });
      
      // TODO: Implement actual bet submission
      // Reset form
      setSelectedMatch('');
      setHomeScore('');
      setAwayScore('');
    } catch (error) {
      console.error('Error submitting bet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMatchLabel = (match: any) => {
    const date = new Date(match.match_date);
    return `${match.home_team} vs ${match.away_team} - ${date.toLocaleDateString('pt-BR')}`;
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-600" />
          <span>Nova Aposta</span>
        </CardTitle>
        <CardDescription>
          Faça sua aposta em um jogo do Brasileirão
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="match">Escolha o Jogo</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogo" />
              </SelectTrigger>
              <SelectContent>
                {availableMatches.map((match) => (
                  <SelectItem key={match.id} value={match.id.toString()}>
                    {getMatchLabel(match)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeScore">Placar Casa</Label>
              <Input
                id="homeScore"
                type="number"
                min="0"
                max="10"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="awayScore">Placar Visitante</Label>
              <Input
                id="awayScore"
                type="number"
                min="0"
                max="10"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {selectedMatch && homeScore !== '' && awayScore !== '' && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">
                Sua Aposta:
              </div>
              <div className="text-lg font-bold text-green-700">
                {homeScore} x {awayScore}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!selectedMatch || homeScore === '' || awayScore === '' || isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : 'Fazer Aposta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
