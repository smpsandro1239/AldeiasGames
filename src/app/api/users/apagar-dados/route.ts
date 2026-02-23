import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// DELETE - Apagar todos os dados pessoais (RGPD - Direito ao esquecimento)
export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Não permitir apagar contas admin
    if (['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Contas administrativas não podem ser apagadas. Contacte o suporte.' 
      }, { status: 403 });
    }

    // Verificar se há participações pagas
    const participacoesPagas = await db.participacao.count({
      where: { 
        userId: user.id,
        estadoPagamento: 'pago'
      }
    });

    if (participacoesPagas > 0) {
      return NextResponse.json({ 
        error: 'Não é possível apagar a conta enquanto houver participações pagas. Aguarde o término dos eventos ou contacte o suporte.' 
      }, { status: 400 });
    }

    // Usar transação para garantir integridade
    await db.$transaction(async (tx) => {
      // 1. Apagar logs de acesso
      await tx.logAcesso.deleteMany({
        where: { userId: user.id }
      });

      // 2. Apagar alterações recebidas (onde é jogador)
      await tx.alteracaoParticipacao.deleteMany({
        where: { jogadorId: user.id }
      });

      // 3. Apagar alterações feitas (onde é admin - apenas se for vendedor)
      if (user.role === 'vendedor') {
        await tx.alteracaoParticipacao.deleteMany({
          where: { adminId: user.id }
        });
      }

      // 4. Apagar participações pendentes
      await tx.participacao.deleteMany({
        where: { 
          userId: user.id,
          estadoPagamento: 'pendente'
        }
      });

      // 5. Anonimizar participações com pagamento (manter para auditoria)
      await tx.participacao.updateMany({
        where: { userId: user.id },
        data: {
          userId: 'deleted',
          nomeCliente: '[DADOS APAGADOS]',
          telefoneCliente: null,
          emailCliente: null
        }
      });

      // 6. Apagar utilizador
      await tx.user.delete({
        where: { id: user.id }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: 'Todos os seus dados foram apagados com sucesso. A sua conta foi eliminada.'
    });
  } catch (error) {
    console.error('Erro ao apagar dados:', error);
    return NextResponse.json({ error: 'Erro interno ao apagar dados' }, { status: 500 });
  }
}
