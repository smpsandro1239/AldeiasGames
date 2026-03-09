/**
 * ClienteDashboard.tsx
 * Dashboard completo do Cliente/Jogador
 * Design: Festivo português, premium, mobile-first
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2,
  Ticket,
  Gift,
  User,
  Star,
  Trophy,
  Crown,
  Wallet,
  History,
  Settings,
  Bell,
  Search,
  Plus,
  Play,
  ChevronRight,
  X,
  Sparkles,
  PartyPopper,
  Target,
  Zap,
  Flame,
  Medal,
  Share2,
  Copy,
  CheckCircle,
  RefreshCw,
  Users,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';

// ============================================
// LOGOUT HANDLER
// ============================================

function handleLogout() {
  document.cookie.split(";").forEach((c) => { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  localStorage.clear();
  window.location.href = '/';
}

// ============================================
// TIPOS
// ============================================

interface Campanha {
  id: string;
  titulo: string;
  tipo: string;
  preco: number;
  premioPrincipal: string;
  participantes: number;
  imagem?: string;
}

interface Raspadinha {
  id: string;
  campanha: string;
  symbols: string[];
  revealed: boolean[];
  resultado: 'pendente' | 'ganhou' | 'perdeu';
  premio?: string;
}

interface Premio {
  id: string;
  nome: string;
  valor: number;
  data: string;
  campanha: string;
  icon: string;
}

interface ClienteStats {
  raspadinhasCompradas: number;
  raspadinhasGanhas: number;
  totalGasto: number;
  totalGanho: number;
  posicaoRanking: number;
}

// ============================================
// COMPONENTES UI
// ============================================

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'default' | 'gold' }) {
  const cores = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    default: 'bg-gray-100 text-gray-700',
    gold: 'bg-amber-100 text-amber-700'
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cores[variant]}`}>{children}</span>;
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// STATS CARDS
// ============================================

function StatsCard({ titulo, valor, icon: Icon, cor, subvalor }: { titulo: string; valor: string | number; icon: React.ElementType; cor: string; subvalor?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${cor}/10`}>
          <Icon className={`w-6 h-6 ${cor}`} />
        </div>
        <div>
          <p className="text-gray-500 text-sm">{titulo}</p>
          <p className={`text-2xl font-black ${cor}`}>{valor}</p>
          {subvalor && <p className="text-xs text-gray-400">{subvalor}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// CAMPAIGN CARD
// ============================================

function CampanhaCard({ campanha, onJogar }: { campanha: Campanha; onJogar: (c: Campanha) => void }) {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'raspadinha': return '🎫';
      case 'poio_vaca': return '🐄';
      case 'rifa': return '🎰';
      default: return '🎮';
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{getIcon(campanha.tipo)}</span>
          <Badge variant="success">Ativa</Badge>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{campanha.titulo}</h3>
        <p className="text-sm text-gray-500 mb-3">🎁 {campanha.premioPrincipal}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {campanha.participantes} jogadores</span>
          <span className="font-bold text-green-600">€{campanha.preco.toFixed(2)}</span>
        </div>

        <UIButton onClick={() => onJogar(campanha)} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
          <Play className="w-4 h-4 mr-2" /> Jogar Agora
        </UIButton>
      </div>
    </motion.div>
  );
}

// ============================================
// RASPADINHA MINIGAME
// ============================================

function RaspadinhaMinigame({ campanha, onClose }: { campanha: Campanha; onClose: () => void }) {
  const [areas, setAreas] = useState<boolean[]>(Array(9).fill(false));
  const [resultado, setResultado] = useState<'pendente' | 'ganhou' | 'perdeu'>('pendente');
  
  const symbols = ['⭐', '💰', '🎁', '🍀', '🔥', '💎', '🎀', '⭐', '💰'];
  
  const revelarArea = (index: number) => {
    if (areas[index] || resultado !== 'pendente') return;
    
    const novasAreas = [...areas];
    novasAreas[index] = true;
    setAreas(novasAreas);
    
    // Simular resultado (em produção viria da API)
    const areasReveladas = novasAreas.filter(a => a).length;
    if (areasReveladas >= 3) {
      // Verificar se ganhou (simulação)
      const ganhou = Math.random() > 0.7;
      setResultado(ganhou ? 'ganhou' : 'perdeu');
      
      if (ganhou) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4']
        });
      }
    }
  };

  const todasReveladas = areas.every(a => a);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white text-center">
        <h3 className="text-xl font-black">{campanha.titulo}</h3>
        <p className="text-white/80">Raspa as células para revelar!</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {symbols.map((symbol, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => revelarArea(i)}
            disabled={areas[i]}
            className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${
              areas[i]
                ? resultado === 'ganhou' ? 'bg-green-100' : 'bg-gray-100'
                : 'bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300'
            }`}
          >
            {areas[i] ? symbol : '❓'}
          </motion.button>
        ))}
      </div>

      {/* Resultado */}
      {resultado !== 'pendente' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-center p-6 rounded-2xl ${resultado === 'ganhou' ? 'bg-green-100' : 'bg-gray-100'}`}>
          <p className="text-4xl mb-2">{resultado === 'ganhou' ? '🎉' : '😢'}</p>
          <p className="text-2xl font-black">{resultado === 'ganhou' ? 'GANHOU!' : 'Sem prémio'}</p>
          {resultado === 'ganhou' && (
            <p className="text-green-600 font-bold">Prémio: {campanha.premioPrincipal}</p>
          )}
        </motion.div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <UIButton variant="outline" onClick={onClose} className="flex-1">
          Fechar
        </UIButton>
        <UIButton onClick={() => { setAreas(Array(9).fill(false)); setResultado('pendente'); }} className="flex-1 bg-purple-600">
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
        </UIButton>
      </div>
    </div>
  );
}

// ============================================
// PREMIUM GALLERY
// ============================================

function PremiosGallery({ premios }: { premios: Premio[] }) {
  if (premios.length === 0) {
    return (
      <div className="text-center py-8">
        <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aún no tienes prémios</p>
        <p className="text-sm text-gray-400">¡Juega para ganar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {premios.map((p) => (
        <motion.div
          key={p.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl p-4 border shadow-sm"
        >
          <div className="text-3xl mb-2">{p.icon}</div>
          <p className="font-bold text-sm">{p.nome}</p>
          <p className="text-green-600 font-bold">€{p.valor.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{p.campanha}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ClienteDashboard() {
  const [activeTab, setActiveTab] = useState('explorar');
  const [showJogar, setShowJogar] = useState<Campanha | null>(null);
  const [showPerfil, setShowPerfil] = useState(false);

  // Stats mockadas
  const stats: ClienteStats = {
    raspadinhasCompradas: 42,
    raspadinhasGanhas: 7,
    totalGasto: 84,
    totalGanho: 156,
    posicaoRanking: 23
  };

  // Campanhas disponíveis
  const campanhas: Campanha[] = [
    { id: '1', titulo: 'Raspadinha São João', tipo: 'raspadinha', preco: 2.50, premioPrincipal: '500€', participantes: 1250 },
    { id: '2', titulo: 'Raspadinha Carnaval', tipo: 'raspadinha', preco: 2, premioPrincipal: '250€', participantes: 2340 },
    { id: '3', titulo: 'Poio da Vaca Premium', tipo: 'poio_vaca', preco: 5, premioPrincipal: '1000€', participantes: 450 },
    { id: '4', titulo: 'Rifa Natal Clube', tipo: 'rifa', preco: 3, premioPrincipal: '750€', participantes: 890 },
  ];

  // Prémios ganhos
  const premios: Premio[] = [
    { id: '1', nome: '10€ Consolação', valor: 10, data: '2024-06-15', campanha: 'Raspadinha São João', icon: '🎁' },
    { id: '2', nome: '25€ Sorte', valor: 25, data: '2024-06-10', campanha: 'Raspadinha Carnaval', icon: '🎀' },
    { id: '3', nome: '5€ Consolação', valor: 5, data: '2024-05-20', campanha: 'Poio da Vaca', icon: '🎁' },
  ];

  const tabs = [
    { id: 'explorar', label: 'Explorar', icon: Gamepad2 },
    { id: 'minhas', label: 'Minhas', icon: Ticket },
    { id: 'premios', label: 'Prémios', icon: Gift },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-800">Aldeias Games</h1>
                <p className="text-sm text-gray-500">Olá, Jogador! 🎮</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-xl text-red-600" 
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button onClick={() => setShowPerfil(true)} className="p-2 hover:bg-gray-100 rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Stats Rápidas */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <motion.div whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-3 text-white text-center">
            <p className="text-xs opacity-80">Ganhos</p>
            <p className="text-xl font-black">€{stats.totalGanho}</p>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-3 text-white text-center">
            <p className="text-xs opacity-80">Vitórias</p>
            <p className="text-xl font-black">{stats.raspadinhasGanhas}</p>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-3 text-white text-center">
            <p className="text-xs opacity-80">Ranking</p>
            <p className="text-xl font-black">#{stats.posicaoRanking}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 p-1 bg-white rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* EXPLORAR TAB */}
          {activeTab === 'explorar' && (
            <motion.div key="explorar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <h2 className="font-bold text-lg">Campanhas Disponíveis</h2>
              {campanhas.map((c) => (
                <CampanhaCard key={c.id} campanha={c} onJogar={(camp) => setShowJogar(camp)} />
              ))}
            </motion.div>
          )}

          {/* MINHAS TAB */}
          {activeTab === 'minhas' && (
            <motion.div key="minhas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <UICard className="p-6">
                <h2 className="font-bold text-lg mb-4">Minhas Raspadinhas</h2>
                <div className="text-center py-8">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Não tens raspadinhas compradas</p>
                  <p className="text-sm text-gray-400">Compra na aba Explorar</p>
                </div>
              </UICard>
            </motion.div>
          )}

          {/* PREMIOS TAB */}
          {activeTab === 'premios' && (
            <motion.div key="premios" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <UICard className="p-6">
                <h2 className="font-bold text-lg mb-4">Os Meus Prémios</h2>
                <PremiosGallery premios={premios} />
              </UICard>
            </motion.div>
          )}

          {/* PERFIL TAB */}
          {activeTab === 'perfil' && (
            <motion.div key="perfil" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <UICard className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    U
                  </div>
                  <h2 className="text-xl font-black">Utilizador</h2>
                  <p className="text-gray-500">utilizador@email.pt</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Total Gasto</span>
                    <span className="font-bold">€{stats.totalGasto}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Total Ganho</span>
                    <span className="font-bold text-green-600">€{stats.totalGanho}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Posição no Ranking</span>
                    <span className="font-bold">#{stats.posicaoRanking}</span>
                  </div>
                </div>

                <UIButton className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500">
                  <Settings className="w-4 h-4 mr-2" /> Editar Perfil
                </UIButton>
              </UICard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Jogar */}
      <Modal isOpen={!!showJogar} onClose={() => setShowJogar(null)} title="🎮 Jogo">
        {showJogar && <RaspadinhaMinigame campanha={showJogar} onClose={() => setShowJogar(null)} />}
      </Modal>
    </div>
  );
}