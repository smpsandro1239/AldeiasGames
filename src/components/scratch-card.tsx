import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [showResult, setShowResult] = useState(false);
  const isWinner = resultado?.isWinner;

  // Initialize canvas with scratch layer
  useEffect(() => {
    if (isRevelada || isRevelando) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw scratch layer (golden/silver gradient)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f59e0b');
    gradient.addColorStop(0.5, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text instruction
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${Math.max(14, canvas.width / 12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = `${Math.max(10, canvas.width / 16)}px sans-serif`;
    ctx.fillText('✨', canvas.width / 2, canvas.height / 2 + 15);
  }, [isRevelada, isRevelando]);

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
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Check progress periodically
    if (Math.random() > 0.9) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] === 0) transparentPixels++;
      }
      const progress = transparentPixels / (canvas.width * canvas.height);
      setScratchProgress(progress);

      if (progress > 0.4) {
        onReveal(participacaoId);
      }
    }
  }, [isRevelada, isRevelando, participacaoId, onReveal]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[3/2] rounded-xl overflow-hidden shadow-inner border-2",
        isRevelada
          ? (isWinner ? "border-yellow-400 bg-yellow-50" : "border-gray-300 bg-gray-100")
          : "border-gray-200 bg-gray-50"
      )}
      onMouseDown={() => setIsScratching(true)}
      onMouseUp={() => setIsScratching(false)}
      onMouseLeave={() => setIsScratching(false)}
      onMouseMove={(e) => isScratching && handleScratch(e)}
      onTouchStart={() => setIsScratching(true)}
      onTouchEnd={() => setIsScratching(false)}
      onTouchMove={(e) => isScratching && handleScratch(e)}
    >
      {/* Content under the scratch layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        {isRevelada ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            {isWinner ? (
              <>
                <div className="text-4xl">🏆</div>
                <div className="font-bold text-yellow-700">GANHOU!</div>
                <div className="text-xs font-medium text-yellow-600 truncate max-w-[150px]">
                  {resultado?.premio?.nome || 'Prémio Mistério'}
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl text-gray-300">😢</div>
                <div className="font-bold text-gray-500">TENTE NOVAMENTE</div>
                <div className="text-[10px] text-gray-400">Não foi desta vez</div>
              </>
            )}
          </motion.div>
        ) : (
          <div className="text-gray-200 font-bold text-lg opacity-20">
            ? ? ?
          </div>
        )}
      </div>

      {/* Scratch Layer */}
      {!isRevelada && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none transition-opacity duration-500"
          style={{ opacity: scratchProgress > 0.4 ? 0 : 1 }}
        />
      )}

      {/* Overlay info */}
      <div className="absolute top-2 left-2 bg-black/10 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] font-mono text-gray-600">
        #{numeroCartao.toString().padStart(4, '0')}
      </div>
    </div>
  );
};
