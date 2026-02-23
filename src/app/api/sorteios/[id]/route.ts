import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createHash, randomUUID } from 'crypto';

function calcularResultado(tipo: string, config: any, seed: string) {
  const hash = createHash('sha256').update(seed).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);

  if (tipo === 'poio_vaca') {
    const total = config.linhas * config.colunas;
    const idx = num % total;
    const linha = Math.floor(idx / config.colunas) + 1;
    const coluna = (idx % config.colunas) + 1;
    return { linha, coluna, quadrado: idx + 1 };
  }

  if (tipo === 'rifa') {
    const numero = (num % config.totalBilhetes) + 1;
    return { numero };
  }

  return { raw: num };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar se o jogo existe e está fechado
    const jogo = await db.jogo.findUnique({
      where: { id },
      include: {
        participacoes: true
      }
    });

    if (!jogo) {
      return NextResponse.json(
        { error: 'Jogo não encontrado' },
        { status: 404 }
      );
    }

    if (jogo.estado !== 'fechado') {
      return NextResponse.json(
        { error: 'Jogo deve estar fechado para sortear' },
        { status: 400 }
      );
    }

    // Verificar se já existe sorteio
    const sorteioExistente = await db.sorteio.findUnique({
      where: { jogoId: id }
    });

    if (sorteioExistente) {
      return NextResponse.json(
        { error: 'Jogo já foi sorteado' },
        { status: 400 }
      );
    }

    // Gerar seed e hash
    const seed = `${Date.now()}-${id}-${randomUUID()}`;
    const hashSeed = createHash('sha256').update(seed).digest('hex');

    // Calcular resultado
    const config = JSON.parse(jogo.config);
    const resultado = calcularResultado(jogo.tipo, config, seed);

    // Encontrar vencedor
    let vencedor = null;
    if (jogo.tipo === 'poio_vaca') {
      const dadosVencedor = JSON.stringify({
        linha: resultado.linha,
        coluna: resultado.coluna
      });
      const participacaoVencedora = await db.participacao.findFirst({
        where: {
          jogoId: id,
          dadosParticipacao: dadosVencedor
        },
        include: {
          user: {
            select: { id: true, nome: true, email: true }
          }
        }
      });
      vencedor = participacaoVencedora?.user || null;
    } else if (jogo.tipo === 'rifa') {
      const dadosVencedor = JSON.stringify({ numero: resultado.numero });
      const participacaoVencedora = await db.participacao.findFirst({
        where: {
          jogoId: id,
          dadosParticipacao: dadosVencedor
        },
        include: {
          user: {
            select: { id: true, nome: true, email: true }
          }
        }
      });
      vencedor = participacaoVencedora?.user || null;
    }

    // Criar sorteio
    const sorteio = await db.sorteio.create({
      data: {
        jogoId: id,
        seed,
        hashSeed,
        resultado: JSON.stringify(resultado),
        executadoPor: user.id,
      }
    });

    // Atualizar estado do jogo
    await db.jogo.update({
      where: { id },
      data: { estado: 'terminado' }
    });

    return NextResponse.json({
      ...sorteio,
      resultado,
      vencedor,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao executar sorteio:', error);
    return NextResponse.json(
      { error: 'Erro ao executar sorteio' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sorteio = await db.sorteio.findUnique({
      where: { jogoId: id },
      include: {
        jogo: {
          include: {
            evento: {
              include: { aldeia: true }
            }
          }
        },
        executor: {
          select: { id: true, nome: true }
        }
      }
    });

    if (!sorteio) {
      return NextResponse.json(
        { error: 'Sorteio não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...sorteio,
      resultado: JSON.parse(sorteio.resultado)
    });
  } catch (error) {
    console.error('Erro ao buscar sorteio:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sorteio' },
      { status: 500 }
    );
  }
}
