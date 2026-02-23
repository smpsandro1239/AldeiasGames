import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket, Calendar, Trophy, Euro, ExternalLink, Sparkles, Users, Settings, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';
import { EmptyState } from '@/components/common-ui';

export const PlayerParticipationsView = ({
  minhasParticipacoes,
  loading,
  setActiveView,
  openJogoDetalhe,
  handleRevelarRaspadinha,
  GAME_TYPES
}: any) => {
  return (

    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-green-600" />
            Minhas Participações
          </h2>
          <p className="text-muted-foreground">Veja todos os jogos onde participou</p>
        </div>
      </div>

      {!user ? (
        <EmptyState
          icon={Users}
          title="Inicie sessão"
          description="Faça login para ver as suas participações"
          action={<Button onClick={() => setAuthModalOpen(true)}>Entrar</Button>}
        />
      ) : minhasParticipacoes.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Sem participações"
          description="Ainda não participou em nenhum jogo. Explore os jogos disponíveis!"
          action={<Button onClick={() => setActiveView('public')}>Ver Jogos</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {minhasParticipacoes.map((part, index) => {
            const gameType = GAME_TYPES[part.jogo?.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
            const isWinner = part.jogo?.sorteio &&
              JSON.stringify(part.jogo.sorteio.resultado) === JSON.stringify(part.dadosParticipacao);

            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "hover:shadow-lg transition-all",
                  isWinner && "ring-2 ring-yellow-500 bg-yellow-50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl relative">
                          {gameType.emoji}
                          {/* Círculo indicando que o número foi jogado */}
                          <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-pulse opacity-50" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{part.jogo?.tipo?.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {part.jogo?.evento?.aldeia?.nome} • {part.jogo?.evento?.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(part.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                          {/* Info do cliente se registado por admin */}
                          {part.nomeCliente && (
                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {part.nomeCliente}
                              {part.telefoneCliente && <span>• {part.telefoneCliente}</span>}
                              {part.emailCliente && !part.telefoneCliente && <span>• {part.emailCliente}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          {isWinner ? (
                            <Badge className="bg-yellow-500 text-white gap-1">
                              <Trophy className="h-3 w-3" /> Venceu!
                            </Badge>
                          ) : part.jogo?.estado === 'terminado' ? (
                            <Badge variant="secondary">Terminado</Badge>
                          ) : (
                            <Badge variant="default">Ativo</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center font-bold text-green-700">
                            {part.jogo?.tipo === 'poio_vaca'
                              ? `${part.dadosParticipacao.letra}${part.dadosParticipacao.numero}`
                              : part.dadosParticipacao.numero
                            }
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{part.valorPago}€</p>

                        {/* Botões de ação para admins */}
                        {user && ['super_admin', 'aldeia_admin'].includes(user.role) && !part.jogo?.sorteio && (
                          <div className="flex gap-1 mt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAlterarModal(part);
                              }}
                              className="h-7 text-xs"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Alterar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openHistoricoModal(part);
                              }}
                              className="h-7 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Histórico
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>


  );
};
