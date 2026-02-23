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

export function OrganizacaoDashboardView({ user, stats, eventos, onCreateEvento }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel da Organização</h1>
          <p className="text-gray-500">{user.organizacaoNome || 'Gestão da sua causa'}</p>
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
        {[
          { label: 'Eventos Ativos', value: '3', icon: Calendar, color: 'indigo' },
          { label: 'Total Angariado', value: '€4,520', icon: TrendingUp, color: 'green' },
          { label: 'Participantes', value: '842', icon: Users, color: 'blue' },
          { label: 'Prémios Atribuídos', value: '124', icon: Award, color: 'amber' },
        ].map((item, idx) => (
          <UICard key={idx} className="p-4">
            <div className={`w-10 h-10 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            <p className="text-xl font-bold">{item.value}</p>
          </UICard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <UICard className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-bold">Os Seus Eventos</h2>
              <UIButton variant="ghost" size="sm">Ver todos</UIButton>
            </div>
            <div className="divide-y divide-gray-100">
              {eventos.map((ev: any) => (
                <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {ev.banner && <img src={ev.banner} alt={ev.titulo} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{ev.titulo}</p>
                      <div className="flex items-center gap-2">
                        <UIBadge className="text-[10px] py-0">{ev.status || 'ATIVO'}</UIBadge>
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
              {eventos.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  Ainda não criou eventos.
                </div>
              )}
            </div>
          </UICard>
        </div>

        <div className="space-y-6">
          <UICard className="p-6">
            <h2 className="font-bold mb-4">Meta de Financiamento</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Objetivo Anual</span>
                  <span className="font-bold">€10,000</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">€4,520 angariados até agora (45%)</p>
              </div>
            </div>
          </UICard>

          <UICard className="p-6">
            <h2 className="font-bold mb-4">Dicas de Sucesso</h2>
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Promova nas redes sociais!</strong> Eventos com partilhas diárias têm 40% mais participações.
                </p>
              </div>
            </div>
          </UICard>
        </div>
      </div>
    </div>
  );
}
