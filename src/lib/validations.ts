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
