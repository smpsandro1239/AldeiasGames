/**
 * Aldeias Games 2026 - Central Types System
 */

// Enums
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'CLIENTE';
export type TipoOrg = 'aldeia' | 'escola' | 'associacao_pais' | 'clube';
export type TipoJogo = 'POIO_VACA' | 'RIFA' | 'RASPADINHA' | 'TOMBOLA';
export type EstadoJogo = 'ativo' | 'suspenso' | 'concluido';

// Core Entities
export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  password?: string;
  aldeiaId?: string;
  aldeia?: Aldeia;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Aldeia {
  id: string;
  nome: string;
  slug: string;
  tipoOrganizacao: TipoOrg;
  descricao?: string;
  localizacao?: string;
  logoUrl?: string;
  verificada: boolean;

  // Custom Fields for Schools/Orgs
  nomeEscola?: string;
  codigoEscola?: string;
  nivelEnsino?: string;
  responsavel?: string;
  contactoResponsavel?: string;

  // Address/Legal
  morada?: string;
  codigoPostal?: string;
  localidade?: string;
  autorizacaoCM?: boolean;
  dataAutorizacaoCM?: string;
  documentoAutorizacao?: string;
  numeroAlvara?: string;

  _count?: {
    eventos: number;
    users: number;
    premios: number;
  };
  createdAt: string;
}

export interface Evento {
  id: string;
  aldeiaId: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  estado: 'ativo' | 'concluido' | 'urgente';
  banner?: string;
  objectivoAngariacao?: number;
  slug: string;
  ativo: boolean;
  aldeia?: Aldeia;
  jogos?: Jogo[];
  _count?: {
    jogos: number;
    participacoes: number;
  };
}

export interface Jogo {
  id: string;
  eventoId: string;
  titulo: string;
  tipo: TipoJogo;
  configuracao: any;
  precoParticipacao: number;
  estado: EstadoJogo;
  premiosRaspadinha?: any;
  stockInicial?: number;
  stockRestante?: number;
  limitePorUsuario?: number;
  evento?: Evento;
  participacoes?: Participacao[];
  sorteio?: Sorteio;
  _count?: {
    participacoes: number;
  };
  createdAt: string;
}

export interface Participacao {
  id: string;
  jogoId: string;
  userId: string;
  valorPago: number;
  dadosParticipacao: any;
  metodoPagamento: 'mbway' | 'dinheiro' | 'stripe';
  referencia: string;
  estado: 'pendente' | 'pago' | 'cancelado';
  telefoneMbway?: string;
  revelada: boolean;
  ganhou: boolean;
  premio?: string;

  // Client identification for sales by vendors
  adminRegistouId?: string;
  nomeCliente?: string;
  telefoneCliente?: string;
  emailCliente?: string;

  // Fairness auditing
  numeroCartao?: number;
  seed?: string;
  hash?: string;

  jogo?: Jogo;
  user?: User;
  createdAt: string;
}

export interface Sorteio {
  id: string;
  jogoId: string;
  resultado: any;
  seed: string;
  hash: string;
  realizadoPorId: string;
  realizadoPor?: User;
  createdAt: string;
}

export interface Notificacao {
  id: string;
  userId: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  createdAt: string;
}

// UI & API Types
export interface DashboardStats {
  volumeGlobal?: string;
  totalAngariado: number;
  participantesCount: number;
  vendasHoje?: number;
  clientesHoje?: number;
  comissao?: number;
  crescimento?: number;
  ticketMedio?: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
