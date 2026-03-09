/**
 * RaspadinhaDashboard.tsx
 * Dashboard completo de criação de Raspadinha
 * Design: Festivo português, premium, mobile-first
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Copy,
  Play,
  CheckCircle,
  AlertCircle,
  Euro,
  TrendingUp,
  TrendingDown,
  Calculator,
  Gift,
  Target,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  DollarSign,
  Percent,
  BarChart3,
  PartyPopper,
  Wallet,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UIButton, UICard, UIBadge } from '@/components/ui-components';
import { useRaspadinhaConfig, NivelPremio, ConfigRaspadinha } from '@/stores/useRaspadinhaConfig';

// ============================================
// CONSTANTES
// ============================================

const SIMBOLOS_DISPONIVEIS = ['🏆', '🎁', '🎀', '🎉', '⭐', '💎', '🔥', '🍀', '💰', '🎊'];

// ============================================
// COMPONENTES BÁSICOS (inline para evitar dependências)
// ============================================

function Input({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  className = '',
  min,
  max,
  step,
  id,
  disabled
}: { 
  type?: string; 
  value: any; 
  onChange: (e: any) => void; 
  placeholder?: string; 
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      id={id}
      disabled={disabled}
      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors ${className}`}
    />
  );
}

function Label({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-semibold text-gray-700 mb-1 ${className}`}>
      {children}
    </label>
  );
}

function Progress({ value, className = '', style }: { value: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, ...style }}
      />
    </div>
  );
}

function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error'; className?: string }) {
  const cores = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${cores[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function PercentualBar({ percentual, cor = 'bg-red-500' }: { percentual: number; cor?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>Progresso</span>
        <span className={percentual === 100 ? 'text-green-600 font-bold' : percentual > 90 ? 'text-yellow-600' : ''}>
          {percentual.toFixed(1)}%
        </span>
      </div>
      <Progress value={percentual} />
    </div>
  );
}

function MetricaCard({ titulo, valor, subvalor, icon: Icon, cor = 'text-gray-800' }: { 
  titulo: string; 
  valor: string | number; 
  subvalor?: string;
  icon: React.ElementType;
  cor?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${cor}/10`}>
          <Icon className={`w-5 h-5 ${cor}`} />
        </div>
      </div>
      <p className="text-sm text-gray-500">{titulo}</p>
      <p className={`text-2xl font-black ${cor}`}>{valor}</p>
      {subvalor && <p className="text-xs text-gray-400">{subvalor}</p>}
    </div>
  );
}

function IndicadorRentabilidade({ config }: { config: ConfigRaspadinha }) {
  const { rentavel, margemLucro } = config;
  
  let cor = 'bg-red-100 text-red-700 border-red-200';
  let emoji = '⚠️';
  let mensagem = 'Campanha com margem reduzida';
  
  if (margemLucro < 0) {
    emoji = '❌';
    mensagem = 'Campanha com PREJUÍZO!';
  } else if (margemLucro < 20) {
    mensagem = 'Margem muito baixa - ajuste recomendada';
  } else if (margemLucro < 40) {
    cor = 'bg-blue-100 text-blue-700 border-blue-200';
    emoji = '✅';
    mensagem = 'Margem aceitável';
  } else {
    cor = 'bg-green-100 text-green-700 border-green-200';
    emoji = '🎉';
    mensagem = 'Excelente retorno!';
  }
  
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-4 rounded-xl border-2 ${cor}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div>
          <p className="font-bold text-lg">
            {rentavel ? 'CAMPANHA RENTÁVEL' : 'CAMPANHA NÃO RENTÁVEL'}
          </p>
          <p className="text-sm opacity-80">{mensagem}</p>
        </div>
      </div>
    </motion.div>
  );
}

function GraficoDistribuicao({ config }: { config: ConfigRaspadinha }) {
  const cores = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'];
  const todosPremios = [...config.premios, { nome: 'Sem Prémio', percentual: config.percentualSemPremio }];
  
  return (
    <div className="space-y-3">
      {todosPremios.map((premio, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${cores[i % cores.length]}`} />
          <span className="text-sm text-gray-600 flex-1 truncate">{premio.nome}</span>
          <span className="text-sm font-bold">{premio.percentual.toFixed(1)}%</span>
        </div>
      ))}
      <div className="flex h-4 rounded-full overflow-hidden mt-2">
        {todosPremios.map((premio, i) => (
          <div key={i} className={`${cores[i % cores.length]}`} style={{ width: `${premio.percentual}%` }} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// PASSOS DO WIZARD
// ============================================

function Passo1Dados({ config, updateCampo }: { 
  config: ConfigRaspadinha; 
  updateCampo: (c: keyof ConfigRaspadinha, v: any) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
      <div className="text-center mb-6">
        <Sparkles className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-gray-800">Dados Básicos</h2>
        <p className="text-gray-500">Configure os parâmetros gerais da campanha</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="titulo">Título da Campanha *</Label>
          <Input
            id="titulo"
            placeholder="Ex: Raspadinha Festa da Aldeia 2026"
            value={config.titulo}
            onChange={(e) => updateCampo('titulo', e.target.value)}
            className="text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio">Data de Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={config.dataInicio}
              onChange={(e) => updateCampo('dataInicio', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dataFim">Data de Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={config.dataFim}
              onChange={(e) => updateCampo('dataFim', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="totalRaspadinhas">Total de Raspadinhas Disponíveis *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="totalRaspadinhas"
              type="number"
              min="10"
              max="100000"
              value={config.totalRaspadinhas}
              onChange={(e) => updateCampo('totalRaspadinhas', parseInt(e.target.value) || 0)}
              className="text-xl font-bold"
            />
            <span className="text-gray-500 font-medium">unidades</span>
          </div>
        </div>

        <div>
          <Label htmlFor="preco">Preço por Raspadinha *</Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">€</span>
            <Input
              id="preco"
              type="number"
              step="0.10"
              min="0.10"
              value={config.precoPorRaspadinha}
              onChange={(e) => updateCampo('precoPorRaspadinha', parseFloat(e.target.value) || 0)}
              className="text-xl font-bold"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Passo2Premios({ config, adicionarPremio, removerPremio, atualizarPremio, ajustarAutomaticamente }: { 
  config: ConfigRaspadinha;
  adicionarPremio: () => void;
  removerPremio: (id: string) => void;
  atualizarPremio: (id: string, updates: Partial<NivelPremio>) => void;
  ajustarAutomaticamente: () => void;
}) {
  const percentualTotal = config.premios.reduce((sum, p) => sum + p.percentual, 0);
  const totalValido = Math.abs(percentualTotal + config.percentualSemPremio - 100) < 0.1;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
      <div className="text-center mb-6">
        <Gift className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-gray-800">Distribuição de Prémios</h2>
        <p className="text-gray-500">Defina os prémios e suas probabilidades</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-gray-700">Total de Probabilidades</span>
          <Badge variant={totalValido ? 'success' : 'error'}>
            {percentualTotal.toFixed(1)}% + {config.percentualSemPremio.toFixed(1)}% = 100%
          </Badge>
        </div>
        <PercentualBar percentual={percentualTotal} cor={totalValido ? 'bg-green-500' : 'bg-red-500'} />
        {totalValido ? (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Percentuais corretos!
          </p>
        ) : (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> A soma deve fechar em 100%
          </p>
        )}
      </div>

      <div className="space-y-3">
        {config.premios.map((premio) => (
          <motion.div key={premio.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Símbolo</Label>
                <select
                  value={premio.simbolo}
                  onChange={(e) => atualizarPremio(premio.id, { simbolo: e.target.value })}
                  className="p-2 border rounded-lg bg-gray-50 text-2xl"
                >
                  {SIMBOLOS_DISPONIVEIS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex-1">
                <Label className="text-xs">Nome do Prémio</Label>
                <Input
                  value={premio.nome}
                  onChange={(e) => atualizarPremio(premio.id, { nome: e.target.value })}
                  placeholder="Ex: 1º Prémio - Grande Sorte"
                />
              </div>

              <div className="w-24">
                <Label className="text-xs">Valor (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={premio.valor}
                  onChange={(e: any) => atualizarPremio(premio.id, { valor: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="w-24">
                <Label className="text-xs">Quant.</Label>
                <Input
                  type="number"
                  min="0"
                  value={premio.quantidade}
                  onChange={(e: any) => {
                    const qtd = parseInt(e.target.value) || 0;
                    atualizarPremio(premio.id, { quantidade: qtd, percentual: (qtd / config.totalRaspadinhas) * 100 });
                  }}
                />
              </div>

              <button onClick={() => removerPremio(premio.id)} className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Probabilidade</span>
                <span>{premio.percentual.toFixed(2)}%</span>
              </div>
              <Progress value={premio.percentual} />
            </div>
          </motion.div>
        ))}
      </div>

      <UIButton variant="outline" className="w-full border-dashed" onClick={adicionarPremio}>
        <Plus className="w-4 h-4 mr-2" /> Adicionar Nível de Prémio
      </UIButton>

      <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <div>
              <p className="font-bold text-gray-700">Sem Prémio</p>
              <p className="text-xs text-gray-500">Calculado automaticamente</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-600">{config.percentualSemPremio.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{Math.round((config.percentualSemPremio / 100) * config.totalRaspadinhas)} unidades</p>
          </div>
        </div>
      </div>

      {!totalValido && (
        <UIButton onClick={ajustarAutomaticamente} className="w-full bg-amber-500 hover:bg-amber-600">
          <Calculator className="w-4 h-4 mr-2" /> Ajustar Automaticamente
        </UIButton>
      )}
    </motion.div>
  );
}

function Passo3Resumo({ config, onSimular }: { config: ConfigRaspadinha; onSimular: () => void }) {
  const getMargemCor = (margem: number) => {
    if (margem >= 40) return 'text-green-600';
    if (margem >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
      <div className="text-center mb-6">
        <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <h2 className="text-2xl font-black text-gray-800">Resumo & Rentabilidade</h2>
        <p className="text-gray-500">Analise os números antes de criar</p>
      </div>

      <IndicadorRentabilidade config={config} />

      <div className="grid grid-cols-2 gap-3">
        <MetricaCard titulo="Receita Total" valor={`€${config.receitaTotal.toFixed(2)}`} subvalor={`${config.totalRaspadinhas} × €${config.precoPorRaspadinha.toFixed(2)}`} icon={Wallet} cor="text-green-600" />
        <MetricaCard titulo="Custo Prémios" valor={`€${config.custoPremios.toFixed(2)}`} subvalor={`${config.premios.reduce((s, p) => s + p.quantidade, 0)} prémios`} icon={Gift} cor="text-red-600" />
        <MetricaCard titulo="Taxas (5%)" valor={`-€${config.taxas.toFixed(2)}`} subvalor="Stripe + Plataforma" icon={Percent} cor="text-gray-600" />
        <MetricaCard titulo="Lucro Líquido" valor={`€${config.lucroLiquido.toFixed(2)}`} subvalor={`Margem ${config.margemLucro.toFixed(1)}%`} icon={TrendingUp} cor={config.lucroLiquido > 0 ? 'text-green-600' : 'text-red-600'} />
      </div>

      <UICard className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold">Margem de Lucro</span>
          <span className={`text-2xl font-black ${getMargemCor(config.margemLucro)}`}>{config.margemLucro.toFixed(1)}%</span>
        </div>
        <Progress value={Math.max(0, Math.min(100, config.margemLucro))} className="h-3" />
      </UICard>

      <UICard className="p-4">
        <h3 className="font-bold mb-4">Distribuição de Prémios</h3>
        <GraficoDistribuicao config={config} />
      </UICard>

      <UICard className="p-4 overflow-hidden">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> Preview da Raspadinha</h3>
        <PreviewRaspadinhaSimples config={config} />
        <UIButton onClick={onSimular} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500">
          <Play className="w-4 h-4 mr-2" /> Simular Raspadinha
        </UIButton>
      </UICard>
    </motion.div>
  );
}

function PreviewRaspadinhaSimples({ config }: { config: ConfigRaspadinha }) {
  const [areasReveladas, setAreasReveladas] = useState<number[]>([]);
  const simbolos = ['⭐', '💰', '🎁', '🍀', '🔥', '💎', '🎀', '⭐', '💰'];
  
  return (
    <div className="bg-gradient-to-b from-red-50 to-green-50 rounded-xl p-4">
      <div className="bg-gradient-to-r from-red-600 to-green-600 rounded-lg p-3 mb-3 text-center">
        <h3 className="text-white font-black">{config.titulo || 'Raspadinha'}</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {simbolos.map((simbolo, i) => (
          <button key={i} onClick={() => !areasReveladas.includes(i) && setAreasReveladas([...areasReveladas, i])} disabled={areasReveladas.includes(i)} className={`aspect-square rounded-lg flex items-center justify-center text-3xl transition-all ${areasReveladas.includes(i) ? 'bg-white shadow-inner' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
            {areasReveladas.includes(i) ? simbolo : '?'}
          </button>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-black text-green-600">€{config.precoPorRaspadinha.toFixed(2)}</span>
        <button onClick={() => setAreasReveladas([])} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>
    </div>
  );
}

function ModalSimulacao({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [areasReveladas, setAreasReveladas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<'ganhou' | 'perdeu' | null>(null);
  const simbolos = ['⭐', '💰', '🎁', '🍀', '🔥', '💎'];

  const simular = () => {
    const ganhou = Math.random() > 0.7;
    setAreasReveladas([]);
    setResultado(null);
    const interval = setInterval(() => {
      setAreasReveladas(prev => {
        if (prev.length >= 9) {
          clearInterval(interval);
          setResultado(ganhou ? 'ganhou' : 'perdeu');
          if (ganhou) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FF6B6B', '#4ECDC4'] });
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black">🎲 Simulação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {simbolos.map((simbolo, i) => (
            <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-4xl ${areasReveladas.includes(i) ? (resultado === 'ganhou' ? 'bg-green-100' : 'bg-gray-100') : 'bg-gray-200'}`}>
              {areasReveladas.includes(i) ? simbolo : '?'}
            </div>
          ))}
        </div>
        {resultado && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-center p-4 rounded-xl mb-4 ${resultado === 'ganhou' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <p className="text-3xl mb-2">{resultado === 'ganhou' ? '🎉' : '😢'}</p>
            <p className="font-bold text-xl">{resultado === 'ganhou' ? 'GANHOU!' : 'Sem prémio'}</p>
          </motion.div>
        )}
        <div className="flex gap-3">
          <UIButton variant="outline" onClick={onClose} className="flex-1">Fechar</UIButton>
          <UIButton onClick={simular} className="flex-1 bg-purple-600"><Play className="w-4 h-4 mr-2" /> Nova</UIButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function RaspadinhaDashboard() {
  const [passo, setPasso] = useState(1);
  const [showSimulacao, setShowSimulacao] = useState(false);
  
  const { 
    config, 
    updateCampo, 
    adicionarPremio, 
    removerPremio, 
    atualizarPremio, 
    ajustarAutomaticamente,
    restaurarPadrao,
    duplicarConfig,
    isDirty,
    saveToStorage
  } = useRaspadinhaConfig();

  useEffect(() => { useRaspadinhaConfig.getState().loadFromStorage(); }, []);

  const podeAvancar = () => {
    switch (passo) {
      case 1: return config.titulo.trim() && config.totalRaspadinhas > 0 && config.precoPorRaspadinha > 0;
      case 2: return Math.abs(config.premios.reduce((s, p) => s + p.percentual, 0) + config.percentualSemPremio - 100) < 0.1;
      default: return true;
    }
  };

  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => saveToStorage(), 2000);
      return () => clearTimeout(timer);
    }
  }, [config, isDirty, saveToStorage]);

  const handleCriarCampanha = () => {
    console.log('Criar campanha:', config);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.5 } });
    alert('Campanha criada com sucesso! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 p-4">
      {/* Header */}
      <motion.header className="max-w-6xl mx-auto mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <UICard className="p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-green-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800">Criar Raspadinha</h1>
              <p className="text-sm text-gray-500">{isDirty ? '🔄 Alterações não guardadas' : '✅ Guardado'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <UIButton variant="outline" size="sm" onClick={restaurarPadrao}><RotateCcw className="w-4 h-4 mr-1" /> Restaurar</UIButton>
            <UIButton variant="outline" size="sm" onClick={duplicarConfig}><Copy className="w-4 h-4 mr-1" /> Duplicar</UIButton>
          </div>
        </UICard>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <UICard className="p-4">
            <div className="space-y-2">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => p < passo && setPasso(p)}
                  disabled={p > passo}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    passo === p ? 'bg-gradient-to-r from-red-500 to-green-500 text-white' : 
                    p < passo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    {p < passo ? <CheckCircle className="w-5 h-5" /> : p}
                  </span>
                  <span className="font-bold text-sm">{p === 1 ? 'Dados' : p === 2 ? 'Prémios' : 'Resumo'}</span>
                </button>
              ))}
            </div>
          </UICard>

          <UICard className="p-4">
            <h3 className="font-bold text-sm mb-3">Preview</h3>
            <PreviewRaspadinhaSimples config={config} />
          </UICard>

          <UICard className="p-4">
            <h3 className="font-bold text-sm mb-3">Rentabilidade</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-500">Receita</span><span className="font-bold text-green-600">€{config.receitaTotal.toFixed(0)}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Custo</span><span className="font-bold text-red-600">-€{config.custoPremios.toFixed(0)}</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="text-sm font-bold">Lucro</span><span className={`font-bold ${config.lucroLiquido > 0 ? 'text-green-600' : 'text-red-600'}`}>€{config.lucroLiquido.toFixed(0)}</span></div>
            </div>
          </UICard>
        </div>

        {/* Main Wizard */}
        <div className="lg:col-span-3">
          <UICard className="min-h-[500px] p-6">
            <AnimatePresence mode="wait">
              {passo === 1 && <Passo1Dados key="passo1" config={config} updateCampo={updateCampo} />}
              {passo === 2 && <Passo2Premios key="passo2" config={config} adicionarPremio={adicionarPremio} removerPremio={removerPremio} atualizarPremio={atualizarPremio} ajustarAutomaticamente={ajustarAutomaticamente} />}
              {passo === 3 && <Passo3Resumo key="passo3" config={config} onSimular={() => setShowSimulacao(true)} />}
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t">
              {passo > 1 ? (
                <UIButton variant="outline" onClick={() => setPasso(passo - 1)}><ArrowLeft className="w-4 h-4 mr-2" /> Anterior</UIButton>
              ) : <div />}
              
              {passo < 3 ? (
                <UIButton onClick={() => setPasso(passo + 1)} disabled={!podeAvancar()} className="bg-gradient-to-r from-red-500 to-green-500">Próximo <ArrowRight className="w-4 h-4 ml-2" /></UIButton>
              ) : (
                <UIButton onClick={handleCriarCampanha} disabled={!podeAvancar()} className="bg-gradient-to-r from-green-500 to-green-600"><PartyPopper className="w-4 h-4 mr-2" /> CRIAR CAMPANHA</UIButton>
              )}
            </div>
          </UICard>
        </div>
      </div>

      <ModalSimulacao isOpen={showSimulacao} onClose={() => setShowSimulacao(false)} />
    </div>
  );
}
