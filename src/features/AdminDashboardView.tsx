import React from 'react';
import {
  Plus,
  Settings,
  Download,
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  Gamepad2
} from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';
import { StatCard } from '@/components/ui/stat-card';
import { OrgCard } from '@/components/ui/org-card';
import { DashboardStats, Aldeia, Evento } from '@/types/project';

interface AdminDashboardViewProps {
  stats: DashboardStats | null;
  organizacoes: Aldeia[];
  eventos: Evento[];
  activeTab: string;
  onCreateClick: (type: 'organizacao' | 'evento' | 'vendedor' | 'jogo') => void;
  onOrgClick: (org: Aldeia) => void;
  onEventClick: (ev: Evento) => void;
  onExport: (type: string) => void;
}

export function AdminDashboardView({
  stats,
  organizacoes,
  eventos,
  onCreateClick,
  onOrgClick,
  onEventClick,
  onExport
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel de Controlo Global</h1>
          <p className="text-gray-500">Gestão centralizada de todo o ecossistema Aldeias Games.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <UIButton variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => onExport('geral')}>
            Relatórios
          </UIButton>
          <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => onCreateClick('organizacao')}>
            Nova Organização
          </UIButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={`€${stats?.volumeGlobal || '124,520'}`} icon={TrendingUp} trend="+12.5%" />
        <StatCard title="Organizações" value={organizacoes.length} icon={Building2} />
        <StatCard title="Eventos Ativos" value={eventos.filter(e => e.estado === 'ativo').length} icon={Calendar} />
        <StatCard title="Utilizadores" value="1,284" icon={Users} trend="+45" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UICard className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Organizações
            </h2>
            <UIButton variant="ghost" size="sm">Gerir todas</UIButton>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px] p-4 space-y-2">
            {organizacoes.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        </UICard>

        <UICard className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-600" />
              Eventos Críticos
            </h2>
            <UIButton variant="ghost" size="sm">Ver todos</UIButton>
          </div>
          <div className="flex-1 overflow-auto max-h-[400px]">
            {eventos.filter((e:any) => e.estado === 'urgente').map((ev: any) => (
              <div key={ev.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => onEventClick(ev)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ev.nome}</p>
                    <p className="text-xs text-gray-400">Termina hoje</p>
                  </div>
                </div>
                <UIButton variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />} />
              </div>
            ))}
          </div>
        </UICard>
      </div>
    </div>
  );
}
