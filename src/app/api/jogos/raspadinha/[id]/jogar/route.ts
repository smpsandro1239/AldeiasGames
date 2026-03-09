/**
 * API: /api/jogos/raspadinha/[id]/jogar
 * Jogar uma raspadinha - revelar área(s)
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { areasReveladas } = body; // Array de índices das áreas para revelar

    // Buscar jogo
    const jogo = await db.jogo.findUnique({
      where: { id },
      include: {
        evento: true
      }
    });

    if (!jogo || jogo.tipo !== 'raspadinha') {
      return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });
    }

    if (jogo.estado !== 'ativo') {
      return NextResponse.json({ error: 'Jogo não está ativo' }, { status: 400 });
    }

    // Buscar ou criar participação
    let participacao = await db.participacao.findFirst({
      where: {
        jogoId: id,
        utilizadorId: user.id
      }
    });

    const config = JSON.parse(jogo.config || '{}');
    const simbolos = config.simbolos || ['⭐', '💰', '🎁', '🍀', '🔥', '💎'];
    
    // Se é primeira vez, gerar símbolos aleatórios
    if (!participacao) {
      // Gerar 9 símbolos aleatórios (3x3)
      const symbolsForCard = Array(9).fill(null).map(() => 
        simbolos[Math.floor(Math.random() * simbolos.length)]
      );
      
      // Guardar os símbolos gerados
      const dadosJogo = {
        simbolos: symbolsForCard,
        areasReveladas: [] as number[],
        ganhou: false,
        premios: config.premios || []
      };

      participacao = await db.participacao.create({
        data: {
          jogoId: id,
          utilizadorId: user.id,
          dadosParticipacao: JSON.stringify(dadosJogo),
          estado: 'pendente'
        }
      });
    }

    // Processar revelação
    const dadosParticipacao = JSON.parse(participacao.dadosParticipacao || '{}');
    
    // Revelar as áreas
    const novasAreas = areasReveladas.filter((a: number) => !dadosParticipacao.areasReveladas.includes(a));
    dadosParticipacao.areasVerificadas = [...(dadosParticipacao.areasReveladas || []), ...novasAreas];

    // Verificar vitória (3 símbolos iguais em linha horizontal, vertical ou diagonal)
    const simbolosJogo = dadosParticipacao.simbolos || [];
    let ganhou = false;
    let premioGanho = null;

    // Combinações vencedoras (índices)
    const combinacoesVencedoras = [
      [0, 1, 2], // Horizontal 1
      [3, 4, 5], // Horizontal 2
      [6, 7, 8], // Horizontal 3
      [0, 3, 6], // Vertical 1
      [1, 4, 7], // Vertical 2
      [2, 5, 8], // Vertical 3
      [0, 4, 8], // Diagonal 1
      [2, 4, 6], // Diagonal 2
    ];

    for (const comb of combinacoesVencedoras) {
      const [a, b, c] = comb;
      if (
        dadosParticipacao.areasVerificadas.includes(a) &&
        dadosParticipacao.areasVerificadas.includes(b) &&
        dadosParticipacao.areasVerificadas.includes(c) &&
        simbolosJogo[a] === simbolosJogo[b] &&
        simbolosJogo[b] === simbolosJogo[c]
      ) {
        ganhou = true;
        // Encontrar prémio correspondente
        const simboloVencedor = simbolosJogo[a];
        const premio = (config.premios || []).find((p: any) => p.simbolo === simboloVencedor);
        if (premio) {
          premioGanho = premio;
        }
        break;
      }
    }

    dadosParticipacao.ganhou = ganhou;
    dadosParticipacao.premioGanho = premioGanho;

    // Atualizar participação
    await db.participacao.update({
      where: { id: participacao.id },
      data: {
        dadosParticipacao: JSON.stringify(dadosParticipacao),
        estado: ganhou ? 'premiado' : 'terminada'
      }
    });

    return NextResponse.json({
      success: true,
      participacao: {
        id: participacao.id,
        simbolos: simbolosJogo,
        areasReveladas: dadosParticipacao.areasVerificadas,
        ganhou,
        premio: premioGanho
      }
    });
  } catch (error) {
    console.error('Erro ao jogar raspadinha:', error);
    return NextResponse.json({ error: 'Erro ao processar jogo' }, { status: 500 });
  }
}
