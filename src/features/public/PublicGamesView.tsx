import React from 'react';
import { motion } from 'framer-motion';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gamepad2, Calendar, MapPin, Sparkles, QrCode, Share2, Eye, Globe, Gift, Trophy, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Jogo, Participacao, Aldeia, Evento } from '@/types/project';
import { EmptyState, GameCardSkeleton } from '@/components/common-ui';

export const PublicGamesView = ({
  jogosPublicos,
  loading,
  openJogoDetalhe,
  handleShare,
  GAME_TYPES
}: any) => {
  return (

    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-green-600" />
            Jogos Disponíveis
          </h2>
          <p className="text-muted-foreground">Participe em jogos de aldeias de todo o mundo</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {jogosPublicos.filter(j => j.estado === 'ativo').length} jogos ativos
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <GameCardSkeleton />
          <GameCardSkeleton />
          <GameCardSkeleton />
        </div>
      ) : jogosPublicos.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Sem jogos disponíveis"
          description="Não há jogos ativos no momento. Volte em breve!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jogosPublicos.map((jogo, index) => {
            const gameType = GAME_TYPES[jogo.tipo as keyof typeof GAME_TYPES] || GAME_TYPES.rifa;
            const config = typeof jogo.config === 'string' ? JSON.parse(jogo.config) : jogo.config;

            return (
              <motion.div
                key={jogo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "overflow-hidden hover:shadow-xl transition-all duration-300 group",
                  jogo.estado === 'terminado' && "opacity-75"
                )}>
                  <div className={cn(
                    "h-2",
                    jogo.estado === 'ativo' ? "bg-gradient-to-r from-green-400 to-green-600" :
                    jogo.estado === 'terminado' ? "bg-gradient-to-r from-gray-400 to-gray-600" :
                    "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  )} />

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{gameType.emoji}</span>
                          <span className="capitalize">{jogo.tipo.replace('_', ' ')}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {jogo.evento?.aldeia?.nome || 'Aldeia'} • {jogo.evento?.nome || 'Evento'}
                        </CardDescription>
                      </div>
                      <Badge variant={jogo.estado === 'ativo' ? 'default' : 'secondary'}>
                        {jogo.estado}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {gameType.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Preço</p>
                        <p className="text-lg font-bold text-green-600">{jogo.precoParticipacao}€</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Participações</p>
                        <p className="text-lg font-bold">{jogo._count?.participacoes || 0}</p>
                      </div>
                    </div>

                    {/* Prémio */}
                    {jogo.premio && (
                      <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Prémio</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {jogo.premio.imagemBase64 ? (
                            <img
                              src={jogo.premio.imagemBase64}
                              alt={jogo.premio.nome}
                              className="w-12 h-12 object-cover rounded-lg border border-amber-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                              <Gift className="h-6 w-6 text-amber-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{jogo.premio.nome}</p>
                            {jogo.premio.valorEstimado && (
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Valor: {jogo.premio.valorEstimado.toFixed(2)}€
                              </p>
                            )}
                            {jogo.premio.patrocinador && (
                              <p className="text-xs text-muted-foreground">
                                Patrocinado por: {jogo.premio.patrocinador}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {jogo.estado === 'terminado' && jogo.sorteio && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Vencedor: {JSON.stringify(jogo.sorteio.resultado)}
                        </p>
                      </div>
                    )}

                    {jogo.tipo === 'poio_vaca' && (
                      <div className="text-xs text-muted-foreground">
                        Grid: {config.linhas || 10}×{config.colunas || 10} = {(config.linhas || 10) * (config.colunas || 10)} coordenadas
                      </div>
                    )}
                    {jogo.tipo === 'rifa' && (
                      <div className="text-xs text-muted-foreground">
                        {config.totalBilhetes || 100} números disponíveis
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="gap-2">
                    {jogo.estado === 'ativo' ? (
                      <>
                        <Button
                          className="flex-1 gap-2"
                          onClick={() => openParticiparModal(jogo)}
                        >
                          <Play className="h-4 w-4" />
                          Participar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setJogoDetalhe(jogo)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink('jogo', jogo);
                          }}
                          title="Partilhar jogo"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setJogoDetalhe(jogo)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink('jogo', jogo);
                          }}
                          title="Partilhar jogo"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>


  );
};
