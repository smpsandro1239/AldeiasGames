import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email e role são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o utilizador já existe
    let user = await db.user.findUnique({
      where: { email },
      include: { aldeia: true },
    });

    // Se não existir, criar utilizador de desenvolvimento
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          nome: getDevNameByRole(role),
          password: 'dev-login-hash', // Não é usado para login real
          role,
        },
        include: { aldeia: true },
      });
    }

    // Atualizar último login
    try {
      await db.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() }
      });
    } catch (e) {
      // Ignorar erro
    }

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
        aldeia: user.aldeia,
      },
      token,
    });
  } catch (error) {
    console.error('Erro no login de desenvolvimento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function getDevNameByRole(role: string): string {
  switch (role) {
    case 'super_admin':
      return 'Dev Super Admin';
    case 'aldeia_admin':
      return 'Dev Admin Aldeia';
    case 'vendedor':
      return 'Dev Vendedor';
    case 'user':
      return 'Dev Jogador';
    default:
      return 'Dev Utilizador';
  }
}
