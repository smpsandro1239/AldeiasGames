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

    // SuperAdmin pode ver todos os jogos
    // OrgAdmin só vê jogos da sua org
    // Vendedor só vê jogos da sua org
    const where = user.role === 'SUPERADMIN' 
      ? {}
      : { organizacaoId: user.orgId }

    const jogos = await prisma.jogo.findMany({
      where,
      include: {
        organizacao: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: jogos
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

    // Só OrgAdmin e SuperAdmin podem criar jogos
    if (!['ORG_ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar input
    const requiredFields = ['nome', 'tipo', 'configuracao']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo '${field}' é obrigatório` },
          { status: 400 }
        )
      }
    }

    // Criar jogo
    const jogo = await prisma.jogo.create({
      data: {
        nome: body.nome,
        tipo: body.tipo,
        descricao: body.descricao,
        configuracao: body.configuracao,
        organizacaoId: user.orgId
      },
      include: {
        organizacao: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: jogo
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