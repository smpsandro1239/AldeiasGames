import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Loader2, Plus, MapPin, Calendar, Gamepad2, Upload, ImageIcon,
  Trash2, Sparkles, AlertTriangle, Info, Trophy, LayoutGrid, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const CreateModal = ({
  isOpen,
  onClose,
  createType,
  createForm,
  setCreateForm,
  handleCreate,
  createLoading,
  aldeias,
  eventos,
  premios,
  handleImageUpload,
  aldeiaImageRef,
  eventoImageRef,
  stockInicial,
  setStockInicial,
  premiosRaspadinha,
  setPremiosRaspadinha,
  limitePorUsuario,
  setLimitePorUsuario,
  novoPremioRaspadinha,
  setNovoPremioRaspadinha,
  addPremioRaspadinha,
  removePremioRaspadinha
}: any) => {
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
            className="w-full max-w-md"
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
                  <Plus className="h-5 w-5" />
                  Nova {createType === 'aldeia' ? 'Organização' : createType === 'evento' ? 'Campanha' : 'Jogo'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="space-y-4">
                      {/* Common fields */}
                      <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input
                          placeholder={`Nome da${createType === 'aldeia' ? ' organização' : createType === 'evento' ? ' campanha' : 'o jogo'}`}
                          value={createForm.nome}
                          onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                          required
                        />
                      </div>

                      {createType === 'aldeia' && (
                        <>
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                              placeholder="Breve descrição"
                              value={createForm.descricao}
                              onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Localização</Label>
                            <Input
                              placeholder="Ex: Vila Verde, Braga"
                              value={createForm.localizacao}
                              onChange={(e) => setCreateForm({ ...createForm, localizacao: e.target.value })}
                            />
                          </div>

                          {/* Tipo de Organização (v3.0) */}
                          <div className="space-y-2">
                            <Label>Tipo de Organização</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'aldeia', label: 'Aldeia', icon: MapPin },
                                { id: 'escola', label: 'Escola', icon: School },
                                { id: 'associacao_pais', label: 'Assoc. Pais', icon: Users },
                                { id: 'clube', label: 'Clube', icon: Building }
                              ].map((tipo) => (
                                <Button
                                  key={tipo.id}
                                  type="button"
                                  variant={createForm.tipoOrganizacao === tipo.id ? 'default' : 'outline'}
                                  onClick={() => setCreateForm({ ...createForm, tipoOrganizacao: tipo.id })}
                                  className="text-xs justify-start"
                                >
                                  <tipo.icon className="h-3 w-3 mr-2" />
                                  {tipo.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Logótipo (Imagem)</Label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded border flex items-center justify-center bg-gray-50 overflow-hidden">
                                {createForm.imagemUrl ? (
                                  <img src={createForm.imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <input
                                type="file"
                                ref={aldeiaImageRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'aldeia')}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => aldeiaImageRef.current?.click()}
                              >
                                {createForm.imagemUrl ? 'Alterar' : 'Carregar'}
                              </Button>
                            </div>
                          </div>

                          {/* Novos Campos v3.0: Endereço Detalhado */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Código Postal</Label>
                              <Input
                                placeholder="0000-000"
                                value={createForm.codigoPostal}
                                onChange={(e) => setCreateForm({ ...createForm, codigoPostal: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Localidade</Label>
                              <Input
                                placeholder="Cidade / Vila"
                                value={createForm.localidade}
                                onChange={(e) => setCreateForm({ ...createForm, localidade: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Conformidade Legal */}
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 space-y-4">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Conformidade Legal
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="autorizacaoCM"
                                checked={createForm.autorizacaoCM}
                                onChange={(e) => setCreateForm({ ...createForm, autorizacaoCM: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <Label htmlFor="autorizacaoCM" className="text-xs cursor-pointer">
                                Possuímos autorização da Câmara Municipal para sorteios
                              </Label>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Número de Alvará / Licença</Label>
                              <Input
                                placeholder="Ex: 123/2024"
                                className="h-8 text-xs"
                                value={createForm.numeroAlvara}
                                onChange={(e) => setCreateForm({ ...createForm, numeroAlvara: e.target.value })}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {createType === 'evento' && (
                        <>
                          <div className="space-y-2">
                            <Label>Organização *</Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={createForm.aldeiaId}
                              onChange={(e) => setCreateForm({ ...createForm, aldeiaId: e.target.value })}
                              required
                            >
                              <option value="">Selecione...</option>
                              {aldeias.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                              placeholder="Descrição do evento"
                              value={createForm.descricao}
                              onChange={(e) => setCreateForm({ ...createForm, descricao: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Data de Início *</Label>
                              <Input
                                type="date"
                                value={createForm.dataInicio}
                                onChange={(e) => setCreateForm({ ...createForm, dataInicio: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Data de Fim</Label>
                              <Input
                                type="date"
                                value={createForm.dataFim}
                                onChange={(e) => setCreateForm({ ...createForm, dataFim: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Objectivo de Angariação (€)</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 5000"
                              value={createForm.objectivoAngariacao}
                              onChange={(e) => setCreateForm({ ...createForm, objectivoAngariacao: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Imagem de Capa</Label>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded border flex items-center justify-center bg-gray-50 overflow-hidden">
                                {createForm.imagemUrl ? (
                                  <img src={createForm.imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <input
                                type="file"
                                ref={eventoImageRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'evento')}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => eventoImageRef.current?.click()}
                              >
                                {createForm.imagemUrl ? 'Alterar' : 'Carregar'}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {createType === 'jogo' && (
                        <>
                          <div className="space-y-2">
                            <Label>Campanha *</Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={createForm.eventoId}
                              onChange={(e) => setCreateForm({ ...createForm, eventoId: e.target.value })}
                              required
                            >
                              <option value="">Selecione...</option>
                              {eventos.map((e: any) => (
                                <option key={e.id} value={e.id}>{e.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Jogo *</Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={createForm.tipo}
                              onChange={(e) => setCreateForm({ ...createForm, tipo: e.target.value })}
                              required
                            >
                              <option value="poio_vaca">Poio da Vaca</option>
                              <option value="rifa">Rifa</option>
                              <option value="tombola">Tombola</option>
                              <option value="raspadinha">Raspadinha</option>
                            </select>
                          </div>

                          {/* Seletor de Prémio Principal (v3.0) */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                              Prémio Principal
                              <Trophy className="h-3 w-3 text-yellow-500" />
                            </Label>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={createForm.premioId}
                              onChange={(e) => setCreateForm({ ...createForm, premioId: e.target.value })}
                            >
                              <option value="">Nenhum prémio selecionado</option>
                              {premios.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.nome} ({p.valorEstimado}€)</option>
                              ))}
                            </select>
                            <p className="text-[10px] text-muted-foreground">O prémio principal será exibido em destaque no jogo.</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Preço por Participação (€) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={createForm.precoParticipacao}
                              onChange={(e) => setCreateForm({ ...createForm, precoParticipacao: e.target.value })}
                              required
                            />
                          </div>

                          {/* Configurações específicas */}
                          {createForm.tipo === 'poio_vaca' && (
                            <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                              <div className="space-y-2">
                                <Label>Linhas</Label>
                                <Input
                                  type="number"
                                  value={createForm.config.linhas}
                                  onChange={(e) => setCreateForm({
                                    ...createForm,
                                    config: { ...createForm.config, linhas: parseInt(e.target.value) }
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Colunas</Label>
                                <Input
                                  type="number"
                                  value={createForm.config.colunas}
                                  onChange={(e) => setCreateForm({
                                    ...createForm,
                                    config: { ...createForm.config, colunas: parseInt(e.target.value) }
                                  })}
                                />
                              </div>
                            </div>
                          )}

                          {(createForm.tipo === 'rifa' || createForm.tipo === 'tombola') && (
                            <div className="space-y-2 p-3 bg-muted rounded-lg">
                              <Label>Total de Bilhetes</Label>
                              <Input
                                type="number"
                                value={createForm.config.totalBilhetes}
                                onChange={(e) => setCreateForm({
                                  ...createForm,
                                  config: { ...createForm.config, totalBilhetes: parseInt(e.target.value) }
                                })}
                              />
                            </div>
                          )}

                          {createForm.tipo === 'raspadinha' && (
                            <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200">
                                <Sparkles className="h-4 w-4" />
                                <h4>Configuração de Raspadinha</h4>
                              </div>

                              <div className="space-y-2">
                                <Label>Stock Inicial (Cartões)</Label>
                                <Input
                                  type="number"
                                  value={stockInicial}
                                  onChange={(e) => setStockInicial(parseInt(e.target.value))}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Limite por Utilizador</Label>
                                <Input
                                  type="number"
                                  value={limitePorUsuario}
                                  onChange={(e) => setLimitePorUsuario(parseInt(e.target.value))}
                                />
                              </div>

                              <div className="space-y-3 pt-2 border-t border-amber-200">
                                <Label>Adicionar Prémio à Raspadinha</Label>
                                <div className="grid gap-2">
                                  <Input
                                    placeholder="Nome do prémio"
                                    className="h-8 text-xs"
                                    value={novoPremioRaspadinha.nome}
                                    onChange={(e) => setNovoPremioRaspadinha({ ...novoPremioRaspadinha, nome: e.target.value })}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Probab. (%)"
                                      className="h-8 text-xs"
                                      value={novoPremioRaspadinha.percentagem || ''}
                                      onChange={(e) => setNovoPremioRaspadinha({ ...novoPremioRaspadinha, percentagem: parseFloat(e.target.value) })}
                                    />
                                    <Input
                                      type="number"
                                      placeholder="Valor (€)"
                                      className="h-8 text-xs"
                                      value={novoPremioRaspadinha.valor || ''}
                                      onChange={(e) => setNovoPremioRaspadinha({ ...novoPremioRaspadinha, valor: parseFloat(e.target.value) })}
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={addPremioRaspadinha}
                                    className="bg-amber-600 hover:bg-amber-700 h-8"
                                  >
                                    Adicionar Prémio
                                  </Button>
                                </div>

                                {premiosRaspadinha.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium">Prémios configurados:</p>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                      {premiosRaspadinha.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/50 p-2 rounded text-xs">
                                          <span>{p.nome} ({p.percentagem}%)</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold">{p.valor}€</span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-red-500"
                                              onClick={() => removePremioRaspadinha(i)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  <Button type="submit" className="w-full mt-6" disabled={createLoading}>
                    {createLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `Criar ${createType === 'aldeia' ? 'Organização' : createType === 'evento' ? 'Campanha' : 'Jogo'}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Help helpers
function Users({ className }: any) {
  return <UsersIcon className={className} />;
}
function UsersIcon({ className }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function School({ className }: any) {
  return <SchoolIcon className={className} />;
}
function SchoolIcon({ className }: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m4 6 8-4 8 4"/><path d="m18 10 2 1v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V11l2-1"/><path d="m12 22 5-3"/><path d="m12 22-5-3"/><path d="M12 7v15"/></svg>;
}
