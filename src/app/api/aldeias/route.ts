import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image } from '@/lib/storage';
import { aldeiaSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    let aldeias;
    if (user?.role === 'super_admin') {
      aldeias = await db.aldeia.findMany({
        include: {
          _count: {
            select: { eventos: true, users: true, premios: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user?.role === 'aldeia_admin' && user.aldeiaId) {
      aldeias = await db.aldeia.findMany({
        where: { id: user.aldeiaId },
        include: {
          _count: {
            select: { eventos: true, users: true, premios: true }
          }
        }
      });
    } else {
      aldeias = await db.aldeia.findMany({
        where: { eventos: { some: { estado: 'ativo' } } },
        select: {
          id: true,
          nome: true,
          descricao: true,
          localizacao: true,
          logoUrl: true,
          logoBase64: true,
          tipoOrganizacao: true,
          slug: true,
        }
      });
    }

    return NextResponse.json(aldeias);
  } catch (error) {
    console.error('Erro ao buscar aldeias:', error);
    return NextResponse.json({ error: 'Erro ao buscar aldeias' }, { status: 500 });
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
      tipoOrganizacao,
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
    if (logoBase64) {
      finalLogoUrl = await saveBase64Image(logoBase64);
    }

    const aldeia = await db.aldeia.create({
      data: {
        ...validatedData,
        slug: generatedSlug,
        logoUrl: finalLogoUrl,
        // Mantemos logoBase64 vazio ou opcional para não encher a DB
        logoBase64: null
      }
    });

    return NextResponse.json(aldeia, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Erro ao criar organização:', error);
    return NextResponse.json({ error: 'Erro ao criar organização' }, { status: 500 });
  }
}
