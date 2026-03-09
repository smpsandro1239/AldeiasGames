/**
 * API: /api/vendas/[id]
 * Obter detalhes de uma venda específica
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await params;

    const venda = await db.venda.findUnique({
      where: { id },
      include: {
        vendedor: {
          select: { id: true, nome: true, email: true, telefone: true }
        },
        cliente: {
          select: { id: true, nome: true, email: true, telefone: true }
        },
        aldeia: {
          select: { id: true, nome: true, localizacao: true, logoUrl: true }
        },
        itens: true
      }
    });

    if (!venda) {
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    // Verificar permissão (vendedor só pode ver vendas da sua aldeia)
    if (user.role === 'VENDEDOR' && venda.aldeiaId !== user.aldeiaId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    return NextResponse.json(venda);
  } catch (error) {
    console.error('Erro ao obter venda:', error);
    return NextResponse.json({ error: 'Erro ao obter venda' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar permissão
    if (!['VENDEDOR', 'ALDEIA_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verificar se venda existe
    const vendaExistente = await db.venda.findUnique({
      where: { id }
    });

    if (!vendaExistente) {
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    // Atualizar venda
    const venda = await db.venda.update({
      where: { id },
      data: {
        estado: body.estado,
        referencia: body.referencia,
        observacoes: body.observacoes
      },
      include: {
        vendedor: {
          select: { id: true, nome: true }
        },
        cliente: {
          select: { id: true, nome: true }
        },
        aldeia: {
          select: { id: true, nome: true }
        },
        itens: true
      }
    });

    return NextResponse.json(venda);
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    return NextResponse.json({ error: 'Erro ao atualizar venda' }, { status: 500 });
  }
}
