import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Exportar dados em CSV
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'participacoes';
    const aldeiaId = searchParams.get('aldeiaId');
    const eventoId = searchParams.get('eventoId');
    const jogoId = searchParams.get('jogoId');

    let csv = '';
    let filename = '';

    switch (tipo) {
      case 'participacoes': {
        // Filtro por permissões
        let where: any = {};
        
        if (user.role === 'super_admin') {
          if (aldeiaId) where.jogo = { evento: { aldeiaId } };
          if (eventoId) where.jogo = { eventoId };
          if (jogoId) where.jogoId = jogoId;
        } else if (user.role === 'aldeia_admin' && user.aldeiaId) {
          where.jogo = { evento: { aldeiaId: user.aldeiaId } };
          if (eventoId) where.jogo = { ...where.jogo, eventoId };
          if (jogoId) where.jogoId = jogoId;
        } else {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        const participacoes = await db.participacao.findMany({
          where,
          include: {
            user: { select: { nome: true, email: true } },
            jogo: {
              include: {
                evento: { include: { aldeia: { select: { nome: true } } } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        // Cabeçalho CSV
        csv = 'Data,Jogo,Evento,Aldeia,Jogador,Email,Posição/Número,Valor,Método Pagamento,Estado,Cliente\n';
        
        // Dados
        participacoes.forEach(p => {
          const posicao = p.jogo.tipo === 'poio_vaca' 
            ? `${p.dadosParticipacao.letra}${p.dadosParticipacao.numero}`
            : p.dadosParticipacao.numero;
          
          csv += `"${new Date(p.createdAt).toLocaleString('pt-PT')}",`;
          csv += `"${p.jogo.tipo}",`;
          csv += `"${p.jogo.evento.nome}",`;
          csv += `"${p.jogo.evento.aldeia.nome}",`;
          csv += `"${p.user.nome}",`;
          csv += `"${p.user.email}",`;
          csv += `"${posicao}",`;
          csv += `"${p.valorPago}€",`;
          csv += `"${p.metodoPagamento}",`;
          csv += `"${p.estadoPagamento}",`;
          csv += `"${p.nomeCliente || ''}"\n`;
        });

        filename = `participacoes_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'vendedores': {
        if (!['super_admin', 'aldeia_admin'].includes(user.role)) {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        const where: any = { role: 'vendedor' };
        if (user.role === 'aldeia_admin' && user.aldeiaId) {
          where.aldeiaId = user.aldeiaId;
        } else if (aldeiaId) {
          where.aldeiaId = aldeiaId;
        }

        const vendedores = await db.user.findMany({
          where,
          include: {
            aldeia: { select: { nome: true } },
            _count: { select: { participacoes: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        csv = 'Nome,Email,Aldeia,Data Criação,Último Login,Participações Registadas\n';
        
        vendedores.forEach(v => {
          csv += `"${v.nome}",`;
          csv += `"${v.email}",`;
          csv += `"${v.aldeia?.nome || ''}",`;
          csv += `"${new Date(v.createdAt).toLocaleDateString('pt-PT')}",`;
          csv += `"${v.ultimoLogin ? new Date(v.ultimoLogin).toLocaleString('pt-PT') : 'Nunca'}",`;
          csv += `"${v._count.participacoes}"\n`;
        });

        filename = `vendedores_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      case 'eventos': {
        if (!['super_admin', 'aldeia_admin'].includes(user.role)) {
          return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        const where: any = {};
        if (user.role === 'aldeia_admin' && user.aldeiaId) {
          where.aldeiaId = user.aldeiaId;
        } else if (aldeiaId) {
          where.aldeiaId = aldeiaId;
        }

        const eventos = await db.evento.findMany({
          where,
          include: {
            aldeia: { select: { nome: true } },
            jogos: {
              include: {
                _count: { select: { participacoes: true } },
                sorteio: { select: { createdAt: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        csv = 'Evento,Aldeia,Data Início,Data Fim,Estado,Total Jogos,Total Participações,Sorteados\n';
        
        eventos.forEach(e => {
          const totalParticipacoes = e.jogos.reduce((acc, j) => acc + (j._count?.participacoes || 0), 0);
          const sorteados = e.jogos.filter(j => j.sorteio).length;
          
          csv += `"${e.nome}",`;
          csv += `"${e.aldeia.nome}",`;
          csv += `"${new Date(e.dataInicio).toLocaleDateString('pt-PT')}",`;
          csv += `"${e.dataFim ? new Date(e.dataFim).toLocaleDateString('pt-PT') : 'N/A'}",`;
          csv += `"${e.estado}",`;
          csv += `"${e.jogos.length}",`;
          csv += `"${totalParticipacoes}",`;
          csv += `"${sorteados}"\n`;
        });

        filename = `eventos_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Tipo de exportação inválido' }, { status: 400 });
    }

    // Retornar CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Erro ao exportar:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
