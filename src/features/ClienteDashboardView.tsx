import React, { useState } from 'react';
import { Trophy, Calendar, MapPin, Clock, Gift, Star, ChevronRight, History } from 'lucide-react';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';
import { soundEngine } from '@/lib/audio-utils';
import confetti from 'canvas-confetti';

export function ClienteDashboardView({ user, eventos, participacoes, onParticipar, onRevelar }: any) {
  const [activeTab, setActiveTab] = useState<'explorar' | 'minhas'>('explorar');

  const handleReveal = async (id: string) => {
    soundEngine.playClick();
    const result = await onRevelar(id);
    if (result && result.ganhou) {
      soundEngine.playWin();
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } else {
      soundEngine.playError();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2 relative z-10">Olá, {user.nome}! 👋</h1>
        <p className="text-indigo-100 mb-6 relative z-10">Tens {participacoes.filter((p:any) => !p.revelada).length} raspadinhas por revelar.</p>
        <UIButton onClick={() => setActiveTab('minhas')} className="bg-white text-indigo-700 font-bold relative z-10">Revelar Agora</UIButton>
        <Trophy className="absolute -right-8 top-1/2 -translate-y-1/2 w-64 h-64 text-white/10" />
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button onClick={() => setActiveTab('explorar')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'explorar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>Explorar</button>
        <button onClick={() => setActiveTab('minhas')} className={`px-6 py-2 rounded-lg text-sm font-bold ${activeTab === 'minhas' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>As Minhas</button>
      </div>

      {activeTab === 'explorar' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {eventos.map((ev: any) => (
            <UICard key={ev.id} className="p-6">
              <h3 className="text-xl font-bold mb-4">{ev.titulo}</h3>
              <div className="space-y-2 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {ev.localizacao}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(ev.dataFim).toLocaleDateString()}</div>
              </div>
              <div className="space-y-2">
                {ev.jogos?.map((j: any) => (
                  <div key={j.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold">{j.titulo}</span>
                    <UIButton size="sm" onClick={() => onParticipar(j)}>€{j.precoParticipacao}</UIButton>
                  </div>
                ))}
              </div>
            </UICard>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {participacoes.map((p: any) => (
            <UICard key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.revelada ? 'bg-gray-100' : 'bg-indigo-100 text-indigo-600'}`}>
                  {p.jogo?.tipo === 'raspadinha' ? <Gift className="w-6 h-6" /> : <Star className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold">{p.jogo?.titulo}</h4>
                  <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {p.revelada ? (
                  <span className={`font-bold ${p.ganhou ? 'text-green-600' : 'text-gray-400'}`}>{p.ganhou ? 'Premiada!' : 'Não Premiada'}</span>
                ) : (
                  <UIButton size="sm" onClick={() => handleReveal(p.id)}>Revelar</UIButton>
                )}
              </div>
            </UICard>
          ))}
        </div>
      )}
    </div>
  );
}
