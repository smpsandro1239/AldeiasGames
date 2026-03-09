/**
 * useClienteStore.ts
 * Zustand store para Cliente Dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Premio {
  id: string;
  nome: string;
  valor: number;
  data: string;
  campanha: string;
  icon: string;
}

export interface Raspadinha {
  id: string;
  campanhaId: string;
  symbols: string[];
  resultado: 'pendente' | 'ganhou' | 'perdeu';
}

interface ClienteState {
  // Data
  raspadinhas: Raspadinha[];
  premios: Premio[];
  
  // UI
  activeTab: string;
  
  // Computed
  totalGasto: () => number;
  totalGanho: () => number;
  
  // Actions
  setActiveTab: (tab: string) => void;
  addRaspadinha: (raspadinha: Raspadinha) => void;
  addPremio: (premio: Premio) => void;
}

export const useClienteStore = create<ClienteState>()(
  persist(
    (set, get) => ({
      raspadinhas: [],
      premios: [],
      activeTab: 'explorar',

      setActiveTab: (tab) => set({ activeTab: tab }),
      
      addRaspadinha: (raspadinha) => set({ raspadinhas: [raspadinha, ...get().raspadinhas] }),
      
      addPremio: (premio) => set({ premios: [premio, ...get().premios] }),
      
      totalGasto: () => get().raspadinhas.length * 2.50, // Simplificado
      
      totalGanho: () => get().premios.reduce((sum, p) => sum + p.valor, 0),
    }),
    {
      name: 'cliente-storage',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
