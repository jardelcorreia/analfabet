import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, Target, BarChart3, User } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Início', icon: Trophy },
    { path: '/matches', label: 'Jogos', icon: Calendar },
    { path: '/bets', label: 'Apostas', icon: Target },
    { path: '/rankings', label: 'Ranking', icon: BarChart3 },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold text-green-800">AnalfaBet</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
