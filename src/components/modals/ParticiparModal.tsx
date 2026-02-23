'use client';
import React, { useState } from 'react';
import { X, CreditCard, Euro, CheckCircle2, Loader2, ArrowRight, Info } from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';
import { Jogo, User } from '@/types/project';
import { toast } from 'sonner';

interface ParticiparModalProps {
  jogo: Jogo | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: (jogo: Jogo, dados: any, metodo: string, telefone: string, adminParaCliente: boolean, clienteInfo: any) => Promise<boolean>;
  isLoading: boolean;
}

export function ParticiparModal({ jogo, isOpen, onClose, user, onConfirm, isLoading }: ParticiparModalProps) {
  const [step, setStep] = useState<'select' | 'payment' | 'confirm'>('select');
  const [metodo, setMetodo] = useState<'mbway' | 'dinheiro' | 'stripe'>('mbway');
  const [telefone, setTelefone] = useState('');
  const [adminParaCliente, setAdminParaCliente] = useState(false);
  const [clienteInfo, setClienteInfo] = useState({ nome: '', telefone: '', email: '' });
  const [stripeLoading, setStripeLoading] = useState(false);

  if (!isOpen || !jogo) return null;

  const handleNext = async () => {
    if (step === 'select') {
      setStep('payment');
    } else if (step === 'payment') {
      if (metodo === 'stripe') {
        handleStripeCheckout();
      } else {
        setStep('confirm');
      }
    } else {
      const success = await onConfirm(jogo, {}, metodo, telefone, adminParaCliente, clienteInfo);
      if (success) {
        setStep('select');
        onClose();
      }
    }
  };

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ jogoId: jogo.id })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Erro ao iniciar checkout');
      }
    } catch (e) {
      toast.error('Erro de ligação');
    } finally {
      setStripeLoading(false);
    }
  };

  const isVendedor = user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <UICard className="w-full max-w-xl p-0 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{jogo.titulo}</h3>
            <p className="text-sm text-gray-500">Participação em evento comunitário</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8">
          {step === 'select' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <p className="text-sm text-indigo-900 leading-relaxed">
                  O valor de <strong>€{jogo.precoParticipacao.toFixed(2)}</strong> reverte para a organização.
                </p>
              </div>
              {isVendedor && (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Registar para Cliente</span>
                    <input type="checkbox" checked={adminParaCliente} onChange={e => setAdminParaCliente(e.target.checked)} className="w-5 h-5" />
                  </div>
                  {adminParaCliente && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Nome" className="p-2 border rounded-lg" value={clienteInfo.nome} onChange={e => setClienteInfo({...clienteInfo, nome: e.target.value})} />
                      <input placeholder="Telemóvel" className="p-2 border rounded-lg" value={clienteInfo.telefone} onChange={e => setClienteInfo({...clienteInfo, telefone: e.target.value})} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setMetodo('mbway')} className={`p-4 border-2 rounded-2xl flex items-center justify-between ${metodo === 'mbway' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 text-white rounded flex items-center justify-center font-bold text-[10px]">MBWAY</div>
                    <div className="text-left"><p className="font-bold">MB WAY</p><p className="text-xs text-gray-500">Pagamento instantâneo</p></div>
                  </div>
                  {metodo === 'mbway' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </button>
                <button onClick={() => setMetodo('stripe')} className={`p-4 border-2 rounded-2xl flex items-center justify-between ${metodo === 'stripe' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                    <div className="text-left"><p className="font-bold">Cartão (Stripe)</p><p className="text-xs text-gray-500">Visa, Mastercard, etc.</p></div>
                  </div>
                  {metodo === 'stripe' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </button>
                {isVendedor && (
                  <button onClick={() => setMetodo('dinheiro')} className={`p-4 border-2 rounded-2xl flex items-center justify-between ${metodo === 'dinheiro' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 text-white rounded flex items-center justify-center"><Euro className="w-5 h-5" /></div>
                      <div className="text-left"><p className="font-bold">Dinheiro</p><p className="text-xs text-gray-500">Pagamento em numerário</p></div>
                    </div>
                    {metodo === 'dinheiro' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </button>
                )}
              </div>
              {metodo === 'mbway' && <input placeholder="9xxxxxxxx" className="w-full p-3 border-2 rounded-2xl" value={telefone} onChange={e => setTelefone(e.target.value)} />}
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <div className="bg-gray-50 p-6 rounded-3xl space-y-3 text-left">
                <div className="flex justify-between border-b pb-2"><span>Preço</span><span className="font-black text-indigo-600">€{jogo.precoParticipacao.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Método</span><span className="font-bold uppercase">{metodo}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t flex gap-4">
          {step !== 'select' && <UIButton variant="secondary" className="flex-1" onClick={() => setStep(step === 'confirm' ? 'payment' : 'select')}>Anterior</UIButton>}
          <UIButton
            className="flex-[2] py-4"
            onClick={handleNext}
            disabled={isLoading || stripeLoading || (metodo === 'mbway' && step === 'payment' && !telefone)}
            icon={(isLoading || stripeLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          >
            {(isLoading || stripeLoading) ? 'A processar...' : step === 'confirm' ? 'Finalizar' : metodo === 'stripe' && step === 'payment' ? 'Pagar com Cartão' : 'Continuar'}
          </UIButton>
        </div>
      </UICard>
    </div>
  );
}
