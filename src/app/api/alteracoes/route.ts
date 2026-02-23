import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Listar todas as alterações (super_admin) ou da aldeia (aldeia_admin)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Token não fornecido ou inválido' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.id }
    });

    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Apenas administradores podem ver alterações' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtros
    let where: any = {};

    if (user.role === 'aldeia_admin') {
      // Filtrar por aldeia do admin
      where.participacao = {
        jogo: {
          evento: {
            aldeiaId: user.aldeiaId
          }
        }
      };
    }

    // Buscar alterações
    const [alteracoes, total] = await Promise.all([
      db.alteracaoParticipacao.findMany({
        where,
        include: {
          admin: { select: { id: true, nome: true, email: true, role: true } },
          jogador: { select: { id: true, nome: true, email: true } },
          participacao: {
            select: {
              id: true,
              dadosParticipacao: true,
              jogo: {
                select: {
                  id: true,
                  tipo: true,
                  evento: {
                    select: {
                      id: true,
                      nome: true,
                      aldeia: { select: { id: true, nome: true } }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.alteracaoParticipacao.count({ where })
    ]);

    // Formatar resposta
    const alteracoesFormatadas = alteracoes.map(alt => ({
      id: alt.id,
      campo: alt.campoAlterado,
      valorAnterior: safeParseJSON(alt.valorAnterior),
      valorNovo: safeParseJSON(alt.valorNovo),
      motivo: alt.motivo,
      admin: alt.admin,
      jogador: alt.jogador,
      participacao: {
        id: alt.participacao.id,
        dados: safeParseJSON(alt.participacao.dadosParticipacao),
        jogo: alt.participacao.jogo
      },
      ipUtilizador: alt.ipUtilizador,
      notificadoJogador: alt.notificadoJogador,
      notificadoAdmins: alt.notificadoAdmins,
      createdAt: alt.createdAt
    }));

    return NextResponse.json({
      alteracoes: alteracoesFormatadas,
      paginacao: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar alterações:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

function safeParseJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
