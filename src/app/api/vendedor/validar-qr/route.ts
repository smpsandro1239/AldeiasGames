/**
 * API: /api/vendedor/validar-qr
 * Valida códigos QR para vendedores
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ valido: false, mensagem: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é vendedor ou admin
    if (!['vendedor', 'aldeia_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ valido: false, mensagem: 'Não autorizado' }, { status: 403 });
    }

    const { qrData, aldeiaId, tipo } = await request.json();

    if (!qrData) {
      return NextResponse.json({ valido: false, mensagem: 'Dados QR em falta' }, { status: 400 });
    }

    // Parsing do QR code - pode conter diferentes formatos
    // Formato esperado: tipo:referencia (ex: premio:uuid, bilhete:uuid)
    let qrType = 'desconhecido';
    let qrReference = qrData;

    if (qrData.includes(':')) {
      const parts = qrData.split(':');
      qrType = parts[0];
      qrReference = parts[1];
    }

    // Validar conforme o tipo
    switch (qrType) {
      case 'premio': {
        // Validar prémio
        const premio = await db.premio.findFirst({
          where: {
            id: qrReference,
            aldeiaId: aldeiaId || undefined,
          },
          include: {
            jogo: true,
          },
        });

        if (!premio) {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Prémio não encontrado' 
          });
        }

        if (premio.estado === 'resgatado') {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Prémio já foi resgatado',
            premio: { titulo: premio.titulo, estado: premio.estado }
          });
        }

        if (premio.estado === 'expirado') {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Prémio expirado',
            premio: { titulo: premio.titulo, estado: premio.estado }
          });
        }

        // Marcar como resgatado
        await db.premio.update({
          where: { id: premio.id },
          data: { estado: 'resgatado', resgatadoPor: user.id, dataResgate: new Date() }
        });

        return NextResponse.json({ 
          valido: true, 
          mensagem: `Prémio válido: ${premio.titulo}`,
          tipo: 'premio',
          premio: {
            id: premio.id,
            titulo: premio.titulo,
            valor: premio.valor,
            jogo: premio.jogo?.titulo
          }
        });
      }

      case 'bilhete': {
        // Validar bilhete/rifa
        const participacao = await db.participacao.findFirst({
          where: {
            id: qrReference,
            jogo: {
              aldeiaId: aldeiaId || undefined,
            }
          },
          include: {
            jogo: true,
            user: {
              select: { id: true, nome: true, email: true }
            }
          },
        });

        if (!participacao) {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Bilhete não encontrado' 
          });
        }

        if (participacao.estado === 'usado') {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Bilhete já utilizado',
            participacao: { 
              jogo: participacao.jogo?.titulo, 
              estado: participacao.estado 
            }
          });
        }

        // Marcar como usado
        await db.participacao.update({
          where: { id: participacao.id },
          data: { estado: 'usado' }
        });

        return NextResponse.json({ 
          valido: true, 
          mensagem: `Bilhete válido para ${participacao.jogo?.titulo}`,
          tipo: 'bilhete',
          participacao: {
            id: participacao.id,
            jogo: participacao.jogo?.titulo,
            usuario: participacao.user?.nome
          }
        });
      }

      case 'venda': {
        // Validar venda
        const venda = await db.venda.findFirst({
          where: {
            id: qrReference,
            aldeiaId: aldeiaId || undefined,
          },
          include: {
            itens: true,
            user: {
              select: { id: true, nome: true }
            }
          },
        });

        if (!venda) {
          return NextResponse.json({ 
            valido: false, 
            mensagem: 'Venda não encontrada' 
          });
        }

        return NextResponse.json({ 
          valido: true, 
          mensagem: `Venda #${venda.id.slice(0, 8)} - €${venda.valorTotal}`,
          tipo: 'venda',
          venda: {
            id: venda.id,
            valor: venda.valorTotal,
            itens: venda.itens?.length || 0,
            vendedor: venda.user?.nome
          }
        });
      }

      default:
        // QR genérico - tentar interpretar como ID direto
        // Tentar encontrar como prémio
        const premioGenerico = await db.premio.findFirst({
          where: {
            OR: [
              { id: qrData },
              { codigo: qrData }
            ],
            aldeiaId: aldeiaId || undefined,
          },
          include: {
            jogo: true,
          },
        });

        if (premioGenerico) {
          if (premioGenerico.estado === 'resgatado') {
            return NextResponse.json({ 
              valido: false, 
              mensagem: 'Prémio já resgatado' 
            });
          }

          await db.premio.update({
            where: { id: premioGenerico.id },
            data: { estado: 'resgatado', resgatadoPor: user.id, dataResgate: new Date() }
          });

          return NextResponse.json({ 
            valido: true, 
            mensagem: `Prémio válido: ${premioGenerico.titulo}`,
            tipo: 'premio'
          });
        }

        // Tentar como participação
        const participacaoGenerica = await db.participacao.findFirst({
          where: {
            OR: [
              { id: qrData },
              { numeroBilhete: qrData }
            ],
            jogo: {
              aldeiaId: aldeiaId || undefined,
            }
          },
          include: {
            jogo: true,
          },
        });

        if (participacaoGenerica) {
          if (participacaoGenerica.estado === 'usado') {
            return NextResponse.json({ 
              valido: false, 
              mensagem: 'Bilhete já utilizado' 
            });
          }

          await db.participacao.update({
            where: { id: participacaoGenerica.id },
            data: { estado: 'usado' }
          });

          return NextResponse.json({ 
            valido: true, 
            mensagem: `Bilhete válido: ${participacaoGenerica.jogo?.titulo}`,
            tipo: 'bilhete'
          });
        }

        return NextResponse.json({ 
          valido: false, 
          mensagem: 'Código não reconhecido no sistema' 
        });
    }
  } catch (error) {
    console.error('Erro ao validar QR:', error);
    return NextResponse.json({ 
      valido: false, 
      mensagem: 'Erro ao processar código' 
    }, { status: 500 });
  }
}
