import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Calendar, BarChart3, Users } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-green-800">
          AnalfaBet
        </h1>
        <p className="text-xl text-green-700 max-w-2xl mx-auto">
          Aposte nos placares do Brasileirão com seus amigos e descubra quem tem o melhor palpite!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/matches">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Calendar className="mr-2 h-5 w-5" />
              Ver Jogos
            </Button>
          </Link>
          <Link to="/bets">
            <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Target className="mr-2 h-5 w-5" />
              Minhas Apostas
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Target className="h-5 w-5" />
              <span>Sistema de Pontos</span>
            </CardTitle>
            <CardDescription>
              Ganhe 3 pontos por placar exato e 1 ponto por resultado correto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Acerte o placar exato (ex: 2x1 = 2x1) e ganhe 3 pontos. 
              Acerte apenas o resultado (ex: apostou 2x1, saiu 3x2) e ganhe 1 ponto.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <BarChart3 className="h-5 w-5" />
              <span>Ranking Dinâmico</span>
            </CardTitle>
            <CardDescription>
              Acompanhe sua posição em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Classificação por pontos totais, com desempate por maior número de placares exatos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Users className="h-5 w-5" />
              <span>Disputa Entre Amigos</span>
            </CardTitle>
            <CardDescription>
              Compete com sua galera no Brasileirão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Crie seu perfil, faça suas apostas e veja quem conhece mais de futebol!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4 text-center">
          Como Funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Pontos por placar exato</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600">Ponto por resultado correto</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">38</div>
            <div className="text-sm text-gray-600">Rodadas do Brasileirão</div>
          </div>
        </div>
      </div>
    </div>
  );
}
