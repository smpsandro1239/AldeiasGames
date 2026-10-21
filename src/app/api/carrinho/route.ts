/**
 * API: /api/carrinho
 * Gestão do carrinho de compras (persistido em base de dados)
 *
 * 🟠 Antes: Map em memória com ID fixo 'default' (partilhado entre todos os
 * utilizadores e perdido a cada restart/deploy). Agora: tabela CarrinhoItem no
 * Prisma, keyed por utilizador autenticado. Para cenários com Redis disponível,
 * basta trocar a camada de persistência — a interface do handler mantém-se.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

interface CarrinhoItemInput {
  tipo: 'jogo' | 'premio';
  itemId: string;
  descricao: string;
  precoUnitario: number;
  quantidade?: number;
  imagemUrl?: string;
}

async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
  }
  return { user, error: null };
}

function serialize(items: any[]) {
  const itens = items.map((i) => ({
    tipo: i.tipo,
    itemId: i.itemId,
    descricao: i.descricao,
    precoUnitario: i.precoUnitario,
    quantidade: i.quantidade,
    imagemUrl: i.imagemUrl ?? undefined,
  }));
  const total = itens.reduce((sum, i) => sum + i.precoUnitario * i.quantidade, 0);
  const itensCount = itens.reduce((sum, i) => sum + i.quantidade, 0);
  return { itens, total, itensCount };
}

export async function GET(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const items = await db.carrinhoItem.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(serialize(items));
  } catch (err) {
    console.error('Erro ao obter carrinho:', err);
    return NextResponse.json({ error: 'Erro ao obter carrinho' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = (await request.json()) as CarrinhoItemInput;
    const { tipo, itemId, descricao, precoUnitario, quantidade = 1, imagemUrl } = body;

    if (!tipo || !itemId || !descricao || !precoUnitario) {
      return NextResponse.json({
        error: 'Dados inválidos. É necessário tipo, itemId, descricao e precoUnitario.',
      }, { status: 400 });
    }

    const existente = await db.carrinhoItem.findFirst({
      where: { userId: user!.id, itemId, tipo },
    });

    if (existente) {
      await db.carrinhoItem.update({
        where: { id: existente.id },
        data: { quantidade: existente.quantidade + quantidade },
      });
    } else {
      await db.carrinhoItem.create({
        data: { userId: user!.id, tipo, itemId, descricao, precoUnitario, quantidade, imagemUrl: imagemUrl ?? null },
      });
    }

    const items = await db.carrinhoItem.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(serialize(items), { status: 201 });
  } catch (err) {
    console.error('Erro ao adicionar ao carrinho:', err);
    return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const { itemId, quantidade } = await request.json();
    if (!itemId || quantidade === undefined) {
      return NextResponse.json({
        error: 'Dados inválidos. É necessário itemId e quantidade.',
      }, { status: 400 });
    }

    const existente = await db.carrinhoItem.findFirst({
      where: { userId: user!.id, itemId },
    });
    if (existente) {
      if (quantidade <= 0) {
        await db.carrinhoItem.delete({ where: { id: existente.id } });
      } else {
        await db.carrinhoItem.update({
          where: { id: existente.id },
          data: { quantidade },
        });
      }
    }

    const items = await db.carrinhoItem.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(serialize(items));
  } catch (err) {
    console.error('Erro ao atualizar carrinho:', err);
    return NextResponse.json({ error: 'Erro ao atualizar carrinho' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (itemId) {
      await db.carrinhoItem.deleteMany({ where: { userId: user!.id, itemId } });
    } else {
      await db.carrinhoItem.deleteMany({ where: { userId: user!.id } });
    }

    const items = await db.carrinhoItem.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(serialize(items));
  } catch (err) {
    console.error('Erro ao remover do carrinho:', err);
    return NextResponse.json({ error: 'Erro ao remover do carrinho' }, { status: 500 });
  }
}
