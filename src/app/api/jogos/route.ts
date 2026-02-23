import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get('eventoId');
    
    const where = eventoId ? { eventoId } : {};
    
    const jogos = await db.jogo.findMany({
      where,
      include: {
        evento: {
          include: {
            aldeia: {
              select: { 
                id: true, 
                nome: true,
                tipoOrganizacao: true,
                autorizacaoCM: true,
                dataAutorizacaoCM: true,
                numeroAlvara: true,
                responsavel: true
              }
            }
          }
        },
        premio: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            valorEstimado: true,
            imagemBase64: true,
            patrocinador: true
          }
        },
        _count: {
          select: { participacoes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Processar jogos para incluir campos de raspadinha
    const jogosProcessados = jogos.map(jogo => ({
      ...jogo,
      premiosRaspadinha: jogo.premiosRaspadinha ? JSON.parse(jogo.premiosRaspadinha) : null,
    }));

    return NextResponse.json(jogosProcessados);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      eventoId, 
      tipo, 
      config, 
      precoParticipacao, 
      premioId,
      // Raspadinha fields
      stockInicial,
      premiosRaspadinha,
      imagemCapa,
      limitePorUsuario
    } = body;

    if (!eventoId || !tipo || precoParticipacao === undefined) {
      return NextResponse.json(
        { error: 'Evento, tipo e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar config baseado no tipo
    if (tipo === 'poio_vaca') {
      const configObj = typeof config === 'string' ? JSON.parse(config) : config;
      if (!configObj?.linhas || !configObj?.colunas) {
        return NextResponse.json(
          { error: 'Poio da Vaca requer linhas e colunas' },
          { status: 400 }
        );
      }
    } else if (tipo === 'rifa' || tipo === 'tombola') {
      const configObj = typeof config === 'string' ? JSON.parse(config) : config;
      if (!configObj?.totalBilhetes) {
        return NextResponse.json(
          { error: 'Rifa/Tombola requer total de bilhetes' },
          { status: 400 }
        );
      }
    } else if (tipo === 'raspadinha') {
      if (!stockInicial || stockInicial < 1) {
        return NextResponse.json(
          { error: 'Raspadinha requer stock inicial válido' },
          { status: 400 }
        );
      }
      if (!premiosRaspadinha || !Array.isArray(premiosRaspadinha)) {
        return NextResponse.json(
          { error: 'Raspadinha requer configuração de prémios' },
          { status: 400 }
        );
      }
    }

    const jogo = await db.jogo.create({
      data: {
        eventoId,
        tipo,
        config: typeof config === 'string' ? config : JSON.stringify(config || {}),
        precoParticipacao,
        estado: 'ativo',
        premioId: premioId || null,
        // Raspadinha fields
        stockInicial: tipo === 'raspadinha' ? stockInicial : null,
        stockRestante: tipo === 'raspadinha' ? stockInicial : null,
        premiosRaspadinha: tipo === 'raspadinha' ? JSON.stringify(premiosRaspadinha) : null,
        imagemCapa: tipo === 'raspadinha' ? imagemCapa : null,
        limitePorUsuario: tipo === 'raspadinha' ? limitePorUsuario : null,
      },
      include: {
        evento: {
          include: { aldeia: true }
        },
        premio: true,
        _count: {
          select: { participacoes: true }
        }
      }
    });

    return NextResponse.json(jogo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar jogo: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
