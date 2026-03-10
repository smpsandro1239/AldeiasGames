/**
 * app/(dashboard)/jogador/page.tsx
 * Página do Dashboard do Jogador - Versão Premium App Store
 */

import { PlayerDashboard } from '@/components/dashboard/jogador/PlayerDashboard';

export default function JogadorDashboardPage() {
  return (
    <PlayerDashboard 
      onLogout={() => {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/';
        }
      }}
      onPlayGame={(campanhaId) => {
        console.log('Jogar campanha:', campanhaId);
      }}
    />
  );
}