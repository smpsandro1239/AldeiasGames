import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'super_admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { userId, title, body } = await request.json();

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId }
    });

    // Simular envio
    console.log(`Push to ${userId}: ${title} - ${body}`);

    return NextResponse.json({ success: true, count: subscriptions.length });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao enviar push' }, { status: 500 });
  }
}
