import { NextRequest, NextResponse } from 'next/server';
import { alterarParticipacao } from '@/lib/db';
import { validateParticipacao } from '@/lib/validations';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const validated = validateParticipacao(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    
    const result = await alterarParticipacao(id, validated.data);
    
    if (!result) {
      return NextResponse.json({ error: 'Participação não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Participação alterada com sucesso',
      tipoAlteracao: result.tipoAlteracao,
      posicao: result.posicao,
      infoAdicional: result.infoAdicional
    });
  } catch (error) {
    console.error('Erro ao alterar participação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
