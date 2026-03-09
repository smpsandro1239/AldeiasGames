/**
 * useAdminStore.ts
 * Zustand store para Admin Dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Campanha {
  id: string;
  titulo: string;
  tipo: 'raspadinha' | 'poio_vaca' | 'rifa';
  estado: 'ativa' | 'pausada' | 'concluida';
  preco: number;
  totalVendas: number;
  receita: number;
  participantes: number;
  premiosEntregues: number;
  dataInicio: string;
  dataFim?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  vendasHoje: number;
  vendasSemana: number;
  comissao: number;
  estado: 'ativo' | 'inativo';
}

export interface Premio {
  id: string;
  nome: string;
  valor: number;
  quantidade: number;
  entregue: number;
  estado: 'disponivel' | 'esgotado';
}

interface AdminState {
  // Data
  campanhas: Campanha[];
  vendedores: Vendedor[];
  premios: Premio[];
  
  // UI
  activeTab: string;
  isLoading: boolean;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setCampanhas: (campanhas: Campanha[]) => void;
  addCampanha: (campanha: Campanha) => void;
  updateCampanha: (id: string, updates: Partial<Campanha>) => void;
  removeCampanha: (id: string) => void;
  setVendedores: (vendedores: Vendedor[]) => void;
  addVendedor: (vendedor: Vendedor) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      campanhas: [],
      vendedores: [],
      premios: [],
      activeTab: 'dashboard',
      isLoading: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setCampanhas: (campanhas) => set({ campanhas }),
      addCampanha: (campanha) => set({ campanhas: [...get().campanhas, campanha] }),
      updateCampanha: (id, updates) => set({
        campanhas: get().campanhas.map(c => c.id === id ? { ...c, ...updates } : c)
      }),
      removeCampanha: (id) => set({
        campanhas: get().campanhas.filter(c => c.id !== id)
      }),
      
      setVendedores: (vendedores) => set({ vendedores }),
      addVendedor: (vendedor) => set({ vendedores: [...get().vendedores, vendedor] }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ activeTab: state.activeTab }),
    }
  )
);
