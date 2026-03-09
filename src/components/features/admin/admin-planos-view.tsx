/**
 * AdminPlanosView.tsx
 * Gestão de Planos SaaS para Admin
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  CreditCard,
  Users,
  Calendar,
  Gamepad2,
  Tag
} from 'lucide-react';
import { UIButton, UICard, UIDialog, UIInput, UITextarea } from '@/components/ui-components';

interface Plano {
  id: string;
  nome: string;
  precoMensal: number;
  maxEventos: number;
  maxJogos: number;
  maxParticipacoes: number;
  descricao?: string;
  stripePriceId?: string;
  ativo: boolean;
  createdAt: string;
}

export function AdminPlanosView() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    precoMensal: 0,
    maxEventos: 3,
    maxJogos: 10,
    maxParticipacoes: 100,
    descricao: ''
  });

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/planos');
      const data = await res.json();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const method = editingPlano ? 'PATCH' : 'POST';
      const url = editingPlano ? `/api/planos/${editingPlano.id}` : '/api/planos';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await carregarPlanos();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  const handleEditar = (plano: Plano) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      precoMensal: plano.precoMensal,
      maxEventos: plano.maxEventos,
      maxJogos: plano.maxJogos,
      maxParticipacoes: plano.maxParticipacoes,
      descricao: plano.descricao || ''
    });
    setIsDialogOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este plano?')) return;
    
    try {
      await fetch(`/api/planos/${id}`, { method: 'DELETE' });
      await carregarPlanos();
    } catch (error) {
      console.error('Erro ao eliminar plano:', error);
    }
  };

  const handleAtivarDesativar = async (plano: Plano) => {
    try {
      await fetch(`/api/planos/${plano.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !plano });
      await carregarPlanos();
   .ativo })
      } catch (error) {
      console.error('Erro ao atualizar plano:', error);
    }
  };

  const resetForm = () => {
    setEditingPlano(null);
    setFormData({
      nome: '',
      precoMensal: 0,
      maxEventos: 3,
      maxJogos: 10,
      maxParticipacoes: 100,
      descricao: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planos SaaS</h1>
          <p className="text-gray-500">Gerir planos de subscrição da plataforma</p>
        </div>
        <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsDialogOpen(true)}>
          Novo Plano
        </UIButton>
      </div>

      {/* Grid de Planos */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">A carregar...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planos.map((plano) => (
            <UICard key={plano.id} className={`p-6 ${!plano.ativo ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{plano.nome}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-indigo-600">€{plano.precoMensal}</span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${plano.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {plano.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>

              {plano.descricao && (
                <p className="text-sm text-gray-600 mb-4">{plano.descricao}</p>
              )}

              {/* Limites do Plano */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{plano.maxEventos} eventos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Gamepad2 className="w-4 h-4 text-gray-400" />
                  <span>{plano.maxJogos} jogos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{plano.maxParticipacoes} participantes</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <UIButton variant="outline" size="sm" className="flex-1" onClick={() => handleEditar(plano)}>
                  <Edit className="w-4 h-4 mr-1" /> Editar
                </UIButton>
                <UIButton 
                  variant={plano.ativo ? 'outline' : 'default'} 
                  size="sm" 
                  className={plano.ativo ? 'text-amber-600 border-amber-600 hover:bg-amber-50' : ''}
                  onClick={() => handleAtivarDesativar(plano)}
                >
                  {plano.ativo ? 'Desativar' : 'Ativar'}
                </UIButton>
                <UIButton variant="ghost" size="sm" onClick={() => handleEliminar(plano.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </UIButton>
              </div>
            </UICard>
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar */}
      <UIDialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">{editingPlano ? 'Editar Plano' : 'Novo Plano'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Plano</label>
              <UIInput 
                value={formData.nome} 
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Básico, Profissional, Enterprise"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Preço Mensal (€)</label>
              <UIInput 
                type="number"
                value={formData.precoMensal} 
                onChange={(e) => setFormData({...formData, precoMensal: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Eventos</label>
                <UIInput 
                  type="number"
                  value={formData.maxEventos} 
                  onChange={(e) => setFormData({...formData, maxEventos: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jogos</label>
                <UIInput 
                  type="number"
                  value={formData.maxJogos} 
                  onChange={(e) => setFormData({...formData, maxJogos: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Particip.</label>
                <UIInput 
                  type="number"
                  value={formData.maxParticipacoes} 
                  onChange={(e) => setFormData({...formData, maxParticipacoes: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <UITextarea 
                value={formData.descricao} 
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição opcional do plano..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <UIButton variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</UIButton>
            <UIButton onClick={handleSalvar}>Guardar</UIButton>
          </div>
        </div>
      </UIDialog>
    </div>
  );
}
