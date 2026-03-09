/**
 * API: /api/jogos/raspadinha
 * Gestão de Raspadinhas
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
    const aldeiaId = searchParams.get('aldeiaId');
    const tipo = searchParams.get('tipo') || 'raspadinha';

    // Verificar permissão
    const where: any = { tipo };
    
    if (user.role === 'ALDEIA_ADMIN') {
      where.evento = { aldeiaId: user.aldeiaId };
    } else if (aldeiaId) {
      where.evento = { aldeiaId };
    }

    const jogos = await db.jogo.findMany({
      where,
      include: {
        evento: {
          select: { id: true, nome: true, aldeiaId: true }
        },
        _count: {
          select: { participacoes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(jogos);
  } catch (error) {
    console.error('Erro ao listar raspadinhas:', error);
    return NextResponse.json({ error: 'Erro ao listar raspadinhas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar permissão (só admins e organizadores podem criar)
    if (!['SUPER_ADMIN', 'ALDEIA_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      eventoId,
      titulo,
      descricao,
      precoParticipacao,
      configRaspadinha, // { simbolos, premios, cores }
      stockInicial,
      limitePorUsuario
    } = body;

    if (!eventoId || !titulo || !precoParticipacao) {
      return NextResponse.json({
        error: 'Dados inválidos. É necessário eventoId, titulo e precoParticipacao.'
      }, { status: 400 });
    }

    // Criar jogo tipo raspadinha
    const jogo = await db.jogo.create({
      data: {
        eventoId,
        titulo,
        tipo: 'raspadinha',
        precoParticipacao,
        config: JSON.stringify(configRaspadinha || {}),
        stockInicial: stockInicial || 1000,
        limitePorUsuario: limitePorUsuario || 10,
        estado: 'ativo'
      }
    });

    // Se houver prémios definidos, criar na base de dados
    if (configRaspadinha?.premios) {
      for (const premio of configRaspadinha.premios) {
        await db.premio.create({
          data: {
            aldeiaId: user.aldeiaId || '',
            nome: premio.titulo,
            titulo: premio.titulo,
            descricao: `Prémio da raspadinha: ${premio.titulo}`,
            valor: premio.valor,
            valorEstimado: premio.valor,
            estado: 'disponivel',
            codigo: `RASP-${jogo.id}-${Date.now()}`,
            jogos: {
              connect: { id: jogo.id }
            }
          }
        });
      }
    }

    return NextResponse.json(jogo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar raspadinha:', error);
    return NextResponse.json({ error: 'Erro ao criar raspadinha' }, { status: 500 });
  }
}
