import { NextResponse } from 'next/server';

export async function GET() {
  // Simular lista de planos
  const plans = [
    { id: 'price_free', name: 'Aldeia Grátis', price: 0 },
    { id: 'price_pro', name: 'Vila Pro', price: 29 },
    { id: 'price_premium', name: 'Cidade Premium', price: 99 },
  ];
  return NextResponse.json(plans);
}
