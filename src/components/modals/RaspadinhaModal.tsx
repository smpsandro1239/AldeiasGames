'use client';
import React from 'react';
import { ModalProps, Participacao } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScratchCard } from '@/components/scratch-card';

interface RaspadinhaModalProps extends ModalProps {
  participacao: Participacao | null;
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
            participacaoId={participacao.id}
            numeroCartao={participacao.numeroCartao || 0}
            isRevelada={participacao.revelada}
            isRevelando={false}
            resultado={participacao.dadosParticipacao} // Using dadosParticipacao as fallback
            onReveal={onRevelar}
          />
          <p className="mt-4 text-sm text-muted-foreground font-medium animate-pulse">Arraste para raspar e revelar o prémio!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
