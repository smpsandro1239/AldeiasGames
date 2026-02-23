import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const aldeia = await db.aldeia.findUnique({
      where: { id },
      include: {
        eventos: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        users: {
          where: { role: 'aldeia_admin' },
          select: { id: true, nome: true, email: true }
        },
        _count: {
          select: { eventos: true, users: true }
        }
      }
    });

    if (!aldeia) {
      return NextResponse.json(
        { error: 'Aldeia não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(aldeia);
  } catch (error) {
    console.error('Erro ao buscar aldeia:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar aldeia' },
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    // Verificar permissões: super_admin pode editar qualquer uma, aldeia_admin só a sua
    if (user.role !== 'super_admin' && user.aldeiaId !== id) {
      return NextResponse.json(
        { error: 'Não tem permissão para editar esta organização' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      nome, 
      descricao, 
      localizacao, 
      logoUrl, 
      logoBase64,
      // Novos campos v3.0
      morada,
      codigoPostal,
      localidade,
      responsavel,
      contactoResponsavel,
      nomeEscola,
      codigoEscola,
      nivelEnsino,
      autorizacaoCM,
      numeroAlvara,
    } = body;

    const aldeia = await db.aldeia.update({
      where: { id },
      data: {
        nome,
        descricao,
        localizacao,
        logoUrl,
        logoBase64,
        // Novos campos
        morada,
        codigoPostal,
        localidade,
        responsavel,
        contactoResponsavel,
        nomeEscola,
        codigoEscola,
        nivelEnsino,
        autorizacaoCM,
        numeroAlvara,
      }
    });

    return NextResponse.json(aldeia);
  } catch (error) {
    console.error('Erro ao atualizar aldeia:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar aldeia' },
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
    
    await db.aldeia.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar aldeia:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar aldeia' },
      { status: 500 }
    );
  }
}
