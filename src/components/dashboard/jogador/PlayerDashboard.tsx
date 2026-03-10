/**
 * PlayerDashboard.tsx
 * Dashboard do Jogador - Versão AAA Festiva Portuguesa
 * Design: Premium mobile-first com estilo festivo português
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Sparkles, 
  Ticket, 
  Gift, 
  User,
  Wallet,
  Trophy,
  Crown,
  Bell,
  ChevronRight,
  Gamepad2,
  Coins,
  Star
} from 'lucide-react';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';
import { ScratchCardPreview, FestiveBackgroundPattern } from '@/components/ui/ScratchCardPreview';
import confetti from 'canvas-confetti';

// ============================================
// ANIMAÇÕES
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', bounce: 0.4 }
  }
};

const bounceIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', bounce: 0.5 }
  }
};

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// STATS CARD
// --------------------------------------------
function StatsCard({ 
  titulo, 
  valor, 
  icon: Icon, 
  gradient,
  delay = 0
}: { 
  titulo: string; 
  valor: string | number; 
  icon: React.ElementType; 
  gradient: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Count-up animation
  useEffect(() => {
    const numericValue = typeof valor === 'string' ? parseFloat(valor.replace(/[€#,]/g, '')) : valor;
    if (isNaN(numericValue)) {
      setDisplayValue(0);
      return;
    }
    
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(numericValue * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    setTimeout(animate, delay * 100);
  }, [valor, delay]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay * 0.1, type: 'spring', bounce: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${gradient} rounded-2xl p-4 text-white shadow-lg relative overflow-hidden`}
    >
      {/* Partículas douradas sutis */}
      <div className="absolute top-2 right-2 opacity-30">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 opacity-80" />
        <span className="text-xs font-medium opacity-90">{titulo}</span>
      </div>
      
      <p className="text-3xl font-black tracking-tight">
        {typeof valor === 'string' && valor.includes('€') 
          ? `€${displayValue}`
          : typeof valor === 'string' && valor.includes('#')
            ? `#${displayValue}`
            : displayValue
        }
      </p>
    </motion.div>
  );
}

