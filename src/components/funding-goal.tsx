import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';

interface FundingGoalProps {
  current: number;
  target: number;
  label?: string;
}

export const FundingGoal: React.FC<FundingGoalProps> = ({ current, target, label = 'Objectivo de Angariação' }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-xl border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-bold">{percentage}%</span>
        </div>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current.toLocaleString('pt-PT')}€ angariados</span>
        <span>Meta: {target.toLocaleString('pt-PT')}€</span>
      </div>
    </div>
  );
};
