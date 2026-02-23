import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Listar notificações do utilizador
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '50');
    const apenasNaoLidas = searchParams.get('naoLidas') === 'true';

    const where = { 
      userId: user.id,
      ...(apenasNaoLidas && { lida: false })
    };

    const notificacoes = await db.notificacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limite
    });

    // Contagem de não lidas
    const naoLidas = await db.notificacao.count({
      where: { userId: user.id, lida: false }
    });

    return NextResponse.json({
      notificacoes,
      naoLidas
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar notificação (apenas para admin/sistema)
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, tipo, titulo, mensagem, dados } = body;

    if (!userId || !tipo || !titulo || !mensagem) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const notificacao = await db.notificacao.create({
      data: {
        userId,
        tipo,
        titulo,
        mensagem,
        dados: dados ? JSON.stringify(dados) : null
      }
    });

    return NextResponse.json(notificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PATCH - Marcar todas como lidas
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await db.notificacao.updateMany({
      where: { 
        userId: user.id,
        lida: false 
      },
      data: { lida: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
