import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Histórico de alterações de uma participação
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Token não fornecido ou inválido' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 401 });
    }

    const participacaoId = params.id;

    // Buscar participação
    const participacao = await db.participacao.findUnique({
      where: { id: participacaoId },
      include: {
        jogo: { include: { evento: { include: { aldeia: true } } } },
        user: true
      }
    });

    if (!participacao) {
      return NextResponse.json({ error: 'Participação não encontrada' }, { status: 404 });
    }

    // Verificar permissões
    // - O próprio jogador pode ver
    // - Admins da aldeia podem ver
    // - Super admins podem ver
    const isOwner = user.id === participacao.userId;
    const isAldeiaAdmin = user.role === 'aldeia_admin' && 
                          user.aldeiaId === participacao.jogo.evento.aldeiaId;
    const isSuperAdmin = user.role === 'super_admin';

    if (!isOwner && !isAldeiaAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Sem permissão para ver este histórico' }, { status: 403 });
    }

    // Buscar histórico de alterações
    const alteracoes = await db.alteracaoParticipacao.findMany({
      where: { participacaoId },
      include: {
        admin: { select: { id: true, nome: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatar histórico
    const historico = alteracoes.map(alt => {
      let valorAnteriorFormatado = alt.valorAnterior;
      let valorNovoFormatado = alt.valorNovo;

      // Tentar fazer parse do JSON para melhor visualização
      try {
        valorAnteriorFormatado = JSON.parse(alt.valorAnterior);
      } catch {}
      try {
        valorNovoFormatado = JSON.parse(alt.valorNovo);
      } catch {}

      return {
        id: alt.id,
        campo: alt.campoAlterado,
        valorAnterior: valorAnteriorFormatado,
        valorNovo: valorNovoFormatado,
        motivo: alt.motivo,
        admin: alt.admin,
        ipUtilizador: alt.ipUtilizador,
        notificadoJogador: alt.notificadoJogador,
        notificadoAdmins: alt.notificadoAdmins,
        createdAt: alt.createdAt
      };
    });

    return NextResponse.json({
      participacao: {
        id: participacao.id,
        dadosParticipacao: JSON.parse(participacao.dadosParticipacao),
        valorPago: participacao.valorPago,
        metodoPagamento: participacao.metodoPagamento,
        nomeCliente: participacao.nomeCliente,
        jogo: participacao.jogo,
        user: { id: participacao.user.id, nome: participacao.user.nome, email: participacao.user.email },
        createdAt: participacao.createdAt
      },
      historico,
      totalAlteracoes: alteracoes.length
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
