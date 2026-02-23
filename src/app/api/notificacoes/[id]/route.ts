import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PATCH - Marcar notificação individual como lida
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacao = await db.notificacao.findUnique({
      where: { id }
    });

    if (!notificacao) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    if (notificacao.userId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const updated = await db.notificacao.update({
      where: { id },
      data: { lida: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Apagar notificação
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notificacao = await db.notificacao.findUnique({
      where: { id }
    });

    if (!notificacao) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    if (notificacao.userId !== user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    await db.notificacao.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao apagar notificação:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
