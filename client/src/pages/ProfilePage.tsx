import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Save } from 'lucide-react';

export function ProfilePage() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile:', { name, email });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Meu Perfil</h1>
      
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <span>Informações Pessoais</span>
          </CardTitle>
          <CardDescription>
            Gerencie suas informações de perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email"
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
          <CardDescription>
            Seu desempenho no AnalfaBet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-sm text-gray-600">Apostas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">0</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">0</div>
              <div className="text-sm text-gray-600">Placares Exatos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">-</div>
              <div className="text-sm text-gray-600">Posição</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>Sobre o AnalfaBet</CardTitle>
          <CardDescription>
            Como funciona o sistema de pontuação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <div className="font-semibold">Placar Exato</div>
                <div className="text-sm text-gray-600">
                  Quando você acerta o placar exato do jogo (ex: apostou 2x1, resultado foi 2x1)
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <div className="font-semibold">Resultado Correto</div>
                <div className="text-sm text-gray-600">
                  Quando você acerta o resultado mas não o placar (ex: apostou 2x1, resultado foi 3x2)
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                0
              </div>
              <div>
                <div className="font-semibold">Erro</div>
                <div className="text-sm text-gray-600">
                  Quando você não acerta nem o resultado nem o placar
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
