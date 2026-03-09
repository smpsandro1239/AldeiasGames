import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url);
    const pendentes = searchParams.get('pendentes') === 'true';

    let whereClause: any = {};
    
    // Se solicitado, filtrar apenas organizações não verificadas
    if (pendentes) {
      whereClause.verificada = false;
    }

    const aldeias = await db.aldeia.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { eventos: true, users: true }
        },
        users: {
          where: { role: 'aldeia_admin' },
          select: { id: true, nome: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(aldeias);
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar organizações' },
      { status: 500 }
    );
  }
}
