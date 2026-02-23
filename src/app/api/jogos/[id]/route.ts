import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const jogo = await db.jogo.findUnique({
      where: { id },
      include: {
        evento: {
          include: { aldeia: true }
        },
        participacoes: {
          include: {
            user: {
              select: { id: true, nome: true, email: true }
            }
          }
        },
        sorteio: {
          include: {
            executor: {
              select: { id: true, nome: true }
            }
          }
        },
        _count: {
          select: { participacoes: true }
        }
      }
    });

    if (!jogo) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...jogo,
      config: JSON.parse(jogo.config)
    });
  } catch (error) {
    console.error('Erro ao buscar jogo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar jogo' },
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
    const { estado } = body;

    const jogo = await db.jogo.update({
      where: { id },
      data: { estado }
    });

    return NextResponse.json(jogo);
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar jogo' },
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
    
    await db.jogo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar jogo:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar jogo' },
      { status: 500 }
    );
  }
}
