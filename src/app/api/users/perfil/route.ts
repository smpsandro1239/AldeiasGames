import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Obter perfil do utilizador
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        notificacoesEmail: true,
        ultimoLogin: true,
        aldeiaId: true,
        createdAt: true,
        aldeia: {
          select: { id: true, nome: true }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PATCH - Atualizar perfil do utilizador
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, notificacoesEmail } = body;

    // Validações básicas
    if (nome && nome.trim().length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
    }

    // Atualizar utilizador
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        nome: nome?.trim(),
        telefone: telefone?.trim() || null,
        notificacoesEmail: notificacoesEmail !== undefined ? notificacoesEmail : undefined,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        notificacoesEmail: true,
        ultimoLogin: true,
        aldeiaId: true,
        createdAt: true,
        aldeia: {
          select: { id: true, nome: true }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
