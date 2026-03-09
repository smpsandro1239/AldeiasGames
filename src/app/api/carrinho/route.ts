/**
 * API: /api/carrinho
 * Gestão do carrinho de compras (session-based)
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// Carrinho em memória (em produção, usar Redis ou DB)
const carrinhos = new Map<string, CarrinhoItem[]>();

interface CarrinhoItem {
  tipo: 'jogo' | 'premio';
  itemId: string;
  descricao: string;
  precoUnitario: number;
  quantidade: number;
  imagemUrl?: string;
}

function getCarrinhoId(request: Request): string {
  // Tentar obter user ID se autenticado, senão usar session ID
  return 'default'; // Simplificado para demo
}

export async function GET(request: Request) {
  try {
    const carrinhoId = getCarrinhoId(request);
    const carrinho = carrinhos.get(carrinhoId) || [];
    
    const total = carrinho.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);
    const itensCount = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

    return NextResponse.json({
      itens: carrinho,
      total,
      itensCount
    });
  } catch (error) {
    console.error('Erro ao obter carrinho:', error);
    return NextResponse.json({ error: 'Erro ao obter carrinho' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipo, itemId, descricao, precoUnitario, quantidade = 1, imagemUrl } = body;

    if (!tipo || !itemId || !descricao || !precoUnitario) {
      return NextResponse.json({ 
        error: 'Dados inválidos. É necessário tipo, itemId, descricao e precoUnitario.' 
      }, { status: 400 });
    }

    const carrinhoId = getCarrinhoId(request);
    let carrinho = carrinhos.get(carrinhoId) || [];

    // Verificar se item já existe
    const itemIndex = carrinho.findIndex(item => item.itemId === itemId && item.tipo === tipo);
    
    if (itemIndex >= 0) {
      // Atualizar quantidade
      carrinho[itemIndex].quantidade += quantidade;
    } else {
      // Adicionar novo item
      carrinho.push({
        tipo,
        itemId,
        descricao,
        precoUnitario,
        quantidade,
        imagemUrl
      });
    }

    carrinhos.set(carrinhoId, carrinho);

    const total = carrinho.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);

    return NextResponse.json({
      itens: carrinho,
      total,
      itensCount: carrinho.length
    });
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, quantidade } = body;

    if (!itemId || quantidade === undefined) {
      return NextResponse.json({ 
        error: 'Dados inválidos. É necessário itemId e quantidade.' 
      }, { status: 400 });
    }

    const carrinhoId = getCarrinhoId(request);
    let carrinho = carrinhos.get(carrinhoId) || [];

    if (quantidade <= 0) {
      // Remover item
      carrinho = carrinho.filter(item => item.itemId !== itemId);
    } else {
      // Atualizar quantidade
      const itemIndex = carrinho.findIndex(item => item.itemId === itemId);
      if (itemIndex >= 0) {
        carrinho[itemIndex].quantidade = quantidade;
      }
    }

    carrinhos.set(carrinhoId, carrinho);

    const total = carrinho.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);

    return NextResponse.json({
      itens: carrinho,
      total,
      itensCount: carrinho.length
    });
  } catch (error) {
    console.error('Erro ao atualizar carrinho:', error);
    return NextResponse.json({ error: 'Erro ao atualizar carrinho' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const carrinhoId = getCarrinhoId(request);
    let carrinho = carrinhos.get(carrinhoId) || [];

    if (itemId) {
      // Remover item específico
      carrinho = carrinho.filter(item => item.itemId !== itemId);
    } else {
      // Limpar carrinho
      carrinho = [];
    }

    carrinhos.set(carrinhoId, carrinho);

    const total = carrinho.reduce((sum, item) => sum + (item.precoUnitario * item.quantidade), 0);

    return NextResponse.json({
      itens: carrinho,
      total,
      itensCount: carrinho.length
    });
  } catch (error) {
    console.error('Erro ao remover do carrinho:', error);
    return NextResponse.json({ error: 'Erro ao remover do carrinho' }, { status: 500 });
  }
}
