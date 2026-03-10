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
  X,
  Database,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

import { useRouter } from 'next/navigation';

// ============================================
// HELPER: Fetch with Auth
// ============================================
async function fetchWithAuth(url: string, options: any = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

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
  tipo?: string;
  jogo?: string;
  valor?: number;
  data?: string;
}

interface Plano {
  id: string;
  nome: string;
  precoMensal: number;
  maxEventos: number;
  maxJogos: number;
  maxParticipacoes: number;
  descricao?: string;
}

interface UserAdmin {
  id: string;
  nome: string;
  email: string;
  role: string;
  aldeiaId?: string;
  createdAt: string;
  aldeia?: { id: string; nome: string };
}

interface Backup {
  nome: string;
  tamanho: number;
  criadoEm: string;
  modificadoEm: string;
}

interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  estado: string;
  aldeiaId: string;
  aldeia?: { nome: string };
  imagemBase64?: string;
  _count?: { jogos: number };
}

interface Jogo {
  id: string;
  titulo: string;
  tipo: string;
  estado: string;
  eventoId: string;
  config: string;
  _count?: { participacoes: number };
}

// ============================================
// COMPONENTES UI BÁSICOS
// ============================================

function Input({ value, onChange, placeholder, type = 'text', className = '' }: any) {
  return (
    <input
      type={type}
      value={value ?? ''}
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
            <th className="text-left p-4 font-bold text-gray-600">Admins</th>
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
                <div className="flex -space-x-2">
                  {[1, 2].map(j => (
                    <div key={j} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold" title="Admin Name">
                      {aldeia.nome.charAt(0)}
                    </div>
                  ))}
                  <button className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-600 hover:bg-indigo-100" title="Gerir Admins">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  <p><span className="font-bold">{aldeia.usuariosAtivos}</span> usuários</p>
                  <p><span className="font-bold">{aldeia.campanhasAtivas}</span> campanhas</p>
                  <p className="text-green-600 font-bold">€{(aldeia.receitaTotal || 0).toLocaleString()}</p>
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
          {getIcon(log.acao || log.tipo || '')}
          <div className="flex-1">
            <p className="text-sm font-medium">{log.acao || (log.tipo === 'participacao' ? 'Nova Participação' : 'Nova Venda')}</p>
            <p className="text-xs text-gray-500">{log.utilizador} • {log.entidade || log.jogo} {log.entidadeId ? `#${log.entidadeId}` : ''}</p>
          </div>
          <div className="text-right">
            {log.valor && <p className="text-sm font-bold text-green-600">€{log.valor?.toFixed(2)}</p>}
            <p className="text-xs text-gray-400">{new Date(log.timestamp || log.data || new Date()).toLocaleString('pt-PT')}</p>
            {log.ip && <p className="text-xs text-gray-400">{log.ip}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// MODAL CRIAR ALDEIA
// ============================================

function ModalAldeia({ isOpen, onClose, onSave, aldeiaToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; aldeiaToEdit?: Aldeia | null }) {
  const [form, setForm] = useState({
    nome: '',
    tipoOrganizacao: 'aldeia',
    email: '',
    telefone: '',
    localizacao: '',
    morada: '',
    logo: '',
    estado: 'pendente'
  });

  useEffect(() => {
    if (aldeiaToEdit) {
      setForm({
        nome: aldeiaToEdit.nome || '',
        tipoOrganizacao: aldeiaToEdit.tipoOrganizacao || 'aldeia',
        email: aldeiaToEdit.email || '',
        telefone: aldeiaToEdit.telefone || '',
        localizacao: aldeiaToEdit.localizacao || '',
        morada: (aldeiaToEdit as any).morada || '',
        logo: (aldeiaToEdit as any).logoBase64 || '',
        estado: (aldeiaToEdit as any).estado || 'pendente'
      });
    } else {
      setForm({
        nome: '',
        tipoOrganizacao: 'aldeia',
        email: '',
        telefone: '',
        localizacao: '',
        morada: '',
        logo: '',
        estado: 'pendente'
      });
    }
  }, [aldeiaToEdit, isOpen]);

  const handleSubmit = () => {
    // Validar campos básicos antes de enviar
    if (!form.nome || !form.email || !form.localizacao) {
      alert('Por favor preencha todos os campos obrigatórios (*)');
      return;
    }
    // No frontend usamos 'logo', mas o backend espera 'logoBase64' no schema
    const dataToSend = { ...form, logoBase64: form.logo };
    onSave(dataToSend);
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
        <div>
          <label className="block text-sm font-medium mb-1">Estado *</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            value={form.estado}
            onChange={(e: any) => setForm({ ...form, estado: e.target.value })}
          >
            <option value="pendente">Pendente</option>
            <option value="ativa">Ativa</option>
            <option value="suspensa">Suspensa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Logo da Aldeia (Opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setForm({ ...form, logo: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {form.logo && (
            <div className="mt-2">
              <img src={form.logo} alt="Preview" className="w-16 h-16 object-contain rounded border" />
            </div>
          )}
        </div>
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-500 to-green-500">
          {aldeiaToEdit ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {aldeiaToEdit ? "Guardar Alterações" : "Criar Aldeia"}
        </UIButton>
      </div>
    </Modal>
  );
}

// ============================================
// MODAL PLANOS
// ============================================

function ModalPlano({ isOpen, onClose, onSave, planoToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; planoToEdit: Plano | null }) {
  const [form, setForm] = useState({
    nome: '',
    precoMensal: 0,
    maxEventos: 3,
    maxJogos: 10,
    maxParticipacoes: 100,
  });

  useEffect(() => {
    if (planoToEdit) {
      setForm(planoToEdit as any);
    } else {
      setForm({ nome: '', precoMensal: 0, maxEventos: 3, maxJogos: 10, maxParticipacoes: 100 });
    }
  }, [planoToEdit, isOpen]);

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={planoToEdit ? "✏️ Editar Plano" : "➕ Novo Plano"}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Plano *</label>
          <Input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Starter" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preço Mensal (€) *</label>
          <Input type="number" value={form.precoMensal} onChange={(e: any) => setForm({ ...form, precoMensal: parseFloat(e.target.value) })} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Eventos</label>
            <Input type="number" value={form.maxEventos} onChange={(e: any) => setForm({ ...form, maxEventos: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Jogos</label>
            <Input type="number" value={form.maxJogos} onChange={(e: any) => setForm({ ...form, maxJogos: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Particip.</label>
            <Input type="number" value={form.maxParticipacoes} onChange={(e: any) => setForm({ ...form, maxParticipacoes: parseInt(e.target.value) })} />
          </div>
        </div>
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-red-500 to-green-500">
          {planoToEdit ? "Guardar Alterações" : "Criar Plano"}
        </UIButton>
      </div>
    </Modal>
  );
}

// ============================================
// MODAL CRIAR UTILIZADOR
// ============================================

function ModalUser({ isOpen, onClose, onSave, aldeias, userToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; aldeias: Aldeia[]; userToEdit?: UserAdmin | null }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    password: '',
    role: 'vendedor',
    aldeiaId: ''
  });

  useEffect(() => {
    if (userToEdit) {
      setForm({
        nome: userToEdit.nome,
        email: userToEdit.email,
        password: '', // Don't pre-fill password
        role: userToEdit.role.toLowerCase(),
        aldeiaId: userToEdit.aldeiaId || ''
      });
    } else {
      setForm({
        nome: '',
        email: '',
        password: '',
        role: 'vendedor',
        aldeiaId: ''
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = () => {
    if (!form.nome || !form.email || (!userToEdit && !form.password)) {
      alert('Preencha os campos obrigatórios (*)');
      return;
    }
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👤 Adicionar Utilizador">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <Input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do utilizador" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.pt" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <Input type="password" value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value })} placeholder="Senha de acesso" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.role} onChange={(e: any) => setForm({ ...form, role: e.target.value })}>
              <option value="cliente">Jogador / Cliente</option>
              <option value="vendedor">Vendedor</option>
              <option value="aldeia_admin">Admin Aldeia</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aldeia (se aplicável)</label>
            <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.aldeiaId} onChange={(e: any) => setForm({ ...form, aldeiaId: e.target.value })}>
              <option value="">Selecione...</option>
              {aldeias.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
        </div>
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500">
          <UserPlus className="w-4 h-4 mr-2" /> {userToEdit ? "Guardar Alterações" : "Criar Utilizador"}
        </UIButton>
      </div>
    </Modal>
  );
}

// ============================================
// MODAL EVENTO
// ============================================

function ModalEvento({ isOpen, onClose, onSave, aldeias, eventoToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; aldeias: Aldeia[]; eventoToEdit?: Evento | null }) {
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    estado: 'ativo',
    aldeiaId: '',
    imagem: ''
  });

  useEffect(() => {
    if (eventoToEdit) {
      setForm({
        nome: eventoToEdit.titulo,
        descricao: eventoToEdit.descricao || '',
        dataInicio: eventoToEdit.dataInicio.split('T')[0],
        dataFim: eventoToEdit.dataFim?.split('T')[0] || '',
        estado: eventoToEdit.estado,
        aldeiaId: eventoToEdit.aldeiaId,
        imagem: eventoToEdit.imagemBase64 || ''
      });
    } else {
      setForm({ nome: '', descricao: '', dataInicio: '', dataFim: '', estado: 'ativo', aldeiaId: '', imagem: '' });
    }
  }, [eventoToEdit, isOpen]);

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={eventoToEdit ? "✏️ Editar Evento" : "📅 Novo Evento"}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título do Evento *</label>
          <Input value={form.nome} onChange={(e: any) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Festas de Verão 2024" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aldeia Responsável *</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.aldeiaId} onChange={(e: any) => setForm({ ...form, aldeiaId: e.target.value })}>
            <option value="">Selecione...</option>
            {aldeias.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início *</label>
            <Input type="date" value={form.dataInicio} onChange={(e: any) => setForm({ ...form, dataInicio: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <Input type="date" value={form.dataFim} onChange={(e: any) => setForm({ ...form, dataFim: e.target.value })} />
          </div>
        </div>
        <UIButton onClick={handleSubmit} className="w-full bg-gradient-to-r from-amber-500 to-orange-500">
          {eventoToEdit ? "Guardar Alterações" : "Criar Evento"}
        </UIButton>
      </div>
    </Modal>
  );
}

// ============================================
// MODAL JOGO
// ============================================

function ModalJogo({ isOpen, onClose, onSave, eventoSelecionado, jogoToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; eventoSelecionado?: Evento | null; jogoToEdit?: Jogo | null }) {
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'rifa',
    estado: 'aberto',
    eventoId: '',
    precoParticipacao: 1.0,
    config: '{}'
  });

  useEffect(() => {
    if (jogoToEdit) {
      setForm({
        titulo: jogoToEdit.titulo,
        tipo: jogoToEdit.tipo,
        estado: jogoToEdit.estado,
        eventoId: jogoToEdit.eventoId,
        precoParticipacao: (jogoToEdit as any).precoParticipacao || 1.0,
        config: typeof jogoToEdit.config === 'string' ? jogoToEdit.config : JSON.stringify(jogoToEdit.config)
      });
    } else if (eventoSelecionado) {
      setForm({ titulo: '', tipo: 'rifa', estado: 'aberto', eventoId: eventoSelecionado.id, precoParticipacao: 1.0, config: '{}' });
    }
  }, [jogoToEdit, eventoSelecionado, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={jogoToEdit ? "✏️ Editar Jogo" : "🎮 Novo Jogo"}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Evento: <span className="font-bold">{eventoSelecionado?.titulo}</span></p>
        <div>
          <label className="block text-sm font-medium mb-1">Título do Jogo *</label>
          <Input value={form.titulo} onChange={(e: any) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Cabaz de Natal" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Jogo</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" value={form.tipo} onChange={(e: any) => setForm({ ...form, tipo: e.target.value })}>
            <option value="rifa">Rifa Clássica</option>
            <option value="raspadinha">Raspadinha Digital</option>
            <option value="sorteio_vendas">Sorteio por Vendas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preço por Participação (€) *</label>
          <Input type="number" step="0.5" value={form.precoParticipacao} onChange={(e: any) => setForm({ ...form, precoParticipacao: parseFloat(e.target.value) })} />
        </div>
        <UIButton onClick={() => { onSave(form); onClose(); }} className="w-full bg-indigo-600 font-bold">
          {jogoToEdit ? "Guardar Alterações" : "Adicionar Jogo"}
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
  const [showModalAldeia, setShowModalAldeia] = useState(false);
  const [showModalPlano, setShowModalPlano] = useState(false);
  const [showModalUser, setShowModalUser] = useState(false);
  const [showModalEvento, setShowModalEvento] = useState(false);
  const [showModalJogo, setShowModalJogo] = useState(false);

  const [aldeiaEditing, setAldeiaEditing] = useState<Aldeia | null>(null);
  const [planoEditing, setPlanoEditing] = useState<Plano | null>(null);
  const [userEditing, setUserEditing] = useState<UserAdmin | null>(null);
  const [eventoEditing, setEventoEditing] = useState<Evento | null>(null);
  const [jogoEditing, setJogoEditing] = useState<Jogo | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [aldeias, setAldeias] = useState<Aldeia[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [usuarios, setUsuarios] = useState<UserAdmin[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Config Setup
  const [taxaPlataforma, setTaxaPlataforma] = useState(5);
  const [taxaStripe, setTaxaStripe] = useState(2.5);
  const [comissaoVendedor, setComissaoVendedor] = useState(10);

  const [stats, setStats] = useState<StatsGlobal>({
    totalAldeias: 0,
    aldeiasAtivas: 0,
    totalUsuarios: 0,
    totalCampanhas: 0,
    campanhasAtivas: 0,
    receitaTotal: 0,
    receitaMes: 0,
    usuariosNovosMes: 0
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Carregar dados reais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Stats Globais
        const reqStats = await fetchWithAuth('/api/stats/dashboard');
        if (reqStats.ok) {
          const res = await reqStats.json();
          if (res.stats) {
            setStats({
              totalAldeias: res.stats.totalAldeias || 0,
              aldeiasAtivas: res.stats.totalAldeias || 0,
              totalUsuarios: res.stats.totalUsers || 0,
              totalCampanhas: res.stats.totalJogos || 0,
              campanhasAtivas: res.stats.totalJogos || 0,
              receitaTotal: res.stats.valorTotal || 0,
              receitaMes: res.stats.valorTotal || 0,
              usuariosNovosMes: 0
            });
          }
          if (res.activity) setAuditLogs(res.activity);
        }

        // Aldeias
        const reqAldeias = await fetchWithAuth('/api/aldeias');
        if (reqAldeias.ok) {
          const res = await reqAldeias.json();
          // Transform if needed or just use directly
          const mapAldeias = Array.isArray(res) ? res.map(a => ({
            ...a,
            estado: a.verificada ? 'ativa' : 'pendente',
            usuariosAtivos: a.users?.length || 0,
            campanhasAtivas: a.eventos?.length || 0,
            receitaTotal: 0
          })) : [];
          setAldeias(mapAldeias);
        }

        // Planos
        const reqPlanos = await fetchWithAuth('/api/planos');
        if (reqPlanos.ok) {
          const res = await reqPlanos.json();
          setPlanos(Array.isArray(res) ? res : []);
        }

        // Utilizadores
        const reqUsers = await fetchWithAuth('/api/users');
        if (reqUsers.ok) {
          const res = await reqUsers.json();
          setUsuarios(Array.isArray(res) ? res : []);
        }

        // Backups
        const reqBackups = await fetchWithAuth('/api/backup');
        if (reqBackups.ok) {
          const res = await reqBackups.json();
          if (res.backups) setBackups(res.backups);
        }

        // Eventos
        const reqEventos = await fetchWithAuth('/api/eventos');
        if (reqEventos.ok) {
          const res = await reqEventos.json();
          setEventos(Array.isArray(res) ? res : []);
        }

        // Jogos
        const reqJogos = await fetchWithAuth('/api/jogos');
        if (reqJogos.ok) {
          const res = await reqJogos.json();
          setJogos(Array.isArray(res) ? res : []);
        }

      } catch (e) {
        console.error('Failed to load superadmin data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const aldeiasFiltradas = aldeias.filter(a =>
    (a.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.localizacao?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSalvarAldeia = async (data: any) => {
    try {
      const isEdit = !!aldeiaEditing;
      const url = isEdit ? `/api/aldeias/${aldeiaEditing!.id}` : '/api/aldeias';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const nova = await res.json();
        if (isEdit) {
          setAldeias(aldeias.map(a => a.id === nova.id ? { ...a, ...nova, estado: nova.estado || a.estado } : a));
        } else {
          setAldeias([...aldeias, {
            ...nova,
            estado: nova.estado || 'pendente',
            usuariosAtivos: 0,
            campanhasAtivas: 0,
            receitaTotal: 0
          }]);
        }
        setShowModalAldeia(false);
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        const err = await res.json();
        alert(`Erro ao salvar aldeia: ${err.error || 'Erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro a salvar aldeia:', e);
      alert('Erro de conexão ao salvar aldeia.');
    }
  };

  const handleDeleteAldeia = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta aldeia?')) return;
    try {
      const res = await fetchWithAuth(`/api/aldeias/${id}`, { method: 'DELETE' });
      if (res.ok) setAldeias(aldeias.filter(a => a.id !== id));
    } catch (e) {
      console.error('Erro a eliminar aldeia:', e);
    }
  };

  const handleSalvarPlano = async (data: any) => {
    try {
      // Determina se é Update ou Create com base na presença do id
      const isEdit = !!planoEditing?.id;
      const url = isEdit ? `/api/planos/${planoEditing.id}` : '/api/planos';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const plano = await res.json();
        if (isEdit) {
          setPlanos(planos.map(p => p.id === plano.id ? plano : p));
        } else {
          setPlanos([...planos, plano]);
        }
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.8 } });
      }
    } catch (e) {
      console.error('Erro ao guardar plano:', e);
    }
  };

  const handleDeletePlano = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar este plano?')) return;
    try {
      const res = await fetchWithAuth(`/api/planos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlanos(planos.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error('Erro a apagar plano', e);
    }
  };

  const handleSalvarUser = async (data: any) => {
    try {
      const isEdit = !!userEditing;
      const url = isEdit ? `/api/users/${userEditing!.id}` : '/api/users';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const novo = await res.json();
        if (isEdit) {
          setUsuarios(usuarios.map(u => u.id === novo.id ? { ...u, ...novo } : u));
        } else {
          setUsuarios([novo, ...usuarios]);
        }
        setShowModalUser(false);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        const err = await res.json();
        alert(`Erro ao salvar utilizador: ${err.error || 'Erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro a salvar utilizador', e);
      alert('Erro de conexão ao salvar utilizador.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador?')) return;
    try {
      const res = await fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsuarios(usuarios.filter(u => u.id !== id));
      } else {
        const err = await res.json();
        alert(`Erro ao eliminar: ${err.error || 'Erro desconhecido'}`);
      }
    } catch (e) {
      console.error('Erro a eliminar utilizador', e);
      alert('Erro de conexão ao eliminar utilizador.');
    }
  };

  const handleSalvarEvento = async (data: any) => {
    try {
      const isEdit = !!eventoEditing;
      const url = isEdit ? `/api/eventos/${eventoEditing!.id}` : '/api/eventos';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const novo = await res.json();
        if (isEdit) {
          setEventos(eventos.map(e => e.id === novo.id ? { ...e, ...novo } : e));
        } else {
          setEventos([...eventos, novo]);
        }
      }
    } catch (e) {
      console.error('Erro a salvar evento', e);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este evento?')) return;
    try {
      const res = await fetchWithAuth(`/api/eventos/${id}`, { method: 'DELETE' });
      if (res.ok) setEventos(eventos.filter(e => e.id !== id));
    } catch (e) {
      console.error('Erro a eliminar evento', e);
    }
  };

  const handleCriarBackup = async () => {
    try {
      const res = await fetchWithAuth('/api/backup', { method: 'POST' });
      if (res.ok) {
        const raw = await res.json();
        if (raw.backup) setBackups([raw.backup, ...backups]);
        alert('Backup criado com sucesso!');
      }
    } catch (e) {
      console.error('Erro a criar backup', e);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Tens a certeza que desejas apagar o backup ${filename}?`)) return;
    try {
      const res = await fetchWithAuth(`/api/backup/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        setBackups(backups.filter(b => b.nome !== filename));
      }
    } catch (e) {
      console.error('Erro a apagar backup', e);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`ATENÇÃO: Restaurar o backup ${filename} irá substituir toda a base de dados atual. Continuar?`)) return;
    try {
      const res = await fetchWithAuth(`/api/backup/${filename}`, { method: 'POST' });
      if (res.ok) {
        alert('Sistema restaurado com sucesso! A página irá recarregar.');
        window.location.reload();
      }
    } catch (e) {
      console.error('Erro a restaurar backup', e);
    }
  };

  const handleDownloadBackup = (filename: string) => {
    window.open(`/api/backup/${filename}`, '_blank');
  };

  const handleExportCSV = async () => {
    // Real implementation would fetch from an export API
    alert('A gerar relatório CSV... O download começará em breve.');
    setTimeout(() => {
      alert('Relatório exportado com sucesso (Simulado)');
    }, 1500);
  };

  const handleSalvarJogo = async (data: any) => {
    try {
      const isEdit = !!jogoEditing;
      const url = isEdit ? `/api/jogos/${jogoEditing!.id}` : '/api/jogos';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const novo = await res.json();
        if (isEdit) {
          setJogos(jogos.map(j => j.id === novo.id ? { ...j, ...novo } : j));
        } else {
          setJogos([...jogos, novo]);
        }
      }
    } catch (e) {
      console.error('Erro a salvar jogo', e);
    }
  };

  const handleDeleteJogo = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este jogo?')) return;
    try {
      const res = await fetchWithAuth(`/api/jogos/${id}`, { method: 'DELETE' });
      if (res.ok) setJogos(jogos.filter(j => j.id !== id));
    } catch (e) {
      console.error('Erro a eliminar jogo', e);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'aldeias', label: 'Aldeias', icon: Building2 },
    { id: 'usuarios', label: 'Utilizadores', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'auditoria', label: 'Auditoria', icon: Shield },
    { id: 'backups', label: 'Backups', icon: Database },
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
                    <StatsCard titulo="Utilizadores" valor={(stats.totalUsuarios || 0).toLocaleString()} variacao="+234" icon={Users} cor="text-blue-600" />
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
                      <UIButton onClick={() => { setAldeiaEditing(null); setShowModalAldeia(true); }} className="bg-gradient-to-r from-red-500 to-green-500">
                        <Plus className="w-4 h-4 mr-2" /> Nova Aldeia
                      </UIButton>
                    </div>
                  </div>

                  <UICard className="overflow-hidden">
                    <AldeiasTable
                      aldeias={aldeiasFiltradas}
                      onEdit={(a) => { setAldeiaEditing(a); setShowModalAldeia(true); }}
                      onVer={(a) => router.push(`/aldeias/${a.id}`)}
                      onDelete={(a) => handleDeleteAldeia(a.id)}
                    />
                  </UICard>
                </motion.div>
              )}

              {/* USUARIOS TAB */}
              {activeTab === 'usuarios' && (
                <motion.div key="usuarios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Gestão de Utilizadores</h2>
                    <UIButton onClick={() => { setUserEditing(null); setShowModalUser(true); }} className="bg-gradient-to-r from-blue-500 to-indigo-500">
                      <UserPlus className="w-4 h-4 mr-2" /> Novo Utilizador
                    </UIButton>
                  </div>
                  <UICard className="overflow-hidden">
                    <table className="w-full text-left bg-white">
                      <thead className="border-b">
                        <tr>
                          <th className="p-4 text-gray-600 font-bold">Email</th>
                          <th className="p-4 text-gray-600 font-bold">Role</th>
                          <th className="p-4 text-gray-600 font-bold">Aldeia</th>
                          <th className="p-4 text-gray-600 font-bold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map(u => (
                          <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium">
                              {u.nome} <br />
                              <span className="text-sm font-normal text-gray-500">{u.email}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant={u.role === 'super_admin' ? 'error' : u.role === 'aldeia_admin' ? 'warning' : 'default'}>
                                {u.role}
                              </Badge>
                            </td>
                            <td className="p-4">{u.aldeia?.nome || '-'}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setUserEditing(u); setShowModalUser(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </UICard>
                </motion.div>
              )}

              {/* EVENTOS TAB */}
              {activeTab === 'eventos' && (
                <motion.div key="eventos" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Eventos & Jogos</h2>
                    <UIButton onClick={() => { setEventoEditing(null); setShowModalEvento(true); }} className="bg-gradient-to-r from-amber-500 to-orange-500">
                      <Plus className="w-4 h-4 mr-2" /> Novo Evento
                    </UIButton>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {eventos.map(e => (
                      <UICard key={e.id} className="overflow-hidden">
                        <div className="h-32 bg-gray-200 relative">
                          {e.imagemBase64 && <img src={e.imagemBase64} alt={e.titulo} className="w-full h-full object-cover" />}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button onClick={() => { setEventoEditing(e); setShowModalEvento(true); }} className="p-2 bg-white/90 rounded-lg shadow hover:bg-white"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteEvento(e.id)} className="p-2 bg-white/90 rounded-lg shadow hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-lg">{e.titulo}</h3>
                            <Badge variant={e.estado === 'ativo' ? 'success' : 'warning'}>{e.estado}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{e.aldeia?.nome} • {new Date(e.dataInicio).toLocaleDateString()}</p>

                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Jogos</h4>
                            {jogos.filter(j => j.eventoId === e.id).map(j => (
                              <div key={j.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                                <span>{j.titulo} <Badge variant="default">{j.tipo}</Badge></span>
                                <div className="flex gap-2">
                                  <button onClick={() => { setJogoEditing(j); setEventoEditing(e); setShowModalJogo(true); }} className="text-blue-600 hover:underline"><Edit className="w-3 h-3" /></button>
                                  <button onClick={() => handleDeleteJogo(j.id)} className="text-red-600 hover:underline"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => { setJogoEditing(null); setEventoEditing(e); setShowModalJogo(true); }} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all">
                              + Adicionar Jogo
                            </button>
                          </div>
                        </div>
                      </UICard>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AUDITORIA TAB */}
              {activeTab === 'auditoria' && (
                <motion.div key="auditoria" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-black">Logs de Auditoria</h2>
                      <UIButton variant="outline" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 mr-2" /> Exportar Relatório Global
                      </UIButton>
                    </div>
                    <AuditLogs logs={auditLogs} />
                  </UICard>
                </motion.div>
              )}

              {/* BACKUPS TAB */}
              {activeTab === 'backups' && (
                <motion.div key="backups" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">Backups do Sistema</h2>
                    <UIButton onClick={handleCriarBackup} className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                      <Database className="w-4 h-4 mr-2" /> Gerar Backup Manual
                    </UIButton>
                  </div>
                  <UICard className="overflow-hidden">
                    <table className="w-full text-left bg-white">
                      <thead className="border-b">
                        <tr>
                          <th className="p-4 text-gray-600 font-bold">Ficheiro</th>
                          <th className="p-4 text-gray-600 font-bold">Tamanho</th>
                          <th className="p-4 text-gray-600 font-bold">Data Criação</th>
                          <th className="p-4 text-gray-600 font-bold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backups.map((b, i) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-indigo-700">{b.nome}</td>
                            <td className="p-4 text-gray-600">{(b.tamanho / 1024 / 1024).toFixed(2)} MB</td>
                            <td className="p-4 text-gray-500">{new Date(b.criadoEm).toLocaleString('pt-PT')}</td>
                            <td className="p-4">
                              <button onClick={() => handleDownloadBackup(b.nome)} className="text-gray-500 hover:text-green-600 mr-3" title="Descarregar">
                                <Download className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleRestoreBackup(b.nome)} className="text-gray-500 hover:text-amber-600 mr-3" title="Restaurar Sistema">
                                <RefreshCw className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDeleteBackup(b.nome)} className="text-gray-500 hover:text-red-500" title="Apagar">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {backups.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum backup encontrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </UICard>
                </motion.div>
              )}

              {/* CONFIG TAB */}
              {activeTab === 'config' && (
                <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <UICard className="p-6">
                    <h2 className="text-2xl font-black mb-4">Configurações Globais</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Valores Globais */}
                      <div className="space-y-6">
                        <h3 className="font-bold text-lg border-b pb-2">Taxas do SaaS</h3>
                        <div>
                          <label className="block font-bold mb-2">Taxa de Plataforma (%)</label>
                          <Input type="number" value={taxaPlataforma} onChange={(e: any) => setTaxaPlataforma(Number(e.target.value))} className="max-w-xs" />
                        </div>
                        <div>
                          <label className="block font-bold mb-2">Taxa Stripe (%)</label>
                          <Input type="number" value={taxaStripe} onChange={(e: any) => setTaxaStripe(Number(e.target.value))} className="max-w-xs" />
                        </div>
                        <div>
                          <label className="block font-bold mb-2">Comissão Vendedor Padrão (%)</label>
                          <Input type="number" value={comissaoVendedor} onChange={(e: any) => setComissaoVendedor(Number(e.target.value))} className="max-w-xs" />
                        </div>
                        <UIButton className="bg-gradient-to-r from-red-500 to-green-500">
                          Guardar Alterações (Local)
                        </UIButton>
                      </div>

                      {/* CRUD Planos */}
                      <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                          <h3 className="font-bold text-lg">Planos de Subscrição</h3>
                          <UIButton variant="outline" size="sm" onClick={() => { setPlanoEditing(null); setShowModalPlano(true); }}>
                            <Plus className="w-4 h-4 mr-1" /> Novo
                          </UIButton>
                        </div>

                        <div className="space-y-3">
                          {planos.length === 0 ? (
                            <p className="text-gray-500 text-sm">Nenhum plano registado.</p>
                          ) : (
                            planos.map(plano => (
                              <div key={plano.id} className="flex flex-col p-4 bg-gray-50 border rounded-xl hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-bold text-indigo-700">{plano.nome}</h4>
                                    <p className="text-xl font-black">€{plano.precoMensal}<span className="text-xs text-gray-500 font-normal">/mês</span></p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => { setPlanoEditing(plano); setShowModalPlano(true); }} className="p-2 text-gray-500 hover:text-blue-500" title="Editar plano">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeletePlano(plano.id)} className="p-2 text-gray-500 hover:text-red-500" title="Eliminar plano">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-600">
                                  <span>Eventos: {plano.maxEventos}</span>
                                  <span>Jogos: {plano.maxJogos}</span>
                                  <span>Particip: {plano.maxParticipacoes}</span>
                                </div>
                              </div>
                            ))
                          )}
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

      {/* Modais CRUD */}
      <ModalAldeia
        isOpen={showModalAldeia}
        onClose={() => setShowModalAldeia(false)}
        onSave={handleSalvarAldeia}
        aldeiaToEdit={aldeiaEditing}
      />

      <ModalPlano
        isOpen={showModalPlano}
        onClose={() => setShowModalPlano(false)}
        onSave={handleSalvarPlano}
        planoToEdit={planoEditing}
      />

      <ModalUser
        isOpen={showModalUser}
        onClose={() => setShowModalUser(false)}
        onSave={handleSalvarUser}
        aldeias={aldeias}
        userToEdit={userEditing}
      />

      <ModalEvento
        isOpen={showModalEvento}
        onClose={() => setShowModalEvento(false)}
        onSave={handleSalvarEvento}
        aldeias={aldeias}
        eventoToEdit={eventoEditing}
      />

      <ModalJogo
        isOpen={showModalJogo}
        onClose={() => setShowModalJogo(false)}
        onSave={handleSalvarJogo}
        eventoSelecionado={eventoEditing}
        jogoToEdit={jogoEditing}
      />
    </div>
  );
}
