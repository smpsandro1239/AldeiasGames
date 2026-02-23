import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  UserPlus,
  ArrowUpRight,
  TrendingUp,
  Ban
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';

export function CRMAdminView({ stats }: { stats: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const users = [
    { id: 1, name: 'João Silva', email: 'joao@example.com', role: 'CLIENTE', status: 'Ativo', totalSpent: '€150.00', lastSeen: 'Hoje' },
    { id: 2, name: 'Maria Santos', email: 'maria@associacao.pt', role: 'ORGANIZACAO', status: 'Ativo', totalSpent: '€0.00', lastSeen: 'Há 2 horas' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@vendedor.com', role: 'VENDEDOR', status: 'Pendente', totalSpent: '€45.00', lastSeen: 'Ontem' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Utilizadores (CRM)</h1>
          <p className="text-gray-500">Administre contas e permissões.</p>
        </div>
        <UIButton icon={<UserPlus className="w-4 h-4" />}>Convidar</UIButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Utilizadores', value: '1,284', icon: Users, color: 'blue' },
          { label: 'Novos este Mês', value: '+42', icon: TrendingUp, color: 'green' },
          { label: 'Aguardando Aprovação', value: '7', icon: Shield, color: 'orange' },
          { label: 'Churn Rate', value: '2.4%', icon: ArrowUpRight, color: 'red' },
        ].map((item, idx) => (
          <UICard key={idx} className="p-4 flex items-center gap-4">
            <div className={`p-3 bg-${item.color}-100 text-${item.color}-600 rounded-xl`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          </UICard>
        ))}
      </div>

      <UICard className="p-6">
        <h2 className="font-bold mb-6">Volume de Vendas (Últimos 7 dias)</h2>
        <div className="flex items-end gap-2 h-48">
          {[40, 65, 45, 90, 85, 60, 75].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-indigo-500 rounded-t-lg" style={{ height: `${val}%` }}></div>
              <span className="text-[10px] text-gray-400">D{idx + 1}</span>
            </div>
          ))}
        </div>
      </UICard>

      <UICard>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">Utilizador</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 text-sm font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-xs">{u.role}</td>
                  <td className="px-6 py-4 text-xs">{u.status}</td>
                  <td className="px-6 py-4"><UIButton variant="ghost" size="sm" icon={<Ban className="w-4 h-4" />} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UICard>
    </div>
  );
}
