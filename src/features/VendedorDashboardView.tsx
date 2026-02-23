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
import { soundEngine } from '@/lib/audio-utils';

export function VendedorDashboardView({ user, stats, eventos, onParticipar }: any) {
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
        <UICard className="p-6 bg-indigo-600 text-white border-none shadow-indigo-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm">Vendas de Hoje</p>
              <p className="text-2xl font-bold">€{stats?.vendasHoje || '0.00'}</p>
            </div>
          </div>
          <p className="text-indigo-200 text-xs">+{stats?.crescimento || '12'}% em relação a ontem</p>
        </UICard>

        <UICard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Clientes Atendidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.clientesHoje || '0'}</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs">Média de €{stats?.ticketMedio || '15.50'} por cliente</p>
        </UICard>

        <UICard className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Comissão Acumulada</p>
              <p className="text-2xl font-bold text-gray-900">€{stats?.comissao || '0.00'}</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs">Pagamento automático em 2 dias</p>
        </UICard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UICard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Disponível para Venda</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Procurar jogo..."
                className="pl-10 pr-4 py-1.5 bg-gray-50 border-none rounded-lg text-sm w-48"
              />
            </div>
          </div>
          <div className="space-y-4">
            {eventos.map((ev: any) => (
              <div key={ev.id} className="border-b border-gray-100 pb-4 last:border-0">
                <p className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-wider">{ev.titulo}</p>
                <div className="grid gap-2">
                  {ev.jogos?.map((j: any) => (
                    <div key={j.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-white hover:ring-2 hover:ring-indigo-500 transition-all group">
                      <div>
                        <p className="font-semibold text-sm">{j.titulo}</p>
                        <p className="text-xs text-gray-500">Preço: €{j.precoParticipacao.toFixed(2)}</p>
                      </div>
                      <UIButton
                        size="sm"
                        icon={<QrCode className="w-4 h-4" />}
                        onClick={() => {
                          soundEngine.playClick();
                          onParticipar(j);
                        }}
                      >
                        Vender
                      </UIButton>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </UICard>

        <UICard className="p-6">
          <h2 className="text-lg font-bold mb-6">Atividade Recente</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">Venda Registada</p>
                    <p className="text-xs text-gray-400">Há {i*5} min</p>
                  </div>
                  <p className="text-xs text-gray-500">Raspadinha de Verão - €5.00</p>
                </div>
              </div>
            ))}
          </div>
          <UIButton variant="secondary" className="w-full mt-6">Ver Todo o Histórico</UIButton>
        </UICard>
      </div>
    </div>
  );
}
