import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScratchSound } from "@/hooks/use-scratch-sound";
import confetti from 'canvas-confetti';
import { Shield, Trophy, Sparkles } from 'lucide-react';

interface ScratchCardProps {
  participacaoId: string;
  numeroCartao: number;
  isRevelada: boolean;
  isRevelando: boolean;
  resultado: any;
  onReveal: (id: string) => void;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  participacaoId,
  numeroCartao,
  isRevelada,
  isRevelando,
  resultado,
  onReveal
}) => {
  const { playScratching, playWin } = useScratchSound();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const isWinner = resultado?.isWinner;

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevelada) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with scratchable color
    ctx.fillStyle = '#C0C0C0'; // Silver
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern/text to the scratch layer
    ctx.fillStyle = '#A0A0A0';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.fillText('ALDEIA', (canvas.width/5) * i + 40, (canvas.height/5) * j + 40);
        }
    }
  }, [isRevelada]);

  // Handle victory effects
  useEffect(() => {
    if (isRevelada && isWinner) {
      playWin();
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [isRevelada, isWinner, playWin]);

  // Handle scratch
  const handleScratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isRevelada || isRevelando) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    playScratching();

    // Check progress
    if (Math.random() > 0.95) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) transparentPixels++;
      }
      const progress = transparentPixels / (canvas.width * canvas.height);
      setScratchProgress(progress);

      if (progress > 0.45) {
        onReveal(participacaoId);
      }
    }
  }, [isRevelada, isRevelando, participacaoId, onReveal, playScratching]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 transition-all duration-500 group",
        isRevelada
          ? (isWinner ? "border-yellow-400 bg-yellow-50 scale-105" : "border-gray-300 bg-gray-100 grayscale-[0.5]")
          : "border-amber-200 bg-amber-50 hover:border-amber-400"
      )}
      onMouseDown={() => setIsScratching(true)}
      onMouseUp={() => setIsScratching(false)}
      onMouseLeave={() => setIsScratching(false)}
      onMouseMove={(e) => isScratching && handleScratch(e)}
      onTouchStart={() => setIsScratching(true)}
      onTouchEnd={() => setIsScratching(false)}
      onTouchMove={(e) => isScratching && handleScratch(e)}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-transparent to-transparent" />
      </div>

      {/* Content under the scratch layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        {isRevelada ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="space-y-4"
          >
            {isWinner ? (
              <>
                <div className="relative">
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-lg ring-4 ring-yellow-200">
                    <Trophy className="h-12 w-12 text-yellow-900" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-dashed border-yellow-500 rounded-full opacity-50"
                  />
                </div>
                <div>
                  <h4 className="font-black text-2xl text-yellow-800 tracking-tighter">GANHOU!</h4>
                  <p className="font-bold text-yellow-700 mt-1">{resultado?.premio?.nome}</p>
                  <div className="mt-2 inline-block bg-yellow-500 text-white px-4 py-1 rounded-full text-xl font-black shadow-sm">
                    {resultado?.premio?.valor}€
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto opacity-50">
                  <span className="text-5xl">😞</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-500 text-lg">SEM PRÉMIO</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Mais sorte na próxima</p>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
             <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="h-10 w-10 text-amber-300" />
             </div>
             <p className="text-amber-200 font-black text-3xl opacity-30 italic">LUCKY CARD</p>
          </div>
        )}
      </div>

      {/* Scratch Layer */}
      {!isRevelada && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none transition-opacity duration-700"
          style={{
            opacity: scratchProgress > 0.45 ? 0 : 1,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
          }}
        />
      )}

      {/* Overlay info */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-white border border-white/20">
          #{numeroCartao.toString().padStart(4, '0')}
        </div>
      </div>
    </div>
  );
};
