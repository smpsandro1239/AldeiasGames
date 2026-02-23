import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const isWinner = resultado?.isWinner;

  // Initialize canvas with scratch layer
  useEffect(() => {
    if (isRevelada || isRevelando) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch layer (Golden/Bronze gradient for 2026 feel)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#D4AF37'); // Gold
    gradient.addColorStop(0.3, '#F9F295'); // Light Gold
    gradient.addColorStop(0.5, '#E6BE8A'); // Bronze
    gradient.addColorStop(0.7, '#F9F295');
    gradient.addColorStop(1, '#B8860B'); // Dark Gold

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 200; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }

    // Add shine pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(-50, 0);
    ctx.lineTo(canvas.width, canvas.height + 50);
    ctx.stroke();

    // Add text instruction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${Math.max(16, canvas.width / 10)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;

    ctx.font = `${Math.max(10, canvas.width / 16)}px sans-serif`;
    ctx.fillText('✨ PRÉMIO MISTÉRIO ✨', canvas.width / 2, canvas.height / 2 + 30);
  }, [isRevelada, isRevelando]);

  // Handle Winner Confetti
  useEffect(() => {
    if (isRevelada && isWinner) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [isRevelada, isWinner]);

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
  }, [isRevelada, isRevelando, participacaoId, onReveal]);

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

            <div className="pt-4 flex justify-center gap-2">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200">
                <Shield className="h-3 w-3 mr-1 text-blue-500" />
                <span className="text-[10px]">Validado</span>
              </Badge>
            </div>
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

      {/* Interactive Sparkle on Hover */}
      {!isRevelada && !isRevelando && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1/4 left-1/4 animate-ping">✨</div>
          <div className="absolute top-3/4 right-1/4 animate-ping delay-300">✨</div>
        </div>
      )}
    </div>
  );
};

// Help helper
function Badge({ children, variant, className }: any) {
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", variant === 'outline' ? 'text-foreground border-input' : 'border-transparent bg-primary text-primary-foreground', className)}>{children}</div>;
}
