/**
 * API: /api/users/perfil
 * Gestão do perfil do utilizador
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar dados completos do utilizador
    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        aldeia: {
          select: {
            id: true,
            nome: true,
            slug: true,
            localizacao: true,
            logoUrl: true
          }
        },
        _count: {
          select: {
            participacoes: true,
            vendas: true,
            notificacoes: true
          }
        }
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    // Remover passwordHash da resposta
    const { passwordHash, ...profileWithoutPassword } = userProfile as any;

    return NextResponse.json(profileWithoutPassword);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return NextResponse.json({ error: 'Erro ao obter perfil' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, telefone, passwordAtual, novaPassword } = body;

    // Se o utilizador quiser mudar a password, verificar a atual
    if (novaPassword) {
      if (!passwordAtual) {
        return NextResponse.json({ 
          error: 'Password atual é obrigatória para definir nova password' 
        }, { status: 400 });
      }

      const userAtual = await db.user.findUnique({
        where: { id: user.id }
      });

      if (!userAtual) {
        return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
      }

      // Verificar password atual (simplificado - em produção usar bcrypt.compare)
      const isValid = await import('bcryptjs').then(bcrypt => 
        bcrypt.compare(passwordAtual, userAtual.passwordHash)
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Password atual incorreta' }, { status: 401 });
      }

      // Atualizar com nova password
      const passwordHash = await hash(novaPassword, 12);
      
      await db.user.update({
        where: { id: user.id },
        data: {
          nome: nome || undefined,
          telefone: telefone || undefined,
          passwordHash
        }
      });

      return NextResponse.json({ message: 'Password alterada com sucesso' });
    }

    // Atualizar apenas dados básicos
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        nome: nome,
        telefone: telefone
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
