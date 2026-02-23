import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'aldeia_admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { priceId } = body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?subscription=canceled`,
      metadata: { aldeiaId: user.aldeiaId || '' },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
