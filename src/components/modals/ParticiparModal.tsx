import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Loader2, Euro, CreditCard, Shield, Users, Phone, Mail,
  ChevronRight, CheckCircle2, Ticket, Sparkles, Hash, Grid3X3, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RifaNumberSelector } from '@/components/rifa-number-selector';

export const ParticiparModal = ({
  isOpen,
  onClose,
  jogoSelecionado,
  user,
  step,
  setStep,
  numerosSelecionados,
  setNumerosSelecionados,
  coordenadasSelecionadas,
  setCoordenadasSelecionadas,
  quantidadeRaspadinha,
  setQuantidadeRaspadinha,
  metodoPagamento,
  setMetodoPagamento,
  telefoneMbway,
  setTelefoneMbway,
  adminParaCliente,
  setAdminParaCliente,
  nomeCliente,
  setNomeCliente,
  telefoneCliente,
  setTelefoneCliente,
  emailCliente,
  setEmailCliente,
  identificacaoValida,
  participacaoLoading,
  handleParticipar,
  getComplianceText
}: any) => {
  if (!jogoSelecionado) return null;

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
            className="w-full max-w-2xl"
          >
            <Card className="overflow-hidden border-none shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />
              <CardHeader className="relative bg-white dark:bg-gray-900 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 rounded-full"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Participar em {jogoSelecionado.tipo.replace('_', ' ').toUpperCase()}</CardTitle>
                    <CardDescription>
                      {jogoSelecionado.evento?.aldeia?.nome} • {jogoSelecionado.evento?.nome}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between mb-8">
                    {[
                      { s: 'select', label: 'Seleção' },
                      { s: 'payment', label: 'Pagamento' },
                      { s: 'confirm', label: 'Confirmação' }
                    ].map((item, i) => (
                      <div key={item.s} className="flex items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                          step === item.s
                            ? "bg-green-600 text-white"
                            : i < ['select', 'payment', 'confirm'].indexOf(step)
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400"
                        )}>
                          {i < ['select', 'payment', 'confirm'].indexOf(step) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className={cn(
                          "ml-2 text-xs font-medium",
                          step === item.s ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {item.label}
                        </span>
                        {i < 2 && (
                          <div className="w-12 h-[1px] bg-gray-200 mx-4" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legal Text */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">Informação Legal</p>
                        {getComplianceText ? getComplianceText(jogoSelecionado.evento?.aldeia) : (
                          <p>Este jogo é organizado por {jogoSelecionado.evento?.aldeia?.nome || 'uma organização registada'} para angariação de fundos. O sorteio é realizado de forma transparente e verificável.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content based on step */}
                  {step === 'select' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Preço por participação</p>
                          <p className="text-2xl font-bold text-green-600">{jogoSelecionado.precoParticipacao}€</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Participações selecionadas</p>
                          <p className="text-2xl font-bold text-gray-700">
                            {jogoSelecionado.tipo === 'raspadinha'
                              ? quantidadeRaspadinha
                              : jogoSelecionado.tipo === 'poio_vaca'
                                ? coordenadasSelecionadas.length
                                : numerosSelecionados.length}
                          </p>
                        </div>
                      </div>

                      {/* Selectors based on game type */}
                      {jogoSelecionado.tipo === 'poio_vaca' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-lg">Escolha as suas coordenadas</Label>
                            <Badge variant="outline">{coordenadasSelecionadas.length}/10 selecionadas</Badge>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed flex items-center justify-center">
                             {/* Grelha do Poio da Vaca - Simplificada no modal */}
                             <div className="text-center">
                               <Grid3X3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                               <p className="text-sm text-muted-foreground">Utilize o seletor visual na página do jogo para escolher as coordenadas.</p>
                             </div>
                          </div>
                        </div>
                      )}

                      {(jogoSelecionado.tipo === 'rifa' || jogoSelecionado.tipo === 'tombola') && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-lg">Escolha os seus números</Label>
                            <Badge variant="outline">{numerosSelecionados.length}/10 selecionados</Badge>
                          </div>
                          <RifaNumberSelector
                            jogo={jogoSelecionado}
                            selectedNumbers={numerosSelecionados}
                            onToggleNumber={(num: number) => {
                              if (numerosSelecionados.includes(num)) {
                                setNumerosSelecionados(numerosSelecionados.filter((n: number) => n !== num));
                              } else if (numerosSelecionados.length < 10) {
                                setNumerosSelecionados([...numerosSelecionados, num]);
                              }
                            }}
                            maxNumbers={10}
                            multiSelect={true}
                          />
                        </div>
                      )}

                      {jogoSelecionado.tipo === 'raspadinha' && (
                        <div className="space-y-4">
                          <Label className="text-lg">Quantidade de cartões</Label>
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantidadeRaspadinha(Math.max(1, quantidadeRaspadinha - 1))}
                            >
                              -
                            </Button>
                            <div className="text-3xl font-bold w-12 text-center">{quantidadeRaspadinha}</div>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantidadeRaspadinha(Math.min(50, quantidadeRaspadinha + 1))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <p className="text-xl font-bold text-green-600 text-right">
                          Total a pagar: {((jogoSelecionado.tipo === 'raspadinha'
                            ? quantidadeRaspadinha
                            : jogoSelecionado.tipo === 'poio_vaca'
                              ? coordenadasSelecionadas.length
                              : numerosSelecionados.length) * jogoSelecionado.precoParticipacao).toFixed(2)}€
                        </p>
                      </div>

                      {user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-blue-700 dark:text-blue-400">Registar para cliente</span>
                            </div>
                            <Switch
                              checked={adminParaCliente}
                              onCheckedChange={setAdminParaCliente}
                            />
                          </div>

                          {adminParaCliente && (
                            <div className="grid gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                              <div className="space-y-2">
                                <Label>Nome do Cliente *</Label>
                                <Input
                                  placeholder="Nome completo"
                                  value={nomeCliente}
                                  onChange={(e) => setNomeCliente(e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Telemóvel</Label>
                                  <Input
                                    placeholder="9xxxxxxxx"
                                    value={telefoneCliente}
                                    onChange={(e) => setTelefoneCliente(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input
                                    placeholder="email@exemplo.com"
                                    value={emailCliente}
                                    onChange={(e) => setEmailCliente(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'payment' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
                          <CreditCard className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold">Escolha o método de pagamento</h3>
                        <p className="text-muted-foreground">Total: {((jogoSelecionado.tipo === 'raspadinha' ? quantidadeRaspadinha : jogoSelecionado.tipo === 'poio_vaca' ? coordenadasSelecionadas.length : numerosSelecionados.length) * jogoSelecionado.precoParticipacao).toFixed(2)}€</p>
                      </div>

                      <div className="grid gap-3">
                        <div
                          className={cn(
                            "p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between",
                            metodoPagamento === 'mbway' ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "hover:border-gray-300"
                          )}
                          onClick={() => setMetodoPagamento('mbway')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
                              MBWAY
                            </div>
                            <div>
                              <p className="font-bold">MB WAY</p>
                              <p className="text-xs text-muted-foreground">Pagamento imediato via telemóvel</p>
                            </div>
                          </div>
                          <div className={cn("w-5 h-5 rounded-full border-2", metodoPagamento === 'mbway' ? "border-green-600 bg-green-600" : "border-gray-300")} />
                        </div>

                        {user && ['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role) && (
                          <div
                            className={cn(
                              "p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between",
                              metodoPagamento === 'dinheiro' ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "hover:border-gray-300"
                            )}
                            onClick={() => setMetodoPagamento('dinheiro')}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center text-white">
                                <Euro className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-bold">Dinheiro</p>
                                <p className="text-xs text-muted-foreground">Pagamento recebido em mãos</p>
                              </div>
                            </div>
                            <div className={cn("w-5 h-5 rounded-full border-2", metodoPagamento === 'dinheiro' ? "border-green-600 bg-green-600" : "border-gray-300")} />
                          </div>
                        )}
                      </div>

                      {metodoPagamento === 'mbway' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                          <Label>Telemóvel MB WAY</Label>
                          <Input
                            placeholder="9xxxxxxxx"
                            value={telefoneMbway}
                            onChange={(e) => setTelefoneMbway(e.target.value)}
                          />
                          <p className="text-[10px] text-muted-foreground">Receberá uma notificação na sua app MB WAY para confirmar o pagamento.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 'confirm' && (
                    <div className="text-center py-8 space-y-6">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Quase pronto!</h3>
                        <p className="text-muted-foreground">Confirme os detalhes da sua participação:</p>
                      </div>

                      <div className="bg-muted/50 p-6 rounded-2xl space-y-3 text-left max-w-sm mx-auto">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground text-sm">Jogo:</span>
                          <span className="font-semibold">{jogoSelecionado.tipo.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground text-sm">Participações:</span>
                          <span className="font-semibold">
                            {jogoSelecionado.tipo === 'raspadinha' ? quantidadeRaspadinha :
                             jogoSelecionado.tipo === 'poio_vaca' ? coordenadasSelecionadas.length :
                             numerosSelecionados.length}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground text-sm">Método:</span>
                          <span className="font-semibold uppercase">{metodoPagamento}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-muted-foreground font-bold">Total:</span>
                          <span className="text-xl font-bold text-green-600">
                            {((jogoSelecionado.tipo === 'raspadinha' ? quantidadeRaspadinha : jogoSelecionado.tipo === 'poio_vaca' ? coordenadasSelecionadas.length : numerosSelecionados.length) * jogoSelecionado.precoParticipacao).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-6 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === 'payment') setStep('select');
                    else if (step === 'confirm') setStep('payment');
                    else onClose();
                  }}
                  disabled={participacaoLoading}
                  className="px-8"
                >
                  {step === 'select' ? 'Cancelar' : 'Anterior'}
                </Button>

                <Button
                  onClick={() => {
                    if (step === 'select') setStep('payment');
                    else if (step === 'payment') setStep('confirm');
                    else handleParticipar();
                  }}
                  disabled={
                    participacaoLoading ||
                    (step === 'select' && (
                      (jogoSelecionado.tipo === 'raspadinha' && quantidadeRaspadinha < 1) ||
                      (jogoSelecionado.tipo === 'poio_vaca' && coordenadasSelecionadas.length === 0) ||
                      ((jogoSelecionado.tipo === 'rifa' || jogoSelecionado.tipo === 'tombola') && numerosSelecionados.length === 0) ||
                      (adminParaCliente && !identificacaoValida)
                    )) ||
                    (step === 'payment' && metodoPagamento === 'mbway' && !telefoneMbway)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-8 gap-2"
                >
                  {participacaoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 'confirm' ? (
                    'Confirmar e Pagar'
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Help helpers
function Switch({ checked, onCheckedChange }: any) {
  return (
    <div
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors cursor-pointer",
        checked ? "bg-green-600" : "bg-gray-200"
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className={cn(
        "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
        checked && "translate-x-5"
      )} />
    </div>
  );
}
