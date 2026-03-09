import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const plano = await db.plano.findUnique({
      where: { id }
    });

    if (!plano) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plano' },
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
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const plano = await db.plano.update({
      where: { id },
      data: body
    });

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar plano' },
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
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    await db.plano.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar plano' },
      { status: 500 }
    );
  }
}
