import React from 'react';
import { Button } from '@/components/ui/card'; // Wait, Button is usually in components/ui/button
import { Button as UIButton } from '@/components/ui/button';
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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="cursor-pointer" onClick={() => setActiveView('public')}>
            <h1 className="font-bold text-lg">Aldeias Games</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Jogos de aldeias do mundo</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <UIButton
            variant={activeView === 'public' ? 'default' : 'ghost'}
            onClick={() => setActiveView('public')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            Jogos
          </UIButton>
          <UIButton
            variant={activeView === 'my-games' ? 'default' : 'ghost'}
            onClick={() => setActiveView('my-games')}
            className="gap-2"
          >
            <Ticket className="h-4 w-4" />
            Meus Jogos
          </UIButton>
          {user && ['super_admin', 'aldeia_admin'].includes(user.role) && (
            <UIButton
              variant={activeView === 'admin' ? 'default' : 'ghost'}
              onClick={() => setActiveView('admin')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Admin
            </UIButton>
          )}
          {user?.role === 'vendedor' && (
            <UIButton
              variant={activeView === 'vendedor' ? 'default' : 'ghost'}
              onClick={() => setActiveView('vendedor')}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Vendas
            </UIButton>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <UIButton
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </UIButton>

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <UIButton
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setNotificacoesModalOpen(true)}
                >
                  <Bell className="h-5 w-5" />
                  {notificacoesNaoLidas > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-pulse">
                      {notificacoesNaoLidas}
                    </Badge>
                  )}
                </UIButton>
              </div>

              {/* History */}
              <UIButton
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={openPagamentosModal}
                title="Histórico de Pagamentos"
              >
                <History className="h-5 w-5" />
              </UIButton>

              {/* Profile */}
              <UIButton
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={openProfileModal}
                title="Perfil"
              >
                <User className="h-5 w-5" />
              </UIButton>

              {/* Logout */}
              <UIButton
                variant="ghost"
                size="icon"
                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </UIButton>
            </>
          ) : (
            <UIButton onClick={() => setAuthModalOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
              <User className="h-4 w-4" />
              <span>Entrar</span>
            </UIButton>
          )}

          {/* Mobile Menu Toggle */}
          <UIButton
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </UIButton>
        </div>
      </div>
    </header>
  );
};
