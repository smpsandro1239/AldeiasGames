/**
 * PlayerDashboard.tsx
 * Dashboard do Jogador - VERSÃO AAA FESTIVA PREMIUM
 * Design: Exact match à referência visual App Store
 * Mobile-first, premium feel, 100% fiel à imagem de referência
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
  Star,
  Settings,
  LogOut,
  CreditCard,
  HelpCircle,
  Shield,
  Sparkle,
  PartyPopper,
  DollarSign,
  Target,
  Flame,
  Zap,
  WalletCards,
  History,
  TrendingUp,
  BadgeCheck
} from 'lucide-react';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';
import confetti from 'canvas-confetti';

// ============================================
// CONFIGURAÇÕES VISUAIS (seguindo referência)
// ============================================

const THEME = {
  colors: {
    background: {
      start: '#F8F1E3',
      end: '#FFF8F0',
    },
    gradients: {
      primary: 'from-purple-500 via-pink-500 to-amber-500',
      green: 'from-green-500 to-emerald-600',
      purple: 'from-purple-500 to-pink-500',
      orange: 'from-amber-500 to-orange-600',
    },
    text: {
      gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent',
      heading: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    }
  },
  fonts: {
    display: 'font-black tracking-tighter',
    heading: 'font-bold',
    body: 'font-medium',
  }
};

// ============================================
// ANIMAÇÕES PREMIUM
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', bounce: 0.5, duration: 0.7 }
  }
};

const cardVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3 } }
};

// ============================================
// COMPONENTES UI PREMIUM
// ============================================

// Badge "Ativa" verde brilhante
function ActiveBadge() {
  return (
    <motion.span 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.6 }}
      className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/30"
    >
      Ativa
    </motion.span>
  );
}

// Botão "Jogar Agora" enorme com gradiente e pulse
function PlayButton({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
    >
      {/* Shine effect animado */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-1/2"
          style={{ width: '50%' }}
        />
      </div>
      
      {/* Pulse ring */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 rounded-2xl border-2 border-white/50"
      />
      
      <span className="relative z-10 flex items-center justify-center gap-3">
        <Gamepad2 className="w-6 h-6" />
        JOGAR AGORA
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          <ChevronRight className="w-6 h-6" />
        </motion.span>
      </span>
    </motion.button>
  );
}

// ============================================
// STATS CARD COM CONTAGEM ANIMADA
// ============================================
function StatsCard({ 
  titulo, 
  valor, 
  icon: Icon, 
  gradient,
  suffix = '',
  prefix = '',
  delay = 0,
  emoji
}: { 
  titulo: string; 
  valor: number; 
  icon: React.ElementType; 
  gradient: string;
  suffix?: string;
  prefix?: string;
  delay?: number;
  emoji?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Contagem animada
  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = valor * easeOut;
      setDisplayValue(Math.floor(current));
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    setTimeout(animate, delay * 100);
  }, [valor, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: 'spring', bounce: 0.5 }}
      whileHover={{ scale: 1.03, y: -3 }}
      className={`${gradient} rounded-3xl p-4 text-white shadow-2xl relative overflow-hidden`}
    >
      {/* Ícone grande decorativo */}
      <div className="absolute -right-2 -top-2 opacity-15">
        <Icon className="w-28 h-28" />
      </div>
      
      {/* Brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold opacity-90">{titulo}</span>
          {emoji && <span className="text-xl">{emoji}</span>}
        </div>
        
        <p className="text-4xl font-black tracking-tighter drop-shadow-md">
          {prefix}{displayValue.toLocaleString('pt-PT')}{suffix}
        </p>
      </div>
      
      {/* Borda inferior brilhante */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/60 via-white/30 to-white/60" />
    </motion.div>
  );
}

