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

export function AdminDashboardView({
  stats,
  organizacoes,
  eventos,
  onCreateClick,
  onOrgClick,
  onEventClick,
  onExport
}: any) {
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
        {[
          { label: 'Total Volume', value: `€${stats?.volumeGlobal || '124,520'}`, icon: TrendingUp, color: 'emerald', trend: '+12.5%' },
          { label: 'Organizações', value: organizacoes.length.toString(), icon: Building2, color: 'indigo', trend: '+2' },
          { label: 'Eventos Ativos', value: eventos.filter((e:any) => e.status === 'ATIVO').length.toString(), icon: Calendar, color: 'blue', trend: 'Estável' },
          { label: 'Utilizadores', value: '1,284', icon: Users, color: 'violet', trend: '+45' },
        ].map((item, idx) => (
          <UICard key={idx} className="p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
            <div className={`w-12 h-12 bg-${item.color}-100 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-4 relative z-10`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <span className="text-[10px] text-emerald-600 font-bold">{item.trend}</span>
              </div>
            </div>
          </UICard>
        ))}
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
          <div className="flex-1 overflow-auto max-h-[400px]">
            {organizacoes.map((org: any) => (
              <div key={org.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer" onClick={() => onOrgClick(org)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
                    {org.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{org.nome}</p>
                    <p className="text-xs text-gray-400">{org._count?.eventos || 0} eventos</p>
                  </div>
                </div>
                <UIBadge variant={org.verificada ? 'success' : 'warning'}>
                  {org.verificada ? 'Verificada' : 'Pendente'}
                </UIBadge>
              </div>
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
            {eventos.filter((e:any) => e.status === 'URGENTE').map((ev: any) => (
              <div key={ev.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex items-center justify-between" onClick={() => onEventClick(ev)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ev.titulo}</p>
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
