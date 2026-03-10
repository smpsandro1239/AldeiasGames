'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Gamepad2,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  ChevronRight,
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Wallet,
  Gift,
  Ticket,
  Copy,
  QrCode,
  Download,
  Filter,
  RefreshCw,
  PartyPopper,
  Trophy,
  Star,
  Target,
  UsersRound,
  Euro,
  LogOut,
  History,
  FileText,
  GiftIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';
import { useRouter } from 'next/navigation';

// ============================================
// TIPOS
// ============================================

interface Campanha {
  id: string;
  titulo: string;
  tipo: 'raspadinha' | 'poio_vaca' | 'rifa';
  estado: 'ativa' | 'pausada' | 'concluida';
  preco: number;
  totalVendas: number;
  receita: number;
  participantes: number;
  premiosEntregues: number;
  dataInicio: string;
  dataFim?: string;
}

interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  vendasHoje: number;
  vendasSemana: number;
  comissao: number;
  estado: 'ativo' | 'inativo';
  createdAt?: string;
}

interface Premio {
  id: string;
  nome: string;
  valor: number;
  quantidade: number;
  entregue: number;
  estado: 'disponivel' | 'esgotado';
}

interface Participacao {
  id: string;
  jogoId: string;
  jogoTitulo: string;
  userId: string;
  userNome: string;
  valorPago: number;
  estado: 'pendente' | 'pago' | 'cancelado';
  data: string;
  referencia: string;
}

interface Alteracao {
  id: string;
  tipo: string;
  descricao: string;
  utilizador: string;
  data: string;
  motivo?: string;
}

interface AldeiaAdminStats {
  vendasHoje: number;
  vendasSemana: number;
  vendasMes: number;
  totalParticipantes: number;
  premiosEntregues: number;
  receitaTotal: number;
  lucroTotal: number;
}

interface AldeiaAdminDashboardProps {
  aldeiaId: string;
  aldeiaNome: string;
}

// ============================================
// COMPONENTES UI
// ============================================

function Input({ value, onChange, placeholder, type = 'text', className = '' }: any) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none ${className}`} />
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default' }) {
  const cores = { success: 'bg-green-100 text-green-700', warning: 'bg-yellow-100 text-yellow-700', error: 'bg-red-100 text-red-700', default: 'bg-gray-100 text-gray-700' };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cores[variant]}`}>{children}</span>;
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// STATS CARDS
// ============================================

