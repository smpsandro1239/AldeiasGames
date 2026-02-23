'use client';
import React from 'react';
import { ModalProps } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GerirParticipacaoModalProps extends ModalProps {
  participacao: any;
  onAnular: (id: string) => void;
  onTrocar: (id: string) => void;
}

export function GerirParticipacaoModal({ isOpen, onClose, participacao, onAnular, onTrocar }: GerirParticipacaoModalProps) {
  if (!participacao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerir Participação</DialogTitle>
          <DialogDescription>
            ID: {participacao.id}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p><strong>Utilizador:</strong> {participacao.user?.nome}</p>
          <p><strong>Jogo:</strong> {participacao.jogo?.titulo}</p>
          <p><strong>Valor:</strong> {participacao.valorPago}€</p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onAnular(participacao.id)}>Anular</Button>
          <Button onClick={() => onTrocar(participacao.id)}>Trocar Posição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
