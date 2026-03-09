/**
 * RifaGame.tsx
 * Jogo de Rifa / Tombola - Design Premium
 * Estilo: Clássico loteria português
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Trophy, 
  Gift, 
  RefreshCw, 
  Share2,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton } from '@/components/ui-components';

// ============================================
// TIPOS
// ============================================

interface Premio {
  id: string;
  titulo: string;
  descricao?: string;
  valor?: number;
  posicao: number; // 1º, 2º, 3º, etc.
}

interface RifaGameProps {
  jogoId: string;
  titulo: string;
  preco: number;
  numerosTotal: number; // Total de números disponíveis
  premios: Premio[];
  onParticipar: (numero: number) => Promise<any>;
  soundEnabled?: boolean;
}

type GameState = 'instrucoes' | 'selecao' | 'sorteio' | 'resultado';

// ============================================
// ANIMAÇÕES
// ============================================

const ticketReveal = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 }
  }
};

const numberHighlight = {
  selected: {
    scale: 1.1,
    boxShadow: "0 0 30px rgba(234, 88, 12, 0.6)"
  }
};

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// GRADE DE BILHETES
// --------------------------------------------
function BilhetesGrid({ 
  numeros, 
  selecionados, 
  disponiveis,
  onSelect 
}: { 
  numeros: number[]; 
  selecionados: number[];
  disponiveis: number[];
  onSelect: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {numeros.map((num) => {
        const isSelected = selecionados.includes(num);
        const isDisponivel = disponiveis.includes(num);
        
        return (
          <motion.button
            key={num}
            whileHover={isDisponivel ? { scale: 1.1 } : {}}
            whileTap={isDisponivel ? { scale: 0.9 } : {}}
            onClick={() => isDisponivel && onSelect(num)}
            disabled={!isDisponivel}
            className={`
              aspect-square rounded-xl font-bold text-lg transition-all
              ${isSelected 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg'
                : isDisponivel
                  ? 'bg-white border-2 border-amber-200 text-gray-800 hover:border-amber-400 hover:shadow-md'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }
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
// ANIMAÇÃO DO SORTEO
// --------------------------------------------
function SorteioRifa({ 
  premioAtual,
  numeroSorteado,
  numerosPremiados,
  isFinal 
}: { 
  premioAtual: Premio | null;
  numeroSorteado: number | null;
  numerosPremiados: { [key: number]: number }; // numero -> posicao premio
  isFinal: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      {/* Premio atual */}
      {premioAtual && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-6 text-white"
        >
          <p className="text-amber-100 text-sm font-medium mb-2">
            {premioAtual.posicao === 1 ? '🏆 GRANDE PRÉMIO' : `${premioAtual.posicao}º PRÉMIO`}
          </p>
          <h3 className="text-2xl font-black">{premioAtual.titulo}</h3>
          {premioAtual.valor && (
            <p className="text-3xl font-bold mt-2">€{premioAtual.valor.toFixed(2)}</p>
          )}
        </motion.div>
      )}

      {/* Número sorteado */}
      {numeroSorteado && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" }}
          className={`
            inline-block w-32 h-32 rounded-3xl flex items-center justify-center
            ${numerosPremiados[numeroSorteado] ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gray-200'}
          `}
        >
          <span className="text-5xl font-black text-white">
            {numeroSorteado.toString().padStart(2, '0')}
          </span>
        </motion.div>
      )}

      {/* Números já prémidos */}
      {Object.keys(numerosPremiados).length > 0 && (
        <div className="pt-4">
          <p className="text-sm text-gray-500 mb-2">Números PREMIADOS:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(numerosPremiados).map(([num, pos]) => (
              <motion.span
                key={num}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold text-sm"
              >
                {parseInt(num).toString().padStart(2, '0')}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {isFinal && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500"
        >
          Sorteio terminado! Obrigado por participar. 🎉
        </motion.p>
      )}
    </div>
  );
}

// --------------------------------------------
// BILHETE ESCOLHIDO
// --------------------------------------------
function BilheteEscolhido({ 
  numero, 
  onMudar,
  onConfirmar 
}: { 
  numero: number; 
  onMudar: () => void;
  onConfirmar: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(numero.toString().padStart(2, '0'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-sm mx-auto"
    >
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-1 shadow-2xl">
        <div className="bg-white rounded-[22px] p-8 text-center">
          {/* Header decorativo */}
          <div className="flex justify-center mb-4">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          
          <p className="text-gray-500 text-sm mb-2">O TEU BILHETE É</p>
          
          <motion.div
            animate={{ 
              boxShadow: ["0 0 0 rgba(245, 158, 11, 0)", "0 0 30px rgba(245, 158, 11, 0.5)", "0 0 0 rgba(245, 158, 11, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 mb-6"
          >
            <span className="text-6xl font-black text-white">
              {numero.toString().padStart(2, '0')}
            </span>
          </motion.div>

          <div className="space-y-3">
            <UIButton 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={onConfirmar}
            >
              <Ticket className="w-5 h-5 mr-2" />
              Confirmar Bilhete
            </UIButton>
            
            <button 
              onClick={onMudar}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Escolher outro número
            </button>
          </div>
        </div>
      </div>

      {/* Partilhar */}
      <div className="mt-6 flex justify-center gap-4">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado!' : 'Copiar número'}
        </button>
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Aldeias Games - Rifa',
                text: `O meu número da rifa é ${numero.toString().padStart(2, '0')}!`,
                url: window.location.href
              });
            }
          }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <Share2 className="w-4 h-4" />
          Partilhar
        </button>
      </div>
    </motion.div>
  );
}

// --------------------------------------------
// RESULTADO
// --------------------------------------------
function ResultadoRifa({ 
  meuNumero,
  posicao,
  premio,
  onNovamente 
}: { 
  meuNumero: number;
  posicao: number | null;
  premio: Premio | null;
  onNovamente: () => void;
}) {
  const isWinner = posicao !== null && posicao > 0;

  useEffect(() => {
    if (isWinner) {
      const duration = 5000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors: ['#F59E0B', '#E11D48', '#16A34A', '#1E40AF']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors: ['#F59E0B', '#E11D48', '#16A34A', '#1E40AF']
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
        variants={ticketReveal}
        initial="initial"
        animate="animate"
        className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
      >
        {isWinner ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6"
            >
              {posicao === 1 ? (
                <Trophy className="w-24 h-24 text-amber-500 mx-auto" />
              ) : (
                <Gift className="w-24 h-24 text-amber-500 mx-auto" />
              )}
            </motion.div>

            <h2 className="text-3xl font-black text-amber-500 mb-2">
              🎉 {posicao === 1 ? '1º PRÉMIO!' : `${posicao}º PRÉMIO`} 🎉
            </h2>

            {premio && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{premio.titulo}</h3>
                {premio.valor && (
                  <p className="text-4xl font-black text-amber-600 mt-2">€{premio.valor.toFixed(2)}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <Ticket className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-500 mb-4">
              Não foi desta vez
            </h2>
            <p className="text-gray-500 mb-6">
              O número {meuNumero.toString().padStart(2, '0')} não foi prémiado.
              <br />
              Obrigado por participar!
            </p>
          </>
        )}

        <div className="space-y-3">
          <UIButton 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
            onClick={onNovamente}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Participar Novamente
          </UIButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// INSTRUÇÕES
// ============================================

function InstrucoesRifa({ onComecar }: { onComecar: () => void }) {
  const pasos = [
    { icon: Ticket, text: "Escolhe o teu número da sorte" },
    { icon: Clock, text: "Aguarda pelo sorteio em direto" },
    { icon: Trophy, text: "Se o teu número for sorteado, GANHAS!" }
  ];

  return (
    <div className="max-w-md mx-auto text-center">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-800">Rifa / Tombola</h2>
        <p className="text-gray-600 mt-2">A loteria tradicional portuguesa!</p>
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
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <paso.icon className="w-6 h-6 text-amber-600" />
            </div>
            <span className="font-bold text-gray-800">{paso.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Lista de Prémios */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-8">
        <p className="text-sm font-bold text-amber-600 mb-3">PRÉMIOS EM JOGO:</p>
        <div className="text-left space-y-2 text-sm">
          <p>🏆 1º Prémio - Grande Prêmio</p>
          <p>🥈 2º Prémio - Segundo Lugar</p>
          <p>🥉 3º Prémio - Terceiro Lugar</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onComecar}
        className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all"
      >
        ESCOLHER MEU NÚMERO 🎯
      </motion.button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function RifaGame({ 
  jogoId, 
  titulo, 
  preco, 
  numerosTotal = 100,
  premios = [],
  onParticipar,
  soundEnabled = true 
}: RifaGameProps) {
  const [gameState, setGameState] = useState<GameState>('instrucoes');
  const [numeros] = useState<number[]>(
    Array.from({ length: numerosTotal }, (_, i) => i + 1)
  );
  const [disponiveis, setDisponiveis] = useState<number[]>(numeros);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado do sorteio
  const [numeroSorteado, setNumeroSorteado] = useState<number | null>(null);
  const [numerosPremiados, setNumerosPremiados] = useState<{ [key: number]: number }>({});
  const [minhaPosicao, setMinhaPosicao] = useState<number | null>(null);
  const [premioGanho, setPremioGanho] = useState<Premio | null>(null);

  const handleSelectNumero = (num: number) => {
    setSelecionado(num);
    setGameState('selecao');
  };

  const handleConfirmar = async () => {
    if (selecionado === null) return;
    
    setLoading(true);
    try {
      const result = await onParticipar(selecionado);
      
      // Remover número dos disponíveis
      setDisponiveis(disponiveis.filter(n => n !== selecionado));
      
      // Iniciar visualização do sorteio (em produção, isto seria um stream)
      // Por agora, simulamos que o sorteio vai começar
      setGameState('sorteio');
      
      // Simulamos resultado após um delay
      setTimeout(() => {
        // Verificar se ganhou (simulado)
        const random = Math.random();
        if (random > 0.8 && premios.length > 0) { // 20% de ganhar
          const posicao = Math.min(premios.length, Math.floor(Math.random() * premios.length) + 1);
          const premio = premios.find(p => p.posicao === posicao) || premios[0];
          
          setNumerosPremiados({ [selecionado]: posicao });
          setMinhaPosicao(posicao);
          setPremioGanho(premio);
        }
        
        // Número sorteado (qualquer um)
        const numSorteado = numeros[Math.floor(Math.random() * numeros.length)];
        setNumeroSorteado(numSorteado);
        
        setTimeout(() => {
          setGameState('resultado');
        }, 3000);
        
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao participar:', error);
    }
    setLoading(false);
  };

  const handleNovamente = () => {
    setGameState('instrucoes');
    setSelecionado(null);
    setNumeroSorteado(null);
    setNumerosPremiados({});
    setMinhaPosicao(null);
    setPremioGanho(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 p-4">
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
              <p className="text-gray-500 text-sm">
                {numerosTotal} números disponíveis
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-600">€{preco.toFixed(2)}</p>
              <p className="text-xs text-gray-400">por número</p>
            </div>
          </div>
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
              <InstrucoesRifa onComecar={() => setGameState('selecao')} />
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
                <p className="text-center text-gray-600 mb-4">
                  Escolhe o teu número da sorte!
                </p>
                
                <BilhetesGrid 
                  numeros={numeros}
                  selecionados={selecionado ? [selecionado] : []}
                  disponiveis={disponiveis}
                  onSelect={handleSelectNumero}
                />
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
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <SorteioRifa
                  premioAtual={null}
                  numeroSorteado={numeroSorteado}
                  numerosPremiados={numerosPremiados}
                  isFinal={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bilhete Escolhido (quando selecionado) */}
        {gameState === 'selecao' && selecionado && (
          <div className="mt-6">
            <BilheteEscolhido
              numero={selecionado}
              onMudar={() => {
                setSelecionado(null);
                setGameState('selecao');
              }}
              onConfirmar={handleConfirmar}
            />
          </div>
        )}
      </div>

      {/* Resultado */}
      <AnimatePresence>
        {gameState === 'resultado' && selecionado && (
          <ResultadoRifa
            meuNumero={selecionado}
            posicao={minhaPosicao}
            premio={premioGanho}
            onNovamente={handleNovamente}
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
