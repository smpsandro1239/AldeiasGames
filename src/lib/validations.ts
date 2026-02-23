import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A password deve ter pelo menos 6 caracteres'),
});

export const participacaoSchema = z.object({
  jogoId: z.string().min(1, 'ID do jogo é obrigatório'),
  metodoPagamento: z.enum(['mbway', 'dinheiro', 'pendente']),
  telefoneMbway: z.string().optional(),
  valorPago: z.number().positive('Valor deve ser positivo'),
  dadosParticipacao: z.record(z.any()),
  adminParaCliente: z.boolean().optional(),
  nomeCliente: z.string().optional(),
  telefoneCliente: z.string().optional(),
  emailCliente: z.string().optional(),
});

export const raspadinhaBatchSchema = z.object({
  jogoId: z.string().min(1, 'ID do jogo é obrigatório'),
  quantidadeCartoes: z.number().int().min(1).max(50),
  metodoPagamento: z.enum(['mbway', 'dinheiro']),
  telefoneMbway: z.string().optional(),
  adminParaCliente: z.boolean().optional(),
  nomeCliente: z.string().optional(),
  telefoneCliente: z.string().optional(),
  emailCliente: z.string().optional(),
});

export const aldeiaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  localizacao: z.string().optional(),
  logoBase64: z.string().optional(),
  tipoOrganizacao: z.enum(['aldeia', 'escola', 'associacao_pais', 'clube']).default('aldeia'),
  slug: z.string().optional(),
  nomeEscola: z.string().optional(),
  codigoEscola: z.string().optional(),
  nivelEnsino: z.string().optional(),
  responsavel: z.string().optional(),
  contactoResponsavel: z.string().optional(),
  morada: z.string().optional(),
  codigoPostal: z.string().optional(),
  localidade: z.string().optional(),
  autorizacaoCM: z.boolean().default(false),
  numeroAlvara: z.string().optional(),
});

export const eventoSchema = z.object({
  aldeiaId: z.string().min(1, 'ID da aldeia é obrigatório'),
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  dataInicio: z.string().or(z.date()),
  dataFim: z.string().or(z.date()).optional().nullable(),
  estado: z.string().default('agendado'),
  imagemBase64: z.string().optional(),
  objectivoAngariacao: z.number().optional().nullable(),
  slug: z.string().optional(),
});

export const jogoSchema = z.object({
  eventoId: z.string().min(1, 'ID do evento é obrigatório'),
  tipo: z.enum(['poio_vaca', 'rifa', 'tombola', 'raspadinha']),
  config: z.any(),
  precoParticipacao: z.number().positive('Preço deve ser positivo'),
  premioId: z.string().optional().nullable(),
  stockInicial: z.number().optional().nullable(),
  premiosRaspadinha: z.string().optional().nullable(), // JSON string
  limitePorUsuario: z.number().optional().nullable(),
});
