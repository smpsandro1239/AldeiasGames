import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { valor, metodoPagamento, comprovativo } = body

    const valorNum = parseFloat(valor)

    // Validações
    if (!valorNum || valorNum <= 0 || valorNum > 10000) {
      return NextResponse.json(
        { error: 'Valor inválido (deve ser positivo e máximo 10000€)' },
        { status: 400 }
      )
    }

    if (!metodoPagamento) {
      return NextResponse.json(
        { error: 'Método de pagamento obrigatório' },
        { status: 400 }
      )
    }

    const metodosValidos = ['MBWAY', 'DINHEIRO', 'MULTIBANCO']
    if (!metodosValidos.includes(metodoPagamento)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    const player = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Criar recarga
    const recarga = await prisma.recargaSaldo.create({
      data: {
        playerId: player.id,
        valor: valorNum,
        tipo: 'RECARGA',
        metodoPagamento: metodoPagamento,
        referencia: comprovativo || `RECARGA_${Date.now()}_${player.id}`,
        timestamp: new Date()
      }
    })

    // Atualizar saldo
    await prisma.user.update({
      where: { id: player.id },
      data: {
        saldo: {
          increment: valorNum
        }
      }
    })

    // Registrar no histórico de alterações
    await prisma.historicoAlteracao.create({
      data: {
        jogadaId: '', // sem jogada associada
        acao: 'RECARGA_SALDO',
        detalhes: JSON.stringify({
          playerId: player.id,
          valor: valorNum,
          metodoPagamento: metodoPagamento,
          recargaId: recarga.id
        })
      }
    })

    // Criar registro de auditoria
    await prisma.auditLog.create({
      data: {
        userId: player.id,
        acao: 'RECARGA_SALDO',
        recurso: 'saldo',
        detalhes: JSON.stringify({
          valor: valorNum,
          metodoPagamento: metodoPagamento,
          recargaId: recarga.id,
          saldoAnterior: player.saldo,
          saldoNovo: player.saldo + valorNum
        }),
        severity: 'INFO'
      }
    })

    // Enviar notificação (opcional)
    // await sendNotification(player.id, 'RECARGA_SALDO', `Recarga de ${valorNum}€ concluída`)

    return NextResponse.json({
      success: true,
      data: {
        recargaId: recarga.id,
        valor: valorNum,
        metodoPagamento: metodoPagamento,
        saldoAnterior: player.saldo,
        saldoAtual: player.saldo + valorNum,
        timestamp: recarga.timestamp
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao recarregar saldo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar histórico de recargas
    const recargas = await prisma.recargaSaldo.findMany({
      where: {
        playerId: session.user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    })

    return NextResponse.json({
      success: true,
      data: recargas
    })
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}