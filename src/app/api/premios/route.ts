import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    let premios;
    if (user.role === 'super_admin') {
      premios = await db.premio.findMany({
        include: {
          aldeia: { select: { id: true, nome: true, tipoOrganizacao: true } },
          _count: { select: { jogos: true } }
        },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }]
      });
    } else {
      premios = await db.premio.findMany({
        where: { aldeiaId: user.aldeiaId },
        include: {
          aldeia: { select: { id: true, nome: true, tipoOrganizacao: true } },
          _count: { select: { jogos: true } }
        },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }]
      });
    }

    return NextResponse.json(premios);
  } catch (error) {
    console.error('Error fetching premios:', error);
    return NextResponse.json({ error: 'Erro ao buscar prémios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, descricao, valorEstimado, imagemBase64, patrocinador, ordem, aldeiaId } = body;

    const targetAldeiaId = user.role === 'super_admin' ? aldeiaId : user.aldeiaId;
    if (!targetAldeiaId) return NextResponse.json({ error: 'Aldeia não especificada' }, { status: 400 });

    let finalImageUrl = body.imageUrl || null;
    if (imagemBase64) {
      finalImageUrl = await saveBase64Image(imagemBase64);
    }

    const premio = await db.premio.create({
      data: {
        nome,
        descricao,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        imagemBase64: null,
        imageUrl: finalImageUrl,
        patrocinador,
        ordem: ordem ? parseInt(ordem) : 0,
        aldeiaId: targetAldeiaId
      }
    });

    return NextResponse.json(premio, { status: 201 });
  } catch (error) {
    console.error('Error creating premio:', error);
    return NextResponse.json({ error: 'Erro ao criar prémio' }, { status: 500 });
  }
}
