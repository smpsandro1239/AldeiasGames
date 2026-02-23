import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveBase64Image, deleteImage } from '@/lib/storage';

// GET - Ver prémio específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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
    if (user.role !== 'super_admin' && user.aldeiaId !== premio.aldeiaId) {
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const premio = await db.premio.findUnique({ where: { id } });
    if (!premio) {
      return NextResponse.json({ error: 'Prémio não encontrado' }, { status: 404 });
    }

    // Verificar permissão
    if (user.role !== 'super_admin' && user.aldeiaId !== premio.aldeiaId) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { nome, descricao, valorEstimado, imagemBase64, patrocinador, ordem, ativo } = body;

    let finalImageUrl = premio.imageUrl;
    if (imagemBase64) {
      // Remover imagem antiga se existir
      if (premio.imageUrl) deleteImage(premio.imageUrl);
      finalImageUrl = await saveBase64Image(imagemBase64);
    }

    const updatedPremio = await db.premio.update({
      where: { id },
      data: {
        nome: nome?.trim(),
        descricao: descricao?.trim() || null,
        valorEstimado: valorEstimado ? parseFloat(valorEstimado) : null,
        imageUrl: finalImageUrl,
        imagemBase64: null, // Limpar base64 antigo
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user || !['super_admin', 'aldeia_admin'].includes(user.role)) {
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
    if (user.role !== 'super_admin' && user.aldeiaId !== premio.aldeiaId) {
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
    if (premio.imageUrl) deleteImage(premio.imageUrl);
    await db.premio.delete({ where: { id } });
    return NextResponse.json({ message: 'Prémio apagado com sucesso' });
  } catch (error) {
    console.error('Error deleting premio:', error);
    return NextResponse.json({ error: 'Erro ao apagar prémio' }, { status: 500 });
  }
}
