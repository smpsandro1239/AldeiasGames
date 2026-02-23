import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getUserFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { jogoId, quantity = 1 } = body;

    const jogo = await db.jogo.findUnique({
      where: { id: jogoId },
      include: { evento: true }
    });

    if (!jogo) return NextResponse.json({ error: 'Jogo não encontrado' }, { status: 404 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Participação: ${jogo.tipo}`,
            description: `Evento: ${jogo.evento.nome}`,
          },
          unit_amount: Math.round(jogo.precoParticipacao * 100),
        },
        quantity,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        jogoId: jogo.id,
      },
    });

    return NextResponse.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
