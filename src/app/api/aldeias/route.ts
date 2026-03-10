import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image } from '@/lib/storage';
import { aldeiaSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const aldeias = await db.aldeia.findMany({
      include: {
        _count: {
          select: { eventos: true, users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(aldeias);
  } catch (error) {
    console.error('Erro ao buscar aldeias:', error);
    return NextResponse.json({ error: 'Erro ao buscar organizações' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = aldeiaSchema.parse(body);

    const {
      nome,
      logoBase64,
      slug,
      // ... rest of fields
    } = validatedData;

    // Gerar slug se não fornecido
    const generatedSlug = slug || nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Verificar se slug já existe
    const existingSlug = await db.aldeia.findUnique({
      where: { slug: generatedSlug }
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Já existe uma organização com este nome/slug' }, { status: 400 });
    }

    // Processar imagem se existir
    let finalLogoUrl = body.logoUrl || null;
    if (logoBase64 && logoBase64.startsWith('data:image/')) {
      finalLogoUrl = await saveBase64Image(logoBase64);
    }

    const createData: any = {
      ...validatedData,
      slug: generatedSlug,
      logoUrl: finalLogoUrl,
      logoBase64: null,
    };

    // Remover campos undefined
    Object.keys(createData).forEach(key =>
      createData[key] === undefined && delete createData[key]
    );

    const aldeia = await db.aldeia.create({
      data: createData
    });

    return NextResponse.json(aldeia, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Erro detalhado ao criar aldeia:', error);
    return NextResponse.json({
      error: 'Erro ao criar organização',
      details: error.message
    }, { status: 500 });
  }
}
