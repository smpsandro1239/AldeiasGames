/**
 * SuperAdminDashboard.tsx
 * Dashboard completo do Super Admin
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
  Shield,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Crown,
  MapPin,
  Calendar,
  Mail,
  Phone,
  BarChart3,
  PieChart,
  Activity,
  LogOut,
  Bell,
  ChevronRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

import { useRouter } from 'next/navigation';

// ============================================
// TIPOS
// ============================================

interface Aldeia {
  id: string;
  nome: string;
  tipoOrganizacao: string;
  localizacao: string;
  email: string;
  telefone: string;
  estado: 'pendente' | 'ativa' | 'suspensa';
  createdAt: string;
  usuariosAtivos: number;
  campanhasAtivas: number;
  receitaTotal: number;
}

interface StatsGlobal {
  totalAldeias: number;
  aldeiasAtivas: number;
  totalUsuarios: number;
  totalCampanhas: number;
  campanhasAtivas: number;
  receitaTotal: number;
  receitaMes: number;
  usuariosNovosMes: number;
}

interface AuditLog {
  id: string;
  acao: string;
  utilizador: string;
  entidade: string;
  entidadeId: string;
  timestamp: string;
  ip: string;
  detalhes?: string;
}

// ============================================
// COMPONENTES UI BÁSICOS
// ============================================

function Input({ value, onChange, placeholder, type = 'text', className = '' }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors ${className}`}
    />
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default' }) {
  const cores = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700'
  };
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
    <motion.div whileHover={{ scale: 1.02, y: -4 }} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{titulo}</p>
          <p className={`text-3xl font-black mt-2 ${cor}`}>{valor}</p>
          {variacao && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${variacao.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 ${variacao.startsWith('-') ? 'rotate-180' : ''}`} />
              {variacao} este mês
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${cor}/10`}>
          <Icon className={`w-6 h-6 ${cor}`} />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// TABELA DE ALDEIAS
// ============================================

function AldeiasTable({ aldeias, onEdit, onVer, onDelete }: { aldeias: Aldeia[]; onEdit: (a: Aldeia) => void; onVer: (a: Aldeia) => void; onDelete: (a: Aldeia) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 font-bold text-gray-600">Aldeia</th>
            <th className="text-left p-4 font-bold text-gray-600">Tipo</th>
            <th className="text-left p-4 font-bold text-gray-600">Localização</th>
            <th className="text-left p-4 font-bold text-gray-600">Estado</th>
            <th className="text-left p-4 font-bold text-gray-600">Métricas</th>
            <th className="text-left p-4 font-bold text-gray-600">Ações</th>
          </tr>
        </thead>
        <tbody>
          {aldeias.map((aldeia, i) => (
            <motion.tr
              key={aldeia.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border-b hover:bg-gray-50"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {aldeia.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{aldeia.nome}</p>
                    <p className="text-xs text-gray-500">{aldeia.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <Badge>{aldeia.tipoOrganizacao}</Badge>
              </td>
              <td className="p-4 text-gray-600">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{aldeia.localizacao}</span>
              </td>
              <td className="p-4">
                <Badge variant={aldeia.estado === 'ativa' ? 'success' : aldeia.estado === 'pendente' ? 'warning' : 'error'}>
                  {aldeia.estado}
                </Badge>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  <p><span className="font-bold">{aldeia.usuariosAtivos}</span> usuários</p>
                  <p><span className="font-bold">{aldeia.campanhasAtivas}</span> campanhas</p>
                  <p className="text-green-600 font-bold">€{aldeia.receitaTotal.toLocaleString()}</p>
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button onClick={() => onVer(aldeia)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Ver">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(aldeia)} className="p-2 hover:bg-gray-100 rounded-lg" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(aldeia)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// AUDIT LOGS
// ============================================

function AuditLogs({ logs }: { logs: AuditLog[] }) {
  const getIcon = (acao: string) => {
    if (acao.includes('CREATE')) return <Plus className="w-4 h-4 text-green-500" />;
    if (acao.includes('DELETE')) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (acao.includes('UPDATE')) return <Edit className="w-4 h-4 text-blue-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {logs.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
        >
          {getIcon(log.acao)}
          <div className="flex-1">
            <p className="text-sm font-medium">{log.acao}</p>
            <p className="text-xs text-gray-500">{log.utilizador} • {log.entidade} #{log.entidadeId}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString('pt-PT')}</p>
            <p className="text-xs text-gray-400">{log.ip}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// MODAL CRIAR ALDEIA
// ============================================

function ModalCriarAldeia({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    nome: '',
    tipoOrganizacao: 'aldeia',
    email: '',
    telefone: '',
    localizacao: '',
    morada: ''
  });

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏘️ Nova Aldeia / Organização">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <Input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Junta de Freguesia de Aldeia" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.tipoOrganizacao} onChange={(e: any) => setForm({ ...form, tipoOrganizacao: e.target.value })}>
            <option value="aldeia">Aldeia</option>
            <option value="escola">Escola</option>
            <option value="clube">Clube/Associação</option>
            <option value="comite">Comité de Festas</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.pt" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <Input type="tel" value={form.telefone} onChange={(e: any) => setForm({ ...form, telefone: e.target.value })} placeholder="912 345 678" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Localização *</label>
          <Input value={form.localizacao} onChange={(e: any) => setForm({ ...form, localizacao: e.target.value })} placeholder="Ex: Castelo de Paiva, Portugal" />
        </div>
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-500 to-green-500">
          <Plus className="w-4 h-4 mr-2" /> Criar Aldeia
        </UIButton>
      </div>
    </Modal>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SuperAdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies/localStorage
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    localStorage.clear();
    // Redirect to home
    router.push('/');
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCriarAldeia, setShowCriarAldeia] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats mockadas (em produção viriam da API)
  const stats: StatsGlobal = {
    totalAldeias: 47,
    aldeiasAtivas: 38,
    totalUsuarios: 2847,
    totalCampanhas: 156,
    campanhasAtivas: 42,
    receitaTotal: 284500,
    receitaMes: 45600,
    usuariosNovosMes: 234
  };

  // Audit logs mockados
  const auditLogs: AuditLog[] = [
    { id: '1', acao: 'CREATE_ALDEIA', utilizador: 'Admin', entidade: 'Aldeia', entidadeId: '123', timestamp: new Date().toISOString(), ip: '192.168.1.1' },
    { id: '2', acao: 'UPDATE_USER', utilizador: 'SuperAdmin', entidade: 'User', entidadeId: '456', timestamp: new Date(Date.now() - 3600000).toISOString(), ip: '192.168.1.2' },
    { id: '3', acao: 'DELETE_CAMPANHA', utilizador: 'Admin', entidade: 'Campanha', entidadeId: '789', timestamp: new Date(Date.now() - 7200000).toISOString(), ip: '192.168.1.3' },
  ];

  // Mock aldeias
  useEffect(() => {
    setAldeias([
      { id: '1', nome: 'Junta de Freguesia Aldeia Nova', tipoOrganizacao: 'aldeia', localizacao: 'Aveiro', email: 'junta@aldeia.pt', telefone: '234 123 456', estado: 'ativa', createdAt: '2024-01-15', usuariosAtivos: 45, campanhasAtivas: 3, receitaTotal: 12500 },
      { id: '2', nome: 'Associação Cultural Festas', tipoOrganizacao: 'comite', localizacao: 'Coimbra', email: 'festas@cultural.pt', telefone: '239 987 654', estado: 'ativa', createdAt: '2024-02-20', usuariosAtivos: 28, campanhasAtivas: 2, receitaTotal: 8900 },
      { id: '3', nome: 'Escola Básica Aldeia', tipoOrganizacao: 'escola', localizacao: 'Porto', email: 'eb@aldeia.pt', telefone: '225 456 789', estado: 'pendente', createdAt: '2024-03-10', usuariosAtivos: 0, campanhasAtivas: 0, receitaTotal: 0 },
      { id: '4', nome: 'Clube Desportivo Local', tipoOrganizacao: 'clube', localizacao: 'Lisboa', email: 'cd@local.pt', telefone: '214 321 987', estado: 'suspensa', createdAt: '2023-11-05', usuariosAtivos: 12, campanhasAtivas: 0, receitaTotal: 2300 },
    ]);
    setLoading(false);
  }, []);

  const aldeiasFiltradas = aldeias.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCriarAldeia = (data: any) => {
    console.log('Criar aldeia:', data);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'aldeias', label: 'Aldeias', icon: Building2 },
    { id: 'usuarios', label: 'Utilizadores', icon: Users },
    { id: 'auditoria', label: 'Auditoria', icon: Shield },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 via-green-600 to-red-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-800">Super Admin</h1>
                <p className="text-sm text-gray-500">Painel de Gestão Global</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                SA
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
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
                    <StatsCard titulo="Total Aldeias" valor={stats.totalAldeias} variacao="+3" icon={Building2} cor="text-red-600" />
                    <StatsCard titulo="Utilizadores" valor={stats.totalUsuarios.toLocaleString()} variacao="+234" icon={Users} cor="text-blue-600" />
                    <StatsCard titulo="Campanhas Ativas" valor={stats.campanhasAtivas} icon={Gamepad2} cor="text-green-600" />
                    <StatsCard titulo="Receita Total" valor={`€${(stats.receitaTotal / 1000).toFixed(1)}k`} variacao="+€12k" icon={DollarSign} cor="text-amber-600" />
                  </div>

                  {/* Charts Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <UICard className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Receita Mensal
                      </h3>
                      <div className="h-48 flex items-end gap-2">
                        {[65, 45, 78, 52, 89, 70, 95].map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1 }}
                            className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Jan</span><span>Jul</span>
                      </div>
                    </UICard>

                    <UICard className="p-6">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Estado das Aldeias
                      </h3>
                      <div className="flex items-center justify-center gap-8">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="50" stroke="#E5E7EB" strokeWidth="20" fill="none" />
                            <circle cx="64" cy="64" r="50" stroke="#16A34A" strokeWidth="20" fill="none" strokeDasharray={`${(38 / 47) * 314} 314`} />
                            <circle cx="64" cy="64" r="50" stroke="#F59E0B" strokeWidth="20" fill="none" strokeDasharray={`${(6 / 47) * 314} 314`} strokeDashoffset={`-${(38 / 47) * 314}`} />
                            <circle cx="64" cy="64" r="50" stroke="#DC2626" strokeWidth="20" fill="none" strokeDasharray={`${(3 / 47) * 314} 314`} strokeDashoffset={`-${((38 + 6) / 47) * 314}`} />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> 38 Ativas</p>
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500" /> 6 Pendentes</p>
                          <p className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> 3 Suspensas</p>
                        </div>
                      </div>
                    </UICard>
                  </div>

                  {/* Recent Activity */}
                  <UICard className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      Atividade Recente
                    </h3>
                    <AuditLogs logs={auditLogs} />
                  </UICard>
                </motion.div>
              )}

              {/* ALDEIAS TAB */}
              {activeTab === 'aldeias' && (
                <motion.div key="aldeias" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-black">Aldeias & Organizações</h2>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e: any) => setSearchTerm(e.target.value)}
                          placeholder="Pesquisar..."
                          className="pl-10"
                        />
                      </div>
                      <UIButton onClick={() => setShowCriarAldeia(true)} className="bg-gradient-to-r from-red-500 to-green-500">
                        <Plus className="w-4 h-4 mr-2" /> Nova Aldeia
                      </UIButton>
                    </div>
                  </div>

                  <UICard className="overflow-hidden">
                    <AldeiasTable
                      aldeias={aldeiasFiltradas}
                      onEdit={(a) => console.log('Edit', a)}
                      onVer={(a) => console.log('Ver', a)}
                      onDelete={(a) => console.log('Delete', a)}
                    />
                  </UICard>
                </motion.div>
              )}

              {/* USUARIOS TAB */}
              {activeTab === 'usuarios' && (
                <motion.div key="usuarios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Gestão de Utilizadores</h2>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Gestão de utilizadores globais</p>
                      <p className="text-sm text-gray-400">Funcionalidade em desenvolvimento</p>
                    </div>
                  </UICard>
                </motion.div>
              )}

              {/* AUDITORIA TAB */}
              {activeTab === 'auditoria' && (
                <motion.div key="auditoria" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-black">Logs de Auditoria</h2>
                      <UIButton variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Exportar
                      </UIButton>
                    </div>
                    <AuditLogs logs={auditLogs} />
                  </UICard>
                </motion.div>
              )}

              {/* CONFIG TAB */}
              {activeTab === 'config' && (
                <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Configurações Globais</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block font-bold mb-2">Taxa de Plataforma (%)</label>
                        <Input type="number" value={5} className="max-w-xs" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Taxa Stripe (%)</label>
                        <Input type="number" value={2.5} className="max-w-xs" />
                      </div>
                      <div>
                        <label className="block font-bold mb-2">Comissão Vendedor Padrão (%)</label>
                        <Input type="number" value={10} className="max-w-xs" />
                      </div>
                      <UIButton className="bg-gradient-to-r from-red-500 to-green-500">
                        Guardar Alterações
                      </UIButton>
                    </div>
                  </UICard>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Modal Criar Aldeia */}
      <ModalCriarAldeia
        isOpen={showCriarAldeia}
        onClose={() => setShowCriarAldeia(false)}
        onSave={handleCriarAldeia}
      />
    </div>
  );
}