// --------------------------------------------
// CAMPAIGN CARD
// --------------------------------------------
function CampaignCard({ 
  campanha, 
  onPlay 
}: { 
  campanha: any; 
  onPlay: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
    >
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 p-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl">
            {campanha.tipo === 'raspadinha' ? '🎫' : campanha.tipo === 'poio_vaca' ? '🐄' : '🎰'}
          </span>
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
            Ativa
          </span>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{campanha.titulo}</h3>
        <p className="text-gray-500 text-sm mb-3">🎁 {campanha.premioPrincipal}</p>
        
        {/* Preview da raspadinha */}
        <div className="bg-gray-50 rounded-xl p-2 mb-3">
          <div className="grid grid-cols-3 gap-1">
            {(campanha.simbolos || ['⭐', '💰', '🎁']).map((simbolo: string, i: number) => (
              <div 
                key={i} 
                className="aspect-square bg-white rounded-lg flex items-center justify-center text-xl shadow-sm"
              >
                {simbolo}
              </div>
            ))}
          </div>
        </div>
        
        {/* Info e botão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{campanha.participantes} jogadores</span>
          </div>
          <span className="font-bold text-green-600 text-lg">€{campanha.preco.toFixed(2)}</span>
        </div>
        
        {/* Botão Jogar Agora */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlay}
          className="w-full mt-3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all relative overflow-hidden group"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <span className="relative flex items-center justify-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Jogar Agora
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.span>
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// --------------------------------------------
// BOTTOM NAVIGATION
// --------------------------------------------
function BottomNav({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string; 
  onTabChange: (tab: any) => void;
}) {
  const tabs = [
    { id: 'jogar', label: 'Jogar', icon: Gamepad2 },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'premios', label: 'Prémios', icon: Gift },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50"
    >
      <div className="max-w-md mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {/* Glow when active */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-orange-100 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                )}
                
                <div className="relative z-10">
                  <tab.icon className={`w-6 h-6 ${isActive ? 'text-orange-500' : ''}`} />
                </div>
                <span className={`text-xs font-medium relative z-10 ${isActive ? 'text-orange-600' : ''}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

// --------------------------------------------
// TICKETS TAB
// --------------------------------------------
function TicketsTab() {
  const { campanhas } = usePlayerDashboard();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-24"
    >
      <h2 className="font-bold text-xl">Os Meus Tickets</h2>
      
      {campanhas.slice(0, 2).map((campanha) => (
        <div key={campanha.id} className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold">{campanha.titulo}</span>
            <span className="text-green-600 font-bold">€{campanha.preco.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Status: <span className="text-orange-600 font-medium">Em jogo</span></p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// --------------------------------------------
// PREMIOS TAB
// ------------------------------------------
function PremiosTab() {
  const { premios } = usePlayerDashboard();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-24"
    >
      <h2 className="font-bold text-xl">Os Meus Prémios</h2>
      
      {premios.map((premio) => (
        <motion.div
          key={premio.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
            {premio.icon}
          </div>
          <div className="flex-1">
            <p className="font-bold">{premio.nome}</p>
            <p className="text-sm text-gray-500">{premio.campanha}</p>
          </div>
          <div className="text-green-600 font-bold text-lg">
            +€{premio.valor}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// --------------------------------------------
// PERFIL TAB
// --------------------------------------------
function PerfilTab({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-24"
    >
      <h2 className="font-bold text-xl">O Meu Perfil</h2>
      
      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 shadow-md text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white ring-4 ring-amber-400 shadow-lg">
          U
        </div>
        <h3 className="font-bold text-xl">Jogador</h3>
        <p className="text-gray-500">Membro desde 2024</p>
      </div>
      
      {/* Opções */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-gray-600" />
            Os Meus Pagamentos
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            Notificações
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600"
        >
          <span className="flex items-center gap-3">
            <span className="text-lg">🚪</span>
            Sair
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface PlayerDashboardProps {
  onLogout?: () => void;
  onPlayGame?: (campanhaId: string) => void;
}

export function PlayerDashboard({ onLogout, onPlayGame }: PlayerDashboardProps) {
  const { stats, campanhas, activeTab, setActiveTab, selectedCampanha, setSelectedCampanha } = usePlayerDashboard();
  
  // Confetti no carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#9B59B6']
      });
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#9B59B6']
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = (campanhaId: string) => {
    const campanha = campanhas.find(c => c.id === campanhaId);
    if (campanha) {
      setSelectedCampanha(campanha);
      onPlayGame?.(campanhaId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1E3] via-[#FFF8F0] to-[#F8F1E3]">
      {/* Background pattern */}
      <FestiveBackgroundPattern />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-lg shadow-md border-b border-amber-100/50 sticky top-0 z-40"
      >
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo com brilho dourado */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {/* Brilho dourado */}
                <div className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-lg text-gray-800">Aldeias Games</h1>
                <p className="text-sm text-gray-500">Olá, Jogador! 🎮</p>
              </div>
            </div>
            
            {/* Avatar e sininho */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-xl relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                </button>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-purple-300 shadow-lg">
                U
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <StatsCard 
              titulo="Ganhos" 
              valor={stats.totalGanho} 
              icon={Coins}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              delay={0}
            />
            <StatsCard 
              titulo="Vitórias" 
              valor={stats.raspadinhasGanhas} 
              icon={Trophy}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={1}
            />
            <StatsCard 
              titulo="Ranking" 
              valor={`#${stats.ranking}`} 
              icon={Crown}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              delay={2}
            />
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: 'jogar', label: 'Explorar' },
              { id: 'tickets', label: 'Tickets' },
              { id: 'premios', label: 'Prémios' },
              { id: 'perfil', label: 'Perfil' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'jogar' && (
              <motion.div
                key="jogar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h2 className="font-bold text-xl">Campanhas Disponíveis</h2>
                {campanhas.map((campanha, index) => (
                  <motion.div
                    key={campanha.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CampaignCard 
                      campanha={campanha} 
                      onPlay={() => handlePlay(campanha.id)} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'tickets' && <TicketsTab key="tickets" />}
            {activeTab === 'premios' && <PremiosTab key="premios" />}
            {activeTab === 'perfil' && <PerfilTab onLogout={onLogout || (() => {})} key="perfil" />}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
