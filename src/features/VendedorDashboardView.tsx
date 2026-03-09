import React, { useState } from 'react';
import {
  Plus,
  Users,
  TrendingUp,
  CreditCard,
  History,
  QrCode,
  Search,
  ShoppingCart,
  X,
  UserPlus
} from 'lucide-react';
import { UIButton, UICard, UIInput } from '@/components/ui-components';
import { StatCard } from '@/components/ui/stat-card';
import { soundEngine } from '@/lib/audio-utils';
import { ComprovativoVenda } from '@/components/features/venda/comprovativo-venda';

interface VendaItem {
  id: string;
  tipo: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

interface Venda {
  id: string;
  valorTotal: number;
  metodoPagamento: string;
  estado: string;
  createdAt: string;
  vendedor: { id: string; nome: string };
  cliente?: { id: string; nome: string };
  aldeia: { id: string; nome: string };
  itens: VendaItem[];
}

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  aldeiaId?: string;
}

interface DashboardStats {
  vendasHoje?: string;
  clientesHoje?: string;
  comissao?: string;
}

interface Evento {
  id: string;
  nome: string;
  jogos?: Jogo[];
}

interface Jogo {
  id: string;
  titulo: string;
  precoParticipacao: number;
}

interface VendedorDashboardViewProps {
  user: User;
  stats: DashboardStats | null;
  eventos: Evento[];
  onParticipar: (jogo: Jogo) => void;
}

export function VendedorDashboardView({ user, stats, eventos, onParticipar }: VendedorDashboardViewProps) {
  const [showNovaVenda, setShowNovaVenda] = useState(false);
  const [showComprovativo, setShowComprovativo] = useState(false);
  const [vendaActual, setVendaActual] = useState<Venda | null>(null);
  const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
  const [clienteNome, setClienteNome] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('mbway');
  const [loading, setLoading] = useState(false);

  const adicionarItem = (jogo: Jogo) => {
    const itemExistente = itensCarrinho.find(i => i.itemId === jogo.id);
    if (itemExistente) {
      setItensCarrinho(itensCarrinho.map(i => 
        i.itemId === jogo.id 
          ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * i.precoUnitario }
          : i
      ));
    } else {
      setItensCarrinho([...itensCarrinho, {
        tipo: 'jogo',
        itemId: jogo.id,
        descricao: jogo.titulo,
        quantidade: 1,
        precoUnitario: jogo.precoParticipacao,
        subtotal: jogo.precoParticipacao
      }]);
    }
  };

  const removerItem = (itemId: string) => {
    setItensCarrinho(itensCarrinho.filter(i => i.itemId !== itemId));
  };

  const totalVenda = itensCarrinho.reduce((sum, item) => sum + item.subtotal, 0);

  const criarVenda = async () => {
    if (itensCarrinho.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aldeiaId: user.aldeiaId,
          metodoPagamento,
          telefone: null,
          itens: itensCarrinho
        })
      });

      if (response.ok) {
        const venda = await response.json();
        setVendaActual(venda);
        setShowNovaVenda(false);
        setShowComprovativo(true);
        setItensCarrinho([]);
        setClienteNome('');
      }
    } catch (error) {
      console.error('Erro ao criar venda:', error);
    }
    setLoading(false);
  };

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
          <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowNovaVenda(true)}>
            Nova Venda
          </UIButton>
        </div>
      </div>

      {/* Modal Nova Venda */}
      {showNovaVenda && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <UICard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Nova Venda</h2>
              <button onClick={() => setShowNovaVenda(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Jogos Disponíveis */}
              <div>
                <h3 className="font-medium mb-2">Selecionar Jogos</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {eventos.map((ev) => (
                    <div key={ev.id}>
                      <p className="text-xs font-bold text-indigo-600 uppercase">{ev.nome}</p>
                      {ev.jogos?.map((j) => (
                        <div key={j.id} className="flex justify-between items-center p-2 bg-gray-50 rounded mt-1">
                          <span>{j.titulo} - €{j.precoParticipacao.toFixed(2)}</span>
                          <UIButton size="sm" onClick={() => adicionarItem(j)}>
                            <Plus className="w-4 h-4" />
                          </UIButton>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrinho */}
              {itensCarrinho.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Carrinho</h3>
                  <div className="space-y-2">
                    {itensCarrinho.map((item) => (
                      <div key={item.itemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.descricao} x{item.quantidade}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">€{item.subtotal.toFixed(2)}</span>
                          <button onClick={() => removerItem(item.itemId)} className="text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>€{totalVenda.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Método Pagamento */}
              <div>
                <h3 className="font-medium mb-2">Método de Pagamento</h3>
                <div className="flex gap-2">
                  {['mbway', 'dinheiro', 'transferencia'].map((metodo) => (
                    <button
                      key={metodo}
                      onClick={() => setMetodoPagamento(metodo)}
                      className={`px-4 py-2 rounded border ${metodoPagamento === metodo ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                    >
                      {metodo === 'mbway' ? 'MBWay' : metodo === 'dinheiro' ? 'Dinheiro' : 'Transferência'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <UIButton variant="outline" onClick={() => setShowNovaVenda(false)}>Cancelar</UIButton>
              <UIButton onClick={criarVenda} disabled={itensCarrinho.length === 0 || loading}>
                {loading ? 'A processar...' : 'Confirmar Venda'}
              </UIButton>
            </div>
          </UICard>
        </div>
      )}

      {/* Modal Comprovativo */}
      {showComprovativo && vendaActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <UICard className="w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Comprovativo</h2>
              <button onClick={() => setShowComprovativo(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ComprovativoVenda venda={vendaActual} />
            </div>
          </UICard>
        </div>
      )}

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
