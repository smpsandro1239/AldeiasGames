import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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
    const { verificada, motivoRejeicao } = body;

    // Verificar se a aldeia existe
    const aldeiaExistente = await db.aldeia.findUnique({
      where: { id }
    });

    if (!aldeiaExistente) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar estado de verificação
    const aldeia = await db.aldeia.update({
      where: { id },
      data: {
        verificada: verificada,
        // Poderia adicionar campo motivoRejeicao se existir na schema
      }
    });

    // TODO: Enviar email de notificação à organização

    return NextResponse.json({
      success: true,
      aldeia,
      mensagem: verificada 
        ? 'Organização verificada com sucesso' 
        : 'Organização rejeitada'
    });
  } catch (error) {
    console.error('Erro ao verificar organização:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar organização' },
      { status: 500 }
    );
  }
}
