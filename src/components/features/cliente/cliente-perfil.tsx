/**
 * ClientePerfil.tsx
 * Componente de Perfil do Cliente
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  Award,
  History,
  Bell
} from 'lucide-react';
import { UIButton, UICard, UIInput } from '@/components/ui-components';

interface ClientePerfilProps {
  userId: string;
}

interface PerfilData {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: string;
  aldeia?: {
    id: string;
    nome: string;
    localizacao?: string;
  };
  createdAt: string;
  _count?: {
    participacoes: number;
    vendas: number;
  };
}

export function ClientePerfil({ userId }: ClientePerfilProps) {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    passwordAtual: '',
    novaPassword: '',
    confirmarPassword: ''
  });

  useEffect(() => {
    carregarPerfil();
  }, [userId]);

  const carregarPerfil = async () => {
    try {
      const response = await fetch('/api/users/perfil');
      if (response.ok) {
        const data = await response.json();
        setPerfil(data);
        setFormData(prev => ({
          ...prev,
          nome: data.nome || '',
          telefone: data.telefone || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Validar passwords
    if (formData.novaPassword) {
      if (formData.novaPassword !== formData.confirmarPassword) {
        setMessage({ type: 'error', text: 'As passwords não coincidem' });
        setSaving(false);
        return;
      }
      if (formData.novaPassword.length < 6) {
        setMessage({ type: 'error', text: 'A password deve ter pelo menos 6 caracteres' });
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/users/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone || null,
          passwordAtual: formData.passwordAtual || null,
          novaPassword: formData.novaPassword || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setEditMode(false);
        setFormData(prev => ({
          ...prev,
          passwordAtual: '',
          novaPassword: '',
          confirmarPassword: ''
        }));
        carregarPerfil();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">O Meu Perfil</h2>
        {!editMode && (
          <UIButton onClick={() => setEditMode(true)}>
            <User className="w-4 h-4 mr-2" />
            Editar Perfil
          </UIButton>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <UICard className="p-6 md:col-span-1">
          <div className="text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold">{perfil?.nome}</h3>
            <p className="text-gray-500 capitalize">{perfil?.role?.replace('_', ' ')}</p>
            
            {perfil?.aldeia && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">{perfil.aldeia.nome}</p>
                {perfil.aldeia.localizacao && (
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {perfil.aldeia.localizacao}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{perfil?.email}</span>
            </div>
            {perfil?.telefone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{perfil.telefone}</span>
              </div>
            )}
          </div>

          {perfil?._count && (
            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{perfil._count.participacoes}</p>
                <p className="text-xs text-gray-500">Participações</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">{perfil._count.vendas}</p>
                <p className="text-xs text-gray-500">Compras</p>
              </div>
            </div>
          )}
        </UICard>

        {/* Formulário */}
        <UICard className="p-6 md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <UIInput
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={!editMode}
                icon={<User className="w-4 h-4" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <UIInput
                value={perfil?.email || ''}
                disabled
                icon={<Mail className="w-4 h-4" />}
              />
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telemóvel</label>
              <UIInput
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!editMode}
                placeholder="912 345 678"
                icon={<Phone className="w-4 h-4" />}
              />
            </div>

            {editMode && (
              <div className="pt-4 border-t space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Alterar Password
                </h4>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password Atual</label>
                  <UIInput
                    type="password"
                    value={formData.passwordAtual}
                    onChange={(e) => setFormData({ ...formData, passwordAtual: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nova Password</label>
                    <UIInput
                      type="password"
                      value={formData.novaPassword}
                      onChange={(e) => setFormData({ ...formData, novaPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmar Password</label>
                    <UIInput
                      type="password"
                      value={formData.confirmarPassword}
                      onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}

            {editMode && (
              <div className="flex gap-2 pt-4">
                <UIButton type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancelar
                </UIButton>
                <UIButton type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </UIButton>
              </div>
            )}
          </form>
        </UICard>
      </div>
    </div>
  );
}
