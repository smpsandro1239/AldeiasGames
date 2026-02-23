import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const aldeiaId = searchParams.get('aldeiaId');
    
    const where = aldeiaId ? { aldeiaId } : {};
    
    const eventos = await db.evento.findMany({
      where,
      include: {
        aldeia: {
          select: { id: true, nome: true }
        },
        _count: {
          select: { jogos: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { aldeiaId, nome, descricao, dataInicio, dataFim, imagemBase64, estado } = body;

    // Verificar permissão
    if (user.role === 'aldeia_admin' && user.aldeiaId !== aldeiaId) {
      return NextResponse.json(
        { error: 'Não tem permissão para criar eventos nesta aldeia' },
        { status: 403 }
      );
    }

    if (!aldeiaId || !nome || !dataInicio) {
      return NextResponse.json(
        { error: 'Aldeia, nome e data de início são obrigatórios' },
        { status: 400 }
      );
    }

    const evento = await db.evento.create({
      data: {
        aldeiaId,
        nome,
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: dataFim ? new Date(dataFim) : null,
        estado: estado || 'agendado',
        imagemBase64,
      },
      include: {
        aldeia: true
      }
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
}
