/**
 * useRaspadinhaConfig.ts
 * Zustand store para configuração da Raspadinha
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { debounce } from 'lodash';

// ============================================
// TIPOS
// ============================================

export interface NivelPremio {
  id: string;
  nome: string;
  valor: number;
  quantidade: number;
  percentual: number;
  simbolo: string;
}

export interface ConfigRaspadinha {
  // Passo 1: Dados Básicos
  titulo: string;
  eventoId: string;
  dataInicio: string;
  dataFim: string;
  totalRaspadinhas: number;
  precoPorRaspadinha: number;
  
  // Passo 2: Prémios
  premios: NivelPremio[];
  percentualSemPremio: number;
  
  // Campos calculados
  receitaTotal: number;
  custoPremios: number;
  taxas: number;
  lucroLiquido: number;
  margemLucro: number;
  rentavel: boolean;
}

interface RaspadinhaConfigState {
  config: ConfigRaspadinha;
  isDirty: boolean;
  lastSaved: Date | null;
  
  // Actions
  updateCampo: <K extends keyof ConfigRaspadinha>(campo: K, valor: ConfigRaspadinha[K]) => void;
  adicionarPremio: () => void;
  removerPremio: (id: string) => void;
  atualizarPremio: (id: string, updates: Partial<NivelPremio>) => void;
  ajustarAutomaticamente: () => void;
  restaurarPadrao: () => void;
  duplicarConfig: () => void;
  reset: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// ============================================
// ESTADO INICIAL
// ============================================

const estadoInicial: ConfigRaspadinha = {
  titulo: '',
  eventoId: '',
  dataInicio: '',
  dataFim: '',
  totalRaspadinhas: 1000,
  precoPorRaspadinha: 2.50,
  premios: [
    { id: '1', nome: '1º Prémio - Grande Sorte', valor: 500, quantidade: 10, percentual: 1, simbolo: '🏆' },
    { id: '2', nome: '2º Prémio - Consolação', valor: 50, quantidade: 40, percentual: 4, simbolo: '🎁' },
    { id: '3', nome: '3º Prémio - Pequeno', valor: 10, quantidade: 100, percentual: 10, simbolo: '🎀' },
  ],
  percentualSemPremio: 85,
  receitaTotal: 0,
  custoPremios: 0,
  taxas: 0,
  lucroLiquido: 0,
  margemLucro: 0,
  rentavel: false,
};

// ============================================
// HELPER: Calcular métricas
// ============================================

function calcularMetricas(config: ConfigRaspadinha): ConfigRaspadinha {
  const { totalRaspadinhas, precoPorRaspadinha, premios } = config;
  
  // Receita total
  const receitaTotal = totalRaspadinhas * precoPorRaspadinha;
  
  // Custo total dos prémios
  const custoPremios = premios.reduce((sum, p) => sum + (p.quantidade * p.valor), 0);
  
  // Taxas (Stripe 2.5% + plataforma 2.5% = 5%)
  const taxaPlataforma = 0.05;
  const taxas = receitaTotal * taxaPlataforma;
  
  // Lucro líquido
  const lucroLiquido = receitaTotal - custoPremios - taxas;
  
  // Margem de lucro
  const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;
  
  // É rentável?
  const rentavel = lucroLiquido > 0 && margemLucro > 20;
  
  return {
    ...config,
    receitaTotal,
    custoPremios,
    taxas,
    lucroLiquido,
    margemLucro,
    rentavel,
  };
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useRaspadinhaConfig = create<RaspadinhaConfigState>()(
  persist(
    (set, get) => ({
      config: estadoInicial,
      isDirty: false,
      lastSaved: null,

      updateCampo: (campo, valor) => {
        set((state) => {
          const novaConfig = { ...state.config, [campo]: valor };
          return {
            config: calcularMetricas(novaConfig),
            isDirty: true,
          };
        });
        // Auto-save com debounce
        debounce(() => get().saveToStorage(), 2000)();
      },

      adicionarPremio: () => {
        const novoId = Date.now().toString();
        set((state) => {
          const novosPremios = [
            ...state.config.premios,
            {
              id: novoId,
              nome: `${state.config.premios.length + 1}º Prémio`,
              valor: 0,
              quantidade: 0,
              percentual: 0,
              simbolo: '🎉',
            },
          ];
          return {
            config: { ...state.config, premios: novosPremios },
            isDirty: true,
          };
        });
      },

      removerPremio: (id) => {
        set((state) => {
          const novosPremios = state.config.premios.filter((p) => p.id !== id);
          // Recalcular percentualSemPremio
          const percentualPremios = novosPremios.reduce((sum, p) => sum + p.percentual, 0);
          return {
            config: calcularMetricas({
              ...state.config,
              premios: novosPremios,
              percentualSemPremio: Math.max(0, 100 - percentualPremios),
            }),
            isDirty: true,
          };
        });
      },

      atualizarPremio: (id, updates) => {
        set((state) => {
          const novosPremios = state.config.premios.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          
          // Se atualizou quantidade, recalcular percentual
          const premio = novosPremios.find((p) => p.id === id);
          if (premio && updates.quantidade !== undefined) {
            premio.percentual = (updates.quantidade / state.config.totalRaspadinhas) * 100;
          }
          
          // Recalcular Sem Prémio
          const percentualPremios = novosPremios.reduce((sum, p) => sum + p.percentual, 0);
          
          return {
            config: calcularMetricas({
              ...state.config,
              premios: novosPremios,
              percentualSemPremio: Math.max(0, 100 - percentualPremios),
            }),
            isDirty: true,
          };
        });
      },

      ajustarAutomaticamente: () => {
        set((state) => {
          const { totalRaspadinhas, premios } = state.config;
          const totalPercentualAtual = premios.reduce((sum, p) => sum + p.percentual, 0);
          const restante = Math.max(0, 100 - totalPercentualAtual);
          
          // Ajustar último prémio ou distribuir
          if (premios.length > 0) {
            const novosPremios = [...premios];
            const ultimo = novosPremios[novosPremios.length - 1];
            ultimo.percentual += restante;
            ultimo.quantidade = Math.round((ultimo.percentual / 100) * totalRaspadinhas);
            
            return {
              config: calcularMetricas({
                ...state.config,
                premios: novosPremios,
                percentualSemPremio: 0,
              }),
              isDirty: true,
            };
          }
          return state;
        });
      },

      restaurarPadrao: () => {
        set({
          config: calcularMetricas(estadoInicial),
          isDirty: false,
        });
      },

      duplicarConfig: () => {
        const { config } = get();
        set({
          config: calcularMetricas({
            ...config,
            titulo: `${config.titulo} (Cópia)`,
            dataInicio: '',
            dataFim: '',
          }),
          isDirty: true,
        });
      },

      reset: () => {
        set({
          config: calcularMetricas(estadoInicial),
          isDirty: false,
          lastSaved: null,
        });
      },

      saveToStorage: () => {
        const { config } = get();
        if (typeof window !== 'undefined') {
          localStorage.setItem('raspadinha-config', JSON.stringify(config));
          set({ isDirty: false, lastSaved: new Date() });
        }
      },

      loadFromStorage: () => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('raspadinha-config');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              set({
                config: calcularMetricas(parsed),
                lastSaved: new Date(),
              });
            } catch (e) {
              console.error('Erro ao carregar configuração:', e);
            }
          }
        }
      },
    }),
    {
      name: 'raspadinha-config-storage',
    }
  )
);
