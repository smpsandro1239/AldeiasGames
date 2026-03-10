import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const plano = await db.plano.update({
      where: { id },
      data: body
    });

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao editar plano:', error);
    return NextResponse.json({ error: 'Erro ao editar plano' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = params;

    await db.plano.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao apagar plano:', error);
    return NextResponse.json({ error: 'Erro ao apagar plano' }, { status: 500 });
  }
}
