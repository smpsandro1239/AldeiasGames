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

    // Verificar se o utilizador existe
    const player = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Estrutura da requisição:
    // {
    //   "valor": 25.00,
    //   "metodoPagamento": "MBWAY" // ou "DINHEIRO"
    //   "comprovativo": "MBWAY_REFERENCE_123" (opcional)
    // }
    const body = await request.json()

    const valor = body.valor === undefined ? 0 : parseFloat(body.valor)
    const metodoPagamento = body.metodoPagamento || 'CASH' // default

    if (valor <= 0 || valor > 10000) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Atualizar o saldo do utilizador
    const updatedUser = await prisma.user.update({
      where: { id: player.id },
      data: {
        saldo: {
          increment: valor
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        saldo: true
      }
    })

    // Criar registro de recarga para auditoria
    await prisma.recargaSaldo.create({
      data: {
        playerId: player.id,
        valor: valor,
        tipo: 'RECARGA',
        metodoPagamento: metodoPagamento,
        referencia: `RECARGA_${Date.now()}_${player.id}`,
        timestamp: new Date()
      }
    })

    // Também registrar no histórico de alterações
    await prisma.historicoAlteracao.create({
      data: {
        jogadaId: '', // sem jogada associada
        acao: 'RECARGA_SALDO',
        detalhes: JSON.stringify({
          userId: player.id,
          valor: valor,
          metodoPagamento: metodoPagamento
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        saldoAnterior: player.saldo,
        saldoAtual: player.saldo + valor,
        recargaId: '', // pode ser preenchido mais tarde
        novoSaldo: player.saldo + valor
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar recarga de saldo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno' },
      { status: 500 }
    )
  }
}