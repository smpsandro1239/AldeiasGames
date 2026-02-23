import React from 'react';
import {
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Settings,
  Download
} from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';
import { StatCard } from '@/components/ui/stat-card';
import { User, DashboardStats, Evento } from '@/types/project';

interface OrganizacaoDashboardViewProps {
  user: User;
  stats: DashboardStats | null;
  eventos: Evento[];
  onCreateEvento: () => void;
}

export function OrganizacaoDashboardView({ user, stats, eventos, onCreateEvento }: OrganizacaoDashboardViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel da Organização</h1>
          <p className="text-gray-500">{user.aldeia?.nome || 'Gestão da sua causa'}</p>
        </div>
        <div className="flex gap-2">
          <UIButton variant="secondary" icon={<Download className="w-4 h-4" />}>
            Relatórios
          </UIButton>
          <UIButton icon={<Plus className="w-4 h-4" />} onClick={onCreateEvento}>
            Criar Evento
          </UIButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Eventos Ativos" value="3" icon={Calendar} color="indigo" />
        <StatCard title="Total Angariado" value="€4,520" icon={TrendingUp} color="green" />
        <StatCard title="Participantes" value="842" icon={Users} color="blue" />
        <StatCard title="Prémios Atribuídos" value="124" icon={Award} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <UICard className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold">Os Seus Eventos</h2>
              <UIButton variant="ghost" size="sm">Ver todos</UIButton>
            </div>
            <div className="divide-y divide-gray-100">
              {eventos.map((ev) => (
                <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {ev.imageUrl && <img src={ev.imageUrl} alt={ev.nome} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ev.nome}</p>
                      <div className="flex items-center gap-2">
                        <UIBadge className="text-[10px] py-0">{ev.estado || 'ATIVO'}</UIBadge>
                        <span className="text-xs text-gray-400">{new Date(ev.dataFim).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <p className="text-sm font-bold">€1,250</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Angariado</p>
                    </div>
                    <UIButton variant="secondary" size="sm" icon={<Settings className="w-4 h-4" />} />
                  </div>
                </div>
              ))}
            </div>
          </UICard>
        </div>
      </div>
    </div>
  );
}
