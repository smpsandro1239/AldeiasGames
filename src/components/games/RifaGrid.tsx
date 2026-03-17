import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RifaGridProps {
  numbers: number[];
  onNumberSelect?: (number: number) => void;
  maxSelectable?: number;
  className?: string;
}

export default function RifaGrid({
  numbers = [],
  onNumberSelect,
  maxSelectable,
  className
}: RifaGridProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const handleNumberClick = (number: number) => {
    if (onNumberSelect) {
      onNumberSelect(number);
    }
    setSelectedNumbers(prev => {
      const isAlreadySelected = prev.includes(number);
      if (isAlreadySelected) {
        return prev.filter(n => n !== number);
      }
      if (maxSelectable && prev.length >= maxSelectable) {
        return prev;
      }
      return [...prev, number];
    });
  };

  const isSelected = (number: number) => selectedNumbers.includes(number);

  // Grid responsive: 10 cols desktop, 7 tablet, 5 mobile
  const gridColsClass = "grid grid-cols-10 sm:grid-cols-7 md:grid-cols-5 gap-2 sm:gap-3";

  return (
    <div className={cn("rifa-grid", className)}>
      <div className={gridColsClass + " max-w-4xl mx-auto p-2"}>
        <AnimatePresence>
          {numbers.map((number, idx) => {
            const selected = isSelected(number);
            return (
              <motion.button
                key={number}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.005, duration: 0.2 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(number)}
                className={cn(
                  "relative flex items-center justify-center rounded-xl font-bold text-sm sm:text-base transition-all duration-300",
                  "backdrop-blur-sm border border-white/10 shadow-lg",
                  selected
                    ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-500/50 shadow-amber-500/20"
                    : "bg-white/10 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 hover:bg-white/20 hover:border-amber-400/50 hover:shadow-amber-400/10",
                  "min-h-[2.5rem] min-w-[2.5rem]"
                )}
              >
                <span className="font-medium tracking-wide">
                  {number.toString().padStart(2, '0')}
                </span>
                {selected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-700 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
                {/* Glow effect on selection */}
                {selected && (
                  <div className="absolute inset-0 rounded-xl bg-amber-500/10 blur-md -z-10 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Counter de seleção */}
      {maxSelectable && (
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {selectedNumbers.length} / {maxSelectable} números escolhidos
        </div>
      )}
    </div>
  );
}
