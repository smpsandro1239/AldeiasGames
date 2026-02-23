import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, Loader2, Calendar, TrendingUp, Gamepad2, Gift, QrCode, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Evento, Jogo } from '@/types/project';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventoDetalhe: Evento | null;
  eventoDetalheLoading: boolean;
  eventoDetalheJogos: Jogo[];
  eventoDetalheStats: { totalAngariado: number; totalParticipacoes: number };
  handleCopyLink: (type: string, data: any) => void;
  linkCopied: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  onClose,
  eventoDetalhe,
  eventoDetalheLoading,
  eventoDetalheJogos,
  eventoDetalheStats,
  handleCopyLink,
  linkCopied,
}) => {
  if (!eventoDetalhe) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4">
                  {eventoDetalhe.imagemBase64 ? (
                    <img
                      src={eventoDetalhe.imagemBase64}
                      alt={eventoDetalhe.nome}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-green-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl">
                      📅
                    </div>
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {eventoDetalhe.nome}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={eventoDetalhe.estado === 'ativo' ? 'default' : 'secondary'}>
                        {eventoDetalhe.estado}
                      </Badge>
                      {eventoDetalhe.aldeia && (
                        <span className="text-muted-foreground">{eventoDetalhe.aldeia.nome}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {eventoDetalheLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">A carregar dados...</span>
                  </div>
                ) : (
                  <>
                    {eventoDetalhe.descricao && (
                      <p className="text-sm text-muted-foreground">{eventoDetalhe.descricao}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Data Início</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(eventoDetalhe.dataInicio).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                      {eventoDetalhe.dataFim && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Data Fim</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(eventoDetalhe.dataFim).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      )}
                    </div>

                    {eventoDetalhe.objectivoAngariacao && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Progresso da Angariação
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {eventoDetalheStats.totalAngariado.toFixed(2)}€ / {eventoDetalhe.objectivoAngariacao.toFixed(2)}€
                          </p>
                        </div>
                        <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (eventoDetalheStats.totalAngariado / eventoDetalhe.objectivoAngariacao) * 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full"
                          />
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
                          {Math.round((eventoDetalheStats.totalAngariado / eventoDetalhe.objectivoAngariacao) * 100)}% alcançado
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{eventoDetalheJogos.length}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Jogos</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-600">{eventoDetalheStats.totalParticipacoes}</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Participações</p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-center">
                        <p className="text-2xl font-bold text-amber-600">{eventoDetalheStats.totalAngariado.toFixed(0)}€</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Angariado</p>
                      </div>
                    </div>

                    {eventoDetalheJogos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Gamepad2 className="h-4 w-4" />
                          Jogos ({eventoDetalheJogos.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {eventoDetalheJogos.map(jogo => (
                            <div key={jogo.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {jogo.tipo === 'poio_vaca' ? '🐄' : jogo.tipo === 'rifa' ? '🎟️' : '🎲'}
                                </span>
                                <div>
                                  <p className="text-sm font-medium capitalize">{jogo.tipo.replace('_', ' ')}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {jogo._count?.participacoes || 0} participações
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  {jogo.precoParticipacao}€
                                </Badge>
                                <Badge variant={jogo.estado === 'ativo' ? 'default' : 'secondary'}>
                                  {jogo.estado}
                                </Badge>
                                {jogo.premio && (
                                  <div className="flex items-center gap-1" title={jogo.premio.nome}>
                                    <Gift className="h-4 w-4 text-amber-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        QR Code da Campanha
                      </h4>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-inner">
                          <QRCodeSVG
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?share=evento_${eventoDetalhe.id}`}
                            size={120}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                           <p className="text-xs text-muted-foreground mb-3">
                             Partilhe este código para convidar pessoas a participar nesta campanha.
                           </p>
                           <Button
                             variant="outline"
                             size="sm"
                             className="gap-2"
                             onClick={() => handleCopyLink('evento', eventoDetalhe)}
                           >
                             {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                             {linkCopied ? 'Copiado!' : 'Copiar Link'}
                           </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Fechar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
