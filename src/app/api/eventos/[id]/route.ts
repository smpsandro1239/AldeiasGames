import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const evento = await db.evento.findUnique({
      where: { id },
      include: {
        aldeia: true,
        jogos: {
          include: {
            _count: {
              select: { participacoes: true }
            }
          }
        }
      }
    });

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar evento' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { nome, descricao, dataInicio, dataFim, estado, imagemBase64 } = body;

    const evento = await db.evento.update({
      where: { id },
      data: {
        nome,
        descricao,
        dataInicio: dataInicio ? new Date(dataInicio) : undefined,
        dataFim: dataFim ? new Date(dataFim) : undefined,
        estado,
        imagemBase64,
      }
    });

    return NextResponse.json(evento);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar evento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    await db.evento.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar evento' },
      { status: 500 }
    );
  }
}