function StatsCard({ titulo, valor, variacao, icon: Icon, cor }: { titulo: string; valor: string | number; variacao?: string; icon: React.ElementType; cor: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{titulo}</p>
          <p className={`text-3xl font-black mt-2 ${cor}`}>{valor}</p>
          {variacao && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${variacao.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${variacao.startsWith('-') ? 'rotate-180' : ''}`} />
              {variacao}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${cor}/10`}><Icon className={`w-6 h-6 ${cor}`} /></div>
      </div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AldeiaAdminDashboard({ aldeiaId, aldeiaNome }: AldeiaAdminDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCriarCampanha, setShowCriarCampanha] = useState(false);
  const [showCriarVendedor, setShowCriarVendedor] = useState(false);
  const [showEditarAldeia, setShowEditarAldeia] = useState(false);

  // Dados do estado
  const [stats, setStats] = useState<AldeiaAdminStats>({
    vendasHoje: 0,
    vendasSemana: 0,
    vendasMes: 0,
    totalParticipantes: 0,
    premiosEntregues: 0,
    receitaTotal: 0,
    lucroTotal: 0
  });
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [participacoes, setParticipacoes] = useState<Participacao[]>([]);
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);
  const [aldeiaInfo, setAldeiaInfo] = useState<any>(null);

  // Fetch dados da API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');

        // Fetch aldeia info
        const aldeiaRes = await fetch(`/api/aldeias/${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aldeiaRes.ok) {
          const aldeiaData = await aldeiaRes.json();
          setAldeiaInfo(aldeiaData);
        }

        // Fetch stats
        const statsRes = await fetch(`/api/stats/dashboard?aldeiaId=${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch eventos (que são as "campanhas")
        const eventosRes = await fetch(`/api/eventos?aldeiaId=${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (eventosRes.ok) {
          const eventosData = await eventosRes.json();
          // Mapear eventos para campanhas
          setCampanhas(eventosData.map((e: any) => ({
            id: e.id,
            titulo: e.titulo || e.nome,
            tipo: e.tipo || 'rifa',
            estado: e.ativo ? 'ativa' : 'pausada',
            preco: 0,
            totalVendas: e._count?.jogos || 0,
            receita: 0,
            participantes: 0,
            premiosEntregues: 0,
            dataInicio: e.dataInicio
          })));
        }

        // Fetch vendedores
        const vendedoresRes = await fetch(`/api/users?aldeiaId=${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (vendedoresRes.ok) {
          const vendedoresData = await vendedoresRes.json();
          // Filtrar apenas vendedores
          const vendedores = (vendedoresData.users || []).filter((u: any) => u.role === 'vendedor');
          setVendedores(vendedores.map((v: any) => ({
            ...v,
            vendasHoje: 0,
            vendasSemana: 0,
            comissao: 0,
            estado: 'ativo'
          })));
        }

        // Fetch participações
        const partRes = await fetch(`/api/participacoes?aldeiaId=${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (partRes.ok) {
          const partData = await partRes.json();
          setParticipacoes(partData.slice(0, 50).map((p: any) => ({
            id: p.id,
            jogoId: p.jogoId,
            jogoTitulo: p.jogo?.evento?.nome || 'Jogo',
            userId: p.userId,
            userNome: p.user?.nome || p.nomeCliente || 'Cliente',
            valorPago: p.valorPago || 0,
            estado: p.estado,
            data: new Date(p.createdAt).toLocaleDateString('pt-PT'),
            referencia: p.referencia
          })));
        }

        // Fetch alterações/auditoria
        const alteracoesRes = await fetch(`/api/alteracoes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alteracoesRes.ok) {
          const alteracoesData = await alteracoesRes.json();
          setAlteracoes((alteracoesData.alteracoes || []).map((a: any) => ({
            id: a.id,
            tipo: a.campo ? 'alteracao' : 'criacao',
            descricao: a.campo ? `Alteração: ${a.campo}` : 'Nova participação',
            utilizador: a.admin?.nome || 'Sistema',
            data: new Date(a.createdAt).toLocaleDateString('pt-PT'),
            motivo: a.motivo
          })));
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }

    if (aldeiaId) {
      fetchData();
    }
  }, [aldeiaId]);

  const handleLogout = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.clear();
    router.push('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'vendedores', label: 'Vendedores', icon: Users },
    { id: 'participacoes', label: 'Participações', icon: Ticket },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'aldeia', label: 'Minha Aldeia', icon: Building2 },
  ];

  const handleCriarCampanha = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: data.titulo,
          aldeiaId,
          tipo: data.tipo,
          preco: data.preco
        })
      });
      if (res.ok) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error('Erro ao criar evento:', err);
    }
  };

  const handleCriarVendedor = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          role: 'vendedor',
          aldeiaId
        })
      });
      if (res.ok) {
        const newVendedor = await res.json();
        setVendedores([...vendedores, { ...newVendedor.user, vendasHoje: 0, vendasSemana: 0, comissao: 0, estado: 'ativo' }]);
      }
    } catch (err) {
      console.error('Erro ao criar vendedor:', err);
    }
  };

  const handleExecutarSorteio = async (jogoId: string) => {
    if (!confirm('Tem certeza que deseja executar o sorteio? Esta ação não pode ser desfeita.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/sorteios/${jogoId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        alert('Sorteio executado com sucesso!');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao executar sorteio');
      }
    } catch (err) {
      console.error('Erro ao executar sorteio:', err);
    }
  };

  const handleAlterarParticipacao = async (participacaoId: string, novoEstado: string, motivo?: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/participacoes/${participacaoId}/alterar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ estado: novoEstado, motivo })
      });
      if (res.ok) {
        alert('Participação alterada com sucesso!');
        // Refresh participações
        const token = localStorage.getItem('token');
        const partRes = await fetch(`/api/participacoes?aldeiaId=${aldeiaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (partRes.ok) {
          const partData = await partRes.json();
          setParticipacoes(partData.participacoes || []);
        }
      }
    } catch (err) {
      console.error('Erro ao alterar participação:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">A carregar dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">{aldeiaNome}</h1>
                <p className="text-sm text-gray-500">Painel de Gestão</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="p-3 hover:bg-red-50 rounded-xl text-red-600"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden border">
                {(aldeiaInfo?.logoUrl || aldeiaInfo?.logoBase64) ? (
                  <img src={aldeiaInfo.logoUrl || aldeiaInfo.logoBase64} alt={aldeiaNome} className="w-full h-full object-cover" />
                ) : (
                  aldeiaNome?.charAt(0) || 'A'
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <UICard className="p-2 sticky top-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </UICard>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard titulo="Vendas Hoje" valor={`€${stats.vendasHoje}`} variacao="+12%" icon={DollarSign} cor="text-green-600" />
                    <StatsCard titulo="Vendas Semana" valor={`€${stats.vendasSemana}`} variacao="+8%" icon={TrendingUp} cor="text-blue-600" />
                    <StatsCard titulo="Participantes" valor={stats.totalParticipantes} icon={Users} cor="text-purple-600" />
                    <StatsCard titulo="Prémios Entregues" valor={stats.premiosEntregues} icon={Gift} cor="text-amber-600" />
                  </div>

                  {/* Quick Actions */}
                  <UICard className="p-6">
                    <h3 className="font-bold text-lg mb-4">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button onClick={() => setShowCriarCampanha(true)} className="p-4 bg-purple-100 hover:bg-purple-200 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <Plus className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Novo Evento</span>
                      </button>
                      <button onClick={() => setShowCriarVendedor(true)} className="p-4 bg-blue-100 hover:bg-blue-200 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <Users className="w-8 h-8 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Novo Vendedor</span>
                      </button>
                      <button onClick={() => setActiveTab('participacoes')} className="p-4 bg-green-100 hover:bg-green-200 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <Ticket className="w-8 h-8 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Ver Participações</span>
                      </button>
                      <button onClick={() => setActiveTab('historico')} className="p-4 bg-orange-100 hover:bg-orange-200 rounded-xl flex flex-col items-center gap-2 transition-colors">
                        <History className="w-8 h-8 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700">Histórico</span>
                      </button>
                    </div>
                  </UICard>

                  {/* Recent Activity */}
                  <UICard className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Atividade Recente
                    </h3>
                    <div className="space-y-3">
                      {alteracoes.slice(0, 5).map((alt) => (
                        <div key={alt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-sm">{alt.descricao}</p>
                            <p className="text-xs text-gray-500">{alt.utilizador} • {alt.data}</p>
                          </div>
                          <Badge variant={alt.tipo === 'criacao' ? 'success' : alt.tipo === 'alteracao' ? 'warning' : 'default'}>
                            {alt.tipo}
                          </Badge>
                        </div>
                      ))}
                      {alteracoes.length === 0 && (
                        <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
                      )}
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* EVENTOS TAB */}
              {activeTab === 'eventos' && (
                <motion.div key="eventos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Eventos e Jogos</h2>
                    <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowCriarCampanha(true)}>
                      Novo Evento
                    </UIButton>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campanhas.map((camp) => (
                      <UICard key={camp.id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold">{camp.titulo}</h3>
                            <p className="text-sm text-gray-500 capitalize">{camp.tipo.replace('_', ' ')}</p>
                          </div>
                          <Badge variant={camp.estado === 'ativa' ? 'success' : camp.estado === 'pausada' ? 'warning' : 'default'}>
                            {camp.estado}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500">Vendas</p>
                            <p className="font-bold">{camp.totalVendas}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500">Receita</p>
                            <p className="font-bold text-green-600">€{camp.receita}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                            <Eye className="w-4 h-4 inline mr-1" /> Ver
                          </button>
                          {camp.estado === 'ativa' && camp.totalVendas > 0 && (
                            <button
                              onClick={() => handleExecutarSorteio(camp.id)}
                              className="flex-1 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm"
                            >
                              <Trophy className="w-4 h-4 inline mr-1" /> Sortear
                            </button>
                          )}
                        </div>
                      </UICard>
                    ))}
                    {campanhas.length === 0 && (
                      <UICard className="col-span-full p-8 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum evento criado</p>
                        <UIButton variant="outline" className="mt-4" onClick={() => setShowCriarCampanha(true)}>
                          Criar Primeiro Evento
                        </UIButton>
                      </UICard>
                    )}
                  </div>
                </motion.div>
              )}

              {/* VENDEDORES TAB */}
              {activeTab === 'vendedores' && (
                <motion.div key="vendedores" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Vendedores</h2>
                    <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => setShowCriarVendedor(true)}>
                      Novo Vendedor
                    </UIButton>
                  </div>

                  <div className="space-y-3">
                    {vendedores.map((v) => (
                      <UICard key={v.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {v.nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{v.nome}</p>
                            <p className="text-sm text-gray-500">{v.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-bold text-green-600">€{v.vendasSemana}</p>
                            <p className="text-xs text-gray-500">Esta semana</p>
                          </div>
                          <Badge variant={v.estado === 'ativo' ? 'success' : 'default'}>
                            {v.estado}
                          </Badge>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </UICard>
                    ))}
                    {vendedores.length === 0 && (
                      <UICard className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum vendedor criado</p>
                        <UIButton variant="outline" className="mt-4" onClick={() => setShowCriarVendedor(true)}>
                          Criar Primeiro Vendedor
                        </UIButton>
                      </UICard>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PARTICIPACOES TAB */}
              {activeTab === 'participacoes' && (
                <motion.div key="participacoes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold">Gestão de Participações</h2>

                  <UICard className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-4 font-semibold">Data</th>
                            <th className="text-left p-4 font-semibold">Jogo</th>
                            <th className="text-left p-4 font-semibold">Cliente</th>
                            <th className="text-left p-4 font-semibold">Valor</th>
                            <th className="text-left p-4 font-semibold">Estado</th>
                            <th className="text-left p-4 font-semibold">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participacoes.map((p) => (
                            <tr key={p.id} className="border-t hover:bg-gray-50">
                              <td className="p-4 text-sm">{p.data}</td>
                              <td className="p-4 font-medium">{p.jogoTitulo}</td>
                              <td className="p-4">{p.userNome || p.referencia}</td>
                              <td className="p-4 font-bold text-green-600">€{p.valorPago}</td>
                              <td className="p-4">
                                <Badge variant={p.estado === 'pago' ? 'success' : p.estado === 'pendente' ? 'warning' : 'error'}>
                                  {p.estado}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {p.estado === 'pendente' && (
                                    <>
                                      <button
                                        onClick={() => handleAlterarParticipacao(p.id, 'pago', 'Confirmado por admin')}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                                      >
                                        Validar
                                      </button>
                                      <button
                                        onClick={() => handleAlterarParticipacao(p.id, 'cancelado', 'Cancelado por admin')}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                      >
                                        Cancelar
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {participacoes.length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-gray-500">
                                Nenhuma participação encontrada
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* HISTORICO TAB */}
              {activeTab === 'historico' && (
                <motion.div key="historico" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold">Histórico de Alterações</h2>

                  <UICard className="p-6">
                    <div className="space-y-4">
                      {alteracoes.map((alt) => (
                        <div key={alt.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alt.tipo === 'criacao' ? 'bg-green-100 text-green-600' :
                            alt.tipo === 'alteracao' ? 'bg-blue-100 text-blue-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                            {alt.tipo === 'criacao' ? <Plus className="w-5 h-5" /> :
                              alt.tipo === 'alteracao' ? <Edit className="w-5 h-5" /> :
                                <Trash2 className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{alt.descricao}</p>
                            {alt.motivo && <p className="text-sm text-gray-500 mt-1">Motivo: {alt.motivo}</p>}
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                              <span>👤 {alt.utilizador}</span>
                              <span>🕐 {alt.data}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {alteracoes.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Nenhuma alteração registada</p>
                      )}
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* ALDEIA TAB */}
              {activeTab === 'aldeia' && (
                <motion.div key="aldeia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h2 className="text-2xl font-bold">Configurações da Aldeia</h2>

                  <UICard className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-4">Informações da Organização</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Nome</label>
                            <Input value={aldeiaInfo?.nome || aldeiaNome} disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <Input value={aldeiaInfo?.tipoOrganizacao || ''} disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Localização</label>
                            <Input value={aldeiaInfo?.localizacao || 'Não definido'} disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Estado</label>
                            <div>
                              <Badge variant={aldeiaInfo?.verificada ? 'success' : 'warning'}>
                                {aldeiaInfo?.verificada ? 'Verificada' : 'Pendente de Verificação'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-bold text-lg mb-4">Links Úteis</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-xl text-center transition-colors">
                            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <span className="text-sm font-medium">Exportar Dados</span>
                          </button>
                          <button className="p-4 bg-blue-100 hover:bg-blue-200 rounded-xl text-center transition-colors">
                            <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-sm font-medium">Relatórios CSV</span>
                          </button>
                          <button className="p-4 bg-green-100 hover:bg-green-200 rounded-xl text-center transition-colors">
                            <QrCode className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <span className="text-sm font-medium">QR Codes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </UICard>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modals */}
      <ModalCriarCampanha
        isOpen={showCriarCampanha}
        onClose={() => setShowCriarCampanha(false)}
        onSave={handleCriarCampanha}
      />

      <ModalCriarVendedor
        isOpen={showCriarVendedor}
        onClose={() => setShowCriarVendedor(false)}
        onSave={handleCriarVendedor}
      />
    </div>
  );
}

// ============================================
// MODAL CRIAR EVENTO
// ============================================

function ModalCriarCampanha({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ titulo: '', tipo: 'raspadinha', preco: 2.50, imagem: '' });

  const handleSubmit = () => {
    if (!form.titulo) {
      alert('O título é obrigatório');
      return;
    }
    onSave({ ...form, imagemBase64: form.imagem });
    onClose();
    setForm({ titulo: '', tipo: 'raspadinha', preco: 2.50, imagem: '' });
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-black">🎮 Novo Evento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Evento *</label>
            <Input value={form.titulo} onChange={(e: any) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Raspadinha São João 2026" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Jogo *</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.tipo} onChange={(e: any) => setForm({ ...form, tipo: e.target.value })}>
              <option value="raspadinha">🎫 Raspadinha</option>
              <option value="poio_vaca">🐄 Poio da Vaca</option>
              <option value="rifa">🎰 Rifa / Tombola</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preço por Jogo (€) *</label>
            <Input type="number" step="0.10" value={form.preco} onChange={(e: any) => setForm({ ...form, preco: parseFloat(e.target.value) })} placeholder="2.50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Imagem do Evento (Opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setForm({ ...form, imagem: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {form.imagem && (
              <div className="mt-2">
                <img src={form.imagem} alt="Preview" className="w-24 h-16 object-cover rounded border bg-gray-50" />
              </div>
            )}
          </div>
          <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
            <PartyPopper className="w-4 h-4 mr-2" /> Criar Evento
          </UIButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MODAL CRIAR VENDEDOR
// ============================================

function ModalCriarVendedor({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });

  const handleSubmit = () => {
    onSave(form);
    onClose();
    setForm({ nome: '', email: '', telefone: '' });
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-black">👤 Novo Vendedor</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <Input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} placeholder="Nome completo" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.pt" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <Input type="tel" value={form.telefone} onChange={(e: any) => setForm({ ...form, telefone: e.target.value })} placeholder="912 345 678" />
          </div>
          <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Vendedor
          </UIButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
