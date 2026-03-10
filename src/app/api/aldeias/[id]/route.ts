import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image } from '@/lib/storage';
import { aldeiaSchema } from '@/lib/validations';
import { ZodError } from 'zod';

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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;

    if (user.role !== 'super_admin' && user.aldeiaId !== id) {
      return NextResponse.json(
        { error: 'Não tem permissão para editar esta organização' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validatedData = aldeiaSchema.partial().parse(body);

    // Processar imagem
    let finalLogoUrl = body.logoUrl;
    if (body.logoBase64 && body.logoBase64.startsWith('data:image/')) {
      finalLogoUrl = await saveBase64Image(body.logoBase64);
    }

    const updateData: any = {
      nome: validatedData.nome,
      descricao: validatedData.descricao,
      localizacao: validatedData.localizacao,
      logoUrl: finalLogoUrl,
      logoBase64: null,
      morada: validatedData.morada,
      codigoPostal: validatedData.codigoPostal,
      localidade: validatedData.localidade,
      email: validatedData.email,
      telefone: validatedData.telefone,
      estado: validatedData.estado,
      slug: validatedData.slug,
      autorizacaoCM: validatedData.autorizacaoCM,
      numeroAlvara: validatedData.numeroAlvara,
    };

    // Filtro para remover undefined
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    const aldeia = await db.aldeia.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(aldeia);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Erro detalhado ao atualizar aldeia:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar aldeia',
        details: error.message,
        prismaError: error.code
      },
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
