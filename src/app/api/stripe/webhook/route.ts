import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { userId, jogoId } = session.metadata;

    await db.participacao.create({
      data: {
        userId,
        jogoId,
        valorPago: session.amount_total / 100,
        metodoPagamento: 'stripe',
        estadoPagamento: 'pago',
        referencia: session.id,
        dadosParticipacao: JSON.stringify({ stripeSessionId: session.id }),
      }
    });
  }

  return NextResponse.json({ received: true });
}
