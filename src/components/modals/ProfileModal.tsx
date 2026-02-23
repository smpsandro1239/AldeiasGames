import React, { useState } from 'react';
import { X, User, Mail, Shield, Save } from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';
import { toast } from 'sonner';

export function ProfileModal({ isOpen, onClose, user, onUpdate }: any) {
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ nome, email })
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.user);
        toast.success('Perfil atualizado!');
        onClose();
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro de ligação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <UICard className="w-full max-w-md p-6 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">O Meu Perfil</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
              {user?.nome?.charAt(0)}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{user?.role}</span>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl" />
            </div>
          </div>
        </div>

        <UIButton className="w-full mt-8" onClick={handleSave} disabled={loading} icon={<Save className="w-4 h-4" />}>
          {loading ? 'A guardar...' : 'Guardar Alterações'}
        </UIButton>
      </UICard>
    </div>
  );
}
