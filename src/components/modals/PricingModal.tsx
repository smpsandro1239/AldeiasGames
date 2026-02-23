import React from 'react';
import { X, Check, Zap, Star, Shield, ArrowRight } from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';

export function PricingModal({ isOpen, onClose, currentPlan }: any) {
  if (!isOpen) return null;
  const plans = [
    { name: 'Aldeia Grátis', price: '0', features: ['Até 100 participações', '1 Evento Ativo'], icon: Zap, color: 'gray' },
    { name: 'Vila Pro', price: '29', popular: true, features: ['Ilimitado', 'Taxa 5%'], icon: Star, color: 'indigo' },
    { name: 'Cidade Premium', price: '99', features: ['White-label', 'API Access'], icon: Shield, color: 'purple' },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-50 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Planos e Preços</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative bg-white rounded-3xl p-8 border-2 ${plan.popular ? 'border-indigo-600 shadow-xl' : 'border-transparent'}`}>
              <div className={`w-12 h-12 bg-${plan.color}-100 text-${plan.color}-600 rounded-2xl flex items-center justify-center mb-4`}><plan.icon className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="text-3xl font-bold my-4">€{plan.price}<span className="text-sm text-gray-400">/mês</span></div>
              <div className="space-y-3 mb-8">
                {plan.features.map(f => <div key={f} className="flex gap-2 text-sm"><Check className="w-4 h-4 text-green-500" /> {f}</div>)}
              </div>
              <UIButton variant={plan.popular ? 'primary' : 'secondary'} className="w-full">Selecionar</UIButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
