/**
 * app/(dashboard)/jogador/page.tsx
 * Página do Dashboard do Jogador - Versão AAA Festiva
 */

import { PlayerDashboard } from '@/components/dashboard/jogador/PlayerDashboard';
import { redirect } from 'next/navigation';

export default function JogadorDashboardPage() {
  // Em produção, isto seria verificado via middleware
  // Por agora, redireciona se não tiver role de jogador
  // redirect('/');
  
  return (
    <PlayerDashboard 
      onLogout={() => {
        // Limpar dados e redirecionar
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/';
        }
      }}
      onPlayGame={(campanhaId) => {
        console.log('Jogar campanha:', campanhaId);
        // Aqui seria a lógica para abrir o jogo
      }}
    />
  );
}
