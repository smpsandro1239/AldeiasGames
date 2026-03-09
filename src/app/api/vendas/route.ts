/**
 * API: /api/vendas
 * Gestão de vendas - CRUD completo
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const aldeiaId = searchParams.get('aldeiaId');
    const vendedorId = searchParams.get('vendedorId');
    const estado = searchParams.get('estado');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir where clause
    const where: any = {};
    
    // Filtrar por aldeia
    if (aldeiaId) {
      where.aldeiaId = aldeiaId;
    } else if (user.role === 'ALDEIA_ADMIN' || user.role === 'VENDEDOR') {
      // Vendedores só vêem vendas da sua aldeia
      where.aldeiaId = user.aldeiaId;
    }

    // Filtrar por vendedor
    if (vendedorId) {
      where.vendedorId = vendedorId;
    }

    // Filtrar por estado
    if (estado) {
      where.estado = estado;
    }

    const vendas = await db.venda.findMany({
      where,
      include: {
        vendedor: {
          select: { id: true, nome: true, email: true }
        },
        cliente: {
          select: { id: true, nome: true, email: true, telefone: true }
        },
        aldeia: {
          select: { id: true, nome: true }
        },
        itens: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await db.venda.count({ where });

    return NextResponse.json({
      vendas,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    return NextResponse.json({ error: 'Erro ao listar vendas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar permissão
    if (!['VENDEDOR', 'ALDEIA_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      aldeiaId, 
      clienteId, 
      itens, 
      metodoPagamento = 'mbway',
      telefone,
      observacoes 
    } = body;

    if (!aldeiaId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ 
        error: 'Dados inválidos. É necessário aldeiaId e itens.' 
      }, { status: 400 });
    }

    // Calcular valor total
    const valorTotal = itens.reduce((sum: number, item: any) => {
      return sum + (item.precoUnitario * item.quantidade);
    }, 0);

    // Criar venda com itens numa transação
    const venda = await db.$transaction(async (tx) => {
      // Criar venda
      const novaVenda = await tx.venda.create({
        data: {
          aldeiaId,
          vendedorId: user.id,
          clienteId: clienteId || null,
          valorTotal,
          metodoPagamento,
          telefone: telefone || null,
          observacoes: observacoes || null,
          estado: 'pendente', // Aguarda pagamento
        }
      });

      // Criar itens da venda
      for (const item of itens) {
        await tx.vendaItem.create({
          data: {
            vendaId: novaVenda.id,
            tipo: item.tipo || 'jogo',
            itemId: item.itemId || null,
            descricao: item.descricao,
            quantidade: item.quantidade || 1,
            precoUnitario: item.precoUnitario,
            subtotal: (item.quantidade || 1) * item.precoUnitario
          }
        });
      }

      return novaVenda;
    });

    // Buscar venda completa para返回
    const vendaCompleta = await db.venda.findUnique({
      where: { id: venda.id },
      include: {
        vendedor: {
          select: { id: true, nome: true, email: true }
        },
        cliente: {
          select: { id: true, nome: true, email: true, telefone: true }
        },
        aldeia: {
          select: { id: true, nome: true }
        },
        itens: true
      }
    });

    return NextResponse.json(vendaCompleta, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    return NextResponse.json({ error: 'Erro ao criar venda' }, { status: 500 });
  }
}
