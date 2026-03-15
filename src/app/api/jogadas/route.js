import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { numeros } = await request.json();
    if (!numeros || !Array.isArray(numeros) || numeros.length !== 5) {
      return NextResponse.json(
        { error: 'Exatamente 5 números são necessários' },
        { status: 400 }
      );
    }

    const invalidNumbers = numeros.filter(n => n < 1 || n > 200 || !Number.isInteger(n));
    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        { error: 'Números inválidos detectados' },
        { status: 400 }
      );
    }

    // Aqui você pode adicionar a lógica de persistência no banco de dados
    console.log('Registrando jogada:', numeros);

    // TODO: Integrar com o banco de dados usando Prisma

    return NextResponse.json(
      { success: true, numeros },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar jogada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}