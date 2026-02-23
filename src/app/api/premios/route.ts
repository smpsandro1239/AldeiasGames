import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Listar prémios
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aldeias-secret-key-2024') as any;
    
    let premios;
    if (decoded.role === 'super_admin') {
      // Super admin vê todos os prémios
      premios = await db.premio.findMany({
        include: {
          aldeia: {
            select: { id: true, nome: true, tipoOrganizacao: true }
          },
          _count: { select: { jogos: true } }
        },
        orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }]
      });
    } else {
      // Aldeia admin vê apenas prémios da sua aldeia
      premios = await db.premio.findMany({
        where: { aldeiaId: decoded.aldeiaId },
        include: {
          aldeia: {
            select: { id: true, nome: true, tipoOrganizacao: true }
          },
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

// POST - Criar prémio
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aldeias-secret-key-2024') as any;
    
    if (!['super_admin', 'aldeia_admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, descricao, valorEstimado, imagemBase64, patrocinador, ordem, aldeiaId } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ error: 'Nome do prémio é obrigatório' }, { status: 400 });
    }

    // Determinar aldeiaId
    const targetAldeiaId = decoded.role === 'super_admin' ? aldeiaId : decoded.aldeiaId;
    
    if (!targetAldeiaId) {
      return NextResponse.json({ error: 'Aldeia não especificada' }, { status: 400 });
    }

    // Verificar se a aldeia existe
    const aldeia = await db.aldeia.findUnique({ where: { id: targetAldeiaId } });
    if (!aldeia) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    const premio = await db.premio.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        imagemBase64: imagemBase64 || null,
        patrocinador: patrocinador?.trim() || null,
        ordem: ordem ? parseInt(ordem) : 0,
        ativo: true,
        aldeiaId: targetAldeiaId
      },
      include: {
        aldeia: { select: { id: true, nome: true } }
      }
    });

    return NextResponse.json(premio, { status: 201 });
  } catch (error) {
    console.error('Error creating premio:', error);
    return NextResponse.json({ error: 'Erro ao criar prémio' }, { status: 500 });
  }
}
