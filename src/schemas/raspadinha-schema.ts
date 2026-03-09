/**
 * schemas.ts
 * Zod schemas para validação da Raspadinha
 */

import { z } from 'zod';

// --------------------------------------------
// Schema de Nível de Prémio
// --------------------------------------------
export const NivelPremioSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  valor: z.number().min(0, 'Valor deve ser positivo'),
  quantidade: z.number().int().min(0, 'Quantidade deve ser inteiro positivo'),
  percentual: z.number().min(0).max(100, 'Percentual entre 0 e 100'),
  simbolo: z.string().emoji('Símbolo deve ser um emoji'),
});

// --------------------------------------------
// Schema de Configuração da Raspadinha
// --------------------------------------------
export const ConfigRaspadinhaSchema = z.object({
  // Dados básicos
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
  eventoId: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  totalRaspadinhas: z.number().int().min(10, 'Mínimo 10 raspadinhas').max(100000, 'Máximo 100000'),
  precoPorRaspadinha: z.number().min(0.10, 'Mínimo €0.10').max(100, 'Máximo €100'),
  
  // Prémios
  premios: z.array(NivelPremioSchema).min(1, 'Pelo menos 1 prémio é necessário'),
  percentualSemPremio: z.number().min(0).max(100),
  
  // Campos calculados (não validados na entrada)
  receitaTotal: z.number().optional(),
  custoPremios: z.number().optional(),
  taxas: z.number().optional(),
  lucroLiquido: z.number().optional(),
  margemLucro: z.number().optional(),
  rentavel: z.boolean().optional(),
});

// --------------------------------------------
// Validador de Percentuais
// --------------------------------------------
export function validarPercentuais(premios: { percentual: number }[], percentualSemPremio: number): {
  valido: boolean;
  total: number;
  erro?: string;
} {
  const total = premios.reduce((sum, p) => sum + p.percentual, 0) + percentualSemPremio;
  
  if (Math.abs(total - 100) > 0.01) {
    return {
      valido: false,
      total,
      erro: `A soma dos percentuais (${total.toFixed(2)}%) deve ser exatamente 100%`
    };
  }
  
  return { valido: true, total };
}

// --------------------------------------------
// Validador de Rentabilidade
// --------------------------------------------
export function validarRentabilidade(config: {
  receitaTotal: number;
  custoPremios: number;
  taxas: number;
}): {
  valido: boolean;
  mensagem: string;
  gravidade: 'info' | 'warning' | 'error';
} {
  const lucro = config.receitaTotal - config.custoPremios - config.taxas;
  const margem = config.receitaTotal > 0 ? (lucro / config.receitaTotal) * 100 : 0;
  
  if (margem < 0) {
    return { valido: false, mensagem: 'Campanha com prejuízo!', gravidade: 'error' };
  }
  
  if (margem < 20) {
    return { valido: true, mensagem: 'Margem muito baixa. Considere ajustar.', gravidade: 'warning' };
  }
  
  if (margem < 40) {
    return { valido: true, mensagem: 'Margem aceitável.', gravidade: 'info' };
  }
  
  return { valido: true, mensagem: 'Excelente margem de lucro!', gravidade: 'info' };
}

// --------------------------------------------
// Tipos inferidos
// --------------------------------------------
export type ConfigRaspadinhaInput = z.infer<typeof ConfigRaspadinhaSchema>;
export type NivelPremioInput = z.infer<typeof NivelPremioSchema>;
