/**
 * PlayerDashboard.tsx
 * Dashboard do Jogador - VERSÃO PREMIUM App Store
 * Design: AAA festivo português de nível flagship
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
  Zap
} from 'lucide-react';
import { usePlayerDashboard } from '@/hooks/usePlayerDashboard';
import confetti from 'canvas-confetti';

// ============================================
// ANIMAÇÕES PREMIUM
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', bounce: 0.5, duration: 0.6 }
  }
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3 } }
};

const shimmerVariants: Variants = {
  initial: { x: '-100%' },
  animate: { x: '200%', transition: { duration: 1.5, repeat: Infinity, repeatDelay: 2 } }
};

const floatVariants: Variants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

const pulseGlowVariants: Variants = {
  initial: { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.4)' },
  animate: { 
    boxShadow: ['0 0 0 0 rgba(249, 115, 22, 0.4)', '0 0 20px 10px rgba(249, 115, 22, 0)', '0 0 0 0 rgba(249, 115, 22, 0)'],
    transition: { duration: 2, repeat: Infinity }
  }
};

// ============================================
// COMPONENTES UI REUTILIZÁVEIS
// ============================================

// Badge premium
function PremiumBadge({ children, color = 'amber' }: { children: React.ReactNode; color?: 'amber' | 'green' | 'purple' | 'pink' }) {
  const colors = {
    amber: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white',
    green: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    pink: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white'
  };
  
  return (
    <span className={`${colors[color]} px-3 py-1 text-xs font-bold rounded-full shadow-lg`}>
      {children}
    </span>
  );
}

// Botão premium
function PremiumButton({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '',
  icon: Icon 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  icon?: React.ElementType;
}) {
  const baseStyle = 'relative overflow-hidden px-6 py-3.5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95';
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:brightness-110',
    secondary: 'bg-gradient-to-r from-gray-700 to-gray-900 hover:brightness-110',
    outline: 'bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20'
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />
      </div>
      <span className="relative flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </motion.button>
  );
}

// Card premium
function PremiumCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white rounded-3xl shadow-xl border border-gray-100/50 ${glow ? 'ring-2 ring-purple-400/30' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STATS CARD COM ANIMAÇÃO
// ============================================
function AnimatedStatsCard({ 
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
  
  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (valor - startValue) * easeOut;
      setDisplayValue(Math.floor(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    const timeoutId = setTimeout(animate, delay * 100);
    return () => clearTimeout(timeoutId);
  }, [valor, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: 'spring', bounce: 0.5 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`${gradient} rounded-3xl p-4 text-white shadow-2xl relative overflow-hidden`}
    >
      {/* Decoração */}
      <div className="absolute -right-4 -top-4 opacity-20">
        <Icon className="w-24 h-24" />
      </div>
      
      {/* Brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold opacity-90 flex items-center gap-1">
            {titulo}
          </span>
          {emoji && <span className="text-lg">{emoji}</span>}
        </div>
        
        <p className="text-4xl font-black tracking-tighter drop-shadow-sm">
          {prefix}{displayValue.toLocaleString('pt-PT')}{suffix}
        </p>
      </div>
      
      {/* Borda inferior brilhante */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 via-white/30 to-white/50" />
    </motion.div>
  );
}

