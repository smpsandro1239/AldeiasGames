/**
 * LandingPage.tsx
 * Landing Page Principal - Aldeias Games
 * Estilo: Festas de aldeia portuguesas + Modernidade Premium
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Trophy,
  Users,
  Heart,
  Gift,
  ArrowRight,
  Play,
  Star,
  MapPin,
  Calendar,
  Shield,
  Gamepad2,
  Wallet,
  Camera,
  Music,
  PartyPopper,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton } from '@/components/ui-components';

// ============================================
// CONFIGURAÇÕES DE ESTILO - PALETA FESTIVA
// ============================================

const COLORS = {
  // Festivos portugueses
  vermelhoFesta: '#E11D48',    // Vermelho festivo
  verdeAlho: '#16A34A',        // Verde tradicional
  dourado: '#F59E0B',          // Dourado celebração
  azulPortugal: '#1E40AF',     // Azul Portugal
  
  // Tons modernos
  cream: '#FFFBEB',
  white: '#FFFFFF',
  dark: '#1C1917',
  
  // Gradientes
  festive: 'linear-gradient(135deg, #E11D48 0%, #F59E0B 50%, #16A34A 100%)',
  heroGradient: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)',
};

// ============================================
// ANIMAÇÕES FRAMER MOTION
// ============================================

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const float = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
};

// ============================================
// COMPONENTES DA LANDING PAGE
// ============================================

// --------------------------------------------
// NAVBAR
// --------------------------------------------
function Navbar({ onLoginClick, onRegisterClick }: { onLoginClick: () => void; onRegisterClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: COLORS.festive }}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl lg:text-2xl font-black tracking-tight">
              <span className="text-red-600">Aldeias</span>
              <span className="text-amber-500">Games</span>
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#como-funciona" className="text-stone-600 hover:text-red-600 font-medium transition-colors">Como Funciona</a>
            <a href="#jogos" className="text-stone-600 hover:text-red-600 font-medium transition-colors">Jogos</a>
            <a href="#para-organizadores" className="text-stone-600 hover:text-red-600 font-medium transition-colors">Para Organizadores</a>
            <a href="#contacto" className="text-stone-600 hover:text-red-600 font-medium transition-colors">Contacto</a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <UIButton variant="ghost" onClick={onLoginClick}>Entrar</UIButton>
            <UIButton 
              onClick={onRegisterClick}
              style={{ background: COLORS.festive }}
            >
              Criar Campanha
            </UIButton>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#como-funciona" className="block py-2 text-stone-600">Como Funciona</a>
              <a href="#jogos" className="block py-2 text-stone-600">Jogos</a>
              <a href="#para-organizadores" className="block py-2 text-stone-600">Para Organizadores</a>
              <div className="pt-3 space-y-2">
                <UIButton variant="outline" className="w-full">Entrar</UIButton>
                <UIButton className="w-full" style={{ background: COLORS.festive }}>Criar Campanha</UIButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// --------------------------------------------
// HERO SECTION
// --------------------------------------------
function HeroSection({ onCtaClick }: { onCtaClick: () => void }) {
  useEffect(() => {
    // Confetti inicial
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E11D48', '#F59E0B', '#16A34A', '#1E40AF']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E11D48', '#F59E0B', '#16A34A', '#1E40AF']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: COLORS.heroGradient }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E11D48' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <motion.div className="absolute top-20 left-10" animate={float}>
        <PartyPopper className="w-16 h-16 text-red-500 opacity-60" />
      </motion.div>
      <motion.div className="absolute top-40 right-20" animate={float} transition={{ delay: 0.5 }}>
        <Gift className="w-12 h-12 text-amber-500 opacity-60" />
      </motion.div>
      <motion.div className="absolute bottom-40 left-20" animate={float} transition={{ delay: 1 }}>
        <Star className="w-14 h-14 text-green-500 opacity-60" />
      </motion.div>
      <motion.div className="absolute bottom-20 right-10" animate={float} transition={{ delay: 1.5 }}>
        <Sparkles className="w-12 h-12 text-blue-600 opacity-60" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-red-600 bg-red-100 mb-6"
            animate={pulse}
          >
            <Sparkles className="w-4 h-4" />
            Festas de Aldeia Digitais
          </motion.span>
        </motion.div>

        <motion.h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className="text-stone-800">Tradição + </span>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: COLORS.festive }}>
            Tecnologia
          </span>
        </motion.h1>

        <motion.p 
          className="text-xl lg:text-2xl text-stone-600 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Digitalizamos os jogos tradicionais portugueses para angariação de fundos. 
          Rifas, raspadinhas e muito mais — de aldeia em aldeia.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <UIButton 
              size="lg" 
              className="text-lg px-8 py-4 shadow-xl"
              style={{ background: COLORS.festive }}
              onClick={onCtaClick}
            >
              <PartyPopper className="w-5 h-5 mr-2" />
              Criar Minha Campanha
              <ArrowRight className="w-5 h-5 ml-2" />
            </UIButton>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <UIButton variant="outline" size="lg" className="text-lg px-8 py-4">
              <Play className="w-5 h-5 mr-2" />
              Ver Demo
            </UIButton>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-stone-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span>100% Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>+500 Aldeias</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Angariações Verificadas</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-stone-400" />
      </motion.div>
    </section>
  );
}

// --------------------------------------------
// GAMES SECTION
// --------------------------------------------
function GamesSection() {
  const games = [
    {
      icon: Gamepad2,
      title: "Poio da Vaca",
      description: "O clássico jogo de números! Os participantes escolhem números numa grelha e esperam pela sorte.",
      color: "bg-green-100 text-green-600",
      borderColor: "border-green-300"
    },
    {
      icon: Ticket,
      title: "Rifa / Tombola",
      description: "Loteria tradicional portuguesa. Número sorteado — imediato知道了!",
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-300"
    },
    {
      icon: Sparkles,
      title: "Raspadinhas",
      description: "Cartões digitais para raspar. A emoção de descobrir se ganhaste em segundos!",
      color: "bg-purple-100 text-purple-600",
      borderColor: "border-purple-300"
    }
  ];

  return (
    <section id="jogos" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4">
// @ts-ignore
        <motion.div 
          className="text-center mb-16"
          {...fadeInUp}
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-amber-600 bg-amber-100 mb-4">
            Os Nossos Jogos
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-stone-800 mb-4">
            Tradição em <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-500 to-green-500">Formato Digital</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Jogos que toda a gente conhece e adora, agora acessíveis a todos, em qualquer lugar.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {games.map((game, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className={`relative p-8 rounded-3xl border-2 ${game.borderColor} bg-white hover:shadow-2xl transition-all duration-300 group`}
              whileHover={{ y: -10 }}
            >
              <div className={`w-16 h-16 rounded-2xl ${game.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <game.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3">{game.title}</h3>
              <p className="text-stone-600">{game.description}</p>
              <motion.div 
                className="mt-6 flex items-center text-sm font-bold"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <span className="text-red-600">Saber mais</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Helper component for Ticket icon
function Ticket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

// --------------------------------------------
// HOW IT WORKS SECTION
// --------------------------------------------
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Cria a Campanha",
      description: "Em menos de 3 minutos, configura a tua rifa ou raspadinha com os prémios.",
      icon: Calendar
    },
    {
      number: "02",
      title: "Partilha",
      description: "Distribui o link ou QR code pela comunidade — WhatsApp, redes sociais, ou impresso.",
      icon: Users
    },
    {
      number: "03",
      title: "Joga & Ganha",
      description: "Os participantes jogam no telemóvel e recebem resultados instantâneos.",
      icon: Trophy
    },
    {
      number: "04",
      title: "Angariação Feita",
      description: "Tudo transparente.后台 automatically recolhe fundos e regista os vencedores.",
      icon: Wallet
    }
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-32 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          {...fadeInUp}
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-green-600 bg-green-100 mb-4">
            Simples & Rápido
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-stone-800 mb-4">
            Como <span className="text-green-600">Funciona</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            4 passos para uma angariação de fundos de sucesso.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
                <span className="text-6xl font-black text-stone-100 absolute top-4 right-4">
                  {step.number}
                </span>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">{step.title}</h3>
                  <p className="text-stone-600 text-sm">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-stone-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------
// ORGANIZERS CTA SECTION
// --------------------------------------------
function OrganizersSection() {
  return (
    <section id="para-organizadores" className="py-20 lg:py-32" style={{ background: COLORS.festive }}>
      <div className="max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Orgulha a Tua Comunidade! 🎉
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            As comissões de festas, escolas e associações de todo o Portugal já confiam no Aldeias Games. 
            É a forma mais fácil de angariar fundos para a tua causa.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <motion.div 
              className="bg-white/20 backdrop-blur rounded-2xl p-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-white mb-2">80%</div>
              <p className="text-white/80">Menor custo operacional</p>
            </motion.div>
            <motion.div 
              className="bg-white/20 backdrop-blur rounded-2xl p-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-white mb-2">3x</div>
              <p className="text-white/80">Mais participantes</p>
            </motion.div>
            <motion.div 
              className="bg-white/20 backdrop-blur rounded-2xl p-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl font-black text-white mb-2">0€</div>
              <p className="text-white/80">Custo inicial</p>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UIButton 
              size="lg" 
              className="text-lg px-10 py-4 bg-white text-red-600 hover:bg-stone-100 shadow-xl"
            >
              <PartyPopper className="w-5 h-5 mr-2" />
              Criar Campanha Grátis
            </UIButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// --------------------------------------------
// TESTIMONIALS
// --------------------------------------------
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria Ferreira",
      role: "Comissão de Festas - Aldeia Velha",
      text: "Em 2 dias angariamos mais do que no ano passado! Os idosos adoraram jogar no telemóvel.",
      avatar: "MF"
    },
    {
      name: "João Santos",
      direction: "Diretor - Escola Primary de Coimbra",
      text: "Os pais adoraram a transparência. Muito fácil de organizar e os miúdos divertiram-se imenso!",
      avatar: "JS"
    },
    {
      name: "Ana Rodrigues",
      role: "Associação de Pais - Vila Nova",
      text: "Nunca foi tão fácil fazer angariação de fundos. Recomendo a todas as associações!",
      avatar: "AR"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          {...fadeInUp}
        >
          <span className="inline-block px-4 py-1 rounded-full text-sm font-bold text-amber-600 bg-amber-100 mb-4">
            Depoimentos
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-stone-800">
            O que dizem <span className="text-amber-500">os nossos clientes</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-stone-50 p-8 rounded-2xl"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-stone-600 mb-6">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-amber-400 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-stone-800">{testimonial.name}</p>
                  <p className="text-sm text-stone-500">{testimonial.role || testimonial.direction}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------
// FOOTER
// --------------------------------------------
function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: COLORS.festive }}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                <span className="text-red-500">Aldeias</span>
                <span className="text-amber-500">Games</span>
              </span>
            </div>
            <p className="text-stone-400 max-w-md">
              A plataforma digital que leva a tradição das festas de aldeia portuguesas para o século XXI.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Jogos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 Aldeias Games. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <MapPin className="w-5 h-5" />
            <span>Portugal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />
      <HeroSection onCtaClick={onRegisterClick} />
      <GamesSection />
      <HowItWorksSection />
      <OrganizersSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}
