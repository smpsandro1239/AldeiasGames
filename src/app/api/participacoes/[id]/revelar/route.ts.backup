import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';

// Verify hash function
function verifyHash(seed: string, premio: any, cardNumber: number, hash: string): boolean {
  const hashData = JSON.stringify({ seed, premio, cardNumber });
  const calculatedHash = crypto.createHash('sha256').update(hashData).digest('hex');
  return calculatedHash === hash;
}

// POST - Reveal raspadinha result
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const participacaoId = params.id;

    // Get participation with raspadinha data
    const participacaoData = await db.$queryRaw<any[]>`
      SELECT p.*, j.tipo, j.premiosRaspadinha, j.stockInicial
      FROM participacoes p
      JOIN jogos j ON p.jogoId = j.id
      WHERE p.id = ${participacaoId}
    `;

    if (!participacaoData || participacaoData.length === 0) {
      return NextResponse.json(
        { error: 'Participação não encontrada' },
        { status: 404 }
      );
    }

    const participacao = participacaoData[0];

    // Verify it's a raspadinha
    if (participacao.tipo !== 'raspadinha') {
      return NextResponse.json(
        { error: 'Esta participação não é uma raspadinha' },
        { status: 400 }
      );
    }

    // Verify ownership
    if (participacao.userId !== user.id) {
      return NextResponse.json(
        { error: 'Só pode revelar os seus próprios cartões' },
        { status: 403 }
      );
    }

    // Check if already revealed
    if (participacao.revelado) {
      // Return existing result
      const resultado = participacao.resultadoRaspe ? JSON.parse(participacao.resultadoRaspe) : null;
      return NextResponse.json({
        success: true,
        alreadyRevealed: true,
        resultado,
        seed: participacao.seedRaspe,
        hash: participacao.hashRaspe,
        reveladoAt: participacao.reveladoAt
      });
    }

    // Get the result data
    const resultado = participacao.resultadoRaspe ? JSON.parse(participacao.resultadoRaspe) : null;
    const seed = participacao.seedRaspe;
    const hash = participacao.hashRaspe;

    // Verify hash integrity
    if (resultado && seed && hash) {
      const isValid = verifyHash(seed, resultado.premio, resultado.cardNumber, hash);
      if (!isValid) {
        console.error('Hash verification failed for participacao:', participacaoId);
        return NextResponse.json(
          { error: 'Erro de integridade do cartão' },
          { status: 500 }
        );
      }
    }

    // Mark as revealed
    await db.$executeRaw`
      UPDATE participacoes 
      SET revelado = 1, reveladoAt = datetime('now')
      WHERE id = ${participacaoId}
    `;

    // Get premio details for display
    const premio = resultado?.premio;

    // Create notification if there's a prize
    if (premio && premio.valor > 0) {
      try {
        await db.notificacao.create({
          data: {
            userId: user.id,
            tipo: 'premio',
            titulo: '🎉 Parabéns! Ganhou um prémio!',
            mensagem: `Ganhou ${premio.nome} no valor de ${premio.valor}€ na Raspadinha!`,
            dados: JSON.stringify({
              participacaoId,
              premio,
              cardNumber: resultado.cardNumber
            })
          }
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      alreadyRevealed: false,
      resultado: {
        cardNumber: resultado?.cardNumber,
        premio: premio,
        isWinner: premio !== null && premio.valor > 0
      },
      seed,
      hash,
      verification: {
        valid: true,
        message: 'Resultado verificado com sucesso'
      }
    });
  } catch (error) {
    console.error('Erro ao revelar raspadinha:', error);
    return NextResponse.json(
      { error: 'Erro ao revelar raspadinha' },
      { status: 500 }
    );
  }
}

// GET - Verify raspadinha integrity
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const participacaoId = params.id;

    // Get participation with raspadinha data
    const participacaoData = await db.$queryRaw<any[]>`
      SELECT p.id, p.numeroCartao, p.seedRaspe, p.hashRaspe, p.resultadoRaspe, p.revelado, p.reveladoAt,
             j.tipo, j.premiosRaspadinha
      FROM participacoes p
      JOIN jogos j ON p.jogoId = j.id
      WHERE p.id = ${participacaoId}
    `;

    if (!participacaoData || participacaoData.length === 0) {
      return NextResponse.json(
        { error: 'Participação não encontrada' },
        { status: 404 }
      );
    }

    const participacao = participacaoData[0];

    // Only allow verification for revealed cards or by the owner
    if (!participacao.revelado && participacao.userId !== user.id) {
      return NextResponse.json(
        { error: 'Cartão ainda não foi revelado' },
        { status: 400 }
      );
    }

    const resultado = participacao.resultadoRaspe ? JSON.parse(participacao.resultadoRaspe) : null;
    const seed = participacao.seedRaspe;
    const hash = participacao.hashRaspe;

    // Verify hash
    let isValid = false;
    if (resultado && seed && hash) {
      isValid = verifyHash(seed, resultado.premio, resultado.cardNumber, hash);
    }

    return NextResponse.json({
      participacaoId: participacao.id,
      numeroCartao: participacao.numeroCartao,
      revelado: participacao.revelado === 1,
      reveladoAt: participacao.reveladoAt,
      resultado: participacao.revelado ? resultado : null,
      verification: {
        seed,
        hash,
        isValid,
        algorithm: 'SHA-256'
      }
    });
  } catch (error) {
    console.error('Erro ao verificar raspadinha:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar raspadinha' },
      { status: 500 }
    );
  }
}
