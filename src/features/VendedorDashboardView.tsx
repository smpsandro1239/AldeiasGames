import React from 'react';
import {
  Plus,
  Users,
  TrendingUp,
  CreditCard,
  History,
  QrCode,
  Search
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';
import { StatCard } from '@/components/ui/stat-card';
import { soundEngine } from '@/lib/audio-utils';
import { User, DashboardStats, Evento, Jogo } from '@/types/project';

interface VendedorDashboardViewProps {
  user: User;
  stats: DashboardStats | null;
  eventos: Evento[];
  onParticipar: (jogo: Jogo) => void;
}

export function VendedorDashboardView({ user, stats, eventos, onParticipar }: VendedorDashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Terminal de Vendas</h1>
          <p className="text-gray-500">Vendedor: {user.nome}</p>
        </div>
        <div className="flex gap-2">
          <UIButton variant="secondary" icon={<History className="w-4 h-4" />}>
            Vendas Recentes
          </UIButton>
          <UIButton icon={<Plus className="w-4 h-4" />}>
            Nova Venda Direta
          </UIButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Vendas de Hoje" value={`€${stats?.vendasHoje || '0.00'}`} icon={TrendingUp} trend="+12%" />
        <StatCard title="Clientes Atendidos" value={stats?.clientesHoje || '0'} icon={Users} />
        <StatCard title="Comissão Acumulada" value={`€${stats?.comissao || '0.00'}`} icon={CreditCard} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UICard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Disponível para Venda</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Procurar jogo..." className="pl-10 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-sm w-48" />
            </div>
          </div>
          <div className="space-y-4">
            {eventos.map((ev) => (
              <div key={ev.id} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-wider">{ev.nome}</p>
                <div className="grid gap-2">
                  {ev.jogos?.map((j) => (
                    <div key={j.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-white hover:ring-2 hover:ring-indigo-500 transition-all group">
                      <div>
                        <p className="font-semibold text-sm">{j.titulo}</p>
                        <p className="text-xs text-gray-500">Preço: €{j.precoParticipacao.toFixed(2)}</p>
                      </div>
                      <UIButton size="sm" icon={<QrCode className="w-4 h-4" />} onClick={() => { soundEngine.playClick(); onParticipar(j); }}>Vender</UIButton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </UICard>
      </div>
    </div>
  );
}
