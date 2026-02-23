import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const planos = await db.plano.findMany({
      orderBy: { precoMensal: 'asc' }
    });

    return NextResponse.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, precoMensal, maxEventos, maxJogos, maxParticipacoes, descricao } = body;

    if (!nome || precoMensal === undefined) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      );
    }

    const plano = await db.plano.create({
      data: {
        nome,
        precoMensal,
        maxEventos: maxEventos || 10,
        maxJogos: maxJogos || 50,
        maxParticipacoes: maxParticipacoes || 1000,
        descricao,
      }
    });

    return NextResponse.json(plano, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao criar plano' },
      { status: 500 }
    );
  }
}
