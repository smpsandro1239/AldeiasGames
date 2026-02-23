import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Obter histórico de pagamentos do utilizador
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todas as participações do utilizador com detalhes
    const participacoes = await db.participacao.findMany({
      where: { userId: user.id },
      include: {
        jogo: {
          include: {
            evento: {
              include: {
                aldeia: {
                  select: { id: true, nome: true }
                }
              }
            },
            sorteio: {
              select: { resultado: true, createdAt: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular estatísticas
    const totalGasto = participacoes.reduce((acc, p) => acc + p.valorPago, 0);
    const totalParticipacoes = participacoes.length;
    const pagamentosPorMetodo = {
      mbway: participacoes.filter(p => p.metodoPagamento === 'mbway').length,
      dinheiro: participacoes.filter(p => p.metodoPagamento === 'dinheiro').length,
      pendente: participacoes.filter(p => p.metodoPagamento === 'pendente').length
    };

    // Verificar vitórias
    const vitorias = participacoes.filter(p => {
      if (!p.jogo.sorteio) return false;
      const resultado = p.jogo.sorteio.resultado;
      try {
        const resultadoObj = typeof resultado === 'string' ? JSON.parse(resultado) : resultado;
        return JSON.stringify(resultadoObj) === JSON.stringify(p.dadosParticipacao);
      } catch {
        return false;
      }
    });

    // Formatar histórico
    const historico = participacoes.map(p => ({
      id: p.id,
      data: p.createdAt,
      jogo: {
        tipo: p.jogo.tipo,
        evento: p.jogo.evento.nome,
        aldeia: p.jogo.evento.aldeia.nome
      },
      dadosParticipacao: p.dadosParticipacao,
      valorPago: p.valorPago,
      metodoPagamento: p.metodoPagamento,
      estadoPagamento: p.estadoPagamento,
      venceu: p.jogo.sorteio ? (() => {
        try {
          const resultado = typeof p.jogo.sorteio.resultado === 'string' 
            ? JSON.parse(p.jogo.sorteio.resultado) 
            : p.jogo.sorteio.resultado;
          return JSON.stringify(resultado) === JSON.stringify(p.dadosParticipacao);
        } catch {
          return false;
        }
      })() : null,
      dataSorteio: p.jogo.sorteio?.createdAt || null
    }));

    return NextResponse.json({
      estatisticas: {
        totalGasto,
        totalParticipacoes,
        pagamentosPorMetodo,
        totalVitorias: vitorias.length
      },
      historico
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
