import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Exportar todos os dados pessoais do utilizador (RGPD)
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar todos os dados do utilizador
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        notificacoesEmail: true,
        ultimoLogin: true,
        createdAt: true,
        updatedAt: true,
        aldeia: {
          select: { id: true, nome: true }
        }
      }
    });

    // Buscar participações
    const participacoes = await db.participacao.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        valorPago: true,
        dadosParticipacao: true,
        metodoPagamento: true,
        estadoPagamento: true,
        telefoneMbway: true,
        nomeCliente: true,
        telefoneCliente: true,
        emailCliente: true,
        createdAt: true,
        jogo: {
          select: {
            id: true,
            tipo: true,
            evento: {
              select: {
                id: true,
                nome: true,
                aldeia: { select: { id: true, nome: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Buscar logs de acesso
    const logsAcesso = await db.logAcesso.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        sucesso: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Buscar alterações recebidas
    const alteracoesRecebidas = await db.alteracaoParticipacao.findMany({
      where: { jogadorId: user.id },
      select: {
        id: true,
        campoAlterado: true,
        valorAnterior: true,
        valorNovo: true,
        motivo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Montar objeto completo
    const dadosCompletos = {
      utilizador: userData,
      participacoes,
      logsAcesso,
      alteracoesRecebidas,
      exportadoEm: new Date().toISOString(),
      versao: '1.0'
    };

    // Retornar como JSON para download
    const json = JSON.stringify(dadosCompletos, null, 2);
    
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="meus-dados-${user.email.replace('@', '-at-')}.json"`
      }
    });
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
