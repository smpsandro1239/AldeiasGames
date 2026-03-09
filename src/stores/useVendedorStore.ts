/**
 * useVendedorStore.ts
 * Zustand store para Vendedor Dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Venda {
  id: string;
  campanhaId: string;
  campanha: string;
  quantidade: number;
  valor: number;
  comissao: number;
  timestamp: string;
}

interface VendedorState {
  // Data
  vendas: Venda[];
  
  // UI
  activeTab: string;
  
  // Computed
  vendasHoje: () => number;
  comissaoHoje: () => number;
  
  // Actions
  setActiveTab: (tab: string) => void;
  addVenda: (venda: Venda) => void;
}

export const useVendedorStore = create<VendedorState>()(
  persist(
    (set, get) => ({
      vendas: [],
      activeTab: 'venda',

      setActiveTab: (tab) => set({ activeTab: tab }),
      
      addVenda: (venda) => set({ vendas: [venda, ...get().vendas] }),
      
      vendasHoje: () => {
        const hoje = new Date().toDateString();
        return get().vendas
          .filter(v => new Date(v.timestamp).toDateString() === hoje)
          .reduce((sum, v) => sum + v.valor, 0);
      },
      
      comissaoHoje: () => {
        const hoje = new Date().toDateString();
        return get().vendas
          .filter(v => new Date(v.timestamp).toDateString() === hoje)
          .reduce((sum, v) => sum + v.comissao, 0);
      },
    }),
    {
      name: 'vendedor-storage',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
