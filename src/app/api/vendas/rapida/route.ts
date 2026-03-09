/**
 * API: /api/vendas/rapida
 * Venda rápida pelo vendedor - cria participação + registo de cliente
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é vendedor
    if (!['VENDEDOR', 'ALDEIA_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      jogoId, 
      aldeiaId,
      quantidade = 1,
      metodoPagamento = 'dinheiro',
      telefoneMbway,
      cliente // { nome, telefone, email }
    } = body;

    if (!jogoId) {
      return NextResponse.json({ error: 'jogoId é obrigatório' }, { status: 400 });
    }

    if (!cliente?.nome) {
      return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
    }

    if (!cliente?.telefone && !cliente?.email) {
      return NextResponse.json({ error: 'Telemóvel ou email é obrigatório' }, { status: 400 });
    }

    // Buscar jogo
    const jogo = await db.jogo.findUnique({
      where: { id: jogoId },
      include: {
        evento: {
          include: { aldeia: true }
        }
      }
    });

    if (!jogo) {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });
    }

    if (jogo.estado !== 'ativo') {
      return NextResponse.json({ error: 'Jogo não está ativo' }, { status: 400 });
    }

    const valorTotal = jogo.precoParticipacao * quantidade;

    // Verificar ou criar cliente
    let clienteUser = null;
    
    // Tentar encontrar cliente existente por telefone ou email
    if (cliente.telefone) {
      clienteUser = await db.user.findFirst({
        where: {
          OR: [
            { telefone: cliente.telefone },
            { email: cliente.email || undefined }
          ]
        }
      });
    }

    // Se não existe, criar novo cliente
    if (!clienteUser && (cliente.telefone || cliente.email)) {
      const { hash } = await import('bcryptjs');
      const tempPassword = Math.random().toString(36).slice(-8);
      
      clienteUser = await db.user.create({
        data: {
          nome: cliente.nome,
          telefone: cliente.telefone || null,
          email: cliente.email || null,
          passwordHash: await hash(tempPassword, 12),
          role: 'CLIENTE',
          aldeiaId: aldeiaId || jogo.evento.aldeiaId
        }
      });
    }

    // Criar participações
    const participacoes = [];
    
    for (let i = 0; i < quantidade; i++) {
      const seed = randomBytes(16).toString('hex');
      const hash = randomBytes(32).toString('hex');
      const referencia = `PAR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const participacao = await db.participacao.create({
        data: {
          jogoId: jogo.id,
          userId: user.id, // O vendedor regista a participação
          valorPago: jogo.precoParticipacao,
          dadosParticipacao: JSON.stringify({ 
            jogoOriginalId: jogo.id,
            clienteFinalId: clienteUser?.id 
          }),
          metodoPagamento,
          telefoneMbway: telefoneMbway || null,
          referencia,
          estado: metodoPagamento === 'dinheiro' ? 'pago' : 'pendente',
          
          // Dados do cliente final (o cliente que jogou)
          adminRegistouId: user.id,
          nomeCliente: cliente.nome,
          telefoneCliente: cliente.telefone || null,
          emailCliente: cliente.email || null,
          
          // Para raspadinhas
          seedRaspe: seed,
          hashRaspe: hash,
          revelado: false,
          ganhou: false
        },
        include: {
          jogo: {
            select: { id: true, titulo: true, tipo: true }
          }
        }
      });
      
      participacoes.push(participacao);
    }

    return NextResponse.json({
      success: true,
      venda: {
        id: `VND-${Date.now()}`,
        jogo: {
          id: jogo.id,
          titulo: jogo.titulo,
          tipo: jogo.tipo
        },
        quantidade,
        valorTotal,
        metodoPagamento,
        cliente: {
          nome: cliente.nome,
          telefone: cliente.telefone,
          email: cliente.email
        },
        createdAt: new Date().toISOString()
      },
      participacoes,
      mensagem: metodoPagamento === 'dinheiro' 
        ? 'Venda registada com sucesso!' 
        : 'Venda pendente de pagamento'
    });
  } catch (error) {
    console.error('Erro na venda rápida:', error);
    return NextResponse.json({ error: 'Erro ao processar venda' }, { status: 500 });
  }
}
