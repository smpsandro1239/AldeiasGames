import { NextResponse } from 'next/server';
import { loginUser, createToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await loginUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Atualizar último login
    try {
      await db.user.update({
        where: { id: user.id },
        data: { ultimoLogin: new Date() }
      });
    } catch (e) {
      // Ignorar erro se campo não existir
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
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
