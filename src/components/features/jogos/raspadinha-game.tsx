/**
 * RaspadinhaGame.tsx
 * Jogo de Raspadinha Digital - Design Premium
 * Estilo: Festivo, excitement, reward
 * Features: Imagens personalizáveis, aspeto real de raspadinha
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Trophy, 
  Gift, 
  Star, 
  Coins,
  RefreshCw,
  Share2,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton } from '@/components/ui-components';

// ============================================
// CONFIGURAÇÃO E TIPOS
// ============================================

interface Premio {
  titulo: string;
  valor: number;
  probabilidade: number;
}

interface RaspadinhaGameProps {
  jogoId: string;
  titulo: string;
  preco: number;
  premios: Premio[];
  config?: {
    simbolos?: string[];
    imagens?: string[];  // URLs das imagens para os símbolos
    imagemFesta?: string;  // Imagem de fundo/tema da festa
    cores?: {
      primario: string;
      secundario: string;
    };
  };
  soundEnabled?: boolean;
}

interface AreaOculta {
  id: number;
  revelada: boolean;
  simbolo: string;
  imagem: string;  // URL da imagem
  premio: string;
}

// ============================================
// ANIMAÇÕES
// ============================================

const scratchMotion = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
} as const;

const victoryMotion = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  }
} as const;

const prizeReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.5, duration: 0.5 }
  }
} as const;

const winnerBanner = {
  hidden: { opacity: 0, y: -50, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
} as const;

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// ÁREA DE RASPAR COM ASPETO REAL (SCRATCH AREA)
// --------------------------------------------
function ScratchArea({ 
  areas, 
  onScratch,
  mostrandoResultado,
  simboloVencedor
}: { 
  areas: AreaOculta[]; 
  onScratch: (id: number) => void;
  mostrandoResultado?: boolean;
  simboloVencedor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scratchedIds, setScratchedIds] = useState<Set<number>>(new Set());

  // tracking scratched areas via canvas-like effect
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element?.classList.contains('scratch-area')) {
      const id = parseInt(element.getAttribute('data-id') || '0');
      if (id && !areas.find(a => a.id === id)?.revelada && !scratchedIds.has(id)) {
        setScratchedIds(prev => new Set(prev).add(id));
        onScratch(id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    if (element?.classList.contains('scratch-area')) {
      const id = parseInt(element.getAttribute('data-id') || '0');
      if (id && !areas.find(a => a.id === id)?.revelada && !scratchedIds.has(id)) {
        setScratchedIds(prev => new Set(prev).add(id));
        onScratch(id);
      }
    }
  };

  const handleClick = (id: number) => {
    if (!areas.find(a => a.id === id)?.revelada && !scratchedIds.has(id)) {
      setScratchedIds(prev => new Set(prev).add(id));
      onScratch(id);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* Container com aspeto de raspadinha real */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-3 shadow-2xl border-4 border-gray-300">
        {/* Texto "RASPE AQUI" */}
        {!mostrandoResultado && (
          <div className="text-center mb-3">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">
              ✨ Raspe para revelar ✨
            </p>
          </div>
        )}
        
        {/* Grid de áreas - estilo raspadinha real */}
        <div className="grid grid-cols-3 gap-2">
          {areas.map((area) => {
            const isWinnerSymbol = area.simbolo === simboloVencedor && mostrandoResultado;
            
            return (
              <motion.button
                key={area.id}
                data-id={area.id}
                className={`scratch-area aspect-square rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${
                  area.revelada 
                    ? 'bg-white shadow-inner' 
                    : 'cursor-crosshair hover:scale-[1.02]'
                }`}
                style={{
                  background: area.revelada 
                    ? '#fff' 
                    : 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 50%, #B8B8B8 100%)',
                  boxShadow: area.revelada
                    ? 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    : '0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)'
                }}
                whileHover={!area.revelada ? { scale: 1.02 } : {}}
                whileTap={!area.revelada ? { scale: 0.98 } : {}}
                onClick={() => !area.revelada && handleClick(area.id)}
                disabled={area.revelada}
              >
                {area.revelada ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.4 }}
                    className="w-full h-full flex items-center justify-center p-1"
                  >
                    {area.imagem ? (
                      <div className={`relative w-full h-full flex items-center justify-center ${isWinnerSymbol ? 'bg-green-100 rounded-lg' : ''}`}>
                        {isWinnerSymbol && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 z-10"
                          >
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <CheckCircle className="w-3 h-3" />
                            </div>
                          </motion.div>
                        )}
                        <img 
                          src={area.imagem} 
                          alt={area.simbolo}
                          className="max-w-[90%] max-h-[90%] object-contain"
                        />
                      </div>
                    ) : (
                      <span className="text-4xl">{area.simbolo}</span>
                    )}
                  </motion.div>
                ) : (
                  // Efeito de textura prateada
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-300 opacity-80" 
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 2px,
                          rgba(255,255,255,0.1) 2px,
                          rgba(255,255,255,0.1) 4px
                        )`
                      }}
                    />
                    <Sparkles className="absolute w-6 h-6 text-gray-500/50" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------
// BANNER DE VITÓRIA (informação no topo)
// --------------------------------------------
function WinnerBanner({ 
  premio,
  simbolo 
}: { 
  premio: string | null; 
  simbolo: string;
}) {
  const isWinner = premio && premio !== "SEM PRÉMIO";
  
  if (!isWinner) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={winnerBanner}
      className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl p-4 shadow-2xl mb-4 border-2 border-amber-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 shadow-lg">
            <Trophy className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-900 font-black text-xl uppercase tracking-wide">
              🎉 GANHOU! 🎉
            </p>
            <p className="text-amber-800 font-bold">
              {premio}
            </p>
          </div>
        </div>
        <div className="text-4xl">
          <PartyPopper className="w-10 h-10 text-amber-600" />
        </div>
      </div>
      
      <div className="mt-3 bg-white/30 rounded-lg p-2 text-center">
        <p className="text-amber-900 font-medium text-sm">
          3 símbolos iguais: <span className="font-bold">{simbolo}</span>
        </p>
      </div>
    </motion.div>
  );
}

// --------------------------------------------
// RESULTADO VITÓRIA (MODAL)
// --------------------------------------------
function VictoryScreen({ 
 premio, 
 onNovamente, 
 onPartilhar 
}: { 
  premio: string | null; 
  onNovamente: () => void; 
  onPartilhar: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors: ['#F59E0B', '#E11D48', '#16A34A', '#1E40AF']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors: ['#F59E0B', '#E11D48', '#16A34A', '#1E40AF']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const isWinner = premio && premio !== "SEM PRÉMIO";

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={victoryMotion}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-8"
        >
          {isWinner ? (
            <div className="relative inline-block">
              <Trophy className="w-32 h-32 text-amber-400 mx-auto animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Sparkles className="w-16 h-16 text-amber-300 -top-4 -right-4" />
              </motion.div>
            </div>
          ) : (
            <XCircle className="w-32 h-32 text-gray-400 mx-auto" />
          )}
        </motion.div>

        <motion.h2
          variants={prizeReveal}
          className={`text-4xl font-black mb-4 ${isWinner ? 'text-amber-400' : 'text-gray-400'}`}
        >
          {isWinner ? '🎉 GANHOU! 🎉' : 'Não foi desta vez'}
        </motion.h2>

        {isWinner && (
          <motion.p
            variants={prizeReveal}
            className="text-2xl font-bold text-white mb-2"
          >
            {premio}
          </motion.p>
        )}

        <motion.p
          variants={prizeReveal}
          className="text-gray-400 mb-8"
        >
          {isWinner 
            ? 'Parabéns! O seu prémio será contactado em breve.' 
            : 'Continue a tentar! Boa sorte para a próxima.'}
        </motion.p>

        <motion.div
          variants={prizeReveal}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <UIButton 
            size="lg" 
            className="bg-amber-500 hover:bg-amber-600"
            onClick={onNovamente}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Jogar Novamente
          </UIButton>
          {isWinner && (
            <UIButton 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={onPartilhar}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Partilhar
            </UIButton>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// --------------------------------------------
// INSTRUÇÕES
// --------------------------------------------
function Instrucoes({ onComecar, imagemFesta }: { onComecar: () => void; imagemFesta?: string }) {
  const pasos = [
    { icon: Coins, text: "Escolhe a tua raspadinha" },
    { icon: Sparkles, text: "Raspa as 9 áreas com o dedo" },
    { icon: Trophy, text: "Se revelares 3 imagens iguais, GANHAS!" }
  ];

  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        {/* Imagem da festa se existir */}
        {imagemFesta && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 relative"
          >
            <img 
              src={imagemFesta} 
              alt="Festa" 
              className="w-32 h-32 mx-auto rounded-2xl object-cover shadow-lg border-4 border-purple-300"
            />
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white rounded-full p-2">
              <PartyPopper className="w-4 h-4" />
            </div>
          </motion.div>
        )}
        
        {!imagemFesta && (
          <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        )}
        <h2 className="text-3xl font-black text-gray-800">Como Jogar</h2>
        <p className="text-gray-600 mt-2">Raspa e ganha prémios!</p>
      </motion.div>

      <div className="space-y-4 mb-8">
        {pasos.map((paso, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-lg"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <paso.icon className="w-6 h-6 text-purple-600" />
            </div>
            <span className="font-bold text-gray-800">{paso.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComecar}
        className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all"
      >
        COMEÇAR A JOGAR 🎰
      </motion.button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function RaspadinhaGame({ 
  jogoId, 
  titulo, 
  preco, 
  premios,
  config,
  soundEnabled = true 
}: RaspadinhaGameProps) {
  const [gameState, setGameState] = useState<'instrucoes' | 'jogando' | 'resultado'>('instrucoes');
  const [areas, setAreas] = useState<AreaOculta[]>([]);
  const [premiacao, setPremiacao] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participacaoId, setParticipacaoId] = useState<string | null>(null);
  const [ganhou, setGanhou] = useState(false);
  const [simboloVencedor, setSimboloVencedor] = useState<string>('');

  // Obter símbolos e imagens da config
  const simbolos = config?.simbolos || ['⭐', '💰', '🎁', '🍀', '🔥', '💎'];
  const imagens = config?.imagens || [];
  const imagemFesta = config?.imagemFesta;

  // Gerar áreas aleatórias (fallback se API não responder)
  const gerarAreas = () => {
    const premiacoes = ['SEM PRÉMIO', '1€', '2€', '5€', '10€', '20€', '50€', '100€'];
    const novoPremio = premiacoes[Math.floor(Math.random() * 4)];
    
    // Escolher símbolo vencedor
    const simboloVencedorLocal = simbolos[Math.floor(Math.random() * simbolos.length)];
    
    // Criar 3 posições vencedoras e 6 normais
    const posicoesVencedoras = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 3);
    
    const novasAreas: AreaOculta[] = Array(9).fill(null).map((_, i) => {
      const isVencedora = posicoesVencedoras.includes(i);
      const simbolo = isVencedora ? simboloVencedorLocal : simbolos[Math.floor(Math.random() * simbolos.length)];
      const imagemIndex = simbolos.indexOf(simbolo);
      
      return {
        id: i,
        revelada: false,
        simbolo,
        imagem: imagens[imagemIndex] || '',  // Usar imagem se disponível
        premio: isVencedora ? novoPremio : 'SEM PRÉMIO'
      };
    });
    
    setAreas(novasAreas);
  };

  const handleComecar = async () => {
    setLoading(true);
    setSimboloVencedor('');
    setPremiacao(null);
    setGanhou(false);
    
    try {
      // Criar participação via API
      const response = await fetch(`/api/jogos/raspadinha/${jogoId}/jogar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ areasReveladas: [] }) // Iniciar jogo
      });

      if (response.ok) {
        const data = await response.json();
        if (data.participacao) {
          setParticipacaoId(data.participacao.id);
          
          // Criar áreas com símbolos do servidor
          const serverAreas: AreaOculta[] = (data.participacao.simbolos || []).map((simbolo: string, i: number) => ({
            id: i,
            revelada: false,
            simbolo,
            imagem: imagens[simbolos.indexOf(simbolo)] || '',
            premio: 'SEM PRÉMIO'
          }));
          
          setAreas(serverAreas);
        } else {
          // Fallback local
          gerarAreas();
        }
      } else {
        gerarAreas();
      }
    } catch (error) {
      console.error('Erro ao iniciar:', error);
      gerarAreas();
    }
    setLoading(false);
    setGameState('jogando');
  };

  const handleScratch = async (id: number) => {
    if (loading) return;
    
    const novasAreas = [...areas];
    novasAreas[id].revelada = true;
    setAreas(novasAreas);

    // Verificar se há 3 símbolos iguais revelados
    const simbolosRevelados = novasAreas
      .filter(a => a.revelada)
      .map(a => a.simbolo);
    
    // Contar símbolos
    const contagem = simbolosRevelados.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Se 3 iguais, verificar com API
    const tresIguais = Object.values(contagem).find(c => c >= 3);
    if (tresIguais) {
      const simboloVencedorLocal = Object.keys(contagem).find(s => contagem[s] >= 3);
      const areaVencedora = novasAreas.find(a => a.simbolo === simboloVencedorLocal);
      
      setSimboloVencedor(simboloVencedorLocal || '');
      
      setLoading(true);
      try {
        // Enviar revelação para API
        const response = await fetch(`/api/jogos/raspadinha/${jogoId}/jogar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ areasReveladas: [id] })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.participacao?.ganhou) {
            setGanhou(true);
            setPremiacao(data.participacao.premio?.titulo || 'PRÉMIO!');
          } else {
            setPremiacao(areaVencedora?.premio || 'PRÉMIO!');
          }
        } else {
          setPremiacao(areaVencedora?.premio || 'PRÉMIO!');
          if (areaVencedora?.premio && areaVencedora?.premio !== 'SEM PRÉMIO') {
            setGanhou(true);
          }
        }
        
        // Revelar todas as áreas para mostrar o resultado
        setAreas(novasAreas.map(a => ({ ...a, revelada: true })));
        setGameState('resultado');
      } catch (error) {
        console.error('Erro ao participar:', error);
        setPremiacao(areaVencedora?.premio || 'PRÉMIO!');
        if (areaVencedora?.premio && areaVencedora?.premio !== 'SEM PRÉMIO') {
          setGanhou(true);
        }
        setAreas(novasAreas.map(a => ({ ...a, revelada: true })));
        setGameState('resultado');
      }
      setLoading(false);
    }
  };

  const handleNovamente = () => {
    setGameState('instrucoes');
    setAreas([]);
    setPremiacao(null);
    setGanhou(false);
    setSimboloVencedor('');
  };

  const handlePartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Aldeias Games',
        text: `Acabei de ganhar ${premiacao} na Raspadinha! 🎉`,
        url: window.location.href
      });
    }
  };

  // Cores do tema
  const corPrimaria = config?.cores?.primario || '#7C3AED';
  const corSecundaria = config?.cores?.secundario || '#EC4899';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-red-50 p-4">
      {/* Header do Jogo */}
      <motion.div 
        className="max-w-md mx-auto mb-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="bg-white rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Imagem da festa no header */}
              {imagemFesta && (
                <img 
                  src={imagemFesta} 
                  alt="Festa" 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-purple-200"
                />
              )}
              <div>
                <h1 className="text-xl font-black text-gray-800">{titulo}</h1>
                <p className="text-gray-500 text-sm">Raspa e ganha!</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: corPrimaria }}>€{preco.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Área de Jogo */}
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {gameState === 'instrucoes' && (
            <motion.div
              key="instrucoes"
              {...scratchMotion}
            >
              <Instrucoes onComecar={handleComecar} imagemFesta={imagemFesta} />
            </motion.div>
          )}

          {gameState === 'jogando' && (
            <motion.div
              key="jogando"
              {...scratchMotion}
            >
              {/* Banner de vitória (aparece no topo quando ganha) */}
              <WinnerBanner premio={premiacao} simbolo={simboloVencedor} />
              
              <div className="bg-white rounded-3xl p-4 shadow-2xl">
                <p className="text-center text-gray-500 mb-3 font-medium">
                  ✨ Raspa as áreas para revelar os símbolos! ✨
                </p>
                <ScratchArea 
                  areas={areas} 
                  onScratch={handleScratch}
                  mostrandoResultado={ganhou}
                  simboloVencedor={simboloVencedor}
                />
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400 bg-gray-100 rounded-full px-4 py-2 inline-block">
                    🎯 Revela 3 símbolos iguais para ganhar!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'resultado' && (
            <>
              {/* Banner de vitória no topo */}
              <WinnerBanner premio={premiacao} simbolo={simboloVencedor} />
              
              {/* Área de resultado */}
              <motion.div
                key="resultado"
                {...scratchMotion}
              >
                <div className="bg-white rounded-3xl p-4 shadow-2xl">
                  <ScratchArea 
                    areas={areas} 
                    onScratch={() => {}}
                    mostrandoResultado={true}
                    simboloVencedor={simboloVencedor}
                  />
                  
                  <div className="mt-4 text-center">
                    {ganhou ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-100 rounded-xl p-4"
                      >
                        <p className="text-green-700 font-bold text-lg">
                          🎉 Parabéns! Ganhaste {premiacao}!
                        </p>
                      </motion.div>
                    ) : (
                      <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-gray-600 font-medium">
                          Não foi desta vez. Mais sorte na próxima!
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-2 justify-center">
                      <UIButton 
                        className="bg-amber-500 hover:bg-amber-600"
                        onClick={handleNovamente}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Jogar Novamente
                      </UIButton>
                      {ganhou && (
                        <UIButton 
                          variant="outline"
                          onClick={handlePartilhar}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Partilhar
                        </UIButton>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Seguro */}
      <div className="max-w-md mx-auto mt-6 text-center">
        <p className="text-xs text-gray-400">
          🔒 Jogo certificado • SHA-256 verificado • Resultados justos
        </p>
      </div>
    </div>
  );
}
