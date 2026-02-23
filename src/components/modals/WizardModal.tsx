import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Loader2, MapPin, Building, School, Target, Upload, ImageIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  wizardStep: number;
  setWizardStep: (step: number) => void;
  wizardData: any;
  setWizardData: (data: any) => void;
  wizardLoading: boolean;
  handleSaveWizard: (skip: boolean) => void;
  wizardLogoRef: any;
  handleImageUpload: (e: any, target: string) => void;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  wizardStep,
  setWizardStep,
  wizardData,
  setWizardData,
  wizardLoading,
  handleSaveWizard,
  wizardLogoRef,
  handleImageUpload
}) => {
  return (
    <AnimatePresence>
      {isOpen && wizardData.organizacao && (
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
            className="w-full max-w-lg"
          >
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Passo {wizardStep} de 3
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleSaveWizard(true)} disabled={wizardLoading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">Bem-vindo à {wizardData.organizacao.nome}!</CardTitle>
                <CardDescription>
                  Vamos configurar os detalhes básicos da sua organização para começar.
                </CardDescription>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    className="bg-green-500 h-full"
                    initial={{ width: "33%" }}
                    animate={{ width: `${(wizardStep / 3) * 100}%` }}
                  />
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <ScrollArea className="h-[400px] pr-4">
                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                        <Building className="h-5 w-5" />
                        <h3>Informação Geral</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição / Missão</Label>
                        <textarea
                          id="descricao"
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Fale um pouco sobre a sua organização..."
                          value={wizardData.descricao}
                          onChange={(e) => setWizardData({ ...wizardData, descricao: e.target.value })}
                        />
                      </div>

                      {wizardData.organizacao.tipoOrganizacao === 'escola' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="nomeEscola">Nome da Escola</Label>
                            <Input
                              id="nomeEscola"
                              placeholder="Nome oficial da escola"
                              value={wizardData.nomeEscola}
                              onChange={(e) => setWizardData({ ...wizardData, nomeEscola: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="codigoEscola">Código da Escola</Label>
                              <Input
                                id="codigoEscola"
                                placeholder="Ex: 123456"
                                value={wizardData.codigoEscola}
                                onChange={(e) => setWizardData({ ...wizardData, codigoEscola: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nivelEnsino">Nível de Ensino</Label>
                              <Input
                                id="nivelEnsino"
                                placeholder="Básico, Secundário..."
                                value={wizardData.nivelEnsino}
                                onChange={(e) => setWizardData({ ...wizardData, nivelEnsino: e.target.value })}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-2 pt-2">
                        <Label>Logótipo da Organização</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden">
                            {wizardData.logoBase64 ? (
                              <img src={wizardData.logoBase64} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="h-8 w-8 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              ref={wizardLogoRef}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'wizard')}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => wizardLogoRef.current?.click()}
                            >
                              <Upload className="h-4 w-4" />
                              {wizardData.logoBase64 ? 'Alterar' : 'Carregar'}
                            </Button>
                            {wizardData.logoBase64 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-red-500"
                                onClick={() => setWizardData({ ...wizardData, logoBase64: '' })}
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                        <MapPin className="h-5 w-5" />
                        <h3>Localização e Contacto</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="morada">Morada</Label>
                        <Input
                          id="morada"
                          placeholder="Rua, número..."
                          value={wizardData.morada}
                          onChange={(e) => setWizardData({ ...wizardData, morada: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="codigoPostal">Código Postal</Label>
                          <Input
                            id="codigoPostal"
                            placeholder="0000-000"
                            value={wizardData.codigoPostal}
                            onChange={(e) => setWizardData({ ...wizardData, codigoPostal: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="localidade">Localidade</Label>
                          <Input
                            id="localidade"
                            placeholder="Vila / Cidade"
                            value={wizardData.localidade}
                            onChange={(e) => setWizardData({ ...wizardData, localidade: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t mt-4 pt-4">
                        <Label htmlFor="responsavel">Responsável pela Conta</Label>
                        <Input
                          id="responsavel"
                          placeholder="Nome do gestor principal"
                          value={wizardData.responsavel}
                          onChange={(e) => setWizardData({ ...wizardData, responsavel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contacto">Telemóvel de Contacto</Label>
                        <Input
                          id="contacto"
                          placeholder="9xxxxxxxx"
                          value={wizardData.contactoResponsavel}
                          onChange={(e) => setWizardData({ ...wizardData, contactoResponsavel: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                        <Target className="h-5 w-5" />
                        <h3>Conformidade e Segurança</h3>
                      </div>

                      <Card className="bg-amber-50 border-amber-100 p-4 mb-4">
                        <div className="flex gap-3">
                          <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-semibold">Importante</p>
                            <p>Em Portugal, sorteios e rifas podem requerer autorização da Câmara Municipal local. Certifique-se de que a sua organização está em conformidade.</p>
                          </div>
                        </div>
                      </Card>

                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          id="autorizacaoCM"
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                          checked={wizardData.autorizacaoCM}
                          onChange={(e) => setWizardData({ ...wizardData, autorizacaoCM: e.target.checked })}
                        />
                        <Label htmlFor="autorizacaoCM" className="font-medium cursor-pointer">
                          Possuímos autorização da Câmara Municipal
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alvara">Número de Alvará / Licença (opcional)</Label>
                        <Input
                          id="alvara"
                          placeholder="Se já possuir um número de registro..."
                          value={wizardData.numeroAlvara}
                          onChange={(e) => setWizardData({ ...wizardData, numeroAlvara: e.target.value })}
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Este número será exibido nos detalhes públicos dos seus jogos para garantir transparência.
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              <CardFooter className="flex justify-between border-t pt-4">
                <Button
                  variant="ghost"
                  onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setWizardModalOpen(false)}
                  disabled={wizardLoading}
                >
                  {wizardStep > 1 ? 'Anterior' : 'Cancelar'}
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSaveWizard(true)} disabled={wizardLoading}>
                    Pular
                  </Button>
                  {wizardStep < 3 ? (
                    <Button
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Próximo
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSaveWizard(false)}
                      disabled={wizardLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {wizardLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        'Concluir Configuração'
                      )}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Help helper
function Badge({ children, variant, className }: any) {
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variant === 'outline' ? 'text-foreground' : 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80', className)}>{children}</div>;
}

function ScrollArea({ children, className }: any) {
  return <div className={cn("relative overflow-auto", className)}>{children}</div>;
}
