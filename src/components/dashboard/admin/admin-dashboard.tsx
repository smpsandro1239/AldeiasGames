/**
 * AdminDashboard.tsx
 * Dashboard completo do Admin / Organizador
 * Design: Festivo português, premium, mobile-first
 */

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
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

// ============================================
// LOGOUT HANDLER
// ============================================

function handleLogout() {
  console.log('Admin logout clicked');
  alert('Admin logout clicked!');
  document.cookie.split(";").forEach((c) => { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  localStorage.clear();
  window.location.href = '/';
}

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
}

interface Premio {
  id: string;
  nome: string;
  valor: number;
  quantidade: number;
  entregue: number;
  estado: 'disponivel' | 'esgotado';
}

interface StatsAdmin {
  vendasHoje: number;
  vendasSemana: number;
  vendasMes: number;
  totalParticipantes: number;
  premiosEntregues: number;
  receitaTotal: number;
  lucroTotal: number;
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
// CAMPAIGN CARD
// ============================================

function CampanhaCard({ campanha, onEdit, onPausar, onVer }: { campanha: Campanha; onEdit: (c: Campanha) => void; onPausar: (c: Campanha) => void; onVer: (c: Campanha) => void }) {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'raspadinha': return '🎫';
      case 'poio_vaca': return '🐄';
      case 'rifa': return '🎰';
      default: return '🎮';
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
            {getIcon(campanha.tipo)}
          </div>
          <div>
            <h3 className="font-bold text-lg">{campanha.titulo}</h3>
            <p className="text-sm text-gray-500 capitalize">{campanha.tipo.replace('_', ' ')}</p>
          </div>
        </div>
        <Badge variant={campanha.estado === 'ativa' ? 'success' : campanha.estado === 'pausada' ? 'warning' : 'default'}>
          {campanha.estado}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Vendas</p>
          <p className="font-bold text-lg">{campanha.totalVendas}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Receita</p>
          <p className="font-bold text-lg text-green-600">€{campanha.receita.toFixed(0)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onVer(campanha)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-1">
          <Eye className="w-4 h-4" /> Ver
        </button>
        <button onClick={() => onPausar(campanha)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-1">
          {campanha.estado === 'ativa' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {campanha.estado === 'ativa' ? 'Pausar' : 'Ativar'}
        </button>
        <button onClick={() => onEdit(campanha)} className="flex-1 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1">
          <Edit className="w-4 h-4" /> Editar
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// VENDEDOR ROW
// ============================================

function VendedorRow({ vendedor, onEdit }: { vendedor: Vendedor; onEdit: (v: Vendedor) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 bg-white rounded-xl border hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
          {vendedor.nome.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{vendedor.nome}</p>
          <p className="text-sm text-gray-500">{vendedor.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="font-bold text-green-600">€{vendedor.vendasHoje.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Hoje</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-indigo-600">€{vendedor.comissao.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Comissão</p>
        </div>
        <Badge variant={vendedor.estado === 'ativo' ? 'success' : 'default'}>{vendedor.estado}</Badge>
        <button onClick={() => onEdit(vendedor)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit className="w-4 h-4" /></button>
      </div>
    </motion.div>
  );
}

// ============================================
// MODAL CRIAR CAMPANHA
// ============================================

function ModalCriarCampanha({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({ titulo: '', tipo: 'raspadinha', preco: 2.50 });

  const handleSubmit = () => {
    onSave(form);
    onClose();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎮 Nova Campanha">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título da Campanha *</label>
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
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
          <PartyPopper className="w-4 h-4 mr-2" /> Criar Campanha
        </UIButton>
      </div>
    </Modal>
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 Novo Vendedor">
      <div className="space-y-4">
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
    </Modal>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCriarCampanha, setShowCriarCampanha] = useState(false);
  const [showCriarVendedor, setShowCriarVendedor] = useState(false);

  // Stats mockadas
  const stats: StatsAdmin = {
    vendasHoje: 1250,
    vendasSemana: 8750,
    vendasMes: 32500,
    totalParticipantes: 4523,
    premiosEntregues: 342,
    receitaTotal: 125000,
    lucroTotal: 87500
  };

  // Campanhas mockadas
  const [campanhas, setCampanhas] = useState<Campanha[]>([
    { id: '1', titulo: 'Raspadinha Festa São João', tipo: 'raspadinha', estado: 'ativa', preco: 2.50, totalVendas: 1250, receita: 3125, participantes: 980, premiosEntregues: 45, dataInicio: '2024-06-01' },
    { id: '2', titulo: 'Poio da Vaca 2024', tipo: 'poio_vaca', estado: 'ativa', preco: 5, totalVendas: 450, receita: 2250, participantes: 320, premiosEntregues: 28, dataInicio: '2024-05-15' },
    { id: '3', titulo: 'Rifa Natal Clube', tipo: 'rifa', estado: 'pausada', preco: 3, totalVendas: 0, receita: 0, participantes: 0, premiosEntregues: 0, dataInicio: '2024-12-01' },
    { id: '4', titulo: 'Raspadinha Carnaval', tipo: 'raspadinha', estado: 'concluida', preco: 2, totalVendas: 2500, receita: 5000, participantes: 2100, premiosEntregues: 156, dataInicio: '2024-02-01', dataFim: '2024-02-15' },
  ]);

  // Vendedores mockados
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    { id: '1', nome: 'João Silva', email: 'joao@email.pt', telefone: '912 345 678', vendasHoje: 125, vendasSemana: 875, comissao: 87.50, estado: 'ativo' },
    { id: '2', nome: 'Maria Santos', email: 'maria@email.pt', telefone: '913 456 789', vendasHoje: 98, vendasSemana: 654, comissao: 65.40, estado: 'ativo' },
    { id: '3', nome: 'Pedro Costa', email: 'pedro@email.pt', telefone: '914 567 890', vendasHoje: 0, vendasSemana: 234, comissao: 23.40, estado: 'inativo' },
  ]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'campanhas', label: 'Campanhas', icon: Gamepad2 },
    { id: 'vendedores', label: 'Vendedores', icon: Users },
    { id: 'premios', label: 'Prémios', icon: Gift },
    { id: 'relatorios', label: 'Relatórios', icon: Download },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  const handleCriarCampanha = (data: any) => {
    const novaCampanha: Campanha = {
      id: Date.now().toString(),
      titulo: data.titulo,
      tipo: data.tipo as any,
      estado: 'ativa',
      preco: data.preco,
      totalVendas: 0,
      receita: 0,
      participantes: 0,
      premiosEntregues: 0,
      dataInicio: new Date().toISOString().split('T')[0]
    };
    setCampanhas([...campanhas, novaCampanha]);
  };

  const handleCriarVendedor = (data: any) => {
    const novoVendedor: Vendedor = {
      id: Date.now().toString(),
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      vendasHoje: 0,
      vendasSemana: 0,
      comissao: 0,
      estado: 'ativo'
    };
    setVendedores([...vendedores, novoVendedor]);
  };

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
                <h1 className="text-2xl font-black text-gray-800">Associação Cultural</h1>
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
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                A
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <UICard className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Vendas da Semana
                      </h3>
                      <div className="h-48 flex items-end gap-2">
                        {[45, 65, 35, 78, 52, 89, 70].map((h, i) => (
                          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1 }}
                            className="flex-1 bg-gradient-to-t from-purple-500 to-pink-400 rounded-t-lg" />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
                      </div>
                    </UICard>

                    <UICard className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Receita por Tipo
                      </h3>
                      <div className="flex items-center justify-center gap-8">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#E5E7EB" strokeWidth="20" fill="none" />
                            <circle cx="64" cy="64" r="50" stroke="#8B5CF6" strokeWidth="20" fill="none" strokeDasharray="157 314" />
                            <circle cx="64" cy="64" r="50" stroke="#EC4899" strokeWidth="20" fill="none" strokeDasharray="94 314" strokeDashoffset="-157" />
                            <circle cx="64" cy="64" r="50" stroke="#F59E0B" strokeWidth="20" fill="none" strokeDasharray="63 314" strokeDashoffset="-251" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500" /> Raspadinha</p>
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-pink-500" /> Poio da Vaca</p>
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Rifa</p>
                        </div>
                      </div>
                    </UICard>
                  </div>

                  {/* Campanhas Ativas */}
                  <UICard className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Campanhas Ativas</h3>
                      <UIButton size="sm" onClick={() => setShowCriarCampanha(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Nova
                      </UIButton>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {campanhas.filter(c => c.estado === 'ativa').map((c) => (
                        <CampanhaCard key={c.id} campanha={c} onEdit={() => {}} onPausar={() => {}} onVer={() => {}} />
                      ))}
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* CAMPANHAS TAB */}
              {activeTab === 'campanhas' && (
                <motion.div key="campanhas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Campanhas</h2>
                    <UIButton onClick={() => setShowCriarCampanha(true)} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Plus className="w-4 h-4 mr-2" /> Nova Campanha
                    </UIButton>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campanhas.map((c) => (
                      <CampanhaCard key={c.id} campanha={c} onEdit={() => {}} onPausar={() => {}} onVer={() => {}} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* VENDEDORES TAB */}
              {activeTab === 'vendedores' && (
                <motion.div key="vendedores" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Vendedores</h2>
                    <UIButton onClick={() => setShowCriarVendedor(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                      <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </UIButton>
                  </div>
                  <div className="space-y-3">
                    {vendedores.map((v) => (
                      <VendedorRow key={v.id} vendedor={v} onEdit={() => {}} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PREMIOS TAB */}
              {activeTab === 'premios' && (
                <motion.div key="premios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Gestão de Prémios</h2>
                    <p className="text-gray-500">Funcionalidade em desenvolvimento</p>
                  </UICard>
                </motion.div>
              )}

              {/* RELATORIOS TAB */}
              {activeTab === 'relatorios' && (
                <motion.div key="relatorios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Relatórios</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 text-left">
                        <Download className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-bold">Vendas</p>
                        <p className="text-sm text-gray-500">Exportar Excel</p>
                      </button>
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 text-left">
                        <Download className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-bold">Participantes</p>
                        <p className="text-sm text-gray-500">Exportar CSV</p>
                      </button>
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 text-left">
                        <Download className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-bold">Financeiro</p>
                        <p className="text-sm text-gray-500">Exportar PDF</p>
                      </button>
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* CONFIG TAB */}
              {activeTab === 'config' && (
                <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Configurações da Organização</h2>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block font-bold mb-2">Nome da Organização</label>
                        <Input defaultValue="Associação Cultural" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Email</label>
                        <Input defaultValue="contato@associacao.pt" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Comissão Vendedor (%)</label>
                        <Input type="number" defaultValue={10} />
                      </div>
                      <UIButton className="bg-gradient-to-r from-purple-500 to-pink-500">Guardar</UIButton>
                    </div>
                  </UICard>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modals */}
      <ModalCriarCampanha isOpen={showCriarCampanha} onClose={() => setShowCriarCampanha(false)} onSave={handleCriarCampanha} />
      <ModalCriarVendedor isOpen={showCriarVendedor} onClose={() => setShowCriarVendedor(false)} onSave={handleCriarVendedor} />
    </div>
  );
}
