/**
 * useSuperAdminStore.ts
 * Zustand store para Super Admin Dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TIPOS
// ============================================

export interface Aldeia {
  id: string;
  nome: string;
  tipoOrganizacao: string;
  localizacao: string;
  email: string;
  telefone: string;
  estado: 'pendente' | 'ativa' | 'suspensa';
  createdAt: string;
  usuariosAtivos: number;
  campanhasAtivas: number;
  receitaTotal: number;
}

export interface StatsGlobal {
  totalAldeias: number;
  aldeiasAtivas: number;
  totalUsuarios: number;
  totalCampanhas: number;
  campanhasAtivas: number;
  receitaTotal: number;
  receitaMes: number;
  usuariosNovosMes: number;
}

export interface AuditLog {
  id: string;
  acao: string;
  utilizador: string;
  entidade: string;
  entidadeId: string;
  timestamp: string;
  ip: string;
  detalhes?: string;
}

interface SuperAdminState {
  // Data
  aldeias: Aldeia[];
  stats: StatsGlobal | null;
  auditLogs: AuditLog[];
  
  // UI State
  activeTab: string;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setAldeias: (aldeias: Aldeia[]) => void;
  addAldeia: (aldeia: Aldeia) => void;
  updateAldeia: (id: string, updates: Partial<Aldeia>) => void;
  removeAldeia: (id: string) => void;
  setStats: (stats: StatsGlobal) => void;
  setAuditLogs: (logs: AuditLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async Actions
  fetchAldeias: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  createAldeia: (data: Partial<Aldeia>) => Promise<void>;
}

// ============================================
// STORE
// ============================================

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      // Initial State
      aldeias: [],
      stats: null,
      auditLogs: [],
      activeTab: 'dashboard',
      searchTerm: '',
      isLoading: false,
      error: null,

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      
      // Data Actions
      setAldeias: (aldeias) => set({ aldeias }),
      addAldeia: (aldeia) => set({ aldeias: [...get().aldeias, aldeia] }),
      updateAldeia: (id, updates) => set({
        aldeias: get().aldeias.map(a => a.id === id ? { ...a, ...updates } : a)
      }),
      removeAldeia: (id) => set({
        aldeias: get().aldeias.filter(a => a.id !== id)
      }),
      setStats: (stats) => set({ stats }),
      setAuditLogs: (logs) => set({ auditLogs: logs }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Async Actions
      fetchAldeias: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/aldeias');
          if (!response.ok) throw new Error('Erro ao carregar aldeias');
          const data = await response.json();
          set({ aldeias: data, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/stats/dashboard');
          if (!response.ok) throw new Error('Erro ao carregar estatísticas');
          const data = await response.json();
          set({ stats: data, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      fetchAuditLogs: async () => {
        try {
          const response = await fetch('/api/audit/logs');
          if (!response.ok) throw new Error('Erro ao carregar logs');
          const data = await response.json();
          set({ auditLogs: data });
        } catch (error) {
          console.error('Erro logs:', error);
        }
      },

      createAldeia: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/aldeias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!response.ok) throw new Error('Erro ao criar aldeia');
          const novaAldeia = await response.json();
          set({ aldeias: [...get().aldeias, novaAldeia], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'super-admin-storage',
      partialize: (state) => ({
        activeTab: state.activeTab,
        searchTerm: state.searchTerm,
      }),
    }
  )
);
