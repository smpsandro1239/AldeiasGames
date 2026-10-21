/**
 * API: /api/premios/historico
 * Histórico de prémios ganhos pelo utilizador
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado'); // todos, resgatados, pendentes

    // Buscar prémios resgatados pelo utilizador
    const where: any = {
      resgatadoPor: user.id
    };

    if (estado === 'pendentes') {
      where.dataResgate = null;
    } else if (estado === 'resgatados') {
      where.dataResgate = { not: null };
    }

    const premios = await db.premio.findMany({
      where,
      include: {
        aldeia: {
          select: {
            id: true,
            nome: true
          }
        },
        jogos: {
          select: {
            id: true,
            titulo: true
          }
        }
      },
      orderBy: {
        dataResgate: 'desc'
      }
    });

    // Buscar participações ganhas (resultado da raspadinha guardado em resultadoRaspe)
    // O campo `ganhou`/`premio` não existe no schema; o vencedor é determinado pelo
    // resultadoRaspe revelado (ver /api/participacoes/[id]/revelar).
    const participacoesGanhas = await db.participacao.findMany({
      where: {
        userId: user.id,
        estado: 'pago'
      },
      include: {
        jogo: {
          select: {
            id: true,
            titulo: true,
            tipo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filtrar apenas as que têm prémio atribuído no resultado da raspadinha
    const participacoesComPremio = participacoesGanhas.filter((participacao: any) => {
      try {
        const r = typeof participacao.resultadoRaspe === 'string'
          ? JSON.parse(participacao.resultadoRaspe)
          : participacao.resultadoRaspe;
        return r?.premio && r.premio.valor > 0;
      } catch {
        return false;
      }
    });

    return NextResponse.json({
      premios,
      participacoes: participacoesComPremio,
      totalPremios: premios.length,
      totalResgatados: premios.filter(p => p.dataResgate).length
    });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json({ error: 'Erro ao obter histórico' }, { status: 500 });
  }
}
