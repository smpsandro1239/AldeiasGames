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
    const { valor, paraUserId, motivo } = body

    if (!valor || !paraUserId) {
      return NextResponse.json(
        { error: 'Valor e ID do destinatário são obrigatórios' },
        { status: 400 }
      )
    }

    const valorNum = parseFloat(valor)
    if (valorNum <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser positivo' },
        { status: 400 }
      )
    }

    // Buscar remetente e destinatário
    const [remetente, destinatario] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.user.findUnique({ where: { id: paraUserId } })
    ])

    if (!remetente || !destinatario) {
      return NextResponse.json(
        { error: 'Utilizador não encontrado' },
        { status: 404 }
      )
    }

    // Verificar saldo suficiente
    if (remetente.saldo < valorNum) {
      return NextResponse.json(
        { error: 'Saldo insuficiente' },
        { status: 400 }
      )
    }

    // Iniciar transação
    const transferencia = await prisma.$transaction(async (tx) => {
      // Debitar remetente
      const updatedRemetente = await tx.user.update({
        where: { id: remetente.id },
        data: {
          saldo: { decrement: valorNum }
        }
      })

      // Creditar destinatário
      const updatedDestinatario = await tx.user.update({
        where: { id: destinatario.id },
        data: {
          saldo: { increment: valorNum }
        }
      })

      // Registrar transferência para auditoria
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          acao: 'TRANSFERENCIA_SALDO',
          recurso: 'saldo',
          detalhes: JSON.stringify({
            de: remetente.id,
            para: destinatario.id,
            valor: valorNum,
            motivo
          }),
          severity: 'INFO'
        }
      })

      return { updatedRemetente, updatedDestinatario }
    })

    return NextResponse.json({
      success: true,
      data: {
        saldoRemetente: transferencia.updatedRemetente.saldo,
        saldoDestinatario: transferencia.updatedDestinatario.saldo,
        valorTransferido: valorNum,
        para: destinatario.nome
      }
    })
  } catch (error) {
    console.error('Erro na transferência:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
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

    // Buscar histórico de transferências do utilizador
    const transferencias = await prisma.auditLog.findMany({
      where: {
        acao: 'TRANSFERENCIA_SALDO',
        userId: session.user.id
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      data: transferencias
    })
  } catch (error) {
    console.error('Erro ao buscar transferências:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}