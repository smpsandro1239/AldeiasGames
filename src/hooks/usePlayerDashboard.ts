/**
 * usePlayerDashboard.ts
 * Zustand store para o Dashboard do Jogador
 */

import { create } from 'zustand';

interface Campanha {
  id: string;
  titulo: string;
  tipo: 'raspadinha' | 'poio_vaca' | 'rifa';
  preco: number;
  premioPrincipal: string;
  participantes: number;
  imagem?: string;
  simbolos?: string[];
}

interface Premio {
  id: string;
  nome: string;
  valor: number;
  data: string;
  campanha: string;
  icon: string;
}

interface PlayerStats {
  totalGanho: number;
  raspadinhasGanhas: number;
  ranking: number;
}

interface PlayerDashboardState {
  // Stats
  stats: PlayerStats;
  setStats: (stats: PlayerStats) => void;
  
  // Campanhas ativas
  campanhas: Campanha[];
  setCampanhas: (campanhas: Campanha[]) => void;
  
  // Prémios ganhos
  premios: Premio[];
  setPremios: (premios: Premio[]) => void;
  
  // UI State
  activeTab: 'jogar' | 'tickets' | 'premios' | 'perfil';
  setActiveTab: (tab: 'jogar' | 'tickets' | 'premios' | 'perfil') => void;
  
  // Selected campanha
  selectedCampanha: Campanha | null;
  setSelectedCampanha: (campanha: Campanha | null) => void;
  
  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Actions
  fetchDashboard: () => Promise<void>;
}

// Mock data
const mockCampanhas: Campanha[] = [
  { 
    id: '1', 
    titulo: 'Raspadinha São João', 
    tipo: 'raspadinha', 
    preco: 2.50, 
    premioPrincipal: '500€', 
    participantes: 1250,
    simbolos: ['⭐', '💰', '🎁']
  },
  { 
    id: '2', 
    titulo: 'Raspadinha Carnaval', 
    tipo: 'raspadinha', 
    preco: 2.00, 
    premioPrincipal: '250€', 
    participantes: 2340,
    simbolos: ['🎭', '🎪', '🎉']
  },
  { 
    id: '3', 
    titulo: 'Poio da Vaca Premium', 
    tipo: 'poio_vaca', 
    preco: 5.00, 
    premioPrincipal: '1000€', 
    participantes: 450,
    simbolos: ['🐄', '🏆', '💶']
  },
];

const mockPremios: Premio[] = [
  { id: '1', nome: '10€ Consolação', valor: 10, data: '2024-06-15', campanha: 'Raspadinha São João', icon: '🎁' },
  { id: '2', nome: '25€ Sorte', valor: 25, data: '2024-06-10', campanha: 'Raspadinha Carnaval', icon: '🎀' },
  { id: '3', nome: '5€ Consolação', valor: 5, data: '2024-05-20', campanha: 'Poio da Vaca', icon: '🎁' },
];

export const usePlayerDashboard = create<PlayerDashboardState>((set) => ({
  // Initial state
  stats: {
    totalGanho: 156,
    raspadinhasGanhas: 7,
    ranking: 23,
  },
  campanhas: mockCampanhas,
  premios: mockPremios,
  activeTab: 'jogar',
  selectedCampanha: null,
  loading: false,
  
  // Actions
  setStats: (stats) => set({ stats }),
  setCampanhas: (campanhas) => set({ campanhas }),
  setPremios: (premios) => set({ premios }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedCampanha: (selectedCampanha) => set({ selectedCampanha }),
  setLoading: (loading) => set({ loading }),
  
  fetchDashboard: async () => {
    set({ loading: true });
    // Simular chamada API
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      campanhas: mockCampanhas,
      premios: mockPremios,
      loading: false 
    });
  },
}));
