// @ts-nocheck
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image } from '@/lib/storage';
import { eventoSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const aldeiaId = searchParams.get('aldeiaId');
    
    // Verificar utilizador para filtrar por aldeia
    const currentUser = await getUserFromRequest(request);
    let userAldeiaId = aldeiaId;
    
    // Se é aldeia_admin e não forneceu aldeiaId, usar a sua aldeia
    if (!aldeiaId && currentUser?.role === 'aldeia_admin') {
      const user = await db.user.findUnique({ where: { id: currentUser.id } });
      userAldeiaId = user?.aldeiaId || null;
    }
    
    const where = userAldeiaId ? { aldeiaId: userAldeiaId } : {};
    
    const eventos = await db.evento.findMany({
      where,
      include: {
        aldeia: {
          select: { id: true, nome: true, slug: true }
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
    return NextResponse.json({ error: 'Erro ao buscar eventos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = eventoSchema.parse(body);

    if (user.role === 'aldeia_admin' && user.aldeiaId !== validatedData.aldeiaId) {
      return NextResponse.json({ error: 'Não tem permissão para esta aldeia' }, { status: 403 });
    }

    let finalImageUrl = (validatedData as any).imageUrl || null;
    if (validatedData.imagemBase64) {
      finalImageUrl = await saveBase64Image(validatedData.imagemBase64);
    }

    const tituloLower = (validatedData as any).nome || (validatedData as any).titulo || '';
    const generatedSlug = (validatedData as any).slug || (typeof tituloLower === 'string' ? tituloLower
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') : null);

    const evento = await db.evento.create({
      data: {
        aldeiaId: validatedData.aldeiaId,
        titulo: (validatedData as any).nome || (validatedData as any).titulo || '',
        descricao: (validatedData as any).descricao,
        dataInicio: new Date(validatedData.dataInicio),
        dataFim: validatedData.dataFim ? new Date(validatedData.dataFim) : undefined,
        estado: (validatedData as any).estado || 'ativo',
        objectivoAngariacao: (validatedData as any).objectivoAngariacao,
        imagemBase64: null,
        imageUrl: finalImageUrl,
        slug: generatedSlug,
        ativo: true,
      },
      include: { aldeia: true }
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 });
  }
}
