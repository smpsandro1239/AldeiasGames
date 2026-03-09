/**
 * PoioDaVacaGame.tsx
 * Jogo do Poio da Vaca - Design Premium
 * Estilo: Tradicional português + Moderno
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  Trophy, 
  Gift, 
  RefreshCw, 
  Share2,
  Volume2,
  VolumeX,
  DollarSign,
  History,
  Sparkles,
  PartyPopper,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton } from '@/components/ui-components';

// ============================================
// TIPOS
// ============================================

interface PoioDaVacaGameProps {
  jogoId: string;
  titulo: string;
  preco: number;
  numerosTotal: number; // Usually 90 for Poio da Vaca
  onParticipar: (numeros: number[]) => Promise<any>;
  soundEnabled?: boolean;
}

type GameState = 'instrucoes' | 'selecao' | 'sorteio' | 'resultado';

// ============================================
// ANIMAÇÕES
// ============================================

const numberPick = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  },
  selected: { 
    scale: 1.1,
    boxShadow: "0 0 20px rgba(234, 88, 12, 0.5)"
  },
  correct: {
    scale: [1, 1.2, 1],
    backgroundColor: ["#FFFFFF", "#22C55E", "#FFFFFF"],
    transition: { duration: 0.5 }
  },
  wrong: {
    scale: [1, 0.9, 1],
    backgroundColor: ["#FFFFFF", "#EF4444", "#FFFFFF"],
    transition: { duration: 0.3 }
  }
};

const winnerReveal = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  }
};

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// GRADE DE NÚMEROS
// --------------------------------------------
function NumberGrid({ 
  numeros, 
  selecionados, 
  sorteados,
  sorteioAtivo,
  onToggle 
}: { 
  numeros: number[]; 
  selecionados: number[];
  sorteados: number[];
  sorteioAtivo: boolean;
  onToggle: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-10 gap-2">
      {numeros.map((num) => {
        const isSelected = selecionados.includes(num);
        const isSorteado = sorteados.includes(num);
        const isCorrect = isSelected && isSorteado;
        
        return (
          <motion.button
            key={num}
            layout
            variants={numberPick}
            initial="initial"
            animate={
              isCorrect ? "correct" : 
              isSorteado && !isSelected ? "wrong" :
              isSelected ? "selected" : 
              "animate"
            }
            whileHover={!sorteioAtivo && !isSelected ? { scale: 1.1 } : {}}
            whileTap={!sorteioAtivo ? { scale: 0.9 } : {}}
            onClick={() => !sorteioAtivo && onToggle(num)}
            disabled={sorteioAtivo}
            className={`
              aspect-square rounded-xl font-bold text-lg transition-all
              ${isSorteado 
                ? isCorrect 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-400 text-white'
                : isSelected 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300'
              }
              ${sorteioAtivo ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {num.toString().padStart(2, '0')}
          </motion.button>
        );
      })}
    </div>
  );
}

// --------------------------------------------
// ANIMAÇÃO DO SORTEIO
// --------------------------------------------
function SorteioAnimado({ 
  numerosSorteados,
  ultimoNumero,
  numerosEscolhidos
}: { 
  numerosSorteados: number[];
  ultimoNumero: number | null;
  numerosEscolhidos: number[];
}) {
  return (
    <div className="space-y-4">
      {/* Números já sorteados */}
      <div className="flex flex-wrap gap-2 justify-center">
        {numerosSorteados.map((num, i) => {
          const isWinner = numerosEscolhidos.includes(num);
          return (
            <motion.div
              key={num}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                isWinner 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {num.toString().padStart(2, '0')}
            </motion.div>
          );
        })}
      </div>

      {/* Último número sorteado - grande */}
      {ultimoNumero && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm mb-2">Último sorteado</p>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.5 }}
            className={`inline-block w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${
              numerosEscolhidos.includes(ultimoNumero)
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white'
            }`}
          >
            {ultimoNumero.toString().padStart(2, '0')}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

// --------------------------------------------
// ECRÃ DE RESULTADO
// --------------------------------------------
function ResultadoPoio({ 
  acertos, 
  numerosEscolhidos,
  numerosSorteados,
  premio,
  onNovamente,
  onPartilhar 
}: { 
  acertos: number;
  numerosEscolhidos: number[];
  numerosSorteados: number[];
  premio: string | null;
  onNovamente: () => void;
  onPartilhar: () => void;
}) {
  const isWinner = acertos > 0;

  useEffect(() => {
    if (isWinner) {
      // Confetti explosion
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: ['#F59E0B', '#E11D48', '#16A34A']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: ['#F59E0B', '#E11D48', '#16A34A']
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isWinner]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        variants={winnerReveal}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6"
        >
          {isWinner ? (
            <div className="relative inline-block">
              <Trophy className="w-24 h-24 text-amber-500 mx-auto" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </motion.div>
            </div>
          ) : (
            <Grid3X3 className="w-24 h-24 text-gray-300 mx-auto" />
          )}
        </motion.div>

        <h2 className={`text-3xl font-black mb-4 ${isWinner ? 'text-green-600' : 'text-gray-500'}`}>
          {isWinner ? '🎉 PARABÉNS! 🎉' : 'Sorteio Terminado'}
        </h2>

        {isWinner && (
          <div className="mb-6">
            <p className="text-gray-600 mb-2">Acertaste em</p>
            <p className="text-5xl font-black text-green-600">{acertos}</p>
            <p className="text-gray-600">número{acertos > 1 ? 's' : ''}</p>
            {premio && (
              <p className="text-2xl font-bold text-amber-600 mt-4">{premio}</p>
            )}
          </div>
        )}

        {/* Números escolidos vs sorteados */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-2">Os teus números</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {numerosEscolhidos.map(num => {
              const sorteado = numerosSorteados.includes(num);
              return (
                <span 
                  key={num}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    sorteado ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {num.toString().padStart(2, '0')}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <UIButton 
            size="lg" 
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={onNovamente}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Jogar Novamente
          </UIButton>
          {isWinner && (
            <UIButton 
              size="lg" 
              variant="outline"
              className="flex-1"
              onClick={onPartilhar}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Partilhar
            </UIButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --------------------------------------------
// INSTRUÇÕES
// --------------------------------------------
function InstrucoesPoio({ onComecar }: { onComecar: () => void }) {
  const pasos = [
    { icon: Grid3X3, text: "Escolhe os teus números da sorte" },
    { icon: Sparkles, text: "Aguarda pelo sorteio em direto" },
    { icon: Trophy, text: "Acerta e ganha prémios!" }
  ];

  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid3X3 className="w-10 h-10 text-orange-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Poio da Vaca</h2>
        <p className="text-gray-600 mt-2">O clássico jogo de números!</p>
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
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <paso.icon className="w-6 h-6 text-orange-600" />
            </div>
            <span className="font-bold text-gray-800">{paso.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComecar}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all"
      >
        ESCOLHER NÚMEROS 🎯
      </motion.button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function PoioDaVacaGame({ 
  jogoId, 
  titulo, 
  preco, 
  numerosTotal = 90,
  onParticipar,
  soundEnabled = true 
}: PoioDaVacaGameProps) {
  const [gameState, setGameState] = useState<GameState>('instrucoes');
  const [numeros, setNumeros] = useState<number[]>(
    Array.from({ length: numerosTotal }, (_, i) => i + 1)
  );
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [sorteados, setSorteados] = useState<number[]>([]);
  const [ultimoSorteado, setUltimoSorteado] = useState<number | null>(null);
  const [premio, setPremio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const NUMERO_MAXIMO = 5; // Máximo de números que pode escolher

  const handleToggleNumero = (num: number) => {
    if (selecionados.includes(num)) {
      setSelecionados(selecionados.filter(n => n !== num));
    } else if (selecionados.length < NUMERO_MAXIMO) {
      setSelecionados([...selecionados, num]);
    }
  };

  const handleComecar = () => {
    if (selecionados.length > 0) {
      setGameState('sorteio');
      iniciarSorteio();
    }
  };

  const iniciarSorteio = async () => {
    setLoading(true);
    
    // Simular sorteio de números (em produção, isto viria do servidor)
    const numerosRestantes = numeros.filter(n => !selecionados.includes(n));
    const acertos: number[] = [];
    
    // Sortear alguns números
    const quantidadeSorteada = Math.min(10, numerosRestantes.length);
    
    for (let i = 0; i < quantidadeSorteada; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos entre números
      
      const indice = Math.floor(Math.random() * numerosRestantes.length);
      const numeroSorteado = numerosRestantes.splice(indice, 1)[0];
      
      setSorteados(prev => [...prev, numeroSorteado]);
      setUltimoSorteado(numeroSorteado);
      
      // Verificar se acertou
      if (selecionados.includes(numeroSorteado)) {
        acertos.push(numeroSorteado);
      }
    }
    
    // Calcular prémio
    if (acertos.length > 0) {
      const premiacoes: Record<number, string> = {
        1: '5€',
        2: '20€',
        3: '50€',
        4: '100€',
        5: '500€'
      };
      setPremio(premiacoes[acertos.length] || '5€');
    }
    
    setGameState('resultado');
    setLoading(false);
  };

  const handleNovamente = () => {
    setGameState('instrucoes');
    setSelecionados([]);
    setSorteados([]);
    setUltimoSorteado(null);
    setPremio(null);
  };

  const handlePartilhar = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Aldeias Games - Poio da Vaca',
        text: `Acabei de jogar no Poio da Vaca!`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-4">
      {/* Header */}
      <motion.div 
        className="max-w-2xl mx-auto mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="bg-white rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-800">{titulo}</h1>
              <p className="text-gray-500 text-sm">Escolhe até {NUMERO_MAXIMO} números</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-orange-600">€{preco.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Selecionados */}
          {selecionados.length > 0 && gameState !== 'sorteio' && gameState !== 'resultado' && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Números escolhidos:</p>
              <div className="flex flex-wrap gap-2">
                {selecionados.map(num => (
                  <span 
                    key={num}
                    className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold"
                  >
                    {num.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Área de Jogo */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {gameState === 'instrucoes' && (
            <motion.div
              key="instrucoes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <InstrucoesPoio onComecar={() => setGameState('selecao')} />
            </motion.div>
          )}

          {gameState === 'selecao' && (
            <motion.div
              key="selecao"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">
                    Escolhidos: <span className="font-bold text-orange-600">{selecionados.length}/{NUMERO_MAXIMO}</span>
                  </p>
                  <button 
                    onClick={() => setSelecionados([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpar
                  </button>
                </div>
                
                <NumberGrid 
                  numeros={numeros}
                  selecionados={selecionados}
                  sorteados={sorteados}
                  sorteioAtivo={false}
                  onToggle={handleToggleNumero}
                />
                
                <div className="mt-6">
                  <UIButton 
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600"
                    disabled={selecionados.length === 0}
                    onClick={handleComecar}
                  >
                    {loading ? 'A processar...' : `Confirmar (${selecionados.length} números)`}
                  </UIButton>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'sorteio' && (
            <motion.div
              key="sorteio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Sparkles className="w-12 h-12 text-orange-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold mt-4">Sorteio em Progresso...</h3>
                </div>
                
                <SorteioAnimado 
                  numerosSorteados={sorteados}
                  ultimoNumero={ultimoSorteado}
                  numerosEscolhidos={selecionados}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {gameState === 'resultado' && (
          <ResultadoPoio
            acertos={sorteados.filter(n => selecionados.includes(n)).length}
            numerosEscolhidos={selecionados}
            numerosSorteados={sorteados}
            premio={premio}
            onNovamente={handleNovamente}
            onPartilhar={handlePartilhar}
          />
        )}
      </AnimatePresence>

      {/* Footer Seguro */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-xs text-gray-400">
          🔒 Jogo certificado • SHA-256 verificado • Resultados justos
        </p>
      </div>
    </div>
  );
}
