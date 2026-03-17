import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Globe, Ticket, Shield, ShoppingBag, Bell, Moon, Sun, User, History, LogOut, Menu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types/project';

interface HeaderProps {
  user: UserType | null;
  activeView: string;
  setActiveView: (view: any) => void;
  setSidebarOpen: (open: boolean) => void;
  notificacoesNaoLidas: number;
  setNotificacoesModalOpen: (open: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  openPagamentosModal: () => void;
  openProfileModal: () => void;
  handleLogout: () => void;
  setAuthModalOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeView,
  setActiveView,
  setSidebarOpen,
  notificacoesNaoLidas,
  setNotificacoesModalOpen,
  theme,
  setTheme,
  openPagamentosModal,
  openProfileModal,
  handleLogout,
  setAuthModalOpen
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b dark:border-gray-800/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo Premium */}
          <div 
            className="relative w-14 h-14 flex items-center justify-center cursor-pointer transition-transform duration-200"
            onClick={() => setActiveView('public')}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-deep-800 to-purple-900/80 shadow-lg backdrop-blur-sm"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-white font-bold text-2xl leading-none">A</span>
              <span className="text-white/90 text-xs tracking-wider font-light">ldeias</span>
            </div>
          </div>
          
          <div className="cursor-pointer" onClick={() => setActiveView('public')}>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">Aldeias Games</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Jogos de aldeias do mundo</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-3">
          <Button
            variant={activeView === 'public' ? 'default' : 'ghost'}
            onClick={() => setActiveView('public')}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            <Globe className="h-5 w-5 mr-2" />
            Jogos
          </Button>
          <Button
            variant={activeView === 'my-games' ? 'default' : 'ghost'}
            onClick={() => setActiveView('my-games')}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            <Ticket className="h-5 w-5 mr-2" />
            Meus Jogos
          </Button>
          {user && ['super_admin', 'aldeia_admin'].includes(user.role) && (
            <Button
              variant={activeView === 'admin' ? 'default' : 'ghost'}
              onClick={() => setActiveView('admin')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin
            </Button>
          )}
          {user?.role === 'vendedor' && (
            <Button
              variant={activeView === 'vendedor' ? 'default' : 'ghost'}
              onClick={() => setActiveView('vendedor')}
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Vendas
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <Sun className="h-6 w-6 text-yellow-400" />
            ) : (
              <Moon className="h-6 w-6 text-gray-600" />
            )}
          </Button>

          {user ? (
            <>
              {/* Notifications with glassmorphism */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-lg transition-all duration-200 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                  onClick={() => setNotificacoesModalOpen(true)}
                >
                  <Bell className="h-6 w-6 text-gray-600 group-hover:text-gray-900" />
                  {notificacoesNaoLidas > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full shadow-lg animate-pulse">
                      {notificacoesNaoLidas > 99 ? '99+' : notificacoesNaoLidas}
                    </span>
                  )}
                </Button>
              </div>

              {/* History */}
              <Button
                variant="ghost"
                size="icon"
                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={openPagamentosModal}
                title="Histórico de Pagamentos"
              >
                <History className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Button>

              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={openProfileModal}
                title="Perfil"
              >
                <User className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Button>

              {/* Logout */}
              <Button
                variant="ghost"
                size="icon"
                className="p-2 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <Button onClick={() => setAuthModalOpen(true)} className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg">
              <User className="h-5 w-5 mr-2" />
              <span>Entrar</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-600 hover:text-gray-900" />
          </Button>
        </div>
      </div>
    </header>
  );
};
