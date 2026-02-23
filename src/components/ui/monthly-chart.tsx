'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface MonthlyChartProps {
  data: number[];
  labels: string[];
}

/**
 * Gráfico de barras simples com Framer Motion
 */
export function MonthlyChart({ data, labels }: MonthlyChartProps) {
  const max = Math.max(...data, 1);

  return (
    <div className="flex items-end justify-between h-48 gap-2">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(val / max) * 100}%` }}
            className="w-full bg-indigo-500 rounded-t-sm"
          />
          <span className="text-[10px] text-muted-foreground rotate-45 md:rotate-0">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
