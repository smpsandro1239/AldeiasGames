'use client';
import React from 'react';
import { ModalProps } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScratchCard } from '@/components/scratch-card';

interface RaspadinhaModalProps extends ModalProps {
  participacao: any;
  onRevelar: (id: string) => Promise<any>;
}

export function RaspadinhaModal({ isOpen, onClose, participacao, onRevelar }: RaspadinhaModalProps) {
  if (!participacao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>A Sua Raspadinha</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          <ScratchCard
            id={participacao.id}
            isRevealed={participacao.revelada}
            onComplete={() => onRevelar(participacao.id)}
            result={participacao.resultadoRaspe}
          />
          <p className="mt-4 text-sm text-muted-foreground">Arraste para raspar e revelar o prémio!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
