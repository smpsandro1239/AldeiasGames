/**
 * TerminalVendas.tsx
 * Terminal de vendas otimizado para tablet/telemóvel do vendedor
 * Fluxo: Escolher Jogo → Registar Cliente → Pagamento → Confirmação
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  UserPlus, 
  CreditCard, 
  Euro,
  CheckCircle,
  Gamepad2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  QrCode,
  Search,
  Clock,
  X
} from 'lucide-react';
import { UIButton, UICard, UIInput } from '@/components/ui-components';

interface Jogo {
  id: string;
  titulo: string;
  tipo: 'rifa' | 'poio_vaca' | 'raspadinha' | 'tombola';
  precoParticipacao: number;
  estado: string;
  stockRestante?: number;
}

interface Evento {
  id: string;
  nome: string;
  jogos?: Jogo[];
}

interface ClienteInfo {
  nome: string;
  telefone: string;
  email: string;
}

type Step = 'jogo' | 'cliente' | 'pagamento' | 'confirmacao';

export function TerminalVendas({ 
  eventos, 
  aldeiaId, 
  onVendaCompleta 
}: { 
  eventos: Evento[], 
  aldeiaId: string,
  onVendaCompleta?: () => void 
}) {
  const [step, setStep] = useState<Step>('jogo');
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [cliente, setCliente] = useState<ClienteInfo>({ nome: '', telefone: '', email: '' });
  const [metodoPagamento, setMetodoPagamento] = useState<'dinheiro' | 'mbway' | 'stripe'>('dinheiro');
  const [loading, setLoading] = useState(false);
  const [telefoneMbway, setTelefoneMbway] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendaSucesso, setVendaSucesso] = useState(false);

  // Lista de jogos disponíveis
  const jogosDisponiveis = eventos.flatMap(ev => ev.jogos || []).filter(j => j.estado === 'ativo');
  const jogosFiltrados = searchQuery 
    ? jogosDisponiveis.filter(j => j.titulo.toLowerCase().includes(searchQuery.toLowerCase()))
    : jogosDisponiveis;

  const total = jogoSelecionado ? jogoSelecionado.precoParticipacao * quantidade : 0;

  const validarCliente = () => {
    // Obrigatório: nome + (telefone OU email)
    if (!cliente.nome.trim()) return false;
    if (!cliente.telefone.trim() && !cliente.email.trim()) return false;
    return true;
  };

  const handleSelecionarJogo = (jogo: Jogo) => {
    setJogoSelecionado(jogo);
    setQuantidade(1);
    setStep('cliente');
  };

  const handleRegistarCliente = () => {
    if (!validarCliente()) return;
    setStep('pagamento');
  };

  const handlePagamento = () => {
    setStep('confirmacao');
  };

  const handleConfirmarVenda = async () => {
    if (!jogoSelecionado) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/vendas/rapida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jogoId: jogoSelecionado.id,
          aldeiaId,
          quantidade,
          metodoPagamento,
          telefoneMbway: telefoneMbway || null,
          cliente
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVendaSucesso(true);
        // Limpar formulário após 3 segundos
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao processar venda');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar venda');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('jogo');
    setJogoSelecionado(null);
    setQuantidade(1);
    setCliente({ nome: '', telefone: '', email: '' });
    setMetodoPagamento('dinheiro');
    setTelefoneMbway('');
    setVendaSucesso(false);
    onVendaCompleta?.();
  };

  // Mostrar ecrã de sucesso
  if (vendaSucesso) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-green-500">
        <div className="text-center text-white p-8">
          <CheckCircle className="w-32 h-32 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-2">Venda Concluída!</h1>
          <p className="text-xl opacity-90">Obrigado pela preferência</p>
          <p className="mt-4 text-2xl font-bold">€{total.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header com progresso */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">Terminal de Vendas</h1>
          <div className="flex gap-2">
            {(['jogo', 'cliente', 'pagamento', 'confirmacao'] as Step[]).map((s, i) => (
              <div 
                key={s}
                className={`w-3 h-3 rounded-full ${
                  step === s ? 'bg-indigo-600' : 
                  ['jogo', 'cliente', 'pagamento', 'confirmacao'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-1 text-xs">
          <span className={step === 'jogo' ? 'text-indigo-600 font-bold' : 'text-gray-500'}>1. Jogo</span>
          <span className="text-gray-300">→</span>
          <span className={step === 'cliente' ? 'text-indigo-600 font-bold' : 'text-gray-500'}>2. Cliente</span>
          <span className="text-gray-300">→</span>
          <span className={step === 'pagamento' ? 'text-indigo-600 font-bold' : 'text-gray-500'}>3. Pagamento</span>
          <span className="text-gray-300">→</span>
          <span className={step === 'confirmacao' ? 'text-indigo-600 font-bold' : 'text-gray-500'}>4. Confirmar</span>
        </div>
      </div>

      {/* Conteúdo conforme step */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {/* STEP 1: Escolher Jogo */}
        {step === 'jogo' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar jogo..."
                className="w-full pl-10 pr-4 py-3 border rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {jogosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum jogo disponível</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {jogosFiltrados.map((jogo) => (
                  <button
                    key={jogo.id}
                    onClick={() => handleSelecionarJogo(jogo)}
                    className="p-4 bg-white border rounded-xl text-left hover:border-indigo-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        jogo.tipo === 'rifa' ? 'bg-blue-100 text-blue-700' :
                        jogo.tipo === 'raspadinha' ? 'bg-purple-100 text-purple-700' :
                        jogo.tipo === 'poio_vaca' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {jogo.tipo === 'poio_vaca' ? 'Poio da Vaca' : jogo.tipo.charAt(0).toUpperCase() + jogo.tipo.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-indigo-600">€{jogo.precoParticipacao.toFixed(2)}</span>
                    </div>
                    <h3 className="font-bold">{jogo.titulo}</h3>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Registar Cliente */}
        {step === 'cliente' && (
          <div className="space-y-4">
            <UICard className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Jogo Selecionado</h3>
                <button onClick={() => setStep('jogo')} className="text-sm text-indigo-600">Alterar</button>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{jogoSelecionado?.titulo}</p>
                  <p className="text-sm text-gray-500">{jogoSelecionado?.tipo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-2 bg-gray-100 rounded-lg">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-xl">{quantidade}</span>
                  <button onClick={() => setQuantidade(quantidade + 1)} className="p-2 bg-gray-100 rounded-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-indigo-600">€{total.toFixed(2)}</span>
              </div>
            </UICard>

            <UICard className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold">Dados do Cliente</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    className="w-full p-3 border rounded-lg"
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telemóvel *</label>
                  <input
                    type="tel"
                    placeholder="912 345 678"
                    className="w-full p-3 border rounded-lg"
                    value={cliente.telefone}
                    onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email (opcional)</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    className="w-full p-3 border rounded-lg"
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  />
                </div>
              </div>

              {!validarCliente() && (
                <p className="text-red-500 text-sm mt-2">* Obrigatório: Nome + (Telemóvel ou Email)</p>
              )}
            </UICard>

            <UIButton 
              className="w-full py-4" 
              onClick={handleRegistarCliente}
              disabled={!validarCliente()}
            >
              Continuar <ArrowRight className="w-5 h-5 ml-2" />
            </UIButton>
          </div>
        )}

        {/* STEP 3: Pagamento */}
        {step === 'pagamento' && (
          <div className="space-y-4">
            <UICard className="p-4">
              <h3 className="font-bold mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente</span>
                  <span className="font-bold">{cliente.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jogo</span>
                  <span className="font-bold">{jogoSelecionado?.titulo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade</span>
                  <span className="font-bold">{quantidade}x</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-indigo-600">€{total.toFixed(2)}</span>
                </div>
              </div>
            </UICard>

            <UICard className="p-4">
              <h3 className="font-bold mb-4">Método de Pagamento</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setMetodoPagamento('dinheiro')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center gap-3 ${
                    metodoPagamento === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center">
                    <Euro className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Dinheiro</p>
                    <p className="text-xs text-gray-500">Pagamento em numerário</p>
                  </div>
                </button>

                <button
                  onClick={() => setMetodoPagamento('mbway')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center gap-3 ${
                    metodoPagamento === 'mbway' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">MBWAY</div>
                  <div className="text-left">
                    <p className="font-bold">MB Way</p>
                    <p className="text-xs text-gray-500">Pagamento instantâneo</p>
                  </div>
                </button>
              </div>

              {metodoPagamento === 'mbway' && (
                <div className="mt-4">
                  <input
                    type="tel"
                    placeholder="Número MB Way (912 345 678)"
                    className="w-full p-3 border-2 rounded-xl"
                    value={telefoneMbway}
                    onChange={(e) => setTelefoneMbway(e.target.value)}
                  />
                </div>
              )}
            </UICard>

            <div className="flex gap-2">
              <UIButton variant="outline" className="flex-1 py-4" onClick={() => setStep('cliente')}>
                <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
              </UIButton>
              <UIButton className="flex-[2] py-4" onClick={handlePagamento}>
                Confirmar <ArrowRight className="w-5 h-5 ml-2" />
              </UIButton>
            </div>
          </div>
        )}

        {/* STEP 4: Confirmação */}
        {step === 'confirmacao' && (
          <div className="space-y-4">
            <UICard className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Confirmar Venda</h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cliente</span>
                  <span className="font-bold">{cliente.nome}</span>
                </div>
                {cliente.telefone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telemóvel</span>
                    <span className="font-bold">{cliente.telefone}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-bold">{cliente.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Jogo</span>
                  <span className="font-bold">{jogoSelecionado?.titulo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantidade</span>
                  <span className="font-bold">{quantidade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pagamento</span>
                  <span className="font-bold uppercase">{metodoPagamento === 'mbway' ? 'MB Way' : metodoPagamento}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total a Pagar</span>
                  <span className="font-bold text-2xl text-indigo-600">€{total.toFixed(2)}</span>
                </div>
              </div>
            </UICard>

            <div className="flex gap-2">
              <UIButton variant="outline" className="flex-1 py-4" onClick={() => setStep('pagamento')}>
                <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
              </UIButton>
              <UIButton className="flex-[2] py-4" onClick={handleConfirmarVenda} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> A processar...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" /> Confirmar Venda
                  </>
                )}
              </UIButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
