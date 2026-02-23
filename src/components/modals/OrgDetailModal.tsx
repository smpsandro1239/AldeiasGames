import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, Loader2, MapPin, User, Shield, Calendar, Gamepad2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Aldeia, Evento, Jogo } from '@/types/project';

interface OrgDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgDetalhe: Aldeia | null;
  orgDetalheLoading: boolean;
  orgDetalheEventos: Evento[];
  orgDetalheJogos: Jogo[];
}

export const OrgDetailModal: React.FC<OrgDetailModalProps> = ({
  isOpen,
  onClose,
  orgDetalhe,
  orgDetalheLoading,
  orgDetalheEventos,
  orgDetalheJogos,
}) => {
  if (!orgDetalhe) return null;

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
                  {orgDetalhe.logoBase64 ? (
                    <img
                      src={orgDetalhe.logoBase64}
                      alt={orgDetalhe.nome}
                      className="w-16 h-16 object-cover rounded-full border-2 border-green-200"
                    />
                  ) : (
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
                      orgDetalhe.tipoOrganizacao === 'escola' ? 'bg-blue-100 dark:bg-blue-900' :
                      orgDetalhe.tipoOrganizacao === 'associacao_pais' ? 'bg-purple-100 dark:bg-purple-900' :
                      orgDetalhe.tipoOrganizacao === 'clube' ? 'bg-orange-100 dark:bg-orange-900' :
                      'bg-green-100 dark:bg-green-900'
                    )}>
                      {orgDetalhe.tipoOrganizacao === 'escola' ? '🏫' :
                       orgDetalhe.tipoOrganizacao === 'associacao_pais' ? '👨‍👩‍👧‍👦' :
                       orgDetalhe.tipoOrganizacao === 'clube' ? '⚽' : '🏘️'}
                    </div>
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {orgDetalhe.nome}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {orgDetalhe.tipoOrganizacao === 'escola' ? 'Escola' :
                         orgDetalhe.tipoOrganizacao === 'associacao_pais' ? 'Associação de Pais' :
                         orgDetalhe.tipoOrganizacao === 'clube' ? 'Clube' : 'Aldeia'}
                      </Badge>
                      {orgDetalhe.localidade && (
                        <span className="text-muted-foreground">{orgDetalhe.localidade}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {orgDetalheLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">A carregar dados...</span>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      {orgDetalhe.descricao && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">{orgDetalhe.descricao}</p>
                        </div>
                      )}

                      {(orgDetalhe.morada || orgDetalhe.localizacao || orgDetalhe.localidade) && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Localização</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {orgDetalhe.morada || orgDetalhe.localizacao}
                            {orgDetalhe.codigoPostal && <span>• {orgDetalhe.codigoPostal}</span>}
                            {orgDetalhe.localidade && <span>• {orgDetalhe.localidade}</span>}
                          </p>
                        </div>
                      )}

                      {orgDetalhe.responsavel && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                          <p className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {orgDetalhe.responsavel}
                            {orgDetalhe.contactoResponsavel && (
                              <span className="text-muted-foreground">• {orgDetalhe.contactoResponsavel}</span>
                            )}
                          </p>
                        </div>
                      )}

                      {(orgDetalhe.autorizacaoCM || orgDetalhe.numeroAlvara) && (
                        <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Conformidade Legal
                          </p>
                          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            {orgDetalhe.autorizacaoCM && (
                              <p>✓ Autorização Câmara Municipal {orgDetalhe.dataAutorizacaoCM && `desde ${new Date(orgDetalhe.dataAutorizacaoCM).toLocaleDateString('pt-PT')}`}</p>
                            )}
                            {orgDetalhe.numeroAlvara && (
                              <p>✓ Alvará nº {orgDetalhe.numeroAlvara}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2 grid grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{orgDetalheEventos.length}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Eventos</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{orgDetalheJogos.length}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Jogos</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg text-center">
                          <p className="text-2xl font-bold text-amber-600">{orgDetalhe._count?.premios || 0}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">Prémios</p>
                        </div>
                      </div>

                      {orgDetalheEventos.length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Eventos ({orgDetalheEventos.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {orgDetalheEventos.slice(0, 5).map(evento => (
                              <div key={evento.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                  {evento.imagemBase64 ? (
                                    <img src={evento.imagemBase64} alt={evento.nome} className="w-8 h-8 rounded object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">{evento.nome}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(evento.dataInicio).toLocaleDateString('pt-PT')}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant={evento.estado === 'ativo' ? 'default' : 'secondary'}>
                                  {evento.estado}
                                </Badge>
                              </div>
                            ))}
                            {orgDetalheEventos.length > 5 && (
                              <p className="text-xs text-center text-muted-foreground">
                                +{orgDetalheEventos.length - 5} eventos
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {orgDetalheJogos.filter(j => j.estado === 'ativo').length > 0 && (
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            Jogos Ativos
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {orgDetalheJogos.filter(j => j.estado === 'ativo').map(jogo => (
                              <Badge key={jogo.id} variant="outline" className="gap-1">
                                {jogo.tipo === 'poio_vaca' ? '🐄' : jogo.tipo === 'rifa' ? '🎟️' : '🎲'}
                                {jogo.tipo.replace('_', ' ')}
                                <span className="text-green-600">{jogo.precoParticipacao}€</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
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
