import { NextResponse } from 'next/server';
import { getPaginacaoParams, respostaPaginada } from '@/lib/pagination';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { jogoSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');
    const where = eventoId ? { eventoId } : {};
    const paginacao = getPaginacaoParams(searchParams);
    const total = await db.jogo.count({ where });
    
    const jogos = await db.jogo.findMany({
      where,
      include: {
        evento: {
          include: {
            aldeia: {
              select: {
                id: true, nome: true, tipoOrganizacao: true,
                autorizacaoCM: true,
                numeroAlvara: true
              }
            }
          }
        },
        premio: true,
        _count: { select: { participacoes: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: paginacao.skip,
      take: paginacao.limite,
    });
    const jogosProcessados = jogos.map(jogo => ({
      ...jogo,
      premiosRaspadinha: jogo.premiosRaspadinha ? JSON.parse(jogo.premiosRaspadinha) : null,
    }));

    return respostaPaginada(jogosProcessados, total, paginacao);
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return NextResponse.json({ error: "Erro ao buscar jogos" }, { status: 500 });
  }
}
