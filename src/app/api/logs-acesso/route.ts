import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET - Listar logs de acesso (apenas super_admin)
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limite = parseInt(searchParams.get('limite') || '100');

    const where = userId ? { userId } : {};

    const logs = await db.logAcesso.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true,
            aldeia: {
              select: { id: true, nome: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limite
    });

    // Estatísticas
    const totalLogins = await db.logAcesso.count({ where: { sucesso: true } });
    const totalFalhas = await db.logAcesso.count({ where: { sucesso: false } });
    const loginsHoje = await db.logAcesso.count({
      where: {
        sucesso: true,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return NextResponse.json({
      estatisticas: {
        totalLogins,
        totalFalhas,
        loginsHoje
      },
      logs
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