// ============================================
// CAMPAIGN CARD PREMIUM
// ============================================
function PremiumCampaignCard({ campanha, onPlay }: { campanha: any; onPlay: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 rounded-3xl blur-xl"
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header com gradiente festivo */}
        <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 p-5">
          {/* Pattern decorativo */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: isHovered ? 10 : 0 }}
                className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              >
                {campanha.tipo === 'raspadinha' ? '🎫' : campanha.tipo === 'poio_vaca' ? '🐄' : '🎰'}
              </motion.div>
              <div>
                <h3 className="text-white font-black text-xl leading-tight">{campanha.titulo}</h3>
                <p className="text-white/80 text-sm font-medium">🎁 {campanha.premioPrincipal}</p>
              </div>
            </div>
            <PremiumBadge color="green">Ativa</PremiumBadge>
          </div>
          
          {/* Partículas decorativas flutuantes */}
          <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-2 right-8 text-2xl"
          >
            ✨
          </motion.div>
        </div>
        
        {/* Preview da raspadinha */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              {(campanha.simbolos || ['⭐', '💰', '🎁', '🍀', '🔥', '💎', '🎀', '🌟', '🎉']).slice(0, 9).map((simbolo: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm"
                >
                  {simbolo}
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{campanha.participantes.toLocaleString('pt-PT')}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                €{campanha.preco.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Botão Jogar Agora */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlay}
            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ x: isHovered ? '100%' : '-100%' }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
            </div>
            
            <span className="relative flex items-center justify-center gap-3">
              <Gamepad2 className="w-6 h-6" />
              JOGAR AGORA
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.span>
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// BOTTOM NAVIGATION PREMIUM
// ============================================
function PremiumBottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: any) => void }) {
  const tabs = [
    { id: 'jogar', label: 'Jogar', icon: Gamepad2, gradient: 'from-orange-500 to-amber-500' },
    { id: 'tickets', label: 'Tickets', icon: Ticket, gradient: 'from-purple-500 to-pink-500' },
    { id: 'premios', label: 'Prémios', icon: Gift, gradient: 'from-green-500 to-emerald-500' },
    { id: 'perfil', label: 'Perfil', icon: User, gradient: 'from-blue-500 to-cyan-500' },
  ];

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-100 z-50"
    >
      <div className="max-w-md mx-auto px-3 py-2">
        <div className="flex items-center justify-between bg-gray-50/50 rounded-3xl p-1.5">
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
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-2xl`}
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
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
                🎫
              </div>
              <div>
                <h3 className="font-bold text-lg">{campanha.titulo}</h3>
                <p className="text-sm text-gray-500">Bilhete #{Math.floor(Math.random() * 9000 + 1000)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-green-600 font-bold text-lg">+€{campanha.preco.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                🟡 Em jogo
              </span>
            </div>
            <button className="text-purple-600 font-semibold text-sm flex items-center gap-1">
              Ver detalhes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
      
      {/* Empty state visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-8"
      >
        <div className="text-6xl mb-4">🎫</div>
        <p className="text-gray-500 font-medium">Carrega mais raspadinhas!</p>
      </motion.div>
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
          {/* Background decoration */}
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
// PERFIL TAB PREMIUM
// ============================================
function PerfilTab({ onLogout }: { onLogout: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-28"
    >
      {/* Avatar Card */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Decoração */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative mb-4"
          >
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
          { icon: Wallet, label: 'Os Meus Pagamentos', color: 'green', emoji: '💳' },
          { icon: Bell, label: 'Notificações', color: 'amber', emoji: '🔔', badge: '3' },
          { icon: Shield, label: 'Privacidade & Segurança', color: 'blue', emoji: '🔒' },
          { icon: HelpCircle, label: 'Ajuda & Support', color: 'purple', emoji: '❓' },
          { icon: Settings, label: 'Configurações', color: 'gray', emoji: '⚙️' },
        ].map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-${item.color}-100 rounded-2xl flex items-center justify-center text-xl`}>
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
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl shadow-lg border-b border-gray-100"
    >
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
              className="relative"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              {/* Estrelas decorativas */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="font-black text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Aldeias Games
              </h1>
              <p className="text-sm text-gray-500 font-medium">Olá, Jogador! 🎮</p>
            </div>
          </div>
          
          {/* Right side */}
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
// COMPONENTE PRINCIPAL
// ============================================
interface PlayerDashboardProps {
  onLogout?: () => void;
  onPlayGame?: (campanhaId: string) => void;
}

export function PlayerDashboard({ onLogout, onPlayGame }: PlayerDashboardProps) {
  const { stats, campanhas, activeTab, setActiveTab, setSelectedCampanha } = usePlayerDashboard();
  
  // Confetti de boas-vindas
  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#9B59B6', '#F59E0B']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#FFD700', '#FF6B6B', '#9B59B6', '#F59E0B']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }, 1500);
    
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50">
      {/* Background pattern sutil */}
      <div className="fixed inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(251, 191, 36, 0.3) 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 20%),
          radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
        `,
      }} />
      
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
              <AnimatedStatsCard 
                titulo="Ganhos" 
                valor={stats.totalGanho} 
                icon={DollarSign}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                prefix="€"
                delay={0}
                emoji="💰"
              />
              <AnimatedStatsCard 
                titulo="Vitórias" 
                valor={stats.raspadinhasGanhas} 
                icon={Trophy}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                delay={1}
                emoji="🏆"
              />
              <AnimatedStatsCard 
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
                    animate={{ scale: [1, 1.1, 1] }}
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
                    <PremiumCampaignCard 
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

      {/* Premium Bottom Navigation */}
      <PremiumBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
