import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Jogo } from '@/types/project';

interface GameCardProps {
  jogo: Jogo;
  onParticipar: (jogo: Jogo) => void;
}

/**
 * Card de jogo público
 */
export function GameCard({ jogo, onParticipar }: GameCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{jogo.titulo || jogo.tipo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Preço: {jogo.precoParticipacao}€</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onParticipar(jogo)}>Participar</Button>
      </CardFooter>
    </Card>
  );
}
