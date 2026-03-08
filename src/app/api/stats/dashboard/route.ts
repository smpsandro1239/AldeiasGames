import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let stats: any = {};
    let activity: any[] = [];

    if (user.role === 'super_admin') {
      // Super Admin - Stats globais
      const [totalAldeias, totalEventos, totalJogos, totalParticipacoes, totalUsers] = await Promise.all([
        db.aldeia.count(),
        db.evento.count(),
        db.jogo.count(),
        db.participacao.count(),
        db.user.count()
      ]);

      const participacoesUltimas = await db.participacao.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { nome: true, email: true } },
          jogo: { select: { titulo: true } }
        }
      });

      stats = {
        totalAldeias,
        totalEventos,
        totalJogos,
        totalParticipacoes,
        totalUsers,
        participacoesHoje: 0,
        valorTotal: 0
      };

      activity = participacoesUltimas.map(p => ({
        id: p.id,
        tipo: 'participacao',
        utilizador: p.user?.nome || p.nomeCliente || 'Anónimo',
        jogo: p.jogo?.titulo || 'Jogo',
        valor: p.valorPago,
        data: p.createdAt
      }));

    } else if (user.role === 'aldeia_admin' && user.aldeiaId) {
      // Admin Aldeia - Stats da aldeia
      const aldeia = await db.aldeia.findUnique({
        where: { id: user.aldeiaId },
        include: {
          eventos: { include: { jogos: true } }
        }
      });

      const eventosIds = aldeia?.eventos.map(e => e.id) || [];
      const jogosIds = aldeia?.eventos.flatMap(e => e.jogos.map(j => j.id)) || [];

      const [totalEventos, totalJogos, totalParticipacoes] = await Promise.all([
        db.evento.count({ where: { id: { in: eventosIds } } }),
        db.jogo.count({ where: { id: { in: jogosIds } } }),
        db.participacao.count({ where: { jogoId: { in: jogosIds } } })
      ]);

      const participacoesUltimas = await db.participacao.findMany({
        where: { jogoId: { in: jogosIds } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { nome: true, email: true } },
          jogo: { select: { titulo: true } }
        }
      });

      stats = {
        totalAldeias: 1,
        totalEventos,
        totalJogos,
        totalParticipacoes,
        totalUsers: await db.user.count({ where: { aldeiaId: user.aldeiaId } }),
        participacoesHoje: 0,
        valorTotal: 0
      };

      activity = participacoesUltimas.map(p => ({
        id: p.id,
        tipo: 'participacao',
        utilizador: p.user?.nome || p.nomeCliente || 'Anónimo',
        jogo: p.jogo?.titulo || 'Jogo',
        valor: p.valorPago,
        data: p.createdAt
      }));

    } else if (user.role === 'vendedor' && user.aldeiaId) {
      // Vendedor - Stats pessoais
      const minhasVendas = await db.participacao.count({
        where: { adminRegistouId: user.id }
      });

      const minhasParticipacoes = await db.participacao.findMany({
        where: { adminRegistouId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { nome: true, email: true } },
          jogo: { select: { titulo: true } }
        }
      });

      stats = {
        totalVendas: minhasVendas,
        vendasHoje: 0,
        valorTotal: 0
      };

      activity = minhasParticipacoes.map(p => ({
        id: p.id,
        tipo: 'venda',
        utilizador: p.nomeCliente || p.user?.nome || 'Anónimo',
        jogo: p.jogo?.titulo || 'Jogo',
        valor: p.valorPago,
        data: p.createdAt
      }));

    } else {
      // Jogador - Stats pessoais
      const minhasParticipacoes = await db.participacao.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          jogo: { select: { titulo: true } }
        }
      });

      stats = {
        totalParticipacoes: minhasParticipacoes.length,
        totalGasto: 0,
        jogosGanhos: 0
      };

      activity = minhasParticipacoes.map(p => ({
        id: p.id,
        tipo: 'participacao',
        utilizador: user.nome,
        jogo: p.jogo?.titulo || 'Jogo',
        valor: p.valorPago,
        data: p.createdAt
      }));
    }

    return NextResponse.json({ stats, activity });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
