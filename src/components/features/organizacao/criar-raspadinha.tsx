/**
 * CriarRaspadinha.tsx
 * Interface para criar/configurar Raspadinhas
 * Design: Premium, festivo, intuitivo
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Edit,
  GripVertical,
  Image as ImageIcon,
  Gift,
  Coins,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Settings,
  Upload,
  XCircle
} from 'lucide-react';
import { UIButton, UICard } from '@/components/ui-components';

// ============================================
// TIPOS
// ============================================

interface PremioRaspadinha {
  id: string;
  titulo: string;
  valor: number;
  probabilidade: number; // 0-100
  simbolo: string;
  imagem?: string;  // URL da imagem do símbolo
}

interface ConfigRaspadinha {
  titulo: string;
  descricao: string;
  preco: number;
  limiteParticipantes?: number;
  dataExpiracao?: string;
  premios: PremioRaspadinha[];
  simbolos: string[];
  imagens: string[];  // URLs das imagens para os símbolos
  imagemFesta?: string;  // Imagem de fundo/tema da festa
  usarImagens: boolean;  // Se deve usar imagens em vez de emojis
  cores: {
    primario: string;
    secundario: string;
    premio: string;
  };
}

// ============================================
// PREDEFINIÇÕES
// ============================================

const SIMBOLOS_PREDEFINIDOS = ['⭐', '💰', '🎁', '🍀', '🔥', '💎', '🎀', '🌟'];

const CORES_PREDEFINIDAS = [
  { nome: 'Festivo', primario: '#E11D48', secundario: '#F59E0B', premio: '#16A34A' },
  { nome: 'Purple Dream', primario: '#7C3AED', secundario: '#EC4899', premio: '#F59E0B' },
  { nome: 'Ocean', primario: '#0EA5E9', secundario: '#06B6D4', premio: '#10B981' },
  { nome: 'Forest', primario: '#16A34A', secundario: '#84CC16', premio: '#F59E0B' },
  { nome: 'Dark Night', primario: '#1F2937', secundario: '#4B5563', premio: '#F59E0B' },
];

// ============================================
// COMPONENTES
// ============================================

// --------------------------------------------
// PREVIEW DA RASPADINHA
// --------------------------------------------
function RaspadinhaPreview({ config }: { config: ConfigRaspadinha }) {
  const [areasReveladas, setAreasReveladas] = useState<number[]>([]);
  
  const toggleArea = (id: number) => {
    if (areasReveladas.includes(id)) {
      setAreasReveladas(areasReveladas.filter(a => a !== id));
    } else {
      setAreasReveladas([...areasReveladas, id]);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-4">
      <p className="text-center text-sm text-gray-500 mb-3">Preview</p>
      
      {/* Header com imagem da festa */}
      <div 
        className="rounded-t-xl p-3 mb-3 relative overflow-hidden"
        style={{ backgroundColor: config.cores.primario }}
      >
        {config.imagemFesta && (
          <img 
            src={config.imagemFesta} 
            alt="Festa" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10">
          <h3 className="text-white font-bold text-center">{config.titulo || 'Título da Raspadinha'}</h3>
          <p className="text-white/80 text-xs text-center">{config.descricao || 'Descrição...'}</p>
        </div>
      </div>

      {/* Áreas de raspagem */}
      <div 
        className="grid grid-cols-3 gap-2 p-3 rounded-xl"
        style={{ backgroundColor: config.cores.secundario + '20' }}
      >
        {Array(9).fill(null).map((_, i) => {
          const simbolo = config.simbolos[i % config.simbolos.length];
          const imagem = config.imagens?.[i % config.imagens.length];
          
          return (
            <button
              key={i}
              onClick={() => toggleArea(i)}
              className={`aspect-square rounded-lg flex items-center justify-center text-2xl transition-all ${
                areasReveladas.includes(i)
                  ? 'bg-white shadow-inner'
                  : 'bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300'
              }`}
            >
              {areasReveladas.includes(i) ? (
                config.usarImagens && imagem ? (
                  <img 
                    src={imagem} 
                    alt={simbolo}
                    className="max-w-[90%] max-h-[90%] object-contain"
                  />
                ) : (
                  <span>{simbolo}</span>
                )
              ) : (
                <Sparkles className="w-5 h-5 text-gray-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-2xl font-black" style={{ color: config.cores.primario }}>
          €{config.preco.toFixed(2)}
        </span>
        <span className="text-xs text-gray-400">
          {config.premios.length} prémios
        </span>
      </div>
    </div>
  );
}

// --------------------------------------------
// FORMULÁRIO DE CRIAÇÃO
// --------------------------------------------
function Passo1Dados({ 
  config, 
  onChange 
}: { 
  config: ConfigRaspadinha; 
  onChange: (c: ConfigRaspadinha) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        Dados Básicos
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          placeholder="Ex: Raspadinha da Festa 2026"
          value={config.titulo}
          onChange={(e: any) => onChange({ ...config, titulo: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          className="w-full p-3 border rounded-xl resize-none"
          rows={2}
          placeholder="Descrição opcional..."
          value={config.descricao}
          onChange={(e: any) => onChange({ ...config, descricao: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço *
          </label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              step="0.01"
              min="0.50"
              placeholder="1.00"
              className="w-full pl-10 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              value={config.preco || ''}
              onChange={(e: any) => onChange({ ...config, preco: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Limite Participantes
          </label>
          <input
            type="number"
            placeholder="Ilimitado"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            value={config.limiteParticipantes || ''}
            onChange={(e: any) => onChange({ ...config, limiteParticipantes: parseInt(e.target.value) || undefined })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data de Expiração
        </label>
        <input
          type="datetime-local"
          className="w-full p-3 border rounded-xl"
          value={config.dataExpiracao || ''}
          onChange={(e: any) => onChange({ ...config, dataExpiracao: e.target.value })}
        />
      </div>
    </div>
  );
}

// --------------------------------------------
// GESTÃO DE PRÉMIOS
// --------------------------------------------
function Passo2Premios({ 
  config, 
  onChange 
}: { 
  config: ConfigRaspadinha; 
  onChange: (c: ConfigRaspadinha) => void;
}) {
  const addPremio = () => {
    const novoPremio: PremioRaspadinha = {
      id: Date.now().toString(),
      titulo: '',
      valor: 0,
      probabilidade: 10,
      simbolo: '⭐'
    };
    onChange({ ...config, premios: [...config.premios, novoPremio] });
  };

  const updatePremio = (id: string, updates: Partial<PremioRaspadinha>) => {
    onChange({
      ...config,
      premios: config.premios.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const removePremio = (id: string) => {
    onChange({ ...config, premios: config.premios.filter(p => p.id !== id) });
  };

  const probabilidadeTotal = config.premios.reduce((sum, p) => sum + p.probabilidade, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          Prémios
        </h3>
        <UIButton size="sm" onClick={addPremio}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </UIButton>
      </div>

      {/* Alerta de probabilidade */}
      {probabilidadeTotal > 100 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-700">Probabilidade total excede 100%</p>
            <p className="text-xs text-red-600">Atual: {probabilidadeTotal}%</p>
          </div>
        </div>
      )}

      {probabilidadeTotal <= 100 && probabilidadeTotal > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-700">Probabilidade válida</p>
            <p className="text-xs text-green-600">Total: {probabilidadeTotal}%</p>
          </div>
        </div>
      )}

      {config.premios.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Nenhum prémio definido</p>
          <p className="text-xs text-gray-400">Adicione pelo menos um prémio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {config.premios.map((premio, index) => (
            <motion.div
              key={premio.id}
              layout
              className="bg-white border rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="Título do prémio"
                      value={premio.titulo}
                      onChange={(e: any) => updatePremio(premio.id, { titulo: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="Valor (€)"
                      value={premio.valor || ''}
                      onChange={(e: any) => updatePremio(premio.id, { valor: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Probabilidade %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                        value={premio.probabilidade}
                        onChange={(e: any) => updatePremio(premio.id, { probabilidade: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Símbolo</label>
                      <select
                        className="p-2 border rounded-lg bg-white"
                        value={premio.simbolo}
                        onChange={(e) => updatePremio(premio.id, { simbolo: e.target.value })}
                      >
                        {config.simbolos.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removePremio(premio.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------
// PERSONALIZAÇÃO VISUAL
// --------------------------------------------
function Passo3Personalizacao({ 
  config, 
  onChange 
}: { 
  config: ConfigRaspadinha; 
  onChange: (c: ConfigRaspadinha) => void;
}) {
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Handler para upload de imagem (simulado - em produção seria API)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: 'festa' | 'simbolo', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(tipo + (index?.toString() || ''));

    // Simular upload - criar URL local
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      if (tipo === 'festa') {
        onChange({ ...config, imagemFesta: imageUrl });
      } else if (tipo !== null && index !== undefined) {
        // Atualizar imagem do símbolo
        const novasImagens = [...(config.imagens || [])];
        // Garantir que o array tem tamanho suficiente
        while (novasImagens.length <= index) {
          novasImagens.push('');
        }
        novasImagens[index] = imageUrl;
        onChange({ ...config, imagens: novasImagens });
      }
      setUploadingImage(null);
    };
    reader.readAsDataURL(file);
  };

  const toggleUsarImagens = () => {
    onChange({ ...config, usarImagens: !config.usarImagens });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-500" />
        Personalização
      </h3>

      {/* Toggle usar imagens vs emojis */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.usarImagens ? 'bg-purple-500' : 'bg-gray-300'}`}>
              {config.usarImagens ? <ImageIcon className="w-6 h-6 text-white" /> : <span className="text-2xl">⭐</span>}
            </div>
            <div>
              <p className="font-bold text-gray-800">Usar Imagens</p>
              <p className="text-xs text-gray-500">Substituir emojis por imagens personalizadas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleUsarImagens}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.usarImagens ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.usarImagens ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </label>
      </div>

      {/* Imagem da festa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎉 Imagem da Festa
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 transition-colors">
          {config.imagemFesta ? (
            <div className="relative inline-block">
              <img 
                src={config.imagemFesta} 
                alt="Festa" 
                className="w-32 h-32 object-cover rounded-xl mx-auto border-4 border-purple-300"
              />
              <button
                onClick={() => onChange({ ...config, imagemFesta: undefined })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'festa')}
                disabled={uploadingImage === 'festa'}
              />
              <div className="py-4">
                {uploadingImage === 'festa' ? (
                  <RefreshCw className="w-8 h-8 text-purple-500 mx-auto animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Carregar imagem da festa
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG até 5MB
                    </p>
                  </>
                )}
              </div>
            </label>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Esta imagem aparece no header e nas instruções do jogo
        </p>
      </div>

      {/* Cores predefinidas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tema de Cores
        </label>
        <div className="grid grid-cols-5 gap-2">
          {CORES_PREDEFINIDAS.map((cor, i) => (
            <button
              key={i}
              onClick={() => onChange({
                ...config,
                cores: { primario: cor.primario, secundario: cor.secundario, premio: cor.premio }
              })}
              className={`h-10 rounded-lg transition-all ${
                config.cores.primario === cor.primario 
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                  : 'hover:scale-105'
              }`}
              style={{ background: `linear-gradient(135deg, ${cor.primario}, ${cor.secundario})` }}
              title={cor.nome}
            />
          ))}
        </div>
      </div>

      {/* Símbolos/Imagens */}
      {config.usarImagens ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagens dos Símbolos
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Carregue uma imagem para cada símbolo (mínimo 3)
          </p>
          <div className="grid grid-cols-3 gap-3">
            {config.simbolos.map((simbolo, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-3 text-center">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'simbolo', index)}
                    disabled={uploadingImage === `simbolo${index}`}
                  />
                  <div className="w-full aspect-square bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden mb-2">
                    {config.imagens && config.imagens[index] ? (
                      <img 
                        src={config.imagens[index]} 
                        alt={`Símbolo ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : uploadingImage === `simbolo${index}` ? (
                      <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{simbolo}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Símbolos do Jogo
          </label>
          <div className="flex flex-wrap gap-2">
            {SIMBOLOS_PREDEFINIDOS.map((simbolo) => (
              <button
                key={simbolo}
                onClick={() => {
                  if (!config.simbolos.includes(simbolo)) {
                    onChange({ ...config, simbolos: [...config.simbolos, simbolo] });
                  }
                }}
                disabled={config.simbolos.includes(simbolo)}
                className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                  config.simbolos.includes(simbolo)
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {simbolo}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Símbolos selecionados: {config.simbolos.join(' ')}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface CriarRaspadinhaProps {
  onSave: (config: ConfigRaspadinha) => Promise<void>;
  onPreview?: () => void;
  initialConfig?: ConfigRaspadinha;
}

export function CriarRaspadinha({ 
  onSave, 
  onPreview,
  initialConfig 
}: CriarRaspadinhaProps) {
  const [passo, setPasso] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [config, setConfig] = useState<ConfigRaspadinha>(initialConfig || {
    titulo: '',
    descricao: '',
    preco: 1.00,
    limiteParticipantes: undefined,
    dataExpiracao: '',
    premios: [],
    simbolos: ['⭐', '💰', '🎁', '🍀', '🔥', '💎'],
    imagens: [],
    imagemFesta: undefined,
    usarImagens: false,
    cores: CORES_PREDEFINIDAS[0]
  });

  const validarPasso = () => {
    switch (passo) {
      case 1:
        return config.titulo.trim() && config.preco > 0;
      case 2:
        return config.premios.length > 0 && 
               config.premios.every(p => p.titulo.trim() && p.valor > 0);
      case 3:
        return config.simbolos.length >= 3;
      default:
        return true;
    }
  };

  const handleSave = async () => {
    if (!validarPasso()) return;
    
    setLoading(true);
    try {
      await onSave(config);
    } catch (error) {
      console.error('Erro ao guardar:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulário */}
        <div>
          {/* Progresso */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((p) => (
              <React.Fragment key={p}>
                <button
                  onClick={() => setPasso(p)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    passo === p 
                      ? 'bg-purple-600 text-white' 
                      : passo > p 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {p}
                </button>
                {p < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${p < passo ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <UICard className="p-6">
            <AnimatePresence mode="wait">
              {passo === 1 && (
                <motion.div
                  key="passo1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Passo1Dados config={config} onChange={setConfig} />
                </motion.div>
              )}
              
              {passo === 2 && (
                <motion.div
                  key="passo2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Passo2Premios config={config} onChange={setConfig} />
                </motion.div>
              )}
              
              {passo === 3 && (
                <motion.div
                  key="passo3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Passo3Personalizacao config={config} onChange={setConfig} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de navegação */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              {passo > 1 ? (
                <UIButton variant="outline" onClick={() => setPasso(passo - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                </UIButton>
              ) : (
                <div />
              )}
              
              {passo < 3 ? (
                <UIButton onClick={() => setPasso(passo + 1)} disabled={!validarPasso()}>
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </UIButton>
              ) : (
                <UIButton 
                  onClick={handleSave} 
                  disabled={!validarPasso() || loading}
                  style={{ background: config.cores.primario }}
                >
                  {loading ? 'A guardar...' : 'Criar Raspadinha'}
                </UIButton>
              )}
            </div>
          </UICard>
        </div>

        {/* Preview */}
        <div className="md:sticky md:top-4">
          <RaspadinhaPreview config={config} />
        </div>
      </div>
    </div>
  );
}
