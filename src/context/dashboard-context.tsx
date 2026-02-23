import React, { createContext, useContext } from 'react';
import { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';

interface DashboardContextType {
  user: User | null;
  jogosPublicos: Jogo[];
  minhasParticipacoes: Participacao[];
  aldeias: Aldeia[];
  eventos: Evento[];
  jogosAdmin: Jogo[];
  vendasVendedor: Participacao[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ value: DashboardContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
