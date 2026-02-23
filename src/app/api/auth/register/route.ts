import { NextResponse } from 'next/server';
import { registerUser, createToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, password, role = 'user', aldeiaId, tipoOrganizacao = 'aldeia' } = body;

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e password são obrigatórios' },
        { status: 400 }
      );
    }

    // Se o role é aldeia_admin e não há aldeiaId, criar organização automaticamente
    let finalAldeiaId = aldeiaId;
    let newOrganization = null;
    
    if (role === 'aldeia_admin' && !aldeiaId) {
      // Gerar slug único baseado no nome
      const baseSlug = nome.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Verificar se slug já existe e adicionar sufixo se necessário
      let slug = baseSlug;
      let counter = 1;
      while (await db.aldeia.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Criar a organização
      const aldeia = await db.aldeia.create({
        data: {
          nome,
          tipoOrganizacao,
          slug,
          // Campos específicos para escolas
          ...(tipoOrganizacao === 'escola' && {
            nomeEscola: nome,
          }),
        },
      });
      finalAldeiaId = aldeia.id;
      newOrganization = {
        id: aldeia.id,
        nome: aldeia.nome,
        tipoOrganizacao: aldeia.tipoOrganizacao,
        slug: aldeia.slug,
      };
    }

    const user = await registerUser(nome, email, password, role, finalAldeiaId);
    
    const token = await createToken({
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      aldeiaId: user.aldeiaId || undefined,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        aldeiaId: user.aldeiaId,
      },
      token,
      isNewOrganization: !!newOrganization,
      organizacao: newOrganization,
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já registrado' },
        { status: 409 }
      );
    }
    console.error('Erro ao registrar:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
