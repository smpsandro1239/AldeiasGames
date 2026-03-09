/**
 * GestaoRaspadinhas.tsx
 * Dashboard de Gestão de Raspadinhas para Organizadores
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  Users,
  Coins,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Pause,
  Play,
  Copy,
  ExternalLink
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';
import { CriarRaspadinha } from './criar-raspadinha';

// ============================================
// TIPOS
// ============================================

interface Premio {
  id: string;
  titulo: string;
  valor: number;
}

interface Raspadinha {
  id: string;
  titulo: string;
  precoParticipacao: number;
  stockInicial: number;
  stockRestante?: number;
  estado: string;
  tipo: string;
  createdAt: string;
  evento?: {
    nome: string;
  };
  _count?: {
    participacoes: number;
  };
}

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// CARD DE RASPADINHA
// --------------------------------------------
function RaspadinhaCard({ 
  raspadinha, 
  onEdit, 
  onDelete,
  onViewStats 
}: { 
  raspadinha: Raspadinha; 
  onEdit: () => void;
  onDelete: () => void;
  onViewStats: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ativo':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Ativo</span>;
      case 'suspenso':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Suspenso</span>;
      case 'concluido':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">Concluído</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{estado}</span>;
    }
  };

  const participacoes = raspadinha._count?.participacoes || 0;
  const stock = raspadinha.stockRestante ?? raspadinha.stockInicial;
  const percentagemUsado = ((raspadinha.stockInicial - stock) / raspadinha.stockInicial) * 100;

  return (
    <UICard className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{raspadinha.titulo}</h3>
            <p className="text-sm text-gray-500">{raspadinha.evento?.nome || 'Sem evento'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getEstadoBadge(raspadinha.estado)}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-lg py-1 z-10 min-w-[150px]"
                >
                  <button onClick={onViewStats} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Ver Stats
                  </button>
                  <button onClick={onEdit} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Duplicar
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Ver Online
                  </button>
                  <hr className="my-1" />
                  <button onClick={onDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-purple-600">€{raspadinha.precoParticipacao.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Preço</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-blue-600">{participacoes}</p>
          <p className="text-xs text-gray-500">Jogadas</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">€{(participacoes * raspadinha.precoParticipacao).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Arrecadado</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Stock usado</span>
          <span>{percentagemUsado.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentagemUsado, 100)}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        <Calendar className="w-3 h-3 inline mr-1" />
        {new Date(raspadinha.createdAt).toLocaleDateString('pt-PT')}
      </p>
    </UICard>
  );
}

// --------------------------------------------
// MODAL DE CRIAÇÃO
// --------------------------------------------
function ModalCriar({ 
  isOpen, 
  onClose,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (config: any) => Promise<void>;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Criar Nova Raspadinha</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            ✕
          </button>
        </div>
        <div className="p-6">
          <CriarRaspadinha onSave={async (config) => {
            await onSave(config);
            onClose();
          }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function GestaoRaspadinhas() {
  const [raspadinhas, setRaspadinhas] = useState<Raspadinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriar, setShowCriar] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    carregarRaspadinhas();
  }, []);

  const carregarRaspadinhas = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jogos/raspadinha');
      if (response.ok) {
        const data = await response.json();
        setRaspadinhas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config: any) => {
    try {
      const response = await fetch('/api/jogos/raspadinha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        await carregarRaspadinhas();
      }
    } catch (error) {
      console.error('Erro ao guardar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres eliminar esta raspadinha?')) return;
    
    try {
      await fetch(`/api/jogos/${id}`, { method: 'DELETE' });
      await carregarRaspadinhas();
    } catch (error) {
      console.error('Erro ao eliminar:', error);
    }
  };

  const raspadinhasFiltradas = raspadinhas.filter(r => {
    const matchSearch = !search || r.titulo.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || r.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  const totalArrecadado = raspadinhas.reduce((sum, r) => 
    sum + ((r._count?.participacoes || 0) * r.precoParticipacao), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Raspadinhas</h1>
          <p className="text-gray-500">Gerencia as tuas raspadinhas</p>
        </div>
        <UIButton onClick={() => setShowCriar(true)}>
          <Plus className="w-5 h-5 mr-2" /> Nova Raspadinha
        </UIButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UICard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{raspadinhas.length}</p>
              <p className="text-xs text-gray-500">Total Raspadinhas</p>
            </div>
          </div>
        </UICard>
        
        <UICard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">€{totalArrecadado.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Total Arrecadado</p>
            </div>
          </div>
        </UICard>
        
        <UICard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {raspadinhas.reduce((sum, r) => sum + (r._count?.participacoes || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Total Jogadas</p>
            </div>
          </div>
        </UICard>
        
        <UICard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {raspadinhas.filter(r => r.estado === 'ativo').length}
              </p>
              <p className="text-xs text-gray-500">Ativas</p>
            </div>
          </div>
        </UICard>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border rounded-xl"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos os estados</option>
          <option value="ativo">Ativos</option>
          <option value="suspenso">Suspensos</option>
          <option value="concluido">Concluídos</option>
        </select>
      </div>

      {/* Lista de Raspadinhas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : raspadinhasFiltradas.length === 0 ? (
        <UICard className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500 mb-2">Nenhuma raspadinha encontrada</h3>
          <p className="text-gray-400 mb-4">Cria a tua primeira raspadinha!</p>
          <UIButton onClick={() => setShowCriar(true)}>
            <Plus className="w-5 h-5 mr-2" /> Criar Raspadinha
          </UIButton>
        </UICard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {raspadinhasFiltradas.map((raspadinha) => (
            <RaspadinhaCard
              key={raspadinha.id}
              raspadinha={raspadinha}
              onEdit={() => {}}
              onDelete={() => handleDelete(raspadinha.id)}
              onViewStats={() => {}}
            />
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <ModalCriar
        isOpen={showCriar}
        onClose={() => setShowCriar(false)}
        onSave={handleSave}
      />
    </div>
  );
}
