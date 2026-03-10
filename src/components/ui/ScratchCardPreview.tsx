/**
 * ScratchCardPreview.tsx
 * Preview estático da raspadinha com efeito de raspar parcial
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ScratchCardPreviewProps {
  titulo: string;
  premioPrincipal: string;
  simbolos?: string[];
  className?: string;
}

export function ScratchCardPreview({ 
  titulo, 
  premioPrincipal, 
  simbolos = ['⭐', '💰', '🎁'],
  className = '' 
}: ScratchCardPreviewProps) {
  // Áreas já "raspadas" parcialmente (mock)
  const [revealedAreas] = useState<number[]>([1, 4, 7]);

  return (
    <div className={`relative ${className}`}>
      {/* Card principal */}
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 rounded-2xl p-3 shadow-xl">
        {/* Header do card */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">🎫</span>
          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
            Ativa
          </span>
        </div>
        
        {/* Preview da raspadinha */}
        <div className="bg-white/90 rounded-xl p-2 mb-2">
          <div className="grid grid-cols-3 gap-1">
            {Array(9).fill(null).map((_, i) => {
              const isRevealed = revealedAreas.includes(i);
              const simbolo = simbolos[i % simbolos.length];
              
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl ${
                    isRevealed 
                      ? 'bg-white' 
                      : 'bg-gradient-to-br from-gray-300 to-gray-400'
                  }`}
                >
                  {isRevealed ? (
                    <span className="text-2xl">{simbolo}</span>
                  ) : (
                    <Sparkles className="w-4 h-4 text-gray-500/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Info da campanha */}
        <div>
          <h4 className="text-white font-bold text-sm">{titulo}</h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/80 text-xs">
              {Math.floor(Math.random() * 2000 + 500)} jogadores
            </span>
            <span className="text-amber-300 font-black text-lg">
              {premioPrincipal}
            </span>
          </div>
        </div>
      </div>
      
      {/* Shine effect overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine" />
      </div>
    </div>
  );
}

// Componente para usar como background pattern
export function FestiveBackgroundPattern() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, #FFD700 1px, transparent 1px),
          radial-gradient(circle at 80% 70%, #FF6B6B 1px, transparent 1px),
          radial-gradient(circle at 50% 50%, #9B59B6 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px, 80px 80px, 100px 100px'
      }}
    />
  );
}
