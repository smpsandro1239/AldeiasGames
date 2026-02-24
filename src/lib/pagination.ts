import { NextResponse } from 'next/server';

export interface PaginacaoParams {
  pagina: number;
  limite: number;
  skip: number;
}

export interface PaginacaoInfo {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

/**
 * Extrai parametros de paginacao do URL de forma segura.
 */
export function getPaginacaoParams(searchParams: URLSearchParams): PaginacaoParams {
  const pagina = Math.max(1, parseInt(searchParams.get('pagina') || '1'));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get('limite') || '20')));
  const skip = (pagina - 1) * limite;
  return { pagina, limite, skip };
}

/**
 * Constroi resposta paginada padrao.
 */
export function respostaPaginada<T>(dados: T[], total: number, params: PaginacaoParams) {
  return NextResponse.json({
    dados,
    paginacao: {
      pagina: params.pagina,
      limite: params.limite,
      total,
      totalPaginas: Math.ceil(total / params.limite),
    },
  });
}
