import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, History, Loader2, Ticket, Trophy } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  pagamentosLoading: boolean;
  pagamentosData: any;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  pagamentosLoading,
  pagamentosData,
}) => {
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
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  O seu histórico de participações e pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pagamentosLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">A carregar histórico...</span>
                  </div>
                ) : pagamentosData ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-green-600">Total Gasto</CardDescription>
                          <CardTitle className="text-2xl text-green-700">{pagamentosData.estatisticas?.totalGasto?.toFixed(2) || '0.00'}€</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-blue-600">Participações</CardDescription>
                          <CardTitle className="text-2xl text-blue-700">{pagamentosData.estatisticas?.totalParticipacoes || 0}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <CardHeader className="pb-2">
                          <CardDescription className="text-yellow-600">Vitórias</CardDescription>
                          <CardTitle className="text-2xl text-yellow-700">{pagamentosData.estatisticas?.totalVitorias || 0}</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <div className="flex gap-4">
                      <Badge variant="outline">MBWay: {pagamentosData.estatisticas?.pagamentosPorMetodo?.mbway || 0}</Badge>
                      <Badge variant="outline">Dinheiro: {pagamentosData.estatisticas?.pagamentosPorMetodo?.dinheiro || 0}</Badge>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Participações</h4>
                      {pagamentosData.historico?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Ticket className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Sem participações registadas</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                          {pagamentosData.historico?.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                                  {item.jogo?.tipo === 'poio_vaca' ? '🐄' : item.jogo?.tipo === 'rifa' ? '🎟️' : '🎲'}
                                </div>
                                <div>
                                  <p className="font-medium text-sm capitalize">{item.jogo?.tipo?.replace('_', ' ')}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.jogo?.evento} • {item.jogo?.aldeia}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(item.data).toLocaleDateString('pt-PT')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-green-600">{item.valorPago}€</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.jogo?.tipo === 'poio_vaca'
                                    ? `${item.dadosParticipacao?.letra}${item.dadosParticipacao?.numero}`
                                    : `Nº ${item.dadosParticipacao?.numero}`}
                                </p>
                                {item.venceu && (
                                  <Badge className="bg-yellow-500 text-white text-xs mt-1">
                                    <Trophy className="h-3 w-3 mr-1" /> Venceu!
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Erro ao carregar histórico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
