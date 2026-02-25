import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
});

export const participacaoSchema = z.object({
  jogoId: z.string().min(1),
  metodoPagamento: z.enum(['mbway', 'dinheiro', 'stripe', 'pendente']),
  telefoneMbway: z.string().optional(),
  valorPago: z.number().positive(),
  dadosParticipacao: z.any(),
  adminParaCliente: z.boolean().optional(),
  nomeCliente: z.string().optional(),
  telefoneCliente: z.string().optional(),
  emailCliente: z.string().optional(),
});

export const raspadinhaBatchSchema = z.object({
  jogoId: z.string().min(1, 'ID do jogo é obrigatório'),
  quantidadeCartoes: z.number().int().min(1).max(50),
  metodoPagamento: z.enum(['mbway', 'dinheiro', 'stripe']),
  telefoneMbway: z.string().optional(),
  adminParaCliente: z.boolean().optional(),
  nomeCliente: z.string().optional(),
  telefoneCliente: z.string().optional(),
  emailCliente: z.string().optional(),
});

export const aldeiaSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  localizacao: z.string().optional(),
  logoBase64: z.string().optional(),
  tipoOrganizacao: z.enum(['aldeia', 'escola', 'associacao_pais', 'clube']).default('aldeia'),
  slug: z.string().optional(),
});

export const eventoSchema = z.object({
  aldeiaId: z.string().min(1),
  nome: z.string().min(2),
  descricao: z.string().optional(),
  dataInicio: z.string().or(z.date()),
  dataFim: z.string().or(z.date()).optional().nullable(),
  estado: z.string().default('agendado'),
  objectivoAngariacao: z.number().optional().nullable(),
});

export const jogoSchema = z.object({
  eventoId: z.string().min(1),
  tipo: z.string(),
  config: z.any(),
  precoParticipacao: z.number().positive(),
  premioId: z.string().optional().nullable(),
  stockInicial: z.number().optional().nullable(),
  premiosRaspadinha: z.any().optional().nullable(),
  limitePorUsuario: z.number().optional().nullable(),
});

export const premioSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  valorEstimado: z.number().optional(),
  imagemBase64: z.string().optional(),
  patrocinador: z.string().optional(),
  ordem: z.number().int().default(0),
  aldeiaId: z.string().optional(),
});

export const userUpdateSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  notificacoesEmail: z.boolean().optional(),
});

export const wizardSchema = z.object({
  morada: z.string().min(5),
  codigoPostal: z.string().regex(/^\d{4}-\d{3}$/, 'CP Inválido (0000-000)'),
  localidade: z.string().min(2),
  autorizacaoCM: z.boolean().refine(v => v === true, 'Deve confirmar autorização'),
});

export const notificacaoSchema = z.object({
  userId: z.string().min(1),
  titulo: z.string().min(3),
  mensagem: z.string().min(5),
  tipo: z.string().default('info'),
});

export const sorteioSchema = z.object({
  jogoId: z.string().min(1),
  seed: z.string().min(32),
});

export const registerSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
  telefone: z.string().optional(),
});

export function validateParticipacao(data: any) {
  const result = participacaoSchema.safeParse(data);
  return {
    success: result.success,
    error: result.error?.message || 'Erro de validação',
    data: result.data
  };
}
