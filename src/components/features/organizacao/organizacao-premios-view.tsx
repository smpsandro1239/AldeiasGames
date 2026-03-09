/**
 * OrganizacaoPremiosView.tsx
 * Gestão de Prémios para Organizações
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gift,
  Image,
  Star,
  Award,
  GripVertical
} from 'lucide-react';
import { UIButton, UICard, UIBadge, UIDialog, UIInput, UITextarea } from '@/components/ui-components';
import { Premio } from '@/types/project';

interface OrganizacaoPremiosViewProps {
  aldeiaId: string;
}

export function OrganizacaoPremiosView({ aldeiaId }: OrganizacaoPremiosViewProps) {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPremio, setEditingPremio] = useState<Premio | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valorEstimado: 0,
    patrocinador: '',
    ordem: 0,
    ativo: true
  });

  useEffect(() => {
    if (aldeiaId) carregarPremios();
  }, [aldeiaId]);

  const carregarPremios = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/premios?aldeiaId=${aldeiaId}`);
      const data = await res.json();
      setPremios(data.data || data);
    } catch (error) {
      console.error('Erro ao carregar prémios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      const method = editingPremio ? 'PATCH' : 'POST';
      const url = editingPremio ? `/api/premios/${editingPremio.id}` : '/api/premios';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aldeiaId
        })
      });

      if (res.ok) {
        await carregarPremios();
        setIsDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar prémio:', error);
    }
  };

  const handleEditar = (premio: Premio) => {
    setEditingPremio(premio);
    setFormData({
      nome: premio.nome,
      descricao: premio.descricao || '',
      valorEstimado: premio.valorEstimado || 0,
      patrocinador: premio.patrocinador || '',
      ordem: premio.ordem || 0,
      ativo: premio.ativo
    });
    setIsDialogOpen(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este prémio?')) return;
    
    try {
      await fetch(`/api/premios/${id}`, { method: 'DELETE' });
      await carregarPremios();
    } catch (error) {
      console.error('Erro ao eliminar prémio:', error);
    }
  };

  const handleAtivarDesativar = async (premio: Premio) => {
    try {
      await fetch(`/api/premios/${premio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !premio.ativo })
      });
      await carregarPremios();
    } catch (error) {
      console.error('Erro ao atualizar prémio:', error);
    }
  };

  const resetForm = () => {
    setEditingPremio(null);
    setFormData({
      nome: '',
      descricao: '',
      valorEstimado: 0,
      patrocinador: '',
      ordem: 0,
      ativo: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Prémios</h1>
          <p className="text-gray-500">Gerir prémios para os seus jogos e rifas</p>
        </div>
        <UIButton icon={<Plus className="w-4 h-4" />} onClick={() => setIsDialogOpen(true)}>
          Novo Prémio
        </UIButton>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">A carregar...</div>
      ) : premios.length === 0 ? (
        <UICard className="p-8 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum prémio criado ainda</p>
          <UIButton className="mt-4" onClick={() => setIsDialogOpen(true)}>Criar Primeiro Prémio</UIButton>
        </UICard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premios.map((premio) => (
            <UICard key={premio.id} className={`p-4 ${!premio.ativo ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">{premio.nome}</h3>
                    {premio.valorEstimado && (
                      <p className="text-sm text-amber-600">€{premio.valorEstimado.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <UIBadge className={premio.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                  {premio.ativo ? 'Ativo' : 'Inativo'}
                </UIBadge>
              </div>

              {premio.descricao && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{premio.descricao}</p>
              )}

              {premio.patrocinador && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Patrocinador: {premio.patrocinador}</span>
                </div>
              )}

              {premio.imagemUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img src={premio.imagemUrl} alt={premio.nome} className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <UIButton variant="outline" size="sm" className="flex-1" onClick={() => handleEditar(premio)}>
                  <Edit className="w-3 h-3 mr-1" /> Editar
                </UIButton>
                <UIButton 
                  variant="outline" 
                  size="sm"
                  className={premio.ativo ? 'text-amber-600' : 'text-green-600'}
                  onClick={() => handleAtivarDesativar(premio)}
                >
                  {premio.ativo ? 'Desativar' : 'Ativar'}
                </UIButton>
                <UIButton variant="ghost" size="sm" onClick={() => handleEliminar(premio.id)}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </UIButton>
              </div>
            </UICard>
          ))}
        </div>
      )}

      {/* Dialog de Criar/Editar Prémio */}
      <UIDialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold">{editingPremio ? 'Editar Prémio' : 'Novo Prémio'}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Prémio *</label>
              <UIInput 
                value={formData.nome} 
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Smartwatch, Viagem, Cash..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <UITextarea 
                value={formData.descricao} 
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição detalhada do prémio..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Estimado (€)</label>
                <UIInput 
                  type="number"
                  step="0.01"
                  value={formData.valorEstimado} 
                  onChange={(e) => setFormData({...formData, valorEstimado: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ordem de Exibição</label>
                <UIInput 
                  type="number"
                  value={formData.ordem} 
                  onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Patrocinador</label>
              <UIInput 
                value={formData.patrocinador} 
                onChange={(e) => setFormData({...formData, patrocinador: e.target.value})}
                placeholder="Nome do patrocinador (opcional)"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="ativo" className="text-sm font-medium">Prémio ativo</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <UIButton variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</UIButton>
            <UIButton onClick={handleSalvar} disabled={!formData.nome}>
              Guardar
            </UIButton>
          </div>
        </div>
      </UIDialog>
    </div>
  );
}
