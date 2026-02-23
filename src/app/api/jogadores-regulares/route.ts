import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Listar jogadores regulares
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar todos os jogadores com suas participações
    const participacoes = await db.participacao.findMany({
      where: {
        // Filtrar por aldeia se não for super_admin
        jogo: {
          evento: {
            aldeiaId: user.role === 'super_admin' ? undefined : user.aldeiaId
          }
        }
      },
      include: {
        user: {
          select: { id: true, nome: true, email: true }
        },
        jogo: {
          include: {
            evento: {
              select: { nome: true, aldeiaId: true }
            }
          }
        }
      }
    });

    // Agrupar por cliente (user ou nomeCliente)
    const jogadoresMap = new Map<string, {
      id: string;
      nome: string;
      email?: string;
      telefone?: string;
      totalParticipacoes: number;
      totalGasto: number;
      jogos: Set<string>;
      ultimoJogo: Date | null;
    }>();

    participacoes.forEach(p => {
      // Se tem nomeCliente, é um cliente registado por admin
      const key = p.nomeCliente || p.user?.id || 'unknown';
      const nome = p.nomeCliente || p.user?.nome || 'Desconhecido';
      const email = p.emailCliente || p.user?.email;
      const telefone = p.telefoneCliente;

      if (!jogadoresMap.has(key)) {
        jogadoresMap.set(key, {
          id: key,
          nome,
          email,
          telefone,
          totalParticipacoes: 0,
          totalGasto: 0,
          jogos: new Set(),
          ultimoJogo: null
        });
      }

      const jogador = jogadoresMap.get(key)!;
      jogador.totalParticipacoes++;
      jogador.totalGasto += p.valorPago;
      if (p.jogo?.evento?.nome) {
        jogador.jogos.add(p.jogo.evento.nome);
      }
      const createdAt = new Date(p.createdAt);
      if (!jogador.ultimoJogo || createdAt > jogador.ultimoJogo) {
        jogador.ultimoJogo = createdAt;
      }
    });

    // Converter para array e ordenar por participações
    const jogadores = Array.from(jogadoresMap.values())
      .map(j => ({
        ...j,
        jogos: Array.from(j.jogos),
        ultimoJogo: j.ultimoJogo?.toISOString()
      }))
      .sort((a, b) => b.totalParticipacoes - a.totalParticipacoes);

    // Classificar como "regular" quem tem 3+ participações
    const jogadoresRegulares = jogadores.filter(j => j.totalParticipacoes >= 3);
    const novosJogadores = jogadores.filter(j => j.totalParticipacoes < 3);

    return NextResponse.json({
      total: jogadores.length,
      regulares: jogadoresRegulares,
      novos: novosJogadores,
      todos: jogadores
    });
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogadores' },
      { status: 500 }
    );
  }
}

// POST - Adicionar alerta para jogador regular
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jogadorId, tipoAlerta, mensagem } = body;

    // Por enquanto, apenas retornar sucesso
    // Em produção, salvar alerta na base de dados
    
    return NextResponse.json({
      success: true,
      message: 'Alerta registado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return NextResponse.json(
      { error: 'Erro ao criar alerta' },
      { status: 500 }
    );
  }
}
