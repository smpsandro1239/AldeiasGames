export interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  aldeiaId?: string;
  aldeia?: Aldeia;
}

export interface Jogo {
  id: string;
  eventoId: string;
  tipo: string;
  config: any;
  precoParticipacao: number;
  estado: string;
  createdAt: string;
  evento?: {
    id: string;
    nome: string;
    aldeiaId: string;
    aldeia?: { id: string; nome: string; localizacao?: string };
  };
  _count?: { participacoes: number };
  sorteio?: { resultado: any; createdAt: string };
  premio?: {
    id: string;
    nome: string;
    descricao?: string;
    valorEstimado?: number;
    imagemBase64?: string;
    patrocinador?: string;
  };
}

export interface Participacao {
  id: string;
  jogoId: string;
  userId: string;
  valorPago: number;
  dadosParticipacao: any;
  createdAt: string;
  jogo?: Jogo;
  nomeCliente?: string;
  telefoneCliente?: string;
  emailCliente?: string;
  adminRegistouId?: string;
}

export interface Aldeia {
  id: string;
  nome: string;
  descricao?: string;
  localizacao?: string;
  logoUrl?: string;
  logoBase64?: string;
  tipoOrganizacao?: string;
  slug?: string;
  nomeEscola?: string;
  codigoEscola?: string;
  nivelEnsino?: string;
  responsavel?: string;
  contactoResponsavel?: string;
  morada?: string;
  codigoPostal?: string;
  localidade?: string;
  autorizacaoCM?: boolean;
  dataAutorizacaoCM?: string;
  documentoAutorizacao?: string;
  numeroAlvara?: string;
  _count?: { eventos: number; users: number; premios: number };
}

export interface Evento {
  id: string;
  aldeiaId: string;
  nome: string;
  descricao?: string;
  dataInicio: string;
  dataFim?: string;
  estado: string;
  aldeia?: Aldeia;
  imagemBase64?: string;
  objectivoAngariacao?: number;
  slug?: string;
  ativo?: boolean;
  _count?: { jogos: number };
}