// ============================================
// SCRATCH CARD PREVIEW COM EFEITO PARCIAL
// ============================================
function ScratchCardMiniPreview({ simbolos, revealed = 3 }: { simbolos: string[]; revealed?: number }) {
  const revealedIndices = Array.from({ length: revealed }, (_, i) => i * 3 + 1);
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-inner">
      <div className="grid grid-cols-3 gap-1.5">
        {simbolos.map((simbolo, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03, type: 'spring' }}
            className={`aspect-square rounded-lg flex items-center justify-center text-xl shadow-sm ${
              revealedIndices.includes(i)
                ? 'bg-white'
                : 'bg-gradient-to-br from-gray-200 to-gray-300'
            }`}
          >
            {revealedIndices.includes(i) ? (
              <span className="text-2xl filter drop-shadow-sm">{simbolo}</span>
            ) : (
              <Sparkles className="w-4 h-4 text-gray-400/50" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PREMIUM SCRATCH CARD (seguindo referência exata)
// ============================================
function PremiumScratchCard({ 
  titulo, 
  premioPrincipal, 
  simbolos, 
  onPlay,
  participantes
}: { 
  titulo: string; 
  premioPrincipal: string; 
  simbolos: string[];
  onPlay?: () => void;
  participantes: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      {/* Glow effect no hover */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-3xl blur-xl"
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header com gradiente EXATO: roxo → rosa → dourado */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 p-5">
          {/* Pattern sutil de partículas */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 3px 3px, white 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }} />
          
          <div className="relative z-10">
            {/* Título e badge */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-black text-xl leading-tight">{titulo}</h3>
                <p className="text-white/80 text-sm font-medium">🎁 {premioPrincipal}</p>
              </div>
              <ActiveBadge />
            </div>
            
            {/* Preview da raspadinha + info na mesma linha */}
            <div className="flex gap-3">
              {/* Preview com efeito parcial */}
              <div className="w-1/3">
                <ScratchCardMiniPreview simbolos={simbolos} revealed={3} />
              </div>
              
              {/* Info à direita */}
              <div className="flex-1 flex flex-col justify-center">
                {/* 500€ GIGANTE metálicoo com glow */}
                <div className="relative">
                  <motion.p 
                    animate={{ 
                      textShadow: ['0 0 20px rgba(251,191,36,0.8)', '0 0 40px rgba(251,191,36,1)', '0 0 20px rgba(251,191,36,0.8)']
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-5xl font-black text-transparent bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 bg-clip-text"
                  >
                    {premioPrincipal}
                  </motion.p>
                  {/* Partículas douradas */}
                  <div className="absolute -top-1 -right-2">
                    <motion.div
                      animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      ✨
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/70 text-xs">{participantes.toLocaleString('pt-PT')} jogadores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Corpo do card */}
        <div className="p-4">
          {/* Barra de progresso elegante laranja */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">Prémio atual</span>
              <span className="text-amber-600 font-bold">85%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              />
            </div>
          </div>
          
          {/* Botão Jogar Agora */}
          <PlayButton onClick={onPlay} />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BOTTOM NAVIGATION (seguindo referência)
// ============================================
function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: any) => void }) {
  const tabs = [
    { id: 'jogar', label: 'Jogar', icon: Gamepad2 },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'premios', label: 'Prémios', icon: Gift },
    { id: 'perfil', label: 'Perfil', icon: User },
  ];

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring' }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 z-50"
    >
      <div className="max-w-md mx-auto px-3 py-2">
        <div className="flex items-center justify-between bg-gray-50/80 rounded-3xl p-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex-1 py-3 rounded-2xl transition-all ${
                  isActive ? 'bg-white shadow-lg' : 'hover:bg-gray-100'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator com glow laranja forte */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`relative ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    <tab.icon className="w-6 h-6" />
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Zap className="w-3 h-3 text-amber-200 fill-amber-200" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================
// TICKETS TAB
// ============================================
function TicketsTab() {
  const { campanhas } = usePlayerDashboard();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-28"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-black text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Os Meus Tickets
        </h2>
        <span className="text-sm text-gray-500 font-medium">2 ativos</span>
      </div>
      
      {campanhas.slice(0, 2).map((campanha, index) => (
        <motion.div
          key={campanha.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-3xl p-5 shadow-xl border border-gray-100"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                🎫
              </div>
              <div>
                <h3 className="font-bold text-lg">{campanha.titulo}</h3>
                <p className="text-sm text-gray-500">Bilhete #{Math.floor(Math.random() * 9000 + 1000)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-green-600 font-black text-xl">+€{campanha.preco.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
              🟡 Em jogo
            </span>
            <button className="text-purple-600 font-bold text-sm flex items-center gap-1">
              Ver detalhes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// PREMIOS TAB
// ============================================
function PremiosTab() {
  const { premios } = usePlayerDashboard();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-28"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-black text-2xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
          Os Meus Prémios
        </h2>
        <span className="text-sm text-gray-500 font-medium">{premios.length} ganhos</span>
      </div>
      
      {premios.map((premio, index) => (
        <motion.div
          key={premio.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-3xl p-5 shadow-xl border border-amber-100 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-50" />
          
          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            >
              {premio.icon}
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{premio.nome}</h3>
              <p className="text-sm text-gray-500">{premio.campanha}</p>
              <p className="text-xs text-gray-400">{premio.data}</p>
            </div>
            <div className="text-right">
              <motion.p 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-2xl font-black text-green-500"
              >
                +€{premio.valor}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Total ganhos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 font-medium">Total Ganho</p>
            <p className="text-4xl font-black">€{premios.reduce((sum, p) => sum + p.valor, 0)}</p>
          </div>
          <Trophy className="w-16 h-16 text-white/30" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// PERFIL TAB
// ============================================
function PerfilTab({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-28"
    >
      {/* Avatar Card com gradient background */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="relative mb-4">
            <div className="w-28 h-28 bg-white rounded-full p-1 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl font-black">
                U
              </div>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-2 shadow-lg"
            >
              <Sparkle className="w-4 h-4 text-white fill-white" />
            </motion.div>
          </motion.div>
          
          <h2 className="text-2xl font-black mb-1">Jogador</h2>
          <p className="text-white/80 font-medium">Membro desde 2024</p>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-bold">Level 5</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {[
          { icon: WalletCards, label: 'Os Meus Pagamentos', emoji: '💳' },
          { icon: Bell, label: 'Notificações', emoji: '🔔', badge: '3' },
          { icon: Shield, label: 'Privacidade & Segurança', emoji: '🔒' },
          { icon: HelpCircle, label: 'Ajuda & Support', emoji: '❓' },
          { icon: Settings, label: 'Configurações', emoji: '⚙️' },
        ].map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">
                {item.emoji}
              </div>
              <span className="font-semibold text-gray-800">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 hover:bg-red-100 rounded-3xl text-red-600 font-bold transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sair da Conta
      </motion.button>
    </motion.div>
  );
}

// ============================================
// HEADER PREMIUM
// ============================================
function PremiumHeader() {
  return (
    <motion.header 
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl shadow-lg border-b border-gray-100"
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo MAIOR com brilho dourado + estrelas */}
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, repeatDelay: 3 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              {/* Estrelas decorativas */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1"
              >
                <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                className="absolute -bottom-0.5 -left-1"
              >
                <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="font-black text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Aldeias Games
              </h1>
              <p className="text-sm text-gray-500 font-medium">Olá, Jogador! 🎮</p>
            </div>
          </div>
          
          {/* Right side com avatar borda dourada + glow roxo */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              >
                3
              </motion.span>
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-4 ring-purple-200"
            >
              U
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// ============================================
// BACKGROUND PATTERN SUTIL
// ============================================
function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-25" style={{
      backgroundImage: `
        radial-gradient(circle at 8% 15%, rgba(251, 191, 36, 0.4) 0%, transparent 18%),
        radial-gradient(circle at 92% 75%, rgba(236, 72, 153, 0.3) 0%, transparent 18%),
        radial-gradient(circle at 50% 45%, rgba(168, 85, 247, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 25% 85%, rgba(249, 115, 22, 0.2) 0%, transparent 15%),
        radial-gradient(circle at 75% 20%, rgba(34, 197, 94, 0.15) 0%, transparent 15%)
      `,
    }} />
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
  const { stats, campanhas, activeTab, setActiveTab, setSelectedCampanha } = usePlayerDashboard();
  
  // Confetti dourado/vermelho subtil ao carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 50,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#F59E0B', '#EC4899']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 50,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#F59E0B', '#EC4899']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePlay = useCallback((campanhaId: string) => {
    const campanha = campanhas.find(c => c.id === campanhaId);
    if (campanha) {
      setSelectedCampanha(campanha);
      onPlayGame?.(campanhaId);
    }
  }, [campanhas, setSelectedCampanha, onPlayGame]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F1E3] via-[#FFF8F0] to-[#F8F1E3]">
      <BackgroundPattern />
      <PremiumHeader />

      <main className="max-w-md mx-auto px-4 py-6 pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Section */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              <StatsCard 
                titulo="Ganhos" 
                valor={stats.totalGanho} 
                icon={DollarSign}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                prefix="€"
                delay={0}
                emoji="💰"
              />
              <StatsCard 
                titulo="Vitórias" 
                valor={stats.raspadinhasGanhas} 
                icon={Trophy}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                delay={1}
                emoji="🏆"
              />
              <StatsCard 
                titulo="Ranking" 
                valor={stats.ranking} 
                icon={Crown}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                prefix="#"
                delay={2}
                emoji="👑"
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'jogar', label: 'Explorar', emoji: '🎯' },
                { id: 'tickets', label: 'Tickets', emoji: '🎫' },
                { id: 'premios', label: 'Prémios', emoji: '🎁' },
                { id: 'perfil', label: 'Perfil', emoji: '👤' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-md ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{tab.emoji}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'jogar' && (
              <motion.div
                key="jogar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-2xl text-gray-800">
                    Campanhas Disponíveis
                  </h2>
                  <motion.span 
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.span>
                </div>
                {campanhas.map((campanha, index) => (
                  <motion.div
                    key={campanha.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <PremiumScratchCard 
                      titulo={campanha.titulo}
                      premioPrincipal={campanha.premioPrincipal}
                      simbolos={campanha.simbolos || ['⭐', '💰', '🎁', '🍀', '🔥', '💎', '🎀', '🌟', '🎉']}
                      onPlay={() => handlePlay(campanha.id)}
                      participantes={campanha.participantes}
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