import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const subscription = await request.json();

    await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { keys: JSON.stringify(subscription.keys) },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        keys: JSON.stringify(subscription.keys),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao subscrever' }, { status: 500 });
  }
}
