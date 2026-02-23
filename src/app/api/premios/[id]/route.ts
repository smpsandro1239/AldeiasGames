import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

// GET - Ver prémio específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aldeias-secret-key-2024') as any;
    
    const premio = await db.premio.findUnique({
      where: { id },
      include: {
        aldeia: { select: { id: true, nome: true, tipoOrganizacao: true } },
        jogos: {
          select: { id: true, tipo: true, estado: true },
          take: 5
        }
      }
    });

    if (!premio) {
      return NextResponse.json({ error: 'Prémio não encontrado' }, { status: 404 });
    }

    // Verificar permissão
    if (decoded.role !== 'super_admin' && decoded.aldeiaId !== premio.aldeiaId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    return NextResponse.json(premio);
  } catch (error) {
    console.error('Error fetching premio:', error);
    return NextResponse.json({ error: 'Erro ao buscar prémio' }, { status: 500 });
  }
}

// PATCH - Atualizar prémio
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aldeias-secret-key-2024') as any;
    
    if (!['super_admin', 'aldeia_admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const premio = await db.premio.findUnique({ where: { id } });
    if (!premio) {
      return NextResponse.json({ error: 'Prémio não encontrado' }, { status: 404 });
    }

    // Verificar permissão
    if (decoded.role !== 'super_admin' && decoded.aldeiaId !== premio.aldeiaId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, descricao, valorEstimado, imagemBase64, patrocinador, ordem, ativo } = body;

    const updatedPremio = await db.premio.update({
      where: { id },
      data: {
        nome: nome?.trim(),
        descricao: descricao?.trim() || null,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        imagemBase64: imagemBase64,
        patrocinador: patrocinador?.trim() || null,
        ordem: ordem ? parseInt(ordem) : premio.ordem,
        ativo: ativo !== undefined ? ativo : premio.ativo
      },
      include: {
        aldeia: { select: { id: true, nome: true } }
      }
    });

    return NextResponse.json(updatedPremio);
  } catch (error) {
    console.error('Error updating premio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar prémio' }, { status: 500 });
  }
}

// DELETE - Apagar prémio (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aldeias-secret-key-2024') as any;
    
    if (!['super_admin', 'aldeia_admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const premio = await db.premio.findUnique({ 
      where: { id },
      include: { _count: { select: { jogos: true } } }
    });
    
    if (!premio) {
      return NextResponse.json({ error: 'Prémio não encontrado' }, { status: 404 });
    }

    // Verificar permissão
    if (decoded.role !== 'super_admin' && decoded.aldeiaId !== premio.aldeiaId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    // Verificar se está associado a jogos
    if (premio._count.jogos > 0) {
      // Soft delete - marcar como inativo
      await db.premio.update({
        where: { id },
        data: { ativo: false }
      });
      return NextResponse.json({ 
        message: 'Prémio desativado (está associado a jogos)',
        infoAdicional: 'O prémio foi marcado como inativo pois está associado a jogos existentes.'
      });
    }

    // Hard delete se não estiver associado
    await db.premio.delete({ where: { id } });
    return NextResponse.json({ message: 'Prémio apagado com sucesso' });
  } catch (error) {
    console.error('Error deleting premio:', error);
    return NextResponse.json({ error: 'Erro ao apagar prémio' }, { status: 500 });
  }
}
