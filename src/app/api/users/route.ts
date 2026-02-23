import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hashPassword } from '@/lib/auth';

// GET - Listar utilizadores por aldeia (para aldeia_admin)
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const aldeiaId = searchParams.get('aldeiaId');
    const role = searchParams.get('role');

    // Super admin pode ver todos ou filtrar por aldeia
    if (user.role === 'super_admin') {
      const where: any = {};
      if (aldeiaId) where.aldeiaId = aldeiaId;
      if (role) where.role = role;

      const users = await db.user.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          aldeiaId: true,
          createdAt: true,
          aldeia: {
            select: { id: true, nome: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(users);
    }

    // Aldeia admin só pode ver utilizadores da sua aldeia
    if (user.role === 'aldeia_admin' && user.aldeiaId) {
      const where: any = { aldeiaId: user.aldeiaId };
      if (role) where.role = role;

      const users = await db.user.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          role: true,
          aldeiaId: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(users);
    }

    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo utilizador (vendedor) para a aldeia
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, email, password, role, aldeiaId } = body;

    // Validações
    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e password são obrigatórios' }, { status: 400 });
    }

    // Determinar aldeiaId
    let targetAldeiaId = aldeiaId;
    
    if (user.role === 'aldeia_admin') {
      // Aldeia admin só pode criar utilizadores para a sua aldeia
      targetAldeiaId = user.aldeiaId;
      if (!targetAldeiaId) {
        return NextResponse.json({ error: 'Utilizador não está associado a nenhuma aldeia' }, { status: 400 });
      }
    } else if (user.role === 'super_admin') {
      // Super admin pode criar para qualquer aldeia
      if (!targetAldeiaId) {
        return NextResponse.json({ error: 'Aldeia é obrigatória' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Sem permissão para criar utilizadores' }, { status: 403 });
    }

    // Verificar se email já existe
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
    }

    // Criar utilizador
    const passwordHash = await hashPassword(password);
    
    const newUser = await db.user.create({
      data: {
        nome,
        email,
        passwordHash,
        role: role || 'vendedor',
        aldeiaId: targetAldeiaId
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        aldeiaId: true,
        createdAt: true,
        aldeia: {
          select: { id: true, nome: true }
        }
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
