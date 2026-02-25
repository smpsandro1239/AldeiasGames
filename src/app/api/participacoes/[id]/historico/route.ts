import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const participacao = await db.participacao.findUnique({
      where: { id },
      include: {
        historico: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!participacao) {
      return NextResponse.json({ error: 'Participação não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({
      participacao,
      historico: participacao.historico,
      totalAlteracoes: participacao.historico.length
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
