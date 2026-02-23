import { NextResponse } from 'next/server';
import { loginUser, createToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar com Zod
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

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
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Erro ao fazer login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
