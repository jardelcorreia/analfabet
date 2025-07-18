import React, { useState } from 'react';
import { User, Lock, Mail, Trophy, AtSign } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (identifier: string, password: string, rememberMe: boolean) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<void>;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSignIn, onSignUp }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailFormat = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const isValidUsername = (username: string): boolean => {
    return username.length >= 2 && !username.includes('@') && !username.includes(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        if (!identifier.trim()) {
          setError('Email ou nome de usuário é obrigatório');
          return;
        }

        if (isEmailFormat(identifier) && !isEmailFormat(identifier)) {
          setError('Formato de email inválido');
          return;
        }

        if (!isEmailFormat(identifier) && !isValidUsername(identifier)) {
          setError('Nome de usuário deve ter pelo menos 2 caracteres e não conter @ ou espaços');
          return;
        }

        await onSignIn(identifier.trim(), password, rememberMe);
      } else {
        if (!email.trim()) {
          setError('Email é obrigatório');
          return;
        }

        if (!isEmailFormat(email)) {
          setError('Formato de email inválido');
          return;
        }

        if (!name.trim()) {
          setError('Nome é obrigatório');
          return;
        }

        if (!isValidUsername(name)) {
          setError('Nome de usuário deve ter pelo menos 2 caracteres e não conter @ ou espaços');
          return;
        }

        if (password.length < 6) {
          setError('Senha deve ter pelo menos 6 caracteres');
          return;
        }

        await onSignUp(email.trim(), password, name.trim());
      }
      
      const { setRememberMe: setRememberMeStorage } = await import('../../lib/storage');
      setRememberMeStorage(rememberMe);
    } catch (err: any) {
      console.error("AuthForm caught error:", err);
      let displayMessage = 'Erro desconhecido.';
      if (typeof err === 'string') {
        displayMessage = err;
      } else if (err && typeof err === 'object' && typeof (err as Error).message === 'string') {
        displayMessage = (err as Error).message;
      }
      setError(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setError(null);
    setIdentifier('');
    setEmail('');
    setName('');
    setPassword('');
  };

  const getLoginIcon = () => {
    if (!identifier) return AtSign;
    return isEmailFormat(identifier) ? Mail : User;
  };

  const LoginIcon = getLoginIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-sm sm:max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mr-2" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">AnalfaBet</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {isLogin ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ou Nome de Usuário
              </label>
              <div className="relative">
                <LoginIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="seu@email.com ou seu_nome"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Você pode usar seu email ou nome de usuário para entrar
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="seu_nome"
                    required
                    minLength={2}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 2 caracteres, sem @ ou espaços
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Sua senha"
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Manter-me conectado
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-3.5 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleModeSwitch}
            className="text-green-600 hover:text-green-700 font-medium transition-colors text-sm sm:text-base hover:underline"
          >
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
