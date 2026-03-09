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

    // Buscar participações ganhas
    const participacoesGanhas = await db.participacao.findMany({
      where: {
        userId: user.id,
        ganhou: true,
        premio: { not: null }
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

    return NextResponse.json({
      premios,
      participacoes: participacoesGanhas,
      totalPremios: premios.length,
      totalResgatados: premios.filter(p => p.dataResgate).length
    });
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return NextResponse.json({ error: 'Erro ao obter histórico' }, { status: 500 });
  }
}
