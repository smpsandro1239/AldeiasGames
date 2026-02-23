import React from 'react';
import { X, Calendar, MapPin, Clock, Users, Trash2 } from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

export function EventDetailModal({ evento, onClose, onUpdate }: any) {
  if (!evento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <UICard className="w-full max-w-2xl p-0 overflow-hidden">
        <div className="h-48 bg-gray-200 relative">
          {evento.banner && <img src={evento.banner} className="w-full h-full object-cover" />}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <UIBadge variant="indigo" className="mb-2">{evento.tipo || 'Sorteio'}</UIBadge>
              <h2 className="text-3xl font-bold">{evento.titulo}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <UIBadge variant={evento.estado === 'ativo' ? 'success' : 'warning'}>{evento.estado}</UIBadge>
            </div>
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{evento.descricao}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Calendar className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Data Fim</p>
                <p className="text-sm font-semibold">{new Date(evento.dataFim).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><MapPin className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Local</p>
                <p className="text-sm font-semibold">{evento.localizacao || 'Geral'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Users className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Participantes</p>
                <p className="text-sm font-semibold">{evento._count?.participacoes || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <UIButton variant="secondary" className="flex-1">Editar Detalhes</UIButton>
            <UIButton variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 className="w-4 h-4" />}>
              Eliminar Evento
            </UIButton>
          </div>
        </div>
      </UICard>
    </div>
  );
}
