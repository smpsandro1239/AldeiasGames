import React from 'react';
import { X, Building2, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

export function OrgDetailModal({ org, onClose, onUpdate }: any) {
  if (!org) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <UICard className="w-full max-w-xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {org.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{org.nome}</h2>
              <p className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {org.localizacao || 'Sem localização'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status de Verificação</p>
            {org.verificada ? (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                <CheckCircle className="w-4 h-4" /> Verificada
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 text-sm font-bold">
                <ShieldAlert className="w-4 h-4" /> Aguarda Aprovação
              </span>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total de Eventos</p>
            <p className="text-lg font-bold">{org._count?.eventos || 0}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold border-b pb-2">Administração</h3>
          <div className="flex justify-between gap-4">
            <UIButton variant="secondary" className="flex-1">Suspender Conta</UIButton>
            <UIButton className="flex-1" variant={org.verificada ? 'secondary' : 'primary'}>
              {org.verificada ? 'Revogar Verificação' : 'Aprovar Organização'}
            </UIButton>
          </div>
        </div>
      </UICard>
    </div>
  );
}
