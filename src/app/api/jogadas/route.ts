import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await auth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Jogador pode ver as suas jogadas
    // OrgAdmin pode ver jogadas da sua org
    // SuperAdmin pode ver todas
    const where = user.role === 'PLAYER'
      ? { playerId: user.id }
      : user.role === 'ORG_ADMIN'
      ? { jogador: { orgId: user.orgId } }
      : {}

    const jogadas = await prisma.jogada.findMany({
      where,
      include: {
        jogador: {
          select: {
            nome: true,
            email: true
          }
        },
        jogo: {
          select: {
            nome: true,
            tipo: true
          }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: jogadas
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno',
        timestamp: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await auth()
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validação de input
    const requiredFields = ['jogoId', 'tipoJogo', 'detalhes', 'valor', 'metodoPagamento']
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Campo '${field}' é obrigatório` },
          { status: 400 }
        )
      }
    }

    // Verificar se o jogo existe e se o utilizador tem acesso
    const jogo = await prisma.jogo.findUnique({
      where: { id: body.jogoId },
      include: {
        organizacao: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!jogo) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    if (user.role !== 'SUPERADMIN' && user.orgId !== jogo.organizacaoId) {
      return NextResponse.json(
        { error: 'Não autorizado para este jogo' },
        { status: 403 }
      )
    }

    // Validar detalhes conforme tipo de jogo
    let detalhesValidados
    try {
      switch (body.tipoJogo) {
        case 'RIFA':
          if (!Array.isArray(body.detalhes.numeros) || body.detalhes.numeros.length < 1 || body.detalhes.numeros.length > 5) {
            throw new Error('Para Rifa: entre 1 e 5 números entre 1-200')
          }
          if (body.detalhes.numeros.some(n => n < 1 || n > 200)) {
            throw new Error('Números devem estar entre 1 e 200')
          }
          break
        
        case 'POIO':
          if (typeof body.detalhes.coordenadaX !== 'number' || typeof body.detalhes.coordenadaY !== 'number') {
            throw new Error('Para Poio: coordenadas X e Y obrigatórias')
          }
          if (body.detalhes.coordenadaX < 1 || body.detalhes.coordenadaX > 20 ||
              body.detalhes.coordenadaY < 1 || body.detalhes.coordenadaY > 20) {
            throw new Error('Coordenadas devem estar entre 1-20')
          }
          break
          
        case 'RASPADINHA':
          if (typeof body.detalhes.quantidade !== 'number' || body.detalhes.quantidade < 1 || body.detalhes.quantidade > 10) {
            throw new Error('Para Raspadinha: entre 1 e 10 unidades')
          }
          break
          
        default:
          throw new Error('Tipo de jogo inválido')
      }
      detalhesValidados = body.detalhes
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Validação inválida' },
        { status: 400 }
      )
    }

    // Verificar método de pagamento
    const metodosValidos = ['DINHEIRO', 'MBWAY_P2P', 'SALDO']
    if (!metodosValidos.includes(body.metodoPagamento)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Verificar saldo se for pagamento com saldo
    if (body.metodoPagamento === 'SALDO') {
      if (!user.saldo || user.saldo < body.valor) {
        return NextResponse.json(
          { error: 'Saldo insuficiente' },
          { status: 400 }
        )
      }
    }

    // Criar jogada
    const jogada = await prisma.jogada.create({
      data: {
        jogadorId: user.id,
        jogoId: body.jogoId,
        tipoJogo: body.tipoJogo,
        detalhes: detalhesValidados,
        valor: body.valor,
        statusJogada: 'PENDENTE',
        metodoPagamento: body.metodoPagamento
      },
      include: {
        jogador: {
          select: {
            nome: true,
            email: true
          }
        },
        jogo: {
          select: {
            nome: true,
            tipo: true
          }
        }
      }
    })

    // Se pagamento com saldo, decrementar
    if (body.metodoPagamento === 'SALDO') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          saldo: {
            decrement: body.valor
          }
        }
      })
    }

    // Criar comprovativo (se for dinheiro/MBWay)
    if (body.metodoPagamento === 'DINHEIRO' || body.metodoPagamento === 'MBWAY_P2P') {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          acao: 'VENDAS_CONFIRMADA',
          recurso: `jogadas/${jogada.id}`,
          detalhes: {
            jogoId: jogo.id,
            valor: body.valor,
            metodo: body.metodoPagamento
          },
          timestamp: new Date(),
          severity: 'INFO'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: jogada
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno',
        timestamp: new Date().toISOString() 
      },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método não permitido' },
    { status: 405 }
  );
}