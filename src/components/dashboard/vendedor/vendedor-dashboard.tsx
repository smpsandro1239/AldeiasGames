/**
 * VendedorDashboard.tsx
 * Dashboard completo do Vendedor
 * Design: Festivo português, premium, mobile-first
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  QrCode,
  Ticket,
  History,
  Wallet,
  Plus,
  Search,
  Bell,
  Camera,
  BarChart3,
  Calendar,
  Clock,
  ChevronRight,
  X,
  CheckCircle,
  Copy,
  Share2,
  Star,
  PartyPopper,
  Users,
  Gamepad2,
  WalletCards,
  Receipt,
  RefreshCw,
  TrendingDown,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

// ============================================
// LOGOUT HANDLER
// ============================================

function handleLogout() {
  console.log('Vendedor logout clicked');
  alert('Vendedor logout clicked!');
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
  tipo: string;
  preco: number;
 stock: number;
  Vendidas: number;
}

interface Venda {
  id: string;
  campanha: string;
  quantidade: number;
  valor: number;
  comissao: number;
  timestamp: string;
  comprovativo?: string;
}

interface StatsVendedor {
  vendasHoje: number;
  vendasSemana: number;
  comissaoHoje: number;
  comissaoSemana: number;
  ticketMedio: number;
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

function Modal({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={`bg-white rounded-2xl ${widths[size]} w-full max-h-[90vh] overflow-y-auto`}>
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

function StatsCard({ titulo, valor, variacao, icon: Icon, cor, grande = false }: { titulo: string; valor: string | number; variacao?: string; icon: React.ElementType; cor: string; grande?: boolean }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`bg-white rounded-2xl p-5 shadow-lg border border-gray-100 ${grande ? 'col-span-2' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{titulo}</p>
          <p className={`text-3xl font-black mt-2 ${cor}`}>{valor}</p>
          {variacao && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${variacao.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {variacao.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
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
// TERMINAL DE VENDA
// ============================================

function TerminalVenda({ campanhas, onVender }: { campanhas: Campanha[]; onVender: (campanha: Campanha, quantidade: number) => void }) {
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const total = campanhaSelecionada ? campanhaSelecionada.preco * quantidade : 0;

  const handleConfirmar = () => {
    if (campanhaSelecionada) {
      onVender(campanhaSelecionada, quantidade);
      setShowConfirm(true);
    }
  };

  if (showConfirm) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-12">
        <motion.div animate={{ scale: [1, 1.2, 1] }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-black text-green-600 mb-2">Venda Efetuada!</h3>
        <p className="text-gray-500 mb-4">O comprovativo foi gerado</p>
        <div className="flex gap-3 justify-center">
          <UIButton variant="outline" onClick={() => { setShowConfirm(false); setCampanhaSelecionada(null); setQuantidade(1); }}>
            Nova Venda
          </UIButton>
          <UIButton className="bg-green-600">Ver Comprovativo</UIButton>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg mb-4">Selecionar Campanha</h3>
      
      {!campanhaSelecionada ? (
        <div className="grid gap-3">
          {campanhas.map((c) => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCampanhaSelecionada(c)}
              className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-indigo-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                  🎫
                </div>
                <div className="text-left">
                  <p className="font-bold">{c.titulo}</p>
                  <p className="text-sm text-gray-500">€{c.preco.toFixed(2)} cada</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
            <button onClick={() => setCampanhaSelecionada(null)} className="text-indigo-600 hover:underline">
              ← Voltar
            </button>
            <div className="flex-1">
              <p className="font-bold">{campanhaSelecionada.titulo}</p>
              <p className="text-sm text-indigo-600">€{campanhaSelecionada.preco.toFixed(2)} cada</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantidade</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl">-</button>
              <input 
                type="number" 
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center text-2xl font-bold py-2 border-2 border-gray-200 rounded-xl"
              />
              <button onClick={() => setQuantidade(quantidade + 1)} className="w-12 h-12 bg-gray-100 rounded-xl font-bold text-xl">+</button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between text-lg">
              <span>Total:</span>
              <span className="font-black text-2xl text-green-600">€{total.toFixed(2)}</span>
            </div>
          </div>

          <UIButton onClick={handleConfirmar} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-lg">
            <CheckCircle className="w-5 h-5 mr-2" /> Confirmar Venda
          </UIButton>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function VendedorDashboard() {
  const [activeTab, setActiveTab] = useState('venda');
  const [showScanner, setShowScanner] = useState(false);

  // Stats mockadas
  const stats: StatsVendedor = {
    vendasHoje: 125.50,
    vendasSemana: 875.25,
    comissaoHoje: 12.55,
    comissaoSemana: 87.53,
    ticketMedio: 8.50
  };

  // Campanhas disponíveis
  const [campanhas] = useState<Campanha[]>([
    { id: '1', titulo: 'Raspadinha São João', tipo: 'raspadinha', preco: 2.50, stock: 500, Vendidas: 320 },
    { id: '2', titulo: 'Raspadinha Carnaval', tipo: 'raspadinha', preco: 2, stock: 1000, Vendidas: 650 },
    { id: '3', titulo: 'Poio da Vaca Premium', tipo: 'poio', preco: 5, stock: 200, Vendidas: 45 },
  ]);

  // Histórico de vendas
  const [vendas, setVendas] = useState<Venda[]>([
    { id: '1', campanha: 'Raspadinha São João', quantidade: 2, valor: 5, comissao: 0.50, timestamp: new Date().toISOString() },
    { id: '2', campanha: 'Raspadinha Carnaval', quantidade: 1, valor: 2, comissao: 0.20, timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', campanha: 'Poio da Vaca Premium', quantidade: 1, valor: 5, comissao: 0.50, timestamp: new Date(Date.now() - 7200000).toISOString() },
  ]);

  const handleVender = (campanha: Campanha, quantidade: number) => {
    const valor = campanha.preco * quantidade;
    const comissao = valor * 0.10;
    
    const novaVenda: Venda = {
      id: Date.now().toString(),
      campanha: campanha.titulo,
      quantidade,
      valor,
      comissao,
      timestamp: new Date().toISOString()
    };
    
    setVendas([novaVenda, ...vendas]);
    
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });
  };

  const tabs = [
    { id: 'venda', label: 'Vender', icon: DollarSign },
    { id: 'campanhas', label: 'Campanhas', icon: Gamepad2 },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black">Vendas</h1>
                <p className="text-sm text-gray-500">Bom dia! 👋</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-500">Comissão Hoje</p>
                <p className="font-bold text-green-600">€{stats.comissaoHoje.toFixed(2)}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-xl text-red-600" 
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                V
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Stats Rápidas */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500">Vendas Hoje</p>
            <p className="text-xl font-black text-green-600">€{stats.vendasHoje.toFixed(2)}</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-xs text-gray-500">Comissão Hoje</p>
            <p className="text-xl font-black text-indigo-600">€{stats.comissaoHoje.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 p-1 bg-white rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* VENDA TAB */}
          {activeTab === 'venda' && (
            <motion.div key="venda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <UICard className="p-4">
                <div className="flex gap-2 mb-4">
                  <UIButton 
                    variant={!showScanner ? 'primary' : 'outline'} 
                    onClick={() => setShowScanner(false)}
                    className="flex-1"
                  >
                    <Ticket className="w-4 h-4 mr-2" /> Manual
                  </UIButton>
                  <UIButton 
                    variant={showScanner ? 'primary' : 'outline'} 
                    onClick={() => setShowScanner(true)}
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" /> QR Code
                  </UIButton>
                </div>
                
                {showScanner ? (
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aceder à câmera para escanear</p>
                    <UIButton className="mt-4 bg-indigo-600">
                      <Camera className="w-4 h-4 mr-2" /> Abrir Câmera
                    </UIButton>
                  </div>
                ) : (
                  <TerminalVenda campanhas={campanhas} onVender={handleVender} />
                )}
              </UICard>
            </motion.div>
          )}

          {/* CAMPANHAS TAB */}
          {activeTab === 'campanhas' && (
            <motion.div key="campanhas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              {campanhas.map((c) => (
                <UICard key={c.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                        🎫
                      </div>
                      <div>
                        <p className="font-bold">{c.titulo}</p>
                        <p className="text-sm text-gray-500">€{c.preco.toFixed(2)} • Stock: {c.stock}</p>
                      </div>
                    </div>
                    <Badge variant="success">Ativa</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Vendidas</p>
                      <p className="font-bold">{c.Vendidas}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="font-bold">{c.stock - c.Vendidas}</p>
                    </div>
                    <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-green-600">Receita</p>
                      <p className="font-bold text-green-600">€{(c.Vendidas * c.preco).toFixed(0)}</p>
                    </div>
                  </div>
                </UICard>
              ))}
            </motion.div>
          )}

          {/* HISTORICO TAB */}
          {activeTab === 'historico' && (
            <motion.div key="historico" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Hoje</h3>
              </div>
              {vendas.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border"
                >
                  <div>
                    <p className="font-medium">{v.campanha}</p>
                    <p className="text-sm text-gray-500">{v.quantidade}x • {new Date(v.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+€{v.valor.toFixed(2)}</p>
                    <p className="text-xs text-indigo-500">+€{v.comissao.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
