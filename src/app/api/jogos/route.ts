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
                autorizacaoCM: true, dataAutorizacaoCM: true,
                numeroAlvara: true, responsavel: true
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
    console.error('Erro ao buscar jogos:', error);
    return NextResponse.json({ error: 'Erro ao buscar jogos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = jogoSchema.parse(body);

    const {
      tipo, config, stockInicial, premiosRaspadinha
    } = validatedData;

    // Validar config adicionalmente se necessário
    if (tipo === 'raspadinha') {
      if (!stockInicial || stockInicial < 1) {
        return NextResponse.json({ error: 'Raspadinha requer stock inicial válido' }, { status: 400 });
      }
    }

    const jogo = await db.jogo.create({
      data: {
        ...validatedData,
        config: typeof config === 'string' ? config : JSON.stringify(config || {}),
        estado: 'ativo',
        stockRestante: tipo === 'raspadinha' ? stockInicial : null,
        premiosRaspadinha: typeof premiosRaspadinha === 'string' ? premiosRaspadinha : JSON.stringify(premiosRaspadinha || null),
      },
      include: {
        evento: { include: { aldeia: true } },
        premio: true,
        _count: { select: { participacoes: true } }
      }
    });

    return NextResponse.json(jogo, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Erro ao criar jogo:', error);
    return NextResponse.json({ error: 'Erro ao criar jogo' }, { status: 500 });
  }
}
