import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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
    return NextResponse.json(
      { error: 'Erro ao buscar aldeias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
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
      // === Expansão v3.0: Novos campos ===
      tipoOrganizacao = 'aldeia',
      slug,
      nomeEscola,
      codigoEscola,
      nivelEnsino,
      responsavel,
      contactoResponsavel,
      morada,
      codigoPostal,
      localidade,
      autorizacaoCM = false,
      numeroAlvara
    } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    // Validar campos específicos para escolas
    if (tipoOrganizacao === 'escola' && !nomeEscola) {
      return NextResponse.json(
        { error: 'Nome da escola é obrigatório para escolas' },
        { status: 400 }
      );
    }

    // Gerar slug automaticamente se não fornecido
    const generatedSlug = slug || nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Verificar se slug já existe
    const existingSlug = await db.aldeia.findUnique({
      where: { slug: generatedSlug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Já existe uma organização com este nome/slug' },
        { status: 400 }
      );
    }

    const aldeia = await db.aldeia.create({
      data: {
        nome,
        descricao,
        localizacao,
        logoUrl,
        logoBase64,
        // Novos campos
        tipoOrganizacao,
        slug: generatedSlug,
        nomeEscola,
        codigoEscola,
        nivelEnsino,
        responsavel,
        contactoResponsavel,
        morada,
        codigoPostal,
        localidade,
        autorizacaoCM,
        numeroAlvara,
      }
    });

    return NextResponse.json(aldeia, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    return NextResponse.json(
      { error: 'Erro ao criar organização' },
      { status: 500 }
    );
  }
}
