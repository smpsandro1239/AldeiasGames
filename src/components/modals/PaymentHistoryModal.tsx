import React, { useEffect, useState } from 'react';
import { X, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { UICard } from '@/components/ui-components';

export function PaymentHistoryModal({ isOpen, onClose, userId }: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      fetch(`/api/payments?userId=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
      })
      .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <UICard className="w-full max-w-2xl p-6 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Histórico de Pagamentos
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center py-8 text-gray-500">A carregar...</p>
          ) : history.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Sem pagamentos registados.</p>
          ) : (
            <table className="w-full">
              <thead className="text-left text-xs text-gray-500 uppercase">
                <tr>
                  <th className="pb-4">Data</th>
                  <th className="pb-4">Método</th>
                  <th className="pb-4">Valor</th>
                  <th className="pb-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((p) => (
                  <tr key={p.id}>
                    <td className="py-4 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-sm uppercase">{p.metodo}</td>
                    <td className="py-4 text-sm font-bold">€{p.valor.toFixed(2)}</td>
                    <td className="py-4">
                      {p.estado === 'pago' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Pago
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </UICard>
    </div>
  );
}
