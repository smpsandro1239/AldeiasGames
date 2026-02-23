import { create } from 'zustand';
import { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';

interface ProjectState {
  user: User | null;
  setUser: (user: User | null) => void;
  jogosPublicos: Jogo[];
  setJogosPublicos: (jogos: Jogo[]) => void;
  minhasParticipacoes: Participacao[];
  setMinhasParticipacoes: (participacoes: Participacao[]) => void;
  aldeias: Aldeia[];
  setAldeias: (aldeias: Aldeia[]) => void;
  eventos: Evento[];
  setEventos: (eventos: Evento[]) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  jogosPublicos: [],
  setJogosPublicos: (jogosPublicos) => set({ jogosPublicos }),
  minhasParticipacoes: [],
  setMinhasParticipacoes: (minhasParticipacoes) => set({ minhasParticipacoes }),
  aldeias: [],
  setAldeias: (aldeias) => set({ aldeias }),
  eventos: [],
  setEventos: (eventos) => set({ eventos }),
}));
