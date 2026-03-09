/**
 * API: /api/clientes
 * Registo rápido de clientes pelo vendedor
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

    const { searchParams } = new URL(request.url);
    const aldeiaId = searchParams.get('aldeiaId');
    const search = searchParams.get('search'); // pesquisa por nome/email/telefone

    const where: any = {};

    // Se for vendedor, só vê clientes da sua aldeia
    if (user.role === 'VENDEDOR' || user.role === 'ALDEIA_ADMIN') {
      where.aldeiaId = user.aldeiaId;
    } else if (aldeiaId) {
      where.aldeiaId = aldeiaId;
    }

    // Pesquisa
    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { email: { contains: search } },
        { telefone: { contains: search } }
      ];
    }

    const clientes = await db.user.findMany({
      where: {
        role: 'CLIENTE',
        ...where
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        createdAt: true,
        aldeiaId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json({ error: 'Erro ao listar clientes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar permissão (vendedor ou admin)
    if (!['VENDEDOR', 'ALDEIA_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, email, telefone, aldeiaId } = body;

    if (!nome) {
      return NextResponse.json({ 
        error: 'Nome é obrigatório' 
      }, { status: 400 });
    }

    // Se não for especificada aldeia, usar a do utilizador
    const targetAldeiaId = aldeiaId || user.aldeiaId;

    // Verificar se email já existe
    if (email) {
      const existingEmail = await db.user.findUnique({
        where: { email }
      });
      
      if (existingEmail) {
        return NextResponse.json({ 
          error: 'Email já registado',
          cliente: existingEmail
        }, { status: 409 });
      }
    }

    // Gerar password temporária automática
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hash(tempPassword, 12);

    // Criar cliente
    const novoCliente = await db.user.create({
      data: {
        nome,
        email: email || null,
        telefone: telefone || null,
        passwordHash,
        role: 'CLIENTE',
        aldeiaId: targetAldeiaId
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      ...novoCliente,
      passwordTemporaria: tempPassword // Apenas para mostrar ao vendedor uma vez
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registar cliente:', error);
    return NextResponse.json({ error: 'Erro ao registar cliente' }, { status: 500 });
  }
}
