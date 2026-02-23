import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PUT - Alterar ou Anular participação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getUserFromRequest(request);
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Token não fornecido ou inválido' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: adminUser.id }
    });

    if (!user || !['super_admin', 'aldeia_admin', 'vendedor'].includes(user.role)) {
      return NextResponse.json({ error: 'Sem permissão para alterar participações' }, { status: 403 });
    }

    const participacaoId = params.id;
    const body = await request.json();
    const { 
      campo, 
      valorNovo, 
      motivo, 
      novoNumero, 
      novaCoordenada, 
      novoNomeCliente, 
      novoMetodoPagamento,
      tipoAlteracao = 'trocar' // 'trocar' ou 'anular'
    } = body;

    // Buscar participação atual
    const participacao = await db.participacao.findUnique({
      where: { id: participacaoId },
      include: {
        jogo: {
          include: {
            evento: { include: { aldeia: true } },
            sorteio: true
          }
        },
        user: true
      }
    });

    if (!participacao) {
      return NextResponse.json({ error: 'Participação não encontrada' }, { status: 404 });
    }

    // Verificar se o sorteio já foi realizado
    if (participacao.jogo.sorteio) {
      return NextResponse.json({ 
        error: 'Não é possível alterar participação após o sorteio ter sido realizado' 
      }, { status: 400 });
    }

    // Verificar permissões baseadas no role
    const isSuperAdmin = user.role === 'super_admin';
    const isAldeiaAdmin = user.role === 'aldeia_admin';
    const isVendedor = user.role === 'vendedor';

    // Super admin pode tudo
    if (isAldeiaAdmin && user.aldeiaId !== participacao.jogo.evento.aldeiaId) {
      return NextResponse.json({ error: 'Sem permissão para alterar esta participação' }, { status: 403 });
    }

    // Vendedor só pode alterar participações que ele registou ou que ele próprio jogou
    if (isVendedor) {
      const isSeuRegisto = participacao.adminRegistouId === user.id;
      const isProprioJogo = participacao.userId === user.id;
      
      if (!isSeuRegisto && !isProprioJogo) {
        return NextResponse.json({ 
          error: 'Vendedores só podem alterar participações que registaram ou que jogaram pessoalmente' 
        }, { status: 403 });
      }
    }

    // Validar motivo obrigatório
    if (!motivo || motivo.trim().length < 3) {
      return NextResponse.json({ 
        error: 'O motivo da alteração é obrigatório (mínimo 3 caracteres)' 
      }, { status: 400 });
    }

    // Obter IP do utilizador
    const ipUtilizador = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 
                         'unknown';

    // Processar ANULAÇÃO (apagar participação)
    if (tipoAlteracao === 'anular') {
      // Guardar dados antes de apagar para o registo de alteração
      const valorAnterior = participacao.dadosParticipacao;
      const posicao = participacao.jogo.tipo === 'poio_vaca'
        ? `${participacao.dadosParticipacao.letra}${participacao.dadosParticipacao.numero}`
        : `Nº ${participacao.dadosParticipacao.numero}`;

      // Criar registo de alteração (participacaoId será null após apagar)
      await db.alteracaoParticipacao.create({
        data: {
          participacaoId: null, // Será null porque a participação vai ser apagada
          adminId: user.id,
          jogadorId: participacao.userId,
          campoAlterado: 'participacao',
          valorAnterior: valorAnterior,
          valorNovo: 'ANULADA',
          motivo: motivo.trim(),
          tipoAlteracao: 'anular',
          ipUtilizador: ipUtilizador as string,
          notificadoJogador: true,
          notificadoAdmins: true,
          dataNotificacaoJogador: new Date(),
          dataNotificacaoAdmins: new Date()
        }
      });

      // Apagar a participação
      await db.participacao.delete({
        where: { id: participacaoId }
      });

      return NextResponse.json({
        success: true,
        message: 'Participação anulada com sucesso',
        tipoAlteracao: 'anular',
        posicao: posicao,
        infoAdicional: `O número/coordenada ${posicao} está agora disponível para outros jogadores`
      });
    }

    // Processar TROCA (alteração normal)
    let valorAnterior = '';
    let valorNovoStr = '';
    let updateData: any = {};

    switch (campo) {
      case 'numero':
      case 'coordenada': {
        const novosDados = novoNumero 
          ? { numero: parseInt(novoNumero) } 
          : novaCoordenada;

        if (!novosDados) {
          return NextResponse.json({ error: 'Novo número/coordenada não fornecido' }, { status: 400 });
        }

        // Verificar se a nova posição está disponível
        const dadosStr = JSON.stringify(novosDados);
        const existente = await db.participacao.findFirst({
          where: { 
            jogoId: participacao.jogoId, 
            dadosParticipacao: dadosStr,
            id: { not: participacaoId }
          }
        });

        if (existente) {
          return NextResponse.json({ 
            error: 'A posição já está ocupada por outra participação' 
          }, { status: 400 });
        }

        valorAnterior = participacao.dadosParticipacao;
        valorNovoStr = dadosStr;
        updateData.dadosParticipacao = dadosStr;
        break;
      }

      case 'nomeCliente': {
        valorAnterior = participacao.nomeCliente || '';
        valorNovoStr = novoNomeCliente || '';
        updateData.nomeCliente = novoNomeCliente;
        break;
      }

      case 'metodoPagamento': {
        valorAnterior = participacao.metodoPagamento;
        valorNovoStr = novoMetodoPagamento;
        updateData.metodoPagamento = novoMetodoPagamento;
        break;
      }

      default:
        return NextResponse.json({ error: 'Campo não permitido para alteração' }, { status: 400 });
    }

    // Criar registo de alteração
    const alteracao = await db.alteracaoParticipacao.create({
      data: {
        participacaoId,
        adminId: user.id,
        jogadorId: participacao.userId,
        campoAlterado: campo,
        valorAnterior,
        valorNovo: valorNovoStr,
        motivo: motivo.trim(),
        tipoAlteracao: 'trocar',
        ipUtilizador: ipUtilizador as string,
      }
    });

    // Atualizar participação
    const participacaoAtualizada = await db.participacao.update({
      where: { id: participacaoId },
      data: updateData,
      include: {
        jogo: { include: { evento: { include: { aldeia: true } } } },
        user: true,
        alteracoes: {
          include: { admin: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Marcar como notificado
    await db.alteracaoParticipacao.update({
      where: { id: alteracao.id },
      data: {
        notificadoJogador: true,
        notificadoAdmins: true,
        dataNotificacaoJogador: new Date(),
        dataNotificacaoAdmins: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Participação alterada com sucesso',
      tipoAlteracao: 'trocar',
      participacao: participacaoAtualizada,
      alteracao: {
        id: alteracao.id,
        campo: campo,
        valorAnterior,
        valorNovo: valorNovoStr,
        motivo: motivo.trim(),
        admin: { id: user.id, nome: user.nome },
        createdAt: alteracao.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao alterar participação:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
