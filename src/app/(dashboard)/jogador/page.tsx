'use client';

/**
 * app/(dashboard)/jogador/page.tsx
 * Página do Dashboard do Jogador - Versão Premium App Store
 */

import { PlayerDashboard } from '@/components/dashboard/jogador/PlayerDashboard';

export default function JogadorDashboardPage() {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handlePlayGame = (campanhaId: string) => {
    console.log('Jogar campanha:', campanhaId);
  };

  return (
    <PlayerDashboard 
      onLogout={handleLogout}
      onPlayGame={handlePlayGame}
    />
  );
}