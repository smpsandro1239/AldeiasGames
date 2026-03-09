/**
 * OrganizacaoJogosView.tsx
 * Gestão de Jogos para Organizações
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gamepad2,
  Ticket,
  DollarSign,
  Calendar,
  MoreVertical,
  Eye,
  Pause,
  Play,
  Copy
} from 'lucide-react';
import { UIButton, UICard, UIBadge, UIDialog, UIInput, UISelect } from '@/components/ui-components';
import { Jogo, Evento } from '@/types/project';

interface OrganizacaoJogosViewProps {
  aldeiaId: string;
}

const TIPOS_JOGO = [
  { value: 'poio_vaca', label: 'Prio da Vaca (Grelha)' },
  { value: 'rifa', label: 'Rifa/Tombola' },
  { value: 'raspadinha', label: 'Raspadinha Digital' },
  { value: 'tombola', label: 'Tombola' },
];

const ESTADOS_JOGO = [
  { value: 'ativo', label: 'Ativo', class: 'bg-green-100 text-green-700' },
  { value: 'suspenso', label: 'Suspenso', class: 'bg-amber-100 text-amber-700' },
  { value: 'concluido', label: 'Concluído', class: 'bg-gray-100 text-gray-700' },
];

export function OrganizacaoJogosView({ aldeiaId }: OrganizacaoJogosViewProps) {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJogo, setEditingJogo] = useState<Jogo | null>(null);
  const [formData, setFormData] = useState({
    eventoId: '',
    tipo: 'raspadinha',
    titulo: '',
    precoParticipacao: 0,
    stockInicial: 100,
    limitePorUsuario: 5,
    premiosRaspadinha: ''
  });

  useEffect(() => {
    carregarDados();
  }, [aldeiaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Carregar eventos da organização
      const eventosRes = await fetch(`/api/eventos?aldeiaId=${aldeiaId}`);
      const eventosData = await eventosRes.json();
      setEventos(eventosData.data || eventosData);
      
      // Carregar jogos
      const jogosRes = await fetch(`/api/jogos?eventoId=${eventosData.data?.[0]?.id || ''}`);
      const jogosData = await jogosRes.json();
      setJogos(jogosData.data || jogosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const method = editingJogo ? 'PATCH' : 'POST';
      const url = editingJogo ? `/api/jogos/${editingJogo.id}` : '/api/jogos';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          config: {},
          premioId: null
        })
      });

      if (res.ok) {
        await carregarDados();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar jogo:', error);
    }
  };

  const handleEditar = (jogo: Jogo) => {
    setEditingJogo(jogo);
    setFormData({
      eventoId: jogo.eventoId,
      tipo: jogo.tipo,
      titulo: jogo.titulo,
      precoParticipacao: jogo.precoParticipacao,
      stockInicial: jogo.stockInicial || 100,
      limitePorUsuario: jogo.limitePorUsuario || 5,
      premiosRaspadinha: typeof jogo.premiosRaspadinha === 'string' ? jogo.premiosRaspadinha : JSON.stringify(jogo.premiosRaspadinha)
    });
    setIsDialogOpen(true);
    setIsEditing(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este jogo?')) return;
    
    try {
      await fetch(`/api/jogos/${id}`, { method: 'DELETE' });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao eliminar jogo:', error);
    }
  };

  const handleMudarEstado = async (jogo: Jogo, novoEstado: string) => {
    try {
      await fetch(`/api/jogos/${jogo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: novoEstado })
      });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao mudar estado:', error);
    }
  };

  const resetForm = () => {
    setEditingJogo(null);
    setFormData({
      eventoId: eventos[0]?.id || '',
      tipo: 'raspadinha',
      titulo: '',
      precoParticipacao: 0,
      stockInicial: 100,
      limitePorUsuario: 5,
      premiosRaspadinha: ''
    });
  };

  const getTipoLabel = (tipo: string) => {
    return TIPOS_JOGO.find(t => t.value === tipo)?.label || tipo;
  };

  const getEstadoBadge = (estado: string) => {
    const est = ESTADOS_JOGO.find(e => e.value === estado);
    return <UIBadge className={est?.class}>{est?.label}</UIBadge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Jogos</h1>
          <p className="text-gray-500">Gerir jogos e rifas dos seus eventos</p>
        </div>
        <UIButton 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsDialogOpen(true)}
          disabled={eventos.length === 0}
        >
          Novo Jogo
        </UIButton>
      </div>

      {eventos.length === 0 ? (
        <UICard className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Precisa de ter um evento ativo para criar jogos</p>
          <UIButton variant="outline">Criar Evento</UIButton>
        </UICard>
      ) : loading ? (
        <div className="text-center py-8 text-gray-500">A carregar...</div>
      ) : jogos.length === 0 ? (
        <UICard className="p-8 text-center">
          <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum jogo criado ainda</p>
          <UIButton className="mt-4" onClick={() => setIsDialogOpen(true)}>Criar Primeiro Jogo</UIButton>
        </UICard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jogos.map((jogo) => (
            <UICard key={jogo.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {jogo.tipo === 'raspadinha' ? <Ticket className="w-5 h-5 text-indigo-600" /> :
                     jogo.tipo === 'rifa' ? <Ticket className="w-5 h-5 text-indigo-600" /> :
                     <Gamepad2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{jogo.titulo}</h3>
                    <p className="text-xs text-gray-500">{getTipoLabel(jogo.tipo)}</p>
                  </div>
                </div>
                {getEstadoBadge(jogo.estado)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Preço</span>
                  <span className="font-medium">€{jogo.precoParticipacao.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Stock</span>
                  <span className="font-medium">{jogo.stockRestante || jogo.stockInicial || '∞'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Participações</span>
                  <span className="font-medium">{jogo._count?.participacoes || 0}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <UIButton variant="outline" size="sm" className="flex-1" onClick={() => handleEditar(jogo)}>
                  <Edit className="w-3 h-3 mr-1" /> Editar
                </UIButton>
                {jogo.estado === 'ativo' ? (
                  <UIButton variant="outline" size="sm" onClick={() => handleMudarEstado(jogo, 'suspenso')}>
                    <Pause className="w-3 h-3" />
                  </UIButton>
                ) : (
                  <UIButton variant="outline" size="sm" onClick={() => handleMudarEstado(jogo, 'ativo')}>
                    <Play className="w-3 h-3" />
                  </UIButton>
                )}
                <UIButton variant="ghost" size="sm" onClick={() => handleEliminar(jogo.id)}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </UIButton>
              </div>
            </UICard>
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar Jogo */}
      <UIDialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">{editingJogo ? 'Editar Jogo' : 'Novo Jogo'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Evento *</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={formData.eventoId}
                onChange={(e) => setFormData({...formData, eventoId: e.target.value})}
              >
                {eventos.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Jogo *</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                {TIPOS_JOGO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <UIInput 
                value={formData.titulo} 
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ex: Raspadinha de São João 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Preço (€) *</label>
                <UIInput 
                  type="number"
                  step="0.01"
                  value={formData.precoParticipacao} 
                  onChange={(e) => setFormData({...formData, precoParticipacao: parseFloat(e.target.value) || 0})}
                  placeholder="2.50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock Inicial</label>
                <UIInput 
                  type="number"
                  value={formData.stockInicial} 
                  onChange={(e) => setFormData({...formData, stockInicial: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Limite por Utilizador</label>
              <UIInput 
                type="number"
                value={formData.limitePorUsuario} 
                onChange={(e) => setFormData({...formData, limitePorUsuario: parseInt(e.target.value) || 0})}
                placeholder="5"
              />
            </div>

            {formData.tipo === 'raspadinha' && (
              <div>
                <label className="block text-sm font-medium mb-1">Prémios (JSON)</label>
                <textarea 
                  className="w-full p-2 border rounded-lg font-mono text-sm"
                  rows={4}
                  value={formData.premiosRaspadinha} 
                  onChange={(e) => setFormData({...formData, premiosRaspadinha: e.target.value})}
                  placeholder='[{"posicao": 1, "nome": "1º Prémio", "valor": 100}, ...]'
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <UIButton variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</UIButton>
            <UIButton onClick={handleSalvar} disabled={!formData.titulo || !formData.eventoId}>
              Guardar
            </UIButton>
          </div>
        </div>
      </UIDialog>
    </div>
  );
}
